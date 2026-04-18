const argon2 = require('argon2');
const crypto = require('crypto');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Organization = require('../models/Organization');
const { encryptToken } = require('../config/paseto');
const { uploadFile } = require('../config/cloudinary');
const { sendResetEmail, sendNewStudentNotification } = require('../services/emailService');

/**
 * POST /api/auth/register
 * Creates a new user account with isApproved: false.
 * The account must be approved by an admin before community access is granted.
 */
async function register(req, res) {
  try {
    const {
      fullName,
      nickname,
      email,
      password,
      dateOfBirth,
      batch,
      faculty,
      organizationId,
      organizationName,
      profilePicture,
      linkedin,
      github,
      bio,
      role = 'student',
    } = req.body;

    // Check for existing account
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Validate organizationId for students
    if (role === 'student' && organizationId) {
      const org = await Organization.findById(organizationId);
      if (!org) {
        return res.status(400).json({ error: 'Invalid organization selected' });
      }
    }

    // For organizations, lookup the name from database
    let orgName = organizationName;
    if (role === 'organization' && organizationId) {
      const org = await Organization.findById(organizationId);
      if (!org) {
        return res.status(400).json({ error: 'Invalid organization selected' });
      }
      orgName = org.organizationName;
    }

    // Upload profile picture if provided (base64 data URI)
    let profilePictureUrl = null;
    if (profilePicture && profilePicture.startsWith('data:')) {
      try {
        const result = await uploadFile(profilePicture, {
          folder: 'it-community-app/profiles',
          resource_type: 'image',
        });
        profilePictureUrl = result.secure_url;
      } catch (uploadErr) {
        console.error('[authController.register] Profile picture upload failed', uploadErr);
      }
    }

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    // Create user account
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      profilePicture: profilePictureUrl,
      isApproved: role === 'organization' ? true : false,
      role: role,
    });

    // Create user profile
    const profileData = {
      userId: user._id,
      fullName,
      nickname,
      bio,
      linkedin,
      github,
    };

    // Add role-specific fields
    if (role === 'student') {
      profileData.dateOfBirth = new Date(dateOfBirth);
      profileData.batch = batch;
      profileData.faculty = faculty;
      if (organizationId) {
        profileData.organizationId = organizationId;
      }
    } else if (role === 'organization') {
      profileData.organizationId = organizationId;
      profileData.organizationName = orgName;
    }

    await UserProfile.create(profileData);

    // Send notification for students
    if (role === 'student') {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendNewStudentNotification(adminEmail, { ...user.toObject(), ...profileData });
      }
    }

    return res.status(201).json({
      message: 'Registration successful. Your account is pending admin approval.',
      userId: user._id,
    });
  } catch (err) {
    console.error('[authController.register]', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

/**
 * POST /api/auth/login
 * Verifies credentials and issues a PASETO v4.local token.
 */
async function login(req, res) {
  try {
    const { email, password, organizationId } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // For organization role, verify the organization matches
    if (user.role === 'organization' && organizationId) {
      const profile = await UserProfile.findOne({ userId: user._id });
      if (!profile || profile.organizationId?.toString() !== organizationId) {
        return res.status(401).json({ error: 'Invalid organization' });
      }
    }

    // Get user profile
    const profile = await UserProfile.findOne({ userId: user._id });

    const token = await encryptToken({
      userId: user._id.toString(),
      role: user.role,
      isApproved: user.isApproved,
    });

    // Combine user and profile data for response
    const userData = {
      ...user.toSafeObject(),
      ...(profile ? profile.toObject() : {}),
    };

    return res.status(200).json({
      token,
      user: userData,
    });
  } catch (err) {
    console.error('[authController.login]', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * POST /api/auth/reset-password/request
 * Generates a single-use reset token and sends it via email.
 */
async function resetPasswordRequest(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return 200 to prevent email enumeration
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    await sendResetEmail(user.email, resetToken);

    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('[authController.resetPasswordRequest]', err);
    return res.status(500).json({ error: 'Password reset request failed' });
  }
}

/**
 * POST /api/auth/reset-password
 * Validates the reset token and updates the password.
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    user.passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[authController.resetPassword]', err);
    return res.status(500).json({ error: 'Password reset failed' });
  }
}

// TODO: implement OAuth callbacks (Google, LinkedIn, GitHub)
async function googleCallback(req, res) {
  // TODO: handle Google OAuth callback, upsert user, issue PASETO token
  res.status(501).json({ error: 'Not implemented' });
}

async function linkedinCallback(req, res) {
  // TODO: handle LinkedIn OAuth callback
  res.status(501).json({ error: 'Not implemented' });
}

async function githubCallback(req, res) {
  // TODO: handle GitHub OAuth callback
  res.status(501).json({ error: 'Not implemented' });
}

module.exports = {
  register,
  login,
  resetPasswordRequest,
  resetPassword,
  googleCallback,
  linkedinCallback,
  githubCallback,
};
