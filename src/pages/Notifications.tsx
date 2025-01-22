import Sidebar from '../components/sidebar';
import CollapseMenu from '../components/collapseMenu';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/loadingSpinner';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function Notifications() {
  const [activeComponent, setActiveComponent] = useState<'sidebar' | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const toggleSidebar = () => {
    setActiveComponent((prev) => (prev === 'sidebar' ? null : 'sidebar'));
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!sidebarRef.current?.contains(target) && !sidebarButtonRef.current?.contains(target)) {
        setActiveComponent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
      <div className='flex justify-center'>
        <div className='text-white m-2 mt-10 space-x-2 inline-block flex lg:w-1/2 '>
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
              stroke-width='3'
              stroke-linecap='round'
              stroke-linejoin='round'
            />
          </svg>

          <span className='text-3xl'>Notifications</span>
          <div className='flex justify-center flex-end'>
            <button className='text-Primary/Light hover:text-Primary/Target ml-72'>
              Marked all as read
            </button>
          </div>
        </div>
      </div>
      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={activeComponent === 'sidebar'}
          state='notifications'
          onClose={() => setActiveComponent(null)}
        />
      </div>

      {/* CollapseMenu */}
      <CollapseMenu
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={activeComponent === 'sidebar'}
        isTagListVisible={false} // Disable TagList
        sidebarButtonRef={sidebarButtonRef}
      />

      <div className='mb-6'>
        <div className='flex justify-center'>
          <div
            className={`mt-12 mx-6 sm:max-lg:mx-14 lg:mx-8 flex bg-Background/Bottom text-center mt-28 p-12 w-full h-32 border-Primary/Dark border-solid box-border border-2 rounded-3xl mb-2
    sm:max-lg:p-14 lg:max-xl:p-10 xl:p-12 lg:w-1/2 sm:max-lg:mt-28`}
          >
            <div className='mt-1 h-auto sm:max-lg:mt-3 lg:max-xl:mt-2 xl:mt-4'>
              <p className='text-left text-white text-l'>
                No notifications for now... Go explore{' '}
                <Link to='/feed' className='text-Accent/Target cursor-pointer inline'>
                  Codemunity
                </Link>{' '}
                or{' '}
                <Link to='/feed/me' className='text-Primary/Light cursor-pointer inline'>
                  share your own code
                </Link>{' '}
                !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Notifications;

