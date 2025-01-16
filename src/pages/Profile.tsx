import React, { useState, useEffect, useRef } from 'react';
import { updateUserPassword, UserDataFull } from '../services/userService'; // Import update functions
import { toast } from 'react-toastify';
import { isValidEmail, isStrongPassword } from '../utils/helpers';
import Sidebar from '../components/sidebar';
import CollapseMenu from '../components/collapseMenu';
import { useAuthUser } from '../context/AuthUserContext';

const ProfileCard: React.FC = () => {
  const { user, updateUser } = useAuthUser();

  const [profileData, setProfileData] = useState<UserDataFull>({
    username: user?.username || 'Username', // Fallback to empty string if null
    displayname: user?.displayname || 'Displayname', // Fallback to empty string if null
    email: user?.email || 'Email', // Fallback to empty string if null
    avatar:
      user?.avatar ||
      'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541', // Placeholder image URL
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // For avatar file input

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'displayName') {
      // Limit displayName to 50 characters
      if (value.length > 30) {
        setProfileData((prev) => ({ ...prev, [id]: value.slice(0, 30) }));
        return;
      }
    }
    if (isPasswordMode) {
      setPasswords((prev) => ({ ...prev, [id]: value }));
    } else {
      setProfileData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfileData((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
    setIsPasswordMode(false); // Exit password mode if editing is toggled
  };

  const togglePasswordMode = () => {
    setIsPasswordMode((prev) => !prev);
    setIsEditing(false); // Exit edit mode if password mode is toggled
  };

  const handlePasswordUpdate = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error('New password and confirm password do not match!');
      return;
    }

    if (!isStrongPassword(passwords.newPassword)) {
      toast.error(
        'Password must be at least 8 characters, contain an uppercase letter, and a number.',
      );
      return;
    }

    try {
      const response = await updateUserPassword({
        oldPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password updated successfully!');
      setIsPasswordMode(false); // Exit password mode
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear fields
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data || 'Failed to update password. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!isValidEmail(profileData.email)) {
      toast.error('Invalid email address. Please provide a valid email.');
      return;
    }
    if (!profileData.displayname || !profileData.username) {
      toast.warning('Name must not be empty');
      return;
    }
    const previousProfileData = { ...profileData }; // Backup the current profile data
    try {
      setProfileData({
        ...profileData,
        avatar: avatarFile ? URL.createObjectURL(avatarFile) : profileData.avatar,
      });

      await updateUser(profileData, avatarFile as File);

      toast.success('Profile updated successfully!');
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      setProfileData(previousProfileData); // Revert to the previous data if an error occurs
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleQuit = () => {
    setIsEditing(false);
    setIsPasswordMode(false);
    setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear password fields

    if (user) {
      setProfileData({
        username: user.username || '',
        displayname: user.displayname,
        email: user.email,
        avatar: user.avatar, // Update with avatar file URL
      });
    }
  };
  const [activeComponent, setActiveComponent] = useState<'sidebar' | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const toggleSidebar = () => {
    setActiveComponent((prev) => (prev === 'sidebar' ? null : 'sidebar'));
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!sidebarRef.current?.contains(target) && !sidebarButtonRef.current?.contains(target)) {
        setActiveComponent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className=' bg-Background/Middle w-screen h-screen'>
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={activeComponent === 'sidebar'}
          state='profile'
          onClose={() => setActiveComponent(null)}
        />
      </div>

      <CollapseMenu
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={activeComponent === 'sidebar'}
        isTagListVisible={false} // Disable TagList
        sidebarButtonRef={sidebarButtonRef}
      />
      <div className='h-5/6 flex items-center'>
        <div className="w-4/5 lg:w-2/5 mx-auto p-10 bg-Background/Bottom bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover text-white rounded-xl shadow-lg relative border-2 border-Primary/Dark">
          <h2 className='text-2xl font-semibold mb-6'>Your Profile</h2>

          {/* Flex Layout for Image and Inputs */}
          <div className='flex'>
            {/* Profile Image */}
            <div className='flex-shrink-0 flex items-center'>
              <div className='relative mr-2'>
                <img
                  src={profileData.avatar}
                  alt='Profile'
                  className={`w-24 h-24 rounded-full object-cover ${
                    !isEditing ? 'cursor-default' : 'cursor-pointer hover:brightness-75'
                  }`}
                  onClick={() => isEditing && document.getElementById('imageUpload')?.click()}
                />
                {isEditing && (
                  <input
                    type='file'
                    id='imageUpload'
                    accept='image/*'
                    className='hidden'
                    onChange={handleImageChange}
                  />
                )}
              </div>
            </div>

            {/* Inputs */}
            <div className='flex-1 ml-6 space-y-4'>
              {isPasswordMode ? (
                <>
                  {/* Password Change Inputs */}
                  <div>
                    <label htmlFor='currentPassword' className='block text-sm font-medium'>
                      Current Password
                    </label>
                    <input
                      type='password'
                      id='currentPassword'
                      value={passwords.currentPassword}
                      onChange={handleInputChange}
                      className='w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 '
                    />
                  </div>
                  <div>
                    <label htmlFor='newPassword' className='block text-sm font-medium'>
                      New Password
                    </label>
                    <input
                      type='password'
                      id='newPassword'
                      value={passwords.newPassword}
                      onChange={handleInputChange}
                      className='w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 '
                    />
                  </div>
                  <div>
                    <label htmlFor='confirmNewPassword' className='block text-sm font-medium'>
                      Confirm New Password
                    </label>
                    <input
                      type='password'
                      id='confirmNewPassword'
                      value={passwords.confirmNewPassword}
                      onChange={handleInputChange}
                      className='w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 '
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Profile Inputs (username, display name, email) */}
                  <div>
                    <label
                      htmlFor='username'
                      className='block text-sm font-medium text-Primary/Light'
                    >
                      Username
                    </label>
                    <input
                      type='text'
                      id='username'
                      value={profileData.username}
                      maxLength={30}
                      onChange={handleInputChange}
                      className={`w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md focus:outline-none ${
                        isEditing && 'focus:border focus:ring-2 focus:border-Primary/Dark'
                      }`}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='displayName'
                      className='block text-sm font-medium text-Primary/Light'
                    >
                      Display name
                    </label>
                    <input
                      type='text'
                      id='displayname'
                      maxLength={30}
                      value={profileData.displayname}
                      onChange={handleInputChange}
                      className={`w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md focus:outline-none ${
                        isEditing && 'focus:border focus:ring-2 focus:border-Primary/Dark'
                      }`}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div>
                    <label htmlFor='email' className='block text-sm font-medium text-Primary/Light'>
                      Email
                    </label>
                    <input
                      type='email'
                      id='email'
                      value={profileData.email}
                      onChange={handleInputChange}
                      className={`w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md focus:outline-none ${
                        isEditing && 'focus:border focus:ring-2 focus:border-Primary/Dark'
                      }`}
                      readOnly={!isEditing}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Buttons at the Bottom */}
          <div className='flex justify-end mt-6 space-x-4'>
            {!isEditing && !isPasswordMode && (
              <button
                onClick={togglePasswordMode}
                className='w-30 px-4 py-2 rounded-md text-sm font-medium bg-gray-300 text-Background/Bottom hover:bg-Primary/Dark hover:text-white'
              >
                Change Password
              </button>
            )}

            {isEditing || isPasswordMode ? (
              <>
                <button
                  onClick={isPasswordMode ? handlePasswordUpdate : handleSave} // Call handleSave or handlePasswordUpdate based on the mode
                  className='px-4 py-2 rounded-md text-sm font-medium hover:bg-Accent/Target hover:text-white text-Accent/Target bg-white'
                >
                  Save
                </button>
                <button
                  onClick={handleQuit}
                  className='px-4 py-2 rounded-md text-sm font-medium bg-gray-300 text-gray-900 hover:bg-gray-400'
                >
                  Quit
                </button>
              </>
            ) : (
              <button
                onClick={toggleEditMode}
                className='w-20 px-4 py-2 rounded-md text-sm font-medium bg-Accent/Target text-white hover:bg-white hover:text-Accent/Target'
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileCard;

