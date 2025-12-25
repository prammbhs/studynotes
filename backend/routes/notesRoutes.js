/**
 * Notes Generation Routes
 * Endpoints for generating and retrieving study notes
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const { verifyFirebaseToken } = require('../middleware/auth');
const {
  generateNotesForSubtopic,
  generateNotesForAllSubtopics,
  getNotesForSubtopic,
  getNotesForDocument
} = require('../controllers/notesController');

// Add timing middleware
router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// All routes require Firebase authentication
router.use(verifyFirebaseToken);

/**
 * Generate notes for a single subtopic
 * POST /api/subtopics/:subtopicId/generate-notes
 */
router.post('/subtopics/:subtopicId/generate-notes', generateNotesForSubtopic);

/**
 * Generate notes for all subtopics in a document (parallel processing)
 * POST /api/documents/:documentId/generate-all-notes
 */
router.post('/documents/:documentId/generate-all-notes', generateNotesForAllSubtopics);

/**
 * Retrieve generated notes for a subtopic
 * GET /api/subtopics/:subtopicId/notes
 */
router.get('/subtopics/:subtopicId/notes', getNotesForSubtopic);

/**
 * Retrieve all notes for a document
 * GET /api/documents/:documentId/all-notes
 */
router.get('/documents/:documentId/all-notes', getNotesForDocument);

module.exports = router;
