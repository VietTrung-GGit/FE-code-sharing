import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { GroupDataBrief, joinGroup, leaveGroup } from '../services/groupService';

interface GroupBriefProps {
  groupData?: GroupDataBrief;
}

const mockGroup: GroupDataBrief = {
  _id: 'mock-id',
  name: 'Mock Group',
  bio: 'hi',
  private: false,
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

  useEffect(() => {
    if (groupData) {
      setGroup(groupData);
    }
  }, [groupData]);

  const handleJoin = async () => {
    try {
      setJoined(true);
      await joinGroup(group._id);
      toast.success(`Joined group: ${group.name}`);
    } catch (error) {
      setJoined(false);
      toast.error('Failed to join group');
    }
  };

  const handleLeave = async () => {
    try {
      setJoined(false);
      await leaveGroup(group._id);
      toast.info(`Left group: ${group.name}`);
    } catch (error) {
      setJoined(true);
      toast.error('Failed to leave group');
    }
  };

  return (
    <div className='flex justify-center items-center relative'>
      <div className='bg-Background/Bottom text-white w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[730px] my-3 border-Primary/Dark border-2 rounded-3xl p-5 md:p-7 lg:p-8'>
        <div className='flex items-center w-full space-x-4'>
          {/* Group Avatar */}
          <div className='flex-shrink-0'>
            <img
              src={
                group.avatar ||
                'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
              }
              alt='Group Icon'
              className='w-28 h-28 rounded-3xl object-cover'
            />
          </div>

          {/* Group Info */}
          <div className='flex flex-col justify-center flex-grow'>
            <p className='text-white font-semibold text-2xl'>{group.name}</p>
            {/* Avatar Members */}
            {group.visibleMembers && (
              <div className='flex space-x-1 mt-2'>
                {group.visibleMembers.map((avatar, index) => (
                  <img
                    key={index}
                    src={
                      avatar ||
                      'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                    }
                    alt={`Member ${index + 1}`}
                    className='w-8 h-8 rounded-full object-cover'
                  />
                ))}
              </div>
            )}
          </div>

          {/* Join/Leave Button */}
          <button
            onClick={joined ? handleLeave : handleJoin}
            className={`transition-colors duration-300 ease-in-out w-32 h-8 rounded-xl text-md text-Accent/Target m-4 font-semibold
              ${joined ? 'bg-gray-500 text-white hover:bg-red-400' : 'bg-white hover:bg-Accent/Target hover:text-white'}`}
          >
            {joined ? 'Leave' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupBrief;

