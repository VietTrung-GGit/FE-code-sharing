import { axiosInstance } from '../api/axiosInstance';

export type Notification = {
  userId: string;
  senderId: string;
  senderName: string;
  message: string;
  avatar: string;
  type: string;
  relatedEntityId: string;
  entityType: string;
  extraData: string;
  _id: string;
  createdAt: string;
  isRead: boolean;
};

export const createNotification = async (data: any) => {
  return await axiosInstance.post('/notification', data);
};

export const createLikeNotification = async (postId: string) => {
  return await axiosInstance.post(`/notification/like/${postId}`);
};

export const createCommentNotification = async (commentId: string) => {
  return await axiosInstance.post(`/notification/comment/${commentId}`);
};

export const getUserNotifications = async (
  filter: string = 'all',
  page: number = 1,
  limit: number = 5,
) => {
  return await axiosInstance.get<{
    notifications: Notification[];
    hasMore: boolean;
    totalNotifications: number;
  }>(`/notification`, {
    params: { filter, page, limit },
  });
};

export const getNotificationDetail = async (notificationId: string) => {
  return await axiosInstance.get(`/notification/${notificationId}/detail`);
};

export const markNotificationAsRead = async (notificationId: string) => {
  return await axiosInstance.post(`/notification/${notificationId}/read`);
};

export const markAllNotificationsAsRead = async () => {
  return await axiosInstance.post(`/notification/read`);
};

export const deleteNotification = async (notificationId: string) => {
  return await axiosInstance.delete(`/notification/${notificationId}/delete`);
};

