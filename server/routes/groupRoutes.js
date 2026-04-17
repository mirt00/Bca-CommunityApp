const express = require('express');
const router = express.Router();

const { authenticate, requireApproved } = require('../middlewares/authMiddleware');
const {
  getGroups,
  createGroup,
  getGroupMessages,
  getAgoraToken,
} = require('../controllers/groupController');

// All group routes require authentication and approval
router.use(authenticate, requireApproved);

// GET /api/groups
router.get('/', getGroups);

// POST /api/groups
router.post('/', createGroup);

// GET /api/groups/:groupId/messages
router.get('/:groupId/messages', getGroupMessages);

// GET /api/groups/:groupId/agora-token
router.get('/:groupId/agora-token', getAgoraToken);

module.exports = router;
