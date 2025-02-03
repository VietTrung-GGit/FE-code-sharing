import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';

// Define interfaces for group data

export interface GroupDataBrief {
  _id: string;
  name: string;
  avatar: string;
  avatarmembers: (string | undefined)[];
}

export const joinGroup = async (groupId: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.JOIN_GROUP(groupId));
  return response.data;
};

export const leaveGroup = async (groupId: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.LEAVE_GROUP(groupId));
  return response.data;
};

