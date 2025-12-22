/**
 * File Processing Utilities
 * Handles text extraction from PDFs, images (OCR), and text files
 */

const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

/**
 * Extract text from PDF buffer
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Promise<{text: string, pages: number, metadata: object}>}
 */
const extractTextFromPDF = async (fileBuffer) => {
  try {
    console.log('🔄 Extracting text from PDF...');
    
    const data = await pdfParse(fileBuffer);
    
    const extractedData = {
      text: data.text,
      pages: data.numpages,
      metadata: {
        title: data.info?.Title || 'Unknown',
        author: data.info?.Author || 'Unknown',
        creationDate: data.info?.CreationDate || null,
      },
      wordCount: data.text.split(/\s+/).length,
    };

    console.log(`✅ PDF extraction complete: ${data.numpages} pages, ${extractedData.wordCount} words`);
    return extractedData;
  } catch (error) {
    console.error('❌ PDF extraction error:', error.message);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
};

/**
 * Extract text from image using OCR (Tesseract.js)
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<{text: string, confidence: number}>}
 */
const extractTextFromImage = async (fileBuffer, mimeType) => {
  try {
    console.log('🔄 Extracting text from image using OCR...');

    // Convert buffer to base64 for Tesseract
    const base64Image = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    const result = await Tesseract.recognize(base64Image, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
        }
      },
    });

    const extractedData = {
      text: result.data.text,
      confidence: result.data.confidence || 0,
      wordCount: result.data.text.split(/\s+/).length,
    };

    console.log(`✅ OCR extraction complete: Confidence ${extractedData.confidence}%, ${extractedData.wordCount} words`);
    return extractedData;
  } catch (error) {
    console.error('❌ OCR extraction error:', error.message);
    throw new Error(`Failed to extract image text: ${error.message}`);
  }
};

/**
 * Read text from plain text file
 * @param {Buffer} fileBuffer - Text file buffer
 * @returns {Promise<{text: string}>}
 */
const readTextFile = async (fileBuffer) => {
  try {
    console.log('🔄 Reading text file...');

    const text = fileBuffer.toString('utf-8');
    const wordCount = text.split(/\s+/).length;

    const extractedData = {
      text: text,
      wordCount: wordCount,
    };

    console.log(`✅ Text file read complete: ${wordCount} words`);
    return extractedData;
  } catch (error) {
    console.error('❌ Text file read error:', error.message);
    throw new Error(`Failed to read text file: ${error.message}`);
  }
};

/**
 * Clean and normalize extracted text
 * Removes extra whitespace, fixes encoding issues, standardizes formatting
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
const cleanAndNormalizeText = (text) => {
  if (!text) return '';

  // Remove multiple consecutive newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  // Remove multiple spaces
  text = text.replace(/[ ]{2,}/g, ' ');

  // Fix common encoding issues
  text = text.replace(/[\t\r]/g, ' ');

  // Trim whitespace from lines
  text = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

  // Normalize quotes
  text = text.replace(/[""]/g, '"').replace(/['']/g, "'");

  return text.trim();
};

/**
 * Extract and process file based on MIME type
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original filename
 * @param {string} mimeType - MIME type of file
 * @returns {Promise<{text: string, wordCount: number, metadata: object}>}
 */
const extractTextFromFile = async (fileBuffer, fileName, mimeType) => {
  try {
    console.log(`📄 Processing file: ${fileName} (${mimeType})`);

    let extractedData;

    if (mimeType === 'application/pdf') {
      extractedData = await extractTextFromPDF(fileBuffer);
    } else if (mimeType.startsWith('image/')) {
      extractedData = await extractTextFromImage(fileBuffer, mimeType);
    } else if (mimeType === 'text/plain') {
      extractedData = await readTextFile(fileBuffer);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Clean and normalize extracted text
    extractedData.text = cleanAndNormalizeText(extractedData.text);

    // Ensure word count is accurate after cleaning
    extractedData.wordCount = extractedData.text.split(/\s+/).filter((w) => w.length > 0).length;

    console.log(`✨ Text processing complete: ${extractedData.wordCount} words`);
    return extractedData;
  } catch (error) {
    console.error('❌ File processing error:', error.message);
    throw error;
  }
};

module.exports = {
  extractTextFromPDF,
  extractTextFromImage,
  readTextFile,
  cleanAndNormalizeText,
  extractTextFromFile,
};
