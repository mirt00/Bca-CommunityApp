import { create } from 'zustand';
import { saveToken, clearToken } from '../utils/tokenHelper';

/**
 * authStore — global authentication state.
 *
 * State:
 *   user       - The authenticated user object (or null)
 *   token      - The PASETO token string (or null)
 *   isApproved - Whether the user's account has been approved
 *
 * Actions:
 *   login(token, user)  - Persist token to Secure Store and hydrate state
 *   logout()            - Clear token from Secure Store and reset state
 *   setUser(user)       - Update user object (e.g. after profile edit)
 */
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isApproved: false,

  login: async (token, user) => {
    await saveToken(token);
    set({
      token,
      user,
      isApproved: user?.isApproved ?? false,
    });
  },

  logout: async () => {
    await clearToken();
    set({ token: null, user: null, isApproved: false });
  },

  setUser: (user) =>
    set((state) => ({
      user,
      isApproved: user?.isApproved ?? state.isApproved,
    })),
}));
