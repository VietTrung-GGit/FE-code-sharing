import React, { useState, useEffect } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import Editor from '@monaco-editor/react';
import { formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';
import {
  tags,
  Post,
  createPost,
  PostFile,
  convertPostFilesToFile,
  PostUpload,
  updatePost,
} from '../services/postService';
import { getUserFullData } from '../services/userService';

interface PostCreateProps {
  postData?: Post; // Optional prop to enable edit mode
  closeModal: () => void;
}

const PostCreate: React.FC<PostCreateProps> = ({ postData, closeModal: propcloseModal }) => {
  const [files, setFiles] = useState<PostFile[]>([]); // Changed to PostFile[]
  const [activeTab, setActiveTab] = useState<number>(0);
  const [editingTab, setEditingTab] = useState<number | null>(null);
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayname, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserFullData();
        setAvatarUrl(userData.avatar);
        setDisplayName(userData.displayname);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const MAX_FILES = 6;

  const acceptTypes: Accept = {
    'text/javascript': ['.js', '.jsx'],
    'text/x-markdown': ['.md', '.markdown'],
  };

  // Initialize form for edit mode if postData exists
  useEffect(() => {
    if (postData) {
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
        setFiles((prevFiles) => [...prevFiles, { fileName: file.name, fileUrl: content }]);
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

    // Create a new File (you could replace this with an actual file if needed)
    const newFile = { fileName: newFileName, fileUrl: '' }; // Empty file with the new file name

    setFiles([...files, newFile]);
    setActiveTab(files.length); // Set active tab for the new file
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
        i === index ? { ...file, fileName: newName.trim() || file.fileName } : file,
      ),
    );
    setEditingTab(null); // Close the edit tab for renaming
  };

  const deleteFile = (index: number) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      if (activeTab >= updatedFiles.length) setActiveTab(updatedFiles.length - 1);
      return updatedFiles;
    });
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags(
      (prevSelected) =>
        prevSelected.includes(tag)
          ? prevSelected.filter((selectedTag) => selectedTag !== tag) // Remove if already selected
          : [...prevSelected, tag], // Add tag if not already selected
    );
  };

  const handleSubmit = async () => {
    try {
      const postUploadData: PostUpload = {
        title,
        content,
        tags: selectedTags,
        code_files: files.map((file) => ({
          fileName: file.fileName,
          fileUrl: file.fileUrl, // The file content will be the content of the file
        })),
      };

      if (postData) {
        await updatePost(postData._id, postUploadData); // If postData has _id, call updatePost
      } else {
        await createPost(postUploadData); // Otherwise, call createPost
      }

      propcloseModal();
      toast.success('Post submitted successfully!');
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error('Error submitting post!');
    }
  };

  return (
    <div className='w-full h-[95vh] flex flex-col  text-white bg-Background/Bottom my-10 relative border-Primary/Dark border-solid box-border border-2 rounded-3xl p-5 md:p-7 lg:p-8 xl-10'>
      <div className='overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent'>
        {/* Avatar, Name, and Date */}
        <div className='flex items-center gap-4 mb-4'>
          <img
            src={avatarUrl || 'https://via.placeholder.com/50'} // Placeholder if no avatar
            alt='Avatar'
            className='w-12 h-12 rounded-full object-cover'
          />
          <div>
            <p className='font-bold text-lg'>{displayname || 'Loading...'}</p>
            {postData && (
              <span className='text-xs text-white'>{formatDate(postData.createdAt)}</span>
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
                    defaultValue={file.fileName}
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
                    {file.fileName}
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
            language={getEditorLanguage(files[activeTab]?.fileName)}
            value={files[activeTab]?.fileUrl}
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
      <div className='text-left'>
        {tags.map((tag) => (
          <button key={tag} className='w-24 my-2 mr-2' onClick={() => handleTagSelect(tag)}>
            <div className='flex flex-col'>
              <div
                className={`${
                  selectedTags.includes(tag) ? 'bg-Primary/Dark' : 'bg-Primary/Light'
                } rounded-3xl p-1`}
              >
                <p
                  className={`${
                    selectedTags.includes(tag) ? 'text-Primary/Light' : 'text-Primary/Dark'
                  }`}
                >
                  {tag}
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
        </div>
      </div>
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
      return 'javascript';
    case 'txt':
      return 'markdown';
    default:
      return 'plaintext';
  }
}

