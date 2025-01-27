import Sidebar from '../components/sidebar';
import CollapseMenu from '../components/collapseMenu';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/loadingAnimate';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PostType } from './Feed';

function Notifications() {
  const [activeComponent, setActiveComponent] = useState<'sidebar' | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Toggle dropdown visibility
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const toggleSidebar = () => {
    setActiveComponent((prev) => (prev === 'sidebar' ? null : 'sidebar'));
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!sidebarRef.current?.contains(target) && !sidebarButtonRef.current?.contains(target)) {
        setActiveComponent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
      <div className='flex flex-row'>
        <div className='flex ml-96 flex-col'>
          <div className='text-white mt-10 ml-4 space-x-2 inline-block flex lg:w-full '>
            <svg
              width='31'
              height='35'
              viewBox='0 0 31 35'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M10.8018 26.1111H5.48109C3.50922 26.1111 2.52329 26.1111 2.31584 25.9428C2.08279 25.7537 2.02585 25.6422 2.0006 25.3251C1.97815 25.0428 2.58242 23.9559 3.791 21.7825C5.03882 19.5383 6.09838 16.2707 6.09838 11.6444C6.09838 9.08658 7.0889 6.63348 8.85203 4.82479C10.6152 3.01611 13.0065 2 15.5 2C17.9934 2 20.3847 3.01611 22.1478 4.82479C23.9111 6.63348 24.9016 9.08658 24.9016 11.6444C24.9016 16.2707 25.9611 19.5383 27.209 21.7825C28.4174 23.9559 29.0218 25.0428 28.9994 25.3251C28.9742 25.6422 28.9171 25.7537 28.6841 25.9428C28.4767 26.1111 27.4908 26.1111 25.5189 26.1111H20.2008M10.8018 26.1111L10.7992 27.8333C10.7992 30.6869 12.9039 33 15.5 33C18.0962 33 20.2008 30.6869 20.2008 27.8333V26.1111M10.8018 26.1111H20.2008'
                stroke='currentColor'
                stroke-width='3'
                stroke-linecap='round'
                stroke-linejoin='round'
              />
            </svg>

            <span className='text-3xl font-semibold'>Notifications</span>
            <div className='flex justify-center flex-end'>
              <button className='text-Primary/Light text-lg hover:text-Primary/Target ml-80'>
                Marked all as read
              </button>
            </div>
          </div>
          <div className='mb-6'>
            <div className='flex flex-col'>
              <div className='flex justify-center mt-8'>
                <p className='font-semibold text-lg text-white'>Today</p>
              </div>
              <div
                className={`lg:mt-4 mx-6 sm:max-lg:mx-14 lg:mx-4 flex bg-Background/Bottom text-center mt-28 p-12 w-full h-28 border-Primary/Dark border-solid box-border border-2 rounded-3xl
    sm:max-lg:p-14 lg:max-xl:p-10 xl:p-12 lg:w-full sm:max-lg:mt-28`}
              >
                <div className='mt-1 sm:max-lg:mt-3 lg:max-xl:mt-2 xl:-mt-2'>
                  <p className='text-left text-white text-l'>
                    No notifications for now... Go explore{' '}
                    <Link to='/feed' className='text-Accent/Target cursor-pointer inline'>
                      Codemunity
                    </Link>{' '}
                    or{' '}
                    <Link to='/feed/me' className='text-Primary/Light cursor-pointer inline'>
                      share your own code
                    </Link>{' '}
                    !
                  </p>
                </div>
              </div>
              <button
                className={`lg:mt-4 mx-6 sm:max-lg:mx-14 lg:mx-4 flex bg-Background/Bottom text-center mt-28 p-12 w-full h-28 border-Primary/Light hover:border-Primary/Target border-solid box-border border-2 rounded-3xl mb-
    sm:max-lg:p-14 lg:max-xl:p-10 xl:p-12 lg:w-full sm:max-lg:mt-28`}
              >
                <div className='flex fixed -mt-10 ml-[600px] flex-col gap-y-6' ref={dropdownRef}>
                  <button className='text-white hover:text-gray-300' onClick={toggleDropdown}>
                    <svg
                      width='24'
                      height='22'
                      viewBox='0 0 24 22'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M6 12C6 13.6569 4.6569 15 3 15C1.3431 15 0 13.6569 0 12C0 10.3431 1.3431 9 3 9C4.6569 9 6 10.3431 6 12Z'
                        fill='currentColor'
                      />
                      <path
                        d='M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z'
                        fill='currentColor'
                      />
                      <path
                        d='M21 15C22.6569 15 24 13.6569 24 12C24 10.3431 22.6569 9 21 9C19.3431 9 18 10.3431 18 12C18 13.6569 19.3431 15 21 15Z'
                        fill='currentColor'
                      />
                    </svg>
                  </button>
                  {isDropdownOpen && (
                    <div className='absolute -right-48 mt-2 w-48 bg-Background/Bottom border rounded-3xl border-2 border-Primary/Dark shadow-lg z-10'>
                      <ul className='py-1 my-3 ml-2'>
                        <li>
                          <button className='block px-4 py-2 text-white hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                            Marked as read
                          </button>
                        </li>
                        <li>
                          <button className='block px-4 py-2 text-red-500 hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                  <div className='flex flex-row'>
                    <button className='-ml-9 -mt-2 text-white hover:text-Accent/Light'>
                      <svg
                        width='27'
                        height='27'
                        viewBox='0 0 27 27'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M4.16211 16.0875L10.7996 21.375L22.8371 5.625'
                          stroke='currentColor'
                          stroke-width='3'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                        />
                      </svg>
                    </button>
                    <button className='-mt-2 text-white hover:text-red-300'>
                      <svg
                        width='44'
                        height='44'
                        viewBox='0 0 44 44'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M29.3337 14.6665L14.667 29.3332M29.3337 29.3332L14.667 14.6665'
                          stroke='currentColor'
                          stroke-width='3'
                          stroke-linecap='round'
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className='flex flex-row gap-4 -ml-6 -mt-6'>
                  <div className='flex items-center '>
                    <svg
                      width='15'
                      height='15'
                      viewBox='0 0 15 15'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M13.125 7.5C13.125 10.6066 10.6066 13.125 7.5 13.125C4.3934 13.125 1.875 10.6066 1.875 7.5C1.875 4.3934 4.3934 1.875 7.5 1.875C10.6066 1.875 13.125 4.3934 13.125 7.5Z'
                        fill='#9CE1E7'
                      />
                      <path
                        d='M13.125 7.5C13.125 10.6066 10.6066 13.125 7.5 13.125C4.3934 13.125 1.875 10.6066 1.875 7.5C1.875 4.3934 4.3934 1.875 7.5 1.875C10.6066 1.875 13.125 4.3934 13.125 7.5Z'
                        stroke='#9CE1E7'
                        stroke-width='3'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                    </svg>
                  </div>
                  <div className='flex justify-center'>
                    <img
                      src={
                        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                      } // Fallback for avatar
                      alt='Avatar'
                      className='w-16 h-16 rounded-full object-cover'
                    />
                  </div>
                  <div className='flex flex-col mt-0 justify-center'>
                    <div className='flex'>
                      <p className='text-white text-lg'>
                        <span className='text-Primary/Light'>@someone</span> tagged you in a post!
                      </p>
                    </div>
                    <div className='flex'>
                      <p className='text-Accent/Light'>Just now</p>
                    </div>
                  </div>
                </div>
              </button>
              <button
                className={`lg:mt-4 mx-6 sm:max-lg:mx-14 lg:mx-4 flex bg-Background/Bottom text-center mt-28 p-12 w-full h-28 border-Primary/Light hover:border-Primary/Target border-solid box-border border-2 rounded-3xl mb-2
    sm:max-lg:p-14 lg:max-xl:p-10 xl:p-12 lg:w-full sm:max-lg:mt-28`}
              >
                <div className='flex fixed -mt-10 ml-[600px]'>
                  <button className='text-white hover:text-gray-300'>
                    <svg
                      width='24'
                      height='22'
                      viewBox='0 0 24 22'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M6 12C6 13.6569 4.6569 15 3 15C1.3431 15 0 13.6569 0 12C0 10.3431 1.3431 9 3 9C4.6569 9 6 10.3431 6 12Z'
                        fill='currentColor'
                      />
                      <path
                        d='M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z'
                        fill='currentColor'
                      />
                      <path
                        d='M21 15C22.6569 15 24 13.6569 24 12C24 10.3431 22.6569 9 21 9C19.3431 9 18 10.3431 18 12C18 13.6569 19.3431 15 21 15Z'
                        fill='currentColor'
                      />
                    </svg>
                  </button>
                </div>
                <div className='flex flex-row gap-4 -ml-6 -mt-6'>
                  <div className='flex items-center'>
                    <svg
                      width='15'
                      height='15'
                      viewBox='0 0 15 15'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M13.125 7.5C13.125 10.6066 10.6066 13.125 7.5 13.125C4.3934 13.125 1.875 10.6066 1.875 7.5C1.875 4.3934 4.3934 1.875 7.5 1.875C10.6066 1.875 13.125 4.3934 13.125 7.5Z'
                        fill='#9CE1E7'
                      />
                      <path
                        d='M13.125 7.5C13.125 10.6066 10.6066 13.125 7.5 13.125C4.3934 13.125 1.875 10.6066 1.875 7.5C1.875 4.3934 4.3934 1.875 7.5 1.875C10.6066 1.875 13.125 4.3934 13.125 7.5Z'
                        stroke='#9CE1E7'
                        stroke-width='3'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                    </svg>
                  </div>
                  <div className='flex justify-center'>
                    <img
                      src={
                        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                      } // Fallback for avatar
                      alt='Avatar'
                      className='w-16 h-16 rounded-full object-cover'
                    />
                  </div>
                  <div className='flex flex-col mt-0 justify-center'>
                    <div className='flex'>
                      <p className='text-white text-lg'>
                        <span className='text-Primary/Light'>@someone</span> tagged you in a post!
                      </p>
                    </div>
                    <div className='flex'>
                      <p className='text-Accent/Light'>Just now</p>
                    </div>
                  </div>
                </div>
              </button>
              <button
                className={`lg:mt-4 mx-6 sm:max-lg:mx-14 lg:mx-4 flex bg-Background/Bottom text-center mt-28 p-12 w-full h-28 border-Primary/Dark hover:border-opacity-60 border-solid box-border border-2 rounded-3xl mb-2
    sm:max-lg:p-14 lg:max-xl:p-10 xl:p-12 lg:w-full sm:max-lg:mt-28`}
              >
                <div className='flex fixed -mt-10 ml-[600px]'>
                  <button className='text-white hover:text-gray-300'>
                    <svg
                      width='24'
                      height='22'
                      viewBox='0 0 24 22'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M6 12C6 13.6569 4.6569 15 3 15C1.3431 15 0 13.6569 0 12C0 10.3431 1.3431 9 3 9C4.6569 9 6 10.3431 6 12Z'
                        fill='currentColor'
                      />
                      <path
                        d='M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z'
                        fill='currentColor'
                      />
                      <path
                        d='M21 15C22.6569 15 24 13.6569 24 12C24 10.3431 22.6569 9 21 9C19.3431 9 18 10.3431 18 12C18 13.6569 19.3431 15 21 15Z'
                        fill='currentColor'
                      />
                    </svg>
                  </button>
                </div>
                <div className='flex flex-row gap-4 -ml-6 -mt-6'>
                  <div className='flex items-center invisible'>
                    <svg
                      width='15'
                      height='15'
                      viewBox='0 0 15 15'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M13.125 7.5C13.125 10.6066 10.6066 13.125 7.5 13.125C4.3934 13.125 1.875 10.6066 1.875 7.5C1.875 4.3934 4.3934 1.875 7.5 1.875C10.6066 1.875 13.125 4.3934 13.125 7.5Z'
                        fill='#9CE1E7'
                      />
                      <path
                        d='M13.125 7.5C13.125 10.6066 10.6066 13.125 7.5 13.125C4.3934 13.125 1.875 10.6066 1.875 7.5C1.875 4.3934 4.3934 1.875 7.5 1.875C10.6066 1.875 13.125 4.3934 13.125 7.5Z'
                        stroke='#9CE1E7'
                        stroke-width='3'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                    </svg>
                  </div>
                  <div className='flex justify-center'>
                    <img
                      src={
                        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                      } // Fallback for avatar
                      alt='Avatar'
                      className='w-16 h-16 rounded-full object-cover'
                    />
                  </div>
                  <div className='flex flex-col mt-0 justify-center'>
                    <div className='flex'>
                      <p className='text-white text-lg'>
                        <span className='text-Primary/Light'>@someone</span> tagged you in a post!
                      </p>
                    </div>
                    <div className='flex'>
                      <p className='text-Accent/Light'>Just now</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className='flex flex-col ml-32 mt-28'>
          <div className='flex gap-24 mb-4 ml-2'>
            <button className='text-white text-lg font-semibold  hover:text-gray-300'>All</button>

            <button className='text-white text-lg font-semibold  hover:text-gray-300'>
              Unread (1)
            </button>
          </div>
          <div className=' flex flex-col gap-4'>
            <button className='text-Primary/Light hover:text-Primary/Target px-4 py-2 text-lg bg-Background/Bottom border-Primary/Dark border-solid box-border border-2 rounded-3xl text-white'>
              Following
            </button>
            <button className='text-Primary/Light hover:text-Primary/Target px-4 py-2 text-lg bg-Background/Bottom border-Primary/Dark border-solid box-border border-2 rounded-3xl text-white'>
              System
            </button>
            <button className='text-Primary/Light hover:text-Primary/Target px-4 py-2 text-lg bg-Background/Bottom border-Primary/Dark border-solid box-border border-2 rounded-3xl text-white'>
              Groups
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={activeComponent === 'sidebar'}
          state='notifications'
          onClose={() => setActiveComponent(null)}
        />
      </div>

      {/* CollapseMenu */}
      <CollapseMenu
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={activeComponent === 'sidebar'}
        isTagListVisible={false} // Disable TagList
        sidebarButtonRef={sidebarButtonRef}
      />
    </div>
  );
}
export default Notifications;

