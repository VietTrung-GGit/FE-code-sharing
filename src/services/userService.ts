import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';

// Define interfaces for user data

export interface UserDataFull {
  _id: string;
  displayname: string;
  createdAt: string;
  avatar: string;
  username: string;
  followed: boolean;
  email: string;
  story: string;
  totalLikes: number;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
}

export interface UserDataProfile {
  _id: string;
  displayname: string;
  avatar: string;
  username: string;
  email: string;
  story: string;
}

// export interface UserBriefData {
//   _id: string;
//   avatar: string;
//   createdAt: string;
//   displayname: string;
//   email: string;
//   followed: boolean;
//   following: UserPublicData[];
//   password: string;
//   pins: Record<string, any>[];
//   refreshTokens: string[];
//   role: 'admin' | 'user' | 'moderator';
//   totalComments: number;
//   totalFollowers: number;
//   totalFollowing: number;
//   totalLikes: number;
//   totalPosts: number;
//   updatedAt: string;
//   username: string;
//   __v: number;
// }

export interface UserPublicData {
  _id: string;
  displayname: string;
  createdAt: string;
  avatar: string;
  username: string;
  followed: boolean;
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
  followed: boolean;
  username: string;
  totalLikes: number;
  role: string;
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
): Promise<{ users: UserBriefData[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ users: UserBriefData[]; hasMore: boolean }>(
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
): Promise<{ users: UserBriefData[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ users: UserBriefData[]; hasMore: boolean }>(
      API_ENDPOINTS.GROUP_MEMBERS(groupId, page, limit, order, criteria, search),
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Fetch users
export const fetchUserFollowers = async (
  groupId: string,
  page: number = 1,
  limit: number = 10,
  order: 'ascending' | 'descending' = 'ascending',
  criteria: 'searchquery' | 'dateJoined' | 'followers' | 'likes',
  search?: string,
): Promise<{ users: UserBriefData[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ users: UserBriefData[]; hasMore: boolean }>(
      API_ENDPOINTS.USER_FOLLOWERS(groupId, page, limit, order, criteria, search),
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchSuggestedGroupUsers = async (
  groupId: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<{ users: UserBriefData[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ users: UserBriefData[]; hasMore: boolean }>(
      API_ENDPOINTS.GROUP_SUGGESTED_USERS(groupId),
      { params: { page, limit, search } },
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    throw error;
  }
};

export const fetchUninvitedProjectUsers = async (
  projectId: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<{ users: UserBriefData[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ users: UserBriefData[]; hasMore: boolean }>(
      API_ENDPOINTS.PROJECT_UNINVITED_USERS(projectId),
      { params: { page, limit, search } },
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching uninvited project users:', error);
    throw error;
  }
};

export const fetchUninvitedSectionUsers = async (
  sectionId: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<{ users: UserBriefData[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ users: UserBriefData[]; hasMore: boolean }>(
      API_ENDPOINTS.PROJECT_SECTION_UNINVITED_USERS(sectionId),
      { params: { page, limit, search } },
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching uninvited section users:', error);
    throw error;
  }
};

// Fetch users in a section
export const fetchSectionUsers = async (
  sectionId: string,
  page: number = 1,
  limit: number = 10,
  order: 'ascending' | 'descending' = 'ascending',
  criteria: 'searchquery' | 'dateJoined' | 'followers' | 'likes',
  search?: string,
): Promise<{ users: UserBriefData[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ users: UserBriefData[]; hasMore: boolean }>(
      API_ENDPOINTS.SECTION_USERS(sectionId, page, limit, order, criteria, search),
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching section users:', error);
    throw error;
  }
};

// Fetch users in a project
export const fetchProjectUsers = async (
  projectId: string,
  page: number = 1,
  limit: number = 10,
  order: 'ascending' | 'descending' = 'ascending',
  criteria: 'searchquery' | 'dateJoined' | 'followers' | 'likes',
  search?: string,
): Promise<{ users: UserBriefData[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ users: UserBriefData[]; hasMore: boolean }>(
      API_ENDPOINTS.PROJECT_USERS(projectId, page, limit, order, criteria, search),
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching project users:', error);
    throw error;
  }
};


// Invite users to a project
export const inviteProjectMembers = async (projectId: string, members: string[]) => {
  try {
    const response = await axiosInstance.post<{ message: string }>(
      API_ENDPOINTS.PROJECT_INVITE(projectId),
      { members },
    );
    return response.data;
  } catch (error) {
    console.error('Error inviting project members:', error);
    throw error;
  }
};

// Invite users to a group
export const inviteGroupMembers = async (groupId: string, members: string[]) => {
  try {
    const response = await axiosInstance.post<{ message: string }>(
      API_ENDPOINTS.GROUP_INVITE(groupId),
      { members },
    );
    return response.data;
  } catch (error) {
    console.error('Error inviting group members:', error);
    throw error;
  }
};

// Add participants to a section
export const addSectionParticipants = async (sectionId: string, members: string[]) => {
  try {
    const response = await axiosInstance.post<{ message: string }>(
      API_ENDPOINTS.SECTION_ADD_PARTICIPANT(sectionId),
      { members },
    );
    return response.data;
  } catch (error) {
    console.error('Error adding section participants:', error);
    throw error;
  }
};

