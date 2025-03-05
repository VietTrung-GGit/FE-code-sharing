// CommentItem.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthUser } from '../context/AuthUserContext';
import { BiSolidEdit, BiTrashAlt } from 'react-icons/bi';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Theme } from 'emoji-picker-react';
import { IoIosAddCircleOutline, IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import {
  Comment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  fetchComments,
  createComment,
} from '../services/postService';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import { formatDate, formatNumber } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';
import EmojiPickerComponent from './emojiPicker';

interface CommentItemProps {
  comment: Comment;
  index: number;
  onDelete: (index: number) => void;
  level: number;
  lineShown?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  index,
  onDelete,
  level: levelprop,
  lineShown,
}) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>(comment.text);
  const [editedCode, setEditedCode] = useState<string>(comment.code);
  const [hasLiked, setHasLiked] = useState<boolean>(comment.Liked);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [commentCount, setCommentCount] = useState(comment.totalComments);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyCode, setReplyCode] = useState('');
  const { user } = useAuthUser();
  const replyContainerRef = useRef<HTMLDivElement | null>(null);
  const [replyHeight, setReplyHeight] = useState<number | null>(null);
  const replyContainerRefParent = useRef<HTMLDivElement | null>(null);
  const [replyParentHeight, setReplyParentHeight] = useState<number | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const emojis = ['😀', '😆', '😎', '🔥', '💯', '🚀', '🎉', '🥳'];
  const getRandomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
  useEffect(() => {
    if (replyContainerRef.current) {
      setReplyHeight(replyContainerRef.current.offsetHeight);
    }
  }, [showReplies, replies, editing, showReplyInput, commentCount]); // Recalculate when replies are shown or updated

  useEffect(() => {
    if (replyContainerRefParent.current) {
      setReplyParentHeight(replyContainerRefParent.current.offsetHeight);
    }
  }, [showReplies, replies, editing, showReplyInput]);

  const handleAddReply = async () => {
    if (comment && (replyText || replyCode)) {
      try {
        const displayedComment: Comment = {
          _id: '-1',
          code: replyCode,
          text: replyText,
          authorname: user?.displayname || '',
          avatar: user?.avatar || '',
          author: '0',
          postId: comment._id,
          createdAt: 'Recently',
          updatedAt: 'Recently',
          Liked: false,
          totalLikes: 0,
          totalComments: 0,
          editedAt: '',
          __v: 0,
          isAuthor: true,
        };

        setReplies((prevReplies) =>
          prevReplies ? [...prevReplies, displayedComment] : [displayedComment],
        );
        setShowReplyInput(false);
        setWaiting(true);
        const responseComments = await createComment(comment._id, {
          text: replyText,
          code: replyCode,
        });
        setWaiting(false);
        setReplies((prevReplies) =>
          prevReplies.map((reply) =>
            reply._id === '-1' ? { ...reply, _id: responseComments } : reply,
          ),
        );

        setShowReplies(true);
        console.log('Reply posted successfully:');
        setCommentCount((prev) => prev + 1);
      } catch (error) {
        setReplies((prevReplies) => prevReplies.slice(0, -1)); // Remove last reply on failure
        setCommentCount((prev) => Math.max(0, prev - 1)); // Ensure count doesn't go below 0
        toast.error('Failed to reply comment!');
        console.error('Failed to reply comment:', error);
      } finally {
        setReplyText('');
        setReplyCode('');
      }
    }
  };

  // Fetch comments function
  const fetchReply = async () => {
    if (!hasMore || loading || comment._id == '-1') return;

    setLoading(true);
    const previousReplies = [...(replies || [])];
    const previousHasMore = hasMore;
    try {
      // Store previous state for rollback

      const responseComments = await fetchComments(comment._id, page, page * 5, 'ascending');

      // Ensure newComments is always an array
      const newComments = Array.isArray(responseComments.comments) ? responseComments.comments : [];
      const hasNextPage = responseComments.hasMore;

      // Handle previous comments being null by defaulting to an empty array
      setReplies((prevComments) => [...(prevComments || []), ...newComments]);
      setHasMore(hasNextPage);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error('Error fetching replies:', error);
      toast.error('Error fetching replies!');

      // Rollback changes if fetch fails
      setReplies(previousReplies);
      setHasMore(previousHasMore);
      setPage((prevPage) => prevPage - 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    {
      comment.totalComments > 0 && fetchReply();
    }
  }, []);

  const handleLike = async (mini: boolean) => {
    // Step 1: Immediate Optimistic UI Update using middlepost
    const newHasLiked = !hasLiked;
    const oldLikes = comment.totalLikes;

    // Optimistic UI update (based on previous successful state)
    setHasLiked(newHasLiked);
    comment.totalLikes = newHasLiked ? comment.totalLikes + 1 : comment.totalLikes - 1;
    setWaiting(true);
    try {
      if (newHasLiked) {
        likeComment(comment._id);
      } else {
        unlikeComment(comment._id);
      }
      setWaiting(false);
    } catch (error) {
      toast.error('Error liking comment!');
      console.error('Error while liking the comment:', error);

      setHasLiked(hasLiked);
      comment.totalLikes = oldLikes;
    }
  };
  const handleSaveComment = async () => {
    try {
      setWaiting(true);
      await updateComment(comment._id, { text: editedText, code: editedCode });
      setWaiting(false);
      comment.text = editedText;
      comment.code = editedCode;
      comment.editedAt = 'Recently';
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update comment!');
      console.error('Error updating comment:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditedText(comment.text);
    setEditedCode(comment.code);
  };

  const handleDelete = async () => {
    try {
      onDelete(index);
      setWaiting(true);
      await deleteComment(comment._id);
      setWaiting(false);
    } catch (error) {
      toast.error('Failed to delete comment!');
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteReply = (index: number) => {
    setCommentCount(commentCount - 1);
    setReplies((prevReplies) => {
      const updatedReplies = prevReplies.filter((_, i) => i !== index);

      if (updatedReplies.length === 0) {
        setShowReplies(false);
      }

      return updatedReplies;
    });
  };
  const { theme } = useTheme();
  return (
    <div key={index} className='rounded w-full px-0 py-4' ref={replyContainerRef}>
      <div className='flex items-start gap-4 relative'>
        {/* Avatar on the left */}
        <div className='relative'>
          {/* Avatar */}
          <img
            src={comment.avatar || import.meta.env.VITE_DEFAULT_AVATAR}
            alt='Avatar'
            className='w-8 h-8 rounded-full object-cover'
          />

          {levelprop !== 1 && (
            <>
              <svg
                className={`absolute left-full top-1/2 -translate-y-[65%] -translate-x-16 ${
                  levelprop === 2 ? 'stroke-gray-600' : 'stroke-gray-800'
                }`}
                width='32'
                height='40'
                viewBox='0 0 432 168'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M0.998047 1C10.5 81 16.5 159.5 88.9981 167H431.498'
                  strokeWidth='28' // Increased line thickness
                />
              </svg>

              {lineShown && (
                <div
                  className={`absolute left-full top-full w-[2px] -translate-x-16 -translate-y-8 z-30 ${
                    levelprop === 2 ? 'bg-gray-600' : 'bg-gray-800'
                  }`}
                  style={{ height: replyHeight ? `${replyHeight + 18}px` : 'auto' }}
                />
              )}
            </>
          )}

          {/* Vertical Line - Only Show If Replies Are Visible */}
          {showReplies && (
            <div
              className={`absolute left-full top-full w-[2px] -translate-x-4 ${
                levelprop === 1 ? 'bg-gray-600' : 'bg-gray-800'
              }`}
              style={{ height: replyParentHeight ? `${replyParentHeight + 10}px` : 'auto' }}
            />
          )}
        </div>
        {/* Content on the right */}
        <div className='flex-grow'>
          <div ref={replyContainerRefParent}>
            {/* Author details and edit/delete buttons */}
            <div className='flex justify-between items-center mb-2'>
              <div>
                <span className='font-semibold text-base'>{comment.authorname}</span>&nbsp;&nbsp;
                <span className='text-xs text-[var(--text-hovered)]'>
                  {comment ? formatDate(comment.createdAt) : 'Loading...'}&nbsp;
                </span>
                {comment?.editedAt &&
                  (comment.editedAt === 'Recently' ||
                    Math.abs(
                      new Date(comment.createdAt).getTime() - new Date(comment.editedAt).getTime(),
                    ) > 100) && (
                    <span className='text-xs'>(Edited: {formatDate(comment.editedAt)})</span>
                  )}
              </div>
            </div>
            {/* Comment content or editor */}
            {editing ? (
              <>
                <textarea
                  className='w-full p-2 border bg-[var(--input)] border-[var(--button-hovered)]  rounded mb-2'
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder='Edit your comment'
                />
                <Editor
                  height='10vh'
                  width='100%'
                  language='markdown'
                  value={editedCode}
                  theme={`${theme == 'light' ? 'light' : 'vs-dark'}`}
                  options={{
                    readOnly: false,
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
                    theme={`${theme == 'light' ? 'light' : 'vs-dark'}`}
                    options={{
                      readOnly: true,
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
            {/* Like, Edit, and Delete buttons on the same line */}
            <div className='flex mt-4 items-center justify-between'>
              {/* Fetch Replies Button - Only shown if totalComments > 0 */}

              {commentCount > 0 && levelprop < 3 && (
                <h3
                  className='text-sm text-text-[var(--text-title)] cursor-pointer mr-1 lg:mr-2 inline-flex items-end'
                  onClick={() => setShowReplies((prev) => !prev)}
                >
                  Replies ({formatNumber(commentCount)}){' '}
                  <span className='ml-[2px] text-lg'>
                    {!showReplies ? <IoMdArrowDropdown /> : <IoMdArrowDropup />}
                  </span>
                </h3>
              )}

              {levelprop < 3 && (
                <button
                  className='text-sm text-[var(--green-highlight)] hover:text-[var(--text-hovered)] flex items-center gap-x-1'
                  onClick={() => setShowReplyInput(!showReplyInput)}
                >
                  {!showReplyInput && 'New Reply'}
                </button>
              )}

              {/* Edit & Delete Buttons (if the user is the author) */}

              {/* Like & Reply Buttons (Aligned to the Right) */}
              <div className='flex items-center space-x-3 ml-auto mr-2'>
                {comment.isAuthor && (
                  <div className='flex space-x-2'>
                    {' '}
                    {editing ? (
                      <>
                        <button
                          className='text-sm text-gray-400 hover:text-[var(--text-hovered)]'
                          onClick={handleCancelEdit}
                        >
                          Cancel&nbsp;
                        </button>
                        <button
                          className='text-sm min-w-16 xsm:min-w-18 h-5 xsm:h-7 bg-Primary/Dark flex items-center justify-center text-white py-2 px-4 rounded-lg hover:text-[var(--text-title)] hover:text-[var(--background)]'
                          onClick={() => handleSaveComment()}
                        >
                          Submit
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className='text-lg hover:text-[var(--green-highlight)]'
                          onClick={() => setEditing(true)}
                          disabled={waiting || loading}
                        >
                          <BiSolidEdit />
                        </button>
                        <button
                          className='text-lg hover:text-[var(--red-highlight)]'
                          onClick={() => handleDelete()}
                          disabled={waiting || loading}
                        >
                          <BiTrashAlt />
                        </button>
                      </>
                    )}
                  </div>
                )}
                <button
                  onClick={() => handleLike(false)}
                  disabled={waiting || loading}
                  className={`text-sm transition-colors duration-200 ease-in-out min-w-12 xsm:min-w-14 h-5 xsm:h-7 inline-flex items-center justify-center py-1 xsm:px-3 rounded-lg ${
                    hasLiked
                      ? 'bg-Accent/Target text-white'
                      : 'bg-white text-Accent/Target hover:bg-gray-300'
                  }`}
                >
                  <svg
                    className='xsm:w-4 xsm:h-4 h-3 w-3 mr-2 stroke-current fill-current'
                    viewBox='0 0 24 24'
                  >
                    <path d='M20.0648 10.2853C20.4353 10.5586 20.7764 10.8297 20.7764 11.783C20.7764 12.7386 20.2943 13.1253 19.7785 13.3942C19.9892 13.757 20.0566 14.1928 19.9658 14.6075C19.8037 15.3719 19.1406 15.9653 18.5511 16.1408C18.8058 16.5719 18.8858 16.9964 18.5827 17.5186C18.1932 18.1742 17.8543 18.423 16.3553 18.423H10.2501C8.17005 18.423 7.09216 17.2097 7.09216 16.2008V11.0119C7.09216 8.2786 10.1806 5.95637 10.1806 4.05637L9.95742 1.68971C9.94689 1.54526 9.97426 1.19193 10.0795 1.08971C10.2479 0.914153 10.7132 0.645264 11.4164 0.645264C11.8753 0.645264 12.1806 0.736375 12.5406 0.918597C13.7637 1.53415 14.0816 3.09193 14.0816 4.34526C14.0816 4.94749 13.2101 6.75193 13.0922 7.37637C13.0922 7.37637 14.9174 6.94971 17.0479 6.93415C19.2816 6.92082 20.7301 7.35637 20.7301 8.80526C20.7301 9.38526 20.269 9.96749 20.0648 10.2853ZM2.03952 9.53415H3.72374C4.05875 9.53415 4.38003 9.67462 4.61692 9.92469C4.85382 10.1747 4.98689 10.5139 4.98689 10.8675V19.3119C4.98689 19.6655 4.85382 20.0046 4.61692 20.2548C4.38003 20.5048 4.05875 20.6453 3.72374 20.6453H2.03952C1.70451 20.6453 1.38322 20.5048 1.14733 20.2548C0.911434 20.0046 0.778358 19.6655 0.778358 19.3119V10.8675C0.778358 10.5139 0.911434 10.1747 1.14733 9.92469C1.38322 9.67462 1.70451 9.53415 2.03952 9.53415Z' />
                  </svg>
                  {formatNumber(comment.totalLikes) || 0}
                </button>
              </div>
            </div>
            {/* Reply Input Box */}
            {showReplyInput && (
              <div className='mt-3'>
                <h3 className='text-base font-semibold text-[var(--green-highlight)]'>New Reply</h3>
                <div className='bg-Background/Light pt-3 px-2'>
                  <div className='flex justify-center gap-4'>
                    <img
                      src={user?.avatar || import.meta.env.VITE_DEFAULT_AVATAR}
                      alt='Avatar'
                      className='w-8 h-8 rounded-full object-cover'
                    />
                    <div className='w-full'>
                      <div className='relative flex items-center mb-1'>
                        <textarea
                          className='w-full p-2 rounded-md bg-[var(--input)] focus:outline-none resize-none whitespace-pre-line break-all'
                          rows={1}
                          placeholder='Share your thought...'
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <button
                          onClick={() => setShowPicker(!showPicker)}
                          className='absolute top-1 right-2 z-40 text-lg hidden lg:block'
                        >
                          {getRandomEmoji()}
                        </button>
                        {showPicker && (
                          <div className='absolute bottom-full right-0 mb-2 z-30 bg-gray-800 rounded-lg shadow-lg'>
                            <EmojiPickerComponent
                              theme={theme}
                              onSelect={(emoji: EmojiClickData) =>
                                setReplyText((prev) => prev + emoji.emoji)
                              }
                              onClose={() => setShowPicker(false)}
                            />
                          </div>
                        )}
                      </div>
                      <Editor
                        height='7.5vh'
                        width='100%'
                        language='markdown'
                        value={replyCode}
                        onChange={(value) => setReplyCode(value || '')}
                        theme={`${theme == 'light' ? 'light' : 'vs-dark'}`}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          wordWrap: 'on',
                          scrollBeyondLastLine: false,
                          renderValidationDecorations: 'off',
                        }}
                      />
                      <div className='flex justify-end mt-2'>
                        <button
                          className='text-sm text-gray-400 hover:text-[var(--text-hovered)]'
                          onClick={() => setShowReplyInput(!showReplyInput)}
                        >
                          {showReplyInput && 'Cancel'}&nbsp;&nbsp;
                        </button>
                        <button
                          onClick={handleAddReply}
                          disabled={waiting || loading}
                          className='text-sm min-w-16 xsm:min-w-18 h-5 xsm:h-7  bg-Primary/Dark flex items-center justify-center text-white py-2 px-4 rounded-lg hover:text-[var(--background)]'
                        >
                          {/* Like Icon */}
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Fetch Replies Button - Only shown if totalComments > 0 */}
          </div>

          {/* Comments Section */}

          {showReplies && replies && commentCount > 0 && levelprop < 3 && (
            <div className='mt-4'>
              {' '}
              <div className='space-y-2'>
                {replies.map((reply, index) => (
                  <div>
                    {' '}
                    <CommentItem
                      key={reply._id}
                      comment={reply}
                      index={index}
                      onDelete={handleDeleteReply}
                      level={levelprop + 1}
                      lineShown={showReplies && index < replies.length - 1}
                    />
                  </div>
                ))}
              </div>
              {hasMore && comment.totalComments != 0 && (
                <button className='mt-2 flex justify-start' onClick={fetchReply}>
                  <h3 className='text-sm font-semibold text-text-[var(--text-title)]'>View More</h3>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;

