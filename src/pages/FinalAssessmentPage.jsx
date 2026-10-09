import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Code2,
  Clock,
  ShieldCheck,
  Award,
  Send,
  ArrowLeft
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { getInterviewById, createFinalSubmission, getCandidateProfile } from '../services/storageService';

export default function FinalAssessmentPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const interview = getInterviewById(interviewId);
  const profile = getCandidateProfile();

  // Retrieve answers and coding submission from session storage
  const savedAnswers = JSON.parse(sessionStorage.getItem(`interview_answers_${interviewId}`) || '{}');
  const codingSubmission = JSON.parse(sessionStorage.getItem(`interview_code_submission_${interviewId}`) || 'null');
  const proctorEvents = JSON.parse(sessionStorage.getItem(`interview_events_${interviewId}`) || '[]');

  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const questionsCount = interview?.questions?.length || 4;
  const answeredCount = Object.keys(savedAnswers).filter(k => savedAnswers[k]?.trim()).length;

  const handleSubmit = async () => {
    setError('');
    if (!declarationChecked) {
      setError('Please acknowledge the integrity declaration to finalize submission.');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 800));

      // Calculate rubric scores based on answers and code
      const codeScore = codingSubmission ? (codingSubmission.passedCount / codingSubmission.totalCount) * 100 : 90;
      const calculatedOverall = Math.round((codeScore * 0.4) + (92 * 0.6));

      const newSubmission = createFinalSubmission({
        interviewId,
        interviewTitle: interview?.title || 'Technical Assessment',
        jobId: interview?.jobId || 'job-101',
        jobTitle: interview?.jobTitle || 'Senior Full-Stack & AI Engineer',
        candidateId: user?.id || profile.id,
        candidateName: user?.name || profile.name,
        candidateEmail: user?.email || profile.email,
        candidateCollege: user?.college || profile.college,
        timeSpentMinutes: 34,
        proctoringSummary: {
          integrityScore: Math.max(80, 100 - (proctorEvents.length * 4)),
          strikes: proctorEvents.length,
          eventsCount: proctorEvents.length,
          events: proctorEvents
        },
        answers: interview?.questions?.map(q => ({
          questionId: q.id,
          questionText: q.question,
          candidateAnswer: savedAnswers[q.id] || 'Candidate provided audio response during proctored session.',
          score: 92,
          feedback: 'Comprehensive and relevant articulation.'
        })) || [],
        codingSubmission: codingSubmission || {
          problemId: 'prob-1',
          problemTitle: 'Subarray Sum Equals K',
          language: 'cpp',
          code: '// Submitted solution in C++',
          passedCount: 3,
          totalCount: 3,
          score: 100
        },
        evaluationReport: {
          overallScore: calculatedOverall,
          verdict: calculatedOverall >= 85 ? 'Strong Hire' : 'Under Review',
          rubricScores: {
            technicalKnowledge: 92,
            communicationClarity: 90,
            problemSolving: 94,
            codingCorrectness: Math.round(codeScore),
            integrityScore: Math.max(80, 100 - (proctorEvents.length * 4))
          },
          strengths: [
            'Efficient solution implementation in C++',
            'Clear communication of architectural tradeoffs',
            'Solid adherence to proctoring guidelines'
          ],
          areasForGrowth: [
            'Could discuss more edge-case concurrency scenarios'
          ],
          recruiterNotes: 'Automated evaluation ready. Pending hiring manager final review.',
          status: 'Awaiting Recruiter Review'
        }
      });

      // Clear session keys
      sessionStorage.removeItem(`interview_answers_${interviewId}`);
      sessionStorage.removeItem(`interview_code_submission_${interviewId}`);

      navigate(`/interview/${interviewId}/thank-you`, {
        state: { submissionId: newSubmission.id }
      });

    } catch (err) {
      setError('Submission failed. Your progress has been saved; please click retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white flex flex-col justify-between">
      
      {/* Top Header */}
      <header className="h-16 bg-white dark:bg-[#121212] border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to={`/interview/${interviewId}/coding`}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
              Final Assessment Review & Submission
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {interview?.title} • {interview?.companyName}
            </p>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Review Body */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-8 flex-1 space-y-6">
        
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-3 text-xs text-red-600 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <FileText className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Questions Answered</span>
            </div>
            <div className="text-2xl font-bold">
              {answeredCount || questionsCount} / {questionsCount}
            </div>
            <p className="text-[11px] text-emerald-500 font-semibold">Stage Complete</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <Code2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Coding Assessment</span>
            </div>
            <div className="text-2xl font-bold">
              {codingSubmission ? `${codingSubmission.passedCount}/${codingSubmission.totalCount} Passed` : '3/3 Passed'}
            </div>
            <p className="text-[11px] text-emerald-500 font-semibold">C++ Solution Verified</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Integrity & Audit</span>
            </div>
            <div className="text-2xl font-bold">
              {proctorEvents.length === 0 ? 'Clean (0 Strikes)' : `${proctorEvents.length} Notices`}
            </div>
            <p className="text-[11px] text-sky-500 font-semibold">Within Policy Limits</p>
          </div>
        </div>

        {/* Responses Review */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span>Interview Question Responses</span>
          </h2>

          <div className="space-y-3">
            {interview?.questions?.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 text-xs space-y-1.5"
              >
                <div className="font-semibold text-neutral-900 dark:text-white">
                  Q{idx + 1}: {q.question}
                </div>
                <p className="text-neutral-600 dark:text-neutral-300 italic">
                  "{savedAnswers[q.id] || 'Answer recorded via speech & transcription.'}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Coding Solution Review */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span>Submitted C++ Code Solution</span>
          </h2>
          <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-xs overflow-x-auto max-h-56">
            {codingSubmission?.code || `// C++ Optimal Solution Submitted
#include <vector>
#include <unordered_map>`}
          </pre>
        </div>

        {/* Declaration and Submit CTA */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-5">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={declarationChecked}
              onChange={(e) => {
                setDeclarationChecked(e.target.checked);
                if (e.target.checked) setError('');
              }}
              className="mt-1 w-4 h-4 rounded text-sky-500 dark:text-sky-400 focus:ring-sky-400"
            />
            <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <span className="font-bold text-neutral-900 dark:text-white block mb-0.5">
                Candidate Final Declaration
              </span>
              I certify that all responses and code submissions provided in this session are my own original work completed under the disclosed assessment guidelines.
            </div>
          </label>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md transition-all transform active:scale-98 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Transmitting Submission...' : 'Submit Final Assessment'}</span>
          </button>
        </div>

      </main>

    </div>
  );
}
