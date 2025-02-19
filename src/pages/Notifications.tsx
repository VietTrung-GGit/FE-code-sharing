import Sidebar from '../components/sidebar';
import CollapseMenu from '../components/collapseMenu';
import QuickNav from '../components/quickNav';
import { useParams, useNavigate } from 'react-router-dom';
import { IoIosMore } from 'react-icons/io';
import { FaCircle } from 'react-icons/fa';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { BsFillGearFill, BsGear } from 'react-icons/bs';
import { BiCategory, BiSolidCategory } from 'react-icons/bi';
import { HiUsers, HiOutlineUsers } from 'react-icons/hi';
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
  confirmGroupInvite,
  confirmProjectInvite,
} from '../services/notificationService';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { formatDate } from '../utils/helpers';
type PostType = 'stored' | 'me' | undefined;

interface Params extends Record<string, string | undefined> {
  type: PostType;
}
function Notifications() {
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'quicknav' | null>(null);
  const [buttonRead, setButtonRead] = useState<'all' | 'unread'>('all');
  const [buttonFilter, setButtonFilter] = useState<'all' | 'system' | 'following' | 'groups'>(
    'all',
  );
  const sidebarRef = useRef<HTMLDivElement>(null);
  const quickNavRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const quickNavButtonRef = useRef<HTMLButtonElement>(null);

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
  const toggleQuickNav = () => {
    setActiveComponent((prev) => (prev === 'quicknav' ? null : 'quicknav'));
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !sidebarRef.current?.contains(target) &&
        !quickNavRef.current?.contains(target) &&
        !sidebarButtonRef.current?.contains(target) &&
        !quickNavButtonRef.current?.contains(target)
      ) {
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
      <div className='flex flex-row justify-center -mt-10 sm:max-lg:mt-16 lg:mt-0 mx-6 sm:max-lg:mx-0 lg:mx-8'>
        <div className='flex flex-col '>
          <div className='text-white mt-10 ml-6 space-x-2 inline-block flex lg:w-full '>
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
              {/* <div className='flex gap-24 ml-6 mt-6 '>
                <button
                  className={`${buttonRead === 'all' ? ' text-white' : 'text-gray-500'} text-xl font-semibold`}
                  onClick={() => setButtonRead('all')}
                >
                  All
                </button>

                <button
                  className={`${buttonRead === 'unread' ? 'text-white' : 'text-gray-500'} text-xl font-semibold`}
                  onClick={() => setButtonRead('unread')}
                >
                  Unread (1)
                </button>
              </div> */}
              <div className='flex justify-center mt-4'>
                <p className='font-semibold text-lg text-white'>Recent</p>
              </div>

              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <button
                    key={notification._id}
                    className={`lg:mt-4 mx-6 sm:max-lg:mx-14 lg:mx-4 flex bg-Background/Bottom text-center mt-28 p-12 w-full h-28 ${
                      !notification.isRead ? 'border-Primary/Light' : 'border-Primary/Dark'
                    } border-solid box-border border-2 rounded-3xl mb-
sm:max-lg:p-14 lg:max-xl:p-10 xl:p-12 lg:w-full sm:max-lg:mt-28`}
                  >
                    <div className='ml-[530px] -mt-10 absolute'>
                      <Menu as='div' className='absolute'>
                        <MenuButton className='px-4 py-2 text-white text-3xl rounded hover:text-gray-300'>
                          <IoIosMore />
                        </MenuButton>

                        {/* Dropdown menu */}
                        <MenuItems
                          className={`absolute z-20 -right-44 top-8 w-48 bg-Background/Bottom border rounded-3xl border-2 ${
                            !notification.isRead ? 'border-Primary/Light' : 'border-Primary/Dark'
                          } shadow-lg z-10`}
                        >
                          <ul className='py-1 my-3 ml-2'>
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

                    <div className='flex flex-row gap-4 -ml-6 -mt-6 items-center justify-between w-full'>
                      {/* Notification Indicator */}
                      <div className='flex items-center min-w-[15px] min-h-[15px]'>
                        {!notification.isRead && (
                          <FaCircle className='text-md text-Primary/Light' />
                        )}
                      </div>

                      {/* Avatar */}
                      <div className='flex justify-center'>
                        <img
                          src={
                            notification.avatar ||
                            'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                          }
                          alt='Avatar'
                          className='w-16 h-16 rounded-full object-cover'
                        />
                      </div>

                      {/* Message Content */}
                      <div className='flex flex-col justify-center flex-grow'>
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

                      {/* Confirm Button (Aligned Right) */}
                      {notification.type === 'invite' && (
                        <button
                          onClick={async () => {
                            await markAsRead(notification._id); // Mark notification as read

                            if (notification.type === 'invitegroup') {
                              await confirmGroupInvite(notification.senderId);
                            } else {
                              await confirmProjectInvite(notification.senderId);
                            }
                          }}
                          className='ml-auto px-4 py-2 bg-Accent/Target text-white rounded-lg'
                        >
                          Confirm
                        </button>
                      )}
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
      </div>

      <div className='lg:hidden'>
        <QuickNav
          isOpen={activeComponent === 'quicknav'}
          onClose={() => setActiveComponent(null)}
        />
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
        onToggleQuickNav={toggleQuickNav}
        isSidebarOpen={activeComponent === 'sidebar'}
        isQuickNavOpen={activeComponent === 'quicknav'}
        sidebarButtonRef={sidebarButtonRef}
        quickNavButtonRef={quickNavButtonRef}
      />
    </div>
  );
}
export default Notifications;

