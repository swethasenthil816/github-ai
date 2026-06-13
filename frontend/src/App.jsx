import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoadingState from './components/LoadingState';
import Dashboard from './components/Dashboard';
import ThemeToggle from './components/ThemeToggle';
import { analyzeRepository } from './services/api';
import { FaGithub } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

  // Sync dark mode class with HTML document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      document.body.className = "bg-dark-bg text-dark-text transition-colors duration-300 antialiased font-sans";
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      document.body.className = "bg-[#F8FAFC] text-slate-900 transition-colors duration-300 antialiased font-sans";
    }
  }, [darkMode]);

  const handleAnalyze = async (url) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeRepository(url);
      if (result.success) {
        setAnalysisData(result.data);
      } else {
        setError(result.error || 'Failed to analyze repository.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while communicating with the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-grid-pattern">
      {/* Header/Navbar */}
      <header className="border-b border-slate-200/80 dark:border-dark-border/60 bg-white/70 dark:bg-dark-card/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleReset}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              AI
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">
              GitHub Explainer
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <FaGithub className="w-5 h-5" />
            </a>
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center">
        {error && !isLoading && (
          <div className="max-w-xl mx-auto w-full px-4 mt-6 animate-fade-in">
            <div className="p-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-sm text-red-650 dark:text-red-400">
              <FiAlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-left">
                <h3 className="font-semibold text-base">Analysis Failed</h3>
                <p className="leading-relaxed">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <LoadingState />
        ) : analysisData ? (
          <Dashboard data={analysisData} onReset={handleReset} />
        ) : (
          !error && <LandingPage onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/60 dark:border-dark-border/40 text-center text-xs text-slate-405 dark:text-slate-500">
        <p>© {new Date().getFullYear()} AI GitHub Project Explainer. Built with React, Tailwind CSS, Node.js, and OpenAI API.</p>
      </footer>
    </div>
  );
}
