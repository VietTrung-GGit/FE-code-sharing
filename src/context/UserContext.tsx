// src/contexts/UserContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserFullData, updateUserFullData, UserDataFull } from '../services/userService'; // Adjust the import path as needed

interface UserContextType {
  user: UserDataFull | null;
  loadinguser: boolean;
  erroruser: string | null;
  updateUser: (data: Partial<UserDataFull>, imageFile?: File) => Promise<void>;
}

// Typing the children prop for the provider
interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserDataFull | null>(null);
  const [loadinguser, setloadinguser] = useState(true);
  const [erroruser, seterroruser] = useState<string | null>(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserFullData();
        setUser(userData);
      } catch (err) {
        seterroruser('Failed to fetch user data');
      } finally {
        setloadinguser(false);
      }
    };

    fetchUserData();
  }, []);

  // Update user data
  const updateUser = async (data: Partial<UserDataFull>, imageFile?: File) => {
    try {
      // Call the update function from the service
      await updateUserFullData(data, imageFile);

      // Fetch updated user data and set it in the context
      const updatedUserData = await getUserFullData();
      setUser(updatedUserData);
    } catch (err) {
      seterroruser('Failed to update user data');
    }
  };

  return (
    <UserContext.Provider value={{ user, loadinguser, erroruser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

