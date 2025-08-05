// src/routes/attendanceRoutes.js

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// GET full details for a specific session's attendance page
router.get('/:sessionId/details', protect, attendanceController.getAttendanceDetails);

// POST for a mentee to confirm their attendance
router.post('/:sessionId/confirm', protect, attendanceController.confirmMenteeAttendance);

module.exports = router;