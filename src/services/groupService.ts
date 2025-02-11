import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';

// Define interfaces for group data

export interface GroupDataCreate {
  name: string;
  avatar: File;
  description: string;
  private: boolean;
  moderation: boolean;
}

export interface GroupData {
  _id: string;
  name: string;
  avatar: string;
  bio: string;
  private: boolean;
  moderation: boolean;
}

export interface GroupDataBrief {
  _id: string;
  name: string;
  avatar: string;
  bio: string;
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

// Create a new group
export const createGroup = async (groupData: GroupDataCreate): Promise<string> => {
  const formData = new FormData();

  Object.entries(groupData).forEach(([key, value]) => {
    if (key === 'avatar' && value instanceof File) {
      formData.append('avatar', value);
    } else if (typeof value !== 'undefined') {
      formData.append(key, value as string);
    }
  });

  const response = await axiosInstance.post<string>(API_ENDPOINTS.GROUP_CREATE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

// Update an existing group
export const updateGroup = async (groupId: string, groupData: GroupDataCreate): Promise<string> => {
  const formData = new FormData();

  Object.entries(groupData).forEach(([key, value]) => {
    if (key === 'avatar' && value instanceof File) {
      formData.append('avatar', value);
    } else if (typeof value !== 'undefined') {
      formData.append(key, value as string);
    }
  });

  const response = await axiosInstance.put<string>(API_ENDPOINTS.GROUP_UPDATE(groupId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

// Delete a group
export const deleteGroup = async (groupId: string): Promise<string> => {
  const response = await axiosInstance.delete<string>(API_ENDPOINTS.GROUP_DELETE(groupId));
  return response.data;
};

// Fetch full group data
export const getGroupFullData = async (groupId: string): Promise<any> => {
  const response = await axiosInstance.get(API_ENDPOINTS.GROUP_FULL_DATA(groupId));
  return response.data;
};

// Invite a user to a group
export const inviteToGroup = async (groupId: string, userId: string): Promise<string> => {
  const response = await axiosInstance.post<string>(API_ENDPOINTS.GROUP_INVITE(groupId), {
    userId,
  });
  return response.data;
};

// Remove a member from a group
export const removeGroupMember = async (
  groupId: string,
  removedUserId: string,
): Promise<string> => {
  const response = await axiosInstance.delete<string>(
    API_ENDPOINTS.GROUP_REMOVE_MEMBER(groupId, removedUserId),
  );
  return response.data;
};

// Assign an admin to a group
export const assignGroupAdmin = async (
  groupId: string,
  assignAdminUserId: string,
): Promise<string> => {
  const response = await axiosInstance.post<string>(
    API_ENDPOINTS.GROUP_ASSIGN_ADMIN(groupId, assignAdminUserId),
  );
  return response.data;
};

// Assign a new creator to a group
export const assignGroupCreator = async (
  groupId: string,
  assignCreatorUserId: string,
): Promise<string> => {
  const response = await axiosInstance.post<string>(
    API_ENDPOINTS.GROUP_ASSIGN_CREATOR(groupId, assignCreatorUserId),
  );
  return response.data;
};

