import React, { useState, useEffect, useRef } from 'react';
import { updateUserPassword, UserDataProfile } from '../services/userService'; // Import update functions
import { toast } from 'react-toastify';
import { isValidEmail, isStrongPassword } from '../utils/helpers';

import { useAuthUser } from '../context/AuthUserContext';
interface ProfileEditProps {
  modeChange: 'editprofile' | 'editpassword' | null;
  closeModal: () => void;
}
const ProfileEdit: React.FC<ProfileEditProps> = ({ modeChange, closeModal: propcloseModal }) => {
  const { user, updateUser } = useAuthUser();

  const [profileData, setProfileData] = useState<UserDataProfile>({
    _id: user?._id || '',
    username: user?.username || 'Username', // Fallback to empty string if null
    displayname: user?.displayname || 'Displayname', // Fallback to empty string if null
    email: user?.email || 'Email', // Fallback to empty string if null
    story: user?.story || '',
    avatar:
      user?.avatar ||
      'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541', // Placeholder image URL
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // For avatar file input

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    if (id === 'displayname' || id === 'username') {
      // Limit displayName to 30 characters
      if (value.length > 30) {
        setProfileData((prev) => ({ ...prev, [id]: value.slice(0, 30) }));
        return;
      }
    }

    if (id === 'story') {
      // Limit biography to 150 characters
      if (value.length > 250) {
        setProfileData((prev) => ({ ...prev, [id]: value.slice(0, 250) }));
        return;
      }
    }

    if (modeChange === 'editpassword') {
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
      propcloseModal();
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

      propcloseModal();
    } catch (error) {
      setProfileData(previousProfileData); // Revert to the previous data if an error occurs
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleQuit = () => {
    setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear password fields

    if (user) {
      setProfileData({
        _id: user._id || '',
        username: user.username || '',
        displayname: user.displayname,
        story: user.story || '',
        email: user.email,
        avatar: user.avatar, // Update with avatar file URL
      });
    }
  };
  const [activeComponent, setActiveComponent] = useState<'sidebar' | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);

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
    <div className='flex absolute items-center'>
      <div className='w-full h-full lg:h-full lg:w-[50vw] bg-Background/Bottom bg-center bg-cover px-14 py-10  flex flex-col border-Primary/Dark border-solid box-border lg:border-2 lg:rounded-3xl sm:max-lg:rounded-3xl  lg:mt-4  relative'>
        {/* Close Button */}
        <button
          onClick={propcloseModal}
          className='absolute top-6 right-12 text-white text-3xl hover:text-Primary/Light'
        >
          ×
        </button>
        <h2 className='text-2xl font-semibold mb-6'>
          {modeChange === 'editpassword' ? 'Password Change' : 'Profile Edit'}
        </h2>

        {/* Flex Layout for Image and Inputs */}
        <div className='flex'>
          {/* Inputs */}
          <div className='flex-1 ml-4 space-y-4'>
            {modeChange === 'editpassword' ? (
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
                <div className='flex items-start space-x-6'>
                  {/* Profile Image */}
                  <div className='flex-shrink-0'>
                    <div className='relative group'>
                      <label htmlFor='avatar-upload' className='cursor-pointer'>
                        <img
                          src={profileData.avatar}
                          alt='Profile'
                          className={`w-32 h-32 rounded-full object-cover ${
                            modeChange === 'editprofile'
                              ? 'cursor-pointer hover:brightness-75'
                              : 'cursor-default'
                          }`}
                          onClick={() =>
                            modeChange === 'editprofile' &&
                            document.getElementById('imageUpload')?.click()
                          }
                        />
                        <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-full text-white font-semibold'>
                          Choose image
                        </div>
                      </label>

                      {modeChange === 'editprofile' && (
                        <input
                          type='file'
                          id='avatar-upload'
                          accept='image/*'
                          className='hidden'
                          onChange={handleImageChange}
                        />
                      )}
                    </div>
                  </div>

                  {/* Profile Inputs */}
                  <div className='flex-grow grid grid-cols-2 gap-4'>
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
                          modeChange === 'editprofile' &&
                          'focus:border focus:ring-2 focus:border-Primary/Dark'
                        }`}
                        readOnly={!(modeChange === 'editprofile')}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='email'
                        className='block text-sm font-medium text-Primary/Light'
                      >
                        Email
                      </label>
                      <input
                        type='email'
                        id='email'
                        value={profileData.email}
                        onChange={handleInputChange}
                        className={`w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md focus:outline-none ${
                          modeChange === 'editprofile' &&
                          'focus:border focus:ring-2 focus:border-Primary/Dark'
                        }`}
                        readOnly={!(modeChange === 'editprofile')}
                      />
                    </div>

                    {/* Full Width Display Name */}
                    <div className='col-span-2'>
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
                          modeChange === 'editprofile' &&
                          'focus:border focus:ring-2 focus:border-Primary/Dark'
                        }`}
                        readOnly={!(modeChange === 'editprofile')}
                      />
                    </div>
                  </div>
                </div>

                {/* Biography Input - Full Width Textarea */}
                <div className='mt-4'>
                  <label
                    htmlFor='biography'
                    className='block text-sm font-medium text-Primary/Light'
                  >
                    Biography
                  </label>
                  <textarea
                    id='story'
                    value={profileData.story}
                    maxLength={300}
                    rows={4}
                    onChange={handleInputChange}
                    className={`w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md focus:outline-none resize-none ${
                      modeChange === 'editprofile' &&
                      'focus:border focus:ring-2 focus:border-Primary/Dark'
                    }`}
                    readOnly={!(modeChange === 'editprofile')}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Buttons at the Bottom */}
        <div className='flex justify-end mt-6 space-x-4'>
          {(modeChange === 'editpassword' || modeChange === 'editprofile') && (
            <>
              <button
                onClick={modeChange === 'editpassword' ? handlePasswordUpdate : handleSave} // Call handleSave or handlePasswordUpdate based on the mode
                className='px-4 py-2 rounded-md text-sm font-medium bg-Accent/Target text-white hover:text-Accent/Target hover:bg-white'
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProfileEdit;

