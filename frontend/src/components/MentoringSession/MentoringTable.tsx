/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  mentor_user_id?: number;
  semester_id?: number;
}

interface User {
  user_id: number;
  name: string;
  email: string;
  nim: string;
  faculty: string;
}

interface AttendanceRecord {
  session_id: number;
  mentee_user_id: number;
  check_in_time: string;
}

interface MentoringTableProps {
  role: 'mentor' | 'mentee';
}

const MentoringTable: React.FC<MentoringTableProps> = ({ role }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
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

  // Get attendance for a specific session
  const getAttendanceForSession = (sessionId: number) => {
    return allAttendance.filter(att => att.session_id === sessionId);
  };

  // Get user name by ID
  const getUserNameById = (userId: number) => {
    const user = allUsers.find(u => u.user_id === userId);
    return user ? `${user.name} (${user.nim})` : `Mentee ID: ${userId}`;
  };

  const handleExportToExcel = () => {
    if (sessions.length === 0) {
      toast.error('No sessions to export.');
      return;
    }

    setIsExporting(true);
    try {
      // Format data for Excel by joining sessions, attendance, and users
      const excelData = sessions.map(session => {
        // Get all attendance records for this session
        const sessionAttendance = getAttendanceForSession(session.session_id);
        
        // Get attendee names
        const attendees = sessionAttendance
          .map(att => getUserNameById(att.mentee_user_id))
          .join(', ');
          
        const attendeeCount = sessionAttendance.length;

        return {
          'Session ID': session.session_id,
          'Course Name': session.course_name,
          'Date': new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          'Start Time': session.start_time.substring(0, 5),
          'End Time': session.end_time.substring(0, 5),
          'Platform': session.platform,
          'Session Proof': session.session_proof || 'No proof uploaded',
          'Attendee Count': attendeeCount,
          'Attendees': attendees || 'No attendees'
        };
      });

      console.log('Excel data prepared:', excelData);

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
        { wch: 40 }, // Session Proof
        { wch: 15 }, // Attendee Count
        { wch: 50 }, // Attendees
      ];
      worksheet['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Mentoring Sessions');

      // Generate file name with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `mentoring-sessions-${dateStr}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, fileName);

      toast.success(`Sessions exported successfully! (${sessions.length} sessions)`);
      
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
      const excelData = filteredSessions.map((session, index) => {
        // Get all attendance records for this session
        const sessionAttendance = getAttendanceForSession(session.session_id);
        
        // Get attendee names
        const attendees = sessionAttendance
          .map(att => getUserNameById(att.mentee_user_id))
          .join(', ');
          
        const attendeeCount = sessionAttendance.length;

        return {
          'No': index + 1,
          'Course Name': session.course_name,
          'Date': new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          'Time': `${session.start_time.substring(0, 5)} - ${session.end_time.substring(0, 5)}`,
          'Platform': session.platform,
          'Session Proof': session.session_proof || 'No proof uploaded',
          'Attendee Count': attendeeCount,
          'Attendees': attendees || 'No attendees'
        };
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 5 },   // No
        { wch: 30 },  // Course Name
        { wch: 15 },  // Date
        { wch: 20 },  // Time
        { wch: 20 },  // Platform
        { wch: 40 },  // Session Proof
        { wch: 15 },  // Attendee Count
        { wch: 50 },  // Attendees
      ];
      worksheet['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Sessions');

      // Generate file name
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `mentoring-sessions-filtered-${dateStr}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, fileName);

      toast.success(`Filtered sessions exported successfully! (${filteredSessions.length} sessions)`);
    } catch (err) {
      console.error('Failed to export filtered sessions:', err);
      toast.error('Failed to export sessions. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }

        console.log('Fetching all data...');
        
        // Fetch sessions
        console.log('Fetching sessions...');
        const sessionsResponse = await axios.get('/api/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sessionsData = sessionsResponse.data;
        console.log('Sessions fetched:', sessionsData.length);
        
        // Get all session IDs
        const sessionIds = sessionsData.map((s: Session) => s.session_id);
        console.log('Session IDs:', sessionIds);
        
        // Fetch all attendance records
        console.log('Fetching all attendance records...');
        let allAttendanceData: AttendanceRecord[] = [];
        
        // Try to fetch all attendance in one go if you have an endpoint for it
        try {
          // If you have an endpoint to get all attendance
          const attendanceResponse = await axios.get('/api/attendance/all', {
            headers: { Authorization: `Bearer ${token}` },
          });
          allAttendanceData = attendanceResponse.data;
          console.log('All attendance fetched:', allAttendanceData.length);
        } catch (attendanceErr) {
          console.log('No bulk attendance endpoint, fetching individually...');
          
          // Fetch attendance for each session individually
          const attendancePromises = sessionIds.map(async (sessionId: number) => {
            try {
              // Try different endpoints
              let attendanceEndpoint = `/api/sessions/${sessionId}/attendance`;
              
              // Try the attendance endpoint first
              try {
                const response = await axios.get(attendanceEndpoint, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                
                // Handle different response structures
                let attendanceRecords: any[] = [];
                if (response.data.attendance && Array.isArray(response.data.attendance)) {
                  attendanceRecords = response.data.attendance;
                } else if (Array.isArray(response.data)) {
                  attendanceRecords = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                  attendanceRecords = response.data.data;
                }
                
                // Add session_id to each record if not present
                return attendanceRecords.map((record: any) => ({
                  ...record,
                  session_id: record.session_id || sessionId
                }));
              } catch (err) {
                // Try alternative endpoint
                try {
                  const altResponse = await axios.get(`/api/attendance/session/${sessionId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  
                  let attendanceRecords: any[] = [];
                  if (altResponse.data.attendance && Array.isArray(altResponse.data.attendance)) {
                    attendanceRecords = altResponse.data.attendance;
                  } else if (Array.isArray(altResponse.data)) {
                    attendanceRecords = altResponse.data;
                  }
                  
                  return attendanceRecords.map((record: any) => ({
                    ...record,
                    session_id: record.session_id || sessionId
                  }));
                } catch (altErr) {
                  console.log(`No attendance data found for session ${sessionId}`);
                  return [];
                }
              }
            } catch (err) {
              console.error(`Error fetching attendance for session ${sessionId}:`, err);
              return [];
            }
          });
          
          const attendanceResults = await Promise.all(attendancePromises);
          allAttendanceData = attendanceResults.flat();
          console.log('Attendance data collected:', allAttendanceData.length, 'records');
        }
        
        // Fetch all users (or at least mentees)
        console.log('Fetching users...');
        let usersData: User[] = [];
        try {
          // Try to get all users
          const usersResponse = await axios.get('/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          usersData = usersResponse.data;
          console.log('Users fetched:', usersData.length);
        } catch (usersErr) {
          console.log('Cannot fetch all users, will try to get mentee users from attendance...');
          
          // Get unique mentee IDs from attendance
          const menteeIds = [...new Set(allAttendanceData.map(att => att.mentee_user_id))];
          console.log('Unique mentee IDs from attendance:', menteeIds);
          
          if (menteeIds.length > 0) {
            // Try to fetch these specific users
            const userPromises = menteeIds.map(async (userId: number) => {
              try {
                const userResponse = await axios.get(`/api/users/${userId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                return userResponse.data;
              } catch (err) {
                console.log(`Cannot fetch user ${userId}`);
                return null;
              }
            });
            
            const userResults = await Promise.all(userPromises);
            usersData = userResults.filter(Boolean) as User[];
            console.log('Mentee users fetched:', usersData.length);
          }
        }
        
        // Set all data
        setSessions(sessionsData);
        setAllAttendance(allAttendanceData);
        setAllUsers(usersData);
        
        // Log summary
        console.log('Data loaded summary:');
        console.log('- Sessions:', sessionsData.length);
        console.log('- Attendance records:', allAttendanceData.length);
        console.log('- Users:', usersData.length);
        
        // Show warning if no attendance data
        if (allAttendanceData.length === 0) {
          console.warn('No attendance data found. The export will show "No attendees" for all sessions.');
        }
        
      } catch (err) {
        console.error('Failed to fetch mentoring data:', err);
        setError('Failed to fetch mentoring sessions.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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
          {filteredSessions.map((session, index) => {
            // Get attendance count for display (optional)
            const attendanceCount = getAttendanceForSession(session.session_id).length;
            
            return (
              <tr key={session.session_id}>
                <td className="col-no">{index + 1}</td>
                <td className="col-course">
                  {session.course_name}
                  {attendanceCount > 0 && (
                    <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '8px' }}>
                      ({attendanceCount} attendees)
                    </span>
                  )}
                </td>
                <td className="col-date">{new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                <td className="col-time">{`${session.start_time.substring(0, 5)} - ${session.end_time.substring(0, 5)}`}</td>
                <td className="col-platform">{session.platform}</td>
                <td className="col-action">
                  <button className="view-button" onClick={() => handleViewDetails(session)}>View Details</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  )
}

export default MentoringTable