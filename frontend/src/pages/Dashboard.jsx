import React, { useState, useEffect } from 'react';
import { documentAPI, subtopicAPI, notesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await documentAPI.getUserDocuments();
      setDocuments(response.data || []);
    } catch (err) {
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await documentAPI.uploadDocument(formData);
      setSuccess('Document uploaded successfully!');
      setDocuments([...documents, response.data]);
      e.target.value = '';

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleExtractWithGemini = async (documentId) => {
    try {
      setError('');
      setSuccess('');
      setProcessingId(documentId);

      const response = await subtopicAPI.extractWithGemini(documentId);
      setSuccess('Subtopics extracted successfully!');
      
      // Update the document with subtopics
      setDocuments(documents.map(doc =>
        doc.id === documentId
          ? { ...doc, subtopics: response.data }
          : doc
      ));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Extraction failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateNotes = async (documentId) => {
    try {
      setError('');
      setSuccess('');
      setProcessingId(documentId);

      const response = await notesAPI.generateNotesForAllSubtopics(documentId);
      setSuccess('Notes generated successfully!');
      
      // Update the document with notes
      setDocuments(documents.map(doc =>
        doc.id === documentId
          ? { ...doc, notes: response.data }
          : doc
      ));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Note generation failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      setError('');
      setSuccess('');
      await documentAPI.deleteDocument(documentId);
      setDocuments(documents.filter(doc => doc.id !== documentId));
      setSuccess('Document deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await documentAPI.getDownloadUrl(documentId);
      const url = response.data.downloadUrl;
      window.open(url, '_blank');
    } catch (err) {
      setError('Failed to get download URL');
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>📖 My Documents</h1>
          <p>Upload, extract, and generate notes from your study materials</p>
        </div>

        {error && (
          <div className="alert alert-error mb-3">
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-3">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
          </div>
        )}

        <div className="upload-section card mb-4">
          <h2>Upload Document</h2>
          <p>Supported formats: PDF, DOCX, TXT, Images (PNG, JPG, JPEG)</p>
          <div className="upload-area">
            <input
              type="file"
              id="fileInput"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            />
            <label htmlFor="fileInput" className="upload-label">
              {uploading ? 'Uploading...' : '📁 Click or drag to upload'}
            </label>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner fullPage />
        ) : documents.length === 0 ? (
          <div className="empty-state card">
            <p>No documents yet. Upload your first study material to get started!</p>
          </div>
        ) : (
          <div className="documents-grid">
            {documents.map((doc) => (
              <div key={doc.id} className="document-card card">
                <div className="doc-header">
                  <h3>📄 {doc.name || 'Untitled'}</h3>
                  <span className="doc-date">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="doc-type">Type: {doc.type || 'Unknown'}</p>

                <div className="doc-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleExtractWithGemini(doc.id)}
                    disabled={processingId === doc.id}
                  >
                    {processingId === doc.id ? (
                      <>
                        <LoadingSpinner /> Extracting...
                      </>
                    ) : (
                      '✨ Extract Subtopics'
                    )}
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => handleGenerateNotes(doc.id)}
                    disabled={processingId === doc.id}
                  >
                    {processingId === doc.id ? (
                      <>
                        <LoadingSpinner /> Generating...
                      </>
                    ) : (
                      '📝 Generate Notes'
                    )}
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() => handleDownload(doc.id)}
                  >
                    ⬇️ Download
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>

                {doc.subtopics && (
                  <div className="doc-subtopics mt-2">
                    <h4>Subtopics Extracted:</h4>
                    <ul>
                      {doc.subtopics.slice(0, 3).map((sub, idx) => (
                        <li key={idx}>{sub}</li>
                      ))}
                      {doc.subtopics.length > 3 && (
                        <li>... and {doc.subtopics.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {doc.notes && (
                  <div className="doc-notes mt-2">
                    <h4>📚 Notes Available</h4>
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedDocument(doc.id)}
                    >
                      View Notes
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
