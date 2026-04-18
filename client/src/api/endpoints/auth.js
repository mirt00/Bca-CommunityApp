import api from '../axiosConfig';
import { API_ROUTES } from '../../shared/constants/routes';

/**
 * Register a new user account.
 * @param {object} payload - Registration fields (fullName, email, password, etc.)
 */
export const register = (payload) =>
  api.post(API_ROUTES.AUTH.REGISTER, payload);

/**
 * Log in with email and password.
 * @param {{ email: string, password: string }} credentials
 * @returns {{ token: string, user: object }}
 */
export const login = (credentials) =>
  api.post(API_ROUTES.AUTH.LOGIN, credentials);

/**
 * Get list of organizations for selection.
 * @returns {Array} List of organizations
 */
export const getOrganizations = () =>
  api.get(API_ROUTES.ORGANIZATIONS.LIST);

/**
 * Register a new organization.
 * @param {object} payload - Organization fields
 */
export const registerOrganization = (payload) =>
  api.post(API_ROUTES.ORGANIZATIONS.REGISTER, payload);

/**
 * Login as organization.
 * @param {{ email: string, password: string }} credentials
 */
export const loginOrganization = (credentials) =>
  api.post(API_ROUTES.ORGANIZATIONS.LOGIN, credentials);

/**
 * Request a password reset email.
 * @param {{ email: string }} payload
 */
export const requestPasswordReset = (payload) =>
  api.post(API_ROUTES.AUTH.RESET_REQUEST, payload);

/**
 * Submit a new password using the reset token.
 * @param {{ token: string, newPassword: string }} payload
 */
export const resetPassword = (payload) =>
  api.post(API_ROUTES.AUTH.RESET_PASSWORD, payload);
