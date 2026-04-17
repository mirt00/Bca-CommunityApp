const mongoose = require('mongoose');

const JOB_TAGS = [
  'frontend',
  'backend',
  'fullstack',
  'mobile',
  'devops',
  'design',
  'internship',
  'remote',
  'part-time',
  'full-time',
];

const jobPostSchema = new mongoose.Schema(
  {
    groupId: {
      type: String,
      required: [true, 'Group ID is required'],
      index: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Posted by is required'],
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    link: {
      type: String,
      required: [true, 'Job link is required'],
      trim: true,
    },
    tags: {
      type: [String],
      enum: JOB_TAGS,
      required: [true, 'At least one tag is required'],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Tags must be a non-empty array',
      },
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Note: groupId and tags have index: true in schema fields

module.exports = mongoose.model('JobPost', jobPostSchema);
