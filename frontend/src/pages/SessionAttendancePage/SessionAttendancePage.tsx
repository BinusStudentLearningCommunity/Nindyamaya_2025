import React from 'react';
import './SessionAttendancePage.css';


const SessionAttendancePage: React.FC = () => {
    // const { session_id } = useParams();
  
  
    return (
    <div className="session-attendance-page">
      <h1 className="page-title">Mentoring Session</h1>
        <div className="attendance-page">
            <div className='profile-confirmation'>
                <div className='profile-mentor-card'>

                    <div className='profile-title-image'>
                        <div>
                            {/* {profileImage ? (
                                <img src={profileImage} alt="Profile" className="profile-image" />
                            ) : ( */}
                                <div className="photo-placeholder">
                                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                </div>
                            {/* )} */}
                        </div>
                        <div>
                            <p className='mentor-name'>"Mentor's Name"</p>
                            <p className='mentor-nim'>"Mentor's NIM"</p>
                        </div>

                    </div>
                    <div className='profile-details'>
                        <div className='detail-item'>
                            <p className='detail-left'>Course</p>   
                            <p className='detail-right'>##########</p>
                        </div>

                        <div className='detail-item'>
                            <p className='detail-left'>Platform</p>   
                            <p className='detail-right'>##########</p>
                        </div>

                        <div className='detail-item'>
                            <p className='detail-left'>Date</p>   
                            <p className='detail-right'>##########</p>
                        </div>

                        <div className='detail-item'>
                            <p className='detail-left'>Start</p>   
                            <p className='detail-right'>##########</p>
                        </div>

                        <div className='detail-item'>
                            <p className='detail-left'>End</p>   
                            <p className='detail-right'>##########</p>
                        </div>
                    </div>

                </div>
                
                {/* {userRole === 'mentor' && (
                    <div className='delete-card'>

                        <p className='delete-text'>Click here to <span className='highlight-red'>remove this session</span> from your mentoring schedule.</p>

                        <div className='delete-button'>
                            <button className='delete-btn'>
                                Delete Session
                            </button>
                        </div>
                    </div>
                )} */}

                {/* {userRole === 'mentee' && ( */}
                    <div className='confirmation-card'>
                        <p className='confirmation-text'>Mark your attendance to <span className='highlight-green'>confirm your participation</span> in this mentoring session.</p>

                        <div className='confirmation-button'>
                            <button className='confirm-btn'>
                                Confirm Attendance
                            </button>
                        </div>
                    </div>
                {/*  )} */}

            </div>

            <div className='course-card'>
                <div className='course-description'>
                    
                </div>
                <p className='course-name'>"Course Name"</p>
            </div>
        </div>

      <div className='attendance-table'>
        <div className='attendance-header'>
            <p>Photo Profile</p>
            <p>Mentee</p>
            <p>Check In Time</p>
        </div>
        <div className='attendance-row'>
            <div className='photo-profile'>
                {/* {profileImage ? (
                    <img src={profileImage} alt="Profile" className="profile-image" />
                ) : ( */}
                    <div className="photo-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                {/* )} */}
            </div>
            <div className='mentee-name'>
                <p className='name'>"Mentee's Name"</p>
                <p className='nim'>"Mentee's NIM"</p>
            </div>
            <div className='check-in-time'>
                <p>"Check In Time"</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SessionAttendancePage;