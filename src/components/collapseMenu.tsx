import React from 'react';
import { IoMenuOutline } from 'react-icons/io5';
import { TbPin } from 'react-icons/tb';
import Logo from '../assets/logo.svg';
import { useTheme } from '../context/ThemeContext';

// Base properties shared by all cases
interface BaseProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;

  sidebarButtonRef: React.RefObject<HTMLButtonElement>;
}

interface QuickNavProps {
  onToggleQuickNav: () => void;
  isQuickNavOpen: boolean;
  quickNavButtonRef: React.RefObject<HTMLButtonElement>;
}

// Union type to differentiate between cases
type CollapseMenuProps = BaseProps & QuickNavProps;

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

    sidebarButtonRef,
  } = props;
  // Type guard to check if props include TagListProps
  const { theme } = useTheme();
  const hasQuickNavProps = (props: CollapseMenuProps): props is BaseProps & QuickNavProps =>
    'onToggleQuickNav' in props;

  return (
    <header
      className={`fixed top-0 flex justify-between items-center px-4 py-2 z-20 lg:hidden bg-Background/Bottom w-full h-[60px] border-b-Primary/Dark border-b-2`}
    >
      {/* Sidebar Toggle Button */}
      <button
        ref={sidebarButtonRef}
        onClick={onToggleSidebar}
        className={`p-2 transition-all duration-300 ease-in-out' `}
      >
        <IoMenuOutline className='text-white text-4xl' />
      </button>

      {/* Logo */}
      <img src={Logo} alt='CoDash Logo' className={`w-10 h-auto `} />

      {/* TagList Toggle Button (conditionally rendered) */}
      {hasQuickNavProps(props) && (
        <button
          ref={props.quickNavButtonRef}
          onClick={props.onToggleQuickNav}
          className='p-2 transition-all duration-300 ease-in-out'
        >
          <TbPin className='text-white text-4xl' />
        </button>
      )}
    </header>
  );
}

export default CollapseMenu;

