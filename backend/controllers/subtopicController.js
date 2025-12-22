/**
 * Subtopic Controller
 * Handles subtopic detection, retrieval, creation, and management
 */

const Document = require('../models/Document');
const Subtopic = require('../models/Subtopic');
const User = require('../models/User');
const { detectSubtopics, validateSubtopic } = require('../services/subtopicService');

/**
 * Get all subtopics for a document
 * GET /api/documents/:documentId/subtopics
 */
const getSubtopics = async (req, res) => {
  try {
    const { documentId } = req.params;
    const firebaseUID = req.user.firebaseUID;

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

    // Get all subtopics for this document, sorted by order
    const subtopics = await Subtopic.find({ documentId })
      .sort({ order: 1 })
      .select('_id title description order wordCount detectionConfidence geminiStatus isBookmarked createdAt');

    return res.status(200).json({
      success: true,
      data: {
        documentId,
        count: subtopics.length,
        subtopics: subtopics,
      },
    });
  } catch (error) {
    console.error('Get subtopics error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve subtopics',
    });
  }
};

/**
 * Get a single subtopic by ID
 * GET /api/documents/:documentId/subtopics/:subtopicId
 */
const getSubtopicById = async (req, res) => {
  try {
    const { documentId, subtopicId } = req.params;
    const firebaseUID = req.user.firebaseUID;

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

    // Get the specific subtopic
    const subtopic = await Subtopic.findById(subtopicId);
    if (!subtopic) {
      return res.status(404).json({
        success: false,
        error: 'Subtopic not found',
      });
    }

    // Verify subtopic belongs to the document
    if (subtopic.documentId.toString() !== documentId) {
      return res.status(403).json({
        success: false,
        error: 'Subtopic does not belong to this document',
      });
    }

    return res.status(200).json({
      success: true,
      data: subtopic,
    });
  } catch (error) {
    console.error('Get subtopic error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve subtopic',
    });
  }
};

/**
 * Create a new subtopic for a document (manual addition)
 * POST /api/documents/:documentId/subtopics
 * Body: { title, description, extractedText, order, tags }
 */
const createSubtopic = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { title, description, extractedText, order, tags } = req.body;
    const firebaseUID = req.user.firebaseUID;

    // Validate required fields
    if (!title || !extractedText) {
      return res.status(400).json({
        success: false,
        error: 'Title and extractedText are required',
      });
    }

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

    // Calculate word count
    const wordCount = extractedText.trim().split(/\s+/).length;

    // Determine order if not provided
    let finalOrder = order;
    if (finalOrder === undefined) {
      const lastSubtopic = await Subtopic.findOne({ documentId })
        .sort({ order: -1 })
        .select('order');
      finalOrder = lastSubtopic ? lastSubtopic.order + 1 : 0;
    }

    // Create the subtopic
    const subtopic = new Subtopic({
      documentId,
      title: title.trim(),
      description: description || '',
      extractedText: extractedText.trim(),
      wordCount,
      order: finalOrder,
      tags: tags || [],
      detectionConfidence: 100, // Manual entries have full confidence
      geminiStatus: 'pending',
    });

    await subtopic.save();
    console.log(`✅ Subtopic created: ${subtopic._id}`);

    return res.status(201).json({
      success: true,
      message: 'Subtopic created successfully',
      data: subtopic,
    });
  } catch (error) {
    console.error('Create subtopic error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to create subtopic',
    });
  }
};

/**
 * Detect and create subtopics automatically from document text
 * POST /api/documents/:documentId/subtopics/detect
 */
const detectAndSaveSubtopics = async (req, res) => {
  try {
    const { documentId } = req.params;
    const firebaseUID = req.user.firebaseUID;

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

    console.log(`🔍 Detecting subtopics for document: ${documentId}`);

    // Delete existing subtopics for this document
    await Subtopic.deleteMany({ documentId });

    // Detect subtopics from document text
    const detectedSubtopics = await detectSubtopics(document.originalText);

    if (detectedSubtopics.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No subtopics detected in document',
        data: {
          documentId,
          count: 0,
          subtopics: [],
        },
      });
    }

    // Save detected subtopics to database
    const savedSubtopics = [];
    for (const detected of detectedSubtopics) {
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

    console.log(`✅ Detected and saved ${savedSubtopics.length} subtopics`);

    return res.status(201).json({
      success: true,
      message: `Detected and saved ${savedSubtopics.length} subtopics`,
      data: {
        documentId,
        count: savedSubtopics.length,
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
  } catch (error) {
    console.error('Detect subtopics error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to detect subtopics',
    });
  }
};

/**
 * Update a subtopic
 * PUT /api/documents/:documentId/subtopics/:subtopicId
 * Body: { title, description, userNotes, tags }
 */
const updateSubtopic = async (req, res) => {
  try {
    const { documentId, subtopicId } = req.params;
    const { title, description, userNotes, tags } = req.body;
    const firebaseUID = req.user.firebaseUID;

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

    // Get and update the subtopic
    const subtopic = await Subtopic.findById(subtopicId);
    if (!subtopic) {
      return res.status(404).json({
        success: false,
        error: 'Subtopic not found',
      });
    }

    if (subtopic.documentId.toString() !== documentId) {
      return res.status(403).json({
        success: false,
        error: 'Subtopic does not belong to this document',
      });
    }

    // Update fields
    if (title) subtopic.title = title.trim();
    if (description !== undefined) subtopic.description = description;
    if (userNotes !== undefined) subtopic.userNotes = userNotes;
    if (tags) subtopic.tags = tags;

    await subtopic.save();
    console.log(`✅ Subtopic updated: ${subtopic._id}`);

    return res.status(200).json({
      success: true,
      message: 'Subtopic updated successfully',
      data: subtopic,
    });
  } catch (error) {
    console.error('Update subtopic error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to update subtopic',
    });
  }
};

/**
 * Toggle bookmark status for a subtopic
 * PATCH /api/documents/:documentId/subtopics/:subtopicId/bookmark
 */
const toggleBookmark = async (req, res) => {
  try {
    const { documentId, subtopicId } = req.params;
    const firebaseUID = req.user.firebaseUID;

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

    // Get and toggle the subtopic bookmark
    const subtopic = await Subtopic.findById(subtopicId);
    if (!subtopic) {
      return res.status(404).json({
        success: false,
        error: 'Subtopic not found',
      });
    }

    if (subtopic.documentId.toString() !== documentId) {
      return res.status(403).json({
        success: false,
        error: 'Subtopic does not belong to this document',
      });
    }

    subtopic.isBookmarked = !subtopic.isBookmarked;
    await subtopic.save();

    return res.status(200).json({
      success: true,
      message: `Subtopic ${subtopic.isBookmarked ? 'bookmarked' : 'unbookmarked'}`,
      data: {
        subtopicId: subtopic._id,
        isBookmarked: subtopic.isBookmarked,
      },
    });
  } catch (error) {
    console.error('Toggle bookmark error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle bookmark',
    });
  }
};

/**
 * Delete a subtopic
 * DELETE /api/documents/:documentId/subtopics/:subtopicId
 */
const deleteSubtopic = async (req, res) => {
  try {
    const { documentId, subtopicId } = req.params;
    const firebaseUID = req.user.firebaseUID;

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

    // Get and delete the subtopic
    const subtopic = await Subtopic.findById(subtopicId);
    if (!subtopic) {
      return res.status(404).json({
        success: false,
        error: 'Subtopic not found',
      });
    }

    if (subtopic.documentId.toString() !== documentId) {
      return res.status(403).json({
        success: false,
        error: 'Subtopic does not belong to this document',
      });
    }

    await Subtopic.findByIdAndDelete(subtopicId);
    console.log(`✅ Subtopic deleted: ${subtopicId}`);

    return res.status(200).json({
      success: true,
      message: 'Subtopic deleted successfully',
    });
  } catch (error) {
    console.error('Delete subtopic error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete subtopic',
    });
  }
};

module.exports = {
  getSubtopics,
  getSubtopicById,
  createSubtopic,
  detectAndSaveSubtopics,
  updateSubtopic,
  toggleBookmark,
  deleteSubtopic,
};
