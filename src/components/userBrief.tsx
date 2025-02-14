import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { UserBriefData, followUser, unfollowUser } from '../services/userService';
import { IoIosMore, IoIosMail, IoMdArrowDropdown } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { AiFillHeart, AiOutlineUserDelete } from 'react-icons/ai';
import { formatNumber } from '../utils/helpers';
import { GrUserAdmin } from 'react-icons/gr';
interface UserBriefProps {
  userData?: UserBriefData;
}

const mockUser: UserBriefData = {
  _id: 'mock-id',
  username: 'mockuser',
  displayname: 'Mock User',
  email: 'email',
  totalLikes: 0,
  totalFollowers: 0,
  avatar:
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
};

const UserBrief: React.FC<UserBriefProps> = ({ userData }) => {
  const [user, setUser] = useState<UserBriefData>(mockUser);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.totalFollowers);
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  const handleFollow = async () => {
    try {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
      await followUser(user._id);
      toast.success(`Followed ${user.displayname}`);
    } catch (error) {
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async () => {
    try {
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
      await unfollowUser(user._id);
      toast.info(`Unfollowed ${user.displayname}`);
    } catch (error) {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
      toast.error('Failed to unfollow user');
    }
  };

  return (
    <div className='flex justify-center items-center relative'>
      <div className='relative bg-Background/Bottom text-white w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[730px] my-3 border-Primary/Dark border-2 rounded-3xl p-5 md:p-7 lg:p-8'>
        <div className='absolute right-3 top-2'>
          <div className='relative'>
            <button
              className='hover:text-gray-300 text-white text-3xl'
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <IoIosMore />
            </button>
            {isDropdownOpen && (
              <div className='text-sm absolute left-0 top-full w-56 bg-Background/Bottom border rounded-3xl border-2 border-Primary/Dark shadow-lg z-10'>
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
        </div>

        <div className='flex flex-row w-full items-center lg:space-x-4 space-x-2'>
          <Link to={`/user/${userData?._id ?? '#'}`} className='inline-block flex-shrink-0'>
            <img
              src={user.avatar}
              alt='Profile Icon'
              className='w-16 h-16 rounded-full object-cover'
            />
          </Link>
          <Link to={`/user/${userData?._id ?? '#'}`} className='flex flex-col flex-grow min-w-0'>
            <p className='text-white font-semibold text-lg lg:text-xl truncate'>
              {user.displayname}
            </p>
            <p className='text-Primary/Light text-sm lg:text-md'>@{user.username}</p>
            {/* Followers and Likes */}
            <div className='flex gap-4 text-Primary/Light text-xs lg:text-sm mt-1'>
              {/* Followers */}
              <p className='flex items-center gap-1'>
                <AiFillHeart className='w-4 h-4 text-Accent/Light' />
                <span className='font-semibold text-white'>{formatNumber(followersCount)}</span>
              </p>

              {/* Likes */}
              <p className='flex items-center gap-1'>
                <svg
                  className='xsm:w-6 xsm:h-4 w-4 h-4 stroke-current fill-current text-Accent/Light'
                  viewBox='0 0 24 24'
                >
                  <path d='M20.0648 10.2853C20.4353 10.5586 20.7764 10.8297 20.7764 11.783C20.7764 12.7386 20.2943 13.1253 19.7785 13.3942C19.9892 13.757 20.0566 14.1928 19.9658 14.6075C19.8037 15.3719 19.1406 15.9653 18.5511 16.1408C18.8058 16.5719 18.8858 16.9964 18.5827 17.5186C18.1932 18.1742 17.8543 18.423 16.3553 18.423H10.2501C8.17005 18.423 7.09216 17.2097 7.09216 16.2008V11.0119C7.09216 8.2786 10.1806 5.95637 10.1806 4.05637L9.95742 1.68971C9.94689 1.54526 9.97426 1.19193 10.0795 1.08971C10.2479 0.914153 10.7132 0.645264 11.4164 0.645264C11.8753 0.645264 12.1806 0.736375 12.5406 0.918597C13.7637 1.53415 14.0816 3.09193 14.0816 4.34526C14.0816 4.94749 13.2101 6.75193 13.0922 7.37637C13.0922 7.37637 14.9174 6.94971 17.0479 6.93415C19.2816 6.92082 20.7301 7.35637 20.7301 8.80526C20.7301 9.38526 20.269 9.96749 20.0648 10.2853ZM2.03952 9.53415H3.72374C4.05875 9.53415 4.38003 9.67462 4.61692 9.92469C4.85382 10.1747 4.98689 10.5139 4.98689 10.8675V19.3119C4.98689 19.6655 4.85382 20.0046 4.61692 20.2548C4.38003 20.5048 4.05875 20.6453 3.72374 20.6453H2.03952C1.70451 20.6453 1.38322 20.5048 1.14733 20.2548C0.911434 20.0046 0.778358 19.6655 0.778358 19.3119V10.8675C0.778358 10.5139 0.911434 10.1747 1.14733 9.92469C1.38322 9.67462 1.70451 9.53415 2.03952 9.53415Z' />
                </svg>
                <span className='font-semibold text-white'>{formatNumber(user.totalLikes)}</span>
              </p>
            </div>
          </Link>
          <button
            className={`transition-colors font-semibold duration-300 ease-in-out w-12 md:w-20 lg:w-28 h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-md lg:text-base text-Accent/Target m-4 
        ${isFollowing ? 'bg-gray-500 text-white hover:bg-red-400' : 'bg-white hover:bg-Accent/Target hover:text-white'}`}
            onClick={isFollowing ? handleUnfollow : handleFollow}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isFollowing ? (isHovered ? 'Unfollow' : 'Followed') : 'Follow'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserBrief;

