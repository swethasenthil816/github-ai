import React, { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FiSearch, FiAlertCircle } from 'react-icons/fi';

export default function LandingPage({ onAnalyze, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const sampleRepos = [
    { name: 'Vite', url: 'https://github.com/vitejs/vite' },
    { name: 'Express', url: 'https://github.com/expressjs/express' },
    { name: 'Axios', url: 'https://github.com/axios/axios' },
    { name: 'React', url: 'https://github.com/facebook/react' }
  ];

  const validateUrl = (value) => {
    if (!value) return 'GitHub URL is required.';
    const cleanUrl = value.trim();
    
    // Quick regex validation
    const httpsRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/[^\/]+\/[^\/]+.*$/i;
    const sshRegex = /^git@github\.com:[^\/]+\/[^\/]+.*$/i;
    
    if (!httpsRegex.test(cleanUrl) && !sshRegex.test(cleanUrl)) {
      return 'Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    onAnalyze(url.trim());
  };

  const handleSampleClick = (sampleUrl) => {
    setUrl(sampleUrl);
    setError('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 animate-fade-in relative z-10">
      {/* Visual decoration: Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full glow-orb -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full glow-orb -z-10" />

      {/* Main Title Section */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950 border border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 font-medium text-xs mb-6 uppercase tracking-wider">
          <FaGithub className="w-4 h-4" /> AI Repository Intelligence
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white leading-[1.15]">
          AI GitHub <br />
          <span className="bg-gradient-to-r from-cyan-500 via-brand-500 to-indigo-500 bg-clip-text text-transparent">
            Project Explainer
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-dark-muted font-normal max-w-2xl mx-auto">
          Understand any GitHub project instantly using AI. Paste a repository URL and get comprehensive architecture, structure, and quality analysis.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="w-full max-w-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 md:p-8 glass-panel relative">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <FiSearch className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste GitHub Repository URL (e.g., https://github.com/vitejs/vite)"
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-cardMuted text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50 animate-shake">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-600 hover:to-brand-700 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-dark-bg flex items-center justify-center gap-2"
          >
            <span>Analyze Repository</span>
          </button>
        </form>

        {/* Quick Samples */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-dark-border/60">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 text-center md:text-left">
            Try a public repository
          </p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {sampleRepos.map((repo, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleClick(repo.url)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 dark:bg-dark-cardMuted hover:bg-slate-100 dark:hover:bg-dark-border border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text transition-all duration-150 active:scale-95"
              >
                {repo.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
