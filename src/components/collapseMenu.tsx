import React from 'react';
import Sandwich from '../assets/sandwichicon.svg';
import Logo from '../assets/logo.svg';
import Filter from '../assets/filter.svg';

// Base properties shared by all cases
interface BaseProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isTagListVisible?: boolean; // Optional, default to true
  sidebarButtonRef: React.RefObject<HTMLButtonElement>;
}

// Additional properties when TagList is visible
interface TagListProps {
  onToggleTagList: () => void;
  isTagListOpen: boolean;
  tagListButtonRef: React.RefObject<HTMLButtonElement>;
}

// Union type to differentiate between cases
type CollapseMenuProps =
  | (BaseProps & TagListProps) // TagList visible
  | (BaseProps & { isTagListVisible: false }); // TagList hidden

/*function CollapseMenu({
  onToggleSidebar,
  onToggleTagList,
  isSidebarOpen,
  isTagListOpen,
  isTagListVisible = true, // New prop to control TagList visibility
  sidebarButtonRef,
  tagListButtonRef,
}: CollapseMenuProps) {*/
function CollapseMenu(props: CollapseMenuProps) {
  const {
    onToggleSidebar,
    isSidebarOpen,
    isTagListVisible = true, // Default to true for backward compatibility
    sidebarButtonRef,
  } = props;
  // Type guard to check if props include TagListProps
  const hasTagListProps = (props: CollapseMenuProps): props is BaseProps & TagListProps =>
    isTagListVisible && 'onToggleTagList' in props;
  // Define the distance the buttons should move (e.g., 20px of the viewport width)
  const sidebarDistance = 258; // px of viewport width
  const tagListDistance = 242; // px of viewport width
  return (
    <header
      className={`fixed top-0 flex ${isTagListVisible ? 'justify-between' : 'justify-center'} items-center px-4 py-2 z-20 lg:hidden bg-Background/Bottom w-full h-[60px] border-b-Primary/Dark border-b-2`}
    >
      {/* Sidebar Toggle Button */}
      <button
        ref={sidebarButtonRef}
        onClick={onToggleSidebar}
        className={`p-2 transition-all duration-300 ease-in-out' ${isTagListVisible ? '' : 'fixed flex left-4'}`}
      >
        <img src={Sandwich} alt='Sandwich icon' className='w-6' />
      </button>

      {/* Logo */}
      <img
        src={Logo}
        alt='CoDash Logo'
        className={`w-10 h-auto ${isTagListVisible ? '' : 'fixed flex'}`}
      />

      {/* TagList Toggle Button (conditionally rendered) */}
      {isTagListVisible && hasTagListProps(props) && (
        <button
          ref={props.tagListButtonRef}
          onClick={props.onToggleTagList}
          className='p-2 transition-all duration-300 ease-in-out'
        >
          <img src={Filter} alt='Filter icon' className='w-8' />
        </button>
      )}
    </header>
  );
}

export default CollapseMenu;

