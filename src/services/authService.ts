import { axiosInstance } from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';

// Login User
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await axiosInstance.post<{
      refreshToken: string;
      accessToken: string;
      message: string;
    }>(API_ENDPOINTS.SIGNIN, { username, password }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Login failed';
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    await axiosInstance.post(API_ENDPOINTS.LOGOUT, {}, { withCredentials: true });
  } catch (error) {
    throw error.response?.data || 'Logout failed';
  }
};

// Refresh Token
export const refreshAccessToken = async () => {
  try {
    const response = await axiosInstance.post<{ newAccessToken: string }>(
      API_ENDPOINTS.REFRESH_TOKEN,
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
      API_ENDPOINTS.SIGNUP,
      { username, email, password },
      //    { withCredentials: true },
    );
    return response.data; // Successful sign up message
  } catch (error) {
    throw error.response?.data || 'Sign up failed';
  }
};

export const passwordReset = async (email: string) => {
  try {
    const response = await axiosInstance.post<{ message: string }>(
      API_ENDPOINTS.PASSWORDRESET,
      { email },
      //    { withCredentials: true },
    );
    return response.data.message; // Successful sign up message
  } catch (error) {
    throw error.response?.data || 'Error sending password reset request';
  }
};

export const passwordNew = async (token: string, newPassword: string) => {
  try {
    const response = await axiosInstance.post<{ message: string }>(
      API_ENDPOINTS.PASSWORDNEW(token),
      { newPassword },
      //    { withCredentials: true },
    );
    return response.data.message; // Successful sign up message
  } catch (error) {
    throw error.response?.data || 'Error sending password reset request';
  }
};

