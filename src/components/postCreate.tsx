import React, { useState, useEffect, useRef } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { TbEye, TbLock } from 'react-icons/tb';
import { useDropzone, Accept } from 'react-dropzone';
import Editor from '@monaco-editor/react';
import { formatDate, getEditorLanguage, acceptTypes } from '../utils/helpers';

import { useAuthUser } from '../context/AuthUserContext';
import { toast } from 'react-toastify';
import PostRef from '../components/postRef';
import 'react-toastify/dist/ReactToastify.css';
import '../index.css';
import { Post, createPost, PostFile, PostUpload, updatePost } from '../services/postService';
import { tags, tagColors } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';
import EmojiPickerComponent from './emojiPicker';
import { EmojiClickData } from 'emoji-picker-react';

interface PostCreateProps {
  postData?: Post; // Optional prop to enable edit mode
  closeModal: () => void;
  refresh?: (proppost: Post) => void;
  onPostCreated?: () => void;
  postRefId?: string;
  mode?: number; //0: tạo ở community. 1: tạo trong group. 2: tạo trong project. 3: tạo trong section
  desId?: string;
  parentId?: string;
  role?: string;
}

const PostCreate: React.FC<PostCreateProps> = ({
  postData,
  closeModal: propcloseModal,
  refresh = () => {},
  onPostCreated,
  postRefId,
  mode,
  desId,
  parentId,
  role,
}) => {
  const [files, setFiles] = useState<PostFile[]>([]); // Changed to PostFile[]
  const [activeTab, setActiveTab] = useState<number>(0);
  const [editingTab, setEditingTab] = useState<number | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { user } = useAuthUser();
  const { theme } = useTheme();
  const [waiting, setWaiting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const emojis = ['😀', '😆', '😎', '🔥', '💯', '🚀', '🎉', '🥳'];
  const getRandomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
  useEffect(() => {
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const MAX_FILES = 6;

  // Toggle the privacy setting
  const handlePrivacyChange = (setting: 'public' | 'private') => {
    setPrivacy(setting);
  };

  // Initialize form for edit mode if postData exists
  useEffect(() => {
    // alert('id to be share:' + postRefId);
    if (postData) {
      setTitle(postData.title);
      setContent(postData.content);
      setFiles(postData.files || []);
      setPrivacy(postData.visibility);
      setSelectedTags(postData.tags || []);
    }
  }, [postData]);

  const onDrop = (acceptedFiles: File[]) => {
    const remainingSlots = MAX_FILES - files.length; // Calculate remaining slots
    if (remainingSlots <= 0) return; // If no slots available, exit early

    const filesToAdd = acceptedFiles.slice(0, remainingSlots); // Limit to remaining slots

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result as string;

        // Safely update the state with the new files
        setFiles((prevFiles) => {
          const updatedFiles = [...prevFiles, { fileName: file.name, fileUrl: content }];
          setActiveTab(updatedFiles.length - 1); // Set active tab to the newly added file
          return updatedFiles; // Return the updated state
        });
      };
      reader.readAsText(file);
    });

    if (acceptedFiles.length > remainingSlots) {
      toast.warning(`Only ${MAX_FILES} files were accepted. The rest were dismissed.`);
    }
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
        index === activeTab ? { ...file, fileUrl: newContent } : file,
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
    if (title || content || files.length != 0) {
      try {
        const postUploadData: PostUpload = {
          title,
          visibility: privacy,
          content,
          tags: selectedTags,
          refId: postRefId || '',
          code_files: files.map((file) => ({
            fileName: file.fileName,
            fileUrl: file.fileUrl,
          })),
          ...(mode === 1
            ? { group: desId }
            : mode === 2
              ? { project: desId }
              : mode === 3
                ? { section: desId, project: parentId }
                : {}),

          ...(role ? { role } : {}),
        };
        setWaiting(true);
        if (postData) {
          await updatePost(postData._id, postUploadData); // If postData has _id, call updatePost
          refresh({
            ...postData,
            title,
            content,
            visibility: privacy,
            tags: selectedTags,
            files,
            editedAt: 'Recently',
          });
        } else {
          console.log(postUploadData);
          await createPost(postUploadData); // Otherwise, call createPost

          onPostCreated?.();
        }
        propcloseModal();
        toast.success('Post submitted successfully!');
      } catch (error) {
        console.error('Error submitting post:', error);
        toast.error('Error submitting post!');
      }
    } else toast.warning('Empty post!');
  };
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'; // Reset height
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 2000)}px`; // Adjust height with max limit
    }
  };

  useEffect(() => {
    adjustHeight(); // Adjust height once on mount
  }, [content]);

  return (
    <div
      className={`${
        theme === 'original'
          ? 'bg-Background/Bottom text-white lg:border-2'
          : 'bg-[var(--surface)] text-[var(--text)]'
      } w-full h-full lg:h-[95vh] lg:w-3/5 flex flex-col lg:my-10 relative border-Primary/Dark border-solid box-border  lg:rounded-3xl p-5 md:p-7 lg:p-8 xl-10`}
    >
      {/* Close Button */}
      <button
        onClick={propcloseModal}
        className='absolute top-6 right-12 text-3xl hover:text-[var(--text-title)] z-40'
      >
        ×
      </button>

      <div className='overflow-y-auto scrollbar'>
        {/* Avatar, Name, and Date */}
        <div className='flex items-center gap-4 mb-4'>
          <img
            src={user?.avatar || import.meta.env.VITE_DEFAULT_AVATAR} // Placeolder if no avatar
            alt='Avatar'
            className='w-12 h-12 rounded-full object-cover'
          />
          <div>
            <p className='font-bold text-lg'>
              {(user?.displayname.length > 18
                ? `${user?.displayname.slice(0, 18)}...`
                : user?.displayname) || 'Loading...'}
            </p>
            {postData && (
              <span className='text-xs text-white'>
                {formatDate(postData.createdAt)}. Updating:&nbsp;
              </span>
            )}
            <span className='text-sm text-[var(--text-hovered)]'>Now</span>
          </div>
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue.length <= 200) {
              setTitle(newValue);
            } else {
              setTitle(newValue.slice(0, 200));
              toast.warning('Length of title must not exceed 200 characters.');
            }
          }}
          placeholder='Title'
          className='font-semibold w-full px-2 py-1 rounded-md text-[var(--text-title)] bg-[var(--input)] text-lg focus:outline-none focus:border-transparent'
        />
        {postRefId && <PostRef postId={postRefId} />}
        <div className='relative'>
          {' '}
          {/* Text Input */}
          <textarea
            ref={textAreaRef}
            value={content}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              const newValue = target.value;

              // Handle character limit
              if (newValue.length > 2000) {
                target.value = newValue.slice(0, 2000);
                toast.warning('Length of content must not exceed 2000 characters.');
              }

              // Update state with new value
              setContent(target.value.slice(0, 2000));
            }}
            placeholder={
              postRefId
                ? 'Share your thoughts about this post...'
                : 'Share something about your code...'
            }
            rows={6}
            className='mt-2 w-full p-2 bg-[var(--input)] overflow-hidden resize-none rounded-md focus:outline-none focus:border-transparent'
          />
          <div>
            <button
              onClick={() => setShowPicker(!showPicker)}
              className='absolute top-2 right-2 z-40 text-lg hidden lg:block'
            >
              {getRandomEmoji()}
            </button>
            {showPicker && (
              <div className='absolute top-10 right-0 mb-2 z-30 bg-gray-800 rounded-lg shadow-lg'>
                <EmojiPickerComponent
                  theme={theme}
                  onSelect={(emoji: EmojiClickData) => setContent((prev) => prev + emoji.emoji)}
                  onClose={() => setShowPicker(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Dropzone */}
        <div className='flex gap-3 mb-3'>
          <div
            {...getRootProps()}
            className={`flex-1 border-2 ${
              files.length >= MAX_FILES
                ? 'border-gray-300 bg-Background/Middle cursor-not-allowed '
                : 'border-dashed border-[var(--green-highlight)] bg-Accent/Target cursor-pointer'
            } p-2 rounded text-center flex items-center justify-between`}
          >
            <input {...getInputProps()} />
            {files.length >= MAX_FILES ? (
              <p className='text-red-500'>File limit reached (6 files max)</p>
            ) : isDragActive ? (
              <p className='flex-1 text-left text-white'>Drop your files here...</p>
            ) : (
              <p className='flex-1 text-left text-white'>
                Drag & drop code files here, or click to select
              </p>
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
              className={`text-[var(--text-title)] font-semibold w-[120px] truncate px-2 py-1 cursor-pointer ${
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
            theme={`${theme == 'light' ? 'light' : 'vs-dark'}`}
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

        <div className='w-32'>
          <p className='text-left font-semibold text-[var(--text-title)] text-lg'>Choose tags:</p>
        </div>
        <div className='text-left text-md'>
          <div className='flex flex-wrap flex justify-center'>
            {tags.map((tag) => (
              <button key={tag} className='w-24 my-2 mr-2' onClick={() => handleTagSelect(tag)}>
                <div className='flex flex-col'>
                  <div
                    className={`${theme === 'original' ? 'text-Primary/Dark' : ''} ${
                      selectedTags.includes(tag)
                        ? `${tagColors[tag]} text-Primary/Dark`
                        : 'bg-[var(--button)] hover:bg-[var(--button-hovered)]'
                    } rounded-3xl p-1`}
                  >
                    <p>{tag}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className='mt-auto'>
        <div className={`${mode ? 'justify-end' : 'justify-between'} flex space-x-2`}>
          {!mode && (
            <Menu as='div' className='relative inline-block text-left mt-4'>
              <div>
                <MenuButton className='inline-flex justify-center items-center w-28 px-4 py-2 font-medium text-white bg-Primary/Dark border border-Primary/Dark rounded-xl'>
                  {privacy === 'public' ? (
                    <span className='flex items-center'>
                      <TbEye className='inline mr-2 text-lg' /> Public
                    </span>
                  ) : (
                    <span className='flex items-center'>
                      <TbLock className='inline mr-2 text-lg' /> Private
                    </span>
                  )}
                </MenuButton>
              </div>

              <MenuItems className='overflow-hidden absolute w-max bottom-full mb-2  origin-bottom-left bg-white divide-y divide-gray-100 rounded-md shadow-lg'>
                <div>
                  <MenuItem>
                    <button
                      onClick={() => handlePrivacyChange('public')}
                      className='data-[active]:bg-Primary/Dark data-[active]:text-white bg-[var(--background)]
                   group flex items-center  w-full p-2 text-sm'
                    >
                      <TbEye className='text-lg mr-2' />
                      <span className='font-semibold'>Public</span>: Everyone could view this post.
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={() => handlePrivacyChange('private')}
                      className='data-[active]:bg-Primary/Dark data-[active]:text-white  bg-[var(--background)]
                     group flex items-center w-full p-2 text-sm'
                    >
                      <TbLock className='text-lg mr-2' />
                      <span className='font-semibold'>Private</span>: Only you could view this post.
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          )}

          {!waiting ? (
            <button
              onClick={handleSubmit}
              className={`group ${
                theme === 'original'
                  ? 'bg-Accent/Target hover:text-Accent/Target hover:bg-white'
                  : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border border-[var(--border)] text-Accent/Target'
              } transition-colors duration-300 ease-in-out w-24 py-1 mt-4 font-bold rounded-xl flex justify-center items-center`}
            >
              Submit
            </button>
          ) : (
            <div
              className={`group ${
                theme === 'original'
                  ? 'bg-Accent/Target'
                  : 'bg-[var(--button)] border border-[var(--border)] text-Accent/Target'
              } transition-colors duration-300 ease-in-out w-24 py-1 mt-4 font-bold rounded-xl flex justify-center items-center`}
            >
              <div
                className={`${
                  theme === 'original' ? 'border-white' : 'border-Accent/Target'
                } w-6 h-6 border-4 border-t-transparent border-solid rounded-full animate-spin`}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCreate;

