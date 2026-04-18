const express = require('express');
const router = express.Router();
const argon2 = require('argon2');

const Organization = require('../models/Organization');
const { uploadFile } = require('../config/cloudinary');

// GET /api/organizations
// Get all organizations for selection
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

// POST /api/organizations/register
// Register a new organization
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

// POST /api/organizations/login
// Organization login
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

    return res.status(200).json({
      message: 'Login successful',
      organization: {
        _id: organization._id,
        email: organization.email,
        organizationName: organization.organizationName,
        logo: organization.logo,
        location: organization.location,
      },
    });
  } catch (err) {
    console.error('[organizationRoutes.login]', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;