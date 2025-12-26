import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-transparent text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        {/* Rounded navbar container with margin */}
        <div className="m-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-gray-900 dark:to-gray-800 shadow-lg border border-white/10">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="logo">
              <h1 className="text-2xl font-bold animate-pulse hover:animate-none transition-all duration-300">
                📚 StudyNotes
              </h1>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <div className="nav-user flex items-center gap-3">
                  <span className="font-medium text-sm sm:text-base animate-fadeIn">
                    Hi, {user?.name || 'User'}
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 border-2 border-white text-white hover:bg-white hover:text-indigo-600 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="nav-links flex gap-3">
                  <a
                    href="/login"
                    className="px-4 py-2 bg-white text-indigo-600 hover:bg-gray-100 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="px-4 py-2 border-2 border-white text-white hover:bg-white hover:text-indigo-600 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium"
                  >
                    Register
                  </a>
                </div>
              )}
            </nav>

            {/* Mobile toggle */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                aria-label="Toggle menu"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-lg p-2 bg-white/20 hover:bg-white/30 transition"
              >
                <span className="text-lg">☰</span>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden px-4 pb-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Hi, {user?.name || 'User'}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 border-2 border-white text-white hover:bg-white hover:text-indigo-600 rounded-lg transition-all duration-300 font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/login"
                    className="px-4 py-2 bg-white text-indigo-600 hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium text-center"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="px-4 py-2 border-2 border-white text-white hover:bg-white hover:text-indigo-600 rounded-lg transition-all duration-300 font-medium text-center"
                  >
                    Register
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
