import React, { useState } from 'react';
import axios from 'axios';
import Box from '../components/box';

interface ProfileData {
    username: string;
    displayName: string;
    email: string;
    imageUrl: string;
  }
  
  const ProfileCard: React.FC = () => {
    const [profileData, setProfileData] = useState<ProfileData>({
      username: 'loading...',
      displayName: 'loading...',
      email: 'loading...',
      imageUrl: 'https://via.placeholder.com/80', // Placeholder image URL
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordMode, setIsPasswordMode] = useState(false);
    const [passwords, setPasswords] = useState({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    const [message, setMessage] = useState<string | null>(null);
    const [isBoxVisible, setIsBoxVisible] = useState(false); // Track visibility of the Box component
  
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
  
    const isStrongPassword = (password: string) => {
      return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
    };
  
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
      const backendCurrentPassword = 'password123'; // Simulated current password
  
      if (passwords.currentPassword !== backendCurrentPassword) {
        setMessage('Current password is incorrect!');
        setIsBoxVisible(true); // Show the box again if validation fails
        return;
      }
  
      if (passwords.newPassword !== passwords.confirmNewPassword) {
        setMessage('New password and confirm password do not match!');
        setIsBoxVisible(true); // Show the box again if validation fails
        return;
      }
  
      if (!isStrongPassword(passwords.newPassword)) {
        setMessage('Password must be at least 8 characters, contain an uppercase letter and a number.');
        setIsBoxVisible(true); // Show the box again if validation fails
        return;
      }
  
      try {
        await axios.post('/api/update-password', { newPassword: passwords.newPassword });
        setMessage('Password updated successfully!');
        setIsBoxVisible(true); // Show success message
        setIsPasswordMode(false); // Exit password mode
      } catch (error) {
        setMessage('Failed to update password. Please try again.');
        setIsBoxVisible(true); // Show the box if an error occurs
      }
    };
  
    const handleSave = async () => {
      if (!isValidEmail(profileData.email)) {
        setMessage('Invalid email address. Please provide a valid email.');
        setIsBoxVisible(true); // Show the box with an error message
        return;
      }
    
      const previousProfileData = { ...profileData }; // Backup the current profile data
    
      try {
        // Send the updated profile data to the backend
        const response = await axios.post('/api/update-profile', {
          username: profileData.username,
          displayName: profileData.displayName,
          email: profileData.email,
          imageUrl: profileData.imageUrl,
        });
    
        // Update the local state with the response data
        setProfileData({
          username: response.data.username,
          displayName: response.data.displayName,
          email: response.data.email,
          imageUrl: response.data.imageUrl,
        });
    
        setMessage('Profile updated successfully!');
        setIsBoxVisible(true); // Show the success message
        setIsEditing(false); // Exit editing mode
      } catch (error) {
        setProfileData(previousProfileData); // Revert to the previous data if an error occurs
        setMessage('Failed to update profile. Please try again.');
        setIsBoxVisible(true); // Show the box with an error message
      }
    };
    
  
    const handleCloseBox = () => {
      setIsBoxVisible(false); // Close the box when clicked
    };
  
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg relative border border-blue-600">
        <h2 className="text-2xl font-semibold mb-6">Your Profile</h2>
  
        {/* Box Component to show message */}
        {isBoxVisible && message && <Box content={message} closeBox={handleCloseBox} />}
  
        {/* Flex Layout for Image and Inputs */}
        <div className="flex">
          {/* Profile Image */}
          <div className="flex-shrink-0 flex items-center">
            <div className="relative">
              <img
                src={profileData.imageUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full border-2 border-blue-500 object-cover cursor-pointer hover:brightness-75"
                onClick={() => isEditing && document.getElementById('imageUpload')?.click()}
              />
              {isEditing && (
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              )}
            </div>
          </div>
  
          {/* Inputs */}
          <div className="flex-1 ml-6 space-y-4">
            {isPasswordMode ? (
              <>
                {/* Password Change Inputs */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwords.newPassword}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    value={passwords.confirmNewPassword}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Profile Inputs (username, display name, email) */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    className={`w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border ${
                      isEditing ? 'border-blue-500' : 'border-gray-700'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium">
                    Display name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={profileData.displayName}
                    onChange={handleInputChange}
                    className={`w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border ${
                      isEditing ? 'border-blue-500' : 'border-gray-700'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
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
        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={toggleEditMode}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isEditing
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-900 hover:bg-blue-400 hover:text-white'
            }`}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
          <button
            onClick={isPasswordMode ? handlePasswordUpdate : togglePasswordMode}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isPasswordMode
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {isPasswordMode ? 'Save Password' : 'Change Password'}
          </button>
        </div>
      </div>
    );
  };
  
  export default ProfileCard;