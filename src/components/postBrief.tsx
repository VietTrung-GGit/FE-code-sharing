import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import PostDetail from '../components/postDetail';
import TagsScroll from '../components/tagsScroll';
import PostCreate from '../components/postCreate';
import { formatNumber, formatDate, getEditorLanguage } from '../utils/helpers';
import { PostType } from '../pages/Feed';
import { toast } from 'react-toastify';
import {
  Post,
  likePost,
  unlikePost,
  storePost,
  unstorePost,
  deletePost,
  fetchPostDetail,
} from '../services/postService';

interface PostBriefProps {
  postData: Post;
  state: PostType;
}

const PostBrief: React.FC<PostBriefProps> = ({ postData, state }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showPostDetail, setShowPostDetail] = useState<boolean>(false); // New state for modal visibility
  const [showPostCreate, setShowPostCreate] = useState<boolean>(false); // New state for modal visibility
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);
  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Initialize the post state with the postData prop
    setPost(postData);
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

    // Open the modal when the 'More' button is clicked
  };

  const handleMoreClick = async () => {
    try {
      const newData: Post = await fetchPostDetail(postData._id);

      // Perform your logic with the fetched data
      console.log('Fetched Post Detail:', newData);

      setShowPostDetail(true);
    } catch (error) {
      toast.error('Error fetching post details!');
      console.error('Error fetching post details:', error);
    }
  };

  const handleEdit = () => {
    setShowPostCreate(true);
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

  const truncatedText =
    (post?.content.length || 0) > 400 ? post?.content.slice(0, 400) + '...' : post?.content;

  if (!post) return <div>Loading...</div>;

  return (
    <div className={`flex ${state === 'me' ? '' : 'justify-center'} items-center relative `}>
      {visible && (
        <div className='bg-Background/Bottom text-white w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[730px] mb-10 mt-5 border-Primary/Dark border-2 rounded-3xl p-5 md:p-7 lg:p-8'>
          {showDeletePostModal && (
            <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
              <div
                className='bg-Background/Bottom p-8 rounded-lg max-w-sm w-full border-2 border-Primary/Dark'
                ref={modalRef}
              >
                <h3 className='text-xl mb-8 text-white text-center'>
                  Are you sure you want to delete this post?
                </h3>
                <div className='flex justify-between'>
                  <button
                    className='ml-7 text-red-200 px-4 py-2 hover:text-red-500'
                    onClick={closeDeleteModal}
                  >
                    Cancel
                  </button>
                  <button
                    className='mr-7 text-Accent/Light px-4 py-2 hover:text-Accent/Target '
                    onClick={handleDelete}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Avatar and Tags */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <img
                src={
                  post.avatar ||
                  'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                } // Fallback for avatar
                alt='Avatar'
                className='w-12 h-12 rounded-full object-cover'
              />
              <div>
                <p className='font-bold text-lg'>{post ? post.authorname : ''}</p>
                <p className='text-sm text-Accent/Light'>
                  {post ? formatDate(post.createdAt) : 'Loading...'}&nbsp;
                  {post &&
                    post.editedAt &&
                    Math.abs(
                      new Date(post.createdAt).getTime() - new Date(post.editedAt).getTime(),
                    ) > 100 && (
                      <span className='text-xs text-white'>
                        (Edited: {formatDate(post.editedAt)})
                      </span>
                    )}
                </p>
                {/* Check if `updateat` is different from `createat` */}
              </div>
            </div>
            <div className='mt-2 sm:mt-0 w-full sm:w-auto'>
              {post.tags.length > 0 && <TagsScroll tags={post.tags} />}
            </div>
          </div>

          {/* Title */}
          {post.title && (
            <div className='flex items-center text-lg text-Primary/Light'>
              <p className='w-full py-2 overflow-hidden break-all line-clamp-2'>{post.title}</p>
            </div>
          )}

          {/* Post Text */}
          <div className='flex items-center'>
            <div>
              <p
                ref={textRef}
                className='mb-4 w-full overflow-hidden whitespace-pre-line break-all line-clamp-3'
              >
                {truncatedText || ''}
              </p>
              {isTruncated && (
                <p onClick={handleMoreClick} className='text-Accent/Light text-sm cursor-pointer'>
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
                  className={`flex-shrink-0 font-semibold px-2 py-1 cursor-pointer ${activeTab === index ? 'min-w-[90px]  border-b-4 text-Primary/Light border-Primary/Dark' : 'w-[90px] truncate text-white'}`}
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
                value={post.files[activeTab]?.fileUrl || ''}
                theme='vs-dark'
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  readOnly: true,
                  renderLineHighlight: 'none',
                  quickSuggestions: false,
                }}
              />
            </div>
          )}

          {/* Buttons */}
          <div className='flex justify-between items-center mt-4'>
            {/* Left-aligned buttons */}
            {post.isAuthor ? (
              <div className='flex space-x-1 sm:space-x-4'>
                <button
                  onClick={handleEdit}
                  className=' text-white rounded-lg hover:text-Accent/Light'
                >
                  <svg className='w-6 h-6 stroke-current stroke-2' viewBox='0 0 24 24'>
                    <path
                      d='M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                    />
                    <polygon
                      points='12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                    />
                  </svg>
                </button>

                <button
                  onClick={() => setShowDeletePostModal(true)}
                  className='text-white rounded-lg hover:text-red-300'
                >
                  <svg className='w-7 h-7 stroke-current stroke-2' viewBox='0 0 24 24'>
                    <path
                      d='M10 12V17'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M14 12V17'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M4 7H20'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div />
            )}

            {/* Right-aligned buttons */}
            <div className='flex space-x-1 sm:space-x-4 items-center'>
              <button
                onClick={handleMoreClick}
                className='w-16 xsm:w-20 h-6 xsm:h-8 bg-white text-Primary/Dark inline-flex items-center justify-center py-2 xsm:px-4 rounded-lg hover:bg-gray-300'
              >
                <svg
                  className='xsm:w-6 xsm:h-6 w-4 h-4 mr-2 stroke-current stroke-2'
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
                className={`transition-colors duration-200 ease-in-out w-16 xsm:w-20 h-6 xsm:h-8 inline-flex items-center justify-center py-2 xsm:px-4  rounded-lg ${
                  hasLiked
                    ? 'bg-Accent/Target text-white'
                    : 'bg-white text-Accent/Target hover:bg-gray-300'
                }`}
              >
                <svg
                  className='xsm:w-6 xsm:h-6 h-4 w-4 mr-1 stroke-current fill-current'
                  viewBox='0 0 24 24'
                >
                  <path d='M20.0648 10.2853C20.4353 10.5586 20.7764 10.8297 20.7764 11.783C20.7764 12.7386 20.2943 13.1253 19.7785 13.3942C19.9892 13.757 20.0566 14.1928 19.9658 14.6075C19.8037 15.3719 19.1406 15.9653 18.5511 16.1408C18.8058 16.5719 18.8858 16.9964 18.5827 17.5186C18.1932 18.1742 17.8543 18.423 16.3553 18.423H10.2501C8.17005 18.423 7.09216 17.2097 7.09216 16.2008V11.0119C7.09216 8.2786 10.1806 5.95637 10.1806 4.05637L9.95742 1.68971C9.94689 1.54526 9.97426 1.19193 10.0795 1.08971C10.2479 0.914153 10.7132 0.645264 11.4164 0.645264C11.8753 0.645264 12.1806 0.736375 12.5406 0.918597C13.7637 1.53415 14.0816 3.09193 14.0816 4.34526C14.0816 4.94749 13.2101 6.75193 13.0922 7.37637C13.0922 7.37637 14.9174 6.94971 17.0479 6.93415C19.2816 6.92082 20.7301 7.35637 20.7301 8.80526C20.7301 9.38526 20.269 9.96749 20.0648 10.2853ZM2.03952 9.53415H3.72374C4.05875 9.53415 4.38003 9.67462 4.61692 9.92469C4.85382 10.1747 4.98689 10.5139 4.98689 10.8675V19.3119C4.98689 19.6655 4.85382 20.0046 4.61692 20.2548C4.38003 20.5048 4.05875 20.6453 3.72374 20.6453H2.03952C1.70451 20.6453 1.38322 20.5048 1.14733 20.2548C0.911434 20.0046 0.778358 19.6655 0.778358 19.3119V10.8675C0.778358 10.5139 0.911434 10.1747 1.14733 9.92469C1.38322 9.67462 1.70451 9.53415 2.03952 9.53415Z' />
                </svg>
                {formatNumber(post.totalLikes) || 0}
              </button>

              <svg
                onClick={() => handleSave(false)}
                className={`transition-colors duration-200 ease-in-out  cursor-pointer w-8 h-8 ml-2 stroke-current fill-current ${
                  hasSaved ? 'text-Accent/Target' : 'text-Accent/Light hover:text-green-300'
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

