const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using the MONGO_URI environment variable.
 * Called once at server startup.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(uri, {
      // Mongoose 8+ has these as defaults, but explicit for clarity
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[DB] Connected to MongoDB Atlas');
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
