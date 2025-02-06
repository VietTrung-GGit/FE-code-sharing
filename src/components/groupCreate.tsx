import { AiFillPlusCircle } from 'react-icons/ai';
import { MdOutlinePublicOff, MdOutlinePublic } from 'react-icons/md';
import { TbFlag, TbFlagOff } from 'react-icons/tb';
import { useState, useEffect, useRef } from 'react';
function GroupCreate() {
  const [activeDropdown, setActiveDropdown] = useState<'privacy' | 'moderation' | null>(null);

  const [privacySetting, setPrivacySetting] = useState<'Public' | 'Private'>('Public');

  const [moderationSetting, setModerationSetting] = useState<'Required' | 'None'>('None');
  const dropdownRef = useRef<HTMLButtonElement>(null);
  // Close dropdowns when clicking outside
  // Close dropdowns when clicking outside
  const handleSelect = (
    type: 'privacy' | 'moderation',
    value: 'Public' | 'Private' | 'Required' | 'None',
  ) => {
    if (type === 'privacy') {
      setPrivacySetting(value as 'Public' | 'Private');
    } else {
      setModerationSetting(value as 'Required' | 'None');
    }

    // Wait for the state update before closing the dropdown
    setTimeout(() => {
      setActiveDropdown(null);
    }, 0);
  };

  return (
    <div
      className='bg-Background/Bottom bg-center bg-cover border-2 h-[660px]  border-Primary/Dark px-14 py-10 w-[700px] flex flex-col rounded-3xl sm:max-lg:rounded-3xl  lg:mt-4 lg:rounded-3xl
        border-solid box-border relative'
    >
      <p className=' text-white font-semibold text-left text-2xl'>New group</p>

      <div className='inline-block flex-shrink-0 flex-row flex mt-8 space-x-8'>
        <img
          src={
            'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
          }
          alt='Profile Icon'
          className='w-40 h-40 rounded-3xl object-cover'
        />
        <div className='flex flex-col -mt-2 '>
          <div className='space-y-4'>
            <input
              type='text'
              placeholder='Title'
              className='w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 '
            />
            <input
              type='text'
              placeholder='Description'
              className='w-full h-28 mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 '
            />
          </div>
        </div>
      </div>
      <div className='mt-8 space-y-2'>
        <p className='text-xl text-Primary/Light'>Privacy setting</p>
        <button
          className='w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 relative'
          onClick={(e) => {
            e.stopPropagation(); // Prevent click from triggering outside event
            setActiveDropdown((prev) => (prev === 'privacy' ? null : 'privacy'));
          }}
        >
          <div className='flex gap-3 flex-row items-center'>
            {privacySetting === 'Public' ? (
              <MdOutlinePublic className='text-2xl' />
            ) : (
              <MdOutlinePublicOff className='text-2xl' />
            )}

            <p className='text-lg text-white '>{privacySetting}</p>
            <div className='absolute right-4 top-4'>
              <svg
                width='20'
                height='10'
                viewBox='0 0 20 10'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path d='M0 0L10 10L20 0H0Z' fill='white' />
              </svg>
            </div>
          </div>
        </button>
      </div>
      <div className='mt-8 space-y-2'>
        <p className='text-xl text-Primary/Light '>Post moderation setting</p>
        <button
          className='w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 relative'
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown((prev) => (prev === 'moderation' ? null : 'moderation'));
          }}
        >
          <div className='flex gap-3 flex-row items-center'>
            {moderationSetting === 'None' ? (
              <TbFlagOff className='text-2xl' />
            ) : (
              <TbFlag className='text-2xl' />
            )}

            <p className='text-lg text-white'>{moderationSetting}</p>

            <div className='absolute right-4 top-4'>
              <svg
                width='20'
                height='10'
                viewBox='0 0 20 10'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path d='M0 0L10 10L20 0H0Z' fill='white' />
              </svg>
            </div>
          </div>
        </button>
      </div>
      <button className='transition-colors duration-300 ease-in-out w-28 h-8 rounded-xl bg-Accent/Target text-lg text-white mb-4 hover:bg-white hover:text-Accent/Target absolute bottom-10 right-14 flex flex-row gap-2 px-6 items-center'>
        <p>New</p>
        <AiFillPlusCircle className=' text-2xl mt-1' />
      </button>
      {activeDropdown === 'privacy' && (
        <div className='absolute left-[55px] bottom-36 w-[588px] bg-gray-800 text-white rounded-md border-2 border-Primary/Dark shadow-lg z-10'>
          <ul className='py-1 my-3 ml-2'>
            <li>
              <button
                className='block px-4 py-2 text-white hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
                onClick={() => handleSelect('privacy', 'Public')}
              >
                <div className='flex gap-3 flex-row items-center'>
                  <MdOutlinePublic className='text-2xl' />
                  <p className='text-lg text-white '>Public</p>
                </div>
              </button>
            </li>
            <li>
              <button
                className='block px-4 py-2 text-white hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
                onClick={() => handleSelect('privacy', 'Private')}
              >
                <div className='flex gap-3 flex-row items-center'>
                  <MdOutlinePublicOff className='text-2xl' />
                  <p className='text-lg text-white '>Private</p>
                </div>
              </button>
            </li>
          </ul>
        </div>
      )}
      {activeDropdown === 'moderation' && (
        <div className='absolute left-[55px] bottom-8 w-[588px] bg-gray-800 text-white rounded-md border-2 border-Primary/Dark shadow-lg z-10'>
          <ul className='py-1 my-3 ml-2'>
            <li>
              <button
                className='block px-4 py-2 text-white hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
                onClick={() => handleSelect('moderation', 'None')}
              >
                <div className='flex gap-3 flex-row items-center'>
                  <TbFlagOff className='text-2xl' />
                  <p className='text-lg text-white '>None</p>
                </div>
              </button>
            </li>
            <li>
              <button
                className='block px-4 py-2 text-white hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
                onClick={() => handleSelect('moderation', 'Required')}
              >
                <div className='flex gap-3 flex-row items-center'>
                  <TbFlag className='text-2xl' />
                  <p className='text-lg text-white '>Required</p>
                </div>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
export default GroupCreate;

