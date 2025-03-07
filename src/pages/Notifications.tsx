import Sidebar from '../components/sidebar';
import CollapseMenu from '../components/collapseMenu';
import QuickNav from '../components/quickNav';
import { IoIosMore, IoMdCheckmark } from 'react-icons/io';
import { FaCircle } from 'react-icons/fa';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { BsFillGearFill, BsGear } from 'react-icons/bs';
import { BiCategory, BiSolidCategory, BiTrashAlt } from 'react-icons/bi';
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
import { formatDate, formatNumber } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';
import { IoCheckmarkDone } from 'react-icons/io5';
import { useNotifications } from '../context/NotificationContext';
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
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const limit = 10;
  const { decreateNotifCountByOne, decreateNotifCountByAll } = useNotifications();

  const fetchNotifications = async (
    filter: string = 'all',
    page: number = 1,
    limit: number = 5,
    category: string = 'all',
  ) => {
    try {
      setLoading(true);
      const response = await getUserNotifications(filter, page, limit, category);
      const newNotifications = response.data.notifications;

      setNotifications((prev) => {
        const ids = new Set(prev.map((notif) => notif._id));
        return [...prev, ...newNotifications.filter((notif) => !ids.has(notif._id))];
      });
      setTotalNotifications(response.data.totalUnreadNotifications);
      setHasMore(response.data.hasMore); // Check if more notifications are available
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === notificationId ? { ...notif, isRead: true } : notif)),
      );
      decreateNotifCountByOne();
      setTotalNotifications((prev) => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setTotalNotifications(0);
      decreateNotifCountByAll();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notification: Notification) => {
    try {
      await deleteNotification(notification._id);
      setNotifications((prev) => prev.filter((notif) => notif._id !== notification._id));
      if (!notification.isRead) {
        setTotalNotifications(totalNotifications - 1);
        decreateNotifCountByOne();
      }
      toast.success('Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setLoading(true);

    // Reset relevant state based on active tab
    setNotifications([]);
  }, [buttonRead, buttonFilter]);

  useEffect(() => {
    if (hasMore == true) {
      if (notifications.length === 0) fetchNotifications(buttonRead, page, limit, buttonFilter);
    }
  }, [notifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(buttonRead, page, limit, buttonFilter);
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

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const handleOptionSelect = () => {
      setIsDropdownOpen(false); // Close after selection
    };
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
    return (
      <div
        key={notification._id}
        className={`${
          theme === 'original'
            ? 'bg-Background/Bottom text-white border-2 border-Primary/Dark'
            : 'bg-[var(--surface)] text-[var(--text)]'
        } ${
          !notification.isRead ? 'border-[var(--text-title)]' : 'border-Primary/Dark'
        }  relative w-[94vw] sm:w-[94vw] lg:w-[48vw] xl:min-w-[700px] my-2  rounded-3xl px-2 xsm:px-10 py-4 lg:mx-4 flex justify-center`}
      >
        <div className='absolute right-4 lg:right-3 top-2' ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className='hover:text-[var(--text-hovered)] text-3xl'
          >
            <IoIosMore />
          </button>
          {isDropdownOpen && (
            <div
              className={`${
                theme === 'original'
                  ? 'bg-Background/Bottom text-white border-2'
                  : 'bg-[var(--surface)] text-[var(--text)]'
              } border-Primary/Dark absolute -right-2 xsm:-right-10 sm:-right-[50px] lg:-right-40 w-40 md:w-52 rounded-xl shadow-lg z-10`}
            >
              <ul className='py-2 text-sm'>
                {!notification.isRead && (
                  <li>
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className='block px-4 py-2 w-full text-left flex flex-row gap-4 hover:bg-[var(--background-hovered)] transition'
                    >
                      <IoMdCheckmark className='text-xl' />
                      Mark as read
                    </button>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => handleDeleteNotification(notification)}
                    className='block px-4 py-2 w-full text-left flex flex-row gap-4 text-red-500 hover:bg-[var(--background-hovered)] transition'
                  >
                    <BiTrashAlt className='text-xl' />
                    Delete
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className='flex xsm:-ml-6 xsm:gap-4 gap-2 items-center justify-between w-full'>
          <div className='flex items-center min-w-[15px] min-h-[15px]'>
            {!notification.isRead && <FaCircle className='text-base text-Accent/Target' />}
          </div>
          <div className='flex justify-center'>
            <img
              src={notification.senderAvatar || import.meta.env.VITE_DEFAULT_AVATAR}
              alt='Avatar'
              className='w-16 h-16 rounded-full object-cover flex-shrink-0'
            />
          </div>
          <div className='flex flex-col justify-center flex-grow'>
            <div className='flex'>
              <p className=' text-sm xsm:text-base sm:text-lg'>
                <Link
                  to={`/user/${notification.senderId}/posts`}
                  className='text-[var(--text-title)] hover:underline'
                >
                  {notification.senderName}
                </Link>{' '}
                {notification.message}{' '}
                <Link
                  to={
                    notification.entityType === 'Group'
                      ? `/group/${notification.relatedEntityId}/posts`
                      : notification.entityType === 'Post'
                        ? `/post/${notification.relatedEntityId}`
                        : notification.entityType === 'User'
                          ? `/user/${notification.relatedEntityId}/posts`
                          : notification.entityType === 'Project' ||
                              notification.entityType == 'Section'
                            ? `/project/${notification.relatedEntityId}/sections/root/posts`
                            : '#'
                  }
                  className='text-[var(--text-title)] hover:underline'
                >
                  {notification.extraData}
                </Link>
              </p>
            </div>
            <div className='flex'>
              <p className='text-[var(--green-highlight)] text-sm sm:text-base'>
                {formatDate(notification.createdAt)}
              </p>
            </div>
          </div>
          {notification.type.includes('invite') && !notification.isRead && (
            <div className='flex flex-col items-end gap-2'>
              <button
                onClick={async () => {
                  await markAsRead(notification._id);
                  if (notification.type === 'group_invite') {
                    await confirmGroupInvite(notification.relatedEntityId, true);
                  } else {
                    await confirmProjectInvite(notification.relatedEntityId, true);
                  }
                }}
                className={`${
                  theme === 'original'
                    ? 'bg-Accent/Target text-white hover:text-Accent/Target hover:bg-white'
                    : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border border-[var(--border)] text-Accent/Target'
                } px-4 py-1 rounded-lg w-20 md:w-24`}
              >
                Accept
              </button>

              <button
                onClick={async () => {
                  await markAsRead(notification._id);
                  if (notification.type === 'group_invite') {
                    await confirmGroupInvite(notification.relatedEntityId, false);
                  } else {
                    await confirmProjectInvite(notification.relatedEntityId, false);
                  }
                }}
                className={`${
                  theme === 'original'
                    ? 'bg-gray-500 text-white hover:text-gray-500 hover:bg-white'
                    : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border border-[var(--border)]'
                } px-4 py-1 rounded-lg w-20 md:w-24`}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='bg-[var(--background)] text-[var(--text)] relative min-h-screen flex flex-col'>
      <div className='flex flex-row justify-center -mt-10 sm:max-lg:mt-16 lg:mt-0'>
        <div className='flex flex-col justify-center w-[94vw] sm:w-[94vw] lg:w-[50vw] xl:min-w-[730px]'>
          <div className=' mt-32 sm:mt-10 mx-6 inline-block flex justify-between'>
            <span className='lg:text-3xl xxsm:text-2xl text-xl font-semibold'>Notifications</span>

            <div className='flex'>
              <button
                onClick={markAllAsRead}
                className='flex items-center text-[var(--text-title)] lg:text-lg text-base hover:text-[var(--text-hovered)]'
              >
                <IoCheckmarkDone className='lg:text-2xl xsm:text-lg text-base mr-1' /> Mark all as
                read
              </button>
            </div>
          </div>

          <div className='mb-6'>
            <div className='flex flex-col'>
              <div className='flex gap-16 xxsm:gap-20 sm:gap-24 ml-6 my-6 '>
                <button
                  className={`${buttonRead === 'all' ? ' ' : 'text-gray-500'} text-lg xxsm:text-xl font-semibold`}
                  onClick={() => setButtonRead('all')}
                >
                  All
                </button>

                <button
                  className={`${buttonRead === 'unread' ? '' : 'text-gray-500'} text-lg xxsm:text-xl font-semibold`}
                  onClick={() => setButtonRead('unread')}
                >
                  Unread ({formatNumber(totalNotifications)})
                </button>
              </div>
              <div
                className={`bg-[var(--background-side)] text-[var(--text)] border-[var(--border)] border-2 flex flex-col w-full border-solid box-border rounded-3xl h-[150px] sm:h-[80px] justify-center lg:hidden mb-8`}
              >
                <div className=' flex flex-row justify-center space-x-4 xsm:space-x-10 sm:space-x-4 px-4 sm:px-8'>
                  <div className='flex flex-col sm:flex-row sm:space-x-4'>
                    <button
                      className={`${buttonFilter === 'all' ? 'text-[var(--text-title)]' : ''} hover:text-[var(--text-title)] hover:bg-[var(--input)] rounded-md px-2 py-2 text-lg flex flex-row gap-3 sm:gap-4`}
                      onClick={() => setButtonFilter('all')}
                    >
                      {buttonFilter === 'all' ? (
                        <BiSolidCategory className='text-2xl sm:text-3xl flex-shrink-0' />
                      ) : (
                        <BiCategory className='text-2xl sm:text-3xl flex-shrink-0' />
                      )}
                      All
                    </button>

                    <button
                      className={`${buttonFilter === 'system' ? 'text-[var(--text-title)]' : ''} hover:text-[var(--text-title)] hover:bg-[var(--input)] rounded-md px-2 py-2 text-lg flex flex-row gap-3 sm:gap-4`}
                      onClick={() => setButtonFilter('system')}
                    >
                      {buttonFilter === 'system' ? (
                        <BsFillGearFill className='text-2xl sm:text-3xl flex-shrink-0' />
                      ) : (
                        <BsGear className='text-2xl sm:text-3xl flex-shrink-0' />
                      )}
                      System
                    </button>
                  </div>
                  <div className='flex flex-col sm:flex-row sm:space-x-4'>
                    <button
                      className={`${buttonFilter === 'following' ? 'text-[var(--text-title)]' : ''} hover:text-[var(--text-title)] hover:bg-[var(--input)] rounded-md px-2 py-2 text-lg flex flex-row gap-3 sm:gap-4`}
                      onClick={() => setButtonFilter('following')}
                    >
                      {buttonFilter === 'following' ? (
                        <AiFillHeart className='text-2xl sm:text-3xl flex-shrink-0' />
                      ) : (
                        <AiOutlineHeart className='text-2xl sm:text-3xl flex-shrink-0' />
                      )}
                      Following
                    </button>
                    <button
                      className={`${buttonFilter === 'groups' ? 'text-[var(--text-title)]' : ''} hover:text-[var(--text-title)] hover:bg-[var(--input)] rounded-md px-2 py-2 text-lg flex flex-row gap-3 sm:gap-4`}
                      onClick={() => setButtonFilter('groups')}
                    >
                      {buttonFilter === 'groups' ? (
                        <HiUsers className='text-2xl sm:text-3xl flex-shrink-0' />
                      ) : (
                        <HiOutlineUsers className='text-2xl sm:text-3xl flex-shrink-0' />
                      )}
                      Groups
                    </button>
                  </div>
                </div>
              </div>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem notification={notification} />
                ))
              ) : !loading ? (
                <div
                  className={`${
                    theme === 'original'
                      ? 'bg-Background/Bottom text-white border-2'
                      : 'bg-[var(--surface)] text-[var(--text)]'
                  } h-32 border-Primary/Dark px-6 py-4 w-[94vw] sm:w-[94vw] lg:w-[48vw] xl:min-w-[700px] flex items-center justify-center rounded-3xl
    border-solid box-border mt-3 lg:mt-0 lg:mx-4`}
                >
                  <div>
                    <p className='text-left text-l'>
                      No notifications for now... Go explore{' '}
                      <Link to='/feed' className='text-Accent/Target cursor-pointer inline'>
                        Codemunity
                      </Link>{' '}
                      for more interesting content!
                    </p>
                  </div>
                </div>
              ) : (
                <LoadingSpinner />
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`bg-[var(--background-side)] text-[var(--text)] border-[var(--border)] border-2 fixed top-40 right-4 xl:right-6 flex flex-col lg:w-[21vw] xl:w-[18vw] border-solid box-border rounded-3xl h-[280px] justify-center items-center max-lg:invisible`}
      >
        <div className=' flex flex-col gap-3 justify-center'>
          <button
            className={`${buttonFilter === 'all' ? 'text-[var(--text-title)]' : ''} hover:text-[var(--text-title)] hover:bg-[var(--input)] rounded-md px-2 py-2 text-lg flex flex-row gap-4`}
            onClick={() => setButtonFilter('all')}
          >
            {buttonFilter === 'all' ? (
              <BiSolidCategory className='text-3xl flex-shrink-0' />
            ) : (
              <BiCategory className='text-3xl flex-shrink-0' />
            )}
            All
          </button>

          <button
            className={`${buttonFilter === 'system' ? 'text-[var(--text-title)]' : ''} hover:text-[var(--text-title)] hover:bg-[var(--input)] rounded-md px-2 py-2 text-lg flex flex-row gap-4`}
            onClick={() => setButtonFilter('system')}
          >
            {buttonFilter === 'system' ? (
              <BsFillGearFill className='text-3xl flex-shrink-0' />
            ) : (
              <BsGear className='text-3xl flex-shrink-0' />
            )}
            System
          </button>
          <button
            className={`${buttonFilter === 'following' ? 'text-[var(--text-title)]' : ''} hover:text-[var(--text-title)] hover:bg-[var(--input)] rounded-md px-2 py-2 text-lg flex flex-row gap-4`}
            onClick={() => setButtonFilter('following')}
          >
            {buttonFilter === 'following' ? (
              <AiFillHeart className='text-3xl flex-shrink-0' />
            ) : (
              <AiOutlineHeart className='text-3xl flex-shrink-0' />
            )}
            Following
          </button>
          <button
            className={`${buttonFilter === 'groups' ? 'text-[var(--text-title)]' : ''} hover:text-[var(--text-title)] hover:bg-[var(--input)] rounded-md px-2 py-2 text-lg flex flex-row gap-4`}
            onClick={() => setButtonFilter('groups')}
          >
            {buttonFilter === 'groups' ? (
              <HiUsers className='text-3xl flex-shrink-0' />
            ) : (
              <HiOutlineUsers className='text-3xl flex-shrink-0' />
            )}
            Groups
          </button>
        </div>
      </div>
      <div className='lg:hidden' ref={quickNavRef}>
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

