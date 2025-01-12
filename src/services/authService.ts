import { axiosInstance } from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

// Login User
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await axiosInstance.post<{
      refreshToken: string;
      accessToken: string;
      message: string;
    }>(`/auth/login`, { username, password }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Login failed';
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    await axiosInstance.post(`/auth/logout`, {}, { withCredentials: true });
  } catch (error) {
    throw error.response?.data || 'Logout failed';
  }
};

// Refresh Token
export const refreshAccessToken = async () => {
  try {
    const response = await axiosInstance.post<{ newAccessToken: string }>(
      `/auth/refresh`,
      {},
      { withCredentials: true }, // Ensure cookies are sent
    );
    return response.data.newAccessToken;
  } catch (error) {
    throw error.response?.data || 'Token refresh failed';
  }
};

export const signupUser = async (username: string, email: string, password: string) => {
  try {
    const response = await axiosInstance.post(
      `/auth/signup`,
      { username, email, password },
      //    { withCredentials: true },
    );
    return response.data; // Successful sign up message
  } catch (error) {
    throw error.response?.data || 'Sign up failed';
  }
};

