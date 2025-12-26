import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>📚 StudyNotes</h1>
          </div>

          <nav className="nav">
            {isAuthenticated ? (
              <div className="nav-user">
                <span className="user-name">Hi, {user?.name || 'User'}</span>
                <button onClick={logout} className="btn btn-outline">
                  Logout
                </button>
              </div>
            ) : (
              <div className="nav-links">
                <a href="/login" className="btn btn-primary">
                  Login
                </a>
                <a href="/register" className="btn btn-outline">
                  Register
                </a>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
