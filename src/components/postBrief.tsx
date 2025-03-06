import React, { useState, useEffect, useRef } from 'react';
import { BiSolidEdit, BiTrashAlt } from 'react-icons/bi';
import { CustomLinkify } from '../utils/linkifyConfig';
import { Tooltip } from 'react-tooltip';
import { TbEye, TbLockOpen, TbLock, TbFlagCheck, TbFlagCancel, TbFlag } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import { TbMessage2Share, TbLink } from 'react-icons/tb';
import { FaShareSquare } from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import PostDetail from '../components/postDetail';
import PostRef from '../components/postRef';
import TagsScroll from '../components/tagsScroll';
import PostCreate from '../components/postCreate';
import { formatNumber, formatDate, getEditorLanguage } from '../utils/helpers';
import { toast } from 'react-toastify';
import {
  Post,
  likePost,
  unlikePost,
  storePost,
  unstorePost,
  deletePost,
  fetchPostDetail,
  setPostVisibility,
  moderateGroupPost,
} from '../services/postService';
import { useTheme } from '../context/ThemeContext';
import { BriefData, getGroupPublicData } from '../services/groupService';
import { getProjectPublicData } from '../services/projectService';

interface PostBriefProps {
  postData: Post;
  deletable?: boolean;
  shareAction?: (postRefId: string) => void;
  detail?: boolean;
  role?: string;
}

interface ToggleButtonProps {
  status: string;
  isAdmin: boolean;
  postId: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ status, isAdmin, postId }) => {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const { theme } = useTheme();

  const handleModeration = async (action: 'approve' | 'reject') => {
    if (loading) return;
    setLoading(true);

    try {
      await moderateGroupPost(postId, action);
      setCurrentStatus(action === 'approve' ? 'approved' : 'rejected');
    } catch (error) {
      console.error('Moderation failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='absolute text-sm top-0 right-0 flex gap-2 p-2'>
      {/* Show status with bold color once moderated */}
      {currentStatus === 'pending' && !isAdmin && (
        <div className='flex items-center justify-center gap-2 w-28 py-1 px-1 rounded-full bg-[#e8c64d] text-white font-semibold'>
          <TbFlag className='text-xl' />
          Pending
        </div>
      )}
      {currentStatus === 'rejected' && (
        <div className='flex items-center justify-center gap-2 w-28 py-1 px-1 rounded-full bg-red-400 text-white font-semibold'>
          <TbFlagCancel className='text-xl' />
          Rejected
        </div>
      )}

      {/* Show moderation buttons if pending and admin */}
      {currentStatus === 'pending' && isAdmin && (
        <div className='flex gap-1'>
          <button
            onClick={() => handleModeration('approve')}
            disabled={loading}
            className={`   ${
              theme === 'original'
                ? 'bg-white hover:bg-green-400 hover:text-white  text-green-500'
                : 'bg-[var(--button)] hover:bg-[var(--button-hovered)]'
            } flex items-center justify-center gap-2 w-24 py-1 rounded-l-full border-r-4 border-green-400  transition disabled:opacity-50`}
          >
            <TbFlagCheck className='text-xl' />
            Approve
          </button>
          <button
            onClick={() => handleModeration('reject')}
            disabled={loading}
            className={`   ${
              theme === 'original'
                ? ' bg-white text-red-400 hover:bg-red-300 hover:text-white '
                : 'bg-[var(--button)] hover:bg-[var(--button-hovered)]'
            } flex items-center justify-center gap-2 w-24 py-1 rounded-r-full border-l-4 border-red-400 transition disabled:opacity-50`}
          >
            <TbFlagCancel className='text-xl' />
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

const PostBrief: React.FC<PostBriefProps> = ({
  postData,
  deletable = false,
  shareAction = () => {},
  detail = true,
  role,
}) => {
  const [post, setPost] = useState<Post>(postData);
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showPostDetail, setShowPostDetail] = useState<boolean>(false); // New state for modal visibility
  const [showPostCreate, setShowPostCreate] = useState<boolean>(false); // New state for modal visibility
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);
  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [hovered, setHovered] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const isAdmin = role == 'admin' || role == 'creator' || role == 'leader';
  const [source, setSource] = useState<BriefData>({ name: '', avatar: '' });

  useEffect(() => {
    if (post.group || post.project) {
      const getSource = async () => {
        try {
          if (post.project) {
            const data = await getProjectPublicData(post.project);
            setSource(data);
          } else if (post.group) {
            const data = await getGroupPublicData(post.group);
            setSource(data);
          }
        } catch (error) {
          toast.error('Failed to load post');
        }
      };
      getSource();
    }
  }, [post]);

  useEffect(() => {
    // Initialize the post state with the postData prop
    setHasLiked(postData.Liked);
    setHasSaved(postData.Stored);
  }, [postData]);

  useEffect(() => {
    if (post && post.content) {
      const element = textRef.current;
      if (element) {
        console.log('State:', post.title, element.scrollHeight > element.clientHeight);
        setIsTruncated(element.scrollHeight > element.clientHeight);
      }
    }
  }, [post]);

  const handleLike = async (mini: boolean) => {
    if (!post) return;

    // Step 1: Immediate Optimistic UI Update using middlepost
    const newHasLiked = !hasLiked;
    const newLikes = newHasLiked ? post.totalLikes + 1 : post.totalLikes - 1; // Use middlepost for the change

    // Optimistic UI update (based on previous successful state)
    setHasLiked(newHasLiked);
    setPost({ ...post, totalLikes: newLikes });
    if (!mini) {
      try {
        if (newHasLiked) {
          likePost(post._id);
        } else {
          unlikePost(post._id);
        }
      } catch (error) {
        toast.error('Error liking post!');
        console.error('Error while liking the post:', error);

        setHasLiked(hasLiked);
        setPost({ ...post, likes: post.likes, Liked: post.Liked });
      }
    }
  };
  // Open the modal when the 'More' button is clicked
  const handleMoreClick = async () => {
    try {
      setShowPostDetail(true);
      const newData: Post = await fetchPostDetail(postData._id);
      setPost(newData);
      // Perform your logic with the fetched data
      console.log('Fetched Post Detail:', newData);
    } catch (error) {
      toast.error('Error fetching post details!');
      console.error('Error fetching post details:', error);
    }
  };

  const handleEdit = () => {
    setShowPostCreate(true);
  };

  const handleShare = (refId: string) => {
    setShowPostDetail(false);
    shareAction(refId);
  };

  const handleCloseModal1 = () => {
    setShowPostDetail(false); // Close the modal when the close button is clicked
  };

  const handleCloseModal2 = () => {
    setShowPostCreate(false); // Close the modal when the close button is clicked
  };

  const handleCommentChange = (deleted: boolean) => {
    if (!post) return;
    const newCommentCount = deleted ? post.totalComments - 1 : post.totalComments + 1;
    setPost({ ...post, totalComments: newCommentCount });
  };

  const refreshPost = (propost: Post) => {
    setPost(propost);
  };

  const handleSave = async (mini: boolean) => {
    if (!post) return;

    // Optimistic update
    const newHasSaved = !hasSaved;

    setHasSaved(newHasSaved);
    if (!mini) {
      try {
        if (newHasSaved) {
          storePost(post._id);
        } else {
          unstorePost(post._id);
        }
      } catch (error) {
        toast.error('Error saving post!');
        console.error('Error while saving the post:', error);

        setHasSaved(hasSaved); // Undo the `hasSaved` change
      }
    }
  };
  const handleLikeClick = () => handleLike(true);
  const handleSaveClick = () => handleSave(true);
  const handleClick = async () => {
    // Calculate the new visibility
    const newVisibility = post.visibility === 'public' ? 'private' : 'public';

    // Update the local state first
    setPost((prev) => ({ ...prev, visibility: newVisibility }));

    try {
      // Call the function to update visibility on the server
      await setPostVisibility(post._id, newVisibility);
    } catch (error) {
      // If there's an error, reset the local state
      setPost((prev) => ({
        ...prev,
        visibility: prev.visibility === 'public' ? 'private' : 'public',
      }));

      // Optionally, handle the error (e.g., show a toast notification)
      toast.error('Error updating visibility: ', error ? error : '404');
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    setVisible(false);
    try {
      deletePost(post._id);
    } catch (error) {
      setVisible(true);
      toast.error('Error deleting post!');
      console.error('Error deleting post:', error);
    }
  };

  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const modalShareRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalShareRef.current && !modalShareRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false); // Close modal if clicked outside
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowDeletePostModal(false); // Close modal if clicked outside
      }
    };

    if (showDeletePostModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeletePostModal]);
  const closeDeleteModal = () => {
    setShowDeletePostModal(false); // Close the logout confirmation modal
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className={`flex justify-center items-center relative `}>
      {visible && (
        <div
          className={`${
            theme === 'original'
              ? 'bg-Background/Bottom text-white border-2'
              : 'bg-[var(--surface)] text-[var(--text)]'
          } w-[94vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] my-3 border-Primary/Dark  light:border-0 rounded-3xl p-5 md:p-7 lg:p-8`}
        >
          {showDeletePostModal && (
            <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
              <div
                className={`
    ${
      theme === 'original'
        ? 'bg-Background/Bottom text-white border-2'
        : 'bg-[var(--surface)] text-[var(--text)]'
    } border-Primary/Dark p-8 rounded-3xl max-w-sm w-full justify-center flex-col items-center`}
                ref={modalRef}
              >
                <div className='flex justify-center items-center mb-4 -translate-x-2'>
                  <BiTrashAlt className='text-6xl  text-red-300' />
                </div>
                <h3 className='text-xl mb-2 text-center font-semibold'>Delete post?</h3>
                <h3 className='text-base mb-4 text-gray-400 text-center'>
                  Are you sure you want to permanently delete this post?
                </h3>
                <div className='flex justify-between text-base'>
                  <button
                    className={`${
                      theme === 'original'
                        ? 'bg-white text-Primary/Dark'
                        : 'bg-[var(--button)] text-[var(--text)]  '
                    }  ml-7 border-[var(--border)] px-4 py-1 rounded-lg hover:bg-[var(--button-hovered)] `}
                    onClick={closeDeleteModal}
                  >
                    Cancel
                  </button>
                  <button
                    className='mr-7 bg-red-400 px-4 py-1 rounded-lg hover:bg-red-500'
                    onClick={handleDelete}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Avatar and Tags */}
          <div className='relative flex flex-col sm:flex-row sm:items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <Link to={`/user/${post.author}/posts`} className='flex items-center gap-4'>
                <img
                  src={post.avatar || import.meta.env.VITE_DEFAULT_AVATAR}
                  alt='Avatar'
                  className='w-[52px] h-[52px] rounded-full object-cover flex-shrink-0'
                />
              </Link>
              <div>
                <div
                  className={`flex flex-row items-center space-x-1 ${post.tags.length > 0 ? '-mt-5 -mb-1' : ''}`}
                >
                  {' '}
                  <Link to={`/user/${post.author}/posts`} className='font-bold text-base flex'>
                    {post ? post.authorname : ''}
                  </Link>
                  {(post.project || post.group) && detail && (
                    <Link
                      to={`/${post.project ? 'project' : 'group'}/${post.project ? post.project : post.group}/${post.project ? 'sections/root/' : ''}posts`}
                      className='flex flex-row items-center text-xs space-x-1  text-[var(--text-title)]'
                    >
                      <p>in</p>
                      <img
                        src={source.avatar || import.meta.env.VITE_DEFAULT_AVATAR}
                        alt='Source Avatar'
                        className='w-5 h-5 rounded-md object-cover'
                      />
                      <p className='font-semibold'>{source.name || 'Loading'}</p>
                    </Link>
                  )}
                </div>

                <p className='text-xs text-[var(--text-hovered)]'>
                  {post ? formatDate(post.createdAt) : 'Loading...'}&nbsp;
                  {post &&
                    post.editedAt &&
                    Math.abs(
                      new Date(post.createdAt).getTime() - new Date(post.editedAt).getTime(),
                    ) > 100 && (
                      <span className='text-xs'>(Edited: {formatDate(post.editedAt)})</span>
                    )}
                </p>
                {post.tags.length > 0 && <TagsScroll tags={post.tags} />}
              </div>
            </div>
            <div className='mt-2 sm:mt-0 w-full sm:w-auto'></div>
            {post && post.group && (
              <ToggleButton status={post.status} isAdmin={isAdmin} postId={post._id} />
            )}
          </div>

          {/* Title */}
          {post.title && (
            <div className='text-[var(--text-title)] flex items-center text-lg font-semibold'>
              <p
                className='w-full py-1 overflow-hidden break-anywhere line-clamp-2'
                style={{ overflowWrap: 'anywhere' }}
              >
                {post.title}
              </p>
            </div>
          )}
          {post.refId && <PostRef postId={post.refId} />}
          {/* Post Text */}
          <div className='flex items-center'>
            <div>
              <CustomLinkify>
                {' '}
                <div
                  ref={textRef}
                  className='mb-4 w-full overflow-hidden whitespace-pre-line break-anywhere line-clamp-6'
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {post.content || ''}
                </div>
              </CustomLinkify>

              {isTruncated && (
                <p
                  onClick={handleMoreClick}
                  className='text-[var(--blue-highlight)] text-sm cursor-pointer'
                >
                  {' '}
                  Read more
                </p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className='flex overflow-x-auto scrollbar'>
            {post.files.length > 0 &&
              post.files.map((file, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 font-semibold px-2 py-1 cursor-pointer ${activeTab === index ? 'min-w-[90px]  border-b-4 text-[var(--text-title)] border-Primary/Dark' : 'w-[90px] truncate'}`}
                  onClick={() => setActiveTab(index)}
                >
                  {file.fileName || 'Untitled'}
                </div>
              ))}
          </div>

          {/* Editor */}
          {post.files.length != 0 && (
            <div>
              <Editor
                height='40vh'
                width='100%'
                language={
                  post && post.files[activeTab]?.fileName
                    ? getEditorLanguage(post.files[activeTab]?.fileName)
                    : 'markdown'
                }
                // language='markdown'
                value={post.files[activeTab]?.fileUrl || ''}
                theme={`${theme == 'light' ? 'light' : 'vs-dark'}`}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  readOnly: true,
                  renderLineHighlight: 'none',
                  scrollBeyondLastLine: false,
                  quickSuggestions: false,
                }}
              />
            </div>
          )}

          {/* Buttons */}
          <div className='flex justify-between items-center mt-4'>
            {/* Left-aligned buttons */}
            {post.isAuthor || deletable ? (
              <div className='flex space-x-1 sm:space-x-4'>
                <button
                  onClick={() => setShowDeletePostModal(true)}
                  data-tooltip-id='delete'
                  data-tooltip-content='Delete post'
                  data-tooltip-place='top' // Auto-adjusts the position
                  className='rounded-lg hover:text-[var(--red-highlight)]'
                >
                  <BiTrashAlt className='text-2xl' />
                  <Tooltip id='delete' classNameArrow='noArrow' />
                </button>
                {post.isAuthor && (
                  <>
                    <button
                      onClick={handleEdit}
                      data-tooltip-id='edit'
                      data-tooltip-content='Edit post'
                      data-tooltip-place='top' // Auto-adjusts the position
                      className=' rounded-lg hover:text-[var(--green-highlight)]'
                    >
                      <BiSolidEdit className='text-2xl' />
                      <Tooltip id='edit' classNameArrow='noArrow' />
                    </button>

                    <button
                      onClick={handleClick}
                      onMouseEnter={() => setHovered(true)}
                      onMouseLeave={() => setHovered(false)}
                      data-tooltip-id='setprivate'
                      data-tooltip-content={`Set ${post.visibility === 'public' ? 'private' : 'public'}`}
                      data-tooltip-place='top' // Auto-adjusts the position
                      className='rounded-lg hover:text-[var(--blue-highlight)]'
                    >
                      {post.visibility === 'private' ? (
                        <TbLock className=' text-2xl ' />
                      ) : hovered ? (
                        <TbLockOpen className=' text-2xl ' />
                      ) : (
                        <TbEye className=' text-2xl ' />
                      )}
                      <Tooltip id='setprivate' classNameArrow='noArrow' />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div />
            )}

            {/* Right-aligned buttons */}
            <div className='relative flex space-x-2 sm:space-x-2 items-center'>
              <div ref={modalShareRef} className='flex items-center'>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  data-tooltip-id='share'
                  data-tooltip-content='Share'
                  data-tooltip-place='top' // Auto-adjusts the position
                  className='text-[var(--green-highlight)] hover:text-Accent/Target'
                >
                  <FaShareSquare className='text-lg' />
                  <Tooltip id='share' classNameArrow='noArrow' />
                </button>
                {isDropdownOpen && (
                  <div
                    className={`${
                      theme === 'original'
                        ? 'bg-Background/Bottom text-white'
                        : 'bg-[var(--surface)] text-[var(--text)]'
                    } border border-[var(--border)] text-xs lg:text-sm absolute -left-10 md:-left-24  top-full mt-1 w-40 md:w-52 rounded-xl border-Primary/Dark shadow-lg z-10`}
                  >
                    <ul className='py-1 my-1'>
                      <li>
                        <button
                          onClick={() => {
                            shareAction(post._id);
                            setIsDropdownOpen(false);
                          }}
                          className='block px-4 py-2  hover:bg-[var(--background-hovered)] w-full text-left flex flex-row gap-4'
                        >
                          <TbMessage2Share className='text-lg lg:text-xl' />
                          Share in a new post
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            const fullLink = `${window.location.origin}/post/${post._id}`;
                            navigator.clipboard.writeText(fullLink);
                            setIsDropdownOpen(false);
                            toast.success('Link copied to clipboard!');
                          }}
                          className='block px-4 py-2  hover:bg-[var(--background-hovered)] w-full text-left flex flex-row gap-4'
                        >
                          <TbLink className='text-lg lg:text-xl' />
                          Copy link
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={handleMoreClick}
                className={`${
                  theme === 'original'
                    ? 'bg-white hover:bg-gray-300 text-Primary/Dark '
                    : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'
                } w-12 xsm:w-16 text-sm h-5 xsm:h-7 inline-flex items-center justify-center py-2 xsm:px-4 rounded-lg`}
              >
                <svg
                  className='xsm:w-6 xsm:h-4 w-3 h-4 mr-2 stroke-current stroke-2'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <path
                    d='M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.8728 20C9.10904 20.6391 10.5124 21 12 21Z'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                {formatNumber(post.totalComments)}
              </button>

              <button
                onClick={() => handleLike(false)}
                className={`text-sm w-12 xsm:w-16 h-5 xsm:h-7 transition-colors duration-200 ease-in-out inline-flex items-center justify-center py-2 xsm:px-4 rounded-lg 
    ${
      theme === 'original'
        ? hasLiked
          ? 'bg-[var(--button-active)] text-white'
          : 'bg-white hover:bg-gray-300 text-Accent/Target'
        : hasLiked
          ? 'bg-[var(--button-active)] text-[var(--text-selected)] border-[1px] border-[var(--border)]'
          : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'
    }`}
              >
                <svg
                  className='xsm:w-6 xsm:h-4 w-3 h-4 mr-1 stroke-current fill-current'
                  viewBox='0 0 24 24'
                >
                  <path d='M20.0648 10.2853C20.4353 10.5586 20.7764 10.8297 20.7764 11.783C20.7764 12.7386 20.2943 13.1253 19.7785 13.3942C19.9892 13.757 20.0566 14.1928 19.9658 14.6075C19.8037 15.3719 19.1406 15.9653 18.5511 16.1408C18.8058 16.5719 18.8858 16.9964 18.5827 17.5186C18.1932 18.1742 17.8543 18.423 16.3553 18.423H10.2501C8.17005 18.423 7.09216 17.2097 7.09216 16.2008V11.0119C7.09216 8.2786 10.1806 5.95637 10.1806 4.05637L9.95742 1.68971C9.94689 1.54526 9.97426 1.19193 10.0795 1.08971C10.2479 0.914153 10.7132 0.645264 11.4164 0.645264C11.8753 0.645264 12.1806 0.736375 12.5406 0.918597C13.7637 1.53415 14.0816 3.09193 14.0816 4.34526C14.0816 4.94749 13.2101 6.75193 13.0922 7.37637C13.0922 7.37637 14.9174 6.94971 17.0479 6.93415C19.2816 6.92082 20.7301 7.35637 20.7301 8.80526C20.7301 9.38526 20.269 9.96749 20.0648 10.2853ZM2.03952 9.53415H3.72374C4.05875 9.53415 4.38003 9.67462 4.61692 9.92469C4.85382 10.1747 4.98689 10.5139 4.98689 10.8675V19.3119C4.98689 19.6655 4.85382 20.0046 4.61692 20.2548C4.38003 20.5048 4.05875 20.6453 3.72374 20.6453H2.03952C1.70451 20.6453 1.38322 20.5048 1.14733 20.2548C0.911434 20.0046 0.778358 19.6655 0.778358 19.3119V10.8675C0.778358 10.5139 0.911434 10.1747 1.14733 9.92469C1.38322 9.67462 1.70451 9.53415 2.03952 9.53415Z' />
                </svg>
                {formatNumber(post.totalLikes) || 0}
              </button>

              <button
                onClick={() => handleSave(false)}
                data-tooltip-id='save'
                data-tooltip-content={`${hasSaved ? 'Unsave' : 'Save'}`}
                data-tooltip-place='top'
              >
                <svg
                  className={`transition-colors duration-200 ease-in-out w-6 h-6 stroke-current fill-current ${
                    hasSaved
                      ? 'text-Accent/Target'
                      : 'text-[var(--green-highlight)] hover:text-green-300'
                  }`}
                  viewBox='0 0 24 24'
                >
                  <path
                    id='tone'
                    d='M1 3.5C1 2.11929 2.11929 1 3.5 1H13.5C14.8807 1 16 2.11929 16 3.5V22.25L8.5 14.75L1 22.25V3.5Z'
                  />
                  <path
                    id='shape'
                    d='M1 3.5C1 2.11929 2.11929 1 3.5 1H13.5C14.8807 1 16 2.11929 16 3.5V22.25L8.5 14.75L1 22.25V3.5Z'
                    stroke='white'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <Tooltip id='save' classNameArrow='noArrow' />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PostDetail Modal */}
      {showPostDetail && (
        <div className='flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 flex z-50'>
          <PostDetail
            proppost={post}
            toggleLike={handleLikeClick}
            toggleSave={handleSaveClick}
            propsaved={hasSaved}
            propliked={hasLiked}
            commentDelete={handleCommentChange}
            closeModal={handleCloseModal1}
            shareAction={handleShare}
          />
        </div>
      )}

      {showPostCreate && (
        <div className='flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 flex z-50'>
          <PostCreate postData={post} closeModal={handleCloseModal2} refresh={refreshPost} />
        </div>
      )}
    </div>
  );
};

export default PostBrief;

function getGroupProjectData(group: string | null): any {
  throw new Error('Function not implemented.');
}

