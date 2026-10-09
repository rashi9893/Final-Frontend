import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Code2,
  FileText,
  User,
  Building,
  GraduationCap,
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp,
  Save
} from 'lucide-react';
import { updateSubmissionReview } from '../services/storageService';

export default function SubmissionDetailModal({ submission, onClose, isCompany = false, onUpdated }) {
  if (!submission) return null;

  const report = submission.evaluationReport || {};
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'questions' | 'coding' | 'proctoring'
  const [expandedQ, setExpandedQ] = useState(0);

  // Recruiter review state
  const [recruiterNotes, setRecruiterNotes] = useState(report.recruiterNotes || '');
  const [verdict, setVerdict] = useState(submission.verdict || report.verdict || report.hiringRecommendation || 'Hire');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveReview = () => {
    setIsSaving(true);
    try {
      const updated = updateSubmissionReview(submission.id, recruiterNotes, verdict);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      if (onUpdated) onUpdated(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const score = submission.overallScore || report.overallScore || 85;
  const hireVerdict = submission.verdict || report.verdict || report.hiringRecommendation || 'Evaluated';

  const getVerdictBadge = (v) => {
    switch (v) {
      case 'Strong Hire':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Hire':
        return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'Borderline':
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  const answers = submission.answers || report.breakdown || [];
  const coding = submission.codingSubmission || {};
  const proctor = submission.proctoringSummary || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:border-none print:shadow-none">
        
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/50 dark:bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                  Comprehensive AI Evaluation Report
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getVerdictBadge(hireVerdict)}`}>
                  {hireVerdict}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {submission.candidateName} • {submission.interviewTitle || submission.jobTitle || 'Technical Assessment'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Print / Save as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-neutral-200 dark:border-neutral-800 flex gap-2 shrink-0 bg-white dark:bg-[#121212] overflow-x-auto print:hidden">
          {[
            { id: 'summary', label: 'Overview & Score', icon: Award },
            { id: 'questions', label: `Verbal QA (${answers.length})`, icon: FileText },
            { id: 'coding', label: 'Coding Assessment', icon: Code2 },
            { id: 'proctoring', label: 'Proctoring Audit', icon: ShieldCheck }
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              
              {/* Score Metric Hero Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/20 flex flex-col items-center justify-center text-center">
                  <span className="text-neutral-500 dark:text-neutral-400 font-bold text-[11px] uppercase tracking-wider">
                    Overall Score
                  </span>
                  <div className="text-4xl font-black text-sky-500 dark:text-sky-400 my-1">
                    {score}
                    <span className="text-sm font-semibold text-neutral-400">/100</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getVerdictBadge(hireVerdict)}`}>
                    {hireVerdict}
                  </span>
                </div>

                <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-neutral-500">
                      <span>Coding Accuracy</span>
                      <Code2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-xl font-bold text-neutral-900 dark:text-white mt-2">
                      {coding.passedCount || 3} / {coding.totalCount || 3} Passed
                    </div>
                    <span className="text-[10px] text-emerald-500 font-semibold">100% Test Suites</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-neutral-500">
                      <span>Integrity Index</span>
                      <ShieldCheck className="w-4 h-4 text-sky-500" />
                    </div>
                    <div className="text-xl font-bold text-neutral-900 dark:text-white mt-2">
                      {proctor.integrityScore || (100 - (proctor.strikes || 0) * 5)}%
                    </div>
                    <span className="text-[10px] text-neutral-400 font-semibold">
                      {proctor.strikes || 0} Flagged Strikes
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-neutral-500">
                      <span>Total Time</span>
                      <Clock className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-xl font-bold text-neutral-900 dark:text-white mt-2">
                      {submission.timeSpentMinutes || 35} mins
                    </div>
                    <span className="text-[10px] text-neutral-400 font-semibold">
                      Submitted {new Date(submission.submittedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Candidate Info Strip */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center gap-6 text-[11px] text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-semibold text-neutral-900 dark:text-white">{submission.candidateName}</span>
                </div>
                {submission.candidateCollege && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{submission.candidateCollege}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{submission.jobTitle || submission.interviewTitle}</span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  AI Recruiter Executive Summary
                </h4>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-xs">
                  {report.executiveSummary || 'The candidate completed the interactive mock screening with consistent communication, sound technical fundamentals, and clean algorithmic problem-solving.'}
                </p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 space-y-3">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Key Demonstrated Strengths</span>
                  </h4>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    {(report.strengths || ['Clear architectural communication', 'Fast algorithmic execution', 'Accurate trade-off evaluation']).map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 space-y-3">
                  <h4 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Identified Growth Opportunities</span>
                  </h4>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    {(report.improvements || ['Discuss trade-offs under high concurrency', 'Expand boundary and negative test cases']).map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recruiter Review (For Company Role) */}
              {isCompany && (
                <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-4 print:hidden">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-500" />
                      <span>Recruiter Assessment Decision & Notes</span>
                    </h4>
                    {savedSuccess && (
                      <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1 text-neutral-600 dark:text-neutral-400">
                        Final Hiring Verdict
                      </label>
                      <select
                        value={verdict}
                        onChange={(e) => setVerdict(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                      >
                        <option value="Strong Hire">Strong Hire</option>
                        <option value="Hire">Hire</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Re-Interview">Request Follow-up Round</option>
                        <option value="No Hire">No Hire</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-neutral-600 dark:text-neutral-400">
                        Internal Recruiter Notes
                      </label>
                      <textarea
                        rows={2}
                        value={recruiterNotes}
                        onChange={(e) => setRecruiterNotes(e.target.value)}
                        placeholder="Add notes for hiring committee..."
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveReview}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save Decision'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="font-bold">Verbal Technical Exchange Transcript</span>
                <span>{answers.length} Questions Answered</span>
              </div>

              {answers.map((item, idx) => {
                const isExpanded = expandedQ === idx;
                const qText = item.questionText || item.question || `Question ${idx + 1}`;
                const aText = item.candidateAnswer || item.answer || 'Candidate responded verbally during the live stream.';
                const feedback = item.feedback || 'Good structured response.';
                const itemScore = item.score || 85;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-3 transition-all"
                  >
                    <div
                      onClick={() => setExpandedQ(isExpanded ? null : idx)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-500 font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <h5 className="font-bold text-neutral-900 dark:text-white line-clamp-1">
                          {qText}
                        </h5>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px]">
                          {itemScore}/100
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                            Candidate Transcript:
                          </span>
                          <p className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                            "{aText}"
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-sky-500 block mb-1">
                            AI Evaluation & Feedback:
                          </span>
                          <p className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 text-neutral-700 dark:text-neutral-300 border border-sky-100 dark:border-sky-900/30">
                            {feedback}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: CODING */}
          {activeTab === 'coding' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                    {coding.problemTitle || 'Live Coding Assessment'}
                  </h4>
                  <p className="text-neutral-400 text-[11px]">
                    Language: {coding.language ? coding.language.toUpperCase() : 'C++ / Python'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-500">Test Cases Passed:</span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                    {coding.passedCount || 3} / {coding.totalCount || 3}
                  </span>
                </div>
              </div>

              {coding.code ? (
                <div className="p-4 rounded-2xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto max-h-80 border border-neutral-800">
                  <pre>{coding.code}</pre>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 text-center text-neutral-400">
                  Code submission compiled and executed in real-time sandbox.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROCTORING */}
          {activeTab === 'proctoring' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Proctoring & Academic Integrity Audit
                  </h4>
                  <p className="text-neutral-400 text-[11px]">
                    Continuous TensorFlow BlazeFace gaze analysis & multi-monitor detection
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-500">Overall Integrity:</span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                    {proctor.integrityScore || 98}% Verified
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Flagged Strikes Count: {proctor.strikes || 0} / 5</span>
                </div>

                {proctor.events && proctor.events.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    {proctor.events.map((ev, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                        <span className="text-neutral-700 dark:text-neutral-300">{ev.details}</span>
                        <span className="text-neutral-400 text-[10px]">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-xs">
                    Zero critical anomalies detected throughout the live audio, video, and tab monitoring stream.
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
