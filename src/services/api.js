const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('ai_interviewer_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`[API] Network or server error on ${endpoint}:`, error.message);
    return { success: false, error: error.message, isOffline: true };
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Auth
  login: (email, password, role) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  getMe: (id) => request(`/auth/me${id ? `?id=${id}` : ''}`),

  // Jobs
  getJobs: () => request('/jobs'),
  getJobById: (id) => request(`/jobs/${id}`),
  createJob: (jobData) =>
    request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    }),
  updateJob: (id, updates) =>
    request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  deleteJob: (id) =>
    request(`/jobs/${id}`, {
      method: 'DELETE'
    }),

  // Interviews
  getInterviews: () => request('/interviews'),
  getInterviewById: (id) => request(`/interviews/${id}`),
  createInterview: (interviewData) =>
    request('/interviews', {
      method: 'POST',
      body: JSON.stringify(interviewData)
    }),
  updateInterview: (id, updates) =>
    request(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  // Problems
  getProblems: () => request('/problems'),
  getProblemById: (id) => request(`/problems/${id}`),

  // Candidate
  getCandidateProfile: (id) => request(`/candidate/profile${id ? `?id=${id}` : ''}`),
  updateCandidateProfile: (updates, id) =>
    request(`/candidate/profile${id ? `?id=${id}` : ''}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  uploadResume: async (file, id) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const token = localStorage.getItem('ai_interviewer_token');

      const response = await fetch(`${API_BASE}/candidate/resume${id ? `?id=${id}` : ''}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.warn('[API] Resume upload error:', error.message);
      return { success: false, error: error.message, isOffline: true };
    }
  },
  deleteResume: (id) =>
    request(`/candidate/resume${id ? `?id=${id}` : ''}`, {
      method: 'DELETE'
    }),

  // Company
  getCompanyProfile: (id) => request(`/company/profile${id ? `?id=${id}` : ''}`),
  updateCompanyProfile: (updates, id) =>
    request(`/company/profile${id ? `?id=${id}` : ''}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  // Submissions
  getSubmissions: () => request('/submissions'),
  getSubmissionById: (id) => request(`/submissions/${id}`),
  createSubmission: (submissionData) =>
    request('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData)
    }),
  updateSubmissionReview: (id, recruiterNotes, verdict) =>
    request(`/submissions/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ recruiterNotes, verdict })
    }),

  // AI Interview Engine
  startAIInterview: (payload) =>
    request('/start-interview', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  submitAIAnswer: (payload) =>
    request('/submit-answer', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  endAIInterview: (payload) =>
    request('/end-interview', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getTTSAudioUrl: (text, lang = 'en-IN', voice = '') => {
    return `${API_BASE}/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}${voice ? `&voice=${encodeURIComponent(voice)}` : ''}`;
  },
  detectMobile: (imageBase64) =>
    request('/detect-mobile', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64 })
    }),
  getGoogleCloudStatus: () => request('/google-cloud-status'),
  getNetworkIp: () => request('/network-ip'),

  // Analytics Engine
  getCompanyAnalytics: () => request('/analytics/company'),
  getCandidateAnalytics: (candidateId = 'me') => request(`/analytics/candidate/${candidateId}`)
};

