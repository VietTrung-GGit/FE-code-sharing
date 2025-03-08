import Search from '../assets/search.svg';
import { MdOutlineSearch, MdRemoveCircle } from 'react-icons/md';
import { IoPersonAdd } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  UserBriefData,
  fetchSuggestedGroupUsers,
  fetchUninvitedProjectUsers,
  fetchUninvitedSectionUsers,
  inviteGroupMembers,
  inviteProjectMembers,
  addSectionParticipants,
} from '../services/userService';
import LoadingSpinner from './loadingAnimate';
import { useTheme } from '../context/ThemeContext';

interface AddMemberProps {
  type: 'group' | 'section' | 'project';
  desId: string;
  isOpen: boolean;
  closeModal: () => void;
  refetchUsers?: () => void;
}

const UserSuggestion: React.FC<{
  user: UserBriefData;
  toggleUser: (user: UserBriefData) => void;
  isAdded: boolean;
}> = ({ user, toggleUser, isAdded }) => {
  return (
    <div
      key={user._id}
      className='flex flex-row w-full items-center justify-between gap-4 flex-nowrap'
    >
      <div className='flex items-center space-x-4 min-w-0'>
        <img src={user.avatar} alt='Profile Icon' className='w-12 h-12 rounded-full object-cover' />
        <div className='flex flex-col items-start min-w-0'>
          <p className='font-semibold text-lg truncate w-full'>{user.displayname}</p>
          <p className='text-[var(--text-title)] text-xs truncate w-full text-left'>
            @{user.username}
          </p>
        </div>
      </div>

      <button onClick={() => toggleUser(user)} className='flex-shrink-0'>
        {isAdded ? (
          <svg
            width='22'
            height='22'
            viewBox='0 0 23 23'
            fill='currentColor'
            className='text-[var(--button-hovered)]'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M22.5107 11.5C22.5107 17.5751 17.5858 22.5 11.5107 22.5C5.43555 22.5 0.510686 17.5751 0.510686 11.5C0.510686 5.42487 5.43555 0.5 11.5107 0.5C17.5858 0.5 22.5107 5.42487 22.5107 11.5Z' />
            <circle cx='11.5' cy='12' r='7.5' fill='#00F587' />
          </svg>
        ) : (
          <svg
            width='22'
            height='22'
            viewBox='0 0 22 22'
            fill='currentColor'
            className='text-[var(--button-hovered)]'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle cx='11' cy='11' r='11' />
          </svg>
        )}
      </button>
    </div>
  );
};

const UserAvatar: React.FC<{ user: UserBriefData; toggleUser: (user: UserBriefData) => void }> = ({
  user,
  toggleUser,
}) => {
  return (
    <div className='relative flex-shrink-0 w-14 h-14'>
      <img src={user.avatar} alt='Profile Icon' className='w-12 h-12 rounded-full object-cover' />
      <button
        onClick={() => toggleUser(user)}
        className='absolute bottom-1 text-red-300 text-xl bg-white rounded-full'
      >
        <MdRemoveCircle />
      </button>
    </div>
  );
};

const AddMember: React.FC<AddMemberProps> = ({ type, desId, isOpen, closeModal, refetchUsers }) => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserBriefData[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserBriefData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const toggleUser = (user: UserBriefData) => {
    setUsers((prevUsers) => {
      if (prevUsers.some((u) => u._id === user._id)) {
        return prevUsers.filter((u) => u._id !== user._id); // Remove user
      } else {
        return [...prevUsers, user]; // Add user
      }
    });
  };
  const handleInvite = async () => {
    if (users.length === 0) return; // Prevent sending an empty request

    const userIds = users.map((user) => user._id);

    try {
      setWaiting(true);
      if (type === 'group') {
        await inviteGroupMembers(desId, userIds);
      } else if (type === 'project') {
        await inviteProjectMembers(desId, userIds);
      } else {
        await addSectionParticipants(desId, userIds);
        if (refetchUsers) {
          refetchUsers();
        }
      }
      setWaiting(false);
      setUsers([]); // Clear selected users after inviting
      closeModal();
      toast.success('Sending invitations successfully!');
    } catch (error) {
      console.error('Error sending invites:', error);
    }
  };

  useEffect(() => {
    if (!isOpen) return; // Only fetch when modal is open

    const fetchUsers = async () => {
      setLoading(true); // Start loading

      try {
        let response;
        if (type === 'group') {
          response = await fetchSuggestedGroupUsers(desId, 1, 10, search);
        } else if (type === 'project') {
          response = await fetchUninvitedProjectUsers(desId, 1, 10, search);
        } else {
          response = await fetchUninvitedSectionUsers(desId, 1, 10, search);
        }

        setSuggestedUsers(response.users);
        console.log(suggestedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUsers();
  }, [type, desId, search, isOpen]);

  return (
    <div
      className={`
    ${
      theme === 'original'
        ? 'bg-Background/Bottom text-white md:border-2 border-t-2'
        : 'bg-[var(--button)] text-[var(--text)]'
    } 
    z-30 py-5 px-8 bg-center shadow-md bg-cover border-Primary/Dark 
    flex flex-col items-center text-center overflow-x-hidden 
    overflow-y-auto scrollbar

    /* Mobile Full-Screen Modal (Bottom Half) */
    fixed bottom-0 left-0 w-full h-[70vh] rounded-t-3xl 
  
    /* Large Screen Modal (Positioned Below Invite Button) */
    md:absolute md:top-10 md:right-0 md:w-[400px] md:min-h-[200px] md:max-h-[400px] md:rounded-3xl
  `}
    >
      <button
        onClick={closeModal}
        className='absolute top-1 right-3  text-3xl hover:text-[var(--text-title)]'
      >
        ×
      </button>
      <div className='flex flex-row w-full items-center space-x-2 mx-2 pl-2 pr-4'>
        <div className='flex-shrink-0 w-9 h-9 flex items-center text-2xl justify-center'>
          <MdOutlineSearch />
        </div>

        <input
          className={`${
            theme === 'original'
              ? 'bg-Background/Middle text-[var(--text-title)] '
              : 'bg-[var(--input)] text-[var(--text)]'
          } flex-grow py-1 px-3 rounded-3xl h-8 w-full text-sm`}
          placeholder='Search for users...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {users.length > 0 && (
        <div className='flex flex-row w-full items-center justify-between mt-8'>
          {/* Scrollable Container */}
          <div className='flex overflow-x-auto overflow-y-hidden  scrollbar  space-x-1 max-w-[90%] flex-nowrap'>
            {users.map((user) => (
              <UserAvatar key={user._id} user={user} toggleUser={toggleUser} />
            ))}
          </div>

          <button
            onClick={handleInvite}
            className='text-Accent/Target text-2xl flex-shrink-0'
            disabled={waiting || loading}
          >
            <IoPersonAdd />
          </button>
        </div>
      )}

      <div className='mt-5 space-y-4 w-full'>
        <p className='text-base  font-semibold flex flex-start'>Suggested:</p>

        {loading ? (
          <LoadingSpinner /> // Add your custom spinner here
        ) : suggestedUsers.length === 0 ? (
          <p className='text-gray-600 text-center'>
            {type == 'section'
              ? 'You could invite members in the project to participate in this section'
              : type == 'project'
                ? 'You could invite members in the group to join this project'
                : 'Go follow someone'}
          </p>
        ) : (
          <div className='flex gap-4 flex-col'>
            {suggestedUsers.map((user) => (
              <UserSuggestion
                key={user._id}
                user={user}
                toggleUser={toggleUser}
                isAdded={users.some((u) => u._id === user._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMember;

