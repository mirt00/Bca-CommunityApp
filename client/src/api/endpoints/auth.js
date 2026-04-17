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
