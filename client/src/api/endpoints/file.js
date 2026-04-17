import api from '../axiosConfig';
import { API_ROUTES } from '../../../../shared/constants/routes';

/**
 * Upload a file to a group's repository.
 * The server's Smart File Sorter will route it to the correct Cloudinary folder.
 *
 * @param {FormData} formData - Must contain 'file' and 'groupId' fields
 */
export const uploadFile = (formData) =>
  api.post(API_ROUTES.FILES.UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Fetch files for a group, optionally filtered by type.
 * @param {string} groupId
 * @param {'doc' | 'media' | 'resource'} [fileType] - Optional filter
 */
export const getGroupFiles = (groupId, fileType) =>
  api.get(API_ROUTES.FILES.BY_GROUP(groupId), {
    params: fileType ? { fileType } : {},
  });
