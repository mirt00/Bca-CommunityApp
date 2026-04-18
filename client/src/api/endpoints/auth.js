import api from '../axiosConfig';
import { API_ROUTES } from '../../shared/constants/routes';

export const register = (payload) => api.post(API_ROUTES.AUTH.REGISTER, payload);
export const login = (credentials) => api.post(API_ROUTES.AUTH.LOGIN, credentials);
export const getOrganizations = () => api.get(API_ROUTES.ORGANIZATIONS.LIST);
export const registerOrganization = (payload) => api.post(API_ROUTES.ORGANIZATIONS.REGISTER, payload);
export const loginOrganization = (credentials) => api.post(API_ROUTES.ORGANIZATIONS.LOGIN, credentials);
export const requestPasswordReset = (payload) => api.post(API_ROUTES.AUTH.RESET_REQUEST, payload);
export const resetPassword = (payload) => api.post(API_ROUTES.AUTH.RESET_PASSWORD, payload);

export const getOrganizationUsers = () => api.get(API_ROUTES.ORGANIZATIONS.USERS);
export const approveUser = (userId) => api.post(API_ROUTES.ORGANIZATIONS.APPROVE_USER(userId));
export const rejectUser = (userId) => api.post(API_ROUTES.ORGANIZATIONS.REJECT_USER(userId));

export const getOrganizationGroups = () => api.get(API_ROUTES.ORGANIZATIONS.GROUPS);
export const createOrganizationGroup = (payload) => api.post(API_ROUTES.ORGANIZATIONS.CREATE_GROUP, payload);
export const updateOrganizationGroup = (groupId, payload) => api.put(API_ROUTES.ORGANIZATIONS.UPDATE_GROUP(groupId), payload);
export const deleteOrganizationGroup = (groupId) => api.delete(API_ROUTES.ORGANIZATIONS.DELETE_GROUP(groupId));

export const getOrganizationFiles = () => api.get(API_ROUTES.ORGANIZATIONS.FILES);