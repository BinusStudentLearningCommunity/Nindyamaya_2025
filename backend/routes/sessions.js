// ONLY EXAMPLE CODE (change as needed)

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const userController = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
// Implementation of routes for mentoring sessions

console.log('protect:', typeof protect); // should be 'function'
console.log('getUserRoles:', typeof userController.getUserRoles); // should be 'function'
console.log('createMentorSession:', typeof sessionController.createMentorSession); // should be 'function'

// need to protect routes, and verify mentor role
router.get('/sessions/:sessionId', sessionController.getSessionById);
router.get('/mentor-sessions', sessionController.getMentorSessions);
router.post('/create-session', userController.getUserRoles, sessionController.createMentorSession);
router.put('/edit-session', userController.getUserRoles, sessionController.editMentorSession);
router.delete('/delete-session', userController.getUserRoles, sessionController.deleteMentorSession);
router.post('/upload-recording',upload.single('recording'), sessionController.uploadSessionRecording );

module.exports = router;