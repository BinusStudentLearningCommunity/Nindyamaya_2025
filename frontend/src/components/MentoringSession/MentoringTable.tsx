import React, { useState, useEffect } from 'react'
import '../../pages/MentoringSessionPage/MentoringSessionPage.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Session {
  session_id: number;
  course_name: string;
  date: string;
  start_time: string;
  end_time: string;
  platform: string;
  session_proof: string | null;
}

interface MentoringTableProps {
  role: 'mentor' | 'mentee';
}

const MentoringTable: React.FC<MentoringTableProps> = ({ role }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsToShow, setRowsToShow] = useState(10)
  const navigate = useNavigate();

  const filteredSessions = sessions
  .filter((session) =>
    session.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(session.date).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase())
  )
  .slice(0, rowsToShow);

  const handleViewDetails = (session: Session) => { // Pass the whole session object
    if (session.session_proof) {
      // If there is proof, it's "complete", and anyone can view attendance
      navigate(`/session-attendance/${session.session_id}`);
    } else {
      // If no proof, it's "incomplete"
      if (role === 'mentor') {
        navigate(`/edit-session/${session.session_id}`);
      } else {
        toast.error("This session is not yet complete. Please wait for the mentor to upload proof.");
      }
    }
};

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSessions(response.data);
      } catch (err) {
        setError('Failed to fetch mentoring sessions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading sessions...</p>;
  if (error) return <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</p>;  

  return (
    <div className="table-wrapper">
      <div className="table-controls">
        <div className="show-control">
          <label htmlFor="show" className="show-label">Show</label>
          <select
            id="show"
            value={rowsToShow}
            onChange={(e) => setRowsToShow(parseInt(e.target.value))}
            className='show-select'
          >
            {[5, 10, 15, 20].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
            <option value={sessions.length}>All</option>
          </select>
        </div>

        <div className="search-control">
          <label htmlFor="search" className="visually-hidden">Search</label>
          <input
            type="text"
            id="search"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

      </div>

      <table className="mentoring-table">
        <thead>
          <tr>
            <th className="col-no">NO</th>
            <th className="col-course">COURSE</th>
            <th className="col-date">DATE</th>
            <th className="col-time">TIME</th>
            <th className="col-platform">PLATFORM</th>
            <th className="col-action">ACTION</th>
          </tr>
        </thead>
        <tbody>
          {filteredSessions.map((session, index) => (
            <tr key={session.session_id}>
              <td className="col-no">{index + 1}</td>
              <td className="col-course">{session.course_name}</td>
              <td className="col-date">{new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
              <td className="col-time">{`${session.start_time.substring(0, 5)} - ${session.end_time.substring(0, 5)}`}</td>
              <td className="col-platform">{session.platform}</td>
              <td className="col-action">
                <button className="view-button" onClick={() => handleViewDetails(session)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MentoringTable
