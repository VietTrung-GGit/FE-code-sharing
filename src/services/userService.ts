import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';

// Define interfaces for user data

interface UserData {
  id: string;
  displayName: string;
  avatarfile: File;
  username: string;
  email: string;
}

interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
}

// Function to update full user data (e.g., username, email, displayName, avatar)
export const updateUserFullData = async (data: Partial<UserData>): Promise<void> => {
  await axiosInstance.put(API_ENDPOINTS.USER_DATA, data);
};

// Function to update user password
export const updateUserPassword = async (data: UpdatePasswordData): Promise<void> => {
  await axiosInstance.put(API_ENDPOINTS.USER_PASSWORD_UPDATE, data);
};

