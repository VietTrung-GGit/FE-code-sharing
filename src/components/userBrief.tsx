import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { UserDataFull, followUser, unfollowUser } from '../services/userService';

interface UserBriefProps {
  userData?: UserDataFull;
}

const mockUser: UserDataFull = {
  _id: 'mock-id',
  username: 'mockuser',
  displayname: 'Mock User',
  email: 'hihi',
  avatar:
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
};

const UserBrief: React.FC<UserBriefProps> = ({ userData }) => {
  const [user, setUser] = useState<UserDataFull>(mockUser);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  const handleFollow = async () => {
    try {
      setIsFollowing(true);
      await followUser(user._id);
      toast.success(`Followed ${user.displayname}`);
    } catch (error) {
      setIsFollowing(false);
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async () => {
    try {
      setIsFollowing(false);
      await unfollowUser(user._id);
      toast.info(`Unfollowed ${user.displayname}`);
    } catch (error) {
      setIsFollowing(true);
      toast.error('Failed to unfollow user');
    }
  };

  return (
    <div className='flex justify-center items-center relative'>
      <div className='bg-Background/Bottom text-white w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[730px] mb-10 mt-5 border-Primary/Dark border-2 rounded-3xl p-5 md:p-7 lg:p-8'>
        <div className='flex flex-row w-full items-center space-x-4'>
          <div className='inline-block flex-shrink-0'>
            <img
              src={user.avatar}
              alt='Profile Icon'
              className='w-16 h-16 rounded-full object-cover'
            />
          </div>
          <div className='flex flex-col flex-grow'>
            <p className='text-white font-semibold text-2xl'>{user.displayname}</p>
            <p className='text-Primary/Light'>@{user.username}</p>
          </div>
          <button
            className={`transition-colors duration-300 ease-in-out w-32 h-8 rounded-xl text-md text-Accent/Target m-4 
              ${isFollowing ? 'bg-gray-500 text-white hover:bg-red-400' : 'bg-white hover:bg-Accent/Target hover:text-white'}`}
            onClick={isFollowing ? handleUnfollow : handleFollow}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserBrief;

