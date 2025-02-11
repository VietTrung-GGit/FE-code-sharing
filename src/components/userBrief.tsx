import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { UserDataFull, followUser, unfollowUser } from '../services/userService';
import { IoIosMore, IoIosMail, IoMdArrowDropdown } from 'react-icons/io';
import { AiOutlineUserDelete } from 'react-icons/ai';
import { GrUserAdmin } from 'react-icons/gr';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
      <div className='relative bg-Background/Bottom text-white w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[730px] mb-10 mt-5 border-Primary/Dark border-2 rounded-3xl p-5 md:p-7 lg:p-8'>
        <div className='absolute right-0 top-0'>
          <button
            className='hover:text-gray-300 text-white text-3xl'
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <IoIosMore />
          </button>
          {isDropdownOpen && (
            <div className='absolute -right-40 top-14 w-56 bg-Background/Bottom border rounded-3xl border-2 border-Primary/Dark shadow-lg z-10'>
              <ul className='py-1 my-3 ml-2'>
                <li>
                  <button className='block px-4 py-2 text-white hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                    <GrUserAdmin className='text-2xl' />
                    Assign as an admin
                  </button>
                </li>
                <li>
                  <button className='block px-4 py-2 text-red-500 hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                    <AiOutlineUserDelete className='text-2xl ' />
                    Remove from group
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
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

