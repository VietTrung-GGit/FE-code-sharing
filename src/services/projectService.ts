import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';
import { GroupDataBrief } from './groupService';

export interface ProjectDataBrief {
  _id: string;
  name: string;
  avatar: string;
  groupData: GroupDataBrief[];
  group: string;
  visibleMembers: (string | undefined)[];
}

export interface ProjectDataCreate {
  name: string;
  avatar: File;
  description: string;
}

// Fetch projects
export const fetchProjects = async (
  page: number = 1,
  limit: number = 10,
  order: 'ascending' | 'descending' = 'ascending',
  criteria: 'dateCreated' | 'members' | 'posts',
  search?: string,
): Promise<{ projects: ProjectDataBrief[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ projects: ProjectDataBrief[]; hasMore: boolean }>(
      API_ENDPOINTS.FETCH_PROJECTS(page, limit, search, order, criteria),
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Fetch projects
export const fetchGroupProjects = async (
  groupId: string,
  page: number = 1,
  limit: number = 10,
  order: 'ascending' | 'descending' = 'ascending',
  criteria: 'dateCreated' | 'members' | 'posts',
  search?: string,
): Promise<{ projects: ProjectDataBrief[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ projects: ProjectDataBrief[]; hasMore: boolean }>(
      API_ENDPOINTS.GROUP_PROJECTS(groupId, page, limit, order, criteria, search),
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Fetch projects
export const fetchUserProjects = async (
  groupId: string,
  page: number = 1,
  limit: number = 10,
  order: 'ascending' | 'descending' = 'ascending',
  criteria: 'dateCreated' | 'members' | 'posts',
  search?: string,
): Promise<{ projects: ProjectDataBrief[]; hasMore: boolean }> => {
  try {
    const response = await axiosInstance.get<{ projects: ProjectDataBrief[]; hasMore: boolean }>(
      API_ENDPOINTS.USER_PROJECTS(groupId, page, limit, order, criteria, search),
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const joinProject = async (projectId: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.JOIN_PROJECT(projectId));
  return response.data;
};

export const leaveProject = async (projectId: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.LEAVE_PROJECT(projectId));
  return response.data;
};

// Create a new group
export const createProject = async (
  groupId: string,
  groupData: ProjectDataCreate,
): Promise<string> => {
  const formData = new FormData();

  Object.entries(groupData).forEach(([key, value]) => {
    if (key === 'avatar' && value instanceof File) {
      // formData.append('avatar', value);
    } else if (typeof value !== 'undefined') {
      formData.append(key, value as string);
    }
  });

  const response = await axiosInstance.post<string>(
    API_ENDPOINTS.PROJECT_CREATE(groupId),
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  return response.data;
};

// Update an existing group
export const updateProject = async (
  groupId: string,
  groupData: ProjectDataCreate,
): Promise<string> => {
  const formData = new FormData();

  Object.entries(groupData).forEach(([key, value]) => {
    if (key === 'avatar' && value instanceof File) {
      formData.append('avatar', value);
    } else if (typeof value !== 'undefined') {
      formData.append(key, value as string);
    }
  });

  const response = await axiosInstance.put<string>(
    API_ENDPOINTS.PROJECT_UPDATE(groupId),
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  return response.data;
};

// Delete a project
export const deleteProject = async (projectId: string): Promise<string> => {
  const response = await axiosInstance.delete<string>(API_ENDPOINTS.PROJECT_DELETE(projectId));
  return response.data;
};

// Fetch full project data
export const getProjectFullData = async (projectId: string): Promise<any> => {
  const response = await axiosInstance.get(API_ENDPOINTS.PROJECT_FULL_DATA(projectId));
  return response.data;
};

// Invite a user to a project
export const inviteToProject = async (projectId: string, userId: string): Promise<string> => {
  const response = await axiosInstance.post<string>(API_ENDPOINTS.PROJECT_INVITE(projectId), {
    userId,
  });
  return response.data;
};

// Remove a member from a project
export const removeProjectMember = async (
  projectId: string,
  removedUserId: string,
): Promise<string> => {
  const response = await axiosInstance.delete<string>(
    API_ENDPOINTS.PROJECT_REMOVE_MEMBER(projectId, removedUserId),
  );
  return response.data;
};

// Assign an admin to a project
export const assignProjectAdmin = async (
  projectId: string,
  assignAdminUserId: string,
): Promise<string> => {
  const response = await axiosInstance.post<string>(
    API_ENDPOINTS.PROJECT_ASSIGN_ADMIN(projectId, assignAdminUserId),
  );
  return response.data;
};

// Remove an admin from a project
export const removeProjectAdmin = async (
  projectId: string,
  removeAdminUserId: string,
): Promise<string> => {
  const response = await axiosInstance.delete<string>(
    API_ENDPOINTS.PROJECT_REMOVE_ADMIN(projectId, removeAdminUserId),
  );
  return response.data;
};

