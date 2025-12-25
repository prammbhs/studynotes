const express = require('express');
const router = express.Router();
const {
  register,
  getCurrentUser,
  getUserById,
  updateProfile,
  recordLogin,
  deleteAccount,
} = require('../controllers/authController');
const { verifyFirebaseToken } = require('../middleware/auth');

/**
  POST /api/auth/register
  Register a new user with email and password
  Body: { email, password, firstName, lastName }
 */
router.post('/register', register);

/**
 * GET /api/auth/user
 * Get current authenticated user's profile
 * Requires: Authorization Bearer token
 */
router.get('/user', verifyFirebaseToken, getCurrentUser);

/**
 * GET /api/auth/users/:userId
 * Get public profile of a specific user
 */
router.get('/users/:userId', getUserById);

/**
 * PUT /api/auth/profile
 * Update current user's profile
 * Requires: Authorization Bearer token
 * Body: { firstName?, lastName?, bio?, profileImage?, preferences? }
 */
router.put('/profile', verifyFirebaseToken, updateProfile);

/**
 * POST /api/auth/login
 * Record that user has logged in (update lastLogin timestamp)
 * Requires: Authorization Bearer token
 */
router.post('/login', verifyFirebaseToken, recordLogin);

/**
 * DELETE /api/auth/profile
 * Delete current user's account
 * Requires: Authorization Bearer token
 */
router.delete('/profile', verifyFirebaseToken, deleteAccount);

module.exports = router;
