/**
 * Notes Generation Controller
 * Handles generating comprehensive study notes from extracted subtopics
 * Uses parallel Gemini API calls for performance optimization
 */

const Subtopic = require('../models/Subtopic');
const SavedResult = require('../models/SavedResult');
const Document = require('../models/Document');
const { generateComprehensiveNotes, convertNotesToMarkdown } = require('../services/geminiService');

/**
 * Generate notes for a single subtopic
 * POST /api/subtopics/:subtopicId/generate-notes
 */
const generateNotesForSubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const userId = req.user.uid;

    // Fetch subtopic
    const subtopic = await Subtopic.findById(subtopicId);
    if (!subtopic) {
      return res.status(404).json({ error: 'Subtopic not found' });
    }

    // Verify user owns the document
    const document = await Document.findById(subtopic.documentId);
    if (!document || document.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log(`\n📝 Generating notes for subtopic: ${subtopic.title}`);

    // Generate comprehensive notes
    const notesResult = await generateComprehensiveNotes(
      subtopic.title,
      subtopic.description || subtopic.extractedText
    );

    // Save to SavedResult
    const savedResult = new SavedResult({
      documentId: document._id,
      subtopicId: subtopic._id,
      userId: userId,
      notesType: 'comprehensive',
      content: notesResult.notes,
      metadata: {
        generatedAt: new Date(),
        contentLength: notesResult.contentLength,
        model: 'gemini-2.5-flash-lite'
      }
    });

    await savedResult.save();

    console.log(`✅ Notes saved for subtopic: ${subtopic.title}`);

    // Convert to markdown format
    const markdownNotes = convertNotesToMarkdown(notesResult.notes);

    res.status(201).json({
      success: true,
      subtopicId: subtopic._id,
      subtopicTitle: subtopic.title,
      notes: {
        json: notesResult.notes,
        markdown: markdownNotes
      },
      savedResultId: savedResult._id,
      generatedAt: savedResult.createdAt
    });
  } catch (error) {
    console.error('❌ Error generating notes:', error.message);
    res.status(500).json({
      error: 'Failed to generate notes',
      details: error.message
    });
  }
};

/**
 * Generate notes for all subtopics in a document
 * Processes in parallel batches of 4 to optimize API usage
 * POST /api/documents/:documentId/generate-all-notes
 */
const generateNotesForAllSubtopics = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.uid;
    const BATCH_SIZE = 4; // Process 4 subtopics in parallel

    // Verify user owns the document
    const document = await Document.findById(documentId);
    if (!document || document.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Fetch all subtopics for the document
    const subtopics = await Subtopic.find({ documentId }).sort({ order: 1 });
    
    if (subtopics.length === 0) {
      return res.status(400).json({ error: 'No subtopics found for this document' });
    }

    console.log(`\n🚀 Generating notes for ${subtopics.length} subtopics (batch size: ${BATCH_SIZE})`);

    const results = [];
    const failedSubtopics = [];

    // Process subtopics in batches of 4
    for (let i = 0; i < subtopics.length; i += BATCH_SIZE) {
      const batch = subtopics.slice(i, Math.min(i + BATCH_SIZE, subtopics.length));
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(subtopics.length / BATCH_SIZE);

      console.log(`\n📦 Processing Batch ${batchNum}/${totalBatches} (${batch.length} subtopics)`);

      // Process this batch in parallel
      const batchPromises = batch.map(async (subtopic) => {
        try {
          console.log(`  ⏳ Starting: ${subtopic.title}`);

          // Generate notes
          const notesResult = await generateComprehensiveNotes(
            subtopic.title,
            subtopic.description || subtopic.extractedText
          );

          // Save to database
          const savedResult = new SavedResult({
            documentId: document._id,
            subtopicId: subtopic._id,
            userId: userId,
            notesType: 'comprehensive',
            content: notesResult.notes,
            metadata: {
              generatedAt: new Date(),
              contentLength: notesResult.contentLength,
              model: 'gemini-2.5-flash-lite',
              batchNumber: batchNum
            }
          });

          await savedResult.save();

          console.log(`  ✅ Completed: ${subtopic.title}`);

          // Convert to markdown
          const markdownNotes = convertNotesToMarkdown(notesResult.notes);

          return {
            success: true,
            subtopicId: subtopic._id,
            subtopicTitle: subtopic.title,
            savedResultId: savedResult._id,
            contentLength: notesResult.contentLength,
            notes: {
              json: notesResult.notes,
              markdown: markdownNotes
            }
          };
        } catch (error) {
          console.error(`  ❌ Failed: ${subtopic.title} - ${error.message}`);
          failedSubtopics.push({
            subtopicId: subtopic._id,
            title: subtopic.title,
            error: error.message
          });
          return null;
        }
      });

      // Wait for all promises in this batch to complete
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(r => r !== null));

      // Add delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < subtopics.length) {
        console.log(`⏸️  Waiting 2 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n✨ Notes generation complete!`);
    console.log(`📊 Summary: ${results.length}/${subtopics.length} successful`);

    res.status(200).json({
      success: true,
      documentId: document._id,
      totalSubtopics: subtopics.length,
      successCount: results.length,
      failureCount: failedSubtopics.length,
      processingTimeMs: Date.now() - req.startTime,
      results: results,
      failed: failedSubtopics.length > 0 ? failedSubtopics : undefined
    });
  } catch (error) {
    console.error('❌ Error in batch notes generation:', error.message);
    res.status(500).json({
      error: 'Failed to generate notes for document',
      details: error.message
    });
  }
};

/**
 * Retrieve generated notes for a subtopic
 * GET /api/subtopics/:subtopicId/notes
 */
const getNotesForSubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const userId = req.user.uid;

    // Fetch saved notes
    const savedResult = await SavedResult.findOne({
      subtopicId: subtopicId,
      userId: userId
    });

    if (!savedResult) {
      return res.status(404).json({ error: 'Notes not found for this subtopic' });
    }

    // Convert to markdown
    const markdownNotes = convertNotesToMarkdown(savedResult.content);

    res.status(200).json({
      success: true,
      subtopicId: subtopicId,
      notes: {
        json: savedResult.content,
        markdown: markdownNotes
      },
      generatedAt: savedResult.createdAt,
      metadata: savedResult.metadata
    });
  } catch (error) {
    console.error('❌ Error retrieving notes:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve notes',
      details: error.message
    });
  }
};

/**
 * Retrieve all notes for a document
 * GET /api/documents/:documentId/all-notes
 */
const getNotesForDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.uid;

    // Verify user owns the document
    const document = await Document.findById(documentId);
    if (!document || document.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Fetch all notes for this document
    const savedResults = await SavedResult.find({
      documentId: documentId,
      userId: userId
    }).sort({ createdAt: 1 });

    if (savedResults.length === 0) {
      return res.status(404).json({ error: 'No notes found for this document' });
    }

    // Fetch subtopic details for context
    const subtopics = await Subtopic.find({ documentId }).sort({ order: 1 });
    const subtopicMap = {};
    subtopics.forEach(st => {
      subtopicMap[st._id.toString()] = {
        title: st.title,
        order: st.order,
        confidence: st.detectionConfidence
      };
    });

    const notesWithContext = savedResults.map(result => ({
      savedResultId: result._id,
      subtopicId: result.subtopicId,
      subtopicInfo: subtopicMap[result.subtopicId.toString()],
      notes: {
        json: result.content,
        markdown: convertNotesToMarkdown(result.content)
      },
      generatedAt: result.createdAt,
      metadata: result.metadata
    }));

    res.status(200).json({
      success: true,
      documentId: documentId,
      totalNotes: notesWithContext.length,
      notes: notesWithContext
    });
  } catch (error) {
    console.error('❌ Error retrieving document notes:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve notes',
      details: error.message
    });
  }
};

module.exports = {
  generateNotesForSubtopic,
  generateNotesForAllSubtopics,
  getNotesForSubtopic,
  getNotesForDocument
};
