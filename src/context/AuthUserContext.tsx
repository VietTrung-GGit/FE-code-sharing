import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser, logoutUser, refreshAccessToken, signupUser } from '../services/authService';
import { getUserFullData, updateUserFullData, UserDataFull } from '../services/userService';

interface AuthUserContextType {
  isAuthenticated: boolean;
  authLoading: boolean;
  user: UserDataFull | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (data: Partial<UserDataFull>, imageFile?: File) => Promise<void>;
}

interface AuthUserProviderProps {
  children: ReactNode;
}

const AuthUserContext = createContext<AuthUserContextType | undefined>(undefined);

export const useAuthUser = () => {
  const context = useContext(AuthUserContext);
  if (!context) {
    throw new Error('useAuthUser must be used within an AuthUserProvider');
  }
  return context;
};

export const AuthUserProvider: React.FC<AuthUserProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserDataFull | null>(null);
  const navigate = useNavigate();

  // Define fetchUserData as a local function
  const fetchUserData = async () => {
    try {
      const userData = await getUserFullData();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      toast.error('Failed to fetch user data');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const refreshedToken = await refreshAccessToken();
          if (refreshedToken) {
            localStorage.setItem('accessToken', refreshedToken);
            setIsAuthenticated(true);
            await fetchUserData(); // Call the local fetchUserData function
          } else {
            throw new Error('Invalid refresh token');
          }
        } catch (error) {
          console.error('Initialization failed:', error);
          handleLogout();
        }
      } else {
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('accessToken');
    navigate('/signin', { replace: true });
  };

  const login = async (username: string, password: string) => {
    try {
      const data = await loginUser(username, password);
      localStorage.setItem('accessToken', data.accessToken);
      setIsAuthenticated(true);
      await fetchUserData(); // Fetch user data after login
      navigate('/community/posts');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response.data || 'Login failed');
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      await signupUser(username, email, password);
      toast.success('Sign up successful!');
      await login(username, password); // Log in after successful signup
    } catch (error) {
      console.error('Sign up failed:', error);
      toast.error(error.response.data.message || 'Sign up failed');
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      handleLogout();
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
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleLogout();
    }
  };

  const updateUser = async (data: Partial<UserDataFull>, imageFile?: File) => {
    try {
      await updateUserFullData(data, imageFile);
      const updatedUserData = await getUserFullData();
      setUser(updatedUserData);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user data');
    }
  };

  return (
    <AuthUserContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        user,
        login,
        logout,
        signup,
        refreshToken,
        updateUser,
      }}
    >
      {children}
    </AuthUserContext.Provider>
  );
};

