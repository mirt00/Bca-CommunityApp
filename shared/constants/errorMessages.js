/**
 * ERROR_MESSAGES — standardized error strings used on both client and server.
 * Keeps user-facing messages consistent across the stack.
 */
const ERROR_MESSAGES = {
  // Auth
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_MISSING: 'Authorization token missing',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    TOKEN_INVALID: 'Invalid or expired token',
    ACCOUNT_PENDING: 'Your account is pending admin approval',
    ACCOUNT_NOT_FOUND: 'No account found with that email',
    EMAIL_TAKEN: 'An account with this email already exists',
    RESET_TOKEN_INVALID: 'Invalid or expired reset token',
    RESET_LINK_SENT: 'If that email exists, a reset link has been sent.',
  },

  // Validation
  VALIDATION: {
    REQUIRED_FIELD: (field) => `${field} is required`,
    INVALID_EMAIL: 'Please enter a valid email address',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    INVALID_LINKEDIN: 'LinkedIn URL must start with https://linkedin.com/in/',
    INVALID_GITHUB: 'GitHub URL must start with https://github.com/',
    SCHEMA_MISMATCH: 'Request body does not match the required schema',
  },

  // Authorization
  AUTHORIZATION: {
    FORBIDDEN: 'You do not have permission to perform this action',
    ADMIN_REQUIRED: 'Admin access required',
    APPROVED_REQUIRED: 'Your account must be approved to access this feature',
  },

  // Files
  FILES: {
    NO_FILE: 'No file provided',
    UNSUPPORTED_TYPE: 'Unsupported file type',
    UPLOAD_FAILED: 'File upload failed',
    GROUP_ID_REQUIRED: 'groupId is required for file uploads',
  },

  // General
  GENERAL: {
    NOT_FOUND: 'Resource not found',
    SERVER_ERROR: 'An unexpected error occurred. Please try again.',
    RATE_LIMITED: 'Too many requests. Please try again later.',
  },
};

module.exports = { ERROR_MESSAGES };
