const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary is configured automatically from the CLOUDINARY_URL env var.
 * Format: cloudinary://api_key:api_secret@cloud_name
 *
 * The SDK reads CLOUDINARY_URL automatically when it is set in the environment,
 * but we call config() explicitly to surface missing-config errors early.
 */
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

/**
 * Upload a file buffer or local path to Cloudinary.
 *
 * @param {string} source - File path, URL, or base64 data URI
 * @param {object} options - Cloudinary upload options (folder, resource_type, etc.)
 * @returns {Promise<object>} Cloudinary upload result
 */
async function uploadFile(source, options = {}) {
  // TODO: add retry logic for transient network errors
  return cloudinary.uploader.upload(source, options);
}

/**
 * Delete a file from Cloudinary by its public_id.
 *
 * @param {string} publicId - The Cloudinary public_id of the asset
 * @param {object} options - e.g. { resource_type: 'video' }
 */
async function deleteFile(publicId, options = {}) {
  return cloudinary.uploader.destroy(publicId, options);
}

module.exports = { cloudinary, uploadFile, deleteFile };
