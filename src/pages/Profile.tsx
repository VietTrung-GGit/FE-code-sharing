import React, { useState } from 'react';
import { useUser } from '../context/UserContext'; // Import the useUser hook
import { updateUserPassword, updateUserFullData } from '../services/userService'; // Import update functions
import { toast } from 'react-toastify';
import { isValidEmail, isStrongPassword } from '../utils/helpers';
import CollapseMenu from '../components/collapseMenu';

interface ProfileData {
  username: string;
  displayName: string;
  email: string;
  imageUrl: string;
}

interface UserData {
  id: string;
  displayName: string;
  avatarfile: File; // Changed from avatarUrl to avatarfile
  username: string;
  email: string;
}

const ProfileCard: React.FC = () => {
  const { userId, username, displayname, email, avatarUrl, setUser } = useUser(); // Access user context
  const [profileData, setProfileData] = useState<ProfileData>({
    username: username || '', // Fallback to empty string if null
    displayName: displayname || '', // Fallback to empty string if null
    email: email || '', // Fallback to empty string if null
    imageUrl: avatarUrl || 'https://via.placeholder.com/80', // Placeholder image URL
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
        setProfileData((prev) => ({ ...prev, imageUrl: reader.result as string }));
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
        'Password must be at least 8 characters, contain an uppercase letter and a number.',
      );
      return;
    }

    try {
      await updateUserPassword({
        oldPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password updated successfully!');
      setIsPasswordMode(false); // Exit password mode
    } catch (error) {
      toast.error('Failed to update password. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!isValidEmail(profileData.email)) {
      toast.error('Invalid email address. Please provide a valid email.');
      return;
    }

    const previousProfileData = { ...profileData }; // Backup the current profile data
    try {
      // Prepare the updated UserData object
      const userData: UserData = {
        id: userId || '', // Ensure userId is not null, or handle it as needed
        displayName: profileData.displayName,
        avatarfile: avatarFile as File, // Use the selected avatar file
        username: profileData.username,
        email: profileData.email,
      };

      // Update the local state with the response data
      setProfileData({
        username: profileData.username || '',
        displayName: profileData.displayName,
        email: profileData.email,
        imageUrl: avatarFile ? URL.createObjectURL(avatarFile) : '', // Update with avatar file URL
      });

      // Also update the user context
      setUser({
        userId: userId || '',
        username: profileData.username || '',
        displayname: profileData.displayName,
        email: profileData.email,
        avatarUrl: avatarFile ? URL.createObjectURL(avatarFile) : '', // Update with avatar file URL
      });
      await updateUserFullData(userData);
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
  };

  return (
    <>
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={activeComponent === 'sidebar'}
          state={type}
          onClose={() => setActiveComponent(null)}
        />
      </div>

      <div ref={tagListRef}>
        <TagList
          isOpen={activeComponent === 'taglist'}
          onClose={() => setActiveComponent(null)}
          onFilterChange={handleFilterChange}
        />
      </div>

      <CollapseMenu
        isSidebarOpen={activeComponent === 'sidebar'}
        isTagListOpen={activeComponent === 'taglist'}
        onToggleSidebar={toggleSidebar}
        onToggleTagList={toggleTagList}
        sidebarButtonRef={sidebarButtonRef}
        tagListButtonRef={tagListButtonRef}
      />

      <div className='max-w-md mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg relative border border-blue-600'>
        <h2 className='text-2xl font-semibold mb-6'>Your Profile</h2>

        {/* Flex Layout for Image and Inputs */}
        <div className='flex'>
          {/* Profile Image */}
          <div className='flex-shrink-0 flex items-center'>
            <div className='relative'>
              <img
                src={profileData.imageUrl}
                alt='Profile'
                className={`w-24 h-24 rounded-full border-2 object-cover ${
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
                    className='w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                    className='w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                    className='w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </>
            ) : (
              <>
                {/* Profile Inputs (username, display name, email) */}
                <div>
                  <label htmlFor='username' className='block text-sm font-medium'>
                    Username
                  </label>
                  <input
                    type='text'
                    id='username'
                    value={profileData.username}
                    onChange={handleInputChange}
                    className={`w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border ${
                      isEditing ? 'border-blue-500' : 'border-gray-700'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <label htmlFor='displayName' className='block text-sm font-medium'>
                    Display name
                  </label>
                  <input
                    type='text'
                    id='displayName'
                    value={profileData.displayName}
                    onChange={handleInputChange}
                    className={`w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border ${
                      isEditing ? 'border-blue-500' : 'border-gray-700'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <label htmlFor='email' className='block text-sm font-medium'>
                    Email
                  </label>
                  <input
                    type='email'
                    id='email'
                    value={profileData.email}
                    onChange={handleInputChange}
                    className={`w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border ${
                      isEditing ? 'border-blue-500' : 'border-gray-700'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
              className='px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-400'
            >
              Change Password
            </button>
          )}

          {isEditing || isPasswordMode ? (
            <>
              <button
                onClick={isPasswordMode ? handlePasswordUpdate : handleSave} // Call handleSave or handlePasswordUpdate based on the mode
                className='px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-400'
              >
                {isPasswordMode ? 'Save Password' : 'Save'}
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
              className='px-4 py-2 rounded-md text-sm font-medium bg-gray-300 text-gray-900 hover:bg-blue-400 hover:text-white'
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileCard;

