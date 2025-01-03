import { useState, useEffect, useRef } from 'react';
import ButtonShare from '../components/buttonShare';
import NothingPost from '../components/nothingPost';
import Sidebar from '../components/sidebar';
import TagList from '../components/tagList';
import CollapseMenu from '../components/collapseMenu';

function Home() {
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'taglist' | null>(null);

  // Refs for sidebar, tag list, and buttons
  const sidebarRef = useRef<HTMLDivElement>(null);
  const tagListRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const tagListButtonRef = useRef<HTMLButtonElement>(null);

  const toggleSidebar = () => {
    setActiveComponent((prev) => (prev === 'sidebar' ? null : 'sidebar'));
  };

  const toggleTagList = () => {
    setActiveComponent((prev) => (prev === 'taglist' ? null : 'taglist'));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        // Check if the click is outside all tracked elements
        !sidebarRef.current?.contains(target) &&
        !tagListRef.current?.contains(target) &&
        !sidebarButtonRef.current?.contains(target) &&
        !tagListButtonRef.current?.contains(target)
      ) {
        setActiveComponent(null);
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
    <ButtonShare/>

    {/*nothingpost*/}
    <div className='bg-Background/Bottom text-center mt-16 p-14 w-full h-40 relative border-Primary/Dark border-solid box-border border-2 rounded-3xl mb-28
    sm:max-lg:p-14 lg:max-xl:p-10 xl:max-2xl:p-12 md:max-lg:ml-[255px] lg:max-xl:ml-[290px] xl:max-2xl:ml-96 sm:max-md:w-full md:max-lg:w-2/3 lg:max-2xl:w-1/2'>
      <div className='mt-1 sm:max-lg:mt-3 lg:max-xl:mt-5 xl:max-2xl:mt-4'>
      <p className='text-left text-white text-l'>
        Nothing here... Go explore <span className='text-Accent/Target'>Codemunity</span> or{' '}
        <span className='text-Primary/Light'>share your own code</span> !
      </p>
      </div>
    </div>

      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar isOpen={activeComponent === 'sidebar'} onClose={() => setActiveComponent(null)} />
      </div>

      {/* Tag List */}
      <div ref={tagListRef}>
        <TagList isOpen={activeComponent === 'taglist'} onClose={() => setActiveComponent(null)} />
      </div>

      {/* Toggle Buttons */}
      <CollapseMenu
        isSidebarOpen={activeComponent === 'sidebar'}
        isTagListOpen={activeComponent === 'taglist'}
        onToggleSidebar={toggleSidebar}
        onToggleTagList={toggleTagList}
        sidebarButtonRef={sidebarButtonRef}
        tagListButtonRef={tagListButtonRef}
      />
    </div>
  );
}

export default Home;

