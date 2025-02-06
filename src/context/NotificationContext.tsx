import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAuthUser } from '../context/AuthUserContext';
import { toast } from 'react-toastify';
import { io, Socket } from 'socket.io-client';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification, // Import the new function
  Notification,
} from '../services/notificationService';

// Context Type
type NotificationsContextType = {
  notifications: Notification[];
  fetchNotifications: (filter?: string, page?: number, limit?: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>; // Add to context type
  isConnected: boolean;
  hasMore: boolean;
  totalNotifications: number;
};

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const socket = useRef<Socket | null>(null);

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
    if (isAuthenticated == true) {
      socket.current = io('wss://8ps4hy-4000.csb.app', {
        withCredentials: true,
        transports: ['websocket'],
        query: {
          token: localStorage.getItem('accessToken'),
        },
      });

      socket.current.on('connect', () => {
        console.log('Socket.IO connected');
        setIsConnected(true);
      });

      socket.current.on('newNotification', (newNotification: Notification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        toast.info(`🔔 ${newNotification.senderName} ${newNotification.message}`);
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
    }
  }, [isAuthenticated]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        totalNotifications,
        deleteNotification: handleDeleteNotification, // Provide the function in context
        isConnected,
        hasMore,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

