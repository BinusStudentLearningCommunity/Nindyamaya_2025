
import React, { useState, useEffect } from 'react';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState({
      name: '',
      nim: '',
      email: '',
      faculty: '',
      profile_picture: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('No file chosen');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('http://localhost:5000/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    if (data.profile_picture) {
                        setProfileImage(`http://localhost:5000/${data.profile_picture.replace(/\\/g, '/')}`);
                    }
                } else {
                    console.error('Failed to fetch user profile');
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
      }
    };
    fetchUserProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    } else {
      setSelectedFile(null);
      setFileName('No file chosen');
    }
  };

  const handleSavePhoto = async () => {
      if (!selectedFile) return;

      const formData = new FormData();
      formData.append('profilePhoto', selectedFile);

      const token = localStorage.getItem('token');

      try {
          const response = await fetch('http://localhost:5000/api/users/profile/photo', {
              method: 'PUT',
              headers: {
                  'Authorization': `Bearer ${token}`
              },
              body: formData
          });

          if (response.ok) {
              const data = await response.json();
              setProfileImage(`http://localhost:5000/${data.filePath.replace(/\\/g, '/')}`);
              alert('Photo updated successfully!');
              setSelectedFile(null);
              setFileName('No file chosen');
          } else {
              alert('Failed to upload photo.');
          }
      } catch (error) {
          console.error('Error uploading photo:', error);
          alert('An error occurred while uploading the photo.');
      }
  };

  return (
    <div className="profile-page">
      <h1 className="page-title">Profile</h1>
      <div className="profile-card">
        <div className="profile-photo-section">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-image" />
          ) : (
            <div className="photo-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          )}
          <p className="photo-error">Please Choose Your Photo Profile</p>
          <div className="file-input-wrapper">
            <input 
              type="file" 
              id="photo-upload" 
              className="file-input" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <label htmlFor="photo-upload" className="file-input-label">Choose File</label>
            <span className="file-name">{fileName}</span>
          </div>
          {selectedFile && (
            <button 
              className="save-photo-btn" 
              onClick={handleSavePhoto}
            >
              Save Photo
            </button>
          )}
          <p className="photo-size-info">Maximum size: 1 MB</p>
        </div>
        
        <div className="profile-details-section">
          <div className="detail-item">
            <span className="detail-label">Name</span>
            <span className="detail-value">{userData.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">NIM</span>
            <span className="detail-value">{userData.nim}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{userData.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">School / Faculty</span>
            <span className="detail-value">{userData.faculty}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
