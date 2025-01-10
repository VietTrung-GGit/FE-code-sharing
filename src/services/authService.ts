// src/services/authService.ts

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';
import { useUser } from '../context/UserContext';

// Define types for token response and authentication response
interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

// Log in and set tokens
export const signin = async (username: string, password: string) => {
    try {
        const response = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.SIGNIN, {
            username,
            password,
        });

        const { accessToken, refreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken); // Store tokens in localStorage
    } catch (error) {
        throw new Error('Login failed. Please check your credentials.');
    }
};

// Register and set tokens
export const signup = async (name: string, email: string, password: string) => {
    try {
        const response = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.SIGNUP, {
            name,
            email,
            password,
        });

        const { accessToken, refreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken); // Store tokens in localStorage
    } catch (error) {
        throw new Error('Registration failed. Please try again.');
    }
};

// Log out and remove tokens
export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/signin'; // Redirect to the sign-in page
};

// Refresh the access token using the refresh token
export const refreshAccessToken = async (): Promise<string> => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token found');

        const response = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.REFRESH_TOKEN, {
            token: refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken); // Store new refresh token

        return accessToken;
    } catch (error) {
        throw new Error('Token refresh failed. Please log in again.');
    }
};