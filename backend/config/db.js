// NOTE: For development, change the database connection settings as needed. Here, I am simply using XAMPP (MySQL).

const mysql = require('mysql2/promise');

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nindyamaya',
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0       
});

module.exports = pool;