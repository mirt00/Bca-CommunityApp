export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    RESET_REQUEST: '/api/auth/reset-request',
    RESET_PASSWORD: '/api/auth/reset-password',
    PROFILE: '/api/users/profile',
  },
  ORGANIZATIONS: {
    LIST: '/api/organizations',
    REGISTER: '/api/organizations/register',
    LOGIN: '/api/organizations/login',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/update-profile',
    AVATAR: '/api/users/avatar',
  },
  FILES: {
    UPLOAD: '/api/files/upload',
    LIST: '/api/files',
    DELETE: '/api/files/delete',
    BY_GROUP: (groupId) => `/api/files/${groupId}`,
  },
  GROUPS: {
    LIST: '/api/groups',
    CREATE: '/api/groups/create',
    JOIN: '/api/groups/join',
    LEAVE: '/api/groups/leave',
    MESSAGES: (groupId) => `/api/groups/${groupId}/messages`,
    AGORA_TOKEN: (groupId) => `/api/groups/${groupId}/agora-token`,
  },
  JOBS: {
    LIST: '/api/jobs',
    CREATE: '/api/jobs/create',
    APPLY: '/api/jobs/apply',
    DELETE: (id) => `/api/jobs/${id}`,
  },
};