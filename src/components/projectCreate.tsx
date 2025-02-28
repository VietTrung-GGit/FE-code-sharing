import { AiFillPlusCircle } from 'react-icons/ai';
import { MdOutlinePublicOff, MdOutlinePublic } from 'react-icons/md';
import { TbFlag, TbFlagOff } from 'react-icons/tb';
import { useState, useEffect, useRef } from 'react';
import {
  ProjectData,
  ProjectDataCreate,
  createProject,
  updateProject,
} from '../services/projectService';
import { toast } from 'react-toastify';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { urlToFile } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';

interface PostCreateProps {
  projectData?: ProjectData; // Optional prop to enable edit mode
  groupId?: string;
  projectId?: string;
  closeModal: () => void;
  refresh?: (projectpost: ProjectDataCreate) => void;
  onProjectCreated?: () => void;
}

const ProjectCreate: React.FC<PostCreateProps> = ({
  projectData,
  groupId,
  projectId,
  closeModal: propcloseModal,
  refresh = () => {},
  onProjectCreated,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<'privacy' | 'moderation' | null>(null);

  const [description, setDescription] = useState<string>(projectData?.bio || '');
  const [title, setTitle] = useState<string>(projectData?.name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [privacy, setPrivacy] = useState(!projectData?.canJoin || false);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();
  const handleSelect = (value: boolean) => {
    setPrivacy(value);
    setTimeout(() => {
      setActiveDropdown(null);
    }, 0);
  };

  useEffect(() => {
    if (projectData) {
      // Convert avatar URL to File
      const fetchAvatarFile = async () => {
        if (projectData.avatar) {
          const file = await urlToFile(projectData.avatar);
          setAvatarFile(file);
        }
      };

      fetchAvatarFile();
    }
  }, [projectData]);

  const handleSubmit = async () => {
    if (title.trim() || description.trim() || avatarFile) {
      try {
        const projectUploadData: ProjectDataCreate = {
          name: title,
          avatar: avatarFile as File,
          description,
          private: privacy,
        };

        if (projectData && projectId) {
          await updateProject(projectId, projectUploadData);
          refresh({
            ...projectData,
            name: title,
            description,
            avatar: projectUploadData.avatar,
            private: privacy,
          });
        } else if (groupId) {
          await createProject(groupId, projectUploadData);
          onProjectCreated?.();
        }

        propcloseModal();
        toast.success('Project submitted successfully!');
      } catch (error) {
        console.error('Error submitting project:', error);
        toast.error('Error submitting project!');
      }
    } else {
      toast.warning('Project details are empty!');
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div
      className={`${
        theme === 'original'
          ? 'bg-Background/Bottom text-white lg:border-2'
          : 'bg-[var(--surface)] text-[var(--text)]'
      } overflow-y-auto w-full h-full lg:h-[80vh] lg:w-[50vw] bg-center bg-cover px-14 py-10 flex flex-col border-Primary/Dark border-solid box-border lg:border-2 lg:rounded-3xl sm:max-lg:rounded-3xl lg:mt-4 relative`}
    >
      <button
        onClick={propcloseModal}
        className='absolute top-6 right-12  text-3xl hover:text-Primary/Light'
      >
        ×
      </button>
      <p className=' font-semibold text-left text-2xl'>New project</p>

      <div className='inline-block flex-shrink-0 flex-row flex mt-8 space-x-8'>
        <div className='relative group'>
          <label htmlFor='avatar-upload' className='cursor-pointer'>
            <img
              src={
                avatarFile
                  ? URL.createObjectURL(avatarFile)
                  : 'https://i.postimg.cc/02Xx40Yq/default.png'
              }
              alt='Profile Icon'
              className='w-40 h-40 rounded-3xl object-cover transition duration-300 group-hover:brightness-60'
            />
            <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-3xl  font-semibold'>
              Choose image
            </div>
          </label>
          <input
            type='file'
            id='avatar-upload'
            accept='image/*'
            className='hidden'
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setAvatarFile(e.target.files[0]);
              }
            }}
          />
        </div>

        <div className='flex flex-col -mt-2 '>
          <div className='space-y-4'>
            <input
              type='text'
              placeholder='Title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full mt-1 px-3 py-2 bg-gray-800  rounded-md border border-gray-700 focus:outline-none focus:ring-2'
            />
            <textarea
              value={description}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const newValue = target.value;

                if (newValue.length > 2000) {
                  target.value = newValue.slice(0, 2000);
                  toast.warning('Description must not exceed 2000 characters.');
                }

                setDescription(target.value.slice(0, 2000));
              }}
              placeholder='Description'
              className='w-full h-28 mt-1 px-3 py-2 bg-gray-800  rounded-md border border-gray-700 focus:outline-none focus:ring-2 resize-none overflow-y-auto'
              rows={4}
            />
          </div>
        </div>
      </div>

      <div className='mt-8 space-y-2'>
        <p className='text-xl text-Primary/Light'>Privacy setting</p>
        <Menu as='div' className='relative inline-block w-full'>
          <MenuButton className='w-full px-3 py-2 bg-gray-800  rounded-md border border-gray-700 focus:outline-none focus:ring-2'>
            <div className='flex gap-3 flex-row items-center'>
              {!privacy ? (
                <MdOutlinePublic className='text-2xl' />
              ) : (
                <MdOutlinePublicOff className='text-2xl' />
              )}
              <p className='text-lg '>{privacy ? 'Private' : 'Public'}</p>
              <div className='absolute right-4 top-4'>
                <svg
                  width='20'
                  height='10'
                  viewBox='0 0 20 10'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='M0 0L10 10L20 0H0Z' fill='white' />
                </svg>
              </div>
            </div>
          </MenuButton>

          <MenuItems className='mt-1 absolute w-full bg-gray-800  rounded-md border-2 border-Primary/Dark shadow-lg z-10'>
            <ul className='py-1 my-3'>
              <MenuItem>
                <button
                  className={
                    'block px-3 py-2  w-full text-left flex flex-row gap-4 data-[active]:bg-Background/Middle'
                  }
                  onClick={() => handleSelect(false)}
                >
                  <div className='flex gap-3 flex-row items-center'>
                    <MdOutlinePublic className='text-2xl' />
                    <p className='text-lg '>Public</p>
                  </div>
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  className={
                    'block px-3 py-2  w-full text-left flex flex-row gap-4 data-[active]:bg-Background/Middle'
                  }
                  onClick={() => handleSelect(true)}
                >
                  <div className='flex gap-3 flex-row items-center'>
                    <MdOutlinePublicOff className='text-2xl' />
                    <p className='text-lg '>Private</p>
                  </div>
                </button>
              </MenuItem>
            </ul>
          </MenuItems>
        </Menu>
      </div>

      <button
        onClick={handleSubmit}
        className='mt-10 ml-auto justify-center transition-colors duration-300 ease-in-out w-32 h-8 rounded-xl bg-Accent/Target text-lg  mb-4 hover:bg-white hover:text-Accent/Target flex flex-row gap-2 px-6 py-2 items-center'
      >
        <p>Create</p>
        <AiFillPlusCircle className='text-2xl mt-1' />
      </button>
    </div>
  );
};

export default ProjectCreate;

