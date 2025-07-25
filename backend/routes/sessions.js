// ONLY EXAMPLE CODE (change as needed)

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
// Implementation of routes for mentoring sessions

// need to protect routes, and verify mentor role
router.get('/mentor-sessions', protect, sessionController.getMentorSessions);
router.post('/mentor-sessions', protect, userController.getUserRoles, sessionController.createMentorSession);
router.put('/mentor-sessions/:id', protect, userController.getUserRoles, sessionController.updateMentorSession);
router.delete('/mentor-sessions/:id', protect, userController.getUserRoles, sessionController.deleteMentorSession);


module.exports = router;