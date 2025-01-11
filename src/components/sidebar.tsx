import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '../context/UserContext'; // Import your user context
import { logout } from '../services/authService'; // Import the logout function
import Logo from '../assets/logo.svg';
import Home from '../assets/home.svg';
import HomeClicked from '../assets/homeClicked.svg';
import Codemunity from '../assets/codemunity.svg';
import CodemunityClicked from '../assets/codemunityClicked.svg';
import Profile from '../assets/profile.svg';
import ProfileClicked from '../assets/profileClicked.svg';
import Saves from '../assets/saves.svg';
import SavesClicked from '../assets/savesClicked.svg';

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { displayname, avatarUrl } = useUser();

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
        className={`top-32 left-0 bg-Background/Bottom text-center w-64 h-full p-1 fixed flex flex-col border-Primary/Dark border-solid box-border border-r-2 border-y-2 rounded-r-3xl rounded-b-3xl z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 sm:static sm:max-xl:w-64 xl:max-2xl:w-72 sm:max-xl:p-1 xl:max-2xl:p-2 sm:max-2xl:fixed sm:max-lg:rounded-tr-3xl sm:max-lg:rounded-b-3xl sm:max-lg:border-y-2 sm:max-lg:top-32 lg:max-2xl:top-0 lg:rounded-none lg:max-2xl:border-r-2`}
      >
        <div className='mt-2 flex justify-center invisible sm:max-lg:invisible lg:max-2xl:visible'>
          <img src={Logo} alt='CoDash Logo' className='w-10 h-auto' />
        </div>

        <div className='flex flex-col mx-12 mt-10 items-center sm:max-lg:mt-10 lg:max-2xl:mt-32'>
          <img
            src={avatarUrl}
            alt='Profile Icon'
            className='h-auto sm:max-lg:w-20 lg:max-2xl:w-24 rounded-full'
          />
          <p className='text-white mt-6 text-lg sm:max-xl:text-lg xl:max-2xl:text-xl'>
            {displayname}
          </p>
        </div>

        {/* Navigation Buttons */}

        <div className='flex flex-col mt-24'>
          <button className={'m-2'} onClick={() => handleNavigation('/home')}>
            <img
              src={state === 'feed' ? HomeClicked : Home} // Dynamically switch image
              alt='Home Button'
              className='w-30 h-auto '
            />
          </button>

          <button className={'m-2'} onClick={() => handleNavigation('/community')}>
            <img
              src={state === 'community' ? CodemunityClicked : Codemunity} // Dynamically switch image
              alt='Codemunity Button'
              className='w-30 h-auto'
            />
          </button>

          <button className={'m-2'} onClick={() => handleNavigation('/saves')}>
            <img
              src={state === 'saves' ? SavesClicked : Saves} // Dynamically switch image
              alt='Saves Button'
              className='w-30 h-auto '
            />
          </button>

          <button className={'m-2'} onClick={() => handleNavigation('/profile')}>
            <img
              src={state === 'profile' ? ProfileClicked : Profile} // Dynamically switch image
              alt='Profile Button'
              className='w-30 h-auto '
            />
          </button>
          {/* Logout Button */}
          <button
            className='m-2 flex items-center space-x-2 text-white'
            onClick={() => setShowLogoutModal(true)}
          >
            <span>Log out</span>
          </button>
        </div>
      </div>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
          <div className='bg-white p-8 rounded-lg max-w-sm w-full'>
            <h3 className='text-xl font-semibold mb-4'>Are you sure you want to log out?</h3>
            <div className='flex justify-between'>
              <button className='bg-gray-300 text-black px-4 py-2 rounded' onClick={closeModal}>
                Cancel
              </button>
              <button className='bg-red-500 text-white px-4 py-2 rounded' onClick={logout}>
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

