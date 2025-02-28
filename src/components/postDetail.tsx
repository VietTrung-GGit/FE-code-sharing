import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import EmojiPicker from 'emoji-picker-react';
import { CustomLinkify } from '../utils/linkifyConfig';
import { Theme } from 'emoji-picker-react';
import { TbMessage2Share, TbLink } from 'react-icons/tb';
import CommentItem from './comment';
import { Link } from 'react-router-dom';
import { FaShareSquare } from 'react-icons/fa';
import PostRef from '../components/postRef';
import { formatNumber, formatDate, getEditorLanguage } from '../utils/helpers';
import { useAuthUser } from '../context/AuthUserContext';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import { IoCodeDownload } from 'react-icons/io5';
import {
  Post,
  CommentUpload,
  Comment,
  createComment,
  likePost,
  unlikePost,
  storePost,
  unstorePost,
  fetchComments,
} from '../services/postService';
import { useTheme } from '../context/ThemeContext';

interface PostDetailProps {
  proppost: Post;
  toggleLike?: () => void;
  toggleSave?: () => void;
  propliked?: boolean;
  propsaved?: boolean;
  commentDelete?: (down: boolean) => void;
  closeModal: () => void;
  shareAction?: (postRefId: string) => void;
}

const PostDetail: React.FC<PostDetailProps> = ({
  proppost,
  toggleLike: propToggleLike,
  toggleSave: propToggleSave,
  propliked = false,
  propsaved = false,
  commentDelete = () => {},
  closeModal: propcloseModal,
  shareAction = () => {},
}) => {
  const { theme } = useTheme();
  const [post, setPost] = useState<Post>(proppost);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [newCommentCode, setNewCommentCode] = useState<string>('');
  const [hasLiked, setHasLiked] = useState<boolean>(propliked); // Track if the user has liked
  const [hasSaved, setHasSaved] = useState<boolean>(propsaved);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthUser();
  const downloadTextFile = (content: string, title: string): void => {
    // Create a Blob with the content as text and the type 'text/plain'
    const blob = new Blob([content], { type: 'text/plain' });

    // Create a link element to trigger the download
    const link = document.createElement('a');

    // Create an object URL for the Blob
    const url = URL.createObjectURL(blob);

    // Set the download attribute to the desired file title
    link.href = url;
    link.download = title;

    // Append the link to the body (it needs to be part of the DOM to trigger the download)
    document.body.appendChild(link);

    // Simulate a click on the link to start the download
    link.click();

    // Remove the link from the DOM after the download
    document.body.removeChild(link);

    // Revoke the object URL to free up memory
    URL.revokeObjectURL(url);
  };
  useEffect(() => {
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    // Cleanup to restore scroll behavior when component is unmounted or modal is closed
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const parentRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch comments function
  const fetchComment = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);

    try {
      const responseComments = await fetchComments(post._id, page, 5, 'descending');
      alert(1);
      // Ensure newComments is always an array
      const newComments = Array.isArray(responseComments.comments) ? responseComments.comments : [];
      const hasNextPage = responseComments.hasMore;

      // Handle previous comments being null by defaulting to an empty array
      setComments((prevComments) => [...(prevComments || []), ...newComments]);
      setHasMore(hasNextPage);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error fetching comments!');
    } finally {
      setLoading(false);
    }
  }, [page, hasMore]);

  // Initial load of comments
  useEffect(() => {
    {
      post.totalComments > 0 && fetchComment();
    }
  }, []);

  // Infinite scroll logic using IntersectionObserver
  // Inside useEffect for intersection observer
  useEffect(() => {
    if (!sentinelRef.current || !parentRef.current) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading && post.totalComments > 0) {
        console.log('Fetching comments...');
        alert('due to scroll');
        fetchComment();
      }
    };

    observer.current = new IntersectionObserver(observerCallback, {
      root: parentRef.current, // Use the parent div as the root
      rootMargin: '100px', // Trigger a bit earlier
      threshold: 0.9, // Trigger when 90% of the sentinel element is visible
    });

    const currentObserver = observer.current;
    currentObserver.observe(sentinelRef.current);
    return () => {
      if (currentObserver && sentinelRef.current) {
        currentObserver.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, loading, comments]); // Only rerun when hasMore or loading changes

  const handleLike = async () => {
    if (!post) return;
    // Step 1: Immediate Optimistic UI Update using middlepost
    const newHasLiked = !hasLiked;
    const newLikes = newHasLiked ? post.totalLikes + 1 : post.totalLikes - 1; // Use middlepost for the change

    // Optimistic UI update (based on previous successful state)
    setHasLiked(newHasLiked);
    setPost({ ...post, totalLikes: newLikes });
    if (propToggleLike) {
      propToggleLike();
    }
    try {
      if (newHasLiked) {
        likePost(post._id);
      } else {
        unlikePost(post._id);
      }
    } catch (error) {
      console.error('Error while liking the post:', error);

      setHasLiked(hasLiked); // Undo hasLiked change
      setPost({ ...post, totalLikes: post.totalLikes, Liked: post.Liked }); // Revert to middlepost

      // Notify user of failure
      toast.error('Failed to update like status. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!post) return;
    const newHasSaved = !hasSaved;

    setHasSaved(newHasSaved);
    if (propToggleSave) {
      propToggleSave();
    }
    try {
      if (newHasSaved) {
        storePost(post._id);
      } else {
        unstorePost(post._id);
      }
    } catch (error) {
      console.error('Error while saving the post:', error);

      // Revert the optimistic update
      setHasSaved(hasSaved); // Undo the `hasSaved` change

      toast.error('Failed to update save status. Please try again.');
    }
  };

  const handleCommentChange = (deleted: boolean) => {
    if (!post) return;
    const newCommentCount = deleted ? post.totalComments - 1 : post.totalComments + 1;
    setPost({ ...post, totalComments: newCommentCount });
  };

  const handleCommentSubmit = async () => {
    if (post && (newCommentText || newCommentCode)) {
      try {
        const responseComments = await createComment(post._id, {
          text: newCommentText,
          code: newCommentCode,
        });
        // Add the postId to the request payload or URL

        const savedComment: CommentUpload = {
          _id: responseComments || '',
          code: newCommentCode,
          text: newCommentText,
          authorname: user?.displayname || 'Display Name',
          avatar: user?.avatar || 'https://i.postimg.cc/02Xx40Yq/default.png',
          postId: post._id,
        };
        console.log('Comment posted successfully:');
        handleCommentChange(false);
        commentDelete(false);
        const displayedComment: Comment = {
          _id: responseComments,
          code: newCommentCode,
          text: newCommentText,
          authorname: user?.displayname || '',
          avatar: user?.avatar || '',
          author: '0',
          postId: post._id,
          createdAt: 'Recently', // Pass formatted date string
          updatedAt: 'Recently', // Pass formatted date string
          Liked: false,
          totalLikes: 0,
          totalComments: 0,
          editedAt: '',
          __v: 0,
          isAuthor: true,
        };
        alert(2);
        fetchComment();
        // setComments((prevComments) => {
        //   if (prevComments) {
        //     return [
        //       displayedComment, // Add the new comment at the top
        //       ...prevComments,
        //     ];
        //   }
        //   return [displayedComment]; // Initialize with the new comment if prevComments is null
        // });
        setNewCommentText('');
        setNewCommentCode('');
        toast.success('Comment success');
      } catch (error) {
        commentDelete(true);
        handleCommentChange(true);
        toast.error('Failed to post comment!');
        console.error('Failed to post comment:', error);
        throw error;
      }
    }
  };
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

  // const handleEdit = (index: number, commentText: string, commentCode: string) => {
  //   setEditingComment(index);
  //   setEditedText(commentText);
  //   setEditedCode(commentCode);
  // };

  // const handleSaveComment = async (index: number) => {
  //   if (comments) {
  //     const updatedComments = [...comments];
  //     updatedComments[index] = {
  //       ...updatedComments[index],
  //       text: editedText,
  //       code: editedCode,
  //       editedAt: 'Recently',
  //     };
  //     setComments(updatedComments);

  //     setEditingComment(null);
  //     setEditedText('');
  //     setEditedCode('');
  //     try {
  //       // Send API request to update the comment
  //       await updateComment(comments[index]._id, {
  //         text: editedText || '',
  //         code: editedCode || '',
  //       });

  //       // Update the comment content in the UI after successful response
  //     } catch (error) {
  //       toast.error('Failed saving comment!');
  //       console.error('Failed to save comment:', error);
  //     }
  //   }
  // };

  // const handleCancelEdit = () => {
  //   setEditingComment(null);
  //   setEditedText('');
  //   setEditedCode('');
  // };

  const handleDeleteComment = (index: number) => {
    handleCommentChange(true);
    commentDelete(true);
    setComments((prevComments) => prevComments.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`${
        theme === 'original'
          ? 'bg-Background/Bottom text-white lg:border-2'
          : 'bg-[var(--surface)] text-[var(--text)]'
      } w-full h-full lg:h-[95vh] lg:w-3/5 flex flex-col   bg-Background/Bottom dark:bg-Dark/Background lg:my-10 relative border-Primary/Dark border-solid box-border lg:rounded-3xl p-5 md:p-7 lg:p-8 xl-10`}
    >
      {/* Avatar, Name, and Date */}
      <button
        onClick={propcloseModal}
        className='absolute top-6 right-12  text-3xl hover:text-[var(--text-title)] z-40'
      >
        ×
      </button>
      <div ref={parentRef} className='overflow-y-auto scrollbar'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-4'>
            <Link to={`/user/${post.author}`} className='flex items-center gap-4'>
              <img
                src={post.avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
                className='w-[52px] h-[52px] rounded-full object-cover' //i.postimg.cc/02Xx40Yq/default.png
              />
            </Link>
            <div>
              <Link to={`/user/${post.author}`} className='font-bold text-md'>
                {post ? post.authorname : ''}
              </Link>
              <p className='text-sm text-[var(--green-highlight)]'>
                {post ? formatDate(post.createdAt) : 'Loading...'}&nbsp;
                {post &&
                  post.editedAt &&
                  Math.abs(new Date(post.createdAt).getTime() - new Date(post.editedAt).getTime()) >
                    100 && <span className='text-xs '>(Edited: {formatDate(post.editedAt)})</span>}
              </p>
              {/* Check if `updatedAt` is different from `createdAt` */}
            </div>
          </div>
        </div>

        {post?.tags && post.tags.length > 0 && (
          <div className='flex items-center gap-2 my-2'>
            <p className='flex-shrink-0'>Tags:</p>
            <div className='flex flex-wrap gap-2 flex-grow'>
              {post.tags.map((tagName, index) => (
                <span
                  key={index}
                  className='bg-[var(--text-title)] flex justify-center text-Primary/Dark text-sm w-20 px-2 rounded-3xl py-1'
                >
                  {tagName}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className='font-semibold w-full py-1 overflow-hidden resize-none focus:outline-none focus:border-transparent text-lg text-[var(--text-title)] break-words'>
          {post?.title}
        </p>
        {post.refId && <PostRef postId={post.refId} />}
        <p className='whitespace-pre-line break-words mb-4 w-full overflow-hidden resize-none focus:outline-none focus:border-transparent'>
          <CustomLinkify>{post ? post.content : ''}</CustomLinkify>
        </p>
        {/* Tabs */}
        <div className='flex overflow-x-auto scrollbar'>
          {post.files.length > 0 &&
            post.files.map((file, index) => (
              <div
                key={index}
                className={`flex-shrink-0 font-semibold px-2 py-1 cursor-pointer ${activeTab === index ? 'min-w-[120px]  border-b-4 text-[var(--text-title)] border-Primary/Dark' : 'w-[120px] truncate '}`}
                onClick={() => setActiveTab(index)}
              >
                <div className='flex justify-between items-center w-full space-x-2'>
                  <span>{file.fileName || 'Untitled'}</span>
                  {activeTab === index && (
                    <button
                      onClick={() => {
                        // alert(file.fileUrl);
                        downloadTextFile(file.fileUrl, file.fileName);
                      }}
                      className='inline-flex justify-center  text-lg mt-auto'
                    >
                      <IoCodeDownload />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
        {/* <div className='flex overflow-x-auto'>
          {post?.files?.length === 0 ? (
            <div className='text-center text-gray-500'>No files available</div>
          ) : (
            post?.files.map((file, index) => (
              <div
                key={index}
                className={`flex-shrink-0 text-[var(--text-title)] font-bold max-w-[150px] truncate px-2 py-1 cursor-pointer ${
                  activeTab === index ? 'border-b-4 border-Primary/Dark' : ''
                }`}
                onClick={() => setActiveTab(index)}
              >
                {file.fileName || 'Untitled'}
                <div>
                  <button
                    onClick={() => {
                      //alert(file.fileUrl);
                      downloadTextFile(file.fileUrl, file.fileName);
                    }}
                  >
                    Download File
                  </button>
                </div>
              </div>
            ))
          )}
        </div> */}
        {/* Code Editor for the selected file */}
        {post.files.length > 0 && (
          <div className='mb-4'>
            <Editor
              height='40vh'
              width='100%'
              language={
                post && post.files[activeTab]?.fileName
                  ? getEditorLanguage(post.files[activeTab]?.fileName)
                  : 'markdown'
              }
              value={post && post.files[activeTab]?.fileUrl ? post.files[activeTab]?.fileUrl : ''}
              theme='vs-dark'
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                renderValidationDecorations: 'off',
                readOnly: true,
              }}
            />
          </div>
        )}
        {/* Buttons */}
        <div className='flex justify-end space-x-2 mt-4'>
          <div ref={modalShareRef} className='flex relative items-center'>
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
              <div className='text-xs lg:text-sm absolute -left-10 md:-left-24 top-full mt-1 w-40 md:w-52 bg-Background/Bottom border rounded-xl border-2 border-Primary/Dark shadow-lg z-10'>
                <ul className='py-1 my-1'>
                  <li>
                    <button
                      onClick={() => {
                        shareAction(post._id);
                        setIsDropdownOpen(false);
                      }}
                      className='block px-4 py-2  hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
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
                      className='block px-4 py-2  hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
                    >
                      <TbLink className='text-lg lg:text-xl' />
                      Copy Link
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className='flex justify-end'>
            <button
              onClick={handleLike}
              className={`text-sm w-12 xsm:w-16 text-sm h-5 xsm:h-7 transition-colors duration-200 ease-in-out inline-flex items-center justify-center py-2 px-4 rounded-lg ${hasLiked ? 'bg-Accent/Target ' : 'bg-white text-Accent/Target'}`}
            >
              <svg
                className={`xsm:w-6 xsm:h-4 w-3 h-4 mr-1 stroke-current fill-current`} // Tailwind class for color
                viewBox='0 0 24 24'
              >
                <path d='M20.0648 10.2853C20.4353 10.5586 20.7764 10.8297 20.7764 11.783C20.7764 12.7386 20.2943 13.1253 19.7785 13.3942C19.9892 13.757 20.0566 14.1928 19.9658 14.6075C19.8037 15.3719 19.1406 15.9653 18.5511 16.1408C18.8058 16.5719 18.8858 16.9964 18.5827 17.5186C18.1932 18.1742 17.8543 18.423 16.3553 18.423H10.2501C8.17005 18.423 7.09216 17.2097 7.09216 16.2008V11.0119C7.09216 8.2786 10.1806 5.95637 10.1806 4.05637L9.95742 1.68971C9.94689 1.54526 9.97426 1.19193 10.0795 1.08971C10.2479 0.914153 10.7132 0.645264 11.4164 0.645264C11.8753 0.645264 12.1806 0.736375 12.5406 0.918597C13.7637 1.53415 14.0816 3.09193 14.0816 4.34526C14.0816 4.94749 13.2101 6.75193 13.0922 7.37637C13.0922 7.37637 14.9174 6.94971 17.0479 6.93415C19.2816 6.92082 20.7301 7.35637 20.7301 8.80526C20.7301 9.38526 20.269 9.96749 20.0648 10.2853ZM2.03952 9.53415H3.72374C4.05875 9.53415 4.38003 9.67462 4.61692 9.92469C4.85382 10.1747 4.98689 10.5139 4.98689 10.8675V19.3119C4.98689 19.6655 4.85382 20.0046 4.61692 20.2548C4.38003 20.5048 4.05875 20.6453 3.72374 20.6453H2.03952C1.70451 20.6453 1.38323 20.5048 1.14635 20.2548C0.909441 20.0046 0.776367 19.6655 0.776367 19.3119V10.8675C0.776367 10.5139 0.909441 10.1747 1.14635 9.92469C1.38323 9.67462 1.70451 9.53415 2.03952 9.53415Z' />
              </svg>
              {post ? formatNumber(post.totalLikes) : ''}
            </button>

            <svg
              onClick={handleSave}
              className={`transition-colors duration-200 ease-in-out cursor-pointer w-6 h-6 ml-2 stroke-current fill-current ${hasSaved ? 'text-Accent/Target' : 'text-[var(--green-highlight)]'}`}
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
        {/* Comments Section */}
        {post && comments && post.totalComments > 0 && (
          <div className='mt-4 divide-y-2 divide-Primary/Dark'>
            <h3 className='text-lg font-bold text-[var(--text-title)]'>
              Comments ({formatNumber(post.totalComments)})
            </h3>

            <div className='space-y-2'>
              {comments.map((comment, index) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  index={index}
                  onDelete={handleDeleteComment}
                  level={1}
                />
              ))}
            </div>
          </div>
        )}
        {/* Loading Indicator */}
        {loading && <div className='text-center text-[var(--green-highlight)]'>Loading...</div>}
        {/* Sentinel for Infinite Scroll */}
        <div ref={sentinelRef} className='h-2'></div>
      </div>
      {/* New Comment Section */}
      <div className='mt-auto flex-none divide-y-2 divide-Primary/Dark'>
        <h3 className='text-lg font-bold text-[var(--text-title)]'>New Comment</h3>
        <div className='bg-Background/Light pt-3 px-2'>
          <div className='flex justify-center gap-4'>
            <img src={user?.avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'} alt='Avatar' />
            <div className='w-full'>
              <div className='relative flex items-center mb-1'>
                <textarea
                  className='w-full p-2 bg-Background/Bottom resize-none border-Background/Middle border-2'
                  rows={2}
                  placeholder='Share your thought...'
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                />
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className='absolute top-1 right-2 z-40 text-lg hidden lg:block'
                >
                  😀
                </button>
                {showPicker && (
                  <div className='absolute bottom-full right-0 mb-2 z-50 bg-gray-800 rounded-lg shadow-lg'>
                    <EmojiPicker
                      theme={Theme.DARK}
                      onEmojiClick={(emoji) => setNewCommentText((prev) => prev + emoji.emoji)}
                    />
                  </div>
                )}
              </div>
              <Editor
                height='10vh'
                width='100%'
                language='markdown'
                value={newCommentCode}
                onChange={(value) => setNewCommentCode(value || '')}
                theme='vs-dark'
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  renderValidationDecorations: 'off',
                }}
              />
              <div className='flex justify-end'>
                <button
                  onClick={handleCommentSubmit}
                  className='mt-2 w-24 h-8 bg-Primary/Dark flex items-center justify-center  py-2 px-4 rounded-lg hover:bg-[var(--text-title)] hover:text-Primary/Dark'
                >
                  {/* Like Icon */}
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

