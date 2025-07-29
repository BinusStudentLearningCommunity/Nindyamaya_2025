const pool = require('../config/db'); // Assuming you have a db config file
const multer = require('multer');
const path = require('path');

// --- Multer Configuration for Session Proofs ---
const sessionProofStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/session_proofs/'); // A dedicated folder for session proofs
  },
  filename: function (req, file, cb) {
    const sessionId = req.params.sessionId;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `session-${sessionId}-proof-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file (e.g., .png, .jpg).'), false);
  }
};

const uploadProof = multer({
  storage: sessionProofStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
}).single('sessionProof'); // The field name from the form-data

// @desc    Create a new mentoring session
// @route   POST /api/sessions
// @access  Private (Mentor only)
const createSession = async (req, res) => {
  const { course, date, startTime, endTime, platform } = req.body;
  const mentorId = req.user.userID;

  // Basic validation
  if (!course || !date || !startTime || !endTime || !platform) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    // 1. Find the active semester
    const [activeSemesters] = await pool.query(
      `SELECT semester_id FROM semester WHERE ? BETWEEN start_date AND end_date LIMIT 1`,
      [new Date()]
    );

    if (activeSemesters.length === 0) {
      return res.status(400).json({ message: 'Cannot create session: No active semester found.' });
    }
    const semesterId = activeSemesters[0].semester_id;

    // 2. Insert the new session into the database
    const [result] = await pool.query(
      `INSERT INTO mentoringsession (mentor_user_id, semester_id, course_name, platform, session_date, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [mentorId, semesterId, course, platform, date, startTime, endTime]
    );
    
    // 3. Send a success response
    res.status(201).json({
      message: 'Mentoring session created successfully!',
      sessionId: result.insertId,
    });

  } catch (error) {
    console.error('Error creating mentoring session:', error);
    res.status(500).json({ message: 'Server error while creating session.' });
  }
};

// @desc    Get all mentoring sessions, ordered by the latest
const getMentoringSessions = async (req, res) => {
  // The 'role' is correctly extracted from the JWT by the auth middleware
  const { userID, role } = req.user;

  try {
    let query;
    let queryParams;

    // Get the active semester ID first
    const [activeSemesters] = await pool.query(
      `SELECT semester_id FROM semester WHERE NOW() BETWEEN start_date AND end_date LIMIT 1`
    );

    if (activeSemesters.length === 0) {
      // If no active semester, no sessions can be shown
      return res.json([]);
    }
    const activeSemesterId = activeSemesters[0].semester_id;

    if (role === 'mentor') {
      // For mentors, fetch sessions they created within the active semester
      query = `
        SELECT ms.session_id, ms.course_name, ms.platform, ms.session_date AS date,
               ms.start_time, ms.end_time, ms.session_proof, u.name AS mentor_name
        FROM mentoringsession ms
        JOIN user u ON ms.mentor_user_id = u.user_id
        WHERE ms.mentor_user_id = ? AND ms.semester_id = ?
        ORDER BY ms.session_date DESC, ms.start_time DESC;
      `;
      queryParams = [userID, activeSemesterId]; // Pass both user ID and semester ID
    } else { // Assumes role is 'mentee'
      // For mentees, fetch the sessions of their paired mentor in the active semester
      query = `
        SELECT ms.session_id, ms.course_name, ms.platform, ms.session_date AS date,
               ms.start_time, ms.end_time, ms.session_proof, u.name AS mentor_name
        FROM mentoringsession ms
        JOIN user u ON ms.mentor_user_id = u.user_id
        JOIN pairing p ON ms.mentor_user_id = p.mentor_user_id
        WHERE p.mentee_user_id = ? AND p.semester_id = ?
        ORDER BY ms.session_date DESC, ms.start_time DESC;
      `;
      queryParams = [userID, activeSemesterId];
    }

    const [sessions] = await pool.query(query, queryParams);
    res.json(sessions);

  } catch (err) {
    console.error('Error fetching mentoring sessions:', err.message);
    res.status(500).send('Server Error');
  }
};

// Find and replace the existing getSessionById function
const getSessionById = async (req, res) => {
  const { sessionId } = req.params;
  const { userID, role } = req.user;

  try {
    // First, get the session's mentor
    const [sessionRows] = await pool.query(
      'SELECT mentor_user_id, session_proof FROM mentoringsession WHERE session_id = ?', 
      [sessionId]
    );

    if (sessionRows.length === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const session = sessionRows[0];

    // --- STRICT AUTHORIZATION CHECK ---
    if (session.session_proof) {
      return res.status(403).json({ message: 'Forbidden: This session has already been completed and cannot be edited.' });
    }
    // Rule 1: Only a mentor can access this endpoint directly.
    if (role !== 'mentor') {
      return res.status(403).json({ message: 'Forbidden: Access is restricted to mentors only.' });
    }
    
    // Rule 2: The mentor must be the one assigned to this session.
    if (session.mentor_user_id !== userID) {
      return res.status(403).json({ message: 'Forbidden: You are not the mentor for this session.' });
    }

    // --- If authorized, fetch all session details ---
    const [fullSessionDetails] = await pool.query('SELECT * FROM mentoringsession WHERE session_id = ?', [sessionId]);
    res.json(fullSessionDetails[0]);

  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteSession = async (req, res) => {
  const { sessionId } = req.params;
  const mentorId = req.user.userID;

  try {
    // First, verify the user is the mentor of this session
    const [sessionRows] = await pool.query(
        'SELECT mentor_user_id FROM mentoringsession WHERE session_id = ?', 
        [sessionId]
    );

    if (sessionRows.length === 0) {
        return res.status(404).json({ message: 'Session not found.' });
    }
    if (sessionRows[0].mentor_user_id !== mentorId) {
        return res.status(403).json({ message: 'Forbidden: You are not the mentor for this session.' });
    }

    // If verification passes, delete the session
    await pool.query('DELETE FROM mentoringsession WHERE session_id = ?', [sessionId]);
    res.status(200).json({ message: 'Session cancelled successfully.' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const completeSession = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Session proof file is required.' });
    }

    const { sessionId } = req.params;
    const mentorId = req.user.userID;
    const filePath = req.file.path.replace(/\\/g, "/"); // Standardize path

    try {
        // Verify user is the mentor and session exists
        const [sessionRows] = await pool.query(
            'SELECT mentor_user_id, session_date, end_time FROM mentoringsession WHERE session_id = ?', 
            [sessionId]
        );

        if (sessionRows.length === 0) {
            return res.status(404).json({ message: 'Session not found.' });
        }

        const session = sessionRows[0];
        if (session.mentor_user_id !== mentorId) {
            return res.status(403).json({ message: 'Forbidden: You are not the mentor for this session.' });
        }

        // Verify the session is in the past before completing
        const sessionEndDateTime = new Date(`${session.session_date.toISOString().split('T')[0]}T${session.end_time}`);
        if (new Date() < sessionEndDateTime) {
            return res.status(400).json({ message: 'Cannot complete a session that has not ended yet.' });
        }

        // Update the session_proof field in the database
        await pool.query(
            'UPDATE mentoringsession SET session_proof = ? WHERE session_id = ?',
            [filePath, sessionId]
        );

        res.status(200).json({ message: 'Session completed successfully!', filePath });

    } catch (error) {
        console.error('Error completing session:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
  getMentoringSessions,
  createSession,
  getSessionById,
  deleteSession,
  uploadProof,
  completeSession,
};