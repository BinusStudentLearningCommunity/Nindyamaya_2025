const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect } = require('../middleware/authMiddleware');

// Get attendance for a specific session (for export)
router.get('/session/:sessionId/attendance', protect, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    
    // First, check if session exists
    const sessionCheck = await db.execute(
      'SELECT * FROM mentoringsession WHERE session_id = ?',
      [sessionId]
    );
    
    if (sessionCheck[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // SQL query to get attendance with mentee names
    const query = `
      SELECT 
        msa.session_id,
        msa.mentee_user_id,
        msa.check_in_time,
        u.name as mentee_name,
        u.nim,
        u.email
      FROM mentoringsessionattendance msa
      INNER JOIN user u ON msa.mentee_user_id = u.user_id
      WHERE msa.session_id = ?
      ORDER BY msa.check_in_time ASC
    `;
    
    const [attendance] = await db.execute(query, [sessionId]);
    
    res.json({
      success: true,
      count: attendance.length,
      attendance: attendance
    });
    
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance data'
    });
  }
});

// Export sessions to Excel
router.get('/export', protect, async (req, res) => {
  try {
    // Get all sessions with attendance counts and mentor info
    const sessionsQuery = `
      SELECT 
        ms.session_id,
        ms.title,
        ms.description,
        ms.date_time,
        ms.location,
        ms.status,
        ms.created_at,
        ms.updated_at,
        m.name as mentor_name,
        m.email as mentor_email,
        COUNT(msa.attendance_id) as attendance_count
      FROM mentoringsession ms
      LEFT JOIN user m ON ms.mentor_user_id = m.user_id
      LEFT JOIN mentoringsessionattendance msa ON ms.session_id = msa.session_id
      GROUP BY ms.session_id
      ORDER BY ms.date_time DESC
    `;
    
    const [sessions] = await db.execute(sessionsQuery);
    
    // For each session, get detailed attendance
    const sessionsWithDetails = await Promise.all(
      sessions.map(async (session) => {
        const attendanceQuery = `
          SELECT 
            u.name as mentee_name,
            u.nim,
            u.email,
            msa.check_in_time
          FROM mentoringsessionattendance msa
          INNER JOIN user u ON msa.mentee_user_id = u.user_id
          WHERE msa.session_id = ?
          ORDER BY msa.check_in_time ASC
        `;
        
        const [attendance] = await db.execute(attendanceQuery, [session.session_id]);
        
        return {
          ...session,
          attendees: attendance.map(attendee => ({
            name: attendee.mentee_name,
            nim: attendee.nim,
            email: attendee.email,
            checkInTime: attendee.check_in_time
          }))
        };
      })
    );
    
    res.json({
      success: true,
      count: sessionsWithDetails.length,
      sessions: sessionsWithDetails
    });
    
  } catch (error) {
    console.error('Error exporting sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export sessions data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Bulk attendance endpoint (for multiple sessions at once)
router.get('/bulk-attendance', protect, async (req, res) => {
  try {
    const { sessionIds } = req.query;
    
    if (!sessionIds) {
      return res.status(400).json({
        success: false,
        message: 'sessionIds query parameter is required. Example: ?sessionIds=1,2,3'
      });
    }
    
    const ids = sessionIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid session IDs provided'
      });
    }
    
    // Get attendance for all requested sessions
    const query = `
      SELECT 
        msa.session_id,
        msa.mentee_user_id,
        msa.check_in_time,
        u.name as mentee_name,
        u.nim,
        u.email,
        ms.title as session_title,
        ms.date_time as session_date,
        ms.location as session_location
      FROM mentoringsessionattendance msa
      INNER JOIN user u ON msa.mentee_user_id = u.user_id
      INNER JOIN mentoringsession ms ON msa.session_id = ms.session_id
      WHERE msa.session_id IN (?)
      ORDER BY msa.session_id, msa.check_in_time ASC
    `;
    
    const [attendance] = await db.execute(query, [ids]);
    
    // Group attendance by session
    const attendanceBySession = {};
    attendance.forEach(record => {
      const sessionId = record.session_id;
      if (!attendanceBySession[sessionId]) {
        attendanceBySession[sessionId] = {
          session_id: sessionId,
          session_title: record.session_title,
          session_date: record.session_date,
          session_location: record.session_location,
          attendance_count: 0,
          attendance: []
        };
      }
      attendanceBySession[sessionId].attendance.push({
        mentee_user_id: record.mentee_user_id,
        mentee_name: record.mentee_name,
        nim: record.nim,
        email: record.email,
        check_in_time: record.check_in_time
      });
      attendanceBySession[sessionId].attendance_count++;
    });
    
    res.json({
      success: true,
      count: attendance.length,
      sessions: Object.values(attendanceBySession)
    });
    
  } catch (error) {
    console.error('Error fetching bulk attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bulk attendance data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;