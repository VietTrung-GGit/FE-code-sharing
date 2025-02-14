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
  avatar: string;
  bio: string;
  canJoin: boolean;
  moderation: boolean;
  joined: boolean;
  members: string[];
  name: string;
  numberOfMembers: number;
  numberOfPosts: number;
  numberOfProjects: number;
}

export interface GroupDataBrief {
  _id: string;
  name: string;
  avatar: string;
  bio: string;
  private: boolean;
  visibleMembers: (string | undefined)[];
}

// Fetch groups
export const fetchGroups = async (
  page: number = 1,
  limit: number = 10,
  order: 'ascending' | 'descending' = 'ascending',
  criteria: 'dateCreated' | 'members' | 'posts',
  search?: string,
): Promise<{ groups: GroupDataBrief[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ groups: GroupDataBrief[]; hasMore: boolean }>(
      API_ENDPOINTS.FETCH_GROUPS(page, limit, search, order, criteria),
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

export const joinGroup = async (groupId: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.GROUP_JOIN(groupId));
  return response.data;
};

export const leaveGroup = async (groupId: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.GROUP_LEAVE(groupId));
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
export const getGroupFullData = async (groupId: string): Promise<GroupData> => {
  const response = await axiosInstance.get<GroupData>(API_ENDPOINTS.GROUP_FULL_DATA(groupId));
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

