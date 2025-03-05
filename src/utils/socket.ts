import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'wss://z2mmgh-4000.csb.app'; // Adjust as needed

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    socket.on('newNotification', (notification) => {
      console.log('New notification received:', notification);
      // Handle real-time notifications (e.g., show a toast)
    });

    socket.on('notificationUpdated', (updatedNotification) => {
      console.log('Notification updated:', updatedNotification);
    });

    socket.on('notificationDeleted', (deletedNotification) => {
      console.log('Notification deleted:', deletedNotification);
    });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitEvent = (event: string, data?: any) => {
  if (socket) {
    socket.emit(event, data);
  }
};

export const onEvent = (event: string, callback: (data: any) => void) => {
  if (socket) {
    socket.on(event, callback);
  }
};

