import React from 'react';
import Sandwich from '../assets/sandwichicon.svg';
import Tag from '../assets/tag.svg';
import Logo from '../assets/logo.svg';
import Filter from '../assets/filter.svg';
function CollapseMenu({
  onToggleSidebar,
  onToggleTagList,
  isSidebarOpen,
  isTagListOpen,
  sidebarButtonRef,
  tagListButtonRef,
}: {
  onToggleSidebar: () => void;
  onToggleTagList: () => void;
  isSidebarOpen: boolean;
  isTagListOpen: boolean;
  sidebarButtonRef: React.RefObject<HTMLButtonElement>;
  tagListButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  // Define the distance the buttons should move (e.g., 20px of the viewport width)
  const sidebarDistance = 258; // px of viewport width
  const tagListDistance = 242; // px of viewport width
  return (
    <header className='fixed top-0 flex justify-between items-center px-4 py-2 z-20 lg:hidden bg-Background/Bottom w-full border-b-Primary/Dark border-b-2'>
      {/* Sidebar Toggle Button */}
      <button
        ref={sidebarButtonRef}
        onClick={onToggleSidebar}
        className='p-2 transition-all duration-300 ease-in-out'
      >
        <img src={Sandwich} alt='Sandwich icon' className='w-6' />
      </button>

      {/* Logo */}
      <img src={Logo} alt='CoDash Logo' className='w-10 h-auto' />

      {/* Tag List Toggle Button */}
      <button
        ref={tagListButtonRef}
        onClick={onToggleTagList}
        className='p-2 transition-all duration-300 ease-in-out'
      >
        <img src={Filter} alt='Filter icon' className='w-8' />
      </button>
    </header>
  );
}

export default CollapseMenu;

