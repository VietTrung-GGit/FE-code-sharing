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

  //Post_related
  POST_DETAILS: (postId: string) => `/posts/${postId}`,

  FETCH_POSTS: (
    page: number = 1,
    limit: number = 10,
    search: string = '',
    tags: string[] = [],
    order: 'ascending' | 'descending' = 'ascending',
    criteria: 'date' | 'likes' | 'comments' = 'date',
    type: 'me' | 'stored' | undefined = undefined,
  ) => {
    const queryParams = new URLSearchParams();
    if (type != undefined) queryParams.append('type', type);
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('order', order);
    queryParams.append('criteria', criteria);
    if (search) queryParams.append('search', search);
    if (tags.length > 0) queryParams.append('tags', tags.join(','));
    if (!type) {
      return `/community?${queryParams.toString()}`;
    }
    return `/me?${queryParams.toString()}`;
  },

  // Fetch post details by post ID
  FETCH_POST_DETAIL: (postId: string) => {
    return `/post/detail/${postId}`;
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

  // Store a post by post ID
  STORE_POST: (postId: string) => {
    return `/post/store/${postId}`;
  },

  // Unstore a post by post ID
  UNSTORE_POST: (postId: string) => {
    return `/post/unstored/${postId}`;
  },

  // Comment on a post by post ID
  CREATE_COMMENT: (postId: string) => {
    return `/post/${postId}/comment/create`;
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
    return `/post/detail/${postId}/comment?${queryParams.toString()}`;
  },

  // Edit a comment by post ID and comment ID
  UPDATE_COMMENT: (postId: string, commentId: string) => {
    return `/post/${postId}/comment/edit/${commentId}`;
  },

  // Delete a comment by post ID and comment ID
  DELETE_COMMENT: (postId: string, commentId: string) => {
    return `/post/${postId}/comment/delete/${commentId}`;
  },
};

