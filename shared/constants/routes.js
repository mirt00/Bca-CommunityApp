/**
 * API_ROUTES — centralized route path constants.
 * Import on both client (axiosConfig) and server (route files) to prevent drift.
 */
const API_ROUTES = {
  // Auth
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    RESET_REQUEST: '/api/auth/reset-password/request',
    RESET_PASSWORD: '/api/auth/reset-password',
    OAUTH_GOOGLE: '/api/auth/oauth/google/callback',
    OAUTH_LINKEDIN: '/api/auth/oauth/linkedin/callback',
    OAUTH_GITHUB: '/api/auth/oauth/github/callback',
  },

  // Users
  USERS: {
    PROFILE: '/api/users/profile',
    AVATAR: '/api/users/avatar',
  },

  // Groups
  GROUPS: {
    LIST: '/api/groups',
    CREATE: '/api/groups',
    MESSAGES: (groupId) => `/api/groups/${groupId}/messages`,
    AGORA_TOKEN: (groupId) => `/api/groups/${groupId}/agora-token`,
  },

  // Files
  FILES: {
    UPLOAD: '/api/files/upload',
    BY_GROUP: (groupId) => `/api/files/${groupId}`,
  },

  // Admin
  ADMIN: {
    PENDING_STUDENTS: '/api/admin/pending-students',
    APPROVE: (id) => `/api/admin/${id}/approve`,
    REJECT: (id) => `/api/admin/${id}/reject`,
  },

  // Jobs
  JOBS: {
    LIST: '/api/jobs',
    CREATE: '/api/jobs',
    DELETE: (id) => `/api/jobs/${id}`,
  },
};

module.exports = { API_ROUTES };
