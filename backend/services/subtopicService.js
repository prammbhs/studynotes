/**
 * Subtopic Detection Service
 * Analyzes extracted text and identifies distinct subtopics/sections
 * Uses pattern-based detection - NO API calls (free tier compatible)
 */

/**
 * Detect subtopics from extracted text using pattern matching
 * @param {string} text - The extracted text from document
 * @param {string} fileName - Original file name for context
 * @returns {Promise<Array>} Array of detected subtopics with content
 */
const detectSubtopics = async (text) => {
  try {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const subtopics = [];
    let currentOrder = 0;

    // Strategy 1: Markdown-style headings (# ## ###)
    const markdownHeadings = extractMarkdownHeadings(text);
    if (markdownHeadings.length > 0) {
      markdownHeadings.forEach((heading) => {
        subtopics.push({
          order: currentOrder++,
          title: heading.title,
          description: heading.description,
          extractedText: heading.content,
          detectionMethod: 'markdown-headings',
          confidence: 0.95,
        });
      });
      return subtopics;
    }

    // Strategy 2: Numbered sections (1. 2. 3. or 1.1 1.2 etc)
    const numberedSections = extractNumberedSections(text);
    if (numberedSections.length > 0) {
      numberedSections.forEach((section) => {
        subtopics.push({
          order: currentOrder++,
          title: section.title,
          description: section.description,
          extractedText: section.content,
          detectionMethod: 'numbered-sections',
          confidence: 0.9,
        });
      });
      return subtopics;
    }

    // Strategy 3: All-caps headings (CHAPTER 1, MODULE 1, etc)
    const allCapsSections = extractAllCapsHeadings(text);
    if (allCapsSections.length > 0) {
      allCapsSections.forEach((section) => {
        subtopics.push({
          order: currentOrder++,
          title: section.title,
          description: section.description,
          extractedText: section.content,
          detectionMethod: 'allcaps-headings',
          confidence: 0.85,
        });
      });
      return subtopics;
    }

    // Strategy 4: Bullet point sections (lines starting with - or *)
    const bulletSections = extractBulletSections(text);
    if (bulletSections.length > 0) {
      bulletSections.forEach((section) => {
        subtopics.push({
          order: currentOrder++,
          title: section.title,
          description: section.description,
          extractedText: section.content,
          detectionMethod: 'bullet-sections',
          confidence: 0.7,
        });
      });
      return subtopics;
    }

    // Strategy 5: Fallback - Split into equal chunks if no structure detected
    const chunkSections = extractChunkSections(text);
    chunkSections.forEach((section) => {
      subtopics.push({
        order: currentOrder++,
        title: section.title,
        description: section.description,
        extractedText: section.content,
        detectionMethod: 'chunk-fallback',
        confidence: 0.5,
      });
    });

    return subtopics;
  } catch (error) {
    console.error('Error detecting subtopics:', error.message);
    throw new Error(`Failed to detect subtopics: ${error.message}`);
  }
};

/**
 * Extract markdown-style headings (# ## ###)
 */
function extractMarkdownHeadings(text) {
  const subtopics = [];
  const lines = text.split('\n');
  let currentHeading = null;
  let currentContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (headingMatch) {
      // Save previous heading if exists
      if (currentHeading) {
        subtopics.push({
          title: currentHeading,
          description: generateDescription(currentContent.join('\n')),
          content: currentContent.join('\n').trim(),
        });
      }

      // Start new heading (only top 3 levels)
      currentHeading = headingMatch[2].trim();
      currentContent = [];
    } else if (currentHeading) {
      // Collect content under current heading
      currentContent.push(line);
    }
  }

  // Add last heading
  if (currentHeading && currentContent.length > 0) {
    subtopics.push({
      title: currentHeading,
      description: generateDescription(currentContent.join('\n')),
      content: currentContent.join('\n').trim(),
    });
  }

  return subtopics.filter((s) => s.content.trim().length > 20); // Min 20 chars
}

/**
 * Extract numbered sections (1. 2. 3. or 1.1 1.2 etc)
 */
function extractNumberedSections(text) {
  const subtopics = [];
  const lines = text.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match: 1. Title or 1.1 Title or 1.1.1 Title
    const numberMatch = line.match(/^(\d+(?:\.\d+)*)\.\s+(.+)$/);

    if (numberMatch && numberMatch[1].split('.').length <= 2) {
      // Only capture first 2 levels (1. and 1.1)
      if (currentSection) {
        subtopics.push({
          title: currentSection,
          description: generateDescription(currentContent.join('\n')),
          content: currentContent.join('\n').trim(),
        });
      }

      currentSection = numberMatch[2].trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Add last section
  if (currentSection && currentContent.length > 0) {
    subtopics.push({
      title: currentSection,
      description: generateDescription(currentContent.join('\n')),
      content: currentContent.join('\n').trim(),
    });
  }

  return subtopics.filter((s) => s.content.trim().length > 20);
}

/**
 * Extract ALL-CAPS headings (CHAPTER 1, MODULE 1, etc)
 */
function extractAllCapsHeadings(text) {
  const subtopics = [];
  const lines = text.split('\n');
  let currentHeading = null;
  let currentContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match all-caps lines with optional numbers
    if (
      line.length > 3 &&
      /^[A-Z0-9\s\-:]+$/.test(line) &&
      line.split(/\s+/).length <= 5
    ) {
      // Likely a heading
      if (currentHeading) {
        subtopics.push({
          title: currentHeading,
          description: generateDescription(currentContent.join('\n')),
          content: currentContent.join('\n').trim(),
        });
      }

      currentHeading = line;
      currentContent = [];
    } else if (currentHeading && line.length > 0) {
      currentContent.push(line);
    }
  }

  // Add last heading
  if (currentHeading && currentContent.length > 0) {
    subtopics.push({
      title: currentHeading,
      description: generateDescription(currentContent.join('\n')),
      content: currentContent.join('\n').trim(),
    });
  }

  return subtopics.filter((s) => s.content.trim().length > 20);
}

/**
 * Extract bullet point sections
 */
function extractBulletSections(text) {
  const subtopics = [];
  const lines = text.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if line is NOT a bullet point and has content
    if (
      trimmed.length > 0 &&
      !trimmed.match(/^[\-\*•]\s/) &&
      currentSection === null &&
      !line.startsWith(' ')
    ) {
      // This could be a section header
      currentSection = trimmed;
      currentContent = [];
    } else if (currentSection && trimmed.match(/^[\-\*•]\s/)) {
      // This is a bullet under current section
      currentContent.push(trimmed);
    } else if (currentSection && trimmed.length === 0 && currentContent.length > 0) {
      // Empty line after bullets = end of section
      subtopics.push({
        title: currentSection,
        description: generateDescription(currentContent.join('\n')),
        content: currentContent.join('\n').trim(),
      });
      currentSection = null;
      currentContent = [];
    }
  }

  // Add last section
  if (currentSection && currentContent.length > 0) {
    subtopics.push({
      title: currentSection,
      description: generateDescription(currentContent.join('\n')),
      content: currentContent.join('\n').trim(),
    });
  }

  return subtopics.filter((s) => s.content.trim().length > 20);
}

/**
 * Fallback: Split text into equal chunks if no structure detected
 */
function extractChunkSections(text) {
  const subtopics = [];
  const chunkSize = 500; // characters per chunk
  const chunks = text.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];

  chunks.forEach((chunk, index) => {
    const firstLine = chunk.split('\n')[0].substring(0, 50) || `Section ${index + 1}`;
    subtopics.push({
      title: firstLine,
      description: generateDescription(chunk),
      content: chunk.trim(),
    });
  });

  return subtopics;
}

/**
 * Generate a description from content (first 150 chars or first sentence)
 */
function generateDescription(content) {
  if (!content) return '';

  const trimmed = content.trim();

  // Try to get first sentence
  const sentenceMatch = trimmed.match(/^[^.!?]*[.!?]/);
  if (sentenceMatch) {
    return sentenceMatch[0].substring(0, 150);
  }

  // Fallback: first 150 characters
  return trimmed.substring(0, 150) + (trimmed.length > 150 ? '...' : '');
}

/**
 * Calculate word count for content
 */
const calculateWordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
};

/**
 * Validate and clean subtopic data
 */
const validateSubtopic = (subtopic) => {
  return (
    subtopic.title &&
    subtopic.title.trim().length > 0 &&
    subtopic.extractedText &&
    subtopic.extractedText.trim().length > 20
  );
};

module.exports = {
  detectSubtopics,
  calculateWordCount,
  validateSubtopic,
};
