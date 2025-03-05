import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';
import { BriefData, GroupDataBrief } from './groupService';

export interface NodeStructure {
  _id: string;
  name: string;
  isActive?: boolean;
  children: NodeStructure[];
  isJoined: boolean;
  description: string;
}

export function activateNodes(
  nodes: NodeStructure[],
  activeSectionId: string,
  showSubsections: boolean,
): void {
  function traverse(node: NodeStructure, parentActive: boolean): boolean {
    const isCurrentActive = node._id === activeSectionId;
    node.isActive = isCurrentActive || (showSubsections && parentActive);

    for (const child of node.children) {
      traverse(child, showSubsections ? node.isActive : isCurrentActive);
    }

    return node.isActive;
  }

  for (const node of nodes) {
    traverse(node, false);
  }
}

export interface ProjectDataBrief {
  _id: string;
  name: string;
  avatar: string;
  groupData: GroupDataBrief[];
  group: string;
  joined: boolean;
  joinable: boolean;
  visibleMembers: (string | undefined)[];
  role: string;
  creator: string;
}

export interface ProjectData {
  _id: string;
  name: string;
  avatar: string;
  groupData: GroupDataBrief[];
  group: string;
  bio: string;
  note: string;
  canJoin: boolean;
  members: { avatar: string; role: string; user: string }[];
  sections: NodeStructure[];
  role: string;
  joined: boolean;
}

export interface ProjectDataCreate {
  name: string;
  avatar?: File;
  description: string;
  private: boolean;
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
  const response = await axiosInstance.post(API_ENDPOINTS.PROJECT_JOIN(projectId));
  return response.data;
};

export const leaveProject = async (projectId: string) => {
  const response = await axiosInstance.post(API_ENDPOINTS.PROJECT_LEAVE(projectId));
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

// Update an existing group
export const updateProjectNote = async (groupId: string, note: string): Promise<string> => {
  const formData = new FormData();

  formData.append('note', note);

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
export const getProjectFullData = async (projectId: string): Promise<ProjectData> => {
  const response = await axiosInstance.get<ProjectData>(API_ENDPOINTS.PROJECT_FULL_DATA(projectId));
  const projectData: ProjectData = response.data;

  return {
    ...projectData,
    role: projectData.role === 'participant' ? 'member' : projectData.role,
    members: projectData.members.map((member) => ({
      ...member,
      role: member.role === 'participant' ? 'member' : member.role,
    })),
  };
};

// Fetch full project data
export const getProjectPublicData = async (projectId: string): Promise<BriefData> => {
  const response = await axiosInstance.get<BriefData>(API_ENDPOINTS.PROJECT_PUBLIC_DATA(projectId));
  return response.data;
};

// Fetch section description
export const getSectionDescription = async (sectionId: string): Promise<string> => {
  const response = await axiosInstance.get<string>(API_ENDPOINTS.SECTION_DESCRIPTION(sectionId));
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

// Remove a participant from a section
export const removeSectionParticipant = async (
  sectionId: string,
  userId: string,
): Promise<string> => {
  const response = await axiosInstance.delete<string>(
    API_ENDPOINTS.SECTION_REMOVE_PARTICIPANT(sectionId, userId),
  );
  return response.data;
};

export const removeSectionParticipantFromAll = async (
  sectionId: string,
  userId: string,
): Promise<string> => {
  const response = await axiosInstance.delete<string>(
    API_ENDPOINTS.SECTION_REMOVE_PARTICIPANT_FROM_ALL(sectionId, userId),
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

// Create a new section
export const createSection = async (
  name: string,
  projectId: string,
  parentId?: string,
): Promise<string> => {
  const response = await axiosInstance.post<NodeStructure>(API_ENDPOINTS.CREATE_SECTION(), {
    name,
    projectId,
    ...(parentId && { parentId }),
  });
  return response.data._id;
};

// Update an existing section
export const updateSection = async (
  sectionId: string,
  name?: string,
  description?: string,
): Promise<string> => {
  const response = await axiosInstance.put<string>(API_ENDPOINTS.UPDATE_SECTION(sectionId), {
    name,
    description,
  });
  return response.data;
};

// Delete a section
export const deleteSection = async (sectionId: string): Promise<string> => {
  const response = await axiosInstance.delete<string>(API_ENDPOINTS.DELETE_SECTION(sectionId));
  return response.data;
};

