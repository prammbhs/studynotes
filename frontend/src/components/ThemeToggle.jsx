import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out"
      aria-label="Toggle dark mode"
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Sun icon - visible in light mode */}
        <svg
          className={`absolute w-6 h-6 text-yellow-500 transition-all duration-300 transform ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a1 1 0 00-1.414 0l-2.12 2.12a1 1 0 001.414 1.414L9 11.414l1.464 1.465a1 1 0 001.414-1.414zM15 5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm0 10a1 1 0 011 1h2a1 1 0 110-2h-2a1 1 0 01-1 1zM5 15a1 1 0 01-1 1H2a1 1 0 110-2h2a1 1 0 011 1zM5 5a1 1 0 01-1-1H2a1 1 0 012 0h2a1 1 0 01-1 1z"
            clipRule="evenodd"
          />
        </svg>

        {/* Moon icon - visible in dark mode */}
        <svg
          className={`absolute w-6 h-6 text-blue-400 transition-all duration-300 transform ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>
    </button>
  );
};

export default ThemeToggle;
