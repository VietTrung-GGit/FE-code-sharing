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
  members: { avatar: string; role: string; user: string }[];
  name: string;
  numberOfMembers: number;
  numberOfPostsApproved: number;
  numberOfProjects: number;
  role: string;
}

export interface GroupDataBrief {
  _id: string;
  name: string;
  avatar: string;
  bio: string;
  private: boolean;
  totalPosts: number;
  totalMembers: number;
  joined: boolean;
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
      API_ENDPOINTS.FETCH_GROUPS(page, limit, order, criteria, search),
    );

    // Ensure the response contains valid data
    return {
      groups: response.data?.groups ?? [], // Default to an empty array if groups are undefined
      hasMore: response.data?.hasMore ?? false, // Default to false if hasMore is undefined
    };
  } catch (error) {
    console.error('Error fetching groups:', error);
    return { groups: [], hasMore: false }; // Return an empty safe response instead of throwing
  }
};

// Fetch user groups
export const fetchUserGroups = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  order: 'ascending' | 'descending' = 'ascending',
  criteria: 'dateCreated' | 'members' | 'posts',
  search?: string,
): Promise<{ groups: GroupDataBrief[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ groups: GroupDataBrief[]; hasMore: boolean }>(
      API_ENDPOINTS.USER_GROUPS(userId, page, limit, order, criteria, search),
    );

    // Ensure the response contains valid data
    return {
      groups: response.data?.groups ?? [], // Default to an empty array if groups are undefined
      hasMore: response.data?.hasMore ?? false, // Default to false if hasMore is undefined
    };
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return { groups: [], hasMore: false }; // Return an empty safe response instead of throwing
  }
};

export const joinGroup = async (groupId: string) => {
  const response = await axiosInstance.post(API_ENDPOINTS.GROUP_JOIN(groupId));
  return response.data;
};

export const leaveGroup = async (groupId: string) => {
  const response = await axiosInstance.post(API_ENDPOINTS.GROUP_LEAVE(groupId));
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
export const updateGroup = async (
  groupId: string,
  groupData: GroupDataCreate,
): Promise<GroupData> => {
  const formData = new FormData();

  Object.entries(groupData).forEach(([key, value]) => {
    if (key === 'avatar' && value instanceof File) {
      formData.append('avatar', value);
    } else if (typeof value !== 'undefined') {
      formData.append(key, value as string);
    }
  });

  const response = await axiosInstance.put<GroupData>(
    API_ENDPOINTS.GROUP_UPDATE(groupId),
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

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

// Remove an admin from a group
export const removeGroupAdmin = async (groupId: string, removeAdminUserId: string) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.GROUP_REMOVE_ADMIN(groupId, removeAdminUserId),
  );
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

