import Search from '../assets/search.svg';
import { MdRemoveCircle } from 'react-icons/md';
import { IoPersonAdd } from 'react-icons/io5';
import { useState } from 'react';

interface AddMemberProps {
  type: 'group' | 'section' | 'project';
  desId: number;
  closeModal: () => void;
}

interface User {
  avatar: string;
  name?: string;
  username?: string;
  id: string;
}

const UserSuggestion: React.FC<{
  user: User;
  toggleUser: (user: User) => void;
  isAdded: boolean;
}> = ({ user, toggleUser, isAdded }) => {
  return (
    <div key={user.id} className='flex flex-row w-full items-center justify-between'>
      <div className='flex items-center space-x-4'>
        <img src={user.avatar} alt='Profile Icon' className='w-12 h-12 rounded-full object-cover' />
        <div className='flex flex-col items-start'>
          <p className='text-white font-semibold text-xl'>{user.name}</p>
          <p className='text-[var(text-title)] text-sm'>@{user.username}</p>
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

const UserAvatar: React.FC<{ user: User; toggleUser: (user: User) => void }> = ({
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

const AddMember: React.FC<AddMemberProps> = ({ type, desId, closeModal }) => {
  const suggestedUsers: User[] = [
    {
      avatar:
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      name: 'User One',
      username: 'userone',
      id: '1',
    },
    {
      avatar:
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      name: 'User Two',
      username: 'usertwo',
      id: '2',
    },
    {
      avatar:
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      name: 'User Two',
      username: 'usertwo',
      id: '3',
    },
    {
      avatar:
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      name: 'User Two',
      username: 'usertwo',
      id: '4',
    },
    {
      avatar:
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      name: 'User Two',
      username: 'usertwo',
      id: '5',
    },
    {
      avatar:
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      name: 'User One',
      username: 'userone',
      id: '1',
    },
    {
      avatar:
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      name: 'User Two',
      username: 'usertwo',
      id: '29',
    },
    {
      avatar:
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      name: 'User Two',
      username: 'usertwo',
      id: '7',
    },
    {
      avatar:
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      name: 'User Two',
      username: 'usertwo',
      id: '8',
    },
    {
      avatar:
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      name: 'User Two',
      username: 'usertwo',
      id: '5',
    },
  ];

  const [users, setUsers] = useState<User[]>([]);

  const toggleUser = (user: User) => {
    setUsers((prevUsers) => {
      if (prevUsers.some((u) => u.id === user.id)) {
        return prevUsers.filter((u) => u.id !== user.id); // Remove user
      } else {
        return [...prevUsers, user]; // Add user
      }
    });
  };

  return (
    <div
      className='bg-Background/Bottom bg-center bg-cover border-2 border-Primary/Dark px-6 py-4 flex flex-col items-center rounded-3xl sm:max-lg:rounded-3xl lg:mt-4 lg:rounded-3xl border-solid box-border text-center absolute
    min-h-[300px] overflow-x-hidden max-h-[500px] w-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent'
    >
      <div className='flex flex-row w-full items-center space-x-4 mx-2'>
        <div className='flex-shrink-0 w-9 h-9 flex items-center justify-center'>
          <img src={Search} alt='Search Icon' className='w-9 h-9 rounded-full object-cover' />
        </div>

        <input
          className='bg-Background/Middle flex-grow py-2 px-4 rounded-3xl h-10 w-full text-[var(text-title)] text-l'
          placeholder='Search for users...'
        />
      </div>
      {users.length > 0 && (
        <div className='flex flex-row w-full items-center justify-between mt-8'>
          {/* Scrollable Container */}
          <div className='flex overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent space-x-1 max-w-[90%] flex-nowrap'>
            {users.map((user) => (
              <UserAvatar key={user.id} user={user} toggleUser={toggleUser} />
            ))}
          </div>

          <button className='text-Accent/Target text-2xl flex-shrink-0'>
            <IoPersonAdd />
          </button>
        </div>
      )}

      <div className='mt-5 space-y-4 w-full'>
        <p className='text-md text-white font-semibold flex flex-start'>Suggested:</p>

        <div className='flex gap-4 flex-col'>
          {suggestedUsers.map((user) => (
            <UserSuggestion
              key={user.id}
              user={user}
              toggleUser={toggleUser}
              isAdded={users.some((u) => u.id === user.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddMember;

