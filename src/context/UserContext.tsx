import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios'; // Ensure axios is installed and imported
import { API_ENDPOINTS } from '../api/endpoints'; // Replace with the actual path to your API endpoints
import { axiosInstance } from '../api/axiosInstance'; // Replace with your Axios configuration

// Define the types for the user context
interface UserContextType {
  userId: string | null;
  username: string | null;
  displayname: string | null;
  avatarUrl: string | undefined;
  email: string | null;
  setUser: (user: User) => void; // Function to set the user data
}

// Define the structure of the user data
interface User {
  userId: string | null;
  username: string | null;
  displayname: string | null;
  avatarUrl: string | undefined;
  email: string | null;
}

const defaultContextValue: UserContextType = {
  userId: null,
  username: null,
  displayname: null,
  avatarUrl: undefined,
  email: null,
  setUser: () => {},
};

// Create the context
const UserContext = createContext<UserContextType>(defaultContextValue);

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);

// UserProvider component with children prop type
interface UserProviderProps {
  children: ReactNode; // Accepts any valid React children
}

// Function to fetch full user data
interface UserDataFull {
  id: string;
  displayName: string;
  avatarfile: string;
  username: string;
  email: string;
  password: string;
}

export const getUserFullData = async (): Promise<UserDataFull> => {
  const response = await axiosInstance.get<UserDataFull>(API_ENDPOINTS.FETCH_USER_DETAIL);
  alert(response.data);
  return response.data;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>({
    userId: null,
    username: null,
    displayname: null,
    avatarUrl: undefined,
    email: null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserFullData();
        setUser({
          userId: userData.id,
          username: userData.username,
          displayname: userData.displayName,
          avatarUrl: userData.avatarfile,
          email: userData.email,
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return <UserContext.Provider value={{ ...user, setUser }}>{children}</UserContext.Provider>;
};

