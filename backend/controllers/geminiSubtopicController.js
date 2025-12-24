/**
 * Gemini-Enhanced Subtopic Controller
 * Combines pattern-based detection (Step 5) with Gemini AI (Step 6)
 * Falls back gracefully if Gemini API is unavailable
 */

const Document = require('../models/Document');
const Subtopic = require('../models/Subtopic');
const User = require('../models/User');
const { detectSubtopics } = require('../services/subtopicService');
const { extractStructureWithGemini } = require('../services/geminiService');

/**
 * Extract subtopics using Gemini API
 * POST /api/documents/:documentId/subtopics/extract-with-gemini
 * 
 * This endpoint uses Gemini to intelligently extract document structure
 * Provides better accuracy than pattern matching alone
 */
const extractWithGemini = async (req, res) => {
  try {
    const { documentId } = req.params;
    const firebaseUID = req.user.firebaseUID; // Use 'uid' from verifyFirebaseToken middleware

    // Get user's MongoDB ID from Firebase UID
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify document exists and user owns it
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    if (document.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this document',
      });
    }

    console.log(`🤖 Extracting subtopics with Gemini for document: ${documentId}`);

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API not configured. Please set GEMINI_API_KEY in .env',
      });
    }

    try {
      // Use Gemini to extract structure
      const geminiSubtopics = await extractStructureWithGemini(document.originalText);

      // Delete existing subtopics for this document
      await Subtopic.deleteMany({ documentId });

      // Save extracted subtopics to database
      const savedSubtopics = [];
      for (const detected of geminiSubtopics) {
        const subtopic = new Subtopic({
          documentId,
          title: detected.title,
          description: detected.description,
          extractedText: detected.extractedText,
          wordCount: detected.extractedText.split(/\s+/).length,
          order: detected.order,
          detectionConfidence: Math.round(detected.confidence * 100),
          geminiStatus: 'pending',
        });

        await subtopic.save();
        savedSubtopics.push(subtopic);
      }

      console.log(`✅ Extracted and saved ${savedSubtopics.length} subtopics using Gemini`);

      return res.status(201).json({
        success: true,
        message: `Extracted ${savedSubtopics.length} subtopics using Gemini AI`,
        data: {
          documentId,
          count: savedSubtopics.length,
          extractionMethod: 'gemini-ai',
          subtopics: savedSubtopics.map((s) => ({
            _id: s._id,
            title: s.title,
            description: s.description,
            order: s.order,
            wordCount: s.wordCount,
            detectionConfidence: s.detectionConfidence,
          })),
        },
      });
    } catch (geminiError) {
      console.error('⚠️  Gemini extraction failed:', geminiError.message);

      // Fallback to pattern-based detection
      console.log('↩️  Falling back to pattern-based detection...');
      const patternSubtopics = await detectSubtopics(document.originalText);

      if (patternSubtopics.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No subtopics could be extracted (Gemini unavailable, pattern detection found nothing)',
          data: {
            documentId,
            count: 0,
            extractionMethod: 'pattern-fallback',
            subtopics: [],
          },
        });
      }

      // Save pattern-detected subtopics
      await Subtopic.deleteMany({ documentId });
      const savedSubtopics = [];

      for (const detected of patternSubtopics) {
        const subtopic = new Subtopic({
          documentId,
          title: detected.title,
          description: detected.description,
          extractedText: detected.extractedText,
          wordCount: detected.extractedText.split(/\s+/).length,
          order: detected.order,
          detectionConfidence: Math.round(detected.confidence * 100),
          geminiStatus: 'pending',
        });

        await subtopic.save();
        savedSubtopics.push(subtopic);
      }

      console.log(`⚠️  Extracted ${savedSubtopics.length} subtopics using pattern-based fallback`);

      return res.status(200).json({
        success: true,
        message: `Gemini API unavailable. Using pattern-based detection instead. Extracted ${savedSubtopics.length} subtopics`,
        warning: `Gemini extraction failed: ${geminiError.message}. Used fallback method.`,
        data: {
          documentId,
          count: savedSubtopics.length,
          extractionMethod: 'pattern-based-fallback',
          subtopics: savedSubtopics.map((s) => ({
            _id: s._id,
            title: s.title,
            description: s.description,
            order: s.order,
            wordCount: s.wordCount,
            detectionConfidence: s.detectionConfidence,
          })),
        },
      });
    }
  } catch (error) {
    console.error('❌ Extract with Gemini error:', error.message);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Failed to extract subtopics',
      details: error.message,
    });
  }
};

/**
 * Compare pattern-based vs Gemini extraction
 * GET /api/documents/:documentId/subtopics/compare
 * 
 * Shows both detection methods for comparison
 */
const compareExtractionMethods = async (req, res) => {
  try {
    const { documentId } = req.params;
    const firebaseUID = req.user.firebaseUID; // Use 'firebaseUID' from verifyFirebaseToken middleware (consistent)

    // Get user's MongoDB ID from Firebase UID
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify document exists and user owns it
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    if (document.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this document',
      });
    }

    console.log(`📊 Comparing extraction methods for document: ${documentId}`);

    // Get pattern-based extraction
    let patternResult = [];
    let patternError = null;
    try {
      patternResult = await detectSubtopics(document.originalText);
    } catch (error) {
      patternError = error.message;
      console.error(`❌ Pattern detection error: ${error.message}`);
    }

    // Try Gemini extraction
    let geminiResult = null;
    let geminiError = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        geminiResult = await extractStructureWithGemini(document.originalText);
      } catch (error) {
        geminiError = error.message;
        console.warn(`⚠️  Gemini comparison failed: ${error.message}`);
      }
    } else {
      geminiError = 'GEMINI_API_KEY not configured';
    }

    return res.status(200).json({
      success: true,
      data: {
        documentId,
        patternBased: patternError ? {
          method: 'Pattern Matching (Step 5)',
          error: patternError,
          count: 0,
          subtopics: [],
        } : {
          method: 'Pattern Matching (Step 5)',
          count: patternResult.length,
          subtopics: patternResult.map((s) => ({
            title: s.title,
            confidence: s.confidence,
            detectionMethod: s.detectionMethod,
            preview: (s.description || s.extractedText || '').substring(0, 80) + '...',
          })),
        },
        geminiAI: geminiResult ? {
          method: 'Gemini AI (Step 6)',
          count: geminiResult.length,
          subtopics: geminiResult.map((s) => ({
            title: s.title,
            confidence: s.confidence,
            detectionMethod: s.detectionMethod,
            hierarchyLevel: s.hierarchyLevel,
            preview: (s.description || s.extractedText || '').substring(0, 80) + '...',
          })),
        } : {
          method: 'Gemini AI (Step 6)',
          error: geminiError,
          count: 0,
          subtopics: [],
        },
      },
    });
  } catch (error) {
    console.error('❌ Compare methods error:', error.message);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Failed to compare extraction methods',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

module.exports = {
  extractWithGemini,
  compareExtractionMethods,
};
