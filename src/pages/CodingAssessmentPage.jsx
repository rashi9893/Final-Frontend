import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Code2, Clock, CheckCircle2, ArrowRight, ShieldCheck, ArrowLeft, Bot } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import { getInterviewById, getCodingProblemById } from '../services/storageService';

export default function CodingAssessmentPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const interview = getInterviewById(interviewId);
  const problem = getCodingProblemById(interview?.codingProblemId || 'prob-1');

  const [code, setCode] = useState(problem.starterCode);
  const [testResults, setTestResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60);

  // Restore draft if saved
  useEffect(() => {
    const saved = sessionStorage.getItem(`interview_code_${interviewId}`);
    if (saved) {
      setCode(saved);
    }
  }, [interviewId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    sessionStorage.setItem(`interview_code_${interviewId}`, newCode);
  };

  const handleRunTests = (results) => {
    setTestResults(results);
  };

  const handleSubmit = (finalCode, results) => {
    setIsSubmitting(true);
    const submissionPayload = {
      problemId: problem.id,
      problemTitle: problem.title,
      language: 'cpp',
      code: finalCode || code,
      passedCount: results?.passedCount || 3,
      totalCount: results?.totalCount || 3,
      score: results?.passedCount === results?.totalCount ? 100 : 80
    };

    sessionStorage.setItem(`interview_code_submission_${interviewId}`, JSON.stringify(submissionPayload));
    navigate(`/interview/${interviewId}/assessment`);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white flex flex-col justify-between selection:bg-sky-400/20 selection:text-sky-500">
      
      {/* Top Coding Assessment Navigation */}
      <header className="h-16 bg-white dark:bg-[#121212] border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to={`/interview/${interviewId}/session`}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Back to Questions"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Code2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                Coding Assessment Window — {problem.title}
              </h1>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {interview?.companyName || 'TechCorp Global'} • C++ Standard Library Environment
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800/40">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => handleSubmit(code, testResults)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow transition-all active:scale-95 disabled:opacity-50"
          >
            <span>Proceed to Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Coding Workspace Area */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col">
        <CodeEditor
          problem={problem}
          initialCode={code}
          onCodeChange={handleCodeChange}
          onRunTestCases={handleRunTests}
          onSubmitSolution={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </main>

    </div>
  );
}
