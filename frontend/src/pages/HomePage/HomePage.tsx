import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';

interface Session {
  session_id: number;
  course_name: string;
  platform: string;
  date: string;
  start_time: string;
  end_time: string;
  mentor_name?: string;
}

interface Mentee {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  profile_picture: string;
  nim?: string;
  faculty?: string;
}

interface PageContext {
  role: 'mentor' | 'mentee' | null;
}

const getImageUrl = (path: string): string | undefined => {
  if (!path) return undefined;
  // If the path is already a full URL from Cloudinary, use it directly
  if (path.startsWith('http')) {
    return path;
  }
  // This is for old images. Use your backend's URL.
  return `https://nindyamaya-backend.vercel.app/${path}`;
};

const HomePage: React.FC = () => {
  const { role: userRole } = useOutletContext<PageContext>();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setError("Autentikasi gagal. Silakan login kembali.");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('/api/home', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.role === "mentor") {
          setSessions(response.data.upcoming_sessions || []);
          setMentees(response.data.my_mentees || []);
        } else if (response.data.role === "mentee") {
          setSessions(response.data.my_sessions || []);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Gagal mengambil data dari server.");
        } else {
          setError("Gagal mengambil data dari server.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      fetchData();
    }
  }, [userRole]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getStatus = (session: Session) => {
    const sessionEndDateTime = new Date(`${session.date.split('T')[0]}T${session.end_time}`);
    return sessionEndDateTime < new Date() ? "Selesai" : "Akan Datang";
  };

  const settings: import("react-slick").Settings = {
      dots: true,
      infinite: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 3000,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
  };

  if (!userRole || loading) {
    return <div>Loading your dashboard...</div>;
  }

  if (error) {
    return <div>{error}</div>
  }
  
  return (
    <div className="home-page">
      <h1 className="page-title">Home</h1>
        {userRole === 'mentee' && (
            <div className="content">
                <p className="first-section">Mentoring Session</p>
                <div className="second-section">
                    <div className="table-section">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Course</th>
                                    <th>Date</th>
                                    <th>Jam Mulai</th>
                                    <th>Jam Selesai</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.slice(0, 6).map((session, index) => (
                                    <tr key={session.session_id}>
                                        <td>{index + 1}</td>
                                        <td>{session.course_name}</td>
                                        <td>{formatDate(session.date)}</td>
                                        <td>{formatTime(session.start_time)}</td>
                                        <td>{formatTime(session.end_time)}</td>
                                        <td>{getStatus(session)}</td>
                                    </tr>
                                ))}
                                {sessions.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>Tidak ada sesi mentoring yang akan datang.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="button-section">
                        <div className="first-button">
                            <p className="button-description">Learn and grow by joining your <span className="span-first-mentee">mentoring sessions</span></p>
                            <div className="button-container">
                                <button 
                                    className="button-first-mentee" 
                                    onClick={() => navigate('/mentoring-session')}
                                >
                                    Mentoring Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {userRole === 'mentor' && (
            <div className="content">
                <p className="first-section">Mentoring Session</p>
                <div className="second-section">
                    <div className="table-section">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Course</th>
                                    <th>Date</th>
                                    <th>Jam Mulai</th>
                                    <th>Jam Selesai</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.slice(0, 4).map((session, index) => (
                                    <tr key={session.session_id}>
                                        <td>{index + 1}</td>
                                        <td>{session.course_name}</td>
                                        <td>{formatDate(session.date)}</td>
                                        <td>{formatTime(session.start_time)}</td>
                                        <td>{formatTime(session.end_time)}</td>
                                        <td>{getStatus(session)}</td>
                                    </tr>
                                ))}
                                {sessions.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>Tidak ada sesi mentoring yang akan datang.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="button-section">
                        <div className="first-button">
                            <p className="button-description">Manage your <span className="span-first">mentoring sessions</span> and support your Mentees.</p>
                            <div className="button-container">
                                <button 
                                    className="button-first" 
                                    onClick={() => navigate('/mentoring-session')}
                                >
                                    Mentoring Session
                                </button>
                            </div>
                        </div>
                        <div className="second-button">
                            <p className="button-description">Start a <span className="span-second">new mentoring session</span> and guide your mentees to success.</p>
                            <div className="button-container">
                                <button 
                                    className="button-second" 
                                    onClick={() => navigate('/create-session')}
                                >
                                    Create Mentoring Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="third-section">
                    <div className="carousel">
                        <Slider {...settings}>
                            <div><img src="../../../../assets/bslc.png" alt="" className="carousel-image" /></div>
                            <div><img src="../../../../assets/bslc.png" alt="" className="carousel-image" /></div>
                            <div><img src="../../../../assets/bslc.png" alt="" className="carousel-image" /></div>
                        </Slider>
                    </div>
                    <div className="list-mentee">
                        <p className="mentee-title">My Mentee</p>
                        <div className="table-section">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Photo Profile</th>
                                        <th>Mentee</th>
                                        <th>Jurusan</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mentees.map((mentee, index) => {
                                        const menteeData = { ...mentee, jurusan: mentee.faculty };

                                        return (
                                            <tr key={menteeData.user_id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <div className="mentee-photo">
                                                        <img src={getImageUrl(menteeData.profile_picture)} alt="Mentee Photo" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <p className="mentee-name">{menteeData.name}</p>
                                                        <p className="mentee-nim">{menteeData.email}</p>
                                                    </div>
                                                </td>
                                                <td>{menteeData.jurusan}</td>
                                                <td>
                                                    <button onClick={() => navigate('/my-mentee')}>
                                                        View details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {mentees.length === 0 && (
                                        <tr>
                                            <td colSpan={5}>Anda belum memiliki mentee.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
};

export default HomePage;