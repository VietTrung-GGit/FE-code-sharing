import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { GroupDataBrief, joinGroup, leaveGroup } from '../services/groupService';
import { useAuthUser } from '../context/AuthUserContext';
import { formatNumber } from '../utils/helpers';
import { FaUserGroup } from 'react-icons/fa6';
import { BsFileCodeFill } from 'react-icons/bs';
import { Tooltip } from 'react-tooltip';
interface GroupBriefProps {
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
  avatar:
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
  visibleMembers: [
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
  ],
};

const GroupBrief: React.FC<GroupBriefProps> = ({ groupData }) => {
  const [group, setGroup] = useState<GroupDataBrief>(mockGroup);
  const [joined, setJoined] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const { user } = useAuthUser();
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
      toast.error('Failed to join group');
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
  const textGroupRef = useRef<HTMLDivElement>(null);
  
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
  return (
    <div className='flex justify-center items-center relative'>
      <div className='bg-Background/Bottom text-white w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[730px] my-3 border-Primary/Dark border-2 rounded-3xl p-5 md:p-7 lg:p-8'>
        <div className='flex items-center w-full space-x-4'>
          {/* Group Avatar */}
          <Link to={`/group/${groupData?._id ?? '#'}`} className='flex-shrink-0'>
            <img
              src={
                group.avatar ||
                'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
              }
              alt='Group Icon'
              className='w-28 h-28 rounded-3xl object-cover'
            />
          </Link>

          {/* Group Info */}
          <div className='flex flex-col -mt-4 flex-grow '>
            {' '}
            <Link to={`/group/${groupData?._id ?? '#'}`}>
              <div
                className='w-[15vw] sm:w-full lg:w-[15vw] xl:w-full'
                ref={textGroupRef}
                data-tooltip-id='groupname'
                data-tooltip-content={group.name}
                data-tooltip-place='bottom-start'
              >
                <p className='text-white font-semibold text-2xl truncate'>
                  {isGroupnameOverflowing ? `${group.name.slice(0, 10)}...` : group.name}
                </p>
                <Tooltip id='groupname' classNameArrow='noArrow' />
              </div>
            </Link>
            <div className='flex gap-4 text-Primary/Light text-xs lg:text-sm mt-1'>
              <p className='flex items-center gap-1'>
                <FaUserGroup className='w-4 h-4 text-Accent/Light' />
                <span className='font-semibold text-white'>{formatNumber(memberCount) || 0}</span>
              </p>
              <p className='flex items-center gap-1'>
                <BsFileCodeFill className='w-4 h-4 text-Accent/Light' />
                <span className='font-semibold text-white'>
                  {formatNumber(group.totalPosts) || 0}
                </span>
              </p>
            </div>
            {/* Avatar Members */}
            {group.visibleMembers && (
              <div className='flex mt-2 relative'>
                {group.visibleMembers.map((avatar, index) => (
                  <img
                    key={index}
                    src={
                      avatar ||
                      'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                    }
                    alt={`Member ${index + 1}`}
                    className='w-8 h-8 rounded-full object-cover absolute border-2 border-Background/Bottom'
                    style={{ left: `${index * 20}px` }}
                  />
                ))}
              </div>
            )}
          </div>

          {user && (
            <button
              className={`transition-colors duration-300 ease-in-out w-28 xl:w-32 h-8 rounded-xl text-md text-Accent/Target m-4 font-semibold flex-shrink-0
              ${joined ? 'bg-gray-500 text-white hover:bg-red-400' : 'bg-white hover:bg-Accent/Target hover:text-white'}`}
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

