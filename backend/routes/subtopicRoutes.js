/**
 * Subtopic Routes
 * Handles all subtopic detection and management endpoints
 */

const express = require('express');
const router = express.Router({ mergeParams: true });

const { verifyFirebaseToken } = require('../middleware/auth');
const {
  getSubtopics,
  getSubtopicById,
  createSubtopic,
  detectAndSaveSubtopics,
  updateSubtopic,
  toggleBookmark,
  deleteSubtopic,
} = require('../controllers/subtopicController');

/**
 * GET /api/documents/:documentId/subtopics
 * Get all subtopics for a document
 * Requires: Authorization Bearer token
 */
router.get('/', verifyFirebaseToken, getSubtopics);

/**
 * POST /api/documents/:documentId/subtopics/detect
 * Auto-detect and save subtopics from document text
 * Requires: Authorization Bearer token
 */
router.post('/detect', verifyFirebaseToken, detectAndSaveSubtopics);

/**
 * POST /api/documents/:documentId/subtopics
 * Create a new subtopic manually
 * Requires: Authorization Bearer token
 * Body: { title, description, extractedText, order?, tags? }
 */
router.post('/', verifyFirebaseToken, createSubtopic);

/**
 * GET /api/documents/:documentId/subtopics/:subtopicId
 * Get a single subtopic by ID
 * Requires: Authorization Bearer token
 */
router.get('/:subtopicId', verifyFirebaseToken, getSubtopicById);

/**
 * PUT /api/documents/:documentId/subtopics/:subtopicId
 * Update a subtopic
 * Requires: Authorization Bearer token
 * Body: { title?, description?, userNotes?, tags? }
 */
router.put('/:subtopicId', verifyFirebaseToken, updateSubtopic);

/**
 * PATCH /api/documents/:documentId/subtopics/:subtopicId/bookmark
 * Toggle bookmark status for a subtopic
 * Requires: Authorization Bearer token
 */
router.patch('/:subtopicId/bookmark', verifyFirebaseToken, toggleBookmark);

/**
 * DELETE /api/documents/:documentId/subtopics/:subtopicId
 * Delete a subtopic
 * Requires: Authorization Bearer token
 */
router.delete('/:subtopicId', verifyFirebaseToken, deleteSubtopic);

module.exports = router;
