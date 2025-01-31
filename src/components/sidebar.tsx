import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuthUser } from '../context/AuthUserContext';
import Logo from '../assets/logo.svg';
import { useNotifications } from '../context/NotificationContext';

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
        </div>

        {/* Navigation Buttons */}
        <div className='flex flex-col my-8 ml-5 flex-grow overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-Primary/Dark scrollbar-track-Background/Middle'>
          <button
            className={`m-2 flex items-center space-x-2 ${state === undefined ? 'text-green-500' : 'text-white hover:text-Accent/Light'}`}
            onClick={() => handleNavigation('/feed')}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='31'
              height='31'
              viewBox='0 0 31 31'
              fill='none'
              stroke='currentColor'
            >
              <path
                d='M2 15.5H9.5M2 15.5C2 22.9558 8.04416 29 15.5 29M2 15.5C2 8.04416 8.04416 2 15.5 2M9.5 15.5H21.5M9.5 15.5C9.5 22.9558 12.1863 29 15.5 29M9.5 15.5C9.5 8.04416 12.1863 2 15.5 2M21.5 15.5H29M21.5 15.5C21.5 8.04416 18.8137 2 15.5 2M21.5 15.5C21.5 22.9558 18.8137 29 15.5 29M29 15.5C29 8.04416 22.9558 2 15.5 2M29 15.5C29 22.9558 22.9558 29 15.5 29'
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span>Codemunity</span>
          </button>
          <button
            className={`m-2 flex items-center space-x-2 ${state === 'me' ? 'text-green-500' : 'text-white hover:text-Accent/Light'}`}
            onClick={() => handleNavigation('/feed/me')}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='30'
              height='30'
              viewBox='0 0 30 30'
              fill='none'
              stroke='currentColor'
            >
              <path
                d='M28 23.2268V14.4004C28 13.5504 27.9993 13.1251 27.8937 12.7295C27.8001 12.379 27.6465 12.0472 27.4387 11.7474C27.2041 11.4092 26.878 11.1287 26.2246 10.5689L18.4246 3.88701C17.2113 2.84768 16.6047 2.32828 15.922 2.13063C15.3204 1.95646 14.6792 1.95646 14.0777 2.13063C13.3955 2.32814 12.7898 2.84704 11.5783 3.8848L3.77576 10.5689C3.12229 11.1287 2.79632 11.4092 2.56177 11.7474C2.35391 12.0472 2.19914 12.379 2.10558 12.7295C2 13.1251 2 13.5503 2 14.4004V23.2268C2 24.7093 2 25.4503 2.24739 26.035C2.57725 26.8147 3.20952 27.4349 4.00586 27.7578C4.60312 28 5.36027 28 6.87458 28C8.38889 28 9.14688 28 9.74414 27.7578C10.5405 27.4349 11.1726 26.8148 11.5024 26.0352C11.7498 25.4505 11.75 24.7092 11.75 23.2266V21.6357C11.75 19.8784 13.2051 18.4539 15 18.4539C16.7949 18.4539 18.25 19.8784 18.25 21.6357V23.2266C18.25 24.7092 18.25 25.4505 18.4974 26.0352C18.8272 26.8148 19.4595 27.4349 20.2559 27.7578C20.8531 28 21.6103 28 23.1246 28C24.6389 28 25.3969 28 25.9941 27.7578C26.7905 27.4349 27.4226 26.8147 27.7524 26.035C27.9998 25.4503 28 24.7093 28 23.2268Z'
                strokeWidth='4'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span>Home</span>
          </button>
          <button
            className={`m-2 flex items-center space-x-2 ${state === 'notifications' ? 'text-green-500' : 'text-white hover:text-Accent/Light'}`}
            onClick={() => handleNavigation('/notifications')}
          >
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
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span>{`Notifications (${totalNotifications})`}</span>
          </button>
          <button
            className={`m-2 flex items-center space-x-2 ${state === 'stored' ? 'text-green-500' : 'text-white hover:text-Accent/Light'}`}
            onClick={() => handleNavigation('/feed/stored')}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='32'
              height='36'
              viewBox='0 0 32 36'
              fill='none'
              stroke='currentColor'
            >
              <path
                d='M2 5.29412C2 3.47483 3.64162 2 5.66667 2H20.3333C22.3584 2 24 3.47483 24 5.29412V30L13 20.1176L2 30V5.29412Z'
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span>Saves</span>
          </button>
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

