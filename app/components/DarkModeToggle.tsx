'use client';

import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-20 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label="Toggle dark mode"
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white dark:bg-gray-300 shadow-lg transition-transform duration-300 ${
          isDark ? 'translate-x-10' : 'translate-x-1'
        }`}
      >
        {isDark ? (
          <span className="flex h-full w-full items-center justify-center text-yellow-500">
            🌙
          </span>
        ) : (
          <span className="flex h-full w-full items-center justify-center text-yellow-500">
            ☀️
          </span>
        )}
      </span>
    </button>
  );
}
