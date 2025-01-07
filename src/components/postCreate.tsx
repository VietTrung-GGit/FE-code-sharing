import React, { useState, useEffect } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import axios from 'axios';
import Editor from '@monaco-editor/react';

interface Tag {
  id: number;
  name: string;
}

interface FileData {
  id: number;
  name: string;
  content: string;
}


interface PostData {
  postID: number;
  userId: number;
  displayName: string;
  avatar: string;
  createat: string;
  updateat: string;
  tags: number[];
  title: string;
  content: string;
  comments: number;
  files: FileData[];
  likes: number;
  liked: boolean;
  saved: boolean;
}


interface PostCreateProps {
  postData?: PostData; // Optional prop to enable edit mode
  postReset?: (timeupdate: string, newtitle: string, newcontent: string, newfiles: FileData[], newtags: number[]) => void;  
}


const PostCreate: React.FC<PostCreateProps> = ({ postData, postReset: postReset }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [editingTab, setEditingTab] = useState<number | null>(null);
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [postId, setPostId] = useState<number>(-1); // Default to -1 for create mode
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // User Data State
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  

  const MAX_FILES = 6;

    const tags: Tag[] = [
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Health' },
    { id: 3, name: 'Education' },
    { id: 4, name: 'Entertainment' },
    { id: 5, name: 'Science' },
    { id: 6, name: 'Sports' },
    { id: 7, name: 'Iloveyou' },
  ];


  const acceptTypes: Accept = {
    'text/javascript': ['.js', '.jsx'],
    'text/x-markdown': ['.md', '.markdown'],
  };

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('https://your-server-endpoint.com/user');
        const { id, name, avatarUrl } = response.data; // Replace keys if needed
        setUserId(id);
        setUserName(name);
        setAvatar(avatarUrl);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

    // Initialize form for edit mode if postData exists
  useEffect(() => {
    if (postData) {
      setPostId(postData.postID);
      setTitle(postData.title);
      setContent(postData.content);
      setFiles(postData.files || []);
      setSelectedTags(postData.tags || []);
    }
  }, [postData]);


  const onDrop = (acceptedFiles: File[]) => {
    if (files.length >= MAX_FILES) return;

    acceptedFiles.forEach((file) => {
      if (files.length >= MAX_FILES) return;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result as string;
        setFiles((prevFiles) => [...prevFiles, {id: -1, name: file.name, content }]);
        setActiveTab(files.length);
      };
      reader.readAsText(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptTypes,
    disabled: files.length >= MAX_FILES,
  });

  const addNewFile = () => {
    if (files.length >= MAX_FILES) return;
    const newFileName = `newFile${files.length + 1}`;
    setFiles([...files, { id: -1, name: newFileName, content: '' }]);
    setActiveTab(files.length);
  };

  const updateFileContent = (newContent: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file, index) =>
        index === activeTab ? { ...file, content: newContent } : file,
      ),
    );
  };

  const renameFile = (index: number, newName: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file, i) =>
        i === index ? { ...file, name: newName.trim() || file.name } : file,
      ),
    );
    setEditingTab(null);
  };

  const deleteFile = (index: number) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      if (activeTab >= updatedFiles.length) setActiveTab(updatedFiles.length - 1);
      return updatedFiles;
    });
  };

  const handleTagSelect = (tagId: number) => {
  setSelectedTags((prevSelected) =>
    prevSelected.includes(tagId)
      ? prevSelected.filter((id) => id !== tagId) // Remove tag if already selected
      : [...prevSelected, tagId] // Add tag if not already selected
  );
};

  const handleSubmit = async () => {
    const payload = {
      postId,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      title,
      content,
      files,
      tags: selectedTags, // Include tags here
    };


    try {
      await axios.post('https://your-server-endpoint.com/posts', payload);
      alert('Post submitted successfully!');
      if (postData && postReset) {postReset( new Date().toISOString(),title,content,files,selectedTags);}
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('Failed to submit post.');
    }
  };



  return (
        <div className='w-full h-[95vh] flex flex-col  text-white bg-Background/Bottom my-10 relative border-Primary/Dark border-solid box-border border-2 rounded-3xl p-5 md:p-7 lg:p-8 xl-10'>
<div className='overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent'>
          {/* Avatar, Name, and Date */}
          <div className='flex items-center gap-4 mb-4'>
            <img
              src={avatar || 'https://via.placeholder.com/50'} // Placeholder if no avatar
              alt='Avatar'
              className='w-12 h-12 rounded-full object-cover'
            />
            <div>
              <p className='font-bold text-lg'>{userName || 'Loading...'}</p>
           {postData && (
        <span className="text-xs text-white">
          {new Date(postData.createat).toLocaleString()}
        </span>
      )}
              <span className='text-sm text-Accent/Light'>. Update: Now</span>
            </div>
          </div>

          {/* Title */}
          <textarea
            value={title}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue.length <= 100) {
                setTitle(newValue);
              } else {
                setTitle(newValue.slice(0, 100));
              }
            }}
            placeholder='Title'
            className='w-full p-2 text-Primary/Light bg-Background/Bottom text-lg overflow-hidden focus:outline-none focus:border-transparent'
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto'; // Reset height
              const limitedContent = target.value.slice(0, 100); // Limit content
              target.value = limitedContent; // Ensure textarea value matches limit
              target.style.height = `${Math.min(target.scrollHeight, 100)}px`; // Adjust to content with max height
            }}
          />

          {/* Text Input */}
          <textarea
            value={content}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue.length <= 1000) {
                setContent(newValue);
              } else {
                setContent(newValue.slice(0, 1000));
              }
            }}
            placeholder='Share your code...'
            className='mb-4 w-full p-2 bg-Background/Middle overflow-hidden resize-none focus:outline-none focus:border-transparent'
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto'; // Reset height
              const limitedContent = target.value.slice(0, 1000); // Limit content
              target.value = limitedContent; // Ensure textarea value matches limit
              target.style.height = `${Math.min(target.scrollHeight, 1000)}px`; // Adjust to content with max height
            }}
          />

          {/* Dropzone */}
          <div className='flex gap-3 mb-3'>
            <div
              {...getRootProps()}
              className={`flex-1 border-2 ${
                files.length >= MAX_FILES
                  ? 'border-gray-300 bg-Background/Middle cursor-not-allowed '
                  : 'border-dashed border-white bg-Accent/Target cursor-pointer'
              } p-2 rounded text-center flex items-center justify-between`}
            >
              <input {...getInputProps()} />
              {files.length >= MAX_FILES ? (
                <p className='text-red-500'>File limit reached (6 files max)</p>
              ) : isDragActive ? (
                <p className='flex-1 text-left'>Drop your files here...</p>
              ) : (
                <p className='flex-1 text-left'>Drag & drop files here, or click to select</p>
              )}

              {/* Add Image */}
              <img
                src='/fileup.svg' // Replace with your image path
                alt='Upload'
                className='w-8 h-8 ml-2' // Adjust width, height, and margin
              />
            </div>
          </div>

          {/* Tabs and New File Button */}
          <div className='flex overflow-x-auto'>
            {files.map((file, index) => (
              <div
                key={index}
                className={`text-Primary/Light font-bold max-w-[150px] truncate px-2 py-1 cursor-pointer ${
                  activeTab === index ? 'border-b-4 border-Primary/Dark' : ''
                }`}
                onClick={() => setActiveTab(index)}
              >
                <div className='flex items-center w-full'>
                  {/* Editable File Name */}
                  {editingTab === index ? (
                    <input
                      type='text'
                      defaultValue={file.name}
                      autoFocus
                      onBlur={(e) => renameFile(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter')
                          renameFile(index, (e.target as HTMLInputElement).value);
                      }}
                      className='border text-sm w-full focus:outline-none focus:bg-Background/Middle'
                    />
                  ) : (
                    <span
                      onDoubleClick={() => setEditingTab(index)}
                      className='text-sm truncate flex-1'
                    >
                      {file.name}
                    </span>
                  )}

                  {/* Delete Button */}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(index);
                    }}
                    className='ml-2 text-red-500 font-bold cursor-pointer'
                  >
                    ×
                  </span>
                </div>
              </div>
            ))}

            {/* New File Button */}
            {files.length < MAX_FILES && (
              <button
                onClick={addNewFile}
                className='flex-shrink-0 px-2 py-1 bg-Primary/Dark text-white border-b-4 border-Primary/Dark'
              >
                +
              </button>
            )}
          </div>

          {/* Editor */}
          {files.length > 0 && (
            <Editor
              height='35vh'
              width='100%'
              language={getEditorLanguage(files[activeTab]?.name)}
              value={files[activeTab]?.content}
              onChange={(value) => updateFileContent(value || '')}
              theme='vs-dark'
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                renderValidationDecorations: 'off',
              }}
            />
          )}

          {/* Placeholder for No Files */}
          {files.length === 0 && (
            <p className='text-gray-500 text-center'>
              No files yet. Upload or start from scratch by clicking +.
            </p>
          )}
</div>

      <div className='w-32'>
        <p className='text-left text-Primary/Light text-xl'>Choose tags:</p>
      </div>
            <div className="text-left">
        {tags.map((tag) => (
          <button
            key={tag.id}
            className="w-24 my-2 mr-2"
            onClick={() => handleTagSelect(tag.id)}
          >
            <div className="flex flex-col">
              <div
                className={`${
                  selectedTags.includes(tag.id) ? 'bg-Primary/Dark' : 'bg-Primary/Light'
                } rounded-3xl p-1`}
              >
                <p
                  className={`${
                    selectedTags.includes(tag.id) ? 'text-Primary/Light' : 'text-Primary/Dark'
                  }`}
                >
                  {tag.name}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      
          {/* Submit Button */}
          <div className='mt-auto'>
          <div className='flex justify-end'>
            <button
              onClick={handleSubmit}
              className='w-24 py-2 mt-4 bg-Accent/Target text-white font-bold rounded-xl'
            >
              Submit
            </button>
          </div></div>
        </div>

  );
};

export default PostCreate;


// Function to determine editor language
function getEditorLanguage(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript';    case 'txt':
      return 'markdown';
    default:
      return 'plaintext';
  }
}