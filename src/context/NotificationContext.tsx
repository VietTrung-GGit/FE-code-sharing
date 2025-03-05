import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAuthUser } from '../context/AuthUserContext';
import { toast } from 'react-toastify';
import { io, Socket } from 'socket.io-client';
import { getUserNotifications, Notification } from '../services/notificationService';

// Context Type
type NotificationsContextType = {
  notifications: Notification[];
  fetchNotifications: (filter?: string, page?: number, limit?: number) => Promise<void>;
  decreateNotifCountByOne: () => void;
  decreateNotifCountByAll: () => void;
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

  const decreateNotifCountByOne = () => {
    setTotalNotifications((prev) => prev - 1);
  };

  const decreateNotifCountByAll = () => {
    setTotalNotifications(0);
  };

  useEffect(() => {
    if (isAuthenticated == true) {
      fetchNotifications();
      socket.current = io(`wss://${import.meta.env.VITE_BE_URL}`, {
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
        setTotalNotifications(totalNotifications + 1);
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
        decreateNotifCountByOne,
        decreateNotifCountByAll,
        totalNotifications,
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

