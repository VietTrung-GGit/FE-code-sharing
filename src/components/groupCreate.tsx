import { AiFillPlusCircle } from 'react-icons/ai';
import { MdOutlinePublicOff, MdOutlinePublic } from 'react-icons/md';
import { TbFlag, TbFlagOff } from 'react-icons/tb';
import { useState, useEffect, useRef } from 'react';
import { GroupData, GroupDataCreate, createGroup, updateGroup } from '../services/groupService';
import { toast } from 'react-toastify';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

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
  const urlToFile = async (imageUrl: string): Promise<File> => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new File([blob], 'image');
  };

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
    <div className='overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent w-full h-full lg:h-[80vh] lg:w-[50vw] bg-Background/Bottom bg-center bg-cover px-14 py-10  flex flex-col border-Primary/Dark border-solid box-border lg:border-2 lg:rounded-3xl sm:max-lg:rounded-3xl  lg:mt-4  relative'>
      <button
        onClick={propcloseModal}
        className='absolute top-6 right-12 text-white text-3xl hover:text-Primary/Light'
      >
        ×
      </button>
      <p className='text-white font-semibold text-left text-2xl'>
        {groupId ? 'Edit group profile' : 'New group'}
      </p>

      <div className='inline-block flex-shrink-0 flex-row flex mt-8 space-x-8'>
        <div className='relative group'>
          <label htmlFor='avatar-upload' className='cursor-pointer'>
            {/* Image */}
            <img
              src={
                groupData
                  ? groupData.avatar
                  : avatarFile
                    ? URL.createObjectURL(avatarFile)
                    : 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
              }
              alt='Profile Icon'
              className='w-40 h-40 rounded-3xl object-cover transition duration-300 group-hover:brightness-60'
            />
            {/* Overlay Text */}
            <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-3xl text-white font-semibold'>
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
              className='w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 '
            />
            {/* <input
              type='text'
              placeholder='Description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full h-28 mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 '
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
              className='w-full h-28 mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 resize-none overflow-y-auto'
              rows={4}
            />
          </div>
        </div>
      </div>
      <div className='mt-8 space-y-2'>
        <p className='text-xl text-Primary/Light'>Privacy setting</p>
        <Menu as='div' className='relative inline-block w-full'>
          <MenuButton className='w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2'>
            <div className='flex gap-3 flex-row items-center'>
              {!privacy ? (
                <MdOutlinePublic className='text-2xl' />
              ) : (
                <MdOutlinePublicOff className='text-2xl' />
              )}
              <p className='text-lg text-white'>{privacy ? 'Private' : 'Public'}</p>
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

          <MenuItems className='mt-1 absolute w-full bg-gray-800 text-white rounded-md border-2 border-Primary/Dark shadow-lg z-10'>
            <ul className='py-1 my-3'>
              <MenuItem>
                <button
                  className={
                    'block px-3 py-2 text-white w-full text-left flex flex-row gap-4 data-[active]:bg-Background/Middle'
                  }
                  onClick={() => handleSelect('privacy', false)}
                >
                  <div className='flex gap-3 flex-row items-center'>
                    <MdOutlinePublic className='text-2xl' />
                    <p className='text-lg text-white'>Public</p>
                  </div>
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  className={
                    'block px-3 py-2 text-white w-full text-left flex flex-row gap-4 data-[active]:bg-Background/Middle'
                  }
                  onClick={() => handleSelect('privacy', true)}
                >
                  <div className='flex gap-3 flex-row items-center'>
                    <MdOutlinePublicOff className='text-2xl' />
                    <p className='text-lg text-white'>Private</p>
                  </div>
                </button>
              </MenuItem>
            </ul>
          </MenuItems>
        </Menu>
      </div>
      <div className='mt-8 space-y-2'>
        <p className='text-xl text-Primary/Light'>Post moderation setting</p>
        <Menu as='div' className='relative inline-block w-full'>
          <MenuButton className='w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2'>
            <div className='flex gap-3 flex-row items-center'>
              {!moderation ? <TbFlagOff className='text-2xl' /> : <TbFlag className='text-2xl' />}
              <p className='text-lg text-white'>{moderation ? 'Required' : 'None'}</p>
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

          <MenuItems className='mt-1 absolute w-full bg-gray-800 text-white rounded-md border-2 border-Primary/Dark shadow-lg z-10'>
            <ul className='py-1 my-3'>
              <MenuItem>
                <button
                  className={
                    'block px-3 py-2 text-white w-full text-left flex flex-row gap-4 data-[active]:bg-Background/Middle'
                  }
                  onClick={() => handleSelect('moderation', false)}
                >
                  <div className='flex gap-3 flex-row items-center'>
                    <TbFlagOff className='text-2xl' />
                    <p className='text-lg text-white'>None</p>
                  </div>
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  className={
                    'block px-3 py-2 text-white w-full text-left flex flex-row gap-4 data-[active]:bg-Background/Middle'
                  }
                  onClick={() => handleSelect('moderation', true)}
                >
                  <div className='flex gap-3 flex-row items-center'>
                    <TbFlag className='text-2xl' />
                    <p className='text-lg text-white'>Required</p>
                  </div>
                </button>
              </MenuItem>
            </ul>
          </MenuItems>
        </Menu>
      </div>
      <button
        onClick={handleSubmit}
        className='mt-10 ml-auto justify-center transition-colors duration-300 ease-in-out w-32 h-8 rounded-xl bg-Accent/Target text-lg text-white mb-4 hover:bg-white hover:text-Accent/Target flex flex-row gap-2 px-6 py-2 items-center'
      >
        {' '}
        {groupId ? (
          <p>Save</p>
        ) : (
          <>
            {' '}
            <p>Create</p>
            <AiFillPlusCircle className=' text-2xl mt-1' />
          </>
        )}
      </button>
    </div>
  );
};
export default GroupCreate;

