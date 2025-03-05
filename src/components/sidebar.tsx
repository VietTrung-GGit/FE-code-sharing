import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuthUser } from '../context/AuthUserContext';
import Logo from '../assets/logo.svg';
import { useNotifications } from '../context/NotificationContext';
import { FaBell, FaPaintRoller, FaRegStar, FaStar } from 'react-icons/fa';
import { BiBookBookmark, BiSolidNotification, BiSolidBookBookmark } from 'react-icons/bi';
import { RiGlobalLine, RiGlobalFill } from 'react-icons/ri';
import { AiOutlineHome, AiFillHome, AiOutlineSetting } from 'react-icons/ai';
import { TbLogout2 } from 'react-icons/tb';
import { useTheme } from '../context/ThemeContext';
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
  const { theme, setTheme } = useTheme(); // Get theme from context
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  const settingsModalRef = useRef<HTMLDivElement>(null);
  const buttonNotificationRef = useRef<HTMLButtonElement>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const modalNotificationRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  const { totalNotifications } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowLogoutModal(false); // Close logout modal if clicked outside
      }

      if (
        modalNotificationRef.current &&
        !modalNotificationRef.current.contains(event.target as Node) &&
        buttonNotificationRef.current &&
        !buttonNotificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationModal(false); // Close notification modal if clicked outside
      }

      if (settingsModalRef.current && !settingsModalRef.current.contains(event.target as Node)) {
        setShowSettingsModal(false); // Close settings modal if clicked outside
      }
    };

    if (showLogoutModal || showNotificationModal || showSettingsModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogoutModal, showNotificationModal, showSettingsModal]);

  const handleNavigation = (destination: string) => {
    navigate(destination);
    onClose(); // Close the sidebar after navigation
  };

  const closeModal = () => {
    setShowLogoutModal(false); // Close the logout confirmation modal
  };

  const SidebarButton = ({
    icon,
    label,
    path,
    active,
  }: {
    icon: JSX.Element;
    label: string;
    path: string;
    active: boolean;
  }) => (
    <button
      className={`m-1 flex items-center space-x-2 rounded-xl px-4 py-2 w-3/4 
    ${
      theme === 'original'
        ? active
          ? 'text-Accent/Target bg-Background/Middle'
          : 'hover:text-Accent/Light hover:bg-Background/Middle'
        : active
          ? 'bg-[var(--button-active)] text-[var(--text-selected)] border-[1px] border-[var(--border)]'
          : 'hover:bg-[var(--button-hovered)] hover:text-[var(--text-hovered)]'
    }`}
      onClick={() => handleNavigation(path)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div>
      <div
        className={`bg-[var(--background-side)] text-[var(--text)] border-[var(--border)] top-24 left-0 text-center w-[266px] lg:w-[23vw] xl:w-[20vw]
           h-4/5 p-1 fixed flex flex-col border-solid box-border z-40 rounded-r-3xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 sm:static  sm:max-xl:p-1 xl:p-2 sm:fixed sm:max-lg:top-24 lg:top-0 sm:max-lg:rounded-r-3xl sm:max-lg:h-4/5 lg:h-full border-y-2 border-r-2 lg:rounded-none lg:border-y-0`}
      >
        <div className='mt-2 flex justify-center invisible sm:max-lg:invisible lg:visible'>
          <img src={Logo} alt='CoDash Logo' className='w-10 h-auto' />
        </div>

        <div className='flex flex-col mx-12 mt-0 items-center lg:mt-[calc(max(2rem,30vh-8rem))]'>
          <Link to={`/user/${user?._id ?? '#'}`} className='flex flex-col items-center'>
            {' '}
            <img
              src={user?.avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
              alt='Profile Icon'
              className='h-20 w-20 xl:h-24 xl:w-24 rounded-full object-cover'
            />
            <p className='my-3 font-semibold text-lg sm:max-xl:text-lg xl:text-xl w-56 break-words'>
              {user?.displayname || 'Display name'}
            </p>
          </Link>

          <button
            className={`m-2 ${
              theme === 'original'
                ? state === 'notifications'
                  ? totalNotifications > 0
                    ? 'bg-Accent/Target'
                    : 'bg-Primary/Dark'
                  : totalNotifications > 0
                    ? 'text-Accent/Target bg-white'
                    : 'text-Primary/Dark bg-white'
                : state === 'notifications'
                  ? totalNotifications > 0
                    ? 'bg-[var(--button-active)] text-[var(--text-selected)]'
                    : 'bg-[var(--background-hovered)]'
                  : totalNotifications > 0
                    ? 'text-[var(--text-selected)]'
                    : ''
            }  border border-[var(--border)] flex items-center space-x-4 rounded-full text-lg px-4 py-1 relative`}
            onClick={() => handleNavigation('/notifications')}
          >
            <FaBell className='text-2xl' />

            <span>{`${totalNotifications}`}</span>
          </button>
        </div>
        {/* Navigation Buttons */}
        <div className='text-base flex flex-col my-8 ml-10 flex-grow overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-Primary/Dark scrollbar-track-Background/Middle'>
          <SidebarButton
            icon={
              state === 'feed' ? (
                <FaStar className='text-4xl flex-shrink-0' />
              ) : (
                <FaRegStar className='text-4xl flex-shrink-0' />
              )
            }
            label='Feed'
            path='/feed'
            active={state === 'feed'}
          />
          <SidebarButton
            icon={
              state === 'community' ? (
                <RiGlobalFill className='text-4xl flex-shrink-0' />
              ) : (
                <RiGlobalLine className='text-4xl flex-shrink-0' />
              )
            }
            label='Codemunity'
            path='/community/posts'
            active={state === 'community'}
          />
          <SidebarButton
            icon={
              state === 'home' ? (
                <AiFillHome className='text-4xl flex-shrink-0' />
              ) : (
                <AiOutlineHome className='text-4xl flex-shrink-0' />
              )
            }
            label='Home'
            path={`/user/${user?._id}/posts`}
            active={state === 'home'}
          />
          <SidebarButton
            icon={
              state === 'stored' ? (
                <BiSolidBookBookmark className='text-4xl flex-shrink-0' />
              ) : (
                <BiBookBookmark className='text-4xl flex-shrink-0' />
              )
            }
            label='Saves'
            path='/saves'
            active={state === 'stored'}
          />
          {/*remove later*/}
        </div>

        {/* Logout Button */}
        <div className='mb-0 flex justify-between'>
          <button
            className={`${
              theme === 'original'
                ? 'hover:text-Accent/Light hover:bg-Background/Middle '
                : 'hover:text-[var(--text-selected)] hover:bg-[var(--button-hovered)] '
            } m-2 flex items-center space-x-2 rounded-lg p-2`}
            onClick={() => setShowSettingsModal(true)}
          >
            <AiOutlineSetting className='text-2xl' />
          </button>
          <button
            className='m-2 flex items-center space-x-2 hover:text-[var(--red-highlight)] hover:bg-[var(--background-hovered)] rounded-lg p-2'
            onClick={() => setShowLogoutModal(true)}
          >
            <span>Log out</span>
            <TbLogout2 className='text-lg' />
          </button>
        </div>
      </div>
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
          <div
            className={`          
      ${
        theme === 'original'
          ? 'bg-Background/Bottom text-white lg:border-2'
          : 'bg-[var(--surface)] text-[var(--text)]'
      } w-full h-full lg:max-w-min lg:max-h-min px-5 py-10 lg:rounded-3xl lg:border-Primary/Dark relative`}
            ref={settingsModalRef}
          >
            <button
              onClick={() => setShowSettingsModal(false)}
              className='absolute top-3 right-4 text-3xl hover:text-[var(--text-title)] z-40'
            >
              ×
            </button>
            <h3 className='text-xl text-center font-semibold'>Settings</h3>

            {/* Theme Selection */}
            <h4 className='text-base text-[var(--text-hovered)] flex items-center text-left mt-2 gap-2'>
              <FaPaintRoller />
              Themes:
            </h4>

            <div className='flex flex-col lg:flex-row lg:justify-between items-center mt-4 gap-4 '>
              <button
                className={`w-28 px-4 py-2 bg-Background/Bottom border-2 border-Primary/Dark text-Accent/Light shadow-lg rounded-md ${
                  theme === 'original' ? 'ring-2 ring-Accent/Target' : ''
                }`}
                onClick={() => setTheme('original')}
              >
                Original
              </button>
              <button
                className={`w-28 px-4 py-2 bg-[#f0f4f8] border-2 border-[#d1d9e6] text-[#1f2937] rounded-md ${
                  theme === 'light' ? 'ring-2 ring-Accent/Target' : ''
                }`}
                onClick={() => setTheme('light')}
              >
                Light
              </button>
              <button
                className={`w-28 px-4 py-2 bg-[#0e1113] border-2 border-[#20292f] text-[#ffffff] rounded-md ${
                  theme === 'dark' ? 'ring-2 ring-Accent/Target' : ''
                }`}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
          <div
            className={`
              ${
                theme === 'original'
                  ? 'bg-Background/Bottom text-white border-2'
                  : 'bg-[var(--surface)] text-[var(--text)]'
              } border-Primary/Dark p-8 rounded-3xl max-w-sm w-full justify-center flex-col items-center`}
            ref={modalRef}
          >
            <div className='flex justify-center items-center mb-4 -translate-x-2'>
              <TbLogout2 className='text-6xl  text-red-300' />
            </div>
            <h3 className='text-xl mb-2 text-center font-semibold'>Log out?</h3>
            <h3 className='text-base mb-4 text-gray-400 text-center'>
              Are you sure you want to log out from this account?
            </h3>
            <div className='flex justify-between text-base'>
              <button
                className={`${
                  theme === 'original'
                    ? 'bg-white text-Primary/Dark'
                    : 'bg-[var(--button)] text-[var(--text)]  '
                }  ml-7 border-[var(--border)] px-4 py-1 rounded-lg hover:bg-[var(--button-hovered)]`}
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className='mr-7 bg-red-400 px-4 py-1 rounded-lg hover:bg-red-500'
                onClick={logout}
              >
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

