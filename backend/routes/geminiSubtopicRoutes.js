/**
 * Gemini-Enhanced Subtopic Routes
 * Step 6: AI-Powered Structure Extraction
 */

const express = require('express');
const {
  extractWithGemini,
  compareExtractionMethods,
} = require('../controllers/geminiSubtopicController');
const { verifyFirebaseToken } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

/**
 * Extract subtopics using Gemini AI
 * POST /api/documents/:documentId/subtopics/gemini-extract
 * 
 * Uses Gemini to intelligently extract document structure
 * Falls back to pattern-based detection if Gemini API fails
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Extracted N subtopics using Gemini AI",
 *   data: {
 *     documentId: "...",
 *     count: N,
 *     extractionMethod: "gemini-ai" | "pattern-based-fallback",
 *     subtopics: [
 *       {
 *         _id: "...",
 *         title: "...",
 *         description: "...",
 *         order: N,
 *         wordCount: N,
 *         detectionConfidence: 85
 *       }
 *     ]
 *   }
 * }
 */
router.post('/gemini-extract', verifyFirebaseToken, extractWithGemini);

/**
 * Compare extraction methods
 * GET /api/documents/:documentId/subtopics/compare
 * 
 * Shows results from both pattern-based (Step 5) and Gemini AI (Step 6) methods
 * Useful for evaluating extraction quality
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     documentId: "...",
 *     patternBased: {
 *       method: "Pattern Matching (Step 5)",
 *       count: N,
 *       subtopics: [...]
 *     },
 *     geminiAI: {
 *       method: "Gemini AI (Step 6)",
 *       count: N,
 *       subtopics: [...]
 *     }
 *   }
 * }
 */
router.get('/compare', verifyFirebaseToken, compareExtractionMethods);

module.exports = router;
