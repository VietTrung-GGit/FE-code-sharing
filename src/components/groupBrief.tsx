import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { GroupDataBrief, joinGroup, leaveGroup } from '../services/groupService';
import { useAuthUser } from '../context/AuthUserContext';
import { formatNumber } from '../utils/helpers';
import { FaUserGroup } from 'react-icons/fa6';
import { BsFileCodeFill } from 'react-icons/bs';
import { Tooltip } from 'react-tooltip';
import { IoIosMore } from 'react-icons/io';
import { usePinned } from '../context/PinnedContext';
import { TbPin, TbPinnedOff } from 'react-icons/tb';
import { useTheme } from '../context/ThemeContext';
import { MdOutlinePublicOff } from 'react-icons/md';
interface GroupBriefProps {
  userId: string;
  groupData?: GroupDataBrief;
}

const mockGroup: GroupDataBrief = {
  _id: 'mock-id',
  name: 'Mock Group',
  bio: 'hi',
  joined: false,
  private: false,
  totalPosts: 0,
  totalMembers: 0,
  creator: '1',
  avatar: import.meta.env.VITE_DEFAULT_AVATAR,
  visibleMembers: [
    import.meta.env.VITE_DEFAULT_AVATAR,
    import.meta.env.VITE_DEFAULT_AVATAR,
    import.meta.env.VITE_DEFAULT_AVATAR,
  ],
};

const GroupBrief: React.FC<GroupBriefProps> = ({ userId, groupData }) => {
  const [group, setGroup] = useState<GroupDataBrief>(mockGroup);
  const { theme } = useTheme();
  const [joined, setJoined] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const { user } = useAuthUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { pin, isPinned, unPin } = usePinned();
  const alreadyPinned = group._id ? isPinned('group', group._id) : false;
  const [pinned, setPinned] = useState(alreadyPinned);
  const handlePinToggle = () => {
    if (pinned) {
      unPin(undefined, group._id);
    } else {
      pin('group', group._id);
    }
    setIsDropdownOpen(false);
    setPinned((prev) => !prev);
  };

  useEffect(() => {
    if (groupData) {
      setGroup(groupData);
      setJoined(groupData.joined);
      setMemberCount(groupData.totalMembers);
    }
  }, [groupData]);

  const handleJoin = async () => {
    try {
      setJoined(true);
      setMemberCount((prev) => prev + 1);
      await joinGroup(group._id);
      toast.success(`Joined group: ${group.name}`);
    } catch (error) {
      setJoined(false);
      setMemberCount((prev) => prev - 1);
      toast.error('Failed to join group!');
    }
  };

  const handleLeave = async () => {
    try {
      setJoined(false);
      setMemberCount((prev) => prev - 1);
      await leaveGroup(group._id);
      toast.info(`Left group: ${group.name}`);
    } catch (error) {
      setMemberCount((prev) => prev + 1);
      setJoined(true);
      toast.error('Failed to leave group');
    }
  };
  const textGroupRef = useRef<HTMLParagraphElement>(null);

  const [isGroupnameOverflowing, setIsGroupnameOverflowing] = useState(false);
  const checkOverflow = () => {
    if (textGroupRef.current) {
      setIsGroupnameOverflowing(
        textGroupRef.current.scrollWidth > textGroupRef.current.clientWidth,
      );
    }
  };
  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [group.name]);

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
      <div
        className={`${
          theme === 'original'
            ? 'bg-Background/Bottom text-white border-2'
            : 'bg-[var(--surface)] text-[var(--text)]'
        } border-Primary/Dark relative min-h-max break-all w-[94vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[730px] my-3 rounded-3xl p-5 md:p-7 lg:p-8`}
      >
        <div className='absolute right-3 top-2 h-6' ref={dropdownConfigRef}>
          {group && (
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
                        className='block px-4 py-2 w-full text-left flex items-center gap-4  hover:bg-[var(--background-hovered)]  transition'
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
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div className='flex items-center w-full space-x-4'>
          {/* Group Avatar */}
          <Link to={`/group/${groupData?._id ?? '#'}/posts`} className='flex-shrink-0 relative'>
            <img
              src={group.avatar || import.meta.env.VITE_DEFAULT_AVATAR}
              alt='Group Icon'
              className='w-12 h-12 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-lg sm:rounded-xl lg:rounded-3xl object-cover'
            />
            {group.private && (
              <MdOutlinePublicOff className='text-xl lg:text-3xl absolute bottom-0 right-0' />
            )}
          </Link>

          {/* Group Info */}
          <div className='flex flex-col w-full'>
            {' '}
            <Link to={`/group/${groupData?._id ?? '#'}/posts`}>
              <p
                className='w-[20vw] xsm:w-[25vw] sm:w-[35vw] lg:w-[15vw] xl:w-full font-semibold text-lg md:text-2xl gap-2 truncate'
                ref={textGroupRef}
              >
                {isGroupnameOverflowing ? `${group.name.slice(0, 10)}...` : group.name}
              </p>
            </Link>
            <div className='flex gap-4 text-[var(--blue-highlight)] text-xs lg:text-sm mt-1'>
              <p className='flex items-center gap-1'>
                <FaUserGroup className='w-4 h-4 text-[var(--green-highlight)]' />
                <span className='font-semibold  '>{formatNumber(memberCount) || 0}</span>
              </p>
              <p className='flex items-center gap-1'>
                <BsFileCodeFill className='w-4 h-4 text-[var(--green-highlight)]' />
                <span className='font-semibold  '>{formatNumber(group.totalPosts) || 0}</span>
              </p>
            </div>
            {/* Avatar Members */}
            <div className='flex space-x-1 mt-2'>
              {group.visibleMembers.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`Member ${index + 1}`}
                  className='w-6 h-6 lg:w-8 lg:h-8 rounded-full object-cover'
                />
              ))}
            </div>
          </div>

          {user && (!group.private || joined) && group.creator != userId && (
            <button
              className={`hidden xxsm:block transition-colors duration-300 ease-in-out w-20 md:w-28 xl:w-32 h-6 md:h-8 rounded-xl text-sm sm:text-base m-4 font-semibold flex-shrink-0
              ${
                theme === 'original'
                  ? joined
                    ? 'bg-[var(--button-active)] hover:bg-red-400 text-white'
                    : 'bg-white hover:bg-Accent/Target hover:text-white text-Accent/Target'
                  : joined
                    ? 'bg-[var(--button-active)] text-[var(--text-selected)] border-[1px] border-[var(--border)]'
                    : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'
              }`}
              onClick={joined ? handleLeave : handleJoin}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {joined ? (isHovered ? 'Leave' : 'Joined') : 'Join'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupBrief;

