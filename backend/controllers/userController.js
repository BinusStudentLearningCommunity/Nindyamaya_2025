// ONLY EXAMPLE CODE (change as needed)

const pool = require('../config/db');

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
    const { name, email, nim, faculty, password_hash } = req.body; // Always hash passwords before storing them
    if (!name || !email || !nim || !faculty || !password_hash) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO User (name, email, nim, faculty, password_hash) VALUES (?, ?, ?, ?, ?)',
            [name, email, nim, faculty, password_hash]
        );
        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error);
        // Handle specific errors like duplicate email if needed
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email or NIM already exists.' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update an existing user
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, nim, faculty } = req.body; 
    try {
        const [result] = await pool.query(
            'UPDATE User SET name = ?, email = ?, nim = ?, faculty = ? WHERE user_id = ?',
            [name, email, nim, faculty, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or no changes made.' });
        }
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(`Error updating user with ID ${id}:`, error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email or NIM already exists.' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM User WHERE user_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(`Error deleting user with ID ${id}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};