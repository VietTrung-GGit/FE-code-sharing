import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';

// Define interfaces for project data
export interface PinnedItem {
  id: string;
  name: string;
  avatar: string;
  total?: number;
  pinType: 'user' | 'group' | 'project'; // Adjust as needed
}
// Get popular posts/items
export const getPopular = async (): Promise<PinnedItem[]> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_POPULAR());
    console.log('Popular Items Response:', response.data);

    if (Array.isArray(response.data)) {
      return response.data as PinnedItem[];
    } else {
      console.error('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching popular items:', error);
    return [];
  }
};

export const pinItem = async (
  type: 'group' | 'user' | 'project',
  id: string,
): Promise<PinnedItem | null> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.PIN_ITEM(type, id));
    console.log(`Pinned ${type} with ID ${id}:`, response.data);

    if (response.data && typeof response.data === 'object') {
      return response.data as PinnedItem;
    } else {
      console.error('Unexpected response format:', response.data);
      return null;
    }
  } catch (error) {
    console.error(`Error pinning ${type} with ID ${id}:`, error);
    return null;
  }
};

// Get pinned items
export const getPinned = async (): Promise<PinnedItem[]> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_PINNED());
    console.log('Pinned Items Response:', response.data);

    if (Array.isArray(response.data)) {
      return response.data as PinnedItem[];
    } else {
      console.error('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching pinned items:', error);
    return [];
  }
};
// Unpin an item by position
export const unpinItem = async (position: number) => {
  const response = await axiosInstance.get(API_ENDPOINTS.UNPIN_ITEM(position + 1));
  return response.data;
};

// Get recent items
export const getRecent = async (): Promise<PinnedItem[]> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_RECENT());
    console.log('Recent Items Response:', response.data);

    if (Array.isArray(response.data)) {
      return response.data as PinnedItem[];
    } else {
      console.error('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching recent items:', error);
    return [];
  }
};

