import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>📚 StudyNotes</h1>
            <h2>AI-Powered Study Material Generator</h2>
            <p>
              Transform your study materials into organized, AI-generated notes and study guides.
              Extract key topics, generate comprehensive notes, and learn smarter.
            </p>

            <div className="hero-actions">
              {isAuthenticated ? (
                <a href="/dashboard" className="btn btn-primary btn-large">
                  Go to Dashboard
                </a>
              ) : (
                <>
                  <a href="/register" className="btn btn-primary btn-large">
                    Get Started Free
                  </a>
                  <a href="/login" className="btn btn-outline btn-large">
                    Sign In
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">📤</div>
              <h3>Easy Upload</h3>
              <p>Upload your study materials in various formats (PDF, DOCX, Images)</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">✨</div>
              <h3>AI Extraction</h3>
              <p>Automatically extract key subtopics using advanced AI technology</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">📝</div>
              <h3>Generate Notes</h3>
              <p>Create comprehensive, well-organized notes for each subtopic</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">🔍</div>
              <h3>Compare Methods</h3>
              <p>Compare pattern-based and AI-powered extraction results</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">💾</div>
              <h3>Save & Download</h3>
              <p>Store all your documents and download them whenever needed</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">🔐</div>
              <h3>Secure & Private</h3>
              <p>Your data is encrypted and securely stored on our servers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload</h3>
              <p>Upload your study material or course notes</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Extract</h3>
              <p>AI automatically extracts key subtopics</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Generate</h3>
              <p>Create comprehensive notes for each topic</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">4</div>
              <h3>Learn</h3>
              <p>Study and download your organized notes</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Transform Your Study Experience?</h2>
          <p>Start using StudyNotes today and learn smarter, not harder.</p>

          {!isAuthenticated && (
            <a href="/register" className="btn btn-primary btn-large">
              Create Free Account
            </a>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
