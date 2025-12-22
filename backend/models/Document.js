const mongoose = require('mongoose');

/**
 * Document Model
 * Stores uploaded syllabus documents and their metadata
 */
const documentSchema = new mongoose.Schema(
  {
    // Reference to User who uploaded this document
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Document metadata
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    fileName: {
      type: String,
      required: true,
    },

    // File type: pdf, image, or text
    fileType: {
      type: String,
      enum: ['pdf', 'image', 'text'],
      required: true,
    },

    // File size in bytes
    fileSize: {
      type: Number,
      required: true,
    },

    // Google Cloud Storage path where file is stored
    gcsPath: {
      type: String,
      required: true,
      unique: true,
    },

    // Extracted text from the file
    originalText: {
      type: String,
      required: true,
    },

    // Word count for quick reference
    wordCount: {
      type: Number,
      default: 0,
    },

    // Processing status
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
      index: true,
    },

    // Error message if processing failed
    errorMessage: {
      type: String,
      default: null,
    },

    // Extraction metadata
    extractionDetails: {
      method: {
        type: String,
        enum: ['pdf-parse', 'tesseract-ocr', 'text-read'],
        default: null,
      },
      duration: Number, // milliseconds
      confidence: Number, // OCR confidence score (0-100)
    },

    // Tags for categorization
    tags: {
      type: [String],
      default: [],
    },

    // Whether document is marked for deletion
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Timestamps
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'documents',
  }
);

// Update updatedAt before saving
documentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for finding user's documents efficiently
documentSchema.index({ userId: 1, uploadedAt: -1 });

// Index for finding documents by status
documentSchema.index({ userId: 1, status: 1 });

// Method to calculate word count
documentSchema.methods.calculateWordCount = function () {
  this.wordCount = this.originalText.split(/\s+/).length;
  return this.wordCount;
};

// Method to mark as completed
documentSchema.methods.markAsCompleted = function () {
  this.status = 'completed';
  this.updatedAt = Date.now();
  return this.save();
};

// Method to mark as failed with error
documentSchema.methods.markAsFailed = function (error) {
  this.status = 'failed';
  this.errorMessage = error;
  this.updatedAt = Date.now();
  return this.save();
};

// Method to get document summary
documentSchema.methods.getSummary = function () {
  return {
    _id: this._id,
    title: this.title,
    fileName: this.fileName,
    fileType: this.fileType,
    fileSize: this.fileSize,
    wordCount: this.wordCount,
    status: this.status,
    uploadedAt: this.uploadedAt,
  };
};

module.exports = mongoose.model('Document', documentSchema);
