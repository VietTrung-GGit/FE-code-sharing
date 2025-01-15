import React, { useState, useEffect } from 'react';
import PostCreate from '../components/postCreate';
import { getUserFullData } from '../services/userService';

const ButtonShare: React.FC = () => {
  const [showPostCreate, setShowPostCreate] = useState<boolean>(false);
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
    setShowPostCreate(false);
  };

  return (
    <div className='flex justify-center w-full'>
      <button
        className='bg-Background/Bottom border-2 h-40 mx-6 border-Primary/Dark px-6 py-4 w-full max-w-4xl flex items-center justify-between rounded-3xl shadow-md lg:max-2xl:w-1/2 sm:max-lg:rounded-3xl lg:max-2xl:rounded-b-3xl sm:max-lg:mx-10 lg:max-2xl:mt-0
        border-solid box-border border-2 mb-10 rounded-3xl lg:border-t-0 text-center mt-0 p-14 mt-28 lg:rounded-none
        sm:max-lg:p-14 lg:max-xl:p-10 xl:max-2xl:p-12'
        onClick={handleCreate}
      >
        <div className='inline-block -ml-2 -mt-4  sm:max-lg:-mt-4 lg:max-2xl:-mt-2 sm:max-md:-ml-2 md:max-2xl:ml-4'>
          <img
            src={avatarUrl || ''}
            alt='Profile Icon'
            className='w-16 h-16 rounded-full object-cover'
          />
        </div>

        {/* Share Text Section */}
        <div className='bg-Background/Middle inline-block -mt-2 py-4 pl-4 rounded-3xl h-14 w-4/5 marker:sm:max-lg:-mt-2 lg:max-2xl:mt-0'>
          <p className='text-left text-Primary/Light text-l'>Share your code...</p>
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

