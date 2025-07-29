import React, { useState } from 'react';
import './CreateSessionPage.css';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const CreateSessionPage: React.FC = () => {
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [platform, setPlatform] = useState('');
  
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/mentoring-session');
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!course || !date || !startTime || !endTime || !platform) {
      toast.error('All fields are required!');
      return;
    }

    const sessionData = {
      course,
      date,
      startTime,
      endTime,
      platform,
    };
    
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('/api/sessions', sessionData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        toast.success('Session created successfully!');
        navigate('/mentoring-session');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to create session.');
      } else {
        toast.error('An unexpected error occurred.');
      }
      console.error('Error creating session:', error);
    }
  };

  return (
    <div className="create-session-page">
      <div className='content-createsession'>
        <h1 className="page-title">Create Session</h1>
        <div className="create-session-container">
          <form className='create-session-form' onSubmit={handleConfirm}>
            <h1>Session Detail</h1>
            <div>
              <label htmlFor="course">Course</label>
              <input type="text" id="course" name="course" value={course} onChange={(e) => setCourse(e.target.value)} />
            </div>
            <div>
              <label htmlFor="date">Date</label>
              <input type="date" id="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label htmlFor="start-time">Start Time</label>
              <input type="time" id="start-time" name="start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label htmlFor="end-time">End Time</label>
              <input type="time" id="end-time" name="end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div>
              <label htmlFor="platform">Platform</label>
              <input type="text" id="platform" name="platform" value={platform} onChange={(e) => setPlatform(e.target.value)} />
            </div>
            <div className="button-group">
              <button type="button" id="button-createsession" onClick={handleCancel}>Cancel</button>
              <button type="submit" id="submit-createsession">Confirm</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSessionPage;