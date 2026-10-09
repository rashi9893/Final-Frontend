import {
  initialJobs,
  initialCodingProblems,
  initialInterviews,
  initialCandidateProfile,
  initialCompanyProfile,
  initialSubmissions
} from './mockData';
import { api } from './api';

const STORAGE_KEYS = {
  JOBS: 'ai_interviewer_jobs',
  PROBLEMS: 'ai_interviewer_problems',
  INTERVIEWS: 'ai_interviewer_interviews',
  CANDIDATE: 'ai_interviewer_candidate',
  COMPANY: 'ai_interviewer_company',
  SUBMISSIONS: 'ai_interviewer_submissions',
  ATTEMPTS: 'ai_interviewer_attempts'
};

const getStored = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing ${key} to storage:`, e);
  }
};

// Background live sync on load
export const syncWithBackend = async () => {
  try {
    const [jobsRes, interviewsRes, problemsRes, candidateRes, companyRes, submissionsRes] = await Promise.allSettled([
      api.getJobs(),
      api.getInterviews(),
      api.getProblems(),
      api.getCandidateProfile(),
      api.getCompanyProfile(),
      api.getSubmissions()
    ]);

    if (jobsRes.status === 'fulfilled' && jobsRes.value?.success && jobsRes.value?.data?.length > 0) {
      setStored(STORAGE_KEYS.JOBS, jobsRes.value.data);
    }
    if (interviewsRes.status === 'fulfilled' && interviewsRes.value?.success && interviewsRes.value?.data?.length > 0) {
      setStored(STORAGE_KEYS.INTERVIEWS, interviewsRes.value.data);
    }
    if (problemsRes.status === 'fulfilled' && problemsRes.value?.success && Object.keys(problemsRes.value?.data || {}).length > 0) {
      setStored(STORAGE_KEYS.PROBLEMS, problemsRes.value.data);
    }
    if (candidateRes.status === 'fulfilled' && candidateRes.value?.success && candidateRes.value?.data) {
      setStored(STORAGE_KEYS.CANDIDATE, candidateRes.value.data);
    }
    if (companyRes.status === 'fulfilled' && companyRes.value?.success && companyRes.value?.data) {
      setStored(STORAGE_KEYS.COMPANY, companyRes.value.data);
    }
    if (submissionsRes.status === 'fulfilled' && submissionsRes.value?.success && submissionsRes.value?.data?.length > 0) {
      setStored(STORAGE_KEYS.SUBMISSIONS, submissionsRes.value.data);
    }
  } catch (err) {
    console.info('Backend live sync notice (using cached data):', err.message);
  }
};

// Trigger background sync on module import
syncWithBackend();

// Jobs Service
export const getJobs = () => getStored(STORAGE_KEYS.JOBS, initialJobs);

export const createJob = (newJob) => {
  const jobs = getJobs();
  const created = {
    ...newJob,
    id: `job-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    applicantsCount: 0,
    status: 'Published'
  };
  const updated = [created, ...jobs];
  setStored(STORAGE_KEYS.JOBS, updated);

  // Sync with live MySQL backend
  api.createJob(created).catch(err => console.warn('Failed to sync created job to backend:', err));

  return created;
};

export const updateJob = (id, updates) => {
  const jobs = getJobs();
  const updated = jobs.map(j => (j.id === id ? { ...j, ...updates } : j));
  setStored(STORAGE_KEYS.JOBS, updated);

  // Sync with live MySQL backend
  api.updateJob(id, updates).catch(err => console.warn('Failed to sync job update to backend:', err));

  return updated.find(j => j.id === id);
};

export const deleteJob = (id) => {
  const jobs = getJobs();
  const filtered = jobs.filter(j => j.id !== id);
  setStored(STORAGE_KEYS.JOBS, filtered);

  // Sync with live MySQL backend
  api.deleteJob(id).catch(err => console.warn('Failed to delete job on backend:', err));

  return true;
};

// Interviews Service
export const getInterviews = () => getStored(STORAGE_KEYS.INTERVIEWS, initialInterviews);

export const getInterviewById = (id) => {
  const interviews = getInterviews();
  return interviews.find(i => i.id === id) || null;
};

export const createInterview = (interviewData) => {
  const interviews = getInterviews();
  const created = {
    ...interviewData,
    id: `int-${Date.now()}`,
    status: 'Ready to Start'
  };
  const updated = [created, ...interviews];
  setStored(STORAGE_KEYS.INTERVIEWS, updated);

  // Sync with live MySQL backend
  api.createInterview(created).catch(err => console.warn('Failed to sync interview to backend:', err));

  return created;
};

// Coding Problems
export const getCodingProblems = () => getStored(STORAGE_KEYS.PROBLEMS, initialCodingProblems);

export const getCodingProblemById = (id) => {
  const problems = getCodingProblems();
  return problems[id] || initialCodingProblems['prob-1'];
};

// Candidate Profile & Resume Service
export const getCandidateProfile = () => getStored(STORAGE_KEYS.CANDIDATE, initialCandidateProfile);

export const updateCandidateProfile = (updates) => {
  const current = getCandidateProfile();
  const updated = { ...current, ...updates };
  setStored(STORAGE_KEYS.CANDIDATE, updated);

  // Sync with live MySQL backend
  api.updateCandidateProfile(updates).catch(err => console.warn('Failed to sync profile to backend:', err));

  return updated;
};

export const uploadCandidateResume = (file) => {
  const current = getCandidateProfile();
  const fileName = file.name || 'Uploaded_Resume.pdf';
  const fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  
  const parsedSkills = Array.from(new Set([
    ...current.skills,
    'Docker',
    'Kubernetes',
    'GraphQL',
    'Next.js',
    'PostgreSQL'
  ]));

  const updatedResume = {
    fileName,
    uploadedAt: new Date().toISOString(),
    fileSize,
    status: 'Processed & Verified',
    parsedData: {
      ...current.resume.parsedData,
      contact: {
        ...current.resume.parsedData.contact,
        name: current.name,
        email: current.email
      }
    }
  };

  const updatedProfile = {
    ...current,
    skills: parsedSkills,
    profileCompletion: 100,
    resume: updatedResume
  };

  setStored(STORAGE_KEYS.CANDIDATE, updatedProfile);

  // Upload to live backend
  api.uploadResume(file).catch(err => console.warn('Failed to upload resume to backend:', err));

  return updatedProfile;
};

export const deleteCandidateResume = () => {
  const current = getCandidateProfile();
  const updatedProfile = {
    ...current,
    profileCompletion: 65,
    resume: null
  };
  setStored(STORAGE_KEYS.CANDIDATE, updatedProfile);

  // Sync with live backend
  api.deleteResume().catch(err => console.warn('Failed to delete resume on backend:', err));

  return updatedProfile;
};

// Resume-Based Adaptive Question Generator
export const generateAdaptiveQuestions = (candidateSkills, jobSkills = []) => {
  const combinedSkills = Array.from(new Set([...candidateSkills, ...jobSkills]));
  
  const questionPool = [
    {
      skill: 'React',
      question: 'In your React projects, how did you handle concurrent UI transitions or heavy state operations without degrading frame rates?',
      category: 'Frontend Performance'
    },
    {
      skill: 'TypeScript',
      question: 'How do you design extensible type definitions using discriminated unions and conditional types for complex API payloads?',
      category: 'Type Safety & Architecture'
    },
    {
      skill: 'C++',
      question: 'Walk through your experience with C++ move semantics (std::move, rvalue references) and how they eliminate unnecessary memory allocations.',
      category: 'Low-Level Systems'
    },
    {
      skill: 'Python',
      question: 'Discuss how you structure asynchronous coroutines (asyncio) in Python microservices to handle high-concurrency external IO.',
      category: 'Backend Scalability'
    },
    {
      skill: 'Docker',
      question: 'How do you structure multi-stage Docker builds to reduce container attack surface and minimize image deploy sizes?',
      category: 'DevOps & Reliability'
    },
    {
      skill: 'SQL',
      question: 'When a database query exhibits slow execution, what steps and execution plan metrics (EXPLAIN ANALYZE) do you inspect first?',
      category: 'Database Optimization'
    }
  ];

  const matched = questionPool.filter(q => combinedSkills.some(s => s.toLowerCase() === q.skill.toLowerCase()));
  return matched.length > 0 ? matched : questionPool.slice(0, 3);
};

// Submissions & Evaluation Reports Service
export const getSubmissions = () => getStored(STORAGE_KEYS.SUBMISSIONS, initialSubmissions);

export const getSubmissionById = (id) => {
  const subs = getSubmissions();
  return subs.find(s => s.id === id) || null;
};

export const updateSubmissionReview = (id, recruiterNotes, verdict) => {
  const subs = getSubmissions();
  const updated = subs.map(s => {
    if (s.id === id) {
      return {
        ...s,
        status: 'Reviewed',
        evaluationReport: {
          ...s.evaluationReport,
          recruiterNotes,
          verdict,
          status: 'Reviewed'
        }
      };
    }
    return s;
  });
  setStored(STORAGE_KEYS.SUBMISSIONS, updated);

  // Sync review to live MySQL backend
  api.updateSubmissionReview(id, recruiterNotes, verdict).catch(err => console.warn('Failed to update review on backend:', err));

  return updated.find(s => s.id === id);
};

export const createFinalSubmission = (submissionData) => {
  const subs = getSubmissions();
  const newSubmission = {
    ...submissionData,
    id: `sub-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: 'Submitted'
  };
  const updated = [newSubmission, ...subs];
  setStored(STORAGE_KEYS.SUBMISSIONS, updated);

  // Update interview status locally
  if (submissionData.interviewId) {
    const interviews = getInterviews();
    const updatedInts = interviews.map(i => 
      i.id === submissionData.interviewId ? { ...i, status: 'Completed' } : i
    );
    setStored(STORAGE_KEYS.INTERVIEWS, updatedInts);
  }

  // Sync to live MySQL backend
  api.createSubmission(newSubmission).catch(err => console.warn('Failed to sync submission to backend:', err));

  return newSubmission;
};

// Company Profile
export const getCompanyProfile = () => getStored(STORAGE_KEYS.COMPANY, initialCompanyProfile);

export const updateCompanyProfile = (updates) => {
  const current = getCompanyProfile();
  const updated = { ...current, ...updates };
  setStored(STORAGE_KEYS.COMPANY, updated);

  // Sync with live MySQL backend
  api.updateCompanyProfile(updates).catch(err => console.warn('Failed to sync company profile to backend:', err));

  return updated;
};
