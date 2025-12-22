const mongoose = require('mongoose');

/**
 * SavedResult Model
 * Stores generated study notes from Gemini API for user access later
 */
const savedResultSchema = new mongoose.Schema(
  {
    // Reference to User who saved this result
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Reference to Subtopic that was processed
    subtopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subtopic',
      required: true,
      index: true,
    },

    // Gemini generated study notes
    geminiResponse: {
      type: String,
      required: true,
    },

    // Prompt used for Gemini (for reference/debugging)
    prompt: {
      type: String,
      required: true,
    },

    // Model and parameters used
    generationDetails: {
      model: {
        type: String,
        default: 'gemini-1.5-flash',
      },
      temperature: {
        type: Number,
        default: 0.7,
      },
      maxTokens: {
        type: Number,
        default: 2000,
      },
      duration: Number, // API call duration in ms
    },

    // User's custom tags for organization
    tags: {
      type: [String],
      default: [],
      index: true,
    },

    // Whether user marked as favorite
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },

    // User's additional notes on top of Gemini response
    customNotes: {
      type: String,
      default: '',
    },

    // Rating given by user (1-5)
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    // User feedback/comments
    feedback: {
      type: String,
      default: '',
    },

    // Whether this result was helpful (for ML training)
    isHelpful: {
      type: Boolean,
      default: null,
    },

    // View count
    viewCount: {
      type: Number,
      default: 0,
    },

    // Search keywords extracted from content
    keywords: {
      type: [String],
      default: [],
    },

    // Timestamps
    savedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    lastViewed: {
      type: Date,
      default: null,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'saved_results',
  }
);

// Update updatedAt before saving
savedResultSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for finding user's saved results efficiently
savedResultSchema.index({ userId: 1, savedAt: -1 });

// Index for finding favorites
savedResultSchema.index({ userId: 1, isFavorite: 1 });

// Index for tag-based search
savedResultSchema.index({ userId: 1, tags: 1 });

// Compound index for user searches with filters
savedResultSchema.index({ userId: 1, isFavorite: 1, savedAt: -1 });

// Method to toggle favorite status
savedResultSchema.methods.toggleFavorite = function () {
  this.isFavorite = !this.isFavorite;
  this.updatedAt = Date.now();
  return this.save();
};

// Method to increment view count
savedResultSchema.methods.recordView = function () {
  this.viewCount += 1;
  this.lastViewed = Date.now();
  return this.save();
};

// Method to add/update rating
savedResultSchema.methods.setRating = function (rating) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  this.rating = rating;
  this.updatedAt = Date.now();
  return this.save();
};

// Method to mark as helpful/unhelpful
savedResultSchema.methods.setHelpful = function (isHelpful) {
  this.isHelpful = isHelpful;
  this.updatedAt = Date.now();
  return this.save();
};

// Method to extract keywords from response
savedResultSchema.methods.extractKeywords = function (wordLimit = 10) {
  // Simple keyword extraction: split by common words and get most frequent
  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
    'may', 'might', 'must', 'can', 'it', 'this', 'that', 'these', 'those',
  ]);

  const words = this.geminiResponse
    .toLowerCase()
    .match(/\b\w+\b/g)
    .filter((word) => !stopwords.has(word) && word.length > 3);

  const freq = {};
  words.forEach((word) => {
    freq[word] = (freq[word] || 0) + 1;
  });

  this.keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, wordLimit)
    .map(([word]) => word);

  return this.keywords;
};

// Method to get summary
savedResultSchema.methods.getSummary = function () {
  return {
    _id: this._id,
    subtopicId: this.subtopicId,
    isFavorite: this.isFavorite,
    rating: this.rating,
    viewCount: this.viewCount,
    tags: this.tags,
    savedAt: this.savedAt,
  };
};

module.exports = mongoose.model('SavedResult', savedResultSchema);
