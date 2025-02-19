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

type PinnedContextType = {
  pinnedItems: PinnedItem[];
  popularItems: PinnedItem[];
  recentItems: PinnedItem[];
  pin: (type: 'group' | 'user' | 'project', id: string) => void;
  isPinned: (type: 'group' | 'user' | 'project', id: string) => boolean;
  unPin: (index: number) => void;
  refreshData: () => void;
};

const PinnedContext = createContext<PinnedContextType | undefined>(undefined);

export const PinnedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    fetchData();
  }, []);

  // Function to pin an item
  const pin = async (type: 'group' | 'user' | 'project', id: string) => {
    try {
      const newPinnedItem = await pinItem(type, id);
      if (newPinnedItem) {
        setPinnedItems((prev) => [...prev, newPinnedItem]);
      }
      toast.success('Pinned');
    } catch (error) {
      console.error('Error pinning item:', error);
    }
  };

  // Function to unpin an item
  const unPin = async (index: number) => {
    try {
      const itemToUnpin = pinnedItems[index];
      if (!itemToUnpin) return; // Prevent errors if index is invalid
      await unpinItem(index); // Use the item's ID instead of index
      setPinnedItems((prev) => prev.filter((_, i) => i !== index));
      toast.info('Unpin');
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

