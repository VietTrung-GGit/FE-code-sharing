import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';

// Define interfaces for user data

export interface UserDataFull {
  _id: string;
  displayname: string;
  createdAt: string;
  avatar: string;
  username: string;
  email: string;
  story: string;
  totalLikes: number;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
}

export interface UserPublicData {
  _id: string;
  displayname: string;
  createdAt: string;
  avatar: string;
  username: string;
  email: string;
  story: string;
  totalLikes: number;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
}

interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface UserBriefData {
  _id: string;
  displayname: string;
  avatar: string;
  username: string;
  totalLikes: number;
  totalFollowers: number;
  email: string;
}

// Function to update full user data (e.g., username, email, displayName, avatar)
export const getUserFullData = async (): Promise<UserDataFull> => {
  const postResponse = await axiosInstance.get<UserDataFull>(API_ENDPOINTS.FETCH_USER_DETAIL);
  return postResponse.data;
};

export const updateUserFullData = async (
  data: Partial<UserDataFull>,
  imageFile?: File,
): Promise<void> => {
  // Create FormData to send both user data and image
  const formData = new FormData();

  // Append regular user data fields (ensuring they are not undefined)
  Object.keys(data).forEach((key) => {
    // Skip 'avatar' if imageFile is provided to ensure no duplicate appending
    if (key === 'avatar' && imageFile) return;

    const value = data[key as keyof Partial<UserDataFull>];
    if (value !== undefined) {
      formData.append(key, String(value)); // Ensure value is a string
    }
  });

  // Append the new avatar if imageFile is provided
  if (imageFile) {
    formData.append('avatar', imageFile);
  }

  // Make the request
  await axiosInstance.put(API_ENDPOINTS.USER_DATA, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Function to update user password
export const updateUserPassword = async (data: UpdatePasswordData): Promise<void> => {
  await axiosInstance.put(API_ENDPOINTS.USER_PASSWORD_UPDATE, data);
};

export const followUser = async (userId: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.FOLLOW(userId));
  return response.data;
};

export const unfollowUser = async (userId: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.UNFOLLOW(userId));
  return response.data;
};

export const getUserBriefData = async (
  userId: string,
): Promise<{ user: UserBriefData; followed: boolean }> => {
  const response = await axiosInstance.get<{ user: UserBriefData; followed: boolean }>(
    API_ENDPOINTS.FETCH_BRIEF_DATA(userId),
  );
  return response.data;
};

export const getUserPublicData = async (
  userId: string,
): Promise<{ user: UserPublicData; followed: boolean }> => {
  const response = await axiosInstance.get<{ user: UserPublicData; followed: boolean }>(
    API_ENDPOINTS.FETCH_PUBLIC_DATA(userId),
  );
  return response.data;
};

// Fetch users
export const fetchUsers = async (
  page: number = 1,
  limit: number = 10,
  order: 'ascending' | 'descending' = 'ascending',
  criteria: 'searchquery' | 'dateJoined' | 'followers' | 'likes',
  search?: string,
): Promise<{ users: UserPublicData[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ users: UserPublicData[]; hasMore: boolean }>(
      API_ENDPOINTS.FETCH_USERS(page, limit, order, criteria, search),
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Fetch users
export const fetchGroupMembers = async (
  groupId: string,
  page: number = 1,
  limit: number = 10,
  order: 'ascending' | 'descending' = 'ascending',
  criteria: 'searchquery' | 'dateJoined' | 'followers' | 'likes',
  search?: string,
): Promise<{ users: UserPublicData[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ users: UserPublicData[]; hasMore: boolean }>(
      API_ENDPOINTS.GROUP_MEMBERS(groupId, page, limit, order, criteria, search),
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

