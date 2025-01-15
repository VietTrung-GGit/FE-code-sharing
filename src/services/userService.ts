import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';

// Define interfaces for user data

interface UserData {
  displayName: string;
  avatarfile: File;
  username: string;
  email: string;
}

export interface UserDataFull {
  displayname: string;
  avatar: string;
  username: string;
  email: string;
}

interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
}

// Function to update full user data (e.g., username, email, displayName, avatar)
export const getUserFullData = async (): Promise<UserDataFull> => {
  const postResponse = await axiosInstance.get<UserDataFull>(API_ENDPOINTS.FETCH_USER_DETAIL);
  return postResponse.data;
};

// Function to update full user data (e.g., username, email, displayName, avatar)
export const updateUserFullData = async (
  data: Partial<UserData>,
  imageFile?: File,
): Promise<void> => {
  // Create FormData to send both user data and image
  const formData = new FormData();

  // Append regular user data fields (ensuring they are not undefined)
  Object.keys(data).forEach((key) => {
    const value = data[key as keyof Partial<UserData>];
    if (value !== undefined) {
      formData.append(key, String(value)); // Ensure value is a string
    }
  });

  // Check if imageFile is defined and append it
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

