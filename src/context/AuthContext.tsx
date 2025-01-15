import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser, refreshAccessToken, signupUser } from '../services/authService';
import { toast } from 'react-toastify';

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
}

// Define the props type for AuthProvider component
interface AuthProviderProps {
  children: React.ReactNode;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [refreshTokenInvalid, setRefreshTokenInvalid] = useState<boolean>(false); // Tracks invalid refresh token
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');

      if (token) {
        try {
          const refreshedToken = await refreshAccessToken();
          if (refreshedToken) {
            localStorage.setItem('accessToken', refreshedToken);
            setIsAuthenticated(true);
          } else {
            throw new Error('Refresh token invalid');
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          setIsAuthenticated(false);
          setRefreshTokenInvalid(true); // Mark refresh token as invalid
          localStorage.removeItem('accessToken'); // Clear invalid token
          navigate('/signin', { replace: true }); // Redirect to sign-in
        }
      } else {
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    };

    checkAuthStatus();
  }, [navigate]);

  const login = async (username: string, password: string) => {
    try {
      const data = await loginUser(username, password);
      setIsAuthenticated(true);
      setRefreshTokenInvalid(false); // Reset invalid state on successful login
      localStorage.setItem('accessToken', data.accessToken);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error as string);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      await signupUser(username, email, password);
      await login(username, password);
    } catch (error) {
      console.error('Sign up failed:', error);
      toast.error(error as string);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
      navigate('/signin', { replace: true }); // Redirect to sign-in after logout
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const refreshToken = async () => {
    try {
      const newAccessToken = await refreshAccessToken();
      localStorage.setItem('accessToken', newAccessToken);
      setIsAuthenticated(true);
      setRefreshTokenInvalid(false); // Reset invalid state on successful token refresh
    } catch (error) {
      console.error('Token refresh failed:', error);
      setIsAuthenticated(false);
      setRefreshTokenInvalid(true); // Mark refresh token as invalid
      localStorage.removeItem('accessToken'); // Clear invalid token
      navigate('/signin', { replace: true }); // Redirect to sign-in
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        login,
        logout,
        refreshToken,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

