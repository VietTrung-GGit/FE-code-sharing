// api/endpoints.ts
export const API_ENDPOINTS = {
  //Auth_related
  SIGNIN: '/auth/login',
  PASSWORDRESET: '/auth/passwordReset',
  PASSWORDNEW: (token: string) => `/auth/passwordNew/${token}`,
  SIGNUP: '/auth/signup',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',

  //USer_related

  USER_DATA: '/user/updateFull',
  USER_PASSWORD_UPDATE: '/user/updatePassword',
  FETCH_USER_DETAIL: '/user/fullInfo',
  FETCH_BRIEF_DATA: (userId: string) => `/user/briefData/${userId}`,
  FETCH_PUBLIC_DATA: (userId: string) => `/user/publicInfo/${userId}`,
  FOLLOW: (userId: string) => `/user/follow/${userId}`,
  UNFOLLOW: (userId: string) => `/user/unfollow/${userId}`,

  //group_related
  GROUP_DATA: (groupId: string) => `/group/${groupId}/data`,
  FETCH_GROUP_DETAIL: (groupId: string) => `/group/${groupId}/fullInfo`,

  //project_related
  PROJECT_DATA: (projectId: string) => `/project/${projectId}/data`,
  FETCH_PROJECT_DETAIL: (projectId: string) => `/project/${projectId}/fullInfo`,
  JOIN_PROJECT: (projectId: string) => `/project/${projectId}/join`,
  LEAVE_PROJECT: (projectId: string) => `/project/${projectId}/leave`,

  //Post_related
  POST_DETAILS: (postId: string) => `/post/${postId}`,
  POST_VISIBILITY: (postId: string, state: 'public' | 'private') =>
    `/post/setState/${postId}?state=${state}`,
  FETCH_POSTS: (
    page: number = 1,
    limit: number = 10,
    search: string = '',
    tags: string[] = [],
    order: 'ascending' | 'descending' = 'ascending',
    criteria: string,
    type: 'feed' | 'me' | 'stored' | undefined = undefined,
    userId?: string, // Added userId argument for feed type
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    if (search) queryParams.append('search', search);
    if (tags.length > 0) queryParams.append('tags', tags.join(','));

    if (type === 'feed' && userId) {
      return `/posts/feed/${userId}/filter?${queryParams.toString()}`;
    }
    if (type === 'me') {
      return `/me?${queryParams.toString()}`;
    }
    return `/community?${queryParams.toString()}`;
  },

  USER_POSTS: (
    userId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
    tags: string[] = [],
    order: 'ascending' | 'descending' = 'ascending',
    criteria: string,
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    if (search) queryParams.append('search', search);
    if (tags.length > 0) queryParams.append('tags', tags.join(','));
    return `/post/${userId}/filter?${queryParams.toString()}`;
  },

  GROUP_POSTS: (
    groupId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
    tags: string[] = [],
    order: 'ascending' | 'descending' = 'ascending',
    criteria: string,
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    if (search) queryParams.append('search', search);
    if (tags.length > 0) queryParams.append('tags', tags.join(','));
    return `/group/${groupId}/posts?${queryParams.toString()}`;
  },

  GROUP_MY_POSTS: (
    groupId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
    tags: string[] = [],
    order: 'ascending' | 'descending' = 'ascending',
    criteria: string,
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    if (search) queryParams.append('search', search);
    if (tags.length > 0) queryParams.append('tags', tags.join(','));
    return `/group/${groupId}/posts?${queryParams.toString()}`;
  },

  GROUP_PENDING_POSTS: (
    groupId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
    tags: string[] = [],
    order: 'ascending' | 'descending' = 'ascending',
    criteria: string,
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    if (search) queryParams.append('search', search);
    if (tags.length > 0) queryParams.append('tags', tags.join(','));
    return `/group/${groupId}/posts?${queryParams.toString()}`;
  },

  SECTION_POSTS: (
    sectionId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
    tags: string[] = [],
    order: 'ascending' | 'descending' = 'ascending',
    criteria: string,
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    if (search) queryParams.append('search', search);
    if (tags.length > 0) queryParams.append('tags', tags.join(','));
    return `/posts/${sectionId}/filter?${queryParams.toString()}`;
  },

  USERS_FILTER: (
    page: number = 1,
    limit: number = 10,
    order: 'ascending' | 'descending' = 'ascending',
    criteria: 'searchquery' | 'dateJoined' | 'followers' | 'likes',
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    return `/getUsers?${queryParams.toString()}`;
  },

  GROUP_MEMBERS: (
    groupId: string,
    page: number = 1,
    limit: number = 10,
    order: 'ascending' | 'descending' = 'ascending',
    criteria: 'searchquery' | 'dateJoined' | 'followers' | 'likes',
    search: string = '',
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    if (search) queryParams.append('search', search);
    return `/user/${groupId}/filter?${queryParams.toString()}`;
  },

  FETCH_USERS: (
    page: number = 1,
    limit: number = 10,
    order: 'ascending' | 'descending' = 'ascending',
    criteria: 'searchquery' | 'dateJoined' | 'followers' | 'likes',
    search: string = '',
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    if (search) queryParams.append('search', search);
    return `/user/getUsers?${queryParams.toString()}`;
  },

  FETCH_GROUPS: (
    page: number = 1,
    limit: number = 10,
    search: string = '',
    order: 'ascending' | 'descending' = 'ascending',
    criteria: 'dateCreated' | 'members' | 'posts',
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    if (search) queryParams.append('search', search);
    return `/group/find?${queryParams.toString()}`;
  },

  FETCH_PROJECTS: (
    page: number = 1,
    limit: number = 10,
    search: string = '',
    order: 'ascending' | 'descending' = 'ascending',
    criteria: 'dateCreated' | 'members' | 'posts',
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    if (search) queryParams.append('search', search);
    return `/project/find?${queryParams.toString()}`;
  },

  GROUP_PROJECTS: (
    groupId: string,
    page: number = 1,
    limit: number = 10,
    order: 'ascending' | 'descending' = 'ascending',
    criteria: 'dateCreated' | 'members' | 'posts',
    search: string = '',
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    if (search) queryParams.append('search', search);
    return `/project/${groupId}/find?${queryParams.toString()}`;
  },

  // Fetch post details by post ID
  FETCH_POST_DETAIL: (postId: string) => {
    return `/post/detail/${postId}`;
  },

  FETCH_HALF_DETAIL: (postId: string) => {
    return `/post/halfDetail/${postId}`;
  },

  // Create a new post
  CREATE_POST: () => {
    return `/post/create`;
  },

  // Update a post by post ID
  UPDATE_POST: (postId: string) => {
    return `/post/edit/${postId}`;
  },

  // Delete a post by post ID
  DELETE_POST: (postId: string) => {
    return `/post/delete/${postId}`;
  },

  // Like a post by post ID
  LIKE_POST: (postId: string) => {
    return `/post/like/${postId}`;
  },

  // Unlike a post by post ID
  UNLIKE_POST: (postId: string) => {
    return `/post/unlike/${postId}`;
  },

  // Like a comment by comment ID
  LIKE_COMMENT: (commentId: string) => {
    return `/comment/like/${commentId}`;
  },

  // Unlike a comment by comment ID
  UNLIKE_COMMENT: (commentId: string) => {
    return `/comment/unlike/${commentId}`;
  },

  // Store a post by post ID
  STORE_POST: (postId: string) => {
    return `/post/store/${postId}`;
  },

  // Unstore a post by post ID
  UNSTORE_POST: (postId: string) => {
    return `/post/unstored/${postId}`;
  },

  // Comment on a post by post ID
  CREATE_COMMENT: (hostId: string) => {
    return `comment/create/${hostId}`;
  },

  // Fetch comments for a post by post ID, with pagination, order, and limit
  FETCH_COMMENTS: (
    postId: string,
    page: number = 1,
    limit: number = 10,
    order: 'ascending' | 'descending' = 'ascending',
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    return `/comment/getComments/${postId}?${queryParams.toString()}`;
  },

  // Edit a comment by post ID and comment ID
  UPDATE_COMMENT: (commentId: string) => {
    return `comment/edit/${commentId}`;
  },

  // Delete a comment by post ID and comment ID
  DELETE_COMMENT: (commentId: string) => {
    return `comment/delete/${commentId}`;
  },

  // Group-related
  GROUP_CREATE: '/group/create',
  GROUP_UPDATE: (groupId: string) => `/group/update/${groupId}`,
  GROUP_DELETE: (groupId: string) => `/group/delete/${groupId}`,
  GROUP_FULL_DATA: (groupId: string) => `/group/fullData/${groupId}`,
  GROUP_INVITE: (groupId: string) => `/group/invite/${groupId}`,
  GROUP_REMOVE_MEMBER: (groupId: string, removedUserId: string) =>
    `/group/removeMember/${groupId}/${removedUserId}`,
  GROUP_JOIN: (groupId: string) => `/group/join/${groupId}`,
  GROUP_LEAVE: (groupId: string) => `/group/leave/${groupId}`,
  GROUP_ASSIGN_ADMIN: (groupId: string, assignAdminUserId: string) =>
    `/group/assignAdmin/${groupId}/${assignAdminUserId}`,
  GROUP_ASSIGN_CREATOR: (groupId: string, assignCreatorUserId: string) =>
    `/group/assignCreator/${groupId}/${assignCreatorUserId}`,
  GROUP_CONFIRM_INVITE: (groupId: string) => `/group/confirmInvite/${groupId}`,

  // Project-related
  PROJECT_CREATE: (groupId: string) => `/project/create/${groupId}`,
  PROJECT_UPDATE: (projectId: string) => `/project/update/${projectId}`,
  PROJECT_DELETE: (projectId: string) => `/project/delete/${projectId}`,
  PROJECT_FULL_DATA: (projectId: string) => `/project/fullData/${projectId}`,
  PROJECT_INVITE: (projectId: string) => `/project/invite/${projectId}`,
  PROJECT_REMOVE_MEMBER: (projectId: string, removedUserId: string) =>
    `/project/removeMember/${projectId}/${removedUserId}`,
  PROJECT_JOIN: (projectId: string) => `/project/join/${projectId}`,
  PROJECT_LEAVE: (projectId: string) => `/project/leave/${projectId}`,
  PROJECT_ASSIGN_ADMIN: (projectId: string, assignAdminUserId: string) =>
    `/project/assignAdmin/${projectId}/${assignAdminUserId}`,
  PROJECT_REMOVE_ADMIN: (projectId: string, removeAdminUserId: string) =>
    `/project/removeAdmin/${projectId}/${removeAdminUserId}`,
};

