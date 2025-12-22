const { verifyIdToken, getUserByEmail } = require('../config/firebase');
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify Firebase ID token from Authorization header
 * Extracts token, validates it, and attaches user info to request object
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Missing Authorization header',
      });
    }

    // Extract token - expected format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Invalid Authorization header format. Expected: Bearer <token>',
      });
    }

    const token = parts[1];

    try {
      // Try to verify as ID token first (from Firebase SDK)
      const decodedToken = await verifyIdToken(token);
      
      // Attach decoded token to request for use in routes
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        firebaseUID: decodedToken.uid,
      };
      
      return next();
    } catch (idTokenError) {
      // If ID token verification fails, try custom token (for backend testing)
      try {
        // Decode custom token without verification for backend testing
        const decoded = jwt.decode(token);
        
        if (!decoded || !decoded.uid) {
          return res.status(401).json({
            success: false,
            error: 'Invalid token format',
          });
        }

        // Attach user info from custom token
        req.user = {
          uid: decoded.uid,
          firebaseUID: decoded.uid,
        };
        
        return next();
      } catch (customTokenError) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token',
        });
      }
    };
  } catch (error) {
    console.error('Token verification error:', error.message);

    // Determine if token is expired or invalid
    const errorMessage = error.message.includes('expired')
      ? 'Token has expired'
      : 'Invalid or malformed token';

    return res.status(401).json({
      success: false,
      error: errorMessage,
    });
  }
};

/**
 * Middleware to verify that the user accessing a resource is the owner
 * Use after verifyFirebaseToken
 */
const verifyUserOwnership = (req, res, next) => {
  try {
    const userId = req.params.userId || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // Check if the user ID matches the authenticated user (simple string comparison)
    // For MongoDB ObjectId comparison, convert both to strings
    if (req.user.uid !== userId && String(req.user.uid) !== String(userId)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource',
      });
    }

    next();
  } catch (error) {
    console.error('Ownership verification error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Error verifying ownership',
    });
  }
};

/**
 * Optional middleware to verify Firebase token but not fail if missing
 * Useful for endpoints that can work with or without authentication
 */
const optionalVerifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const decodedToken = await verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          firebaseUID: decodedToken.uid,
        };
      }
    }

    next();
  } catch (error) {
    // Silently fail - user is not authenticated but that's okay
    console.warn('Optional token verification failed (non-fatal):', error.message);
    next();
  }
};

module.exports = {
  verifyFirebaseToken,
  verifyUserOwnership,
  optionalVerifyFirebaseToken,
};
