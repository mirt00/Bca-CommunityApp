/**
 * ROLES — shared role constants used by both client and server.
 * Import this instead of hardcoding role strings.
 *
 * @example
 *   const { ROLES } = require('shared/constants/roles');
 *   if (user.role === ROLES.ADMIN) { ... }
 */
const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  ORGANIZATION: 'organization',
};

module.exports = { ROLES };
