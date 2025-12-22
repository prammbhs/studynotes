const admin = require('firebase-admin');
const path = require('path');

/**
 * Initialize Firebase Admin SDK
 * Reads service account credentials from environment variables
 */
const initializeFirebase = () => {
  try {
    // Parse service account credentials from environment variables
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    throw new Error('Failed to initialize Firebase. Check your environment variables.');
  }
};

// Initialize on module load
initializeFirebase();

/**
 * Get Firebase Auth instance
 * @returns {admin.auth.Auth} Firebase Authentication service
 */
const getAuth = () => {
  return admin.auth();
};

/**
 * Get Firestore instance (optional, if using Firestore alongside MongoDB)
 * @returns {admin.firestore.Firestore} Firestore database instance
 */
const getFirestore = () => {
  return admin.firestore();
};

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<admin.auth.DecodedIdToken>} Decoded token with user info
 */
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error.message);
    throw new Error('Invalid or expired token');
  }
};

/**
 * Create a new user in Firebase
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<admin.auth.UserRecord>} Created user record
 */
const createUser = async (email, password) => {
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
    });
    return userRecord;
  } catch (error) {
    console.error('Error creating Firebase user:', error.message);
    throw error;
  }
};

/**
 * Delete a user from Firebase
 * @param {string} uid - Firebase user ID
 * @returns {Promise<void>}
 */
const deleteUser = async (uid) => {
  try {
    await admin.auth().deleteUser(uid);
  } catch (error) {
    console.error('Error deleting Firebase user:', error.message);
    throw error;
  }
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<admin.auth.UserRecord>} User record
 */
const getUserByEmail = async (email) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
};

module.exports = {
  admin,
  initializeFirebase,
  getAuth,
  getFirestore,
  verifyIdToken,
  createUser,
  deleteUser,
  getUserByEmail,
};
