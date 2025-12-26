import React from 'react';

const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh' }}>
        <div className="alert alert-error">
          <p>Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
