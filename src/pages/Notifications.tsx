import Sidebar from '../components/sidebar';
import CollapseMenu from '../components/collapseMenu';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/loadingAnimate';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { useState, useEffect, useRef, UIEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  Notification,
} from '../services/notificationService';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { formatDate } from '../utils/helpers';

function Notifications() {
  const [activeComponent, setActiveComponent] = useState<'sidebar' | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const socket = useRef<any>(null);
  const limit = 10;

  const fetchNotifications = async (
    filter: string = 'all',
    page: number = 1,
    limit: number = 5,
  ) => {
    try {
      const response = await getUserNotifications(filter, page, limit);
      const newNotifications = response.data.notifications;

      setNotifications((prev) => {
        const ids = new Set(prev.map((notif) => notif._id));
        return [...prev, ...newNotifications.filter((notif) => !ids.has(notif._id))];
      });
      setTotalNotifications(response.data.totalNotifications);
      setHasMore(response.data.hasMore); // Check if more notifications are available
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === notificationId ? { ...notif, isRead: true } : notif)),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
      setTotalNotifications(totalNotifications - 1);
      toast.success('Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  useEffect(() => {
    socket.current = io('wss://backendgdscdevteam3-2.onrender.com', {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    socket.current.on('connect', () => {
      console.log('Socket.IO connected');
      setIsConnected(true);
    });

    socket.current.on('notificationEvent', (newNotification: Notification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      toast.info(`🔔 ${newNotification.message}`);
    });

    socket.current.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    socket.current.on('error', (error: any) => {
      console.error('Socket.IO error:', error);
    });

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications('all', page, limit);
  }, [page]);

  // Infinite scroll handler
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (hasMore) {
        setPage((prev) => prev + 1); // Increment page to fetch more
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore]);

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
      <div className='flex flex-row'>
        <div className='flex ml-96 flex-col'>
          <div className='text-white mt-10 ml-4 space-x-2 inline-block flex lg:w-full '>
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

            <span className='text-3xl font-semibold'>Notifications</span>
            <div className='flex justify-center flex-end'>
              <button
                onClick={markAllAsRead}
                className='text-Primary/Light text-lg hover:text-Primary/Target ml-80'
              >
                Mark all as read
              </button>
            </div>
          </div>
          <div className='mb-6'>
            <div className='flex flex-col'>
              <div className='flex justify-center mt-8'>
                <p className='font-semibold text-lg text-white'>Recent</p>
              </div>

              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <button
                    key={notification._id}
                    className={`lg:mt-4 mx-6 sm:max-lg:mx-14 lg:mx-4 flex bg-Background/Bottom text-center mt-28 p-12 w-full h-28 border-Primary/Dark border-solid box-border border-2 rounded-3xl mb-
    sm:max-lg:p-14 lg:max-xl:p-10 xl:p-12 lg:w-full sm:max-lg:mt-28`}
                  >
                    <div className='ml-[585px] -mt-10 absolute'>
                      <Menu as='div' className='absolute'>
                        {/* The button that triggers the dropdown */}
                        <MenuButton className='px-4 py-2 text-white rounded hover:text-gray-300'>
                          <svg
                            width='24'
                            height='22'
                            viewBox='0 0 24 22'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M6 12C6 13.6569 4.6569 15 3 15C1.3431 15 0 13.6569 0 12C0 10.3431 1.3431 9 3 9C4.6569 9 6 10.3431 6 12Z'
                              fill='currentColor'
                            />
                            <path
                              d='M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z'
                              fill='currentColor'
                            />
                            <path
                              d='M21 15C22.6569 15 24 13.6569 24 12C24 10.3431 22.6569 9 21 9C19.3431 9 18 10.3431 18 12C18 13.6569 19.3431 15 21 15Z'
                              fill='currentColor'
                            />
                          </svg>
                        </MenuButton>

                        {/* Dropdown menu */}
                        <MenuItems className='absolute -right-48 top-4 w-48 bg-Background/Bottom border rounded-3xl border-2 border-Primary/Dark shadow-lg z-10'>
                          <ul className='py-1 my-3 ml-2'>
                            {/* Mark as Read option */}
                            {!notification.isRead && (
                              <MenuItem>
                                {({ active }: { active: boolean }) => (
                                  <button
                                    onClick={() => markAsRead(notification._id)}
                                    className={`block px-4 py-2 w-full text-left flex flex-row gap-4 text-white ${
                                      active ? 'bg-Background/Middle' : ''
                                    }`}
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </MenuItem>
                            )}

                            {/* Delete option */}
                            <MenuItem>
                              {({ active }: { active: boolean }) => (
                                <button
                                  onClick={() => handleDeleteNotification(notification._id)}
                                  className={`block px-4 py-2 w-full text-left flex flex-row gap-4 text-red-500 ${
                                    active ? 'bg-Background/Middle' : ''
                                  }`}
                                >
                                  Delete
                                </button>
                              )}
                            </MenuItem>
                          </ul>
                        </MenuItems>
                      </Menu>
                    </div>
                    <div className='flex flex-row gap-4 -ml-6 -mt-6'>
                      <div className='flex items-center min-w-[15px] min-h-[15px]'>
                        {!notification.isRead && (
                          <svg
                            width='15'
                            height='15'
                            viewBox='0 0 15 15'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M13.125 7.5C13.125 10.6066 10.6066 13.125 7.5 13.125C4.3934 13.125 1.875 10.6066 1.875 7.5C1.875 4.3934 4.3934 1.875 7.5 1.875C10.6066 1.875 13.125 4.3934 13.125 7.5Z'
                              fill='#9CE1E7'
                            />
                            <path
                              d='M13.125 7.5C13.125 10.6066 10.6066 13.125 7.5 13.125C4.3934 13.125 1.875 10.6066 1.875 7.5C1.875 4.3934 4.3934 1.875 7.5 1.875C10.6066 1.875 13.125 4.3934 13.125 7.5Z'
                              stroke='#9CE1E7'
                              stroke-width='3'
                              stroke-linecap='round'
                              stroke-linejoin='round'
                            />
                          </svg>
                        )}
                      </div>

                      <div className='flex justify-center'>
                        <img
                          src={
                            notification.avatar ||
                            'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                          } // Fallback for avatar
                          alt='Avatar'
                          className='w-16 h-16 rounded-full object-cover'
                        />
                      </div>
                      <div className='flex flex-col mt-0 justify-center'>
                        <div className='flex'>
                          <p className='text-white text-lg'>
                            <span className='text-Primary/Light'>{notification.senderName}</span>{' '}
                            {notification.message}
                          </p>
                        </div>
                        <div className='flex'>
                          <p className='text-Accent/Light'>{formatDate(notification.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div
                  className={`lg:mt-4 mx-6 sm:max-lg:mx-14 lg:mx-4 flex bg-Background/Bottom text-center mt-28 p-12 w-full h-28 border-Primary/Dark border-solid box-border border-2 rounded-3xl
    sm:max-lg:p-14 lg:max-xl:p-10 xl:p-12 lg:w-full sm:max-lg:mt-28`}
                >
                  <div className='mt-1 sm:max-lg:mt-3 lg:max-xl:mt-2 xl:-mt-2'>
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
              )}
            </div>
          </div>
        </div>

        <div className='flex flex-col ml-32 mt-28'>
          <div className='flex gap-24 mb-4 ml-2'>
            <button className='text-white text-lg font-semibold  hover:text-gray-300'>All</button>

            <button className='text-white text-lg font-semibold  hover:text-gray-300'>
              Unread (1)
            </button>
          </div>
          <div className=' flex flex-col gap-4'>
            <button className='text-Primary/Light hover:text-Primary/Target px-4 py-2 text-lg bg-Background/Bottom border-Primary/Dark border-solid box-border border-2 rounded-3xl text-white'>
              Following
            </button>
            <button className='text-Primary/Light hover:text-Primary/Target px-4 py-2 text-lg bg-Background/Bottom border-Primary/Dark border-solid box-border border-2 rounded-3xl text-white'>
              System
            </button>
            <button className='text-Primary/Light hover:text-Primary/Target px-4 py-2 text-lg bg-Background/Bottom border-Primary/Dark border-solid box-border border-2 rounded-3xl text-white'>
              Groups
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
    </div>
  );
}
export default Notifications;

