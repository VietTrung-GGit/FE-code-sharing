import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, refreshAccessToken, signupUser } from '../services/authService';
import { toast } from 'react-toastify';

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
  refreshToken: () => void;
  signup: (username: string, email: string, password: string) => void;
}

// Define the props type for AuthProvider component
interface AuthProviderProps {
  children: React.ReactNode;
}

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
  const [authLoading, setAuthLoading] = useState<boolean>(true); // Track authentication loading state

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
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error checking token:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setAuthLoading(false); // Ensure this runs after the state has been set
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const data = await loginUser(username, password);
      setIsAuthenticated(true);
      localStorage.setItem('accessToken', data.accessToken);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      await signupUser(username, email, password);
      await login(username, password);
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const newAccessToken = await refreshAccessToken();
      localStorage.setItem('accessToken', newAccessToken);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      console.error('Token refresh failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, authLoading, login, logout, refreshToken, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

