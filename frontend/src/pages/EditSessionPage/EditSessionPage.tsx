import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './EditSessionPage.css';

interface SessionData {
  session_id: number;
  course_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  platform: string;
  session_proof: string | null;
}

const EditSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Fetch session data on component mount
  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`/api/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSession(response.data);
      } catch (error) {
        toast.error('Failed to fetch session details.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 5MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleCancelSession = () => {
    const toastId = 'cancel-confirmation-toast'; // A unique ID for this toast

    toast((t) => (
      <div className="confirmation-toast">
        <p>Are you sure you want to cancel this session?</p>
        <div className="confirmation-toast-buttons">
          <button
            className="toast-button confirm-cancel"
            onClick={() => {
              performCancellation();
              toast.dismiss(t.id);
            }}
          >
            Yes, Cancel
          </button>
          <button className="toast-button" onClick={() => toast.dismiss(t.id)}>
            No
          </button>
        </div>
      </div>
    ), { 
      id: toastId, // Add this ID
      duration: 6000 
    });
  };

  const performCancellation = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Session has been cancelled.');
      navigate('/mentoring-session');
    } catch (error) {
      toast.error('Failed to cancel session.');
      console.error(error);
    }
  };

  const isSessionPast = () => {
    if (!session) return false;
    const sessionEndDateTime = new Date(`${session.session_date.split('T')[0]}T${session.end_time}`);
    return new Date() > sessionEndDateTime;
  };

  const handleCompleteSession = async () => {
    // 1. Check conditions first
    if (!selectedFile && !session?.session_proof) {
      toast.error("You must upload a session proof first.");
      return;
    }
    if (!isSessionPast()) {
      toast.error("You can only complete a session after it has ended.");
      return;
    }

    // 2. Prepare form data for upload
    const formData = new FormData();
    // Only append the file if a new one has been selected
    if (selectedFile) {
      formData.append('sessionProof', selectedFile);
    } else {
        // This case handles completing without a new file, which shouldn't happen with the new logic
        // but is good for safety. The backend will handle the case where no file is sent.
        toast.error("An error occurred. Please select the proof file again.");
        return;
    }
    
    // 3. Send to the new backend endpoint
    const token = localStorage.getItem('token');
    const toastId = toast.loading('Completing session...');
    try {
      await axios.post(`/api/sessions/${sessionId}/complete`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Session completed!', { id: toastId });
      navigate(`/session-attendance/${sessionId}`);
    } catch (error) {
      toast.error('Failed to complete session.', { id: toastId });
      console.error(error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!session) return <div>Session not found.</div>;

  return (
    <div className="mentoring-page">
      <h1 className="page-title">Session Details</h1>
      <div className="mentoring-card">
        <div className="mentoring-header-table">
          <div className="header-cell title-cell">
            <h1>{session.course_name}</h1>
          </div>
        </div>
        <div className="mentoring-body">
          <div className="session-form">
            <div>
              <label>Date</label>
              <input type="text" value={new Date(session.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} readOnly />
            </div>
            <div>
              <label>Time</label>
              <input type="text" value={`${session.start_time.substring(0, 5)} - ${session.end_time.substring(0, 5)}`} readOnly />
            </div>
            <div>
              <label>Platform</label>
              <input type="text" value={session.platform} readOnly />
            </div>
            <div className="form-actions">
              <button className="btn green" onClick={handleCancelSession}>Cancel Session</button>
              <button 
                className="btn black" 
                onClick={handleCompleteSession}
              >
                Complete Session
              </button>
            </div>
          </div>

          <div className="upload-section">
              <h4>Upload Session Proof (Screenshot)</h4>
              <input
                type="file"
                id="fileUpload"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div className="upload-box" onClick={() => document.getElementById('fileUpload')?.click()}>
                {/* Show the preview image if it exists */}
                {previewUrl ? (
                  <img src={previewUrl} alt="Session proof preview" className="image-preview" />
                ) : (
                  <>
                    <p>{session?.session_proof ? `An existing proof is already uploaded.` : 'Click to select proof'}</p>
                    <small>Supported formats: .png, .jpg, .jpeg | Max size: 5MB</small>
                  </>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSessionPage;