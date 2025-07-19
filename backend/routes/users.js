// ONLY EXAMPLE CODE (change as needed)

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { upload } = require('../controllers/userController');

router.post('/register', userController.createUser);
router.post('/login',userController.login);

router.get('/my-mentees', userController.verifyToken, userController.getMyMentees);

router.get('/profile', userController.verifyToken, userController.getUserProfile);
router.put('/profile/photo', userController.verifyToken, upload.single('profilePhoto'), userController.uploadProfilePhoto);
router.get('/roles', userController.verifyToken, userController.getUserRoles);

router.get('/', userController.getAllUsers);

router.get('/:id', userController.getUserById);

module.exports = router;