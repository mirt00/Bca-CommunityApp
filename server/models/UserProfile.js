const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    nickname: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String, // Cloudinary URL
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    batch: {
      type: String,
      required: [true, 'Batch is required'],
      trim: true,
    },
    faculty: {
      type: String,
      required: [true, 'Faculty is required'],
      trim: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    organizationName: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      required: [true, 'LinkedIn profile URL is required'],
      trim: true,
    },
    github: {
      type: String,
      required: [true, 'GitHub profile URL is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

userProfileSchema.index({ batch: 1 });
userProfileSchema.index({ faculty: 1 });

module.exports = mongoose.model('UserProfile', userProfileSchema);