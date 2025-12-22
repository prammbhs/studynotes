const mongoose = require('mongoose');

/**
 * Subtopic Model
 * Stores identified subtopics/chapters extracted from documents
 */
const subtopicSchema = new mongoose.Schema(
  {
    // Reference to parent Document
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },

    // Subtopic title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    // Brief description of subtopic
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },

    // Order/sequence of subtopic in document
    order: {
      type: Number,
      required: true,
    },

    // Page numbers where this subtopic appears (if applicable)
    pageNumbers: {
      start: Number,
      end: Number,
    },

    // Extracted text content for this subtopic
    extractedText: {
      type: String,
      required: true,
    },

    // Word count of this subtopic
    wordCount: {
      type: Number,
      default: 0,
    },

    // Confidence score for subtopic detection (0-100)
    detectionConfidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },

    // Gemini API processing status
    geminiStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },

    // Tags for quick categorization
    tags: {
      type: [String],
      default: [],
    },

    // User's custom notes for this subtopic
    userNotes: {
      type: String,
      default: '',
    },

    // Whether user bookmarked this subtopic
    isBookmarked: {
      type: Boolean,
      default: false,
    },

    // Timestamps
    createdAt: {
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
    collection: 'subtopics',
  }
);

// Update updatedAt before saving
subtopicSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for finding subtopics by document in order
subtopicSchema.index({ documentId: 1, order: 1 });

// Index for finding bookmarked subtopics efficiently
subtopicSchema.index({ documentId: 1, isBookmarked: 1 });

// Index for finding subtopics needing Gemini processing
subtopicSchema.index({ geminiStatus: 1 });

// Method to calculate word count
subtopicSchema.methods.calculateWordCount = function () {
  this.wordCount = this.extractedText.split(/\s+/).length;
  return this.wordCount;
};

// Method to update Gemini processing status
subtopicSchema.methods.updateGeminiStatus = function (status) {
  const validStatuses = ['pending', 'processing', 'completed', 'failed'];
  if (validStatuses.includes(status)) {
    this.geminiStatus = status;
    this.updatedAt = Date.now();
    return this.save();
  }
  throw new Error(`Invalid status: ${status}`);
};

// Method to toggle bookmark
subtopicSchema.methods.toggleBookmark = function () {
  this.isBookmarked = !this.isBookmarked;
  this.updatedAt = Date.now();
  return this.save();
};

// Method to get summary
subtopicSchema.methods.getSummary = function () {
  return {
    _id: this._id,
    documentId: this.documentId,
    title: this.title,
    order: this.order,
    wordCount: this.wordCount,
    geminiStatus: this.geminiStatus,
    isBookmarked: this.isBookmarked,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Subtopic', subtopicSchema);
