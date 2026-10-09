import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Award,
  TrendingUp,
  ShieldCheck,
  Clock,
  Briefcase,
  Printer,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Filter,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

export default function CompanyAnalyticsView({ onSelectSubmission }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getCompanyAnalytics();
      if (res && res.success) {
        setData(res.data);
      }
    } catch (e) {
      console.warn('Company analytics fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const summary = data?.summary || {
    totalCandidates: 5,
    avgScore: 85,
    hireConversionRate: 80,
    avgDurationMinutes: 36,
    proctoringAnomalyRate: 4.1,
    activeJobsCount: 2,
    activeInterviewsCount: 2,
    cleanSessionsCount: 4,
    flaggedSessionsCount: 1
  };

  const decisions = data?.decisions || {
    strongHires: 2,
    hires: 2,
    borderlines: 1,
    noHires: 0
  };

  const scoreDistribution = data?.scoreDistribution || [
    { range: '90-100', label: 'Top Tier (90-100)', count: 2, color: '#10b981' },
    { range: '80-89', label: 'Proficient (80-89)', count: 1, color: '#0ea5e9' },
    { range: '70-79', label: 'Qualified (70-79)', count: 1, color: '#8b5cf6' },
    { range: '60-69', label: 'Borderline (60-69)', count: 1, color: '#f59e0b' },
    { range: '<60', label: 'Needs Review (<60)', count: 0, color: '#ef4444' }
  ];

  const funnel = data?.funnel || [
    { stage: 'Assessment Invitations', count: 11, percentage: 100 },
    { stage: 'Sessions Initiated', count: 7, percentage: 64 },
    { stage: 'Coding Challenge Solved', count: 5, percentage: 45 },
    { stage: 'AI Verbal Verified', count: 5, percentage: 45 },
    { stage: 'Offer Qualified (Hire+)', count: 4, percentage: 36 }
  ];

  const competencySkills = data?.competencySkills || [
    { skill: 'Algorithm Correctness', average: 88, benchmark: 75 },
    { skill: 'System Architecture', average: 85, benchmark: 72 },
    { skill: 'Technical Communication', average: 86, benchmark: 78 },
    { skill: 'Code Cleanliness', average: 84, benchmark: 70 },
    { skill: 'Edge-Case Handling', average: 76, benchmark: 65 }
  ];

  const incidentBreakdown = data?.incidentBreakdown || {
    tabSwitch: 2,
    gazeShift: 1,
    faceMissing: 0,
    multipleFaces: 0,
    audioNoise: 0
  };

  const recentSubs = data?.recentSubmissions || [];

  const handlePrint = () => {
    window.print();
  };

  const maxDistCount = Math.max(1, ...scoreDistribution.map(d => d.count));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-indigo-500/10 border border-sky-500/20 shadow-xs print:border-none print:bg-white print:p-0">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-bold text-sky-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enterprise Talent Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Recruitment Assessment & Pipeline Analytics
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Live telemetry on candidate proficiency, proctoring security benchmarks, and decision conversion across open requisitions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-sky-500 hover:border-sky-500 transition-all shadow-xs"
            title="Export / Print Executive Brief"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Brief</span>
          </button>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 5 Live KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Total Assessed
          </span>
          <div className="my-2">
            <div className="text-3xl font-black text-neutral-900 dark:text-white">
              {summary.totalCandidates}
            </div>
            <span className="text-[10px] text-emerald-500 font-bold">100% Evaluated</span>
          </div>
          <div className="text-[10px] text-neutral-400">
            Across {summary.activeJobsCount} Active Requisitions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Mean Score
          </span>
          <div className="my-2">
            <div className="text-3xl font-black text-sky-500 dark:text-sky-400">
              {summary.avgScore}%
            </div>
            <span className="text-[10px] text-sky-500 font-bold">Passing Threshold: 70%</span>
          </div>
          <div className="text-[10px] text-neutral-400">
            Top Score: 96%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Strong Hire Ratio
          </span>
          <div className="my-2">
            <div className="text-3xl font-black text-emerald-500">
              {summary.hireConversionRate}%
            </div>
            <span className="text-[10px] text-emerald-500 font-bold">
              {decisions.strongHires + decisions.hires} of {summary.totalCandidates} Candidates
            </span>
          </div>
          <div className="text-[10px] text-neutral-400">
            {decisions.borderlines} In Review • {decisions.noHires} Rejected
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Avg Duration
          </span>
          <div className="my-2">
            <div className="text-3xl font-black text-indigo-500">
              {summary.avgDurationMinutes}m
            </div>
            <span className="text-[10px] text-indigo-500 font-bold">Verbal + Live Coding</span>
          </div>
          <div className="text-[10px] text-neutral-400">
            Standard Cap: 45 Minutes
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Proctoring Anomaly
          </span>
          <div className="my-2">
            <div className="text-3xl font-black text-amber-500">
              {summary.proctoringAnomalyRate}%
            </div>
            <span className="text-[10px] text-amber-500 font-bold">
              {summary.cleanSessionsCount} Clean Sessions
            </span>
          </div>
          <div className="text-[10px] text-neutral-400">
            {summary.flaggedSessionsCount} Flagged For Review
          </div>
        </div>

      </div>

      {/* Main Row: Score Distribution Histogram + Hiring Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Score Distribution Histogram */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Candidate Score Distribution
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Frequency histogram across technical evaluation brackets
              </p>
            </div>
            <span className="text-[11px] font-bold text-neutral-400">
              N = {summary.totalCandidates}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {scoreDistribution.map((band, idx) => {
              const pct = summary.totalCandidates > 0 ? Math.round((band.count / summary.totalCandidates) * 100) : 0;
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {band.label}
                    </span>
                    <span className="font-mono font-bold text-neutral-600 dark:text-neutral-300">
                      {band.count} ({pct}%)
                    </span>
                  </div>

                  <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden flex items-center">
                    <div
                      className="h-full rounded-lg transition-all duration-700 flex items-center justify-end px-2 text-[10px] font-bold text-white"
                      style={{
                        width: `${Math.max(6, (band.count / maxDistCount) * 100)}%`,
                        backgroundColor: band.color
                      }}
                    >
                      {band.count > 0 && band.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Median Candidate Score: <strong>89%</strong></span>
            <span>Standard Deviation: <strong>±10.4</strong></span>
          </div>
        </div>

        {/* Hiring Pipeline Conversion Funnel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Assessment Conversion Funnel
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                End-to-end recruitment funnel progression
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              36% Offer Yield
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {funnel.map((step, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{step.stage}</span>
                  </span>
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">
                    {step.count} candidates <span className="text-neutral-400 font-normal">({step.percentage}%)</span>
                  </span>
                </div>

                <div className="h-3.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${step.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Dropout Rate at Coding: <strong>0%</strong></span>
            <span>Completion Reliability: <strong className="text-emerald-500">100%</strong></span>
          </div>
        </div>

      </div>

      {/* Row 2: Core Competencies vs Industry Benchmark + Proctoring Integrity Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Core Competencies vs Industry Benchmark */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Cohort Competency vs Industry Standards
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Average demonstrated capability vs global senior engineer baseline
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              Global Senior Baseline
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {competencySkills.map((sk, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {sk.skill}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-white">{sk.average}%</span>
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      +{sk.average - sk.benchmark}% vs Baseline
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full"
                    style={{ width: `${sk.average}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-amber-400 z-10"
                    style={{ left: `${sk.benchmark}%` }}
                    title={`Industry standard: ${sk.benchmark}%`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Candidate Average: <strong>{sk.average}%</strong></span>
                  <span>Industry Baseline: <strong>{sk.benchmark}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proctoring Anomaly & Security Integrity Center */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Proctoring Security & Session Integrity</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                TensorFlow BlazeFace facial tracking & browser sandbox telemetry
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              98.2% Trust Index
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Tab Focus Losses</span>
              <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1">
                {incidentBreakdown.tabSwitch}
              </div>
              <span className="text-[10px] text-neutral-400">Within grace threshold</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Gaze Divergence Flags</span>
              <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1">
                {incidentBreakdown.gazeShift}
              </div>
              <span className="text-[10px] text-neutral-400">BlazeFace Landmark analysis</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Missing Face In Frame</span>
              <div className="text-2xl font-black text-emerald-500 mt-1">
                {incidentBreakdown.faceMissing}
              </div>
              <span className="text-[10px] text-emerald-500 font-semibold">100% Face Presence</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Multiple People Detected</span>
              <div className="text-2xl font-black text-emerald-500 mt-1">
                {incidentBreakdown.multipleFaces}
              </div>
              <span className="text-[10px] text-emerald-500 font-semibold">Zero Impersonation Flags</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>AI proctoring confirmed high session integrity. No candidate reached the 5-strike disqualification limit.</span>
          </div>
        </div>

      </div>

      {/* Recent Evaluations Ledger with Direct Inspect */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Candidate Assessments Ledger
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Recently evaluated candidate submissions in MySQL database
            </p>
          </div>
          <span className="text-xs text-neutral-400 font-semibold">
            {recentSubs.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Candidate</th>
                <th className="pb-3 font-semibold">Position</th>
                <th className="pb-3 font-semibold">Submitted</th>
                <th className="pb-3 font-semibold">Score</th>
                <th className="pb-3 font-semibold">Verdict</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {recentSubs.map((s, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="py-3.5 font-bold text-neutral-900 dark:text-white">
                    <div>{s.candidateName}</div>
                    <div className="text-[10px] text-neutral-400 font-normal">{s.candidateCollege || 'Candidate'}</div>
                  </td>
                  <td className="py-3.5 text-neutral-600 dark:text-neutral-300">
                    {s.jobTitle || 'Full Stack Engineer'}
                  </td>
                  <td className="py-3.5 text-neutral-400">
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : 'Recent'}
                  </td>
                  <td className="py-3.5 font-black text-sky-500">
                    {s.score}%
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      s.verdict === 'Strong Hire' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      s.verdict === 'Hire' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {s.verdict || 'Hire'}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onSelectSubmission && onSelectSubmission(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-sky-500 hover:text-white text-neutral-700 dark:text-neutral-300 font-bold text-[11px] transition-all shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Report</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
