const express = require('express');
const router = express.Router();

const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const { encryptToken } = require('../config/paseto');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/pending-students
// Returns all users with isApproved: false
router.get('/pending-students', async (req, res) => {
  try {
    const pending = await User.find({ isApproved: false, role: 'student' })
      .select('fullName email batch faculty linkedin github createdAt')
      .sort({ createdAt: 1 });

    return res.status(200).json({ students: pending });
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

    // Issue a fresh token reflecting the new approval state
    const newToken = await encryptToken({
      userId: user._id.toString(),
      role: user.role,
      isApproved: true,
    });

    // TODO: send approval email with newToken or login prompt
    // await sendApprovalEmail(user.email, newToken);

    return res.status(200).json({
      message: `${user.fullName} has been approved`,
      userId: user._id,
      newToken, // TODO: deliver via email instead of response body
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

    // TODO: optionally send rejection email

    return res.status(200).json({ message: `${user.fullName}'s registration has been rejected` });
  } catch (err) {
    console.error('[adminRoutes.reject]', err);
    return res.status(500).json({ error: 'Rejection failed' });
  }
});

module.exports = router;
