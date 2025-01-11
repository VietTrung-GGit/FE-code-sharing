import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { formatNumber, formatDate } from '../utils/helpers';
import { getUserFullData } from '../services/userService';
import { toast } from 'react-toastify';
import {
  Post,
  Comment,
  createComment,
  likePost,
  unlikePost,
  storePost,
  unstorePost,
  updateComment,
  deleteComment,
  fetchComments,
} from '../services/postService';

interface PostDetailProps {
  proppost: Post;
  toggleLike?: () => void;
  toggleSave?: () => void;
  propliked?: boolean;
  propsaved?: boolean;
  commentDelete?: (down: boolean) => void;
}
interface CommentUpload {
  _id: string;
  code: string;
  text: string;
  authorname: string;
  avatar: string;
  postId: string;
}

const PostDetail: React.FC<PostDetailProps> = ({
  proppost,
  toggleLike: propToggleLike,
  toggleSave: propToggleSave,
  propliked = false,
  propsaved = false,
  commentDelete = () => {},
}) => {
  const [post, setPost] = useState<Post>(proppost);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [newCommentCode, setNewCommentCode] = useState<string>('');
  const [hasLiked, setHasLiked] = useState<boolean>(propliked); // Track if the user has liked
  const [hasSaved, setHasSaved] = useState<boolean>(propsaved);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayname, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserFullData();
        setAvatarUrl(userData.avatar);
        setDisplayName(userData.displayname);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch comments function
  const fetchComment = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);

    try {
      const responseComments = await fetchComments(post._id, page, 10, 'descending');

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
  }, [page, hasMore, loading]);

  // Initial load of comments
  useEffect(() => {
    fetchComment();
  }, [fetchComment]);

  // Infinite scroll logic using IntersectionObserver
  // Inside useEffect for intersection observer
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        console.log('Fetching comments...');
        fetchComment(); // Only call if loading is false and hasMore is true
      }
    };

    observer.current = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '100px', // Increase rootMargin to trigger a bit earlier
      threshold: 0.9, // Trigger when 90% of the sentinel element is visible
    });

    const currentObserver = observer.current;
    currentObserver.observe(sentinelRef.current);

    return () => {
      if (currentObserver && sentinelRef.current) {
        currentObserver.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, loading, fetchComment]); // Only rerun when hasMore or loading changes

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

  const getEditorLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      default:
        return 'plaintext';
    }
  };

  const handleCommentChange = (deleted: boolean) => {
    if (!post) return;
    const newCommentCount = deleted ? post.totalComments - 1 : post.totalComments + 1;
    setPost({ ...post, totalComments: newCommentCount });
  };

  const handleCommentSubmit = async () => {
    if (post && newCommentText && newCommentCode) {
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
          authorname: displayname || '',
          avatar: avatarUrl || '',
          postId: post._id,
        };
        console.log('Comment posted successfully:');
        handleCommentChange(false);
        commentDelete(false);
        const displayedComment: Comment = {
          _id: responseComments,
          code: newCommentText,
          text: newCommentText,
          authorname: displayname || '',
          avatar: avatarUrl || '',
          author: '0',
          postId: post._id,
          createdAt: formatDate(new Date().toLocaleTimeString()),
          updatedAt: formatDate(new Date().toLocaleTimeString()),
          __v: 0,
          isAuthor: true,
        };
        setComments((prevComments) => {
          if (prevComments) {
            return [
              displayedComment, // Add the new comment at the top
              ...prevComments,
            ];
          }
          return [displayedComment]; // Initialize with the new comment if prevComments is null
        });
        setNewCommentText('');
        setNewCommentCode('');
      } catch (error) {
        toast.error('Failed to post comment!');
        console.error('Failed to post comment:', error);
        throw error;
      }
    }
  };

  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [editedCode, setEditedCode] = useState<string>('');

  const handleEdit = (index: number, commentText: string, commentCode: string) => {
    setEditingComment(index);
    setEditedText(commentText);
    setEditedCode(commentCode);
  };

  const handleSaveComment = async (index: number) => {
    if (comments) {
      const updatedComments = [...comments];
      updatedComments[index] = {
        ...updatedComments[index],
        text: editedText,
        code: editedCode,
      };
      setComments(updatedComments);

      setEditingComment(null);
      setEditedText('');
      setEditedCode('');
      try {
        // Send API request to update the comment
        await updateComment(post._id, comments[index]._id, {
          text: editedText,
          code: editedCode,
        });

        // Update the comment content in the UI after successful response
      } catch (error) {
        toast.error('Failed saving comment!');
        console.error('Failed to save comment:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditedText('');
    setEditedCode('');
  };

  const handleDelete = async (commentId: string, index: number) => {
    // Remove the comment immediately from the UI
    const removedComment = comments[index]; // Save the comment in case of rollback
    setComments((prevComments) => prevComments?.filter((_, i) => i !== index) ?? []);
    handleCommentChange(true);

    try {
      // Call API to delete the comment
      await deleteComment(post._id, commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed deleting comment!');

      // Revert optimistic UI update in case of an error
      setComments((prevComments) => {
        const updatedComments = prevComments ? [...prevComments] : [];
        updatedComments.splice(index, 0, removedComment); // Restore the deleted comment
        return updatedComments;
      });
      handleCommentChange(false); // Revert the comment count
    }
  };

  return (
    <div className='w-full h-[95vh] flex flex-col text-white bg-Background/Bottom relative border-Primary/Dark border-solid box-border border-2 rounded-3xl p-5 md:p-7 lg:p-8 xl-10'>
      {/* Avatar, Name, and Date */}
      <div className='overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-4'>
            <img
              src={post ? post.avatar : ''}
              alt='Avatar'
              className='w-12 h-12 rounded-full object-cover'
            />
            <div>
              <p className='font-bold text-lg'>{post ? post.authorname : ''}</p>
              <p className='text-sm text-Accent/Light'>
                {post ? formatDate(post.createdAt) : 'Loading...'}&nbsp;
                {post && post.updatedAt && post.createdAt !== post.updatedAt && (
                  <span className='text-xs text-white'>(Edited: {formatDate(post.updatedAt)})</span>
                )}
              </p>
              {/* Check if `updatedAt` is different from `createdAt` */}
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            {post?.tags && post.tags.length > 0 ? (
              post.tags.map((tagName, index) => (
                <span
                  key={index}
                  className='bg-Primary/Light flex justify-center text-Primary/Dark text-sm px-2 rounded-3xl w-20 py-1'
                >
                  {tagName}
                </span>
              ))
            ) : (
              <span></span>
            )}
          </div>
        </div>

        <p className='w-full py-2 overflow-hidden resize-none focus:outline-none focus:border-transparent text-lg text-Primary/Light'>
          {post?.title}
        </p>

        <p className='mb-4 w-full overflow-hidden resize-none focus:outline-none focus:border-transparent'>
          {post ? post.content : ''}
        </p>

        {/* Tabs */}
        <div className='flex overflow-x-auto'>
          {post?.files.map((file, index) => (
            <div
              key={index}
              className={`flex-shrink-0 text-Primary/Light font-bold max-w-[150px] truncate px-2 py-1 cursor-pointer ${
                activeTab === index ? 'border-b-4 border-Primary/Dark' : ''
              }`}
              onClick={() => setActiveTab(index)}
            >
              {file.fileName || 'Untitled'}
            </div>
          ))}
        </div>

        {/* Code Editor for the selected file */}
        <div className='mb-4'>
          <Editor
            height='30vh'
            width='100%'
            language={getEditorLanguage(post ? post.files[activeTab]?.fileName : '')}
            value={post ? post.files[activeTab]?.fileUrl : ''}
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
        {/* Buttons */}
        <div className='flex justify-end space-x-4 mt-4'>
          <div className='flex justify-end'>
            <button
              onClick={handleLike}
              className={`w-20 h-8 inline-flex items-center justify-center py-2 px-4 rounded-lg ${hasLiked ? 'bg-Accent/Target text-white' : 'bg-white text-Accent/Target'}`}
            >
              <svg
                className={`w-6 h-6 mr-1 stroke-current fill-current`} // Tailwind class for color
                viewBox='0 0 24 24'
              >
                <path d='M20.0648 10.2853C20.4353 10.5586 20.7764 10.8297 20.7764 11.783C20.7764 12.7386 20.2943 13.1253 19.7785 13.3942C19.9892 13.757 20.0566 14.1928 19.9658 14.6075C19.8037 15.3719 19.1406 15.9653 18.5511 16.1408C18.8058 16.5719 18.8858 16.9964 18.5827 17.5186C18.1932 18.1742 17.8543 18.423 16.3553 18.423H10.2501C8.17005 18.423 7.09216 17.2097 7.09216 16.2008V11.0119C7.09216 8.2786 10.1806 5.95637 10.1806 4.05637L9.95742 1.68971C9.94689 1.54526 9.97426 1.19193 10.0795 1.08971C10.2479 0.914153 10.7132 0.645264 11.4164 0.645264C11.8753 0.645264 12.1806 0.736375 12.5406 0.918597C13.7637 1.53415 14.0816 3.09193 14.0816 4.34526C14.0816 4.94749 13.2101 6.75193 13.0922 7.37637C13.0922 7.37637 14.9174 6.94971 17.0479 6.93415C19.2816 6.92082 20.7301 7.35637 20.7301 8.80526C20.7301 9.38526 20.269 9.96749 20.0648 10.2853ZM2.03952 9.53415H3.72374C4.05875 9.53415 4.38003 9.67462 4.61692 9.92469C4.85382 10.1747 4.98689 10.5139 4.98689 10.8675V19.3119C4.98689 19.6655 4.85382 20.0046 4.61692 20.2548C4.38003 20.5048 4.05875 20.6453 3.72374 20.6453H2.03952C1.70451 20.6453 1.38323 20.5048 1.14635 20.2548C0.909441 20.0046 0.776367 19.6655 0.776367 19.3119V10.8675C0.776367 10.5139 0.909441 10.1747 1.14635 9.92469C1.38323 9.67462 1.70451 9.53415 2.03952 9.53415Z' />
              </svg>
              {post ? formatNumber(post.totalLikes) : ''}
            </button>

            <svg
              onClick={handleSave}
              className={`w-8 h-8 ml-2 stroke-current fill-current ${hasSaved ? 'text-Accent/Target' : 'text-Accent/Light'}`}
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
            <h3 className='text-lg font-bold text-Primary/Light'>
              Comments ({formatNumber(post.totalComments)})
            </h3>

            <div className='space-y-2'>
              {comments.map((comment, index) => (
                <div key={index} className='bg-Background/Light p-4 rounded'>
                  <div className='flex justify-between items-center mb-2'>
                    <div className='flex items-center gap-4'>
                      <img
                        src={comment.avatar || '/default-avatar.png'}
                        alt='Avatar'
                        className='w-8 h-8 rounded-full object-cover'
                      />
                      <div>
                        <p className='font-bold'>{comment.authorname}</p>
                        <p className='text-sm text-Accent/Light'>{formatDate(comment.updatedAt)}</p>
                      </div>
                    </div>
                    {comment.isAuthor && (
                      <div className='flex space-x-2'>
                        {editingComment === index ? (
                          <>
                            <button
                              className='text-sm text-Accent/Light hover:text-white'
                              onClick={() => handleSaveComment(index)}
                            >
                              Submit
                            </button>
                            <button
                              className='text-sm text-Accent/Light hover:text-white'
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className='text-sm text-Accent/Light hover:text-white'
                              onClick={() =>
                                handleEdit(index, comment.text || '', comment.code || '')
                              }
                            >
                              Edit
                            </button>
                            <button
                              className='text-sm text-Accent/Light hover:text-white'
                              onClick={() => handleDelete(comment.author, index)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {editingComment === index ? (
                    <>
                      <textarea
                        className='w-full p-2 border border-Primary/Dark rounded mb-2'
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        placeholder='Edit your comment'
                      />
                      <Editor
                        height='10vh'
                        width='100%'
                        language='markdown'
                        value={editedCode}
                        theme='vs-dark'
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          wordWrap: 'on',
                          scrollBeyondLastLine: false,
                          renderValidationDecorations: 'off',
                        }}
                        onChange={(value) => setEditedCode(value || '')}
                      />
                    </>
                  ) : (
                    <>
                      {comment.text && <p className='mb-2'>{comment.text}</p>}
                      {comment.code && (
                        <Editor
                          height='10vh'
                          width='100%'
                          language='markdown'
                          value={comment.code}
                          theme='vs-dark'
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            scrollBeyondLastLine: false,
                            renderValidationDecorations: 'off',
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && <div className='text-center text-Accent/Light'>Loading...</div>}

        {/* Sentinel for Infinite Scroll */}
        <div ref={sentinelRef} className='h-2'></div>
      </div>
      {/* New Comment Section */}
      <div className='mt-auto flex-none divide-y-2 divide-Primary/Dark'>
        <h3 className='text-lg font-bold text-Primary/Light'>New Comment</h3>
        <div className='bg-Background/Light pt-3 px-2'>
          <div className='flex justify-center gap-4'>
            <img
              src='https://via.placeholder.com/50'
              alt='Avatar'
              className='w-8 h-8 rounded-full object-cover'
            />
            <div className='w-full'>
              <textarea
                className='w-full p-2 bg-Background/Bottom resize-none border-Background/Middle border-2'
                rows={3}
                placeholder='Share your thought...'
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />
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
                  className='mt-2 w-24 h-8 bg-Primary/Dark flex items-center justify-center text-white py-2 px-4 rounded-lg hover:bg-Primary/Light hover:text-Primary/Dark'
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

