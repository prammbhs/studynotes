import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="loading-fullpage">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return <div className="spinner"></div>;
};

export default LoadingSpinner;
