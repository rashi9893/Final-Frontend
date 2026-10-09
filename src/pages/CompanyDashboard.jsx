import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Briefcase,
  PlusCircle,
  Users,
  Award,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Search,
  Filter,
  Code2,
  ShieldCheck,
  TrendingUp,
  FileText,
  ChevronRight,
  Sparkles,
  Edit3,
  Trash2,
  Save,
  Send
} from 'lucide-react';
import DashboardSidebar from '../components/DashboardSidebar';
import ThemeToggle from '../components/ThemeToggle';
import CompanyAnalyticsView from '../components/CompanyAnalyticsView';
import SubmissionDetailModal from '../components/SubmissionDetailModal';
import { useAuth } from '../context/AuthContext';
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getInterviews,
  createInterview,
  getSubmissions,
  updateSubmissionReview,
  getCodingProblems,
  getCompanyProfile
} from '../services/storageService';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [jobs, setJobs] = useState(() => getJobs());
  const [interviews, setInterviews] = useState(() => getInterviews());
  const [submissions, setSubmissions] = useState(() => getSubmissions());
  const [codingProblems, setCodingProblems] = useState(() => getCodingProblems());
  const [companyProfile, setCompanyProfile] = useState(() => getCompanyProfile());

  // Search & Filter state for candidates
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [recruiterNotesInput, setRecruiterNotesInput] = useState('');
  const [verdictInput, setVerdictInput] = useState('Strong Hire');

  // Job creation form modal state
  const [showJobModal, setShowJobModal] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    experience: '2+ years',
    description: '',
    requiredSkills: 'React, C++, Python, System Design'
  });

  // Interview creation form state
  const [interviewForm, setInterviewForm] = useState({
    jobId: jobs[0]?.id || 'job-101',
    title: '',
    durationMinutes: 45,
    language: 'English',
    codingProblemId: 'prob-1',
    description: ''
  });

  useEffect(() => {
    setJobs(getJobs());
    setInterviews(getInterviews());
    setSubmissions(getSubmissions());
    setCodingProblems(getCodingProblems());
  }, [activeTab]);

  const handleCreateJob = (e) => {
    e.preventDefault();
    if (!newJobForm.title.trim()) return;

    const created = createJob({
      companyId: user?.id || 'comp-1',
      companyName: companyProfile.companyName,
      title: newJobForm.title,
      department: newJobForm.department,
      location: newJobForm.location,
      experience: newJobForm.experience,
      description: newJobForm.description || 'Role responsible for engineering scalable architectures.',
      requiredSkills: newJobForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
    });

    setJobs(getJobs());
    setShowJobModal(false);
    setNewJobForm({
      title: '',
      department: 'Engineering',
      location: 'Remote',
      experience: '2+ years',
      description: '',
      requiredSkills: 'React, C++, Python, System Design'
    });
  };

  const handleCreateInterview = (e) => {
    e.preventDefault();
    const targetJob = jobs.find(j => j.id === interviewForm.jobId) || jobs[0];

    createInterview({
      jobId: targetJob.id,
      jobTitle: targetJob.title,
      companyId: user?.id || 'comp-1',
      companyName: companyProfile.companyName,
      title: interviewForm.title || `${targetJob.title} Assessment`,
      description: interviewForm.description || 'Standard technical and behavioral assessment.',
      durationMinutes: Number(interviewForm.durationMinutes),
      language: interviewForm.language,
      codingProblemId: interviewForm.codingProblemId,
      requiredSkills: targetJob.requiredSkills,
      questions: [
        {
          id: `q-${Date.now()}-1`,
          category: 'System Architecture',
          question: `How do you structure resilient microservices and caching for ${targetJob.title}?`
        },
        {
          id: `q-${Date.now()}-2`,
          category: 'Algorithmic Problem-Solving',
          question: 'Describe your approach to finding and fixing memory bottlenecks under concurrency.'
        }
      ]
    });

    setInterviews(getInterviews());
    setActiveTab('overview');
  };

  const handleOpenSubmissionReview = (sub) => {
    setSelectedSubmission(sub);
    setRecruiterNotesInput(sub.evaluationReport?.recruiterNotes || '');
    setVerdictInput(sub.evaluationReport?.verdict || 'Strong Hire');
  };

  const handleSaveReview = () => {
    if (!selectedSubmission) return;
    const updated = updateSubmissionReview(selectedSubmission.id, recruiterNotesInput, verdictInput);
    setSelectedSubmission(updated);
    setSubmissions(getSubmissions());
  };

  const filteredSubmissions = submissions.filter(s =>
    s.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.candidateEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#0A0A0A] flex text-neutral-900 dark:text-white">
      
      {/* Sidebar */}
      <DashboardSidebar
        role="company"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-[#121212] border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-8 w-px bg-neutral-200 dark:border-neutral-800 mx-1"></div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {companyProfile.companyName[0]}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold block leading-tight">
                  {companyProfile.contactPerson}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {companyProfile.companyName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Header metrics banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-sky-600 dark:bg-neutral-900 border border-sky-500 dark:border-neutral-800 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25">
                    Recruiter Console
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {companyProfile.companyName} Talent Pipeline
                  </h2>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Review incoming candidate responses, live code submissions, and calibrated AI evaluation reports.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowJobModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs shadow hover:bg-neutral-100 transition-all flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Job</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('create-interview')}
                    className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs border border-white/25 transition-all flex items-center gap-1.5"
                  >
                    <span>New Interview</span>
                  </button>
                </div>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Active Job Postings</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{jobs.length}</span>
                    <span className="text-xs text-sky-500 font-semibold">Published</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total Applicants</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">23</span>
                    <span className="text-xs text-emerald-500 font-semibold">+18% this week</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Completed Submissions</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{submissions.length}</span>
                    <span className="text-xs text-sky-500 font-semibold">Evaluated</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Average Coding Score</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">94%</span>
                    <span className="text-xs text-emerald-500 font-semibold">High Proficiency</span>
                  </div>
                </div>
              </div>

              {/* Recent Submissions Table */}
              <div className="bg-white dark:bg-[#141414] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Recent Interview Submissions
                  </h3>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>View all reports</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                        <th className="pb-3">Candidate</th>
                        <th className="pb-3">Job Applied</th>
                        <th className="pb-3">Score</th>
                        <th className="pb-3">Coding</th>
                        <th className="pb-3">Integrity</th>
                        <th className="pb-3">Verdict</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                      {submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3.5 font-medium text-neutral-900 dark:text-white">
                            <div>{sub.candidateName}</div>
                            <div className="text-[10px] text-neutral-400">{sub.candidateEmail}</div>
                          </td>
                          <td className="py-3.5 text-neutral-600 dark:text-neutral-300">
                            {sub.jobTitle}
                          </td>
                          <td className="py-3.5 font-bold text-neutral-900 dark:text-white">
                            {sub.evaluationReport?.overallScore || 94}%
                          </td>
                          <td className="py-3.5">
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                              <Code2 className="w-3.5 h-3.5" />
                              {sub.codingSubmission?.passedCount || 3}/{sub.codingSubmission?.totalCount || 3}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {sub.proctoringSummary?.integrityScore || 98}%
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                              {sub.evaluationReport?.verdict || 'Strong Hire'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => {
                                handleOpenSubmissionReview(sub);
                                setActiveTab('reports');
                              }}
                              className="px-3 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold text-[11px]"
                            >
                              Review Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: JOB OPENINGS */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Company Job Openings
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Manage active postings, required technical stacks, and linked interview assessments.
                  </p>
                </div>
                <button
                  onClick={() => setShowJobModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Job Opening</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {job.status}
                        </span>
                        <span className="text-xs text-neutral-400">
                          Created {job.createdAt}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {job.title}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {job.department} • {job.location} • {job.experience}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {job.requiredSkills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-700 dark:text-neutral-300 font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                      <span className="text-neutral-500">
                        {job.applicantsCount} Applicants
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteJob(job.id) && setJobs(getJobs())}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CREATE INTERVIEW */}
          {activeTab === 'create-interview' && (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Configure New Interview Session
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Specify interview parameters, question rubrics, and the C++ coding assessment challenge.
                </p>
              </div>

              <form onSubmit={handleCreateInterview} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Target Job Opening</label>
                  <select
                    value={interviewForm.jobId}
                    onChange={(e) => setInterviewForm({ ...interviewForm, jobId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm"
                  >
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Interview Title</label>
                  <input
                    type="text"
                    required
                    value={interviewForm.title}
                    onChange={(e) => setInterviewForm({ ...interviewForm, title: e.target.value })}
                    placeholder="e.g. Senior Full-Stack Technical Screening"
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={interviewForm.durationMinutes}
                      onChange={(e) => setInterviewForm({ ...interviewForm, durationMinutes: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Primary Interview Language</label>
                    <select
                      value={interviewForm.language}
                      onChange={(e) => setInterviewForm({ ...interviewForm, language: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="German">German</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Assigned Coding Problem</label>
                  <select
                    value={interviewForm.codingProblemId}
                    onChange={(e) => setInterviewForm({ ...interviewForm, codingProblemId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm"
                  >
                    {Object.values(codingProblems).map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.difficulty} - {p.language.toUpperCase()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Session Instructions</label>
                  <textarea
                    rows={3}
                    value={interviewForm.description}
                    onChange={(e) => setInterviewForm({ ...interviewForm, description: e.target.value })}
                    placeholder="Provide overview instructions for the candidate..."
                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow transition-all"
                  >
                    Publish Interview Assessment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: CANDIDATES DIRECTORY */}
          {activeTab === 'candidates' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Candidate Directory
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Filter and inspect candidate profiles, uploaded resumes, and evaluation states.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate name or skill..."
                    className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 text-xs w-64 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                          {sub.candidateName}
                        </h3>
                        <p className="text-xs text-neutral-500">{sub.candidateEmail}</p>
                        <p className="text-xs text-neutral-400">{sub.candidateCollege}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {sub.evaluationReport?.verdict || 'Strong Hire'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 text-xs flex justify-between">
                      <span>Overall Evaluation Score:</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400">
                        {sub.evaluationReport?.overallScore || 94} / 100
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        handleOpenSubmissionReview(sub);
                        setActiveTab('reports');
                      }}
                      className="w-full py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      View Full Candidate Dossier
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EVALUATION REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Evaluation Reports & Recruiter Review
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Inspect candidate answers, examine actual C++ test runs, review proctoring audit trails, and append notes.
                </p>
              </div>

              {selectedSubmission ? (
                <div className="space-y-6 bg-white dark:bg-[#141414] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {selectedSubmission.evaluationReport?.verdict}
                        </span>
                        <span className="text-xs text-neutral-400">
                          Submitted {new Date(selectedSubmission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                        {selectedSubmission.candidateName} — {selectedSubmission.jobTitle}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {selectedSubmission.candidateCollege} • {selectedSubmission.candidateEmail}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-4xl font-extrabold text-sky-500 dark:text-sky-400">
                        {selectedSubmission.evaluationReport?.overallScore}
                      </span>
                      <span className="text-sm text-neutral-400"> / 100</span>
                    </div>
                  </div>

                  {/* Rubric Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                      <span className="text-neutral-500 block">Technical Knowledge</span>
                      <span className="text-lg font-bold text-neutral-900 dark:text-white">
                        {selectedSubmission.evaluationReport?.rubricScores?.technicalKnowledge}%
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                      <span className="text-neutral-500 block">Communication</span>
                      <span className="text-lg font-bold text-neutral-900 dark:text-white">
                        {selectedSubmission.evaluationReport?.rubricScores?.communicationClarity}%
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                      <span className="text-neutral-500 block">Coding Correctness</span>
                      <span className="text-lg font-bold text-neutral-900 dark:text-white">
                        {selectedSubmission.evaluationReport?.rubricScores?.codingCorrectness}%
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                      <span className="text-neutral-500 block">Session Integrity</span>
                      <span className="text-lg font-bold text-neutral-900 dark:text-white">
                        {selectedSubmission.proctoringSummary?.integrityScore}%
                      </span>
                    </div>
                  </div>

                  {/* Candidate Answers Dossier */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      Interview Question Answers & Scores
                    </h4>
                    {selectedSubmission.answers?.map((ans, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200/70 dark:border-neutral-700/70 text-xs space-y-1.5"
                      >
                        <div className="flex justify-between font-semibold text-neutral-900 dark:text-white">
                          <span>Q{i + 1}: {ans.questionText}</span>
                          <span className="text-sky-600 dark:text-sky-400 font-bold">{ans.score}/100</span>
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300 italic">
                          "{ans.candidateAnswer}"
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 pt-1">
                          Rubric Evaluation: {ans.feedback}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Coding Submission & Test Cases */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      C++ Coding Assessment Result
                    </h4>
                    <div className="p-4 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-xs overflow-x-auto max-h-56">
                      <pre>{selectedSubmission.codingSubmission?.code}</pre>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold">Test Cases Passed:</span>
                      <span className="text-emerald-500 font-bold">
                        {selectedSubmission.codingSubmission?.passedCount} / {selectedSubmission.codingSubmission?.totalCount}
                      </span>
                    </div>
                  </div>

                  {/* Proctoring Event Log */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      Proctoring Integrity Event Log
                    </h4>
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200/70 dark:border-neutral-700/70 text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Total Flagged Strikes: {selectedSubmission.proctoringSummary?.strikes || 0} / 5</span>
                      </div>
                      {selectedSubmission.proctoringSummary?.events?.map((ev, i) => (
                        <div key={i} className="text-neutral-500 text-[11px]">
                          • [{new Date(ev.timestamp).toLocaleTimeString()}] {ev.details}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recruiter Review Form */}
                  <div className="p-5 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 space-y-3 text-xs">
                    <h4 className="font-bold text-neutral-900 dark:text-white text-sm">
                      Recruiter Assessment Notes & Decision
                    </h4>
                    <div>
                      <label className="block font-semibold mb-1">Recruiter Verdict</label>
                      <select
                        value={verdictInput}
                        onChange={(e) => setVerdictInput(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
                      >
                        <option value="Strong Hire">Strong Hire</option>
                        <option value="Hire">Hire</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Re-Interview">Request Additional Round</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Feedback Notes</label>
                      <textarea
                        rows={3}
                        value={recruiterNotesInput}
                        onChange={(e) => setRecruiterNotesInput(e.target.value)}
                        placeholder="Append recruiter evaluation notes..."
                        className="w-full p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                      />
                    </div>
                    <button
                      onClick={handleSaveReview}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Recruiter Notes</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-[#141414] rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 text-sm">
                  Select a submission from the Overview or Candidate Directory to inspect full evaluation.
                </div>
              )}
            </div>
          )}

          {/* TAB: TALENT INTELLIGENCE ANALYTICS */}
          {activeTab === 'analytics' && (
            <CompanyAnalyticsView
              onSelectSubmission={(s) => setSelectedSubmission(s)}
            />
          )}

        </main>
      </div>

      {/* Modal: Create Job */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-w-lg w-full space-y-4 text-xs">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Create New Job Opening
            </h3>

            <form onSubmit={handleCreateJob} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={newJobForm.title}
                  onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                  placeholder="e.g. Senior Backend Systems Engineer"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={newJobForm.department}
                    onChange={(e) => setNewJobForm({ ...newJobForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={newJobForm.location}
                    onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  value={newJobForm.requiredSkills}
                  onChange={(e) => setNewJobForm({ ...newJobForm, requiredSkills: e.target.value })}
                  placeholder="React, C++, Python, SQL"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold shadow"
                >
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Assessment Report Modal */}
      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          isCompany={true}
          onUpdated={(updated) => {
            setSubmissions(getSubmissions());
            setSelectedSubmission(updated);
          }}
        />
      )}

    </div>
  );
}
