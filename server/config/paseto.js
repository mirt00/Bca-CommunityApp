const { V3 } = require('paseto');
const { createSecretKey } = require('crypto');

/**
 * Derive a symmetric key from the PASETO_SECRET env var.
 * PASETO v3.local requires a 32-byte key.
 */
function getSymmetricKey() {
  const secret = process.env.PASETO_SECRET;
  if (!secret) {
    throw new Error('PASETO_SECRET is not defined in environment variables');
  }

  // Accept either a 64-char hex string (32 bytes) or a raw 32-char string
  const keyBuffer =
    secret.length === 64
      ? Buffer.from(secret, 'hex')
      : Buffer.from(secret.padEnd(32, '0').slice(0, 32));

  return createSecretKey(keyBuffer);
}

/**
 * Encrypt a payload into a PASETO v3.local token.
 *
 * @param {object} payload - Claims to embed (userId, role, isApproved, etc.)
 * @param {object} [options] - Optional PASETO options (expiresIn, etc.)
 * @returns {Promise<string>} Encrypted PASETO token string
 */
async function encryptToken(payload, options = {}) {
  const key = getSymmetricKey();
  const defaultOptions = {
    expiresIn: '7d',
    ...options,
  };
  return V3.encrypt(payload, key, defaultOptions);
}

/**
 * Decrypt a PASETO v3.local token and return the claims.
 *
 * @param {string} token - The PASETO token string
 * @returns {Promise<object>} Decrypted payload object
 * @throws If the token is invalid, expired, or tampered with
 */
async function decryptToken(token) {
  const key = getSymmetricKey();
  return V3.decrypt(token, key);
}

module.exports = { encryptToken, decryptToken };
