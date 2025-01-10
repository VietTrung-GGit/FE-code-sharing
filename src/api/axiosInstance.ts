import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://api.example.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add Authorization token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        config.headers = config.headers || {};
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interface for response from refresh token endpoint
interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

// Add response interceptor to handle token refresh on 401
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check for 401 Unauthorized error and handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token available');

                // Make the request to refresh the access token
                const response = await axios.post<TokenResponse>('https://api.example.com/refresh-token', {
                    token: refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Save new access and refresh tokens to localStorage
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Update the Authorization header with the new access token
                axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

                // Return the original request with the new access token
                return axiosInstance(originalRequest);
            } catch (err) {
                // Remove tokens from storage if refresh fails and redirect to sign-in
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/signin';
                return Promise.reject(err);
            }
        }

        // If it's not a 401 error, just reject the promise
        return Promise.reject(error);
    }
);

export default axiosInstance;
