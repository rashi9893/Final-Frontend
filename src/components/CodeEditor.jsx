import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Check, AlertCircle, Clock, CheckCircle2, XCircle, RotateCcw, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function CodeEditor({
  problem,
  initialCode,
  onCodeChange,
  onRunTestCases,
  onSubmitSolution,
  isSubmitting = false
}) {
  const { theme } = useTheme();
  const [code, setCode] = useState(initialCode || problem?.starterCode || '');
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'testcases' | 'results'
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);
  const [autosavedTime, setAutosavedTime] = useState(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    } else if (problem?.starterCode) {
      setCode(problem.starterCode);
    }
  }, [problem, initialCode]);

  // Periodic autosave simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setAutosavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (onCodeChange) onCodeChange(code);
    }, 15000);
    return () => clearInterval(timer);
  }, [code, onCodeChange]);

  const handleEditorChange = (value) => {
    setCode(value);
    if (onCodeChange) onCodeChange(value);
  };

  const handleResetCode = () => {
    if (window.confirm('Reset code to starter template? Your current edits will be reverted.')) {
      setCode(problem.starterCode);
      if (onCodeChange) onCodeChange(problem.starterCode);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab('results');
    try {
      // Simulate real sandboxed compilation execution
      await new Promise(r => setTimeout(r, 850));

      // Test case validation simulator
      const results = problem.testCases.map((tc, idx) => {
        // Basic check if code contains expected algorithms
        const hasLogic = code.includes('subarraySum') || code.includes('isValid') || code.length > 80;
        const passed = hasLogic;
        return {
          id: tc.id,
          index: idx + 1,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: passed ? tc.expectedOutput : 'Error / Mismatch',
          passed,
          runtime: `${Math.floor(Math.random() * 4) + 1}ms`,
          memory: `${(14.0 + Math.random() * 0.8).toFixed(1)}MB`,
          isPublic: tc.isPublic
        };
      });

      const passedCount = results.filter(r => r.passed).length;
      const executionSummary = {
        passedCount,
        totalCount: results.length,
        status: passedCount === results.length ? 'Accepted' : 'Wrong Answer',
        runtimeAvg: '2.4ms',
        results
      };

      setRunResults(executionSummary);
      if (onRunTestCases) onRunTestCases(executionSummary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[680px] bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
      
      {/* Left Panel: Problem Statement & Test Cases Specs */}
      <div className="w-full lg:w-5/12 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#121212]/70">
        
        {/* Navigation tabs for left panel */}
        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 px-4 pt-3 bg-white dark:bg-[#151515] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('problem')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'problem'
                ? 'border-sky-500 dark:border-sky-400 text-sky-600 dark:text-sky-300'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <span>Problem Description</span>
          </button>
          <button
            onClick={() => setActiveTab('testcases')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'testcases'
                ? 'border-sky-500 dark:border-sky-400 text-sky-600 dark:text-sky-300'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <span>Test Cases ({problem?.testCases?.length || 0})</span>
          </button>
          {runResults && (
            <button
              onClick={() => setActiveTab('results')}
              className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'results'
                  ? 'border-sky-500 dark:border-sky-400 text-sky-600 dark:text-sky-300'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <span>Execution Output</span>
            <span className={`w-2 h-2 rounded-full ${runResults.passedCount === runResults.totalCount ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </button>
        )}
      </div>

        {/* Tab content area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-sm">
          {activeTab === 'problem' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {problem?.title || 'Algorithmic Problem'}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  problem?.difficulty === 'Easy'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                }`}>
                  {problem?.difficulty || 'Medium'}
                </span>
              </div>

              <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                {problem?.description}
              </div>

              {/* Examples */}
              {problem?.examples?.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 font-mono text-xs space-y-1"
                >
                  <p className="font-sans font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                    Example {idx + 1}:
                  </p>
                  <p><span className="text-neutral-500">Input: </span><span className="text-neutral-900 dark:text-neutral-100">{ex.input}</span></p>
                  <p><span className="text-neutral-500">Output: </span><span className="text-sky-600 dark:text-sky-400 font-bold">{ex.output}</span></p>
                  {ex.explanation && (
                    <p className="font-sans text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
                      Explanation: {ex.explanation}
                    </p>
                  )}
                </div>
              ))}

              {/* Constraints */}
              {problem?.constraints && (
                <div className="space-y-1.5 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Constraints
                  </h4>
                  <ul className="list-disc list-inside space-y-1 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'testcases' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Evaluation Test Cases
              </h4>
              <div className="space-y-2">
                {problem?.testCases?.map((tc, idx) => (
                  <div
                    key={tc.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between font-sans">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Case {idx + 1}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        tc.isPublic 
                          ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' 
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                      }`}>
                        {tc.isPublic ? 'Public Sample' : 'Hidden Evaluation'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-neutral-50 dark:bg-[#202020] text-neutral-700 dark:text-neutral-300">
                      Input: {tc.input}
                    </div>
                    <div className="p-2 rounded bg-neutral-50 dark:bg-[#202020] text-neutral-700 dark:text-neutral-300">
                      Expected: {tc.expectedOutput}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'results' && runResults && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                runResults.passedCount === runResults.totalCount
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}>
                <div>
                  <h4 className="text-base font-bold flex items-center gap-1.5">
                    {runResults.passedCount === runResults.totalCount ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-amber-500" />
                    )}
                    <span>{runResults.status}</span>
                  </h4>
                  <p className="text-xs mt-0.5 opacity-90">
                    Passed {runResults.passedCount} of {runResults.totalCount} test cases
                  </p>
                </div>
                <div className="text-right font-mono text-xs opacity-90">
                  <p>Avg Time: {runResults.runtimeAvg}</p>
                </div>
              </div>

              {/* Case breakdown */}
              <div className="space-y-2">
                {runResults.results.map((r, i) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between font-sans">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Test Case #{r.index} {r.isPublic ? '(Public)' : '(Hidden)'}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        r.passed ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {r.passed ? 'Passed' : 'Failed'} • {r.runtime}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-neutral-50 dark:bg-[#202020] text-neutral-700 dark:text-neutral-300">
                      Input: {r.input}
                    </div>
                    <div className="p-2 rounded bg-neutral-50 dark:bg-[#202020] text-neutral-700 dark:text-neutral-300">
                      Output: {r.actual}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Monaco Editor & Action Toolbar */}
      <div className="w-full lg:w-7/12 flex flex-col bg-white dark:bg-[#141414]">
        
        {/* Top code editor toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181818] text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold font-mono text-xs">
              C++ (GCC 12)
            </span>
            {autosavedTime && (
              <span className="text-[11px] text-neutral-400 hidden sm:inline">
                Draft autosaved at {autosavedTime}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCode}
              title="Reset code template"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Monaco Editor Canvas */}
        <div className="flex-1 min-h-[460px]">
          <Editor
            height="100%"
            language="cpp"
            value={code}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            onChange={handleEditorChange}
            options={{
              fontSize: 13,
              fontFamily: "'Fira Code', Menlo, Monaco, Consolas, monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbers: 'on',
              tabSize: 4,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 }
            }}
          />
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#161616]">
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span className="hidden sm:inline">Sandboxed code evaluation environment</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Compiling...' : 'Run Code'}</span>
            </button>

            <button
              onClick={() => onSubmitSolution && onSubmitSolution(code, runResults)}
              disabled={isRunning || isSubmitting}
              type="button"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Locking...' : 'Submit & Proceed'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
