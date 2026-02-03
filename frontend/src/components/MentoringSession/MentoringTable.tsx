/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import './MentoringSessionPage.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

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
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const filteredSessions = sessions
    .filter((session) =>
      session.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(session.date).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, rowsToShow);

  const handleViewDetails = (session: Session) => {
    if (session.session_proof) {
      navigate(`/session-attendance/${session.session_id}`);
    } else {
      if (role === 'mentor') {
        navigate(`/edit-session/${session.session_id}`);
      } else {
        toast.error("This session is not yet complete. Please wait for the mentor to upload proof.");
      }
    }
  };

  const handleExportToExcel = async () => {
    if (sessions.length === 0) {
      toast.error('No sessions to export.');
      return;
    }

    setIsExporting(true);
    try {
      // Fetch attendance data for each session
      const token = localStorage.getItem('token');
      const attendancePromises = sessions.map(async (session) => {
        try {
          const response = await axios.get(`/api/sessions/${session.session_id}/attendance`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return {
            sessionId: session.session_id,
            attendance: response.data.attendance || []
          };
        } catch (err) {
          console.error(`Failed to fetch attendance for session ${session.session_id}:`, err);
          return {
            sessionId: session.session_id,
            attendance: []
          };
        }
      });

      const attendanceData = await Promise.all(attendancePromises);

      // Format data for Excel
      const excelData = sessions.map(session => {
        const sessionAttendance = attendanceData.find(a => a.sessionId === session.session_id);
        const attendees = sessionAttendance?.attendance?.map((att: any) => att.name || `Mentee ${att.mentee_user_id}`).join(', ') || 'No attendees';
        const attendeeCount = sessionAttendance?.attendance?.length || 0;

        return {
          'Session ID': session.session_id,
          'Course Name': session.course_name,
          'Date': new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          'Start Time': session.start_time.substring(0, 5),
          'End Time': session.end_time.substring(0, 5),
          'Platform': session.platform,
          'Status': session.session_proof ? 'Completed' : 'Pending',
          'Attendee Count': attendeeCount,
          'Attendees': attendees
        };
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 10 }, // Session ID
        { wch: 30 }, // Course Name
        { wch: 15 }, // Date
        { wch: 12 }, // Start Time
        { wch: 12 }, // End Time
        { wch: 20 }, // Platform
        { wch: 12 }, // Status
        { wch: 15 }, // Attendee Count
        { wch: 40 }, // Attendees
      ];
      worksheet['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Mentoring Sessions');

      // Generate file name with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `mentoring-sessions-${dateStr}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, fileName);

      toast.success('Sessions exported successfully!');
    } catch (err) {
      console.error('Failed to export sessions:', err);
      toast.error('Failed to export sessions. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFilteredToExcel = () => {
    if (filteredSessions.length === 0) {
      toast.error('No filtered sessions to export.');
      return;
    }

    setIsExporting(true);
    try {
      // Format filtered data for Excel
      const excelData = filteredSessions.map((session, index) => ({
        'No': index + 1,
        'Course Name': session.course_name,
        'Date': new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        'Time': `${session.start_time.substring(0, 5)} - ${session.end_time.substring(0, 5)}`,
        'Platform': session.platform,
        'Status': session.session_proof ? 'Completed' : 'Pending'
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 5 },  // No
        { wch: 30 }, // Course Name
        { wch: 15 }, // Date
        { wch: 20 }, // Time
        { wch: 20 }, // Platform
        { wch: 12 }, // Status
      ];
      worksheet['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Sessions');

      // Generate file name
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `mentoring-sessions-filtered-${dateStr}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, fileName);

      toast.success('Filtered sessions exported successfully!');
    } catch (err) {
      console.error('Failed to export filtered sessions:', err);
      toast.error('Failed to export sessions. Please try again.');
    } finally {
      setIsExporting(false);
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

        {/* Export Button - Only show for mentors */}
        {role === 'mentor' && (
          <div className="export-control">
            <button
              onClick={handleExportToExcel}
              disabled={isExporting || sessions.length === 0}
              className="export-button"
            >
              {isExporting ? 'Exporting...' : 'Export to Excel'}
            </button>
            {filteredSessions.length < sessions.length && (
              <button
                onClick={handleExportFilteredToExcel}
                disabled={isExporting || filteredSessions.length === 0}
                className="export-button filtered"
              >
                {isExporting ? 'Exporting...' : 'Export Filtered'}
              </button>
            )}
          </div>
        )}
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