const { createUser, deleteUser, getUserByEmail } = require('../config/firebase');
const User = require('../models/User');

/**
 * Register a new user
 * Creates user in Firebase Auth and stores profile in MongoDB
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, firstName, and lastName are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate password strength (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    // Create user in Firebase
    const firebaseUser = await createUser(email, password);

    // Create user profile in MongoDB
    const newUser = new User({
      firebaseUID: firebaseUser.uid,
      email: email.toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    await newUser.save();

    console.log(`✅ New user registered: ${email} (UID: ${firebaseUser.uid})`);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);

    // Handle Firebase specific errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
    }

    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
      });
    }

    if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        success: false,
        error: 'Password is too weak. Use at least 6 characters',
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Error registering user',
    });
  }
};

/**
 * Get current authenticated user's profile
 * Uses Firebase token from middleware to identify user
 */
const getCurrentUser = async (req, res) => {
  try {
    const firebaseUID = req.user.firebaseUID;

    // Find user in MongoDB
    const user = await User.findOne({ firebaseUID });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        firebaseUID: user.firebaseUID,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        profileImage: user.profileImage,
        bio: user.bio,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Error fetching user profile',
    });
  }
};

/**
 * Get user by ID
 * Returns public profile information
 */
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Try to find by MongoDB _id first
    let user = await User.findById(userId).catch(() => null);
    
    // If not found by MongoDB _id, try finding by Firebase UID
    if (!user) {
      user = await User.findOne({ firebaseUID: userId });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const profile = user.getPublicProfile();

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Get user by ID error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Error fetching user',
    });
  }
};

/**
 * Update user profile
 * Updates firstName, lastName, bio, profileImage, and preferences
 */
const updateProfile = async (req, res) => {
  try {
    const firebaseUID = req.user.firebaseUID;
    const { firstName, lastName, bio, profileImage, preferences } = req.body;

    // Find user
    const user = await User.findOne({ firebaseUID });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Update allowed fields only
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;

    // Update preferences if provided
    if (preferences) {
      if (preferences.language) user.preferences.language = preferences.language;
      if (preferences.theme) user.preferences.theme = preferences.theme;
      if (preferences.notificationsEnabled !== undefined) {
        user.preferences.notificationsEnabled = preferences.notificationsEnabled;
      }
    }

    user.updatedAt = Date.now();
    await user.save();

    console.log(`✅ User profile updated: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        bio: user.bio,
        profileImage: user.profileImage,
        preferences: user.preferences,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Error updating profile',
    });
  }
};

/**
 * Record last login timestamp
 */
const recordLogin = async (req, res) => {
  try {
    const firebaseUID = req.user.firebaseUID;

    const user = await User.findOne({ firebaseUID });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    await user.updateLastLogin();

    return res.status(200).json({
      success: true,
      message: 'Login recorded',
      data: {
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Record login error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Error recording login',
    });
  }
};

/**
 * Delete user account
 * Deletes from both Firebase Auth and MongoDB
 * Also deletes all associated documents and results
 */
const deleteAccount = async (req, res) => {
  try {
    const firebaseUID = req.user.firebaseUID;

    // Find user in MongoDB
    const user = await User.findOne({ firebaseUID });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const userEmail = user.email;

    // Delete from Firebase Auth
    await deleteUser(firebaseUID);

    // TODO: Delete all user's documents and results
    // const Document = require('../models/Document');
    // const SavedResult = require('../models/SavedResult');
    // await Document.deleteMany({ userId: user._id });
    // await SavedResult.deleteMany({ userId: user._id });

    // Delete user from MongoDB
    await User.findByIdAndDelete(user._id);

    console.log(`✅ User account deleted: ${userEmail}`);

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Error deleting account',
    });
  }
};

module.exports = {
  register,
  getCurrentUser,
  getUserById,
  updateProfile,
  recordLogin,
  deleteAccount,
};
