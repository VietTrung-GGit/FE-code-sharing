import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { UserBriefData, followUser, unfollowUser } from '../services/userService';
import { IoIosMore } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { AiFillHeart, AiOutlineUserDelete } from 'react-icons/ai';
import { formatNumber } from '../utils/helpers';
import { GrUserAdmin } from 'react-icons/gr';
import { useAuthUser } from '../context/AuthUserContext';
import { usePinned } from '../context/PinnedContext';
import { assignGroupAdmin, removeGroupAdmin, removeGroupMember } from '../services/groupService';
import {
  assignProjectAdmin,
  removeProjectAdmin,
  removeProjectMember,
  removeSectionParticipant,
} from '../services/projectService';
import { TbPin, TbPinnedOff } from 'react-icons/tb';
import { useTheme } from '../context/ThemeContext';

interface UserBriefProps {
  userData: UserBriefData;
  group?: string;
  project?: string;
  section?: string;
  role?: string;
  decreaseMember?: () => void;
}

const UserBrief: React.FC<UserBriefProps> = ({
  userData,
  group,
  project,
  section,
  role,
  decreaseMember,
}) => {
  const [user, setUser] = useState<UserBriefData>(userData);
  const { pin, unPin, isPinned } = usePinned();
  const [isFollowing, setIsFollowing] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { user: homeuser } = useAuthUser();
  const { theme } = useTheme();
  const alreadyPinned = user._id ? isPinned('user', user._id) : false;
  const [pinned, setPinned] = useState(alreadyPinned);
  const handlePinToggle = () => {
    if (pinned) {
      unPin(undefined, user._id);
    } else {
      pin('user', user._id);
    }
    setPinned((prev) => !prev);
  };

  useEffect(() => {
    setIsFollowing(userData.followed);
    setFollowersCount(userData.totalFollowers);
  }, []);

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

  const handleRemoveUser = async () => {
    try {
      if (group) {
        await removeGroupMember(group, user._id);
        toast.success(`${user.displayname} has been removed from the group`);
      } else if (project) {
        await removeProjectMember(project, user._id);
        toast.success(`${user.displayname} has been removed from the project`);
      } else if (section) {
        await removeSectionParticipant(section, user._id);
        toast.success(`${user.displayname} has been removed from the section`);
      }
      setIsVisible(false);
      if (decreaseMember) {
        decreaseMember();
      }
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };

  const handleRemoveUserFromAll = async () => {
    try {
      if (section) {
        await removeGroupMember(section, user._id);
        toast.success(`${user.displayname} has been removed from the group`);
        setIsVisible(false);
      }
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };

  const dropdownConfigRef = useRef<HTMLDivElement>(null);
  const handleOptionSelect = () => {
    setIsDropdownOpen(false); // Close after selection
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownConfigRef.current && !dropdownConfigRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='flex justify-center items-center relative'>
      {isVisible && (
        <div
          className={`${
            theme === 'original'
              ? 'bg-Background/Bottom text-white lg:border-2'
              : 'bg-[var(--surface)] text-[var(--text)]'
          } relative w-[94vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[730px] my-3 border-Primary/Dark rounded-3xl p-5 md:p-7 lg:p-8`}
        >
          {homeuser && homeuser._id !== user._id && (
            <div className='absolute right-3 top-2 h-6' ref={dropdownConfigRef}>
              <>
                <button
                  className='hover:text-[var(--text-hovered)]  text-3xl'
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <IoIosMore />
                </button>
                {isDropdownOpen && (
                  <div
                    className={`${
                      theme === 'original'
                        ? 'bg-Background/Bottom text-white'
                        : 'bg-[var(--surface)] text-[var(--text)]'
                    } border border-[var(--border)]  text-sm absolute right-0 lg:left-0 lg:right-full top-full w-56 rounded-xl shadow-lg z-10`}
                  >
                    <ul className='py-1 my-2'>
                      {/* Assign Admin */}
                      <li>
                        <button
                          className='block px-4 py-2 w-full text-left flex items-center gap-4 hover:bg-[var(--background-hovered)]  transition'
                          onClick={() => {
                            handlePinToggle(), handleOptionSelect();
                          }}
                        >
                          {pinned ? (
                            <TbPinnedOff className='text-lg lg:text-xl' />
                          ) : (
                            <TbPin className='text-lg lg:text-xl' />
                          )}

                          {pinned ? 'Unpin' : 'Pin'}
                        </button>
                      </li>

                      {user.role === 'member' &&
                        (role === 'admin' || role === 'creator' || role === 'leader') && (
                          <li>
                            <button
                              className='block px-4 py-2  hover:bg-[var(--background-hovered)]  w-full text-left flex flex-row gap-4'
                              onClick={async () => {
                                try {
                                  if (group) {
                                    await assignGroupAdmin(group, user._id);
                                  } else if (project) {
                                    await assignProjectAdmin(project, user._id);
                                  }
                                  setUser((prev) => ({ ...prev, role: 'admin' })); // Update role to admin
                                  toast.success(`${user.displayname} is now an admin`);
                                } catch (error) {
                                  toast.error('Failed to assign admin');
                                }
                              }}
                            >
                              <GrUserAdmin className='text-2xl' />
                              Assign as an admin
                            </button>
                          </li>
                        )}

                      {/* Remove Admin */}
                      {(role === 'creator' || role === 'leader') && user.role === 'admin' && (
                        <li>
                          <button
                            className='block px-4 py-2  hover:bg-[var(--background-hovered)]  w-full text-left flex flex-row gap-4'
                            onClick={async () => {
                              try {
                                if (group) {
                                  await removeGroupAdmin(group, user._id);
                                } else if (project) {
                                  await removeProjectAdmin(project, user._id);
                                }
                                setUser((prev) => ({ ...prev, role: 'member' })); // Revert role to member
                                toast.success(`${user.displayname} is no longer an admin`);
                              } catch (error) {
                                toast.error('Failed to remove admin permission');
                              }
                            }}
                          >
                            <GrUserAdmin className='text-2xl' />
                            Remove admin permission
                          </button>
                        </li>
                      )}

                      {/* Remove from Group */}
                      {(group || project || section) &&
                        (role === 'admin' || role === 'creator' || role === 'leader') && (
                          <>
                            <li>
                              <button
                                className='block px-4 py-2 text-red-500 hover:bg-[var(--background-hovered)]  w-full text-left flex flex-row gap-4'
                                onClick={handleRemoveUser}
                              >
                                <AiOutlineUserDelete className='text-2xl' />
                                {group
                                  ? 'Remove from group'
                                  : project
                                    ? 'Remove from project'
                                    : 'Remove from this section'}
                              </button>
                            </li>
                            {section && (
                              <li>
                                <button
                                  className=' block px-4 py-2 text-red-500 hover:bg-[var(--background-hovered)]  w-full text-left flex flex-row gap-4'
                                  onClick={handleRemoveUserFromAll}
                                >
                                  <AiOutlineUserDelete className='text-2xl' />
                                  Remove from this section and all of its subsections
                                </button>
                              </li>
                            )}
                          </>
                        )}
                    </ul>
                  </div>
                )}
              </>
            </div>
          )}

          <div className='flex flex-row w-full items-center lg:space-x-4 space-x-2'>
            <Link to={`/user/${userData?._id ?? '#'}/posts`} className='inline-block flex-shrink-0'>
              <img
                src={user.avatar}
                alt='Profile Icon'
                className='w-16 h-16 rounded-full object-cover'
              />
            </Link>
            <Link
              to={`/user/${userData?._id ?? '#'}/posts`}
              className='flex flex-col flex-grow min-w-0'
            >
              <div className='flex items-end gap-2'>
                <p className=' font-semibold text-lg lg:text-xl truncate'>{user.displayname}</p>
                {userData.role && (
                  <p className='text-gray-500 font-semibold text-md lg:text-lg break-words'>
                    {userData.role !== 'member'
                      ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
                      : ''}
                  </p>
                )}
              </div>
              <p className='text-[var(text-title)] text-sm lg:text-md'>@{user.username}</p>
              <div className='flex gap-4 text-[var(text-title)] text-xs lg:text-sm mt-1'>
                <p className='flex items-center gap-1'>
                  <AiFillHeart className='w-3 xsm:w-4 h-4 text-[var(--green-highlight)]' />
                  <span className='font-semibold '>{formatNumber(followersCount) || 0}</span>
                </p>
                <p className='flex items-center '>
                  <svg
                    className='xsm:w-6 xsm:h-4 w-3 h-4  stroke-current fill-current text-[var(--green-highlight)]'
                    viewBox='0 0 24 24'
                  >
                    <path d='M20.0648 10.2853C20.4353 10.5586 20.7764 10.8297 20.7764 11.783C20.7764 12.7386 20.2943 13.1253 19.7785 13.3942C19.9892 13.757 20.0566 14.1928 19.9658 14.6075C19.8037 15.3719 19.1406 15.9653 18.5511 16.1408C18.8058 16.5719 18.8858 16.9964 18.5827 17.5186C18.1932 18.1742 17.8543 18.423 16.3553 18.423H10.2501C8.17005 18.423 7.09216 17.2097 7.09216 16.2008V11.0119C7.09216 8.2786 10.1806 5.95637 10.1806 4.05637L9.95742 1.68971C9.94689 1.54526 9.97426 1.19193 10.0795 1.08971C10.2479 0.914153 10.7132 0.645264 11.4164 0.645264C11.8753 0.645264 12.1806 0.736375 12.5406 0.918597C13.7637 1.53415 14.0816 3.09193 14.0816 4.34526C14.0816 4.94749 13.2101 6.75193 13.0922 7.37637C13.0922 7.37637 14.9174 6.94971 17.0479 6.93415C19.2816 6.92082 20.7301 7.35637 20.7301 8.80526C20.7301 9.38526 20.269 9.96749 20.0648 10.2853ZM2.03952 9.53415H3.72374C4.05875 9.53415 4.38003 9.67462 4.61692 9.92469C4.85382 10.1747 4.98689 10.5139 4.98689 10.8675V19.3119C4.98689 19.6655 4.85382 20.0046 4.61692 20.2548C4.38003 20.5048 4.05875 20.6453 3.72374 20.6453H2.03952C1.70451 20.6453 1.38322 20.5048 1.14733 20.2548C0.911434 20.0046 0.778358 19.6655 0.778358 19.3119V10.8675C0.778358 10.5139 0.911434 10.1747 1.14733 9.92469C1.38322 9.67462 1.70451 9.53415 2.03952 9.53415Z' />
                  </svg>
                  <span className='font-semibold '>{formatNumber(user.totalLikes) || 0}</span>
                </p>
              </div>
            </Link>

            {homeuser && homeuser._id !== user._id && (
              <button
                className={`transition-colors font-semibold duration-300 ease-in-out w-20 md:w-20 lg:w-28 h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-md lg:text-base 
              ${
                theme === 'original'
                  ? isFollowing
                    ? 'bg-[var(--button-active)] hover:bg-red-400 text-white'
                    : 'bg-white hover:bg-Accent/Target hover:text-white text-Accent/Target'
                  : isFollowing
                    ? 'bg-[var(--button-active)] text-[var(--text-selected)] border-[1px] border-[var(--border)]'
                    : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'
              }`}
                onClick={isFollowing ? handleUnfollow : handleFollow}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {isFollowing ? (isHovered ? 'Unfollow' : 'Followed') : 'Follow'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBrief;

