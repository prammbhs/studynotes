/**
 * Main Express Server Entry Point
 * Initializes all middleware, configurations, and route handlers
 */

require('dotenv').config();
require('express-async-errors'); // Enable async/await error handling
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import configuration modules
const { connectDatabase } = require('./config/database');
const { initializeGCS } = require('./config/gcs');
require('./config/firebase'); // Firebase initializes automatically on import

// Initialize Express app
const app = express();

// ============================================
// ENVIRONMENT VARIABLES VALIDATION
// ============================================
const requiredEnvVars = [
  'MONGODB_URI',
  'GCP_PROJECT_ID',
  'GCS_BUCKET_NAME',
  'FIREBASE_PROJECT_ID',
  'GEMINI_API_KEY',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet: Set security HTTP headers
app.use(helmet());

// CORS: Cross-Origin Resource Sharing
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================

// Parse JSON request bodies
app.use(express.json({ limit: '15mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// ============================================
// LOGGING MIDDLEWARE
// ============================================

// Morgan: HTTP request logger
// Log format: Combined (standard Apache combined log output)
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'));

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API ROUTES
// ============================================

// Authentication routes
app.use('/api/auth', require('./routes/authRoutes'));

// Document routes (Step 4: File Upload & GCS)
const documentRoutes = require('./routes/documentRoutes');
app.use('/api/documents', documentRoutes);

// Subtopic routes (Step 5: Subtopic Identification)
const subtopicRoutes = require('./routes/subtopicRoutes');
app.use('/api/documents/:documentId/subtopics', subtopicRoutes);

// Gemini Subtopic routes (Step 6: AI-Powered Extraction)
const geminiSubtopicRoutes = require('./routes/geminiSubtopicRoutes');
app.use('/api/documents/:documentId/subtopics', geminiSubtopicRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

/**
 * 404 Not Found Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

/**
 * Global Error Handler
 * Handles all errors thrown in the application
 */
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] Error:`, {
    status,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// SERVER INITIALIZATION
// ============================================

const PORT = process.env.PORT || 5000;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    console.log('🚀 Starting StudyNotes Backend Server...\n');

    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await connectDatabase();
    console.log('✅ MongoDB connected\n');

    // Initialize Google Cloud Storage
    console.log('☁️  Initializing Google Cloud Storage...');
    initializeGCS();
    console.log('✅ GCS initialized\n');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n✨ Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏠 API Health Check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  try {
    const { disconnectDatabase } = require('./config/database');
    await disconnectDatabase();
    console.log('✅ Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error.message);
    process.exit(1);
  }
});

// Start the server
startServer();

module.exports = app;
