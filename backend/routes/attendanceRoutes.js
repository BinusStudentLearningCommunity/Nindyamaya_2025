const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// GET full details for a specific session's attendance page
router.get('/:sessionId/details', protect, attendanceController.getAttendanceDetails);

// POST for a mentee to confirm their attendance
router.post('/:sessionId/confirm', protect, attendanceController.confirmMenteeAttendance);

// Get attendance for a specific session (alternative endpoint)
router.get('/session/:sessionId', protect, async (req, res) => {
  try {
    const db = require('../config/database');
    const sessionId = req.params.sessionId;
    
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

// Get all attendance records (bulk endpoint for export)
router.get('/all/records', protect, async (req, res) => {
  try {
    const db = require('../config/database');
    
    const query = `
      SELECT 
        msa.*,
        u.name as mentee_name,
        u.nim,
        u.email,
        ms.title as session_title,
        ms.date_time as session_date,
        ms.location as session_location
      FROM mentoringsessionattendance msa
      INNER JOIN user u ON msa.mentee_user_id = u.user_id
      INNER JOIN mentoringsession ms ON msa.session_id = ms.session_id
      ORDER BY ms.date_time DESC, msa.check_in_time ASC
    `;
    
    const [attendance] = await db.execute(query);
    
    res.json({
      success: true,
      count: attendance.length,
      attendance: attendance
    });
    
  } catch (error) {
    console.error('Error fetching all attendance records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all attendance records'
    });
  }
});

module.exports = router;