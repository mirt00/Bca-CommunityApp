const User = require('../models/User');
const { uploadFile } = require('../config/cloudinary');

/**
 * GET /api/users/profile
 * Returns the authenticated user's profile.
 */
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash -resetToken -resetTokenExpiry');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error('[userController.getProfile]', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

/**
 * PUT /api/users/profile
 * Updates the authenticated user's profile fields.
 * Email and passwordHash are not updatable through this endpoint.
 */
async function updateProfile(req, res) {
  try {
    const allowedFields = [
      'fullName',
      'nickname',
      'bio',
      'dateOfBirth',
      'batch',
      'faculty',
      'organizationName',
      'linkedin',
      'github',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash -resetToken -resetTokenExpiry');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('[userController.updateProfile]', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

/**
 * POST /api/users/avatar
 * Uploads a new profile picture to Cloudinary and updates the user record.
 * Expects a file attached via multer (req.file).
 */
async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Upload to Cloudinary avatars folder
    const result = await uploadFile(req.file.path, {
      folder: 'it-community-app/avatars',
      public_id: `user_${req.user.userId}`,
      overwrite: true,
      resource_type: 'image',
    });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { profilePicture: result.secure_url } },
      { new: true }
    ).select('-passwordHash -resetToken -resetTokenExpiry');

    return res.status(200).json({
      message: 'Avatar updated',
      profilePicture: result.secure_url,
      user,
    });
  } catch (err) {
    console.error('[userController.uploadAvatar]', err);
    return res.status(500).json({ error: 'Avatar upload failed' });
  }
}

module.exports = { getProfile, updateProfile, uploadAvatar };
