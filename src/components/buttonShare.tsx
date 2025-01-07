import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCreate from '../components/postCreate';

const ButtonShare: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState<string>('https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png');
    const [showPostCreate, setShowPostCreate] = useState<boolean>(false);  // New state for modal visibility
  

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // Replace with where your token is stored
        if (token) {
          const response = await axios.get('/api/user/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Set the fetched user data
          setAvatarUrl(response.data.avatar);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Handle the error gracefully, maybe log out the user if the token is invalid
      }
    };

    fetchUserProfile();
  }, []);

  const handleCreate = () => {
    setShowPostCreate(true);
  }

const handleCloseModal = () => {
  setShowPostCreate(false);  // Close the modal when the close button is clicked
  console.log('hello');
};

  return (
    <div>
    <button
      className="bg-Background/Bottom text-center mt-0 p-14 w-full h-40 top-0 right-0 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28 flex justify-between 
      sm:max-lg:p-14 lg:max-xl:p-10 xl:max-2xl:p-12 md:max-lg:ml-[255px] lg:max-xl:ml-[290px] xl:max-2xl:ml-96 sm:max-md:w-full md:max-lg:w-2/3 lg:max-2xl:w-1/2"
      onClick={handleCreate}
    >
      {/* Avatar Section */}
      <div className="-mt-3 -ml-4 sm:max-xl:-mt-3 xl:max-2xl:-mt-2 sm:max-xl:ml-4 xl:max-2xl:ml-6">
        <img
          src={avatarUrl}
          alt="Profile Icon"
          className="sm:max-2xl:w-20 rounded-full object-cover"
        />
      </div>

      {/* Share Text Section */}
      <div className="bg-Background/Middle rounded-3xl h-14 w-3/4 py-4 pl-4 -mt-2 sm:max-xl:-mt-2">
        <p className="text-left text-Primary/Light text-l">Share your code...</p>
      </div>
</button>
            {showPostCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50">
           <div className='w-1/4'> </div>
        
           <div className='w-1/2 flex items-center'> <PostCreate /> </div>
           <div className='w-1/4'> <button
              onClick={handleCloseModal}

              className="mr-auto mt-4 text-3xl text-white"
            >
              ×
            </button></div>
          </div>
      )}
    
    </div>

  );
};

export default ButtonShare;
