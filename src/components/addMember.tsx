import Search from '../assets/search.svg';
import { MdRemoveCircle } from 'react-icons/md';
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

interface AddMemberProps {
  type: 'group' | 'section' | 'project';
  desId: string;
  isOpen: boolean;
  closeModal: () => void;
}

const UserSuggestion: React.FC<{
  user: UserBriefData;
  toggleUser: (user: UserBriefData) => void;
  isAdded: boolean;
}> = ({ user, toggleUser, isAdded }) => {
  return (
    <div key={user._id} className='flex flex-row w-full items-center justify-between'>
      <div className='flex items-center space-x-4'>
        <img src={user.avatar} alt='Profile Icon' className='w-12 h-12 rounded-full object-cover' />
        <div className='flex flex-col items-start'>
          <p className='text-white font-semibold text-lg'>{user.displayname}</p>
          <p className='text-Primary/Light text-xs'>@{user.username}</p>
        </div>
      </div>

      <button onClick={() => toggleUser(user)}>
        {isAdded ? (
          <svg
            width='22'
            height='22'
            viewBox='0 0 23 23'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M22.5107 11.5C22.5107 17.5751 17.5858 22.5 11.5107 22.5C5.43555 22.5 0.510686 17.5751 0.510686 11.5C0.510686 5.42487 5.43555 0.5 11.5107 0.5C17.5858 0.5 22.5107 5.42487 22.5107 11.5Z'
              fill='white'
            />
            <circle cx='11.5' cy='12' r='7.5' fill='#00F587' />
          </svg>
        ) : (
          <svg
            width='22'
            height='22'
            viewBox='0 0 22 22'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle cx='11' cy='11' r='11' fill='white' />
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

const AddMember: React.FC<AddMemberProps> = ({ type, desId, closeModal, isOpen }) => {
  const [users, setUsers] = useState<UserBriefData[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserBriefData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

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
      if (type === 'group') {
        await inviteGroupMembers(desId, userIds);
      } else if (type === 'project') {
        await inviteProjectMembers(desId, userIds);
      } else {
        await addSectionParticipants(desId, userIds);
      }

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
      className=' w-full h-full bg-Background/Bottom bg-center bg-cover border-2 border-Primary/Dark p-5 flex flex-col items-center rounded-3xl sm:max-lg:rounded-3xl lg:mt-4 lg:rounded-3xl border-solid box-border text-center absolute
    min-h-[200px] overflow-x-hidden lg:max-h-[500px] lg:w-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent'
    >
      <button
        onClick={closeModal}
        className='absolute top-1 right-3 text-white text-3xl hover:text-Primary/Light'
      >
        ×
      </button>
      <div className='flex flex-row w-full items-center space-x-2 mx-2 pl-2 pr-4'>
        <div className='flex-shrink-0 w-9 h-9 flex items-center justify-center'>
          <img src={Search} alt='Search Icon' className='w-7 h-7 rounded-full object-cover' />
        </div>

        <input
          className='bg-Background/Middle flex-grow py-1 px-3 rounded-3xl h-8 w-full text-Primary/Light text-sm'
          placeholder='Search for users...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {users.length > 0 && (
        <div className='flex flex-row w-full items-center justify-between mt-8'>
          {/* Scrollable Container */}
          <div className='flex overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent space-x-1 max-w-[90%] flex-nowrap'>
            {users.map((user) => (
              <UserAvatar key={user._id} user={user} toggleUser={toggleUser} />
            ))}
          </div>

          <button onClick={handleInvite} className='text-Accent/Target text-2xl flex-shrink-0'>
            <IoPersonAdd />
          </button>
        </div>
      )}

      <div className='mt-5 space-y-4 w-full'>
        <p className='text-md text-white font-semibold flex flex-start'>Suggested:</p>

        {loading ? (
          <LoadingSpinner /> // Add your custom spinner here
        ) : suggestedUsers.length === 0 ? (
          <p className='text-gray-600 text-center'>Go follow someone</p>
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

