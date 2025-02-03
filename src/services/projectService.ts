import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';

// Define interfaces for project data

export interface ProjectDataBrief {
  _id: string;
  name: string;
  avatar: string;
  group: string;
  avatarmembers: (string | undefined)[];
}

export const joinProject = async (projectId: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.JOIN_PROJECT(projectId));
  return response.data;
};

export const leaveProject = async (projectId: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.LEAVE_PROJECT(projectId));
  return response.data;
};

