import api from '../axiosConfig';
import { API_ROUTES } from '../../../../shared/constants/routes';

/**
 * Fetch all job posts, optionally filtered by tag or groupId.
 * @param {{ tag?: string, groupId?: string }} params
 */
export const getJobs = (params = {}) =>
  api.get(API_ROUTES.JOBS.LIST, { params });

/**
 * Create a new job post (admin/organization only).
 * @param {{ title: string, company: string, link: string, tags: string[], groupId?: string }} payload
 */
export const createJob = (payload) =>
  api.post(API_ROUTES.JOBS.CREATE, payload);

/**
 * Delete a job post by ID (admin only).
 * @param {string} id
 */
export const deleteJob = (id) =>
  api.delete(API_ROUTES.JOBS.DELETE(id));
