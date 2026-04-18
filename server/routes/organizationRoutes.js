const express = require('express');
const router = express.Router();
const argon2 = require('argon2');

const Organization = require('../models/Organization');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Group = require('../models/Group');
const { uploadFile } = require('../config/cloudinary');
const { encryptToken } = require('../config/paseto');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find({})
      .select('organizationName logo location')
      .sort({ organizationName: 1 });

    return res.status(200).json({ organizations });
  } catch (err) {
    console.error('[organizationRoutes.getOrganizations]', err);
    return res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      organizationName,
      establishedDate,
      location,
      website,
      socials,
      logo,
    } = req.body;

    if (!email || !password || !organizationName || !establishedDate || !location) {
      return res.status(400).json({ error: 'Email, password, organization name, established date, and location are required' });
    }

    const existingEmail = await Organization.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const existingName = await Organization.findOne({ organizationName });
    if (existingName) {
      return res.status(409).json({ error: 'An organization with this name already exists' });
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    let logoUrl = null;
    if (logo && logo.startsWith('data:')) {
      try {
        const result = await uploadFile(logo, {
          folder: 'it-community-app/organizations',
          resource_type: 'image',
        });
        logoUrl = result.secure_url;
      } catch (uploadErr) {
        console.error('[organizationRoutes.register] Logo upload failed', uploadErr);
      }
    }

    const organization = await Organization.create({
      email: email.toLowerCase(),
      passwordHash,
      organizationName,
      establishedDate: new Date(establishedDate),
      location,
      website,
      socials,
      logo: logoUrl,
    });

    return res.status(201).json({
      message: 'Organization registered successfully',
      organization: {
        _id: organization._id,
        email: organization.email,
        organizationName: organization.organizationName,
        logo: organization.logo,
        location: organization.location,
      },
    });
  } catch (err) {
    console.error('[organizationRoutes.register]', err);
    return res.status(500).json({ error: 'Organization registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const organization = await Organization.findOne({ email: email.toLowerCase() });
    if (!organization) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await argon2.verify(organization.passwordHash, password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = await encryptToken({
      id: organization._id,
      email: organization.email,
      role: 'organization',
      organizationName: organization.organizationName,
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      organization: {
        _id: organization._id,
        email: organization.email,
        organizationName: organization.organizationName,
        logo: organization.logo,
        location: organization.location,
        isAdmin: organization.isAdmin,
      },
    });
  } catch (err) {
    console.error('[organizationRoutes.login]', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.use(authenticate, requireAdmin);

router.get('/users', async (req, res) => {
  try {
    const organizationId = req.user.id;
    const profiles = await UserProfile.find({ organizationId })
      .select('userId fullName batch faculty linkedin github');

    const userIds = profiles.map(p => p.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('_id email role isApproved createdAt');

    const usersWithProfiles = users.map(user => {
      const profile = profiles.find(p => p.userId.toString() === user._id.toString());
      return {
        _id: user._id,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
        fullName: profile?.fullName,
        batch: profile?.batch,
        faculty: profile?.faculty,
        linkedin: profile?.linkedin,
        github: profile?.github,
      };
    });

    return res.status(200).json({ users: usersWithProfiles });
  } catch (err) {
    console.error('[organizationRoutes.getUsers]', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isApproved: true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'User approved successfully', user });
  } catch (err) {
    console.error('[organizationRoutes.approveUser]', err);
    return res.status(500).json({ error: 'Approval failed' });
  }
});

router.post('/users/:id/reject', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await UserProfile.findOneAndDelete({ userId: user._id });

    return res.status(200).json({ message: 'User rejected and deleted' });
  } catch (err) {
    console.error('[organizationRoutes.rejectUser]', err);
    return res.status(500).json({ error: 'Rejection failed' });
  }
});

router.get('/groups', async (req, res) => {
  try {
    const organizationId = req.user.id;
    const groups = await Group.find({ organizationId })
      .populate('members', 'fullName email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ groups });
  } catch (err) {
    console.error('[organizationRoutes.getGroups]', err);
    return res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

router.post('/groups/create', async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const organizationId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    let imageUrl = null;
    if (image && image.startsWith('data:')) {
      try {
        const result = await uploadFile(image, {
          folder: 'it-community-app/groups',
          resource_type: 'image',
        });
        imageUrl = result.secure_url;
      } catch (uploadErr) {
        console.error('[organizationRoutes.createGroup] Image upload failed', uploadErr);
      }
    }

    const group = await Group.create({
      name,
      description,
      image: imageUrl,
      organizationId,
      members: [],
    });

    return res.status(201).json({ message: 'Group created successfully', group });
  } catch (err) {
    console.error('[organizationRoutes.createGroup]', err);
    return res.status(500).json({ error: 'Group creation failed' });
  }
});

router.put('/groups/:id', async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const organizationId = req.user.id;

    const group = await Group.findOne({ _id: req.params.id, organizationId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (name) group.name = name;
    if (description) group.description = description;

    if (image && image.startsWith('data:')) {
      try {
        const result = await uploadFile(image, {
          folder: 'it-community-app/groups',
          resource_type: 'image',
        });
        group.image = result.secure_url;
      } catch (uploadErr) {
        console.error('[organizationRoutes.updateGroup] Image upload failed', uploadErr);
      }
    }

    await group.save();

    return res.status(200).json({ message: 'Group updated successfully', group });
  } catch (err) {
    console.error('[organizationRoutes.updateGroup]', err);
    return res.status(500).json({ error: 'Group update failed' });
  }
});

router.delete('/groups/:id', async (req, res) => {
  try {
    const organizationId = req.user.id;
    const group = await Group.findOneAndDelete({ _id: req.params.id, organizationId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    return res.status(200).json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error('[organizationRoutes.deleteGroup]', err);
    return res.status(500).json({ error: 'Group deletion failed' });
  }
});

router.get('/files', async (req, res) => {
  try {
    return res.status(200).json({ files: [] });
  } catch (err) {
    console.error('[organizationRoutes.getFiles]', err);
    return res.status(500).json({ error: 'Failed to fetch files' });
  }
});

module.exports = router;