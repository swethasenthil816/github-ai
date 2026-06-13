import React, { useState, useEffect } from 'react';
import { FaGithub, FaStar, FaCodeBranch, FaRegDotCircle, FaClipboardCheck, FaRegClipboard, FaLightbulb, FaShieldAlt, FaRocket, FaCogs } from 'react-icons/fa';
import { FiExternalLink, FiCompass, FiCode, FiFolder, FiFileText, FiAward, FiMessageSquare } from 'react-icons/fi';

// Recursive Tree Node Component
function TreeNode({ node, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(depth < 2); // Open top levels by default
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none text-left">
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-cardMuted cursor-pointer transition-all text-sm ${
          node.type === 'folder' 
            ? 'text-cyan-600 dark:text-cyan-400 font-medium' 
            : 'text-slate-650 dark:text-slate-300'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {node.type === 'folder' ? (
          <span className="flex items-center gap-1">
            <span className="text-[10px] w-3 text-slate-400 dark:text-slate-500">
              {isOpen ? '▼' : '▶'}
            </span>
            <span className="text-lg">📁</span>
          </span>
        ) : (
          <span className="text-lg pl-3">📄</span>
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {hasChildren && isOpen && (
        <div className="border-l border-slate-100 dark:border-dark-border/40 ml-[15px]">
          {node.children.map((child, idx) => (
            <TreeNode key={idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// Convert a flat list of paths to a tree structure
function buildTree(files) {
  if (!files || !files.length) return [];
  
  const root = { name: 'root', type: 'folder', children: {} };

  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const type = (isLast && file.type === 'blob') ? 'file' : 'folder';

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          type: type,
          children: {}
        };
      }
      current = current.children[part];
    });
  });

  function convert(node) {
    const result = { name: node.name, type: node.type };
    const childKeys = Object.keys(node.children);
    
    if (childKeys.length > 0) {
      result.children = childKeys.map(key => convert(node.children[key]));
      // Sort: folders first, then files
      result.children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
      });
    }
    return result;
  }

  // Convert root children and sort
  const tree = Object.keys(root.children).map(key => convert(root.children[key]));
  tree.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });
  return tree;
}

export default function Dashboard({ data, onReset, filePaths = [] }) {
  const { repoInfo, analysis } = data;
  const [treeData, setTreeData] = useState([]);
  
  // States for copy feedback
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);
  
  // State for active interview question tab
  const [activeQuestionTab, setActiveQuestionTab] = useState('technical');

  useEffect(() => {
    // Collect filePaths from backend payload or fallback
    const rawFiles = filePaths.length ? filePaths : (repoInfo.fileTree || []);
    // Normalize: accept both raw objects {path, type} and plain strings
    const files = rawFiles.map(f => typeof f === 'string' ? { path: f, type: 'blob' } : f);
    setTreeData(buildTree(files));
  }, [data, filePaths]);

  const handleCopyResume = () => {
    const bulletsText = analysis.resumeBullets.join('\n');
    navigator.clipboard.writeText(bulletsText).then(() => {
      setCopiedResume(true);
      setTimeout(() => setCopiedResume(false), 2000);
    });
  };

  const handleCopyQuestions = () => {
    const techText = `Technical Questions & Answers:\n` + 
      analysis.interviewQuestions.technical.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`).join('\n\n');
    const archText = `Architecture Questions & Answers:\n` + 
      analysis.interviewQuestions.architecture.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`).join('\n\n');
    const fullText = `${techText}\n\n${archText}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedQuestions(true);
      setTimeout(() => setCopiedQuestions(false), 2000);
    });
  };

  // Convert score metrics to human-readable labels
  const scoreMetrics = [
    { label: 'Code Quality', key: 'codeQuality', color: 'bg-cyan-500' },
    { label: 'Readability', key: 'readability', color: 'bg-brand-500' },
    { label: 'Documentation', key: 'documentation', color: 'bg-indigo-500' },
    { label: 'Scalability', key: 'scalability', color: 'bg-emerald-500' },
    { label: 'Maintainability', key: 'maintainability', color: 'bg-pink-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-slide-up">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-xl border border-brand-100 dark:border-brand-900">
            <FaGithub className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              {repoInfo.name}
              <a
                href={repoInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-normal text-slate-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 flex items-center gap-1 border border-slate-200 dark:border-dark-border px-2 py-0.5 rounded-md transition-colors"
              >
                <span>View Repository</span>
                <FiExternalLink className="w-3 h-3" />
              </a>
            </h2>
            <p className="text-sm text-slate-500 dark:text-dark-muted mt-1 max-w-2xl">
              {repoInfo.description || 'No description provided.'}
            </p>
          </div>
        </div>
        
        {/* Repo Stats and Reset Action */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-dark-cardMuted px-4 py-2 border border-slate-100 dark:border-dark-border/40 rounded-xl text-slate-600 dark:text-slate-350">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <FaStar className="w-4 h-4 text-amber-400" />
              <span>{repoInfo.stars}</span>
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-dark-border" />
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <FaCodeBranch className="w-4 h-4 text-cyan-400" />
              <span>{repoInfo.forks}</span>
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-dark-border" />
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <FaRegDotCircle className="w-4 h-4 text-red-400" />
              <span>{repoInfo.openIssues}</span>
            </div>
          </div>

          <button
            onClick={onReset}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-dark-cardMuted hover:bg-slate-200 dark:hover:bg-dark-border text-slate-700 dark:text-white border border-slate-200 dark:border-dark-border transition-all duration-150 active:scale-98"
          >
            Analyze Another
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left / Center Column (Overview & Tech badges) - span 2 */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: What this project does */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/60 pb-3">
              <FiCompass className="w-5 h-5 text-cyan-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">What This Project Does</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Core Purpose</h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm mt-1 leading-relaxed">
                  {analysis.purpose}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Target Audience</h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm mt-1 leading-relaxed">
                  {analysis.targetUsers}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Problem Solved</h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm mt-1 leading-relaxed">
                  {analysis.problemSolved}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Tech Stack Badges */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-md p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/60 pb-3">
              <FiCode className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tech Stack</h3>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {analysis.detectedTechBadges && analysis.detectedTechBadges.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl font-medium text-xs bg-slate-50 dark:bg-dark-cardMuted text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-dark-border/60 shadow-sm hover:scale-105 hover:bg-slate-100 dark:hover:bg-dark-border transition-all duration-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Scores & Beginner explanation) - span 1 */}
        <div className="space-y-8">
          
          {/* Card 3: Project Scores */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-md p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/60 pb-3">
              <FiAward className="w-5 h-5 text-pink-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Project Scores</h3>
            </div>
            
            <div className="space-y-4">
              {scoreMetrics.map((metric, idx) => {
                const scoreValue = analysis.scores[metric.key] || 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-350">{metric.label}</span>
                      <span className="text-slate-900 dark:text-white">{scoreValue}/10</span>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-dark-cardMuted rounded-full overflow-hidden">
                      <div
                        style={{ '--progress-width': `${scoreValue * 10}%` }}
                        className={`h-full rounded-full ${metric.color} progress-fill`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Beginner Explanation */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-md p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/60 pb-3">
              <FaLightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Beginner Friendly</h3>
            </div>
            <div className="relative p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">
              "{analysis.beginnerFriendly}"
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: File tree & Architecture details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Tree view Card - span 1 */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-md p-6 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/60 pb-3 flex-shrink-0">
            <FiFolder className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Folder Structure</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-1">
            {treeData.length > 0 ? (
              treeData.map((node, idx) => (
                <TreeNode key={idx} node={node} />
              ))
            ) : (
              <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-12">
                No folders or files parsed.
              </div>
            )}
          </div>
        </div>

        {/* Right Architecture & Files Card - span 2 */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card: Architecture */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-md p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/60 pb-3">
              <FaCogs className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Architecture Overview</h3>
            </div>
            <p className="text-slate-755 dark:text-slate-300 text-sm leading-relaxed">
              {analysis.architectureExplanation}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed italic bg-slate-50 dark:bg-dark-cardMuted/65 p-3 rounded-lg border border-slate-200/50 dark:border-dark-border/30">
              <span className="font-semibold not-italic">Structure Summary: </span>{analysis.folderStructureExplanation}
            </p>
          </div>

          {/* Card: Important Files */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-md p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/60 pb-3">
              <FiFileText className="w-5 h-5 text-pink-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Important Files</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.importantFiles && analysis.importantFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 dark:bg-dark-cardMuted/50 border border-slate-200/70 dark:border-dark-border/50 rounded-xl space-y-1.5"
                >
                  <code className="text-xs font-semibold px-2.5 py-1 rounded bg-white dark:bg-dark-cardMuted text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-dark-border">
                    {file.name}
                  </code>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-normal pt-1.5">
                    {file.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Resume bullets & Interview Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Resume Bullets Card - span 1 */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-md p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FiAward className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Resume Description</h3>
              </div>
              <button
                onClick={handleCopyResume}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-cardMuted text-slate-600 dark:text-white flex items-center gap-1.5 transition-colors"
                title="Copy Resume Bullets"
              >
                {copiedResume ? (
                  <>
                    <FaClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <FaRegClipboard className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            
            <ul className="space-y-4 list-disc pl-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              {analysis.resumeBullets && analysis.resumeBullets.map((bullet, idx) => (
                <li key={idx} className="marker:text-indigo-500">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interview Questions Card - span 2 */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-md p-6 flex flex-col justify-between h-[450px]">
          <div>
            {/* Header with Tabs and Copy Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-dark-border/60 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <FiMessageSquare className="w-5 h-5 text-cyan-500" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Interview Questions</h3>
              </div>

              {/* Tab Selector & Copy Button */}
              <div className="flex items-center gap-3">
                <div className="inline-flex bg-slate-100 dark:bg-dark-cardMuted rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setActiveQuestionTab('technical')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      activeQuestionTab === 'technical'
                        ? 'bg-white dark:bg-dark-card text-cyan-600 dark:text-cyan-400 shadow-sm'
                        : 'text-slate-500 dark:text-dark-muted hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Technical ({(analysis.interviewQuestions?.technical || []).length})
                  </button>
                  <button
                    onClick={() => setActiveQuestionTab('architecture')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      activeQuestionTab === 'architecture'
                        ? 'bg-white dark:bg-dark-card text-indigo-650 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 dark:text-dark-muted hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Architecture ({(analysis.interviewQuestions?.architecture || []).length})
                  </button>
                </div>
                
                <button
                  onClick={handleCopyQuestions}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-cardMuted text-slate-600 dark:text-white flex items-center gap-1.5 transition-colors"
                  title="Copy All Questions"
                >
                  {copiedQuestions ? (
                    <>
                      <FaClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <FaRegClipboard className="w-3.5 h-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Questions list */}
            <div className="overflow-y-auto max-h-[320px] pr-2 space-y-3">
              {activeQuestionTab === 'technical' ? (
                (analysis.interviewQuestions?.technical || []).length > 0 ? (
                  (analysis.interviewQuestions.technical).map((q, idx) => (
                    <details 
                      key={idx} 
                      className="group border border-slate-150 dark:border-dark-border/40 rounded-xl p-3 bg-slate-50 dark:bg-dark-cardMuted/20 hover:border-cyan-500/30 dark:hover:border-cyan-500/20 transition-all duration-200"
                    >
                      <summary className="flex justify-between items-center font-medium text-sm text-slate-800 dark:text-white cursor-pointer select-none list-none">
                        <div className="flex gap-3 items-center pr-2">
                          <span className="text-xs font-bold text-cyan-500 dark:text-cyan-400 bg-cyan-500/5 dark:bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/10 flex-shrink-0">
                            T{idx + 1}
                          </span>
                          <span className="text-left leading-relaxed">{q.question || q.Question || 'Interview question'}</span>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 group-open:rotate-185 transition-transform duration-200">▼</span>
                      </summary>
                      <div className="mt-3 pl-11 border-t border-slate-100 dark:border-dark-border/20 pt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-350 text-left">
                        <p className="font-semibold text-cyan-600 dark:text-cyan-455 mb-1">Answer:</p>
                        <p className="whitespace-pre-line">{q.answer || q.Answer || 'No answer provided.'}</p>
                      </div>
                    </details>
                  ))
                ) : (
                  <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">No technical questions generated.</div>
                )
              ) : (
                (analysis.interviewQuestions?.architecture || []).length > 0 ? (
                  (analysis.interviewQuestions.architecture).map((q, idx) => (
                    <details 
                      key={idx} 
                      className="group border border-slate-150 dark:border-dark-border/40 rounded-xl p-3 bg-slate-50 dark:bg-dark-cardMuted/20 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-200"
                    >
                      <summary className="flex justify-between items-center font-medium text-sm text-slate-800 dark:text-white cursor-pointer select-none list-none">
                        <div className="flex gap-3 items-center pr-2">
                          <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/10 flex-shrink-0">
                            A{idx + 1}
                          </span>
                          <span className="text-left leading-relaxed">{q.question || q.Question || 'Architecture question'}</span>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 group-open:rotate-185 transition-transform duration-200">▼</span>
                      </summary>
                      <div className="mt-3 pl-11 border-t border-slate-100 dark:border-dark-border/20 pt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-350 text-left">
                        <p className="font-semibold text-indigo-650 dark:text-indigo-455 mb-1">Answer:</p>
                        <p className="whitespace-pre-line">{q.answer || q.Answer || 'No answer provided.'}</p>
                      </div>
                    </details>
                  ))
                ) : (
                  <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">No architecture questions generated.</div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Suggestions */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-md p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/60 pb-3">
          <FaLightbulb className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Improvement Suggestions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-semibold text-sm border-b border-slate-100 dark:border-dark-border/30 pb-2">
              <FaRocket className="w-4 h-4" />
              <span>Performance Improvements</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-350 list-disc pl-4 leading-relaxed text-left">
              {analysis.improvements.performance && analysis.improvements.performance.map((item, idx) => (
                <li key={idx} className="marker:text-cyan-500">{item}</li>
              ))}
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-semibold text-sm border-b border-slate-100 dark:border-dark-border/30 pb-2">
              <FaShieldAlt className="w-4 h-4" />
              <span>Security Enhancements</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-350 list-disc pl-4 leading-relaxed text-left">
              {analysis.improvements.security && analysis.improvements.security.map((item, idx) => (
                <li key={idx} className="marker:text-pink-500">{item}</li>
              ))}
            </ul>
          </div>

          {/* Scalability */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm border-b border-slate-100 dark:border-dark-border/30 pb-2">
              <FaCogs className="w-4 h-4" />
              <span>Scalability Upgrades</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-350 list-disc pl-4 leading-relaxed text-left">
              {analysis.improvements.scalability && analysis.improvements.scalability.map((item, idx) => (
                <li key={idx} className="marker:text-emerald-500">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
