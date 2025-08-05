// src/controllers/attendanceController.js

const pool = require('../config/db');

/**
 * @desc    Get full details for a session's attendance page.
 * @route   GET /api/attendance/:sessionId/details
 * @access  Private
 */
const getAttendanceDetails = async (req, res) => {
    // This check prevents the server from crashing if the token is invalid.
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User data not found in token.' });
    }

    const { sessionId } = req.params;
    const { userID, role } = req.user;
    let connection;

    try {
        connection = await pool.getConnection();

        const [sessionRows] = await connection.query(
            `SELECT 
                ms.course_name, ms.platform, ms.session_date, ms.start_time, ms.end_time,
                ms.mentor_user_id,
                ms.session_proof,
                u.name as mentor_name, u.nim as mentor_nim, u.profile_picture as mentor_profile_picture
             FROM mentoringsession ms
             JOIN user u ON ms.mentor_user_id = u.user_id
             WHERE ms.session_id = ?`,
            [sessionId]
        );

        if (sessionRows.length === 0) {
            return res.status(404).json({ message: 'Session not found.' });
        }

        const session = sessionRows[0];
        const mentorUserId = session.mentor_user_id;

        const [attendeeRows] = await connection.query(
            `SELECT
                u.user_id, u.name, u.nim, u.profile_picture,
                msa.check_in_time
            FROM pairing p
            JOIN user u ON p.mentee_user_id = u.user_id
            LEFT JOIN mentoringsessionattendance msa ON u.user_id = msa.mentee_user_id AND msa.session_id = ?
            WHERE p.mentor_user_id = ?`,
            [sessionId, mentorUserId]
        );

        const isMentorOfSession = role === 'mentor' && mentorUserId === userID;
        const isMenteeInSession = role === 'mentee' && attendeeRows.some(attendee => attendee.user_id === userID);

        if (!isMentorOfSession && !isMenteeInSession) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to view this session.' });
        }
        
        const responsePayload = {
            course_name: session.course_name,
            platform: session.platform,
            date: session.session_date,
            start_time: session.start_time,
            end_time: session.end_time,
            session_proof: session.session_proof,
            mentor: { name: session.mentor_name, nim: session.mentor_nim, profile_picture: session.mentor_profile_picture },
            attendees: attendeeRows,
        };

        res.status(200).json(responsePayload);

    } catch (error) {
        console.error(`[ERROR] in getAttendanceDetails for sessionId=${sessionId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * @desc    Confirm attendance for a mentee.
 * @route   POST /api/attendance/:sessionId/confirm
 * @access  Private (Mentee only)
 */
const confirmMenteeAttendance = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User data not found in token.' });
    }

    const { sessionId } = req.params;
    const { userID } = req.user;
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [sessionRows] = await connection.query(
           `SELECT session_id, session_proof FROM mentoringsession
            WHERE session_id = ? AND NOW() <= DATE_ADD(TIMESTAMP(session_date, end_time), INTERVAL 3 DAY)`,
            [sessionId]
        );

        if (sessionRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'This session is either not yet complete or has expired.' });
        }
        
        // Also check if the mentor has completed the session
        if (!sessionRows[0].session_proof) {
            await connection.rollback();
            return res.status(400).json({ message: 'Attendance cannot be confirmed until the mentor has completed the session.' });
        }

        const [attendanceRows] = await connection.query(
            'SELECT session_id FROM mentoringsessionattendance WHERE session_id = ? AND mentee_user_id = ?',
            [sessionId, userID]
        );

        if (attendanceRows.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'Attendance already confirmed.' });
        }
        
        await connection.query(
            'INSERT INTO mentoringsessionattendance (session_id, mentee_user_id, check_in_time) VALUES (?, ?, NOW())',
            [sessionId, userID]
        );

        await connection.commit();
        res.status(200).json({ message: 'Attendance confirmed successfully.' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error(`[ERROR] in confirmMenteeAttendance for sessionId=${sessionId} and user_id=${userID}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    getAttendanceDetails,
    confirmMenteeAttendance,
};