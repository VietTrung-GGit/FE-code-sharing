import React, { useState } from 'react';
import PostCreate from '../components/postCreate';
import { useUser } from '../context/UserContext';  // Import your user context

const ButtonShare: React.FC = () => {
  const { avatarUrl } = useUser()
  const [showPostCreate, setShowPostCreate] = useState<boolean>(false); // New state for modal visibility

  const handleCreate = () => {
    setShowPostCreate(true);
  };

  const handleCloseModal = () => {
    setShowPostCreate(false); // Close the modal when the close button is clicked
  };

  return (
    <div>
      <button
        className='bg-Background/Bottom text-center mt-0 p-14 w-full h-40 top-0 right-0 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28 flex justify-between 
      sm:max-lg:p-14 lg:max-xl:p-10 xl:max-2xl:p-12 md:max-lg:ml-[255px] lg:max-xl:ml-[290px] xl:max-2xl:ml-96 sm:max-md:w-full md:max-lg:w-2/3 lg:max-2xl:w-1/2'
        onClick={handleCreate}
      >
        {/* Avatar Section */}
        <div className='-mt-3 -ml-4 sm:max-xl:-mt-3 xl:max-2xl:-mt-2 sm:max-xl:ml-4 xl:max-2xl:ml-6'>
          <img
            src={avatarUrl}
            alt='Profile Icon'
            className='sm:max-2xl:w-20 rounded-full object-cover'
          />
        </div>

        {/* Share Text Section */}
        <div className='bg-Background/Middle rounded-3xl h-14 w-3/4 py-4 pl-4 -mt-2 sm:max-xl:-mt-2'>
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
