import React, { useEffect, useState } from 'react';
import './CreateSessionPage.css';

const CreateSessionPage: React.FC = () => {
     const [userData, setUserData] = useState({
      name: '',
      nim: '',
      email: '',
      faculty: '',
      profile_picture: null,
  });

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
    return (
            <div className="create-session-page">
                
                <h1 className="page-title">Create Session</h1>
                
            </div>
    )
};

export default CreateSessionPage;