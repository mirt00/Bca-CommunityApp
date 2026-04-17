const { decryptToken } = require('../config/paseto');

/**
 * authenticate
 * Reads the Bearer token from the Authorization header, decrypts it,
 * checks expiry, and attaches the decoded payload to req.user.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];
    const payload = await decryptToken(token);

    // PASETO library throws on expiry, but double-check the exp claim
    if (payload.exp && new Date(payload.exp) < new Date()) {
      return res.status(401).json({ error: 'Token has expired' });
    }

    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * requireApproved
 * Must be used after `authenticate`.
 * Blocks access for users whose account has not been approved by an admin.
 */
function requireApproved(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.isApproved !== true) {
    return res.status(403).json({ error: 'Account pending approval' });
  }
  return next();
}

/**
 * requireAdmin
 * Must be used after `authenticate`.
 * Restricts the route to users with role === 'admin'.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
}

module.exports = { authenticate, requireApproved, requireAdmin };
