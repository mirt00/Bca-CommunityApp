const express = require('express');
const router = express.Router();

const { authLimiter } = require('../middlewares/rateLimiter');
const { validate } = require('../middlewares/validator');
const {
  register,
  login,
  resetPasswordRequest,
  resetPassword,
  googleCallback,
  linkedinCallback,
  githubCallback,
} = require('../controllers/authController');

// Load shared schema for validation
const userSchema = require('../../shared/schemas/user.schema.json');

// POST /api/auth/register
router.post('/register', authLimiter, validate(userSchema), register);

// POST /api/auth/login
router.post('/login', authLimiter, login);

// POST /api/auth/reset-password/request
router.post('/reset-password/request', authLimiter, resetPasswordRequest);

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, resetPassword);

// OAuth callbacks — TODO: configure passport.js or similar OAuth middleware
router.get('/oauth/google/callback', googleCallback);
router.get('/oauth/linkedin/callback', linkedinCallback);
router.get('/oauth/github/callback', githubCallback);

module.exports = router;
