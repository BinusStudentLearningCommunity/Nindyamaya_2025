import React, { useEffect, useState } from 'react';
import './EditSessionPage.css';
import { useParams } from 'react-router-dom';

const EditSessionPage: React.FC = () => {
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
    const [file, setFile] = useState<File | null>(null);
    const sessionId = useParams().id;

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

    useEffect(() => {
      const fetchSessionData = async () => {
        const token = localStorage.getItem('token');
        if (!token || !sessionId) return;

        try {
          const res = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await res.json();
          if (res.ok) {
            setCourseName(data.course);
            setMentorId(data.mentor_user_id);
            setDate(data.date);
            setStartTime(data.startTime);
            setEndTime(data.endTime);
            setPlatform(data.platform);

          } else {
            console.error(data.message);
          }
        } catch (err) {
          console.error('Error fetching session:', err);
        }
      };

      fetchSessionData();
    }, [sessionId]);


    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      if (!token) return;

      const sessionData = {
        course_name: courseName,
        mentor_user_id: mentorId,
        session_date: date,
        start_time: startTime,
        end_time: endTime,
        platform: platform,
      };

      try {
        const response = await fetch('http://localhost:5000/api/sessions/edit-session', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(sessionData),
        });

        const data = await response.json();
        if (response.ok) {
          console.log('Session updated:', data);
          // Show success toast or redirect
        } else {
          console.error(data.message);
          setError(data.message);
        }
      } catch (err) {
        console.error('Error updating session:', err);
        setError('Something went wrong.');
      }
    };

  const handleFileUpload = async () => {
      if (!file) return;

      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('sessionId', sessionId || '');
      formData.append('recording', file);

      try {
        const res = await fetch('http://localhost:5000/api/sessions/upload-recording', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          console.log('Upload success:', data);
        } else {
          console.error('Upload failed:', data.message);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    };


  return (
    <div className="mentoring-page">
      <h1 className="page-title">Mentoring Session</h1>

      <div className="mentoring-card">
        <div className="mentoring-header-table">
            <div className="header-cell title-cell">
                <h1>Session Detail</h1>
            </div>
        </div>

        <div className="mentoring-body">
          <div className="session-form">
            <form onSubmit={handleSubmit}> 
              <div>
                  <label htmlFor="course">Course</label>
                  <input type="text" id="course" name="course" onChange={(e) => setCourseName(e.target.value)}/>
              </div>

              <div>
                  <label htmlFor="date">Date</label>
                  <input type="date" id="date" name="date" onChange={(e) => setDate(e.target.value)} />
              </div>

              <div>
                  <label htmlFor="date">Start Time</label>
                  <input type="time" id="start-time" name="start-time" onChange={(e) => setStartTime(e.target.value)}/>
              </div>

              <div>
                  <label htmlFor="date">End Time</label>
                  <input type="time" id="end-time" name="end-time" onChange={(e) => setEndTime(e.target.value)}/>
              </div>

              <div>
                  <label htmlFor="platform">Platform</label>
                  <input type="text" id="platform" name="platform" onChange={(e) => setPlatform(e.target.value)}/>
              </div>
              <div className="form-actions">
                <button className="btn black" type="submit">Complete Session</button>
                <button className="btn green" type="reset">Cancel Session</button>
              </div>
            </form>


          </div>

          <div className="upload-section">
            <h4>Upload Recording</h4>

            {/* Hidden File Input */}
            <input
              type="file"
              id="fileUpload"
              accept=".mp4"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            />

              {/* Clickable Box */}
              <div
                className="upload-box"
                onClick={() => document.getElementById('fileUpload').click()}
              >
                <p>Click to upload or drag and drop</p>
                <small>Supported format: .mp4 | Max size: 500MB</small>
              </div>

              <button
                className="btn black upload-btn"
                onClick={() => handleFileUpload()}
                disabled={!file}
                type="button"
              >
                Upload
              </button>
            </div>

          </div>
      </div>
    </div>
  );
};

export default EditSessionPage;