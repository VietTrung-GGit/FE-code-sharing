import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuthUser } from '../context/AuthUserContext';
import Logo from '../assets/logo.svg';
import { useNotifications } from '../context/NotificationContext';
import { FaBell, FaRegStar, FaStar } from 'react-icons/fa';
import { BiBookBookmark, BiSolidBookBookmark } from 'react-icons/bi';
import { RiGlobalLine, RiGlobalFill } from 'react-icons/ri';
import { AiOutlineHome, AiFillHome } from 'react-icons/ai';
import { IoMdArrowDropdown } from 'react-icons/io';
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
        className={`relative top-24 left-0 lg:border-y-0 bg-Background/Bottom text-center w-[266px] lg:w-[23vw] xl:w-[20vw]
           h-4/5  p-1 fixed flex flex-col border-Primary/Dark border-solid box-border z-40 rounded-r-3xl border-y-2 border-r-2
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 sm:static  sm:max-xl:p-1 xl:p-2 sm:fixed sm:max-lg:top-24 lg:top-0 sm:max-lg:rounded-r-3xl sm:max-lg:h-4/5 lg:h-full sm:max-lg:border-y-2 sm:max-lg:border-r-2 lg:border-r-2 lg:rounded-none lg: border-y-0`}
      >
        <div className='mt-2 flex justify-center invisible sm:max-lg:invisible lg:visible'>
          <img src={Logo} alt='CoDash Logo' className='w-10 h-auto' />
        </div>

        <div className='flex flex-col mx-12 mt-0 items-center lg:mt-[calc(max(2rem,30vh-8rem))] '>
          <img
            src={
              user?.avatar ||
              'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
            }
            alt='Profile Icon'
            className='h-20 w-20 xl:h-24 xl:w-24 rounded-full object-cover'
          />
          <p className='text-white mt-6 font-semibold text-lg sm:max-xl:text-lg xl:text-xl w-56 break-words'>
            {user?.displayname || 'Display name'}
          </p>
          <button
            className={`m-2 ${totalNotifications > 0 ? ' bg-Accent/Target text-white' : 'bg-white text-Primary/Dark'} flex items-center space-x-4 rounded-3xl text-lg font-semibold min-w-[100px] px-2 py-1 hover:bg-opacity-80 `}
            onClick={() => setShowNotificationModal((prev) => !prev)}
            ref={buttonNotificationRef}
          >
            <FaBell className='text-2xl' />

            <span>{`${totalNotifications}`}</span>

            <IoMdArrowDropdown className='text-2xl' />
          </button>
        </div>
        {showNotificationModal && (
          <div
            className='absolute bg-Background/Bottom border-Primary/Dark border-solid box-border border-2 top-[350px] w-[280px] mx-1 rounded-3xl h-[380px] px-8 flex flex-col'
            ref={modalNotificationRef}
          >
            <div className='flex'>
              <p className='text-white text-xl font-semibold text-left'>Notifications</p>
            </div>
            <div className='flex flex-col'>
              <p className='text-white text-left'>Notifications go here</p>
              <p className='text-white text-left'>Notifications go here</p>
              <p className='text-white text-left'>Notifications go here</p>
              <p className='text-white text-left'>Notifications go here</p>
            </div>
            <div className='flex mx-12 absolute bottom-0'>
              <button
                className='transition-colors duration-300 ease-in-out w-28 h-8 rounded-xl bg-Primary/Light text-lg text-Primary/Dark mb-4 hover:bg-white hover:text-Accent/Target'
                onClick={() => handleNavigation('/notifications')}
              >
                View all
              </button>
            </div>
          </div>
        )}
        {/* Navigation Buttons */}
        <div className='text-base flex flex-col my-8 ml-5 flex-grow overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-Primary/Dark scrollbar-track-Background/Middle'>
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
            onClick={() => handleNavigation('/home')}
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
            onClick={() => handleNavigation('/saves')}
          >
            {state === 'stored' ? (
              <BiSolidBookBookmark className='text-4xl' />
            ) : (
              <BiBookBookmark className='text-4xl' />
            )}
            <span>Saves</span>
          </button>
          {/*remove later*/}
          <button
            className={`m-2 flex items-center space-x-2 ${state === undefined ? 'text-green-500' : 'text-white hover:text-Accent/Light'}`}
            onClick={() => handleNavigation('/project')}
          >
            <svg
              width='38'
              height='36'
              viewBox='0 0 38 36'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M36.7718 12.6766L25.3801 11.0342L20.2878 0.792305C20.1487 0.511888 19.9199 0.284884 19.6372 0.146901C18.9283 -0.200281 18.0669 0.0890376 17.7124 0.792305L12.62 11.0342L1.22838 12.6766C0.914314 12.7211 0.627167 12.868 0.40732 13.0906C0.141537 13.3616 -0.00492147 13.7262 0.000126282 14.1043C0.00517403 14.4823 0.161315 14.843 0.43424 15.1069L8.67626 23.0787L6.72904 34.3355C6.68338 34.5973 6.71259 34.8666 6.81335 35.1129C6.91412 35.3591 7.08242 35.5724 7.29916 35.7285C7.51589 35.8847 7.7724 35.9775 8.0396 35.9964C8.30679 36.0153 8.57398 35.9595 8.81086 35.8355L19.0001 30.5209L29.1893 35.8355C29.4675 35.9824 29.7905 36.0313 30.1001 35.9779C30.8808 35.8444 31.4057 35.1099 31.2711 34.3355L29.3239 23.0787L37.5659 15.1069C37.7903 14.8888 37.9383 14.6039 37.9832 14.2924C38.1043 13.5134 37.557 12.7924 36.7718 12.6766ZM25.8557 21.9571L27.4754 31.3176L19.0001 26.9022L10.5248 31.3221L12.1445 21.9615L5.28882 15.3295L14.7647 13.963L19.0001 5.44811L23.2355 13.963L32.7114 15.3295L25.8557 21.9571Z'
                fill='currentColor'
              />
            </svg>
            <span>Project(wip)</span>
          </button>
          {/**/}
          <button
            className={`m-2 flex items-center space-x-2 ${state === 'groups' ? 'text-green-500' : 'text-white hover:text-Accent/Light'}`}
            onClick={() => handleNavigation('/groups')}
          >
            <svg
              width='36'
              height='25'
              viewBox='0 0 36 25'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fill-rule='evenodd'
                clip-rule='evenodd'
                d='M24 3.24984C21.5148 3.24984 19.5 5.32053 19.5 7.87484C19.5 10.4292 21.5148 12.4998 24 12.4998C26.4853 12.4998 28.5 10.4292 28.5 7.87484C28.5 5.32053 26.4853 3.24984 24 3.24984ZM16.5 7.87484C16.5 3.61765 19.8579 0.166504 24 0.166504C28.1421 0.166504 31.5 3.61765 31.5 7.87484C31.5 9.90876 30.7335 11.7588 29.4813 13.1362C32.2426 14.0606 34.3764 15.8904 35.7396 17.9464C36.2061 18.65 36.0293 19.6091 35.3447 20.0885C34.6602 20.568 33.7269 20.3862 33.2604 19.6826C31.7968 17.4753 29.1267 15.5832 25.5 15.5832C19.749 15.5832 16.5 20.3226 16.5 23.2915C16.5 24.143 15.8285 24.8332 15 24.8332C14.1716 24.8332 13.5 24.143 13.5 23.2915C13.5 22.2247 13.7377 21.0869 14.1912 19.9654C14.0757 19.8892 13.9684 19.7955 13.8733 19.6843C12.6421 18.2444 10.7313 17.1248 8.25002 17.1248C5.76877 17.1248 3.85798 18.2444 2.62671 19.6843C2.07982 20.3238 1.13204 20.3865 0.509782 19.8245C-0.112471 19.2624 -0.173564 18.2883 0.373329 17.6487C1.21355 16.6662 2.27676 15.7935 3.53587 15.1526C2.27983 13.8927 1.50001 12.1337 1.50001 10.1873C1.50001 6.35586 4.52209 3.24984 8.25002 3.24984C11.9779 3.24984 15 6.35586 15 10.1873C15 12.1337 14.2202 13.8927 12.9642 15.1526C14.0478 15.7042 14.9863 16.4274 15.7624 17.2446C16.728 15.9931 17.9829 14.8712 19.4883 14.033C17.6733 12.6261 16.5 10.3913 16.5 7.87484ZM4.50001 10.1873C4.50001 8.05874 6.17895 6.33317 8.25002 6.33317C10.3211 6.33317 12 8.05874 12 10.1873C12 12.3159 10.3211 14.0415 8.25002 14.0415C6.17895 14.0415 4.50001 12.3159 4.50001 10.1873Z'
                fill='currentColor'
              />
            </svg>
            <span>Groups</span>
          </button>
          <button
            className={`m-2 flex items-center space-x-2 ${state === 'profiletemp' ? 'text-green-500' : 'text-white hover:text-Accent/Light'}`}
            onClick={() => handleNavigation('/profiletemp')}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='32'
              height='32'
              viewBox='0 0 32 32'
              fill='none'
              stroke='currentColor'
            >
              <path
                d='M6.375 26.5C7.04754 25.7468 10.1974 22.2806 11.1204 22.2806H20.8802C22.2178 22.2806 24.9483 25.1538 25.625 26.1666M30 16C30 23.732 23.732 30 16 30C8.26801 30 2 23.732 2 16C2 8.26801 8.26801 2 16 2C23.732 2 30 8.26801 30 16ZM21.015 11.2283C21.015 8.55732 18.7602 6.375 16.0004 6.375C13.2407 6.375 10.9859 8.55732 10.9859 11.2283C10.9859 13.8992 13.2407 16.0815 16.0004 16.0815C18.7601 16.0815 21.015 13.8992 21.015 11.2283Z'
                strokeWidth='4'
              />
            </svg>
            <span>Profile</span>
          </button>
        </div>

        {/* Logout Button */}
        <div className='mb-0 flex justify-center'>
          <button
            className='m-2 flex items-center space-x-2 text-Primary/Light hover:text-Primary/Target'
            onClick={() => setShowLogoutModal(true)}
          >
            <span>Log out</span>
            <svg
              viewBox='0 0 24 24'
              className='w-6 h-6 stroke-current '
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M9.35294 16.2001V18.3001C9.35294 18.8571 9.57605 19.3912 9.97319 19.785C10.3703 20.1788 10.909 20.4001 11.4706 20.4001L18.8824 20.4001C19.444 20.4001 19.9826 20.1788 20.3798 19.785C20.7769 19.3912 21 18.8571 21 18.3001L21 5.7001C21 5.14314 20.7769 4.609 20.3798 4.21517C19.9826 3.82135 19.444 3.6001 18.8824 3.6001L11.4706 3.6001C10.909 3.6001 10.3703 3.82135 9.97319 4.21517C9.57605 4.609 9.35294 5.14314 9.35294 5.7001V7.8001M15.7059 12.0001L3 12.0001M3 12.0001L6.17647 15.1501M3 12.0001L6.17647 8.8501'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
          <div
            className='bg-Background/Bottom p-8 rounded-lg max-w-sm w-full border-2 border-Primary/Dark'
            ref={modalRef}
          >
            <h3 className='text-xl mb-8 text-white text-center'>
              Are you sure you want to log out?
            </h3>
            <div className='flex justify-between'>
              <button
                className='ml-7 text-red-200 px-4 py-2 hover:text-red-500'
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className='mr-7 text-Accent/Light px-4 py-2 hover:text-Accent/Target'
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

