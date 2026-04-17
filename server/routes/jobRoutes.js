const express = require('express');
const router = express.Router();

const { authenticate, requireApproved, requireAdmin } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validator');
const JobPost = require('../models/JobPost');

const jobSchema = require('../../shared/schemas/jobPost.schema.json');

// All job routes require authentication and approval
router.use(authenticate, requireApproved);

// GET /api/jobs
// Returns all job posts, optionally filtered by tag
router.get('/', async (req, res) => {
  try {
    const { tag, groupId } = req.query;
    const query = {};
    if (tag) query.tags = tag;
    if (groupId) query.groupId = groupId;

    const jobs = await JobPost.find(query)
      .sort({ createdAt: -1 })
      .populate('postedBy', 'fullName nickname organizationName');

    return res.status(200).json({ jobs });
  } catch (err) {
    console.error('[jobRoutes.getJobs]', err);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// POST /api/jobs
// Only admin or organization roles can post jobs
router.post('/', validate(jobSchema), async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin' && role !== 'organization') {
      return res.status(403).json({ error: 'Only admins and organizations can post jobs' });
    }

    const { groupId, title, company, link, tags } = req.body;

    const job = await JobPost.create({
      groupId,
      postedBy: req.user.userId,
      title,
      company,
      link,
      tags,
    });

    return res.status(201).json({ message: 'Job posted', job });
  } catch (err) {
    console.error('[jobRoutes.createJob]', err);
    return res.status(500).json({ error: 'Failed to create job post' });
  }
});

// DELETE /api/jobs/:id — admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const job = await JobPost.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job post not found' });
    return res.status(200).json({ message: 'Job post deleted' });
  } catch (err) {
    console.error('[jobRoutes.deleteJob]', err);
    return res.status(500).json({ error: 'Failed to delete job post' });
  }
});

module.exports = router;
