import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePinned } from '../context/PinnedContext';
import { PinnedItem } from '../services/pinService';
import { TbChartBarPopular, TbClockHour4, TbPinned } from 'react-icons/tb';
import { FaUserGroup } from 'react-icons/fa6';
import { AiFillHeart } from 'react-icons/ai';
const GroupButton: React.FC<PinnedItem & { onUnpin?: () => void; onClose: () => void }> = ({
  avatar,
  name,
  id,
  pinType: type,
  total,
  onUnpin,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (type === 'user') navigate(`/user/${id}`);
    else if (type === 'group') navigate(`/group/${id}`);
    else if (type === 'project') navigate(`/project/${id}`);
    else if (type === 'section') navigate(`/section/${id}`);
    onClose();
  };

  return (
    <div className='flex items-center justify-between relative w-full'>
      {/* Left: Avatar + Name */}
      <button onClick={handleClick} className='flex items-center space-x-3 flex-grow'>
        <img
          src={
            avatar ||
            'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
          }
          alt={`${name} Avatar`}
          className='w-10 h-10 rounded-full object-cover'
        />
        <div className='flex flex-col justify-between'>
          <p className='text-lg text-white break-words leading-tight text-left'>{name}</p>
          {total && (
            <div className='flex items-center space-x-1'>
              {type === 'user' ? (
                <AiFillHeart className='text-Accent/Light text-xs' /> // Display this if pinType is 'users'
              ) : (
                <FaUserGroup className='text-Accent/Light text-xs' /> // Display this for all other pinTypes
              )}
              <span className='text-white text-sm'>{total}</span>
            </div>
          )}
        </div>
      </button>

      {/* Right: Unpin Button (only if onUnpin is provided) */}
      {onUnpin && (
        <button
          onClick={onUnpin}
          className='text-white text-xl hover:text-red-500 absolute right-10 top-1/2 transform -translate-y-1/2 p-2'
        >
          ×
        </button>
      )}
    </div>
  );
};

type QuickNavProps = {
  isOpen: boolean;
  onClose: () => void;
};

const QuickNav: React.FC<QuickNavProps> = ({ isOpen, onClose }) => {
  const { pinnedItems, popularItems, recentItems, unPin } = usePinned();

  return (
    <div
      className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent overflow-x-hidden fixed sm:fixed max-h-[800px] flex-col top-24 lg:mr-[1vw] sm:max-lg:top-24 lg:top-40 right-0 flex bg-Background/Bottom text-center w-[260px] lg:w-[22vw] xl:w-[19vw] h-3/5 pt-4 pl-2 min-h-[320px] rounded-3xl border-Primary/Dark border-solid box-border border-2 z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } lg:translate-x-0 sm:static xl:pl-4`}
    >
      {pinnedItems?.length > 0 && (
        <>
          <div className='flex items-center m-3 text-gray-300'>
            <TbPinned className='text-xl' /> {/* Use an appropriate icon if needed */}
            <p className='text-lg font-semibold ml-3'>Pinned</p>
          </div>
          <div className='ml-10 space-y-2'>
            {pinnedItems.map((item, index) => (
              <GroupButton key={item.id} {...item} onUnpin={() => unPin(index)} onClose={onClose} />
            ))}
          </div>
        </>
      )}

      {/* Popular Items */}
      {popularItems?.length > 0 && (
        <>
          <div className='flex items-center m-3 text-gray-300'>
            <TbChartBarPopular className='text-xl' />
            <p className=' text-lg font-semibold ml-3'>Popular</p>
          </div>
          <div className='ml-10 space-y-2'>
            {popularItems.map((item) => (
              <GroupButton key={item.id} {...item} onClose={onClose} />
            ))}
          </div>
        </>
      )}

      {/* Recent Items */}
      {recentItems?.length > 0 && (
        <>
          <div className='flex items-center m-3 text-gray-300'>
            <TbClockHour4 className='text-xl' />
            <p className=' text-lg font-semibold ml-3'>Recent</p>
          </div>
          <div className='ml-10 space-y-2'>
            {recentItems.map((item) => (
              <GroupButton key={item.id} {...item} onClose={onClose} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default QuickNav;

