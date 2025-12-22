const { Storage } = require('@google-cloud/storage');

/**
 * Initialize Google Cloud Storage client
 * Reads GCP credentials from environment variables
 */
let storageClient = null;

const initializeGCS = () => {
  try {
    if (storageClient) {
      return storageClient;
    }

    // Create storage client with credentials from environment
    storageClient = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
    });

    console.log('Google Cloud Storage client initialized successfully');
    return storageClient;
  } catch (error) {
    console.error('Error initializing GCS client:', error.message);
    throw new Error('Failed to initialize Google Cloud Storage. Check your GCP credentials.');
  }
};

/**
 * Get GCS Storage instance
 * @returns {Storage} Google Cloud Storage instance
 */
const getStorage = () => {
  if (!storageClient) {
    initializeGCS();
  }
  return storageClient;
};

/**
 * Get reference to the documents bucket
 * @returns {Bucket} GCS Bucket instance
 */
const getBucket = () => {
  const storage = getStorage();
  return storage.bucket(process.env.GCS_BUCKET_NAME);
};

/**
 * Upload file to GCS
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} fileName - Name of the file
 * @param {string} userId - User ID for organizing files
 * @param {string} documentId - Document ID for organizing files
 * @returns {Promise<string>} Full path of uploaded file in GCS
 */
const uploadFile = async (fileBuffer, fileName, userId, documentId) => {
  try {
    const bucket = getBucket();
    const timestamp = Date.now();
    const filePath = `${process.env.GCS_UPLOAD_FOLDER}/${userId}/${documentId}/${timestamp}-${fileName}`;

    const file = bucket.file(filePath);

    await file.save(fileBuffer, {
      metadata: {
        contentType: 'application/octet-stream',
        customMetadata: {
          userId,
          documentId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`File uploaded successfully: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error uploading file to GCS:', error.message);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Delete file from GCS
 * @param {string} filePath - Full path of file in GCS
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
  try {
    const bucket = getBucket();
    const file = bucket.file(filePath);

    await file.delete();
    console.log(`File deleted successfully: ${filePath}`);
  } catch (error) {
    // File might already be deleted, don't throw error
    console.warn(`Warning deleting file from GCS: ${error.message}`);
  }
};

/**
 * Generate signed URL for temporary file access
 * @param {string} filePath - Full path of file in GCS
 * @param {number} expirationHours - URL expiration time in hours (default: 1)
 * @returns {Promise<string>} Signed URL for file access
 */
const generateSignedUrl = async (filePath, expirationHours = 1) => {
  try {
    const bucket = getBucket();
    const file = bucket.file(filePath);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expirationHours * 60 * 60 * 1000,
    });

    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error.message);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

/**
 * Get file from GCS as buffer
 * @param {string} filePath - Full path of file in GCS
 * @returns {Promise<Buffer>} File content as buffer
 */
const getFileBuffer = async (filePath) => {
  try {
    const bucket = getBucket();
    const file = bucket.file(filePath);

    const [contents] = await file.download();
    return contents;
  } catch (error) {
    console.error('Error downloading file from GCS:', error.message);
    throw new Error(`Failed to download file: ${error.message}`);
  }
};

/**
 * Get file stream from GCS (useful for large files)
 * @param {string} filePath - Full path of file in GCS
 * @returns {Stream} Readable stream of file content
 */
const getFileStream = (filePath) => {
  try {
    const bucket = getBucket();
    const file = bucket.file(filePath);
    return file.createReadStream();
  } catch (error) {
    console.error('Error creating file stream:', error.message);
    throw new Error(`Failed to create file stream: ${error.message}`);
  }
};

/**
 * List all files in user's directory
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of file metadata
 */
const listUserFiles = async (userId) => {
  try {
    const bucket = getBucket();
    const prefix = `${process.env.GCS_UPLOAD_FOLDER}/${userId}/`;

    const [files] = await bucket.getFiles({ prefix });

    return files.map((file) => ({
      name: file.name,
      size: file.metadata.size,
      created: file.metadata.timeCreated,
      updated: file.metadata.updated,
    }));
  } catch (error) {
    console.error('Error listing files:', error.message);
    throw new Error(`Failed to list files: ${error.message}`);
  }
};

/**
 * Check if file exists in GCS
 * @param {string} filePath - Full path of file in GCS
 * @returns {Promise<boolean>} True if file exists
 */
const fileExists = async (filePath) => {
  try {
    const bucket = getBucket();
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    console.error('Error checking file existence:', error.message);
    return false;
  }
};

module.exports = {
  initializeGCS,
  getStorage,
  getBucket,
  uploadFile,
  deleteFile,
  generateSignedUrl,
  getFileBuffer,
  getFileStream,
  listUserFiles,
  fileExists,
};
