// ONLY EXAMPLE CODE (change as needed)

const pool = require('../config/db');
const bcrypt = require('bcrypt'); // lib for hashing password
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer'); // lib to send email for pass recovery
const { v4:uuidv4 } = require('uuid'); // lib for UUID generation
const multer = require('multer');
const path = require('path');
const { promisify } = require('util');

const JWT_SECRET = process.env.JWT_SECRET || 'key';
// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.userID + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 } // 1 MB limit
});

exports.upload = upload;

exports.uploadProfilePhoto = async (req, res) => {
    // The 'upload.single('profilePhoto')' middleware puts the file info in req.file
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = req.file.path;

    try {
        await pool.query(
            'UPDATE User SET profile_picture = ? WHERE user_id = ?',
            [filePath, req.user.userID]
        );

        res.status(200).json({
            message: 'Profile photo updated successfully.',
            filePath: filePath
        });

    } catch (error) {
        console.error('Error updating profile photo:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.login =  async(req,res) =>{
    const {email , password, rememberMe} = req.body;
    if(!email || !password){
        return res.status(400).json({message: 'Email or password required !' });
    }
    try{
        const [rows] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
        if (rows.length === 0){
            return res.status(401).json({message:'Email not found!'});
        }
        const user = rows[0]; 
        const isMatch = await bcrypt.compare(password,user.password);

        if(isMatch){
            const payload = {
                userID:user.user_id,
                email:email,
                name:user.name
            }
            const token = jwt.sign(
                payload,
                JWT_SECRET,
                {expiresIn : rememberMe ? '30d' : '2h'}
            );
            return res.status(200).json({message:'Login successful',
                token,
                user:{
                    id:user.user_id,
                    email:email,
                    name:user.name
                }
            });
        }
        else{
            return res.status(401).json({message:'Password doesnt match!'})
        }
    }
    catch{
        consoler.error(error)
        res.status(500).json({message:'Internal server error'})
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT user_id, name, email, nim, faculty, profile_picture FROM User WHERE user_id = ?', [req.user.userID]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.verifyToken = async (req, res, next) =>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try{
        const decoded = jwt.verify(token,JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
        return res.status(403).json({message: 'Invalid or expired token.'})
    }
};

// exports.sendResetEmail = async(toEmail,token) =>{
    
// };

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT user_id, name, email, nim, faculty FROM User');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT user_id, name, email, nim, faculty FROM User WHERE user_id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(`Error fetching user with ID ${id}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Create a new user
exports.createUser = async (req, res) => {
    const { name, email, nim, faculty, password } = req.body; // Always hash passwords before storing them
    const missingFields = []
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!nim) missingFields.push("nim");
    if (!faculty) missingFields.push("faculty");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
        return res.status(400).json({ 
            message: 'All fields are required.',
            missing: missingFields,
        });
    }

    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const hashedPassword = await bcrypt.hash(password, 10);
        const [userResult] = await connection.query(
            'INSERT INTO User (name, email, nim, faculty, password) VALUES (?, ?, ?, ?, ?)',
            [name, email, nim, faculty, hashedPassword]
        );
        const newUserId = userResult.insertId;
        const [activeSemesters] = await connection.query(
            'SELECT semester_id FROM semester WHERE NOW() BETWEEN start_date AND end_date LIMIT 1'
        );

        // if (activeSemesters.length === 0) {
        //     await connection.rollback();
        //     return res.status(404).json({ message: "Registration failed: No active semester found." });
        // }
        // const activeSemesterId = activeSemesters[0].semester_id;

        // await connection.query(
        //     'INSERT INTO userrole (user_id, semester_id, role) VALUES (?, ?, ?)',
        //     [newUserId, activeSemesterId, 'mentee']
        // );

        await connection.commit();

        res.status(201).json({ message: 'User created successfully and assigned as mentee.', userId: newUserId });

    } catch (error) {
        if (connection) await connection.rollback();

        console.error('Error creating user:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email or NIM already exists.' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
};

exports.getUserRoles = async (req, res) => {
    try {
        const userId = req.user.userID;

        const [roles] = await pool.query(
            `SELECT ur.role, s.start_date, s.end_date
             FROM userrole ur
             JOIN semester s ON ur.semester_id = s.semester_id
             WHERE ur.user_id = ?`,
            [userId]
        );

        let currentRole = 'mentee'; // Default role
        const today = new Date();

        for (const record of roles) {
            const startDate = new Date(record.start_date);
            const endDate = new Date(record.end_date);
            if (today >= startDate && today <= endDate) {
                currentRole = record.role;
                break;
            }
        }

        const allRoles = [...new Set(roles.map(record => record.role))];

        res.json({
            currentRole,
            allRoles
        });

    } catch (error) {
        console.error('Error fetching user roles:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// My Mentee Page
exports.getMyMentees = async (req, res) => {
    const { userID: mentorId } = req.user;

    try {
        const [activeSemesters] = await pool.query(
            `SELECT semester_id FROM semester WHERE NOW() BETWEEN start_date AND end_date LIMIT 1`
        );

        if (activeSemesters.length === 0) {
            return res.status(404).json({ message: "Tidak ada semester yang sedang aktif saat ini." });
        }
        const activeSemesterId = activeSemesters[0].semester_id;

        const [mentees] = await pool.query(
            `SELECT u.user_id, u.name, u.nim, u.email, u.faculty 
             FROM user u
             JOIN pairing p ON u.user_id = p.mentee_user_id
             WHERE p.mentor_user_id = ? AND p.semester_id = ?
             ORDER BY u.name ASC`,
            [mentorId, activeSemesterId]
        );

        res.json(mentees);

    } catch (error) {
        console.error("Error fetching my mentees:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};