import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuthUser } from '../context/AuthUserContext';
import Logo from '../assets/logo.svg';
import { useNotifications } from '../context/NotificationContext';
import { FaBell, FaRegStar, FaStar } from 'react-icons/fa';
import { BiBookBookmark, BiSolidBookBookmark } from 'react-icons/bi';
import { RiGlobalLine, RiGlobalFill } from 'react-icons/ri';
import { AiOutlineHome, AiFillHome } from 'react-icons/ai';
import { IoMdArrowDropdown } from 'react-icons/io';
import { TbLogout2 } from 'react-icons/tb';

function Sidebar({
  isOpen,
  state,
  onClose,
}: {
  isOpen: boolean;
  state: string | undefined;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { logout, user } = useAuthUser();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  const buttonNotificationRef = useRef<HTMLButtonElement>(null);

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const modalNotificationRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  const { totalNotifications } = useNotifications();
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowLogoutModal(false); // Close modal if clicked outside
      }
    };

    if (showLogoutModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogoutModal]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalNotificationRef.current &&
        !modalNotificationRef.current.contains(event.target as Node) &&
        buttonNotificationRef.current &&
        !buttonNotificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationModal(false); // Close modal if clicked outside
      }
    };

    if (showNotificationModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationModal]);
  const handleNavigation = (destination: string) => {
    navigate(destination);
    onClose(); // Close the sidebar after navigation
  };

  const closeModal = () => {
    setShowLogoutModal(false); // Close the logout confirmation modal
  };

  return (
    <div>
      <div
        className={`top-24 left-0 lg:border-y-0 bg-Background/Bottom text-center w-[266px] lg:w-[23vw] xl:w-[20vw]
           h-4/5  p-1 fixed flex flex-col border-Primary/Dark border-solid box-border z-40 rounded-r-3xl border-y-2 border-r-2
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 sm:static  sm:max-xl:p-1 xl:p-2 sm:fixed sm:max-lg:top-24 lg:top-0 sm:max-lg:rounded-r-3xl sm:max-lg:h-4/5 lg:h-full sm:max-lg:border-y-2 sm:max-lg:border-r-2 lg:border-r-2 lg:rounded-none lg: border-y-0`}
      >
        <div className='mt-2 flex justify-center invisible sm:max-lg:invisible lg:visible'>
          <img src={Logo} alt='CoDash Logo' className='w-10 h-auto' />
        </div>

        <div className='flex flex-col mx-12 mt-0 items-center lg:mt-[calc(max(2rem,30vh-8rem))]'>
          <Link to={`/user/${user?._id ?? '#'}`} className='flex flex-col items-center'>
            {' '}
            <img
              src={
                user?.avatar ||
                'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
              }
              alt='Profile Icon'
              className='h-20 w-20 xl:h-24 xl:w-24 rounded-full object-cover'
            />
            <p className='text-white my-3 font-semibold text-lg sm:max-xl:text-lg xl:text-xl w-56 break-words'>
              {user?.displayname || 'Display name'}
            </p>
          </Link>

          <button
            className={`m-2 ${state == 'notifications' ? ' bg-Accent/Target text-white' : 'bg-white text-Primary/Dark'} flex items-center space-x-4 rounded-full text-lg font-semibold  px-4 py-1 relative `}
            onClick={() => handleNavigation('/notifications')}
          >
            <FaBell className='text-2xl' />

            <span>{`${totalNotifications}`}</span>
          </button>
        </div>
        {/* Navigation Buttons */}
        <div className='text-base flex flex-col my-8 ml-10 flex-grow overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-Primary/Dark scrollbar-track-Background/Middle'>
          <button
            className={`m-2 flex items-center space-x-2 ${state === 'feed' ? 'text-green-500' : 'text-white hover:text-Accent/Light'}`}
            onClick={() => handleNavigation('/feed')}
          >
            {state === 'feed' ? (
              <FaStar className='text-4xl' />
            ) : (
              <FaRegStar className='text-4xl' />
            )}
            <span>Feed</span>
          </button>

          <button
            className={`m-2 flex items-center space-x-2 ${state === 'community' ? 'text-green-500' : 'text-white hover:text-Accent/Light'}`}
            onClick={() => handleNavigation('/community/posts')}
          >
            {state === 'community' ? (
              <RiGlobalFill className='text-4xl' />
            ) : (
              <RiGlobalLine className='text-4xl' />
            )}
            <span>Codemunity</span>
          </button>
          <button
            className={`m-2 flex items-center space-x-2 ${state === 'home' ? 'text-green-500' : 'text-white hover:text-Accent/Light'}`}
            onClick={() => user && handleNavigation(`/user/${user._id}`)}
          >
            {state === 'home' ? (
              <AiFillHome className='text-4xl' />
            ) : (
              <AiOutlineHome className='text-4xl' />
            )}
            <span>Home</span>
          </button>

          <button
            className={`m-2 flex items-center space-x-2 ${state === 'stored' ? 'text-green-500' : 'text-white hover:text-Accent/Light'}`}
            onClick={() => user && handleNavigation(`/saves`)}
          >
            {state === 'stored' ? (
              <BiSolidBookBookmark className='text-4xl' />
            ) : (
              <BiBookBookmark className='text-4xl' />
            )}
            <span>Saves</span>
          </button>
          {/*remove later*/}
        </div>

        {/* Logout Button */}
        <div className='mb-0 flex justify-center'>
          <button
            className='m-2 flex items-center space-x-2 text-white hover:text-red-200'
            onClick={() => setShowLogoutModal(true)}
          >
            <span>Log out</span>
            <TbLogout2 className='text-lg' />
          </button>
        </div>
      </div>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
          <div
            className='bg-Background/Bottom p-8 rounded-3xl max-w-sm w-full border-2 border-Primary/Dark justify-center flex-col items-center'
            ref={modalRef}
          >
            <div className='flex justify-center items-center mb-4 -translate-x-2'>
              <TbLogout2 className='text-6xl  text-red-300' />
            </div>
            <h3 className='text-xl mb-8 text-white text-center font-semibold'>
              Are you sure you want to log out?
            </h3>
            <div className='flex justify-between text-white text-md'>
              <button className='ml-7  px-4 py-1 bg-gray-500 rounded-lg' onClick={closeModal}>
                Cancel
              </button>
              <button className='mr-7 bg-red-400 px-4 py-1 rounded-lg' onClick={logout}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;

