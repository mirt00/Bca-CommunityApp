const express = require('express');
const router = express.Router();
const multer = require('multer');

const { authenticate, requireApproved } = require('../middlewares/authMiddleware');
const { getProfile, updateProfile, uploadAvatar } = require('../controllers/userController');

// Multer — store uploads in /tmp before Cloudinary upload
const upload = multer({ dest: '/tmp/uploads/' });

// GET /api/users/profile
router.get('/profile', authenticate, requireApproved, getProfile);

// PUT /api/users/profile
router.put('/profile', authenticate, requireApproved, updateProfile);

// POST /api/users/avatar
router.post('/avatar', authenticate, requireApproved, upload.single('avatar'), uploadAvatar);

module.exports = router;
