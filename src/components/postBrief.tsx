import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import PostDetail from '../components/postDetail';
import PostCreate from '../components/postCreate';
import { formatNumber, formatDate } from '../utils/helpers';
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
}

const PostBrief: React.FC<PostBriefProps> = ({ postData }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showPostDetail, setShowPostDetail] = useState<boolean>(false); // New state for modal visibility
  const [showPostCreate, setShowPostCreate] = useState<boolean>(false); // New state for modal visibility
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  useEffect(() => {
    // Initialize the post state with the postData prop
    setPost(postData);
    setHasLiked(postData.Liked);
    setHasSaved(postData.Stored);
  }, [postData]);

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
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      setVisible(false);
      try {
        deletePost(post._id);
      } catch (error) {
        setVisible(true);
        toast.error('Error deleting post!');
        console.error('Error deleting post:', error);
      }
    }
  };

  const truncatedText =
    (post?.content.length || 0) > 400 ? post?.content.slice(0, 400) + '...' : post?.content;

  if (!post) return <div>Loading...</div>;

  return (
    <div className='flex justify-center items-center relative'>
      {visible && (
        <div className='bg-Background/Bottom text-white sm:w-4/5 md:w-1/2 my-10 border-Primary/Dark border-2 rounded-3xl p-5 md:p-7 lg:p-8'>
          {/* Avatar and Tags */}
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <img
                src={post.avatar || 'fallback-avatar-url.jpg'} // Fallback for avatar
                alt='Avatar'
                className='w-12 h-12 rounded-full object-cover'
              />
              <div>
                <p className='font-bold text-lg'>{post ? post.authorname : ''}</p>
                <p className='text-sm text-Accent/Light'>
                  {post ? formatDate(post.createdAt) : 'Loading...'}&nbsp;
                  {post && post.editedAt && post.createdAt !== post.editedAt && (
                    <span className='text-xs text-white'>
                      (Edited: {formatDate(post.editedAt)})
                    </span>
                  )}
                </p>
                {/* Check if `updateat` is different from `createat` */}
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              {post.tags.length > 0 ? (
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

          {/* Title */}
          <div className='flex items-center text-lg text-Primary/Light'>
            <p className='w-full py-2 overflow-hidden'>{post.title || 'Untitled'}</p>
          </div>

          {/* Post Text */}
          <div className='flex items-center'>
            <p className='mb-4 w-full py-2 overflow-hidden'>
              {truncatedText || ''}
              {post.content.length > 400 && (
                <span
                  onClick={handleMoreClick}
                  className='text-Accent/Light text-sm cursor-pointer'
                >
                  More
                </span>
              )}
            </p>
          </div>

          {/* Tabs */}
          <div className='flex overflow-x-auto'>
            {post.files.length > 0 ? (
              post.files.map((file, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 text-Primary/Light font-bold max-w-[150px] truncate px-2 py-1 cursor-pointer ${activeTab === index ? 'border-b-4 border-Primary/Dark' : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  {file.fileName || 'Untitled'}
                </div>
              ))
            ) : (
              <span className='text-Primary/Light'>No files available</span>
            )}
          </div>

          {/* Editor */}
          <div>
            <Editor
              height='30vh'
              width='100%'
              language='javascript'
              value={post.files[activeTab]?.fileUrl || 'No content available'}
              theme='vs-dark'
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                readOnly: true,
              }}
            />
          </div>

          {/* Buttons */}
          <div className='flex justify-end space-x-4 mt-4'>
            {post.isAuthor && (
              <div>
                <button
                  onClick={handleEdit}
                  className='w-24 h-8 bg-Accent/Light text-Background/Bottom rounded-lg hover:bg-blue-600'
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className='w-24 h-8 bg-red-500 text-white rounded-lg hover:bg-red-600'
                >
                  Delete
                </button>
              </div>
            )}

            <button
              onClick={handleMoreClick}
              className='w-20 h-8 bg-white text-Primary/Dark inline-flex items-center justify-center py-2 px-4 rounded-lg'
            >
              <svg
                className={`w-6 h-6 mr-2 stroke-current stroke-2`} // Tailwind class for color
                fill='none' // Use the current text color
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
              className={`w-20 h-8 inline-flex items-center justify-center py-2 px-4 rounded-lg ${hasLiked ? 'bg-Accent/Target text-white' : 'bg-white text-Accent/Target'}`}
            >
              <svg
                className={`w-6 h-6 mr-1 stroke-current fill-current`} // Tailwind class for color
                viewBox='0 0 24 24'
              >
                <path d='M20.0648 10.2853C20.4353 10.5586 20.7764 10.8297 20.7764 11.783C20.7764 12.7386 20.2943 13.1253 19.7785 13.3942C19.9892 13.757 20.0566 14.1928 19.9658 14.6075C19.8037 15.3719 19.1406 15.9653 18.5511 16.1408C18.8058 16.5719 18.8858 16.9964 18.5827 17.5186C18.1932 18.1742 17.8543 18.423 16.3553 18.423H10.2501C8.17005 18.423 7.09216 17.2097 7.09216 16.2008V11.0119C7.09216 8.2786 10.1806 5.95637 10.1806 4.05637L9.95742 1.68971C9.94689 1.54526 9.97426 1.19193 10.0795 1.08971C10.2479 0.914153 10.7132 0.645264 11.4164 0.645264C11.8753 0.645264 12.1806 0.736375 12.5406 0.918597C13.7637 1.53415 14.0816 3.09193 14.0816 4.34526C14.0816 4.94749 13.2101 6.75193 13.0922 7.37637C13.0922 7.37637 14.9174 6.94971 17.0479 6.93415C19.2816 6.92082 20.7301 7.35637 20.7301 8.80526C20.7301 9.38526 20.269 9.96749 20.0648 10.2853ZM2.03952 9.53415H3.72374C4.05875 9.53415 4.38003 9.67462 4.61692 9.92469C4.85382 10.1747 4.98689 10.5139 4.98689 10.8675V19.3119C4.98689 19.6655 4.85382 20.0046 4.61692 20.2548C4.38003 20.5048 4.05875 20.6453 3.72374 20.6453H2.03952C1.70451 20.6453 1.38322 20.5048 1.14733 20.2548C0.911434 20.0046 0.778358 19.6655 0.778358 19.3119V10.8675C0.778358 10.5139 0.911434 10.1747 1.14733 9.92469C1.38322 9.67462 1.70451 9.53415 2.03952 9.53415Z' />
              </svg>
              {formatNumber(post.totalLikes) || 0}
            </button>

            <svg
              onClick={() => handleSave(false)}
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
      )}
      {/* PostDetail Modal */}
      {showPostDetail && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex z-50'>
          <div className='w-1/10 flex items-start justify-start'> </div>

          <div className='flex-grow sm:w-4/5 md:w-1/2 mx-auto flex items-center'>
            {' '}
            <PostDetail
              proppost={post}
              toggleLike={handleLikeClick}
              toggleSave={handleSaveClick}
              propsaved={hasSaved}
              propliked={hasLiked}
              commentDelete={handleCommentChange}
            />{' '}
          </div>
          <div className='w-1/10 flex items-end justify-end'>
            {' '}
            <button onClick={handleCloseModal1} className='mr-auto mt-4 text-3xl text-white'>
              ×
            </button>
          </div>
        </div>
      )}

      {showPostCreate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex z-50'>
          <div className='w-1/10 flex items-start justify-start'> </div>

          <div className='flex-grow sm:w-4/5 md:w-1/2 mx-auto flex items-center'>
            {' '}
            <PostCreate postData={post} closeModal={handleCloseModal2} />{' '}
          </div>
          <div className='w-1/10 flex items-end justify-end'>
            {' '}
            <button onClick={handleCloseModal2} className='mr-auto mt-4 text-3xl text-white'>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostBrief;

