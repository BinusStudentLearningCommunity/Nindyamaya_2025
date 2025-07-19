const express = require('express');
const router = express.Router();
const { getHomePageData } = require('../controllers/homeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getHomePageData);

module.exports = router;