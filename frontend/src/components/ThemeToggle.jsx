import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

/**
 * Renders a premium theme toggle button.
 * Uses sun and moon icons with micro-animations.
 */
export default function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2.5 rounded-xl border bg-white/80 dark:bg-dark-card/80 border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-cardMuted hover:shadow-md transition-all duration-200 hover:scale-105 backdrop-blur-sm"
      aria-label="Toggle dark/light theme"
    >
      {darkMode ? (
        <FiSun className="w-5 h-5 text-amber-400 animate-[spin_12s_linear_infinite]" />
      ) : (
        <FiMoon className="w-5 h-5 text-indigo-500" />
      )}
    </button>
  );
}
