/**
 * Document Controller
 * Handles document upload, retrieval, deletion, and subtopic management
 */

const Document = require('../models/Document');
const User = require('../models/User');
const { uploadFile, deleteFile, generateSignedUrl } = require('../config/gcs');
const { extractTextFromFile } = require('../utils/fileProcessor');

/**
 * Upload document (file) to GCS and create document record
 * POST /api/documents/upload
 * Requires: Authorization Bearer token, multipart file
 */
const uploadDocument = async (req, res) => {
  try {
    const firebaseUID = req.user.firebaseUID;
    
    // Validate file presence
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    console.log(`📤 Starting file upload for user: ${firebaseUID}`);
    console.log(`📄 File: ${req.file.originalname} (${req.file.size} bytes)`);

    // Get user's MongoDB ID from Firebase UID
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Extract text from file
    const extractionResult = await extractTextFromFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Determine file type (pdf, image, or text)
    let fileType = 'text';
    if (req.file.mimetype === 'application/pdf') {
      fileType = 'pdf';
    } else if (req.file.mimetype.startsWith('image/')) {
      fileType = 'image';
    }

    // Determine extraction method
    let extractionMethod = 'text-read';
    if (req.file.mimetype === 'application/pdf') {
      extractionMethod = 'pdf-parse';
    } else if (req.file.mimetype.startsWith('image/')) {
      extractionMethod = 'tesseract-ocr';
    }

    // Create a temporary document ID for organizing uploads
    const tempDocId = Date.now().toString();
    
    // Upload file to GCS
    console.log(`☁️  Uploading to GCS...`);
    const gcsPath = await uploadFile(req.file.buffer, req.file.originalname, user._id, tempDocId);
    console.log(`✅ File uploaded to GCS: ${gcsPath}`);

    // Create document record in MongoDB
    const document = new Document({
      userId: user._id,
      title: req.file.originalname.split('.')[0], // Remove extension
      fileName: req.file.originalname,
      fileType: fileType,
      fileSize: req.file.size,
      gcsPath: gcsPath,
      originalText: extractionResult.text,
      wordCount: extractionResult.wordCount,
      status: 'completed',
      extractionDetails: {
        method: extractionMethod,
        duration: 0, // Could measure actual duration if needed
        confidence: extractionResult.confidence || null,
      },
      uploadedAt: new Date(),
    });

    await document.save();
    console.log(`✅ Document record created: ${document._id}`);

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        documentId: document._id,
        title: document.title,
        fileName: document.fileName,
        fileSize: document.fileSize,
        status: document.status,
        wordCount: extractionResult.wordCount,
        uploadedAt: document.uploadedAt,
        extractionDetails: document.extractionDetails,
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload document',
    });
  }
};

/**
 * Get all documents for authenticated user
 * GET /api/documents
 */
const getUserDocuments = async (req, res) => {
  try {
    const firebaseUID = req.user.firebaseUID;

    // Get user's MongoDB ID from Firebase UID
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const documents = await Document.find({ userId: user._id })
      .sort({ uploadedAt: -1 })
      .select('_id title fileName fileSize status uploadedAt extractionDetails');

    return res.status(200).json({
      success: true,
      data: {
        count: documents.length,
        documents: documents,
      },
    });
  } catch (error) {
    console.error('Get documents error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve documents',
    });
  }
};

/**
 * Get document details by ID
 * GET /api/documents/:documentId
 */
const getDocumentById = async (req, res) => {
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

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Verify ownership - compare MongoDB ObjectIds
    if (document.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this document',
      });
    }

    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Get document error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve document',
    });
  }
};

/**
 * Delete document by ID
 * DELETE /api/documents/:documentId
 */
const deleteDocument = async (req, res) => {
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

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Verify ownership - compare MongoDB ObjectIds
    if (document.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this document',
      });
    }

    // Delete file from GCS
    console.log(`🗑️  Deleting from GCS: ${document.gcsPath}`);
    await deleteFile(document.gcsPath);

    // Delete document record
    await Document.findByIdAndDelete(documentId);
    console.log(`✅ Document deleted: ${documentId}`);

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete document error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete document',
    });
  }
};

/**
 * Get document text content
 * GET /api/documents/:documentId/text
 */
const getDocumentText = async (req, res) => {
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

    const document = await Document.findById(documentId).select('userId title originalText extractionDetails');

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Verify ownership - compare MongoDB ObjectIds
    if (document.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this document',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        text: document.originalText,
        wordCount: document.extractionDetails?.wordCount || 0,
      },
    });
  } catch (error) {
    console.error('Get document text error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve document text',
    });
  }
};

/**
 * Get download URL for document
 * GET /api/documents/:documentId/download-url
 */
const getDownloadUrl = async (req, res) => {
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

    const document = await Document.findById(documentId).select('userId gcsPath fileName');

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Verify ownership - compare MongoDB ObjectIds
    if (document.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this document',
      });
    }

    // Generate signed URL (valid for 1 hour)
    console.log(`🔗 Generating download URL for: ${document.gcsPath}`);
    const downloadUrl = await generateSignedUrl(document.gcsPath, 1);

    return res.status(200).json({
      success: true,
      data: {
        downloadUrl: downloadUrl,
        fileName: document.fileName,
        expiresIn: 3600, // seconds
      },
    });
  } catch (error) {
    console.error('Get download URL error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate download URL',
    });
  }
};

module.exports = {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
  getDocumentText,
  getDownloadUrl,
};
