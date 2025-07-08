require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

// Import your route modules
const userRoutes = require('./routes/users');
const semesterRoutes = require('./routes/semesters');
const userRoleRoutes = require('./routes/userRoles');
const pairingRoutes = require('./routes/pairings');
const sessionRoutes = require('./routes/sessions');
const attendanceRoutes = require('./routes/mentoringSessionAttendance');
const activityLogRoutes = require('./routes/userActivityLogs');
// const authRoutes = require('./routes/auth');
// -- other routes

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Test DB connection (runs once when server starts)
pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database!');
        connection.release();
    })
    .catch(err => {
        console.error('Failed to connect to MySQL database:', err);
        process.exit(1);
    });

// Basic Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Nindyamaya Backend API!' });
});

// Use API Routes
app.use('/api/users', userRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/user-roles', userRoleRoutes);
app.use('/api/pairings', pairingRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/activity-logs', activityLogRoutes);
// -- other routes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});