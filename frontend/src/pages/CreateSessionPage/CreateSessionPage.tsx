import React, { useEffect, useState } from 'react';
import './CreateSessionPage.css';
import toast from 'react-hot-toast';

const CreateSessionPage: React.FC = () => {
    const [userData, setUserData] = useState({
      name: '',
      nim: '',
      email: '',
      faculty: '',
      profile_picture: null,
    });
    const [mentorId, setMentorId] = useState(null);
    const [courseName, setCourseName] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [platform, setPlatform] = useState('');
    const [error, setError] = useState('');

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
                        setMentorId(data.id); // Assuming the user data contains the mentor ID
                        
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseName || !mentorId || !date || !startTime || !endTime || !platform) {
            setError('Please fill in all fields.');
            toast.error('Please fill in all fields.');
            return;
        }
        console.log({
            courseName,
            mentorId,
            date,
            startTime,
            endTime,
            platform
        })
        const token = localStorage.getItem('token');
        const sessionData = {
            course_name:courseName,
            mentor_user_id:mentorId,
            session_date: date,
            start_time: startTime,
            end_time: endTime,
            platform: platform,
        }
        const res = await fetch('http://localhost:5000/api/sessions/create-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(sessionData),
        });
        const data = await res.json();
        console.log(data);
        if(res.status === 200) {
            toast.success('Logged in successfully!');
            // Optionally, redirect or show a success message
        }
        else{
            console.log(data.message);
            setError(data.message);
            toast.error('Failed to create session. Please try again.');
        }
            
    }
    return (
        <div className="create-session-page">

            <div className='content-createsession'>

                <h1 className="page-title">Profile</h1>

                <div className="create-session-container">

                    <form className='create-session-form' onSubmit={handleSubmit}>
                        <h1>Session Detail</h1>

                        <div>
                            <label htmlFor="course">Course</label>
                            <input type="text" id="course" name="course" onChange={(e) => setCourseName(e.target.value)}/>
                        </div>

                        <div>
                            <label htmlFor="date">Date</label>
                            <input type="date" id="date" name="date" onChange={(e) => setDate(e.target.value)}/>
                        </div>

                        <div>
                            <label htmlFor="date">Start Time</label>
                            <input type="time" id="start-time" name="start-time" onChange={(e) => setStartTime(e.target.value)}/>
                        </div>

                        <div>
                            <label htmlFor="date">End Time</label>
                            <input type="time" id="end-time" name="End-time" onChange={(e) => setEndTime(e.target.value)}/>
                        </div>

                        <div>
                            <label htmlFor="platform">Platform</label>
                            <input type="text" id="platform" name="platform" onChange={(e) => setPlatform(e.target.value)}/>
                        </div>


                    </form>

                    <div className="button-group">
                        <button id="button-createsession" type="button">Cancel</button>
                        <button id="submit-createsession" type="submit">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default CreateSessionPage;