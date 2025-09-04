require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

// Import your route modules
const userRoutes = require('./routes/users');
const semesterRoutes = require('./routes/semesters');
const userRoleRoutes = require('./routes/userRoles');
const pairingRoutes = require('./routes/pairings');
const sessionRoutes = require('./routes/sessionRoutes');
const activityLogRoutes = require('./routes/userActivityLogs');
const homeRoutes = require('./routes/home'); 
const attendanceRoutes = require('./routes/attendanceRoutes');
// const authRoutes = require('./routes/auth');
// -- other routes

const app = express();
const PORT = process.env.PORT;

// Middleware
app.options('*', cors(corsOptions));

const allowedOrigins = [
  'https://newnindyamaya.bslc.or.id',
  'https://nindyamaya-2025-frontend.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

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

app.use('/uploads', express.static('uploads'));

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
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/attendance', attendanceRoutes);
// -- other routes

// Error handling middleware for authentication errors
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError' || err.message === 'Unauthorized') {
        return res.status(401).json({ message: 'Unauthorized: Invalid or missing token.' });
    }
    next(err);
});

// General error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
// app.listen(PORT, () => {
//     console.log(`Backend server running on http://localhost:${PORT}`);
// });
module.exports = app;