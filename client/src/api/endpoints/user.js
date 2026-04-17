import api from '../axiosConfig';
import { API_ROUTES } from '../../../../shared/constants/routes';

/**
 * Fetch the authenticated user's profile.
 */
export const getProfile = () =>
  api.get(API_ROUTES.USERS.PROFILE);

/**
 * Update the authenticated user's profile.
 * @param {object} updates - Fields to update (fullName, bio, linkedin, etc.)
 */
export const updateProfile = (updates) =>
  api.put(API_ROUTES.USERS.PROFILE, updates);

/**
 * Upload a new profile picture.
 * @param {FormData} formData - Must contain a 'avatar' file field
 */
export const uploadAvatar = (formData) =>
  api.post(API_ROUTES.USERS.AVATAR, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
