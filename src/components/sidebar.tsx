import { useState } from 'react';
import Logo from '../assets/logo.svg';
import Home from '../assets/home.svg';
import HomeClicked from '../assets/homeClicked.svg';
import Codemunity from '../assets/codemunity.svg';      //lg:translate-x-0 sm:static sm:max-xl:w-60 xl:max-2xl:w-64 sm:max-xl:pl-4 xl:max-2xl:pl-6 lg:max-2xl:mr-8 sm:max-2xl:fixed sm:max-lg:rounded-b-3xl lg:max-2xl:rounded-3xl
import CodemunityClicked from '../assets/codemunityClicked.svg'; //sm:translate-x-0 sm:static sm:w-1/4 lg:w-1/5 lg:max-2xl:fixed

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Initialize activeButton to 'home' so Home is clicked by default
  const [activeButton, setActiveButton] = useState<'home' | 'codemunity' | null>('home');
  return (
    <div
      className={`top-0 left-0 bg-Background/Bottom text-center w-64 h-full p-1 fixed flex flex-col border-Primary/Dark border-solid box-border border-r-2 z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 sm:static sm:max-md:w-64 md:max-lg:w-60 lg:max-xl:w-64 xl:max-2xl:w-72 sm:max-xl:p-1 xl:max-2xl:p-2 sm:max-2xl:fixed`}
    >
      <div className='mt-2 flex justify-center'>
        <img src={Logo} alt='CoDash Logo' className='w-10 h-auto' />
      </div>

      {/* Profile Section */}
      <div className='flex flex-col mx-12 mt-32 items-center'>
        <img
          src='profileicon.png'
          alt='Profile Icon'
          className='h-auto sm:max-lg:w-20 xl:max-2xl:w-24'
        />
        <p className='text-white mt-6 sm:max-md:text-lg md:max-lg:text-base lg:max-xl:text-lg xl:max-2xl:text-xl'>
          Your Display Name
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className='flex flex-col mt-24'>
        {/* Home Button */}
        <button
          className='m-2'
          onClick={() => setActiveButton('home')} // Set activeButton to 'home'
        >
          <img
            src={activeButton === 'home' ? HomeClicked : Home} // Dynamically switch image
            alt='Home Button'
            className='w-30 h-auto '
          />
        </button>

        {/* Codemunity Button */}
        <button
          className='m-2'
          onClick={() => setActiveButton('codemunity')} // Set activeButton to 'codemunity'
        >
          <img
            src={activeButton === 'codemunity' ? CodemunityClicked : Codemunity} // Dynamically switch image
            alt='Codemunity Button'
            className='w-30 h-auto'
          />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
