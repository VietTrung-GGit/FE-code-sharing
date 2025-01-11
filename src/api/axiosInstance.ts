import axios from 'axios';

// Create an Axios instance
export const axiosInstance = axios.create({
  baseURL: 'https://nj9qlj-4000.csb.app',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true ,
});

// Add request interceptor to attach the access token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      if (config.headers) {
        (config.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
      } else {
        config.headers = { Authorization: `Bearer ${accessToken}` };
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Function to handle refreshing the access token
export const refreshAccessToken = async (): Promise<string> => {
  try {
    // Check if there's already an access token stored in localStorage
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      return storedToken; // Return early if token is already available
    }

    // Call refresh token endpoint; refreshToken is automatically included in the cookie
    const response = await axiosInstance.post<{ newAccessToken: string }>(
      '/auth/refresh',
      {},
      {
        withCredentials: true, // Send cookies with the request
      }
    );

    const { newAccessToken } = response.data;

    // Store the new access token in localStorage
    localStorage.setItem('accessToken', newAccessToken);

    return newAccessToken;
  } catch (error) {
    // Handle refresh token failure (e.g., redirect to login)
    console.error('Failed to refresh token', error);
    localStorage.removeItem('accessToken');
    window.location.href = '/signin';
    throw error; // Ensure we throw the error to break the process
  }
};


// Add response interceptor to handle 401 errors and refresh the token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the request fails with a 401, attempt to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
