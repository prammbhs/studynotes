/**
 * Upload Middleware for File Handling
 * Configures multer for file upload with validation and temporary storage
 */

const multer = require('multer');
const path = require('path');

// Configure multer for in-memory storage (files uploaded directly to GCS)
const storage = multer.memoryStorage();

// File filter - validate file types
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimes = [
    'application/pdf',           // PDF files
    'image/jpeg',                // JPEG images
    'image/png',                 // PNG images
    'image/webp',                // WebP images
    'text/plain',                // Text files
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: PDF, JPEG, PNG, WebP, TXT`));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 15 * 1024 * 1024, // 15MB default
  },
});

/**
 * Single file upload middleware
 * Usage: router.post('/upload', uploadMiddleware.single('file'), controller)
 */
const uploadSingle = upload.single('file');

/**
 * Multiple file upload middleware
 * Usage: router.post('/upload-multiple', uploadMiddleware.multiple('files'), controller)
 */
const uploadMultiple = upload.array('files', 10); // Max 10 files per request

/**
 * Custom middleware to validate file presence
 */
const validateFilePresence = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }
  next();
};

/**
 * Custom middleware to log file upload details
 */
const logFileUpload = (req, res, next) => {
  if (req.file) {
    console.log(`📁 File uploaded: ${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`);
  }
  if (req.files) {
    console.log(`📁 ${req.files.length} files uploaded`);
  }
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  validateFilePresence,
  logFileUpload,
};
