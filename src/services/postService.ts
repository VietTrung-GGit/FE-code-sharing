import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';
import { getMimeTypeForExtension } from '../utils/helpers';

export interface PostFile {
  fileUrl: string;
  fileName: string;
}

export const tags = [
  'Technology1',
  'Technology2',
  'Technology3',
  'Technology4',
  'Technology5',
  'Technology6',
  'Technology7',
  'Technology8',
];

export interface Post {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  authorname: string;
  avatar: string;
  likes: string[];
  totalLikes: number;
  files: PostFile[];
  visibility: 'public' | 'private';
  stored: string[];
  totalComments: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  Stored: boolean;
  Liked: boolean;
  isAuthor: boolean;
}

export interface Comment {
  _id: string;
  code: string;
  text: string;
  authorname: string;
  avatar: string;
  author: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  isAuthor: boolean;
}

export interface PostRequest {
  title: string;
  content: string;
  tags: string[];
  code_files: File[];
}

export interface CommentRequest {
  text: string;
  code: string;
}

export interface CommentResponse {
  comments: Comment[];
  hasMore: boolean;
}

export interface PostResponse {
  posts: Post[];
  hasMore: boolean;
}

export interface PostUpload {
  title: string;
  content: string;
  tags: string[];
  code_files: File[];
}

// Fetch posts
export const fetchPosts = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  order: 'ascending' | 'descending' = 'descending',
  criteria: 'date' | 'likes' | 'comments' = 'date',
  search?: string,
  tags?: string[],
  type?: 'me' | 'stored',
): Promise<PostResponse> => {
  try {
    const response = await axiosInstance.get<PostResponse>(
      API_ENDPOINTS.FETCH_POSTS(userId, page, limit, search, tags, order, criteria, type),
    );

    const postsWithFiles = await Promise.all(
      response.data.posts.map(async (post) => {
        if (post.files && Array.isArray(post.files)) {
          // Fetch file content for each post's files
          post.files = await fetchFileContent(post.files);
        }
        return post;
      })
    );

    return { ...response.data, posts: postsWithFiles };
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};



export const fetchPostDetail = async (postId: string): Promise<Post> => {
  try {
    // Fetch post details
    const postResponse = await axiosInstance.get<Post>(API_ENDPOINTS.FETCH_POST_DETAIL(postId));
    const postDetail = postResponse.data;

    if (postDetail.files && Array.isArray(postDetail.files)) {
      // Fetch and overwrite file content using the helper function
      postDetail.files = await fetchFileContent(postDetail.files);
    }

    return postDetail;
  } catch (error) {
    console.error("Error fetching post details:", error);
    throw error;
  }
};


// Create a new post
export const createPost = async (postData: PostUpload): Promise<string> => {
  const response = await axiosInstance.post<string>(API_ENDPOINTS.CREATE_POST(), postData);
  return response.data;
};

// Update an existing post
export const updatePost = async (postId: string, postData: PostUpload) => {
  const response = await axiosInstance.put(API_ENDPOINTS.UPDATE_POST(postId), postData);
  return response.data;
};

// Delete a post
export const deletePost = async (postId: string, userId: string | null) => {
  const response = await axiosInstance.delete(API_ENDPOINTS.DELETE_POST(postId, userId));
  return response.data;
};

// Like a post
export const likePost = async (postId: string, userId: string | null) => {
  const response = await axiosInstance.get(API_ENDPOINTS.LIKE_POST(postId, userId));
  return response.data;
};

// Unlike a post
export const unlikePost = async (postId: string, userId: string | null) => {
  const response = await axiosInstance.get(API_ENDPOINTS.UNLIKE_POST(postId, userId));
  return response.data;
};

// Store a post
export const storePost = async (postId: string, userId: string | null) => {
  const response = await axiosInstance.get(API_ENDPOINTS.STORE_POST(postId, userId));
  return response.data;
};

// Unstore a post
export const unstorePost = async (postId: string, userId: string | null) => {
  const response = await axiosInstance.get(API_ENDPOINTS.UNSTORE_POST(postId, userId));
  return response.data;
};

// Create a comment on a post
export const createComment = async (postId: string, commentData: CommentRequest): Promise<string> => {
  const response = await axiosInstance.post<string>(API_ENDPOINTS.CREATE_COMMENT(postId), commentData);
  return response.data;
};

// Fetch comments for a post
export const fetchComments = async (
  postId: string,
  page: number = 1,
  limit: number = 10,
  order: 'ascending' | 'descending' = 'ascending',
): Promise<CommentResponse> => {
  const response = await axiosInstance.get<CommentResponse>(
    API_ENDPOINTS.FETCH_COMMENTS(postId, page, limit, order),
  );
  return response.data;
};

// Edit a comment on a post
export const updateComment = async (postId: string, commentId: string, commentData: CommentRequest) => {
  const response = await axiosInstance.put(
    API_ENDPOINTS.UPDATE_COMMENT(postId, commentId),
    commentData,
  );
  return response.data;
};

// Delete a comment on a post
export const deleteComment = async (postId: string, commentId: string) => {
  const response = await axiosInstance.delete(API_ENDPOINTS.DELETE_COMMENT(postId, commentId));
  return response.data;
};

const fetchFileContent = async (files: PostFile[]): Promise<PostFile[]> => {
  try {
    const fileFetchPromises = files.map(async (file) => {
      const fileResponse = await axios.get<string>(file.fileUrl, { responseType: 'text' });

      if (fileResponse.status !== 200) {
        throw new Error(`Failed to fetch file ${file.fileName}. Status: ${fileResponse.status}`);
      }

      const content = fileResponse.data; // `data` is typed as string
      return { ...file, fileUrl: content }; // Now fileUrl is of type string
    });

    // Wait for all file content fetches to complete
    return await Promise.all(fileFetchPromises);
  } catch (fileError) {
    console.error("Error fetching file contents:", fileError);
    throw fileError;
  }
};



// Function to convert PostFile to File with the correct MIME type
export const convertPostFilesToFile = (postFiles: PostFile[]): File[] => {
  return postFiles.map((postFile) => {
    const { fileUrl, fileName } = postFile;

    // Extract the file extension and get the correct MIME type
    const fileExtension = `.${fileName.split('.').pop()}`;
    const mimeType = getMimeTypeForExtension(fileExtension);

    // Create a Blob from the file URL's content (assuming the content is text, you can adjust this if needed)
    const fileContent = new Blob([fileUrl], { type: mimeType }); // Assuming content is text, adjust if binary

    // Create the File object with the MIME type and file name
    const fileWithTitle = new File([fileContent], fileName, { type: mimeType });

    return fileWithTitle;
  });
};