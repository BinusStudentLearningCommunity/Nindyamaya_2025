const db = require('../config/db');

// Get all mentoring sessions for a mentor
exports.getMentorSessions = async (req, res) => {
    try {
        const mentorId = req.user.id;

        const [rows] = await db.query(
            `SELECT session_id, course_name, platform, session_date AS date, start_time, end_time 
             FROM mentoringsession 
             WHERE mentor_user_id = ? 
             ORDER BY session_date DESC, start_time DESC`,
            [mentorId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No mentoring sessions found for this mentor.' });
        }

        res.status(200).json({
            message: 'Mentoring sessions fetched successfully',
            data: rows
        });

    } catch (error) {
        console.error('Error fetching mentor sessions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new mentoring session
exports.createMentorSession = async (req, res) => {
    try {
        const { course_name, platform, session_date, start_time, end_time } = req.body;
        const mentorId = req.user.id;

        if (!course_name || !platform || !session_date || !start_time || !end_time) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const [result] = await db.query(
            `INSERT INTO mentoringsession (mentor_user_id, course_name, platform, session_date, start_time, end_time) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [mentorId, course_name, platform, session_date, start_time, end_time]
        );

        
        res.status(201).json({
            message: 'Mentoring session created successfully',
            sessionId: result.insertId 
        });
    } catch (error) {
        console.error('Error creating mentoring session:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// UPDATE
// 1. check session exists from mentor id and course name
// 2. update session with new data
// 3. return success message
exports.editMentorSession = async(req, res) => {
    try {
        // asumsi req.body dari edit session form
        const { mentor_user_id, course_name, platform, session_date, start_time, end_time } = req.body;

        // get session id dari mentor id sama course name
        const [session] = await db.query(
            `SELECT * FROM mentoringsession 
             WHERE mentor_user_id = ? AND course_name = ?`,
            [mentor_user_id, course_name]
        );

        if (session.length === 0) {
            return res.status(404).json({ message: 'Mentoring session not found.' });
        }

        const sessionId = session[0].session_id;

        await db.query (
            `UPDATE mentoringsession
            SET course_name = ?, platform = ?, session_date = ?, start_time = ?, end_time = ?
            WHERE session_id = ?`,
            [course_name, platform, session_date, start_time, end_time, sessionId]
        )

        res.status(200).json({ message: 'Mentoring session updated successfully.' });

    } catch (error) {
        console.error('Error updating mentoring session:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// DELETE session 
// 1. check session exists
// 2. delete session
// 3. return success message
exports.deleteMentorSession = async (req, res) => {
    const sessionId = req.params.session_id;

    try {
        
        const [session] = await db.query(
            'SELECT * FROM mentoringsession WHERE session_id = ?',
            [sessionId]
        );

        if (session.length === 0) {
            return res.status(404).json({ message: 'Mentoring session not found.' });
        }

        await db.query(
            'DELETE FROM mentoringsession WHERE session_id = ?',
            [sessionId]
        );

        res.status(200).json({ message: 'Mentoring session deleted successfully.' });

    } catch (error) {
        console.error('Error deleting mentoring session:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};