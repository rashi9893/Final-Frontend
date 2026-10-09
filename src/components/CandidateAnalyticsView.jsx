import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  ShieldCheck,
  Code2,
  Brain,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Calendar,
  ExternalLink,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function CandidateAnalyticsView({ candidateId = 'cand-1', onSelectSubmission }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getCandidateAnalytics(candidateId);
      if (res && res.success) {
        setData(res.data);
      }
    } catch (e) {
      console.warn('Analytics fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [candidateId]);

  // Fallback defaults if data loading
  const summary = data?.summary || {
    totalInterviews: 5,
    averageScore: 91,
    highestScore: 96,
    percentileRank: 92,
    integrityIndex: 98.4,
    codingSuccessRate: '100%'
  };

  const radarSkills = data?.radarSkills || [
    { skill: 'Data Structures & Algorithmic Logic', candidateScore: 94, peerBenchmark: 74, status: 'Master' },
    { skill: 'System Architecture & Concurrency', candidateScore: 88, peerBenchmark: 70, status: 'Proficient' },
    { skill: 'Verbal Articulation & Terminology', candidateScore: 92, peerBenchmark: 76, status: 'Proficient' },
    { skill: 'Code Modularity & Best Practices', candidateScore: 96, peerBenchmark: 78, status: 'Expert' },
    { skill: 'Edge Case & Fault Tolerance', candidateScore: 84, peerBenchmark: 68, status: 'Strong' }
  ];

  const timeline = data?.timeline || [
    { index: 1, date: 'Oct 02', score: 78, title: 'Systems Screening', verdict: 'Hire' },
    { index: 2, date: 'Oct 04', score: 85, title: 'React Full-Stack', verdict: 'Hire' },
    { index: 3, date: 'Oct 06', score: 89, title: 'Full-Stack Technical', verdict: 'Hire' },
    { index: 4, date: 'Oct 08', score: 94, title: 'Adaptive AI Screening', verdict: 'Strong Hire' },
    { index: 5, date: 'Oct 09', score: 96, title: 'AI Recruiter Assessment', verdict: 'Strong Hire' }
  ];

  const latest = data?.latestEvaluation || {
    score: 94,
    verdict: 'Strong Hire',
    strengths: ['Deep algorithmic understanding with O(N) hash solution', 'Precise technical terminology', 'Practical full-stack concurrency awareness'],
    improvements: ['Elaborate on database isolation levels under replication lag', 'Demonstrate formal distributed systems boundary analysis'],
    recommendations: [
      { topic: 'Distributed Consensus & Raft Protocol', priority: 'High', resource: 'MIT 6.824 Distributed Systems Lab' },
      { topic: 'Linux eBPF & Low-Level Profiling', priority: 'Medium', resource: 'Brendan Gregg Systems Performance Guide' },
      { topic: 'Database Isolation Levels & MVCC', priority: 'Medium', resource: 'Designing Data-Intensive Applications Ch. 7' }
    ]
  };

  // SVG Chart points calculation
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 30;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingY * 2;

  const points = timeline.map((pt, i) => {
    const x = paddingX + (i / Math.max(1, timeline.length - 1)) * graphWidth;
    const y = paddingY + graphHeight - ((pt.score - 50) / 50) * graphHeight;
    return { x, y, ...pt };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/20 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-bold text-sky-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Talent Intelligence Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            AI Skill & Performance Analytics
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Multi-dimensional evaluation telemetry synthesized across real-time voice, code execution, and TensorFlow gaze tracking.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-sky-500 hover:border-sky-500 transition-all shadow-xs self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="font-bold text-xs uppercase tracking-wider">Average Technical Score</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {summary.averageScore}%
            </div>
            <div className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Top {100 - summary.percentileRank}% Platform Percentile</span>
            </div>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full transition-all duration-700" style={{ width: `${summary.averageScore}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="font-bold text-xs uppercase tracking-wider">Proctoring Integrity Index</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {summary.integrityIndex}%
            </div>
            <div className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero High-Severity Flags</span>
            </div>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${summary.integrityIndex}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="font-bold text-xs uppercase tracking-wider">Coding Pass Rate</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {summary.codingSuccessRate}
            </div>
            <div className="text-[11px] font-bold text-indigo-500 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Test Cases Verified</span>
            </div>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full transition-all duration-700" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="font-bold text-xs uppercase tracking-wider">Completed Sessions</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {summary.totalInterviews}
            </div>
            <div className="text-[11px] font-bold text-purple-500 flex items-center gap-1 mt-0.5">
              <Award className="w-3.5 h-3.5" />
              <span>Highest Score: {summary.highestScore}%</span>
            </div>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full transition-all duration-700" style={{ width: '85%' }} />
          </div>
        </div>

      </div>

      {/* Main Grid: Radar Competency Bars + Score Progression Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar & Competency Benchmarking */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Core Competency Benchmark
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Your performance score vs peer platform benchmark
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20">
              Adaptive Weights
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {radarSkills.map((sk, idx) => {
              const diff = sk.candidateScore - sk.peerBenchmark;
              return (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {sk.skill}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sky-500">{sk.candidateScore}%</span>
                      <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        +{diff}% vs Peer
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar (Candidate vs Peer Benchmark) */}
                  <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${sk.candidateScore}%` }}
                    />
                    {/* Peer marker */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-amber-400 z-10"
                      style={{ left: `${sk.peerBenchmark}%` }}
                      title={`Peer average: ${sk.peerBenchmark}%`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span>Rank: <strong className="text-neutral-600 dark:text-neutral-300">{sk.status}</strong></span>
                    <span>Peer Benchmark: {sk.peerBenchmark}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score Progression Line Chart (SVG) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Score Progression Curve
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Trajectory across completed assessment runs
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                +18% Growth
              </span>
            </div>

            {/* SVG Line Graph */}
            <div className="mt-6 relative">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 overflow-visible">
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[60, 75, 90, 100].map((val, idx) => {
                  const y = paddingY + graphHeight - ((val - 50) / 50) * graphHeight;
                  return (
                    <g key={idx}>
                      <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="currentColor" strokeDasharray="3 3" className="text-neutral-200 dark:text-neutral-800" strokeWidth="1" />
                      <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-neutral-400 font-mono">
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Area under curve */}
                {areaD && <path d={areaD} fill="url(#curveGradient)" />}

                {/* Line Path */}
                {pathD && <path d={pathD} fill="none" stroke="#0ea5e9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Points on curve */}
                {points.map((pt, i) => (
                  <g
                    key={i}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle cx={pt.x} cy={pt.y} r="6" className="fill-white dark:fill-[#141414] stroke-sky-500" strokeWidth="3" />
                    <text x={pt.x} y={svgHeight - 8} textAnchor="middle" className="text-[10px] fill-neutral-400 font-semibold">
                      {pt.date}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip */}
              {hoveredPoint && (
                <div
                  className="absolute z-20 pointer-events-none p-2.5 rounded-xl bg-neutral-900 text-white shadow-xl text-[11px] border border-neutral-700 animate-in zoom-in-95 duration-150"
                  style={{
                    left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                    top: `${(hoveredPoint.y / svgHeight) * 80}%`,
                    transform: 'translate(-50%, -120%)'
                  }}
                >
                  <div className="font-bold">{hoveredPoint.title}</div>
                  <div className="text-sky-400 font-black">{hoveredPoint.score}% Score • {hoveredPoint.verdict}</div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
            <span>Baseline Starting Score: <strong>78%</strong></span>
            <span>Current High: <strong className="text-sky-500 font-black">96%</strong></span>
          </div>
        </div>

      </div>

      {/* AI Strengths & Targeted Learning Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Demonstrated Strengths & Highlights */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>AI Verified Core Strengths</span>
          </h3>

          <div className="space-y-3">
            {latest.strengths.map((str, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </span>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {str}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Curated Learning Roadmap */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-500" />
            <span>Recommended Learning Roadmap</span>
          </h3>

          <div className="space-y-3">
            {latest.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-neutral-900 dark:text-white">
                    {rec.topic}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Recommended Resource: {rec.resource}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  rec.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                }`}>
                  {rec.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
