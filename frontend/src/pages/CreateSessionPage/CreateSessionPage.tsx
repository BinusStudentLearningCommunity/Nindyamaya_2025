import React, { useEffect, useState } from 'react';
import './CreateSessionPage.css';
import { useNavigate } from 'react-router-dom';

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

    const navigate = useNavigate();

    const handleCancel = () => {
      navigate('/');
    };

    const handleConfirm = () => {
      alert('Session creation logic goes here!');
      navigate('/');
    };

    return (
        <div className="create-session-page">

            <div className='content-createsession'>

                <h1 className="page-title">Profile</h1>

                <div className="create-session-container">

                    <form className='create-session-form'>
                        <h1>Session Detail</h1>

                        <div>
                            <label htmlFor="course">Course</label>
                            <input type="text" id="course" name="course" />
                        </div>

                        <div>
                            <label htmlFor="date">Date</label>
                            <input type="date" id="date" name="date" />
                        </div>

                        <div>
                            <label htmlFor="date">Start Time</label>
                            <input type="time" id="start-time" name="start-time" />
                        </div>

                        <div>
                            <label htmlFor="date">End Time</label>
                            <input type="time" id="end-time" name="End-time" />
                        </div>

                        <div>
                            <label htmlFor="platform">Platform</label>
                            <input type="text" id="platform" name="platform" />
                        </div>


                    </form>

                    <div class="button-group">
                        <button id="button-createsession" onClick={handleCancel}>Cancel</button>
                        <button id="submit-createsession" onClick={handleConfirm}>Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default CreateSessionPage;