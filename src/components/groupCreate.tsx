import { AiFillPlusCircle } from 'react-icons/ai';
import { MdOutlinePublicOff, MdOutlinePublic } from 'react-icons/md';
import { TbFlag, TbFlagOff } from 'react-icons/tb';
import { useState, useEffect, useRef } from 'react';
import { GroupData, GroupDataCreate, createGroup, updateGroup } from '../services/groupService';
import { toast } from 'react-toastify';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { urlToFile } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';
import { IoMdArrowDropdown } from 'react-icons/io';

interface PostCreateProps {
  groupData?: GroupData; // Optional prop to enable edit mode
  closeModal: () => void;
  refresh?: (grouppost: GroupDataCreate) => void;
  onGroupCreated?: () => void;
  groupId?: string;
}

const GroupCreate: React.FC<PostCreateProps> = ({
  groupData,
  closeModal: propcloseModal,
  refresh = () => {},
  onGroupCreated,
  groupId,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<'privacy' | 'moderation' | null>(null);

  const [description, setDescription] = useState<string>(groupData?.bio || '');
  const [title, setTitle] = useState<string>(groupData?.name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [privacy, setPrivacy] = useState(false);
  const [moderation, setModeration] = useState(groupData?.moderation || false);
  const dropdownRef = useRef<HTMLButtonElement>(null);

  const handleSelect = (type: 'privacy' | 'moderation', value: boolean) => {
    if (type === 'privacy') {
      setPrivacy(value); // true if 'Private', false if 'Public'
    } else {
      setModeration(value); // true if 'Required', false if 'None'
    }

    setTimeout(() => {
      setActiveDropdown(null);
    }, 0);
  };

  const handleSubmit = async () => {
    if (title.trim() || description.trim() || avatarFile) {
      try {
        const groupUploadData: GroupDataCreate = {
          name: title,
          avatar: avatarFile as File,
          description,
          private: privacy, // Using boolean state
          moderation, // Using boolean state
        };

        if (groupData && groupId) {
          await updateGroup(groupId, groupUploadData); // Update existing group
          refresh({
            ...groupData,
            name: title,
            description,
            avatar: groupUploadData.avatar,
            private: privacy,
            moderation,
          });
        } else {
          await createGroup(groupUploadData); // Create new group
          onGroupCreated?.();
        }

        propcloseModal();
        toast.success('Group submitted successfully!');
      } catch (error) {
        console.error('Error submitting group:', error);
        toast.error('Error submitting group!');
      }
    } else {
      toast.warning('Group details are empty!');
    }
  };
  const { theme } = useTheme();
  useEffect(() => {
    if (groupData) {
      setTitle(groupData.name || '');
      setDescription(groupData.bio || '');
      setPrivacy(!groupData.canJoin || false);
      setModeration(groupData.moderation || false);

      // Convert avatar URL to File
      const fetchAvatarFile = async () => {
        if (groupData.avatar) {
          const file = await urlToFile(groupData.avatar);
          setAvatarFile(file);
        }
      };

      fetchAvatarFile();
    }
  }, [groupData]); // Runs whenever `groupData` changes

  useEffect(() => {
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    // Cleanup to restore scroll behavior when component is unmounted or modal is closed
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
      } overflow-y-auto scrollbarw-full h-full lg:h-[80vh] lg:w-[50vw] bg-center bg-cover px-14 py-10  flex flex-col border-Primary/Dark border-solid box-border lg:rounded-3xl sm:max-lg:rounded-3xl  lg:mt-4  relative scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent`}
    >
      <button
        onClick={propcloseModal}
        className='absolute top-6 right-12  text-3xl hover:text-[var(--text-title)]'
      >
        ×
      </button>
      <p className=' font-semibold text-left text-2xl'>
        {groupId ? 'Edit group profile' : 'New group'}
      </p>

      <div className='inline-block flex-shrink-0 flex-row flex mt-8 space-x-6 lg:space-x-8'>
        <div className='relative group'>
          <label htmlFor='avatar-upload' className='cursor-pointer'>
            {/* Image */}
            <img
              src={
                avatarFile ? URL.createObjectURL(avatarFile) : import.meta.env.VITE_DEFAULT_AVATAR
              }
              alt='Profile Icon'
              className='w-24 h-24 xxsm:w-32 xxsm:h-32 lg:w-40 lg:h-40 rounded-3xl object-cover transition duration-300 group-hover:brightness-60 flex-shrink-0'
              // onClick={() => document.getElementById('imageUpload')?.click()}
            />
            {/* Overlay Text */}
            <div className='text-white absolute w-40 h-40 inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-3xl  font-semibold'>
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
          <div className='space-y-4 max-lg:flex-col max-lg:flex'>
            <input
              type='text'
              placeholder='Title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={` ${
                theme === 'original' ? '' : 'border'
              } w-[30vw] xxsm:w-[35vw] xsm:w-[40vw] lg:w-full mt-1 px-3 py-2 bg-[var(--input)] rounded-md text-sm xxsm:text-base border-[var(--text-placeholder)] focus:outline-none focus:ring-2 `}
            />
            {/* <input
              type='text'
              placeholder='Description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full h-28 mt-1 px-3 py-2 bg-gray-800  rounded-md border border-[var(--text-placeholder)] focus:outline-none focus:ring-2 '
            /> */}
            <textarea
              value={description}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const newValue = target.value;

                // Handle character limit
                if (newValue.length > 2000) {
                  target.value = newValue.slice(0, 2000);
                  toast.warning('Description must not exceed 2000 characters.');
                }

                // Update state with new value
                setDescription(target.value.slice(0, 2000));
              }}
              placeholder='Description'
              className={` ${
                theme === 'original' ? '' : 'border'
              } w-[30vw] xxsm:w-[35vw] xsm:w-[40vw] lg:w-full h-12 xsm:h-20 lg:h-28 mt-1 px-3 py-2 bg-[var(--input)] text-sm xxsm:text-base rounded-md border-[var(--text-placeholder)] focus:outline-none focus:ring-2 resize-none overflow-y-auto`}
              rows={4}
            />
          </div>
        </div>
      </div>
      <div className='mt-8 space-y-2'>
        <p className='text-lg text-[var(--text-title)]'>Privacy setting</p>
        <Menu as='div' className='relative inline-block w-full'>
          <MenuButton
            className={` ${
              theme === 'original' ? '' : 'border'
            } w-full px-3 py-2 bg-[var(--input)] rounded-md border-[var(--text-placeholder)] focus:outline-none focus:ring-2`}
          >
            <div className='flex gap-3 flex-row items-center'>
              {!privacy ? (
                <MdOutlinePublic className='text-2xl' />
              ) : (
                <MdOutlinePublicOff className='text-2xl' />
              )}
              <p className='text-base '>{privacy ? 'Private' : 'Public'}</p>
              <div className='absolute right-4'>
                <IoMdArrowDropdown className='text-2xl' />
              </div>
            </div>
          </MenuButton>

          <MenuItems className='mt-1 absolute w-full  bg-[var(--input)]  rounded-md border-2 border-[var(--text-placeholder)]  shadow-lg z-10'>
            <ul className='py-1 my-1'>
              <MenuItem>
                <button
                  className={
                    'block px-3 py-1  w-full text-left flex flex-row gap-4 data-[active]:bg-[var(--background-hovered)] '
                  }
                  onClick={() => handleSelect('privacy', false)}
                >
                  <div className='flex gap-3 flex-row items-center'>
                    <MdOutlinePublic className='text-2xl' />
                    <div className='flex-col justify-center'>
                      {' '}
                      <p className='text-base '>Public</p>
                      <p className='text-sm text-gray-400'>
                        Anyone could find this group and its content
                      </p>
                    </div>
                  </div>
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  className={
                    'block px-3 py-1  w-full text-left flex flex-row gap-4 data-[active]:bg-[var(--background-hovered)] '
                  }
                  onClick={() => handleSelect('privacy', true)}
                >
                  <div className='flex gap-3 flex-row items-center'>
                    <MdOutlinePublicOff className='text-2xl' />
                    <div className='flex-col justify-center'>
                      {' '}
                      <p className='text-base '>Private</p>
                      <p className='text-sm text-gray-400'>
                        The content of this group is not visible to the public
                      </p>
                    </div>
                  </div>
                </button>
              </MenuItem>
            </ul>
          </MenuItems>
        </Menu>
      </div>
      <div className='mt-8 space-y-2'>
        <p className='text-lg text-[var(--text-title)]'>Post moderation setting</p>
        <Menu as='div' className='relative inline-block w-full'>
          <MenuButton
            className={` ${
              theme === 'original' ? '' : 'border'
            }  w-full px-3 py-2  bg-[var(--input)]  rounded-md border-[var(--text-placeholder)] focus:outline-none focus:ring-2`}
          >
            <div className='flex gap-3 flex-row items-center'>
              {!moderation ? <TbFlagOff className='text-2xl' /> : <TbFlag className='text-2xl' />}
              <p className='text-base '>{moderation ? 'Required' : 'None'}</p>
              <div className='absolute right-4'>
                <IoMdArrowDropdown className='text-2xl' />
              </div>
            </div>
          </MenuButton>

          <MenuItems className='mt-1 absolute w-full border-[var(--text-placeholder)]  bg-[var(--input)] rounded-md border-2  shadow-lg z-10'>
            <ul className='py-1 my-1'>
              <MenuItem>
                <button
                  className={
                    'block px-3 py-1  w-full text-left flex flex-row gap-4 data-[active]:bg-[var(--background-hovered)] '
                  }
                  onClick={() => handleSelect('moderation', false)}
                >
                  <div className='flex gap-3 flex-row items-center'>
                    <TbFlagOff className='text-2xl' />
                    <div className='flex-col justify-center'>
                      {' '}
                      <p className='text-base '>None</p>
                      <p className='text-sm text-gray-400'>Posts can be published directly</p>
                    </div>
                  </div>
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  className={
                    'block px-3 py-1  w-full text-left flex flex-row gap-4 data-[active]:bg-[var(--background-hovered)] '
                  }
                  onClick={() => handleSelect('moderation', true)}
                >
                  <div className='flex gap-3 flex-row items-center'>
                    <TbFlag className='text-2xl' />
                    <div className='flex-col justify-center'>
                      {' '}
                      <p className='text-base '>Required</p>
                      <p className='text-sm text-gray-400'>
                        Posts need admin approval before published
                      </p>
                    </div>
                  </div>
                </button>
              </MenuItem>
            </ul>
          </MenuItems>
        </Menu>
      </div>
      <button
        onClick={handleSubmit}
        className={`${
          theme === 'original'
            ? 'bg-Accent/Target  hover:text-Accent/Target hover:bg-white'
            : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border border-[var(--border)] text-Accent/Target'
        }  mt-10 ml-auto justify-center transition-colors duration-300 ease-in-out w-32 h-8 rounded-xl text-lg  mb-4  flex flex-row gap-2 px-6 py-2 items-center`}
      >
        {' '}
        {groupId ? (
          <p>Save</p>
        ) : (
          <>
            {' '}
            <p>{groupData ? 'Submit' : 'Create'}</p>
            <AiFillPlusCircle className=' text-2xl mt-1' />
          </>
        )}
      </button>
    </div>
  );
};
export default GroupCreate;

