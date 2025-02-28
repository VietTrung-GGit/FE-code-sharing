import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getPinned,
  getPopular,
  getRecent,
  unpinItem,
  PinnedItem,
  pinItem,
} from '../services/pinService'; // Adjust import based on your file structure
import { toast } from 'react-toastify';
import { useAuthUser } from '../context/AuthUserContext';

type PinnedContextType = {
  pinnedItems: PinnedItem[];
  popularItems: PinnedItem[];
  recentItems: PinnedItem[];
  pin: (type: 'group' | 'user' | 'project', id: string) => void;
  isPinned: (type: 'group' | 'user' | 'project', id: string) => boolean;
  unPin: (index?: number, id?: string) => void;
  refreshData: () => void;
};

const PinnedContext = createContext<PinnedContextType | undefined>(undefined);

export const PinnedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthUser();
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [popularItems, setPopularItems] = useState<PinnedItem[]>([]);
  const [recentItems, setRecentItems] = useState<PinnedItem[]>([]);

  // Fetch all data on mount
  const fetchData = async () => {
    try {
      const [pinned, popular, recent] = await Promise.all([getPinned(), getPopular(), getRecent()]);
      setPinnedItems(pinned);
      setPopularItems(popular);
      setRecentItems(recent);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Function to pin an item
  const pin = async (type: 'group' | 'user' | 'project', id: string) => {
    try {
      const newPinnedItem = await pinItem(type, id);
      console.log('new');
      console.log(newPinnedItem);
      if (newPinnedItem) {
        setPinnedItems((prev) => [...prev, newPinnedItem]);
      }
      toast.success('Pinned');
    } catch (error) {
      console.error('Error pinning item:', error);
    }
  };

  const unPin = async (index?: number, id?: string) => {
    try {
      // Find the index if only id is provided
      if (index === undefined && id !== undefined) {
        const foundIndex = pinnedItems.findIndex((item) => item.id === id);
        if (foundIndex === -1) return; // Return if no matching item is found
        index = foundIndex; // Assign the found index
      }

      // Ensure the index is valid
      if (index === undefined) return;

      await unpinItem(index); // API requires index

      setPinnedItems((prev) => prev.filter((_, i) => i !== index));

      toast.info('Unpinned');
    } catch (error) {
      console.error('Error unpinning item:', error);
    }
  };

  // Function to check if an item is already pinned
  const isPinned = (type: 'group' | 'user' | 'project', id: string): boolean => {
    return pinnedItems.some((item) => item.id === id && item.pinType === type);
  };

  // Refresh all data
  const refreshData = () => {
    fetchData();
  };

  return (
    <PinnedContext.Provider
      value={{ pinnedItems, popularItems, recentItems, pin, isPinned, unPin, refreshData }}
    >
      {children}
    </PinnedContext.Provider>
  );
};

// Custom hook for easy usage
export const usePinned = () => {
  const context = useContext(PinnedContext);
  if (!context) {
    throw new Error('usePinned must be used within a PinnedProvider');
  }
  return context;
};

