import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './SessionAttendancePage.css';

interface Mentor {
    name: string;
    nim: string;
    profile_picture: string | null;
}

interface Attendee {
    user_id: number;
    name: string;
    nim: string;
    check_in_time: string | null;
    profile_picture: string | null;
}

interface SessionDetails {
    course_name: string;
    platform: string;
    date: string;
    start_time: string;
    end_time: string;
    session_proof: string | null;
    mentor: Mentor;
    attendees: Attendee[];
}

interface PageContext {
  role: 'mentor' | 'mentee';
}

const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  // If the path is a full URL from Cloudinary, use it directly
  if (path.startsWith('http')) {
    return path;
  }
  // This is for old images. Use your backend's URL and handle backslashes.
  return `https://nindyamaya-backend.vercel.app/${path.replace(/\\/g, '/')}`;
};

const getLoggedInUser = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

const SessionAttendancePage: React.FC = () => {
    const currentUser = getLoggedInUser();
    const { session_id } = useParams<{ session_id: string }>();
    const { role } = useOutletContext<PageContext>();
    const navigate = useNavigate();

    const [session, setSession] = useState<SessionDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchSessionDetails = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication failed.");
                setLoading(false);
                return;
            }

            try {
                // Confirm this URL ends with "/details"
                const response = await axios.get(`/api/attendance/${session_id}/details`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSession(response.data);
            } catch (err) {
                setError("Failed to fetch session details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (session_id) {
            fetchSessionDetails();
        }

        if (role === 'mentor') {
            const intervalId = setInterval(() => {
                fetchSessionDetails();
            }, 10000); // 10 seconds

            return () => clearInterval(intervalId);
        }
    }, [session_id, role]);

    const handleConfirmAttendance = async () => {
        const token = localStorage.getItem('token');

        const promise = axios.post(
            `/api/attendance/${session_id}/confirm`, // This URL is now correct
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.promise(promise, {
            loading: 'Confirming attendance...',
            success: 'Attendance confirmed successfully!',
            error: (err) => err.response?.data?.message || 'Failed to confirm attendance.', // Improved error message
        });

        try {
            await promise;
            // Re-fetch data to show the updated check-in time immediately
            const response = await axios.get(`/api/attendance/${session_id}/details`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSession(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSession = () => {
        const toastId = 'delete-confirmation-toast';

        toast((t) => (
          <div className="confirmation-toast">
            <p>Are you sure you want to delete this session?</p>
            <div className="confirmation-toast-buttons">
              <button
                className="toast-button confirm-delete" // Use a specific class for red color
                onClick={() => {
                  performDeletion();
                  toast.dismiss(t.id);
                }}
              >
                Yes, Delete
              </button>
              <button className="toast-button" onClick={() => toast.dismiss(t.id)}>
                No
              </button>
            </div>
          </div>
        ), {
          id: toastId,
          duration: 6000
        });
    };

    const performDeletion = async () => {
        const token = localStorage.getItem('token');
        const promise = axios.delete(`/api/sessions/${session_id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        toast.promise(promise, {
            loading: 'Deleting session...',
            success: 'Session deleted successfully!',
            error: 'Failed to delete session.',
        });

        try {
            await promise;
            navigate('/mentoring-session');
        } catch (err) {
            console.error(err);
        }
    };

    const hasUserConfirmed = session?.attendees
        ? session.attendees.some(
            attendee => attendee.user_id === currentUser?.id && attendee.check_in_time !== null
        )
        : false;

    if (loading) return <div className="session-attendance-page"><p>Loading session...</p></div>;
    if (error) return <div className="session-attendance-page"><p>{error}</p></div>;
    if (!session) return <div className="session-attendance-page"><p>Session not found.</p></div>;

    // Helper to format date and time
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const formatTime = (timeString: string) => timeString.substring(0, 5);

    const formatCheckInTime = (timeString: string) => {
        return new Date(timeString).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const mentorProfileImage = session.mentor.profile_picture ? getImageUrl(session.mentor.profile_picture) : undefined;
    const sessionProofImage = session.session_proof ? getImageUrl(session.session_proof) : undefined;
  
    return (
        <div className="session-attendance-page">
            <h1 className="page-title">Mentoring Session</h1>
            <div className="attendance-page">
                <div className='profile-confirmation'>
                    <div className='profile-mentor-card'>
                        <div className='profile-title-image'>
                            <div>
                                {mentorProfileImage ? (
                                    <img src={mentorProfileImage} alt={session.mentor.name} className="profile-image" />
                                ) : (
                                    <div className="photo-placeholder">{/* SVG icon */}</div>
                                )}
                            </div>
                            <div>
                                <p className='mentor-name'>{session.mentor.name}</p>
                                <p className='mentor-nim'>{session.mentor.nim}</p>
                            </div>
                        </div>
                        <div className='profile-details'>
                            <div className='detail-item-session'><p className='detail-left'>Course</p><p className='detail-right'>{session.course_name}</p></div>
                            <div className='detail-item-session'><p className='detail-left'>Platform</p><p className='detail-right'>{session.platform}</p></div>
                            <div className='detail-item-session'><p className='detail-left'>Date</p><p className='detail-right'>{formatDate(session.date)}</p></div>
                            <div className='detail-item-session'><p className='detail-left'>Start</p><p className='detail-right'>{formatTime(session.start_time)}</p></div>
                            <div className='detail-item-session'><p className='detail-left'>End</p><p className='detail-right'>{formatTime(session.end_time)}</p></div>
                        </div>
                    </div>
                    
                    {role === 'mentor' && (
                        <div className='delete-card'>
                            <p className='delete-text'>Click here to <span className='highlight-red'>remove this session</span> from your mentoring schedule.</p>
                            <div className='delete-button'>
                                <button className='delete-btn' onClick={handleDeleteSession}>Delete Session</button>
                            </div>
                        </div>
                    )}

                    {role === 'mentee' && !hasUserConfirmed && ( // Note the !hasUserConfirmed check
                        <div className='confirmation-card'>
                            <p className='confirmation-text'>Mark your attendance to <span className='highlight-green'>confirm your participation</span> in this mentoring session.</p>
                            <div className='confirmation-button'>
                                <button className='confirm-btn' onClick={handleConfirmAttendance}>Confirm Attendance</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className='course-card'>
                    <div className='course-description'>
                        {sessionProofImage ? (
                            <img src={sessionProofImage} alt="Session Proof" className="session-proof-image" />
                        ) : (
                            <p className="no-proof-text">Session proof has not been uploaded yet.</p>
                        )}
                    </div>
                    <p className='course-name'>{session.course_name}</p>
                </div>
            </div>

            <div className='attendance-table'>
                <div className='attendance-header'>
                    <p>Photo Profile</p>
                    <p>Mentee</p>
                    <p>Check In Time</p>
                </div>
                {session.attendees.map(attendee => (
                    <div className='attendance-row' key={attendee.user_id}>
                        <div className='photo-profile'>
                            {getImageUrl(attendee.profile_picture) ? (
                                <img src={getImageUrl(attendee.profile_picture)!} alt={attendee.name} className="profile-image" />
                            ) : (
                                <div className="photo-placeholder">{/* SVG icon */}</div>
                            )}
                        </div>
                        <div className='mentee-name'>
                            <p className='name'>{attendee.name}</p>
                            <p className='nim'>{attendee.nim}</p>
                        </div>
                        <div className='check-in-time'>
                            <p>{attendee.check_in_time ? formatCheckInTime(attendee.check_in_time) : 'Not Checked In'}</p>
                        </div>
                    </div>
                ))}
                {session.attendees.length === 0 && (
                    <div className='attendance-row'>
                        <p style={{ width: '100%', textAlign: 'center' }}>No mentees have checked in yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionAttendancePage;