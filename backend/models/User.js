const mongoose = require('mongoose');

/**
 * User Model
 * Stores user profile information linked to Firebase authentication
 */
const userSchema = new mongoose.Schema(
  {
    // Firebase UID - unique identifier from Firebase Auth
    firebaseUID: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // User email - also indexed for quick lookups
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // User name fields
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    // User profile information
    profileImage: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },

    // User preferences
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Update updatedAt before saving
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for finding active users
userSchema.index({ isActive: 1 });

// Index for searching by email
userSchema.index({ email: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    profileImage: this.profileImage,
    bio: this.bio,
    createdAt: this.createdAt,
  };
};

// Method to update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = Date.now();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
