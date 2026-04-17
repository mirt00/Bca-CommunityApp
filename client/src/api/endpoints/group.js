import api from '../axiosConfig';
import { API_ROUTES } from '../../../../shared/constants/routes';

/**
 * Fetch all available groups.
 */
export const getGroups = () =>
  api.get(API_ROUTES.GROUPS.LIST);

/**
 * Create a new group (admin/organization only).
 * @param {{ name: string, description?: string }} payload
 */
export const createGroup = (payload) =>
  api.post(API_ROUTES.GROUPS.CREATE, payload);

/**
 * Fetch paginated chat history for a group.
 * @param {string} groupId
 * @param {{ page?: number, limit?: number }} params
 */
export const getGroupMessages = (groupId, params = {}) =>
  api.get(API_ROUTES.GROUPS.MESSAGES(groupId), { params });

/**
 * Get an Agora RTC token for a video call in a group.
 * @param {string} groupId
 * @param {number} [uid]
 */
export const getAgoraToken = (groupId, uid) =>
  api.get(API_ROUTES.GROUPS.AGORA_TOKEN(groupId), { params: { uid } });
