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
  title?: string;
  location?: string;
  status?: string;
  created_at?: string;
  mentor_name?: string;
  attendance_count?: number;
  attendees?: any[];
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
  mentee_name?: string;
  nim?: string;
  email?: string;
}

interface MentoringTableProps {
  role: 'mentor' | 'mentee';
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'https://nindyamaya-backend.vercel.app/api';

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
      (session.title && session.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
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

  // ================== UPDATED EXPORT FUNCTIONS ==================

  const handleExportToExcel = async () => {
    if (sessions.length === 0) {
      toast.error('No sessions to export.');
      return;
    }

    setIsExporting(true);
    console.log('Starting export process...');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        setIsExporting(false);
        return;
      }

      // Try to fetch data with attendance for export
      let sessionsWithAttendance: Session[] = [];
      
      try {
        // Try the dedicated export endpoint first
        console.log('Trying dedicated export endpoint...');
        const exportResponse = await axios.get(`${API_BASE_URL}/sessions-export/export`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        
        if (exportResponse.data.success && exportResponse.data.sessions) {
          console.log('Export endpoint successful!', exportResponse.data.sessions.length, 'sessions');
          sessionsWithAttendance = exportResponse.data.sessions;
        }
      } catch (exportError: any) {
        console.log('Export endpoint failed, fetching sessions and attendance separately...');
        
        // Fallback: Fetch sessions and attendance separately
        try {
          // Fetch sessions
          const sessionsResponse = await axios.get(`${API_BASE_URL}/sessions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const sessionsData = sessionsResponse.data.sessions || sessionsResponse.data || [];
          
          // Fetch attendance for each session
          const sessionIds = sessionsData.map((session: any) => session.session_id || session.id).filter((id: any) => id);
          
          if (sessionIds.length > 0) {
            // Try bulk attendance endpoint
            try {
              const bulkResponse = await axios.get(`${API_BASE_URL}/sessions-export/bulk-attendance`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { sessionIds: sessionIds.join(',') }
              });
              
              if (bulkResponse.data.success && bulkResponse.data.sessions) {
                // Combine session data with attendance
                sessionsWithAttendance = sessionsData.map((session: any) => {
                  const attendanceData = bulkResponse.data.sessions.find(
                    (s: any) => s.session_id === (session.session_id || session.id)
                  );
                  
                  return {
                    ...session,
                    attendance_count: attendanceData?.attendance_count || 0,
                    attendees: attendanceData?.attendance || []
                  };
                });
              }
            } catch (bulkError) {
              console.log('Bulk attendance failed, will use attendance data from component state');
              // Use the attendance data we already have in state
              sessionsWithAttendance = sessionsData.map((session: any) => {
                const sessionAttendance = getAttendanceForSession(session.session_id || session.id);
                return {
                  ...session,
                  attendance_count: sessionAttendance.length,
                  attendees: sessionAttendance
                };
              });
            }
          }
        } catch (fallbackError: any) {
          console.error('Fallback export failed:', fallbackError);
          // Use the data we already have in state
          sessionsWithAttendance = sessions.map(session => ({
            ...session,
            attendance_count: getAttendanceForSession(session.session_id).length,
            attendees: getAttendanceForSession(session.session_id)
          }));
        }
      }
      
      // Process and export the data
      exportSessionsToExcel(sessionsWithAttendance, 'all');
      
    } catch (error: any) {
      console.error('Error in export process:', error);
      setIsExporting(false);
      toast.error(`Failed to export data: ${error.message || 'Unknown error'}`);
    }
  };

  const exportSessionsToExcel = (sessionsData: Session[], exportType: 'all' | 'filtered') => {
    try {
      console.log(`Processing ${exportType} export data for`, sessionsData.length, 'sessions');
      
      // Prepare data for Excel with only required columns
      const exportData = sessionsData.map((session: Session, index: number) => {
        // Get attendance for this session
        const sessionAttendance = session.attendees || getAttendanceForSession(session.session_id);
        const attendeeCount = sessionAttendance.length;
        
        // Format attendees list
        let attendeesList = 'No attendees';
        if (attendeeCount > 0) {
          attendeesList = sessionAttendance.map((attendee: any) => {
            const name = attendee.mentee_name || attendee.name || `Mentee ID: ${attendee.mentee_user_id}`;
            const nim = attendee.nim || 'No NIM';
            return `${name} (${nim})`;
          }).join(', ');
        }
        
        // Get session proof URL or text
        let sessionProofText = 'No proof uploaded';
        if (session.session_proof) {
          // Extract just the filename from the URL/path
          const proofPath = session.session_proof;
          if (proofPath.includes('/')) {
            sessionProofText = proofPath.split('/').pop() || proofPath;
          } else {
            sessionProofText = proofPath;
          }
        }
        
        return {
          'Session ID': session.session_id,
          'Course Name': session.course_name || session.title || 'No Title',
          'Date': new Date(session.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          'Start Time': session.start_time.substring(0, 5),
          'End Time': session.end_time.substring(0, 5),
          'Platform': session.platform || session.location || 'No Platform',
          'Session Proof': sessionProofText,
          'Attendee Count': attendeeCount,
          'Attendees': attendeesList
        };
      });
      
      console.log('Export data prepared:', exportData);
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const wscols = [
        { wch: 10 },  // Session ID
        { wch: 30 },  // Course Name
        { wch: 15 },  // Date
        { wch: 12 },  // Start Time
        { wch: 12 },  // End Time
        { wch: 20 },  // Platform
        { wch: 40 },  // Session Proof
        { wch: 15 },  // Attendee Count
        { wch: 50 },  // Attendees
      ];
      ws['!cols'] = wscols;
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Mentoring Sessions');
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = exportType === 'all' 
        ? `mentoring_sessions_${timestamp}.xlsx`
        : `mentoring_sessions_filtered_${timestamp}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      console.log('Export completed successfully!');
      setIsExporting(false);
      toast.success(`Exported ${sessionsData.length} sessions successfully!`);
      
    } catch (error: any) {
      console.error('Error processing export data:', error);
      setIsExporting(false);
      toast.error(`Error processing data: ${error.message}`);
    }
  };

  const handleExportFilteredToExcel = async () => {
    if (filteredSessions.length === 0) {
      toast.error('No filtered sessions to export.');
      return;
    }

    setIsExporting(true);
    
    try {
      // Prepare filtered sessions with attendance data
      const filteredSessionsWithAttendance = filteredSessions.map(session => ({
        ...session,
        attendance_count: getAttendanceForSession(session.session_id).length,
        attendees: getAttendanceForSession(session.session_id)
      }));
      
      // Process and export the filtered data
      exportSessionsToExcel(filteredSessionsWithAttendance, 'filtered');
      
    } catch (err: any) {
      console.error('Failed to export filtered sessions:', err);
      setIsExporting(false);
      toast.error(`Failed to export filtered sessions: ${err.message || 'Unknown error'}`);
    }
  };

  // ================== UPDATED DATA FETCHING ==================

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
        let sessionsData: Session[] = [];
        
        try {
          // Try the main sessions endpoint
          const sessionsResponse = await axios.get(`${API_BASE_URL}/sessions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Handle different response formats
          if (Array.isArray(sessionsResponse.data)) {
            sessionsData = sessionsResponse.data;
          } else if (sessionsResponse.data.sessions && Array.isArray(sessionsResponse.data.sessions)) {
            sessionsData = sessionsResponse.data.sessions;
          } else if (sessionsResponse.data.data && Array.isArray(sessionsResponse.data.data)) {
            sessionsData = sessionsResponse.data.data;
          } else {
            sessionsData = [];
          }
          
          console.log('Sessions fetched:', sessionsData.length);
        } catch (sessionsErr: any) {
          console.error('Failed to fetch sessions:', sessionsErr.message);
          setError('Failed to fetch mentoring sessions. Please try again.');
          setLoading(false);
          return;
        }
        
        if (sessionsData.length === 0) {
          console.log('No sessions found');
          setSessions([]);
          setLoading(false);
          return;
        }
        
        // Get all session IDs
        const sessionIds = sessionsData.map((s: Session) => s.session_id);
        console.log('Session IDs:', sessionIds);
        
        // Fetch attendance data
        console.log('Fetching attendance data...');
        let allAttendanceData: AttendanceRecord[] = [];
        
        // Try bulk attendance endpoint first for efficiency
        if (sessionIds.length > 0) {
          try {
            const bulkResponse = await axios.get(`${API_BASE_URL}/sessions-export/bulk-attendance`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { sessionIds: sessionIds.join(',') }
            });
            
            if (bulkResponse.data.success && bulkResponse.data.sessions) {
              // Flatten the attendance data
              bulkResponse.data.sessions.forEach((session: any) => {
                if (session.attendance && Array.isArray(session.attendance)) {
                  session.attendance.forEach((att: any) => {
                    allAttendanceData.push({
                      session_id: session.session_id,
                      mentee_user_id: att.mentee_user_id,
                      check_in_time: att.check_in_time,
                      mentee_name: att.mentee_name,
                      nim: att.nim,
                      email: att.email
                    });
                  });
                }
              });
              console.log('Attendance fetched via bulk endpoint:', allAttendanceData.length);
            }
          } catch (bulkErr) {
            console.log('Bulk attendance endpoint not available or failed');
          }
        }
        
        // If bulk failed or didn't get all data, fetch attendance from regular endpoints
        if (allAttendanceData.length === 0) {
          // For now, we'll set empty attendance and fetch it on-demand when exporting
          console.log('Will fetch attendance data on-demand for export');
          allAttendanceData = [];
        }
        
        // Set sessions data
        setSessions(sessionsData);
        setAllAttendance(allAttendanceData);
        
        // Log summary
        console.log('Data loaded summary:');
        console.log('- Sessions:', sessionsData.length);
        console.log('- Attendance records:', allAttendanceData.length);
        
      } catch (err: any) {
        console.error('Failed to fetch mentoring data:', err);
        setError(`Failed to fetch mentoring sessions: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Function to fetch attendance for a specific session
  const fetchAttendanceForSession = async (sessionId: number): Promise<AttendanceRecord[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];
      
      // Try multiple endpoints
      const endpoints = [
        `${API_BASE_URL}/sessions-export/session/${sessionId}/attendance`,
        `${API_BASE_URL}/attendance/session/${sessionId}`,
        `${API_BASE_URL}/attendance/${sessionId}/details`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          });
          
          let attendanceData: any[] = [];
          if (response.data.attendance && Array.isArray(response.data.attendance)) {
            attendanceData = response.data.attendance;
          } else if (response.data.attendees && Array.isArray(response.data.attendees)) {
            attendanceData = response.data.attendees;
          } else if (Array.isArray(response.data)) {
            attendanceData = response.data;
          }
          
          // Add session_id to each record
          return attendanceData.map((att: any) => ({
            session_id: sessionId,
            mentee_user_id: att.mentee_user_id || att.user_id,
            check_in_time: att.check_in_time || att.created_at,
            mentee_name: att.mentee_name || att.name,
            nim: att.nim,
            email: att.email
          }));
        } catch (error) {
          // Continue to next endpoint
          continue;
        }
      }
    } catch (error) {
      console.error(`Error fetching attendance for session ${sessionId}:`, error);
    }
    
    return [];
  };

  // Function to fetch attendance for multiple sessions
  const fetchAttendanceForSessions = async (sessionIds: number[]): Promise<AttendanceRecord[]> => {
    const allAttendance: AttendanceRecord[] = [];
    
    // Fetch attendance for each session
    for (const sessionId of sessionIds) {
      const attendance = await fetchAttendanceForSession(sessionId);
      allAttendance.push(...attendance);
    }
    
    return allAttendance;
  };

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
              {isExporting ? 'Exporting...' : 'Export All to Excel'}
            </button>
            {filteredSessions.length < sessions.length && filteredSessions.length > 0 && (
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
            // Get attendance count for display
            const attendanceCount = getAttendanceForSession(session.session_id).length;
            const displayCount = attendanceCount || session.attendance_count || 0;
            
            return (
              <tr key={session.session_id}>
                <td className="col-no">{index + 1}</td>
                <td className="col-course">
                  {session.course_name || session.title}
                  {displayCount > 0 && (
                    <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '8px' }}>
                      ({displayCount} attendee{displayCount !== 1 ? 's' : ''})
                    </span>
                  )}
                </td>
                <td className="col-date">{new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                <td className="col-time">{`${session.start_time.substring(0, 5)} - ${session.end_time.substring(0, 5)}`}</td>
                <td className="col-platform">{session.platform || session.location}</td>
                <td className="col-action">
                  <button className="view-button" onClick={() => handleViewDetails(session)}>View Details</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filteredSessions.length === 0 && searchTerm && (
        <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
          No sessions found matching "{searchTerm}"
        </p>
      )}
      
      {filteredSessions.length === 0 && !searchTerm && (
        <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
          No mentoring sessions found
        </p>
      )}
    </div>
  )
}

export default MentoringTable