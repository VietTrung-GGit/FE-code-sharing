import React from 'react';
import Sandwich from '../assets/sandwichicon.svg';
import Tag from '../assets/tag.svg';

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
  // Define the distance the buttons should move (e.g., 20% of the viewport width)
  const sidebarDistance = 258; // 20% of viewport width
  const tagListDistance = 242; // 20% of viewport width
  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        ref={sidebarButtonRef}
        onClick={onToggleSidebar}
        className='bg-Background/Bottom border-Primary/Dark border-solid box-border border-2 fixed flex left-0 p-4 mt-8 z-40
          transition-all duration-300 ease-in-out md:hidden'
        style={{
          transform: isSidebarOpen ? `translateX(${sidebarDistance}px)` : 'translateX(0)',
        }}
      >
        <img src={Sandwich} alt='Sandwich icon' className='w-6' />
      </button>

      {/* Tag List Toggle Button */}
      <button
        ref={tagListButtonRef}
        onClick={onToggleTagList}
        className='bg-Background/Bottom border-Primary/Dark border-solid box-border border-2 fixed flex right-0 p-4 mt-8 z-50
          transition-all duration-300 ease-in-out lg:hidden'
        style={{
          transform: isTagListOpen ? `translateX(-${tagListDistance}px)` : 'translateX(0)',
        }}
      >
        <img src={Tag} alt='Tag icon' className='w-6' />
      </button>
    </>
  );
}

export default CollapseMenu;
