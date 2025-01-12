import React, { useState, useEffect } from 'react';
import PostCreate from '../components/postCreate';
import { getUserFullData } from '../services/userService';

const ButtonShare: React.FC = () => {
  const [showPostCreate, setShowPostCreate] = useState<boolean>(false); // New state for modal visibility
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserFullData();
        setAvatarUrl(userData.avatar);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);
  const handleCreate = () => {
    setShowPostCreate(true);
  };

  const handleCloseModal = () => {
    setShowPostCreate(false); // Close the modal when the close button is clicked
  };

  return (
    <div>
      <button
        className='lg:border-t-0 bg-Background/Bottom text-center mt-0 p-14 w-full h-40 top-32 right-0 relative border-Primary/Dark border-solid box-border border-2 mb-10 flex justify-between rounded-3xl lg:rounded-none
        sm:max-lg:p-14 lg:max-xl:p-10 xl:max-2xl:p-12 md:max-lg:mx-[160px] lg:max-xl:ml-[290px] xl:max-2xl:ml-96 sm:max-md:w-full md:max-lg:w-2/3 lg:max-2xl:w-1/2 sm:max-lg:rounded-3xl lg:max-2xl:rounded-b-3xl lg:max-2xl:top-0'
        onClick={handleCreate}
      >
        {/* Avatar Section */}
        <div className='inline-block flex justify-between items-center w-full'>
          {/* Avatar Section */}
          <div className='-ml-2 sm:max-md:-ml-2 md:max-2xl:ml-4'>
            <img
              src={avatarUrl || ''}
              alt='Profile Icon'
              className='w-16 h-16 object-cover rounded-full aspect-square'
            />
          </div>

          {/* Share Text Section */}
          <div className='bg-Background/Middle py-4 px-4 rounded-3xl h-14 w-full ml-2'>
            <p className='text-Primary/Light text-l'>Share your code...</p>
          </div>
        </div>
      </button>
      {showPostCreate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex z-50'>
          <div className='sm:w-1/10 md:w-1/5 flex items-start justify-start'></div>

          <div className='sm:w-4/5 md:w-3/5 mx-auto flex items-center justify-center'>
            <PostCreate closeModal={handleCloseModal} />
          </div>

          <div className='sm:w-1/10 md:w-1/5  flex items-start justify-start'>
            <button onClick={handleCloseModal} className='text-3xl text-white'>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonShare;

