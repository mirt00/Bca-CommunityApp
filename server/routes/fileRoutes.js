const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { authenticate, requireApproved } = require('../middlewares/authMiddleware');
const { uploadFile } = require('../config/cloudinary');
const Message = require('../models/Message');

// Multer — store in /tmp before Cloudinary upload
const upload = multer({
  dest: '/tmp/uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
});

/**
 * Smart File Sorter
 * Reads the uploaded file's extension and routes it to the correct
 * Cloudinary folder, setting the fileType accordingly.
 */
function getFileCategory(filename) {
  const ext = path.extname(filename).toLowerCase();
  const docExts = ['.pdf', '.docx', '.doc', '.pptx', '.xlsx'];
  const mediaExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  const resourceExts = ['.zip', '.tar', '.gz', '.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs'];

  if (docExts.includes(ext)) return { folder: 'it-community-app/groups/docs', fileType: 'doc' };
  if (mediaExts.includes(ext)) return { folder: 'it-community-app/groups/media', fileType: 'media' };
  if (resourceExts.includes(ext)) return { folder: 'it-community-app/groups/resources', fileType: 'resource' };

  return null; // unsupported
}

// POST /api/files/upload
router.post(
  '/upload',
  authenticate,
  requireApproved,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { groupId } = req.body;
      if (!groupId) {
        return res.status(400).json({ error: 'groupId is required' });
      }

      const category = getFileCategory(req.file.originalname);
      if (!category) {
        return res.status(415).json({ error: 'Unsupported file type' });
      }

      const result = await uploadFile(req.file.path, {
        folder: category.folder,
        resource_type: category.fileType === 'media' ? 'video' : 'raw',
        use_filename: true,
        unique_filename: true,
      });

      // Persist file reference as a message in the group
      const message = await Message.create({
        groupId,
        senderId: req.user.userId,
        content: req.file.originalname,
        fileUrl: result.secure_url,
        fileType: category.fileType,
      });

      return res.status(201).json({
        message: 'File uploaded successfully',
        fileUrl: result.secure_url,
        fileType: category.fileType,
        messageId: message._id,
      });
    } catch (err) {
      console.error('[fileRoutes.upload]', err);
      return res.status(500).json({ error: 'File upload failed' });
    }
  }
);

// GET /api/files/:groupId
router.get('/:groupId', authenticate, requireApproved, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { fileType } = req.query; // optional filter: doc | media | resource

    const query = { groupId, fileUrl: { $ne: null } };
    if (fileType) query.fileType = fileType;

    const files = await Message.find(query)
      .sort({ createdAt: -1 })
      .populate('senderId', 'fullName nickname profilePicture');

    return res.status(200).json({ files });
  } catch (err) {
    console.error('[fileRoutes.getFiles]', err);
    return res.status(500).json({ error: 'Failed to fetch files' });
  }
});

module.exports = router;
