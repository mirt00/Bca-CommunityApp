import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'paseto_token';

/**
 * Save the PASETO token to Expo Secure Store (hardware-backed keystore).
 * @param {string} token
 */
export async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Read the PASETO token from Expo Secure Store.
 * @returns {Promise<string | null>} The token string, or null if not set.
 */
export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Delete the PASETO token from Expo Secure Store.
 * Call this on logout or when a 401 is received.
 */
export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
