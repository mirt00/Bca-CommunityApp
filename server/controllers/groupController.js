const Message = require('../models/Message');
// TODO: create a Group model if groups need to be persisted in MongoDB
// const Group = require('../models/Group');

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// TODO: install agora-access-token — `npm install agora-access-token`
// const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

/**
 * GET /api/groups
 * Returns a list of available groups.
 * TODO: implement group persistence in MongoDB with a Group model.
 */
async function getGroups(req, res) {
  try {
    // TODO: fetch groups from MongoDB Group collection
    // Placeholder response until Group model is implemented
    return res.status(200).json({ groups: [] });
  } catch (err) {
    console.error('[groupController.getGroups]', err);
    return res.status(500).json({ error: 'Failed to fetch groups' });
  }
}

/**
 * POST /api/groups
 * Creates a new group.
 * Only admin or organization roles can create groups.
 */
async function createGroup(req, res) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // TODO: persist group to MongoDB Group collection
    // const group = await Group.create({ name, description, createdBy: req.user.userId });

    return res.status(201).json({
      message: 'Group created',
      group: { name, description }, // TODO: return persisted group
    });
  } catch (err) {
    console.error('[groupController.createGroup]', err);
    return res.status(500).json({ error: 'Failed to create group' });
  }
}

/**
 * GET /api/groups/:groupId/messages
 * Returns paginated chat history for a group.
 */
async function getGroupMessages(req, res) {
  try {
    const { groupId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ groupId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'fullName nickname profilePicture');

    const total = await Message.countDocuments({ groupId });

    return res.status(200).json({
      messages: messages.reverse(), // chronological order
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[groupController.getGroupMessages]', err);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

/**
 * GET /api/groups/:groupId/agora-token
 * Generates a short-lived Agora RTC token for a video call channel.
 * Channel name is derived from the groupId.
 */
async function getAgoraToken(req, res) {
  try {
    const { groupId } = req.params;
    const uid = req.query.uid ? parseInt(req.query.uid, 10) : 0;

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      return res.status(503).json({ error: 'Agora is not configured on this server' });
    }

    // TODO: uncomment once agora-access-token is installed
    // const expirationTimeInSeconds = 3600; // 1 hour
    // const currentTimestamp = Math.floor(Date.now() / 1000);
    // const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    //
    // const token = RtcTokenBuilder.buildTokenWithUid(
    //   AGORA_APP_ID,
    //   AGORA_APP_CERTIFICATE,
    //   groupId,
    //   uid,
    //   RtcRole.PUBLISHER,
    //   privilegeExpiredTs
    // );
    //
    // return res.status(200).json({ token, channelName: groupId, uid });

    return res.status(501).json({ error: 'Agora token generation not yet implemented' });
  } catch (err) {
    console.error('[groupController.getAgoraToken]', err);
    return res.status(500).json({ error: 'Failed to generate Agora token' });
  }
}

module.exports = { getGroups, createGroup, getGroupMessages, getAgoraToken };
