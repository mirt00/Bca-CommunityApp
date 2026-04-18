const mongoose = require('mongoose');

const oauthProviderSchema = new mongoose.Schema(
  {
    id: String,
    accessToken: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
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
    isApproved: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'organization'],
      default: 'student',
    },
    oauthProviders: {
      google: oauthProviderSchema,
      linkedin: oauthProviderSchema,
      github: oauthProviderSchema,
    },
    // Password reset token (single-use, TTL-managed separately)
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    profilePicture: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Note: email has unique: true in schema field, so no duplicate index needed
userSchema.index({ isApproved: 1 });
userSchema.index({ role: 1 });

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Strip sensitive fields before sending to client */
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.resetToken;
  delete obj.resetTokenExpiry;
  delete obj.oauthProviders;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
