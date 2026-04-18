const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    establishedDate: {
      type: Date,
      required: [true, 'Established date is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    socials: {
      facebook: {
        url: {
          type: String,
          trim: true,
        },
        username: {
          type: String,
          trim: true,
        },
      },
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

organizationSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Organization', organizationSchema);
