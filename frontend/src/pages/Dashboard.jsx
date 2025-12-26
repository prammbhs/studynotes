import React, { useState, useEffect } from 'react';
import { documentAPI, subtopicAPI, notesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 space-y-3 animate-fadeIn">
          <h1 className="text-5xl font-black text-gray-900 dark:text-white">📖 My Documents</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Upload, extract, and generate notes from your study materials</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 rounded-xl flex items-center justify-between animate-shake">
            <span className="text-red-700 dark:text-red-400 font-semibold">{error}</span>
            <button 
              onClick={() => setError('')}
              className="text-red-700 dark:text-red-400 hover:opacity-70 transition text-2xl font-bold"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl flex items-center justify-between animate-pulse">
            <span className="text-green-700 dark:text-green-400 font-semibold">{success}</span>
            <button 
              onClick={() => setSuccess('')}
              className="text-green-700 dark:text-green-400 hover:opacity-70 transition text-2xl font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="mb-12 p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-2xl border-2 border-indigo-200 dark:border-indigo-700 transition-colors duration-300 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📤 Upload Document</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Supported formats: PDF, DOCX, TXT, Images (PNG, JPG, JPEG)</p>
          <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-2xl p-12 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800/50">
            <input
              type="file"
              id="fileInput"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            />
            <label htmlFor="fileInput" className="block cursor-pointer">
              <div className="text-6xl mb-4 transform hover:scale-110 transition-transform duration-300">
                {uploading ? '⏳' : '📁'}
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {uploading ? 'Uploading...' : 'Click or drag to upload'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drop your files here or click to browse
              </p>
            </label>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner fullPage />
        ) : documents.length === 0 ? (
          <div className="text-center py-24 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No documents yet</p>
            <p className="text-lg text-gray-600 dark:text-gray-400">Upload your first study material to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-xl hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-indigo-900 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 animate-fadeIn border border-gray-200 dark:border-gray-700"
              >
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2 line-clamp-2">
                    📄 {doc.name || 'Untitled'}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString()} • {doc.type || 'Unknown'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <button
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
                    onClick={() => handleExtractWithGemini(doc.id)}
                    disabled={processingId === doc.id}
                  >
                    {processingId === doc.id ? '⏳ Extracting...' : '✨ Extract Subtopics'}
                  </button>

                  <button
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
                    onClick={() => handleGenerateNotes(doc.id)}
                    disabled={processingId === doc.id}
                  >
                    {processingId === doc.id ? '⏳ Generating...' : '📝 Generate Notes'}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="px-3 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                      onClick={() => handleDownload(doc.id)}
                      title="Download"
                    >
                      ⬇️ Download
                    </button>

                    <button
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      title="Delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {doc.subtopics && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 mb-3">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">✨ Subtopics Extracted</h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {doc.subtopics.slice(0, 3).map((sub, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 font-bold">→</span>
                          <span className="line-clamp-1">{sub}</span>
                        </li>
                      ))}
                      {doc.subtopics.length > 3 && (
                        <li className="text-gray-500 dark:text-gray-500 italic font-semibold">... +{doc.subtopics.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {doc.notes && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">📚 Notes Available</h4>
                    <button
                      className="w-full px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-xs shadow-md hover:shadow-lg"
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
