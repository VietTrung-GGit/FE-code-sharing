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
        className='bg-Background/Bottom text-center mt-0 p-14 w-full h-40 top-32 right-0 relative border-Primary/Dark border-solid box-border border-2 mb-10 flex justify-between rounded-3xl lg:rounded-none
        sm:max-lg:p-14 lg:max-xl:p-10 xl:max-2xl:p-12 md:max-lg:mx-[160px] lg:max-xl:ml-[290px] xl:max-2xl:ml-96 sm:max-md:w-full md:max-lg:w-2/3 lg:max-2xl:w-1/2 sm:max-lg:rounded-3xl lg:max-2xl:rounded-b-3xl lg:max-2xl:top-0'
        onClick={handleCreate}
      >
        {/* Avatar Section */}
        <div className='inline-block -ml-2 -mt-4  sm:max-lg:-mt-4 lg:max-2xl:-mt-2 sm:max-md:-ml-2 md:max-2xl:ml-4'>
          <img
            src={avatarUrl || ''}
            alt='Profile Icon'
            className='w-16 h-16 sm:max-2xl:w-16 rounded-full object-cover'
          />
        </div>

        {/* Share Text Section */}
        <div className='bg-Background/Middle inline-block -mt-2 py-4 pl-4 rounded-3xl h-14 w-4/5 sm:max-md:w-4/5 md:max-2xl:w-3/4 marker:sm:max-lg:-mt-2 lg:max-2xl:mt-0'>
          <p className='text-left text-Primary/Light text-l'>Share your code...</p>
        </div>
      </button>
      {showPostCreate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex z-50'>
          <div className='w-1/10 flex items-start justify-start'> </div>

          <div className='flex-grow sm:w-4/5 md:w-1/2 mx-auto flex items-center'>
            {' '}
            <PostCreate closeModal={handleCloseModal} />{' '}
          </div>
          <div className='w-1/10 flex items-end justify-end'>
            {' '}
            <button onClick={handleCloseModal} className='mr-auto mt-4 text-3xl text-white'>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonShare;

