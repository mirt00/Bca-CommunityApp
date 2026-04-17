const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      unique: true,
      trim: true,
    },
    logo: {
      type: String, // Cloudinary URL
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
        type: String,
        trim: true,
      },
      linkedin: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
organizationSchema.index({ organizationName: 1 }, { unique: true });

module.exports = mongoose.model('Organization', organizationSchema);
