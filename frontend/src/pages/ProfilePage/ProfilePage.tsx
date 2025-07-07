
import React, { useState } from 'react';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const [userData] = useState({
    name: 'Michelle Lydia Sugainto',
    nim: '2108920301',
    email: 'user@gmail.com',
    schoolFaculty: 'School of Computer Science',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('No file chosen');
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  const handleSavePhoto = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
      // Reset file selection after saving
      setSelectedFile(null);
      setFileName('No file chosen');
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
          <p className="photo-size-info">Maximum size: 10 MB</p>
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
            <span className="detail-value">{userData.schoolFaculty}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
