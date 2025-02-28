import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePinned } from '../context/PinnedContext';
import { PinnedItem } from '../services/pinService';
import { TbChartBarPopular, TbClockHour4, TbPinned } from 'react-icons/tb';
import { FaUserGroup } from 'react-icons/fa6';
import { AiFillHeart } from 'react-icons/ai';
import { useTheme } from '../context/ThemeContext';
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

  const textRef = useRef<HTMLButtonElement>(null);

  const [isTextOverflowing, setIsTextOverflowing] = useState(false);
  const checkOverflow = () => {
    if (textRef.current) {
      setIsTextOverflowing(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  };
  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [name]);
  return (
    <div className='flex items-center justify-between relative w-5/6 hover:bg-[var(--background-hovered)] text-[var(--text)] hover:text-[var(--text-hovered)] py-1 px-2 rounded-xl'>
      {/* Left: Avatar + Name */}
      <button onClick={handleClick} className='flex items-center space-x-3 flex-grow' ref={textRef}>
        <img
          src={avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
          alt={`${name} Avatar`}
          className='w-10 h-10 rounded-full object-cover'
        />
        <div className='flex flex-col justify-between'>
          <p className='text-md leading-tight text-left truncate'>
            {isTextOverflowing ? `${name.slice(0, 14)}...` : name}
          </p>
          {total && (
            <div className='flex items-center space-x-1'>
              {type === 'user' ? (
                <AiFillHeart className='text-[var(--green-highlight)] text-xs' /> // Display this if pinType is 'users'
              ) : (
                <FaUserGroup className='text-[var(--green-highlight)] text-xs' /> // Display this for all other pinTypes
              )}
              <span className='text-sm'>{total}</span>
            </div>
          )}
        </div>
      </button>

      {/* Right: Unpin Button (only if onUnpin is provided) */}
      {onUnpin && (
        <button
          onClick={onUnpin}
          className='text-xl hover:text-red-400 absolute right-0 top-1/2 transform -translate-y-1/2 p-2'
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
  const { theme } = useTheme();

  return (
    <div
      className={`bg-[var(--background-side)] border-2 border-[var(--border)] 
    overflow-y-auto scrollbar overflow-x-hidden fixed sm:fixed 
    max-h-[800px] flex-col top-24 lg:mr-[1vw] sm:max-lg:top-24 
    lg:top-40 right-0 flex text-center w-[260px] lg:w-[22vw] 
    xl:w-[19vw] h-3/5 pt-4 pl-2 min-h-[320px] rounded-3xl border-solid 
    box-border transition-transform duration-300 ease-in-out" ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } lg:translate-x-0 sm:static xl:pl-4`}
    >
      {pinnedItems?.length > 0 && (
        <>
          <div className='flex items-center m-3 text-[var(--text-title)]'>
            <TbPinned className='text-xl' />
            <p className='text-lg font-semibold ml-3'>Pinned</p>
          </div>
          <div className='ml-9 space-y-2'>
            {pinnedItems
              .slice()
              .reverse()
              .map((item, index) => (
                <GroupButton
                  key={item.id}
                  {...item}
                  onUnpin={() => unPin(pinnedItems.length - 1 - index)} // Adjust index for original order
                  onClose={onClose}
                />
              ))}
          </div>
        </>
      )}

      {/* Popular Items */}
      {popularItems?.length > 0 && (
        <>
          <div className='flex items-center m-3 text-[var(--text-title)]'>
            <TbChartBarPopular className='text-xl' />
            <p className=' text-lg font-semibold ml-3'>Popular</p>
          </div>
          <div className='ml-9 space-y-2'>
            {popularItems.map((item) => (
              <GroupButton key={item.id} {...item} onClose={onClose} />
            ))}
          </div>
        </>
      )}

      {/* Recent Items */}
      {recentItems?.length > 0 && (
        <>
          <div className='flex items-center m-3 text-[var(--text-title)]'>
            <TbClockHour4 className='text-xl' />
            <p className=' text-lg font-semibold ml-3'>Recent</p>
          </div>
          <div className='ml-9 space-y-2'>
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

