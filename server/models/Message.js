const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    groupId: {
      type: String,
      required: [true, 'Group ID is required'],
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    fileUrl: {
      type: String, // Cloudinary URL (optional attachment)
      default: null,
    },
    fileType: {
      type: String,
      enum: ['doc', 'media', 'resource'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
messageSchema.index({ groupId: 1, createdAt: -1 });

// TTL index — automatically delete messages older than 1 year (365 days)
// Adjust expireAfterSeconds to match your retention policy
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

module.exports = mongoose.model('Message', messageSchema);
