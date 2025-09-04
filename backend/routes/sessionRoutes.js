const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

// GET all sessions
router.get('/', protect, sessionController.getMentoringSessions);

// POST a new session
router.post('/', protect, sessionController.createSession);

// GET a single session by ID
router.get('/:sessionId', protect, sessionController.getSessionById);

// DELETE a session by ID (Cancel)
router.delete('/:sessionId', protect, sessionController.deleteSession);

// PUT (upload) session proof for a session
router.post(
  '/:sessionId/complete', 
  protect, 
  sessionController.uploadProof.single('sessionProof'), // Multer middleware runs first
  sessionController.completeSession // Then our new controller function
);

module.exports = router;