/**
 * Document Routes
 * Handles all document/file upload endpoints
 */

const express = require('express');
const router = express.Router();

const { verifyFirebaseToken } = require('../middleware/auth');
const { uploadSingle, validateFilePresence, logFileUpload } = require('../middleware/uploadMiddleware');
const {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
  getDocumentText,
  getDownloadUrl,
} = require('../controllers/documentController');

/**
 * POST /api/documents/upload
 * Upload a document (PDF, image, or text file)
 * Requires: Authorization Bearer token, multipart file
 * File field name: 'file'
 */
router.post(
  '/upload',
  verifyFirebaseToken,
  uploadSingle,
  validateFilePresence,
  logFileUpload,
  uploadDocument
);

/**
 * GET /api/documents
 * Get all documents for authenticated user
 * Requires: Authorization Bearer token
 */
router.get('/', verifyFirebaseToken, getUserDocuments);

/**
 * GET /api/documents/:documentId
 * Get document details by ID
 * Requires: Authorization Bearer token
 */
router.get('/:documentId', verifyFirebaseToken, getDocumentById);

/**
 * GET /api/documents/:documentId/text
 * Get extracted text content from document
 * Requires: Authorization Bearer token
 */
router.get('/:documentId/text', verifyFirebaseToken, getDocumentText);

/**
 * GET /api/documents/:documentId/download-url
 * Get a signed download URL for the original file
 * Requires: Authorization Bearer token
 */
router.get('/:documentId/download-url', verifyFirebaseToken, getDownloadUrl);

/**
 * DELETE /api/documents/:documentId
 * Delete document and associated files
 * Requires: Authorization Bearer token
 */
router.delete('/:documentId', verifyFirebaseToken, deleteDocument);

module.exports = router;
