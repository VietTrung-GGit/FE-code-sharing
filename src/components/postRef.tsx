import React, { useState, useEffect, useRef } from 'react';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/loadingAnimate';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchHalfPostDetail, PostRefData } from '../services/postService';
import { useTheme } from '../context/ThemeContext';

interface PostRefProps {
  postId: string;
}

const PostRef: React.FC<PostRefProps> = ({ postId }) => {
  const { theme } = useTheme();
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [post, setPost] = useState<PostRefData | null>(null);
  useEffect(() => {
    const getPost = async () => {
      try {
        const data = await fetchHalfPostDetail(postId);
        setPost(data);
        console.log(post);
        console.log(data);
      } catch (error) {
        toast.error('Failed to load post');
      }
    };
    getPost();
  }, [postId]);

  const openNewTabAndRedirect = (url: string) => {
    window.open(url, '_blank'); // Opens the URL in a new tab
  };

  useEffect(() => {
    if (post?.content) {
      const element = textRef.current;
      if (element) {
        setIsTruncated(element.scrollHeight > element.clientHeight);
      }
    }
  }, [post]);

  if (!post)
    return (
      <div className='my-2'>
        <LoadingSpinner />
      </div>
    );

  return (
    <div
      onClick={() => openNewTabAndRedirect(`/post/${postId}`)}
      className='flex justify-center items-center relative cursor-pointer'
    >
      <div
        className={`${
          theme === 'original'
            ? 'bg-Background/Middle text-white'
            : 'bg-[var(--button)] text-[var(--text)]'
        } w-full mb-3 mt-1 rounded-3xl p-3 md:p-5 lg:p-6`}
      >
        {/* Avatar and Tags */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4'>
          <div className='flex items-center gap-4'>
            <img
              src={
                post.avatar ||
                'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
              }
              alt='Avatar'
              className='w-[40px] h-[40px] rounded-full object-cover'
            />
            <div>
              <p className='font-bold text-md'>{post.authorname}</p>
              <p
                className={`${
                  theme === 'original' ? 'text-[var(--green-highlight)]' : 'text-[var(--text)]'
                } text-xs`}
              >
                {formatDate(post.createdAt)}
                {post.editedAt &&
                  Math.abs(new Date(post.createdAt).getTime() - new Date(post.editedAt).getTime()) >
                    100 && <span className='text-xs'> (Edited: {formatDate(post.editedAt)})</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Title */}
        {post.title && (
          <div
            className={`${
              theme === 'original' ? 'text-Primary/Light' : 'text-[var(--text-selected)]'
            } flex items-center text-lg`}
          >
            <p className='w-full py-2 overflow-hidden break-all line-clamp-2'>{post.title}</p>
          </div>
        )}

        {/* Post Text */}
        <div className='flex items-center'>
          <div>
            <p
              ref={textRef}
              className='mb-4 w-full overflow-hidden whitespace-pre-line break-all line-clamp-2'
            >
              {post.content}
            </p>
            {isTruncated && (
              <p className='text-[var(--text-hovered)] text-sm cursor-pointer'> View detail </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostRef;

