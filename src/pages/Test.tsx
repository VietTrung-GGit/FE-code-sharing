import React, { useState, useEffect } from 'react';

interface Post {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  authorname: string;
  avatar: string;
  likes: string[];
  totalLikes: number;
  files: string[];
  visibility: 'public' | 'private';
  stored: string[];
  totalComments: number;
  createdAt: string;
  updatedAt: string;
  v: number;
  Stored: boolean;
  Liked: boolean;
  isAuthor: boolean;
}

const posts: Post[] = [
  {
    _id: "677f0c8b2bf6e62cd0e22012",
    title: "hhh",
    content: "hhh",
    tags: [],
    author: "677f064329becf15464443ac",
    authorname: "knam0919",
    avatar: "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1736377973/User_avatar_files/efu4wabik5i0scwhbdx8.png",
    likes: [],
    totalLikes: 0,
    files: [
      "https://res.cloudinary.com/devteam3-gdsc/raw/upload/v1736379530/User_code_files/igkzszoy07hkkwww5esj"
    ],
    visibility: "public",
    stored: [
      "677f0cdf2bf6e62cd0e2201d"
    ],
    totalComments: 0,
    createdAt: "2025-01-08T23:38:51.302Z",
    updatedAt: "2025-01-08T23:55:02.204Z",
    v: 0,
    Stored: true,
    Liked: false,
    isAuthor: false
  }
];

const fetchFileContent = async (fileUrl: string) => {
  try {
    const response = await fetch(fileUrl);
    const text = await response.text(); // assuming it's a text or code file
    return text;
  } catch (error) {
    console.error("Error fetching the file:", error);
    return "";
  }
};

const PostList: React.FC = () => {
  const [fileContent, setFileContent] = useState<string>("");

  return (
    <div>
      {posts.map(post => (
        <div key={post._id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <div>Author: {post.authorname}</div>
          <img src={post.avatar} alt="author avatar" />
          <div>Total Likes: {post.totalLikes}</div>
          <div>Total Comments: {post.totalComments}</div>
          <div>Visibility: {post.visibility}</div>
          <div>Stored: {post.Stored ? "Yes" : "No"}</div>
          <div>Liked: {post.Liked ? "Yes" : "No"}</div>
          <div>Is Author: {post.isAuthor ? "Yes" : "No"}</div>

          {/* Handle Files */}
          <div>
            {post.files.map((file, index) => (
              <div key={index}>
                <a href={file} download={`file-${index}`}>
                  Download File {index + 1}
                </a>
              </div>
            ))}
          </div>

          {/* Display the code file content */}
          <div>
            <h3>Code Content:</h3>
            <pre>{fileContent}</pre> {/* Display the content of the file */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
