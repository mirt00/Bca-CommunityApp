const express = require('express');
const router = express.Router();

const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const { encryptToken } = require('../config/paseto');
const { sendApprovalEmail, sendNewStudentNotification } = require('../services/emailService');
const argon2 = require('argon2');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/pending-students
// Returns all users with isApproved: false
router.get('/pending-students', async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false, role: 'student' })
      .select('_id email role createdAt')
      .sort({ createdAt: 1 });

    // Get profiles for these users
    const userIds = pendingUsers.map(user => user._id);
    const profiles = await UserProfile.find({ userId: { $in: userIds } })
      .select('userId fullName batch faculty linkedin github');

    // Combine user and profile data
    const students = pendingUsers.map(user => {
      const profile = profiles.find(p => p.userId.toString() === user._id.toString());
      return {
        _id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        ...(profile ? profile.toObject() : {}),
      };
    });

    return res.status(200).json({ students });
  } catch (err) {
    console.error('[adminRoutes.pendingStudents]', err);
    return res.status(500).json({ error: 'Failed to fetch pending students' });
  }
});

// POST /api/admin/:id/approve
// Approves a student account and issues a fresh PASETO token
router.post('/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isApproved: true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user profile for email
    const profile = await UserProfile.findOne({ userId: user._id });

    // Issue a fresh token reflecting the new approval state
    const newToken = await encryptToken({
      userId: user._id.toString(),
      role: user.role,
      isApproved: true,
    });

    if (profile) {
      await sendApprovalEmail(user.email, newToken);
    }

return res.status(200).json({
      message: `${profile?.fullName || 'User'} has been approved`,
      userId: user._id,
    });
  } catch (err) {
    console.error('[adminRoutes.approve]', err);
    return res.status(500).json({ error: 'Approval failed' });
  }
});

// POST /api/admin/:id/reject
// Rejects (deletes) a pending student account
router.post('/:id/reject', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Also delete the user profile
    await UserProfile.findOneAndDelete({ userId: user._id });

    // TODO: optionally send rejection email

    return res.status(200).json({ message: `User registration has been rejected` });
  } catch (err) {
    console.error('[adminRoutes.reject]', err);
    return res.status(500).json({ error: 'Rejection failed' });
  }
});

// POST /api/admin/create-admin
// Creates a new admin user (only existing admins can create new admins)
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, fullName, organizationId } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Check for existing account
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Validate organizationId if provided
    if (organizationId) {
      const org = await require('../models/Organization').findById(organizationId);
      if (!org) {
        return res.status(400).json({ error: 'Invalid organization selected' });
      }
    }

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    // Create admin user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      isApproved: true,
      role: 'admin',
    });

    // Create admin profile
    await UserProfile.create({
      userId: user._id,
      fullName,
      organizationId: organizationId || null,
    });

    return res.status(201).json({
      message: 'Admin account created successfully',
      userId: user._id,
    });
  } catch (err) {
    console.error('[adminRoutes.createAdmin]', err);
    return res.status(500).json({ error: 'Admin creation failed' });
  }
});

module.exports = router;
