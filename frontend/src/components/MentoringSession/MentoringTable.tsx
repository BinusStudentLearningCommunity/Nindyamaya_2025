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
const API_BASE_URL = 'https://nindyamaya-backend.vercel.app/api';

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

      // Try the dedicated export endpoint first
      try {
        console.log('Trying dedicated export endpoint...');
        const exportResponse = await axios.get(`${API_BASE_URL}/sessions-export/export`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        
        if (exportResponse.data.success && exportResponse.data.sessions) {
          console.log('Export endpoint successful! Processing data...', exportResponse.data.sessions.length, 'sessions');
          processExportData(exportResponse.data.sessions);
          return;
        }
      } catch (exportError: any) {
        console.log('Export endpoint failed, trying alternative methods:', exportError.message);
        
        // Try the fallback method
        await fetchAllDataForExportFallback();
      }
      
    } catch (error: any) {
      console.error('Error in export process:', error);
      setIsExporting(false);
      toast.error(`Failed to export data: ${error.message || 'Unknown error'}`);
    }
  };

  const fetchAllDataForExportFallback = async () => {
    try {
      console.log('Using fallback export method...');
      const token = localStorage.getItem('token');
      
      // 1. Fetch all sessions
      const sessionsResponse = await axios.get(`${API_BASE_URL}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const sessionsData = sessionsResponse.data.sessions || sessionsResponse.data || [];
      console.log('Sessions fetched:', sessionsData.length);
      
      if (sessionsData.length === 0) {
        toast.error('No sessions found to export.');
        setIsExporting(false);
        return;
      }
      
      // Get all session IDs
      const sessionIds = sessionsData.map((session: any) => session.session_id || session.id).filter((id: any) => id);
      console.log('Session IDs to fetch attendance for:', sessionIds);
      
      // 2. Try bulk attendance endpoint first
      if (sessionIds.length > 0) {
        try {
          console.log('Trying bulk attendance endpoint...');
          const bulkResponse = await axios.get(`${API_BASE_URL}/sessions-export/bulk-attendance`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { sessionIds: sessionIds.join(',') }
          });
          
          if (bulkResponse.data.success && bulkResponse.data.sessions) {
            console.log('Bulk attendance successful!');
            
            // Combine session data with attendance
            const sessionsWithAttendance = sessionsData.map((session: any) => {
              const attendanceData = bulkResponse.data.sessions.find(
                (s: any) => s.session_id === (session.session_id || session.id)
              );
              
              return {
                ...session,
                attendance_count: attendanceData?.attendance_count || 0,
                attendees: attendanceData?.attendance || []
              };
            });
            
            processExportData(sessionsWithAttendance);
            return;
          }
        } catch (bulkError) {
          console.log('Bulk attendance failed, fetching individually...');
        }
      }
      
      // 3. Fallback: Fetch attendance for each session individually
      const sessionsWithAttendance = await Promise.all(
        sessionsData.map(async (session: any) => {
          const sessionId = session.session_id || session.id;
          
          // Try multiple endpoints
          const endpoints = [
            `${API_BASE_URL}/sessions-export/session/${sessionId}/attendance`,
            `${API_BASE_URL}/attendance/session/${sessionId}`,
            `${API_BASE_URL}/attendance/${sessionId}/details`
          ];
          
          for (const endpoint of endpoints) {
            try {
              const attendanceResponse = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000
              });
              
              const attendanceData = attendanceResponse.data.attendance || 
                                    attendanceResponse.data.attendees || 
                                    attendanceResponse.data || 
                                    [];
              
              console.log(`Found ${attendanceData.length} attendees for session ${sessionId} via ${endpoint}`);
              
              return {
                ...session,
                attendance_count: Array.isArray(attendanceData) ? attendanceData.length : 0,
                attendees: Array.isArray(attendanceData) ? attendanceData : []
              };
              
            } catch (error) {
              // Continue to next endpoint
              continue;
            }
          }
          
          // If all endpoints fail
          console.log(`No attendance data found for session ${sessionId}`);
          return {
            ...session,
            attendance_count: 0,
            attendees: []
          };
        })
      );
      
      console.log('Final sessions with attendance:', sessionsWithAttendance.length);
      processExportData(sessionsWithAttendance);
      
    } catch (error: any) {
      console.error('Error in fallback export:', error);
      setIsExporting(false);
      toast.error(`Fallback export failed: ${error.message || 'Unknown error'}`);
    }
  };

  const processExportData = (sessionsData: any[]) => {
    try {
      console.log('Processing export data for', sessionsData.length, 'sessions');
      
      // Prepare data for Excel
      const exportData = sessionsData.map((session: any, index: number) => {
        // Format date
        const sessionDate = session.date_time || session.date;
        const formattedDate = sessionDate ? 
          new Date(sessionDate).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'N/A';
        
        // Format attendees
        let attendeesList = 'No attendees';
        let attendeeCount = 0;
        
        if (session.attendees && session.attendees.length > 0) {
          attendeeCount = session.attendees.length;
          attendeesList = session.attendees.map((attendee: any) => 
            `${attendee.mentee_name || attendee.name || 'Unknown'} (${attendee.nim || 'No NIM'})`
          ).join(', ');
        } else if (session.attendance_count > 0) {
          attendeeCount = session.attendance_count;
          attendeesList = `${session.attendance_count} attendees (details not available)`;
        }
        
        return {
          'No': index + 1,
          'Session ID': session.session_id || session.id || 'N/A',
          'Title': session.title || session.course_name || 'No Title',
          'Description': session.description || 'No Description',
          'Date & Time': formattedDate,
          'Location': session.location || session.platform || 'No Location',
          'Status': session.status || 'Unknown',
          'Mentor': session.mentor_name || 'Unknown Mentor',
          'Total Attendees': attendeeCount,
          'Attendee List': attendeesList,
          'Created At': session.created_at ? 
            new Date(session.created_at).toLocaleDateString('id-ID') : 'N/A'
        };
      });
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const wscols = [
        { wch: 5 },   // No
        { wch: 10 },  // Session ID
        { wch: 30 },  // Title
        { wch: 40 },  // Description
        { wch: 30 },  // Date & Time
        { wch: 20 },  // Location
        { wch: 15 },  // Status
        { wch: 25 },  // Mentor
        { wch: 15 },  // Total Attendees
        { wch: 50 },  // Attendee List
        { wch: 15 },  // Created At
      ];
      ws['!cols'] = wscols;
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Mentoring Sessions');
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `mentoring_sessions_export_${timestamp}.xlsx`;
      
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
      // Use the filtered sessions we already have
      const sessionsToExport = filteredSessions;
      
      // Get detailed attendance for each filtered session
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        setIsExporting(false);
        return;
      }
      
      const sessionsWithAttendance = await Promise.all(
        sessionsToExport.map(async (session) => {
          const sessionId = session.session_id;
          
          // Try to get attendance for this session
          try {
            // Try multiple endpoints
            const endpoints = [
              `${API_BASE_URL}/sessions-export/session/${sessionId}/attendance`,
              `${API_BASE_URL}/attendance/session/${sessionId}`,
            ];
            
            for (const endpoint of endpoints) {
              try {
                const attendanceResponse = await axios.get(endpoint, {
                  headers: { Authorization: `Bearer ${token}` },
                  timeout: 5000
                });
                
                const attendanceData = attendanceResponse.data.attendance || 
                                      attendanceResponse.data.attendees || 
                                      [];
                
                return {
                  ...session,
                  attendees: Array.isArray(attendanceData) ? attendanceData : [],
                  attendance_count: Array.isArray(attendanceData) ? attendanceData.length : 0
                };
                
              } catch (error) {
                // Continue to next endpoint
                continue;
              }
            }
          } catch (error) {
            console.log(`No attendance data found for session ${sessionId}`);
          }
          
          return {
            ...session,
            attendees: [],
            attendance_count: 0
          };
        })
      );
      
      // Process the filtered data for export
      const exportData = sessionsWithAttendance.map((session: any, index: number) => {
        // Format date
        const sessionDate = new Date(session.date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        
        // Format time
        const timeRange = `${session.start_time.substring(0, 5)} - ${session.end_time.substring(0, 5)}`;
        
        // Format attendees
        let attendeesList = 'No attendees';
        if (session.attendees && session.attendees.length > 0) {
          attendeesList = session.attendees.map((attendee: any) => 
            `${attendee.mentee_name || attendee.name || 'Unknown'} (${attendee.nim || 'No NIM'})`
          ).join(', ');
        }
        
        return {
          'No': index + 1,
          'Course Name': session.course_name || session.title || 'No Title',
          'Date': sessionDate,
          'Time': timeRange,
          'Platform': session.platform || session.location || 'No Location',
          'Session Proof': session.session_proof ? 'Uploaded' : 'No proof uploaded',
          'Attendee Count': session.attendance_count || 0,
          'Attendees': attendeesList
        };
      });
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const colWidths = [
        { wch: 5 },   // No
        { wch: 30 },  // Course Name
        { wch: 15 },  // Date
        { wch: 20 },  // Time
        { wch: 20 },  // Platform
        { wch: 15 },  // Session Proof
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
      toast.error('Failed to export filtered sessions. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // ================== UPDATED DATA FETCHING ==================

  // Test the endpoints (optional - for debugging)
  const testExportEndpoints = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      console.log('Testing export endpoints...');
      
      const endpoints = [
        `${API_BASE_URL}/sessions-export/export`,
        `${API_BASE_URL}/sessions-export/bulk-attendance`,
        `${API_BASE_URL}/attendance/all/records`,
        `${API_BASE_URL}/health`,
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          });
          console.log(`✅ ${endpoint}: ${response.status}`, response.data?.message || 'OK');
        } catch (error: any) {
          console.log(`❌ ${endpoint}: ${error.response?.status || 'Network error'} - ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Error testing endpoints:', error);
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
        
        // Fetch sessions - try both endpoints
        console.log('Fetching sessions...');
        let sessionsData: Session[] = [];
        
        try {
          // First try the main sessions endpoint
          const sessionsResponse = await axios.get(`${API_BASE_URL}/sessions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          sessionsData = Array.isArray(sessionsResponse.data) ? 
            sessionsResponse.data : 
            sessionsResponse.data.sessions || [];
          console.log('Sessions fetched:', sessionsData.length);
        } catch (sessionsErr) {
          console.log('Main sessions endpoint failed, trying export endpoint...');
          try {
            const exportResponse = await axios.get(`${API_BASE_URL}/sessions-export/export`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (exportResponse.data.success) {
              sessionsData = exportResponse.data.sessions || [];
              console.log('Sessions fetched from export endpoint:', sessionsData.length);
            }
          } catch (exportErr) {
            console.log('Both endpoints failed for sessions');
          }
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
        
        // Try bulk attendance endpoint first
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
            console.log('Bulk attendance failed, trying individual sessions...');
          }
        }
        
        // If bulk failed or didn't get all data, try individual endpoints
        if (allAttendanceData.length === 0) {
          const attendancePromises = sessionIds.map(async (sessionId: number) => {
            try {
              // Try the export attendance endpoint first
              const response = await axios.get(`${API_BASE_URL}/sessions-export/session/${sessionId}/attendance`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 3000
              });
              
              if (response.data.success && response.data.attendance) {
                return response.data.attendance.map((att: any) => ({
                  ...att,
                  session_id: sessionId
                }));
              }
            } catch (err1) {
              try {
                // Try the regular attendance endpoint
                const response2 = await axios.get(`${API_BASE_URL}/attendance/session/${sessionId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                  timeout: 3000
                });
                
                if (response2.data.success && response2.data.attendance) {
                  return response2.data.attendance.map((att: any) => ({
                    ...att,
                    session_id: sessionId
                  }));
                }
              } catch (err2) {
                // No attendance for this session
                return [];
              }
            }
            return [];
          });
          
          const attendanceResults = await Promise.all(attendancePromises);
          allAttendanceData = attendanceResults.flat();
          console.log('Attendance fetched individually:', allAttendanceData.length);
        }
        
        // Fetch users (optional - for display purposes)
        console.log('Fetching users...');
        let usersData: User[] = [];
        try {
          // Try to get all users (or just mentees)
          const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          usersData = Array.isArray(usersResponse.data) ? 
            usersResponse.data : 
            usersResponse.data.users || [];
          console.log('Users fetched:', usersData.length);
        } catch (usersErr) {
          console.log('Cannot fetch all users, will extract from attendance...');
          // Extract user info from attendance data if available
          const uniqueUsers = new Map();
          allAttendanceData.forEach(att => {
            if (att.mentee_name && att.nim) {
              uniqueUsers.set(att.mentee_user_id, {
                user_id: att.mentee_user_id,
                name: att.mentee_name,
                nim: att.nim,
                email: att.email || '',
                faculty: ''
              });
            }
          });
          usersData = Array.from(uniqueUsers.values());
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
        
        // For debugging - show which sessions have attendance
        if (allAttendanceData.length === 0) {
          console.warn('No attendance data found.');
        } else {
          const sessionAttendanceCounts: Record<number, number> = {};
          allAttendanceData.forEach(att => {
            sessionAttendanceCounts[att.session_id] = (sessionAttendanceCounts[att.session_id] || 0) + 1;
          });
          console.log('Attendance by session:', sessionAttendanceCounts);
        }
        
      } catch (err: any) {
        console.error('Failed to fetch mentoring data:', err);
        setError(`Failed to fetch mentoring sessions: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    
    // Uncomment for debugging endpoint availability
    // testExportEndpoints();
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