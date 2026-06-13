import React, { useState, useEffect } from 'react';

export default function LoadingState() {
  const steps = [
    { label: 'Fetching repository details', desc: 'Connecting to GitHub REST API and pulling metadata.' },
    { label: 'Analyzing codebase structure', desc: 'Parsing folder tree and gathering languages.' },
    { label: 'Reading README & configurations', desc: 'Extracting key configuration files and README documentation.' },
    { label: 'Running AI analysis', desc: 'Sending payload to OpenAI model for design pattern discovery.' },
    { label: 'Structuring dashboard results', desc: 'Compiling scores, interview questions, and resume bullet points.' }
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const intervals = [3000, 3500, 4000, 6000, 8000]; // Duration for each simulated step
    let step = 0;

    const runNext = () => {
      if (step < steps.length - 1) {
        step++;
        setCurrentStep(step);
        timer = setTimeout(runNext, intervals[step]);
      }
    };

    let timer = setTimeout(runNext, intervals[0]);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-xl mx-auto px-4 animate-fade-in">
      {/* Spinner Graphic */}
      <div className="relative mb-10">
        <div className="w-24 h-24 rounded-full border-4 border-slate-200 dark:border-dark-border" />
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-transparent border-t-cyan-500 border-r-indigo-500 animate-spin" />
        <div className="absolute top-2 left-2 w-20 h-20 rounded-full bg-slate-50 dark:bg-dark-bg flex items-center justify-center">
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-indigo-500 bg-clip-text text-transparent">AI</span>
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Analyzing Repository</h2>
        <p className="text-slate-500 dark:text-dark-muted text-sm">
          Please wait. We are parsing files and compiling your report...
        </p>
      </div>

      {/* Progress Steps UI */}
      <div className="w-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6 shadow-md space-y-5 glass-panel">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div key={idx} className="flex gap-4 items-start transition-all duration-300">
              {/* Step Status Dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs border transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isActive
                      ? 'bg-cyan-500 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)] animate-pulse'
                      : 'bg-slate-100 dark:bg-dark-cardMuted border-slate-200 dark:border-dark-border text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-10 transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-dark-border'
                    }`}
                  />
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    isActive
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : isCompleted
                      ? 'text-slate-700 dark:text-slate-350'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5 animate-fade-in leading-relaxed">
                    {step.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
