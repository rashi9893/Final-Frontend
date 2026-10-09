// Initial mock dataset for local prototype with persistent localStorage sync
export const initialJobs = [
  {
    id: 'job-101',
    companyId: 'comp-1',
    companyName: 'TechCorp Global',
    title: 'Senior Full-Stack & AI Engineer',
    department: 'Engineering',
    location: 'Remote / San Francisco',
    type: 'Full-time',
    experience: '3+ years',
    description: 'We are seeking an adaptable engineer proficient in React, modern Python/Node services, and AI/LLM workflow orchestration.',
    responsibilities: [
      'Architect robust full-stack web applications and scalable APIs',
      'Integrate AI evaluation pipelines and streaming responses',
      'Build performant, accessible UI interfaces'
    ],
    requiredSkills: ['React', 'Python', 'TypeScript', 'C++', 'System Design', 'REST APIs'],
    status: 'Published',
    createdAt: '2026-09-15',
    applicantsCount: 14
  },
  {
    id: 'job-102',
    companyId: 'comp-1',
    companyName: 'TechCorp Global',
    title: 'Systems & Algorithmic Developer',
    department: 'Infrastructure',
    location: 'New York / Hybrid',
    type: 'Full-time',
    experience: '2+ years',
    description: 'Design low-latency data pipelines and high-throughput microservices with algorithmic efficiency.',
    responsibilities: [
      'Optimize data structures and latency-critical backend pathways',
      'Write safe, high-performance C++ and backend services',
      'Conduct code reviews and proctored technical evaluations'
    ],
    requiredSkills: ['C++', 'Data Structures', 'Algorithms', 'Distributed Systems', 'Linux'],
    status: 'Published',
    createdAt: '2026-09-28',
    applicantsCount: 9
  }
];

export const initialCodingProblems = {
  'prob-1': {
    id: 'prob-1',
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    timeLimitMinutes: 30,
    language: 'cpp',
    description: `Given an array of integers \`nums\` and an integer \`k\`, return the total number of subarrays whose sum equals to \`k\`.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      {
        input: 'nums = [1, 1, 1], k = 2',
        output: '2',
        explanation: 'The subarrays are [1, 1] at index (0, 1) and [1, 1] at index (1, 2).'
      },
      {
        input: 'nums = [1, 2, 3], k = 3',
        output: '2',
        explanation: 'Subarrays [1, 2] and [3] sum to 3.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 2 * 10^4',
      '-1000 <= nums[i] <= 1000',
      '-10^7 <= k <= 10^7'
    ],
    starterCode: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        // Write your solution here
        unordered_map<int, int> prefixCounts;
        prefixCounts[0] = 1;
        int currentSum = 0;
        int count = 0;
        
        for (int num : nums) {
            currentSum += num;
            if (prefixCounts.find(currentSum - k) != prefixCounts.end()) {
                count += prefixCounts[currentSum - k];
            }
            prefixCounts[currentSum]++;
        }
        
        return count;
    }
};

int main() {
    Solution sol;
    vector<int> test1 = {1, 1, 1};
    cout << "Test 1 Output: " << sol.subarraySum(test1, 2) << endl;
    return 0;
}`,
    testCases: [
      { id: 'tc-1', input: '[1, 1, 1], k = 2', expectedOutput: '2', isPublic: true },
      { id: 'tc-2', input: '[1, 2, 3], k = 3', expectedOutput: '2', isPublic: true },
      { id: 'tc-3', input: '[1, -1, 0], k = 0', expectedOutput: '3', isPublic: false }
    ]
  },
  'prob-2': {
    id: 'prob-2',
    title: 'Valid Parentheses & Bracket Validation',
    difficulty: 'Easy',
    timeLimitMinutes: 20,
    language: 'cpp',
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'Matched single pair.' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'All bracket sequences correctly closed.' },
      { input: 's = "(]"', output: 'false', explanation: 'Mismatched closing bracket.' }
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only: ()[]{}'],
    starterCode: `#include <iostream>
#include <string>
#include <stack>

using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Your code here
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.empty()) return false;
                char top = st.top();
                if ((c == ')' && top != '(') ||
                    (c == '}' && top != '{') ||
                    (c == ']' && top != '[')) {
                    return false;
                }
                st.pop();
            }
        }
        return st.empty();
    }
};

int main() {
    Solution sol;
    cout << boolalpha << sol.isValid("()[]{}") << endl;
    return 0;
}`,
    testCases: [
      { id: 'tc-1', input: '"()"', expectedOutput: 'true', isPublic: true },
      { id: 'tc-2', input: '"()[]{}"', expectedOutput: 'true', isPublic: true },
      { id: 'tc-3', input: '"(]"', expectedOutput: 'false', isPublic: true },
      { id: 'tc-4', input: '"{[]}"', expectedOutput: 'true', isPublic: false }
    ]
  }
};

export const initialInterviews = [
  {
    id: 'int-201',
    jobId: 'job-101',
    jobTitle: 'Senior Full-Stack & AI Engineer',
    companyId: 'comp-1',
    companyName: 'TechCorp Global',
    title: 'Adaptive AI Technical & Behavioral Screening',
    description: 'Comprehensive evaluation covering your technical stack, project design choices, real-time problem solving, and hands-on coding.',
    durationMinutes: 45,
    language: 'English',
    supportedLanguages: ['English', 'Spanish', 'Hindi', 'German', 'Mandarin'],
    scheduledDate: '2026-10-12T14:00:00Z',
    status: 'Ready to Start',
    requiredSkills: ['React', 'Python', 'C++', 'System Design', 'Algorithms'],
    proctoringConfig: {
      fullScreenLock: true,
      tabFocusTracking: true,
      webcamGazeMonitoring: true,
      audioNoiseAnalysis: true,
      secondaryCameraRequired: false,
      maxGeneralStrikes: 5
    },
    scoringRubric: {
      technicalKnowledgeWeight: 35,
      communicationClarityWeight: 20,
      problemSolvingWeight: 20,
      codingCorrectnessWeight: 25
    },
    codingProblemId: 'prob-1',
    questions: [
      {
        id: 'q-1',
        type: 'resume-based',
        category: 'Experience & Architecture',
        question: 'Based on your resume, you built full-stack reactive applications. How did you manage state synchronization and minimize redundant re-renders under rapid user interactions?',
        expectedPoints: ['State management strategy', 'Performance optimization', 'Component lifecycle']
      },
      {
        id: 'q-2',
        type: 'technical',
        category: 'System Design & APIs',
        question: 'When architecting a real-time streaming endpoint (e.g. LLM token generation or live proctoring events), would you choose WebSockets, Server-Sent Events (SSE), or WebRTC? Justify your choice based on protocol overhead and error recovery.',
        expectedPoints: ['SSE vs WebSockets tradeoffs', 'Connection lifecycle', 'Reconnection and backoff']
      },
      {
        id: 'q-3',
        type: 'behavioral',
        category: 'Collaboration & Problem-Solving',
        question: 'Describe a situation where a critical production bug or performance bottleneck emerged right before a release. How did you prioritize, diagnose, and communicate the resolution to stakeholders?',
        expectedPoints: ['Root cause triage', 'Calm crisis handling', 'Stakeholder communication']
      },
      {
        id: 'q-4',
        type: 'job-specific',
        category: 'AI Pipeline Engineering',
        question: 'How do you safeguard user data and maintain prompt injection resistance when integrating external LLM APIs with internal databases?',
        expectedPoints: ['Input sanitization', 'Zero trust boundary', 'Audit logging']
      }
    ]
  },
  {
    id: 'int-202',
    jobId: 'job-102',
    jobTitle: 'Systems & Algorithmic Developer',
    companyId: 'comp-1',
    companyName: 'TechCorp Global',
    title: 'Core Systems & Algorithmic Competency',
    description: 'Assesses depth in C++ memory management, concurrency constructs, and algorithmic efficiency.',
    durationMinutes: 40,
    language: 'English',
    supportedLanguages: ['English', 'German', 'French'],
    scheduledDate: '2026-10-15T16:30:00Z',
    status: 'Scheduled',
    requiredSkills: ['C++', 'Data Structures', 'Linux', 'Memory Optimization'],
    proctoringConfig: {
      fullScreenLock: true,
      tabFocusTracking: true,
      webcamGazeMonitoring: true,
      audioNoiseAnalysis: false,
      secondaryCameraRequired: false,
      maxGeneralStrikes: 5
    },
    scoringRubric: {
      technicalKnowledgeWeight: 30,
      communicationClarityWeight: 15,
      problemSolvingWeight: 25,
      codingCorrectnessWeight: 30
    },
    codingProblemId: 'prob-2',
    questions: [
      {
        id: 'q-201',
        type: 'technical',
        category: 'C++ Systems',
        question: 'Explain the difference between std::unique_ptr and std::shared_ptr, including reference counting overhead and how circular references can be prevented with std::weak_ptr.',
        expectedPoints: ['Smart pointer mechanics', 'Control block allocation', 'Memory leak prevention']
      },
      {
        id: 'q-202',
        type: 'algorithmic',
        category: 'Data Structures',
        question: 'When designing a cache with O(1) average lookup and eviction, what data structures would you combine, and how would you handle thread safety under high concurrency?',
        expectedPoints: ['Hash map + Doubly linked list', 'Mutex granularity or lock-free reads']
      }
    ]
  }
];

export const initialCandidateProfile = {
  id: 'cand-1',
  name: 'Alex Rivera',
  email: 'alex@candidate.com',
  phone: '+1 (555) 234-8901',
  college: 'Stanford University',
  degree: 'B.S. in Computer Science',
  graduationYear: '2025',
  profileCompletion: 92,
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'C++', 'Tailwind CSS', 'SQL', 'Git', 'Docker'],
  resume: {
    fileName: 'Alex_Rivera_Resume_2026.pdf',
    uploadedAt: '2026-10-01T10:14:00Z',
    fileSize: '1.4 MB',
    status: 'Processed & Verified',
    parsedData: {
      contact: {
        name: 'Alex Rivera',
        email: 'alex@candidate.com',
        phone: '+1 (555) 234-8901',
        linkedin: 'linkedin.com/in/alex-rivera-dev',
        github: 'github.com/alexrivera-tech'
      },
      education: [
        {
          institution: 'Stanford University',
          degree: 'B.S. in Computer Science (GPA: 3.88)',
          years: '2021 — 2025',
          coursework: 'Operating Systems, Compilers, Distributed Systems, Algorithms, Machine Learning'
        }
      ],
      experience: [
        {
          title: 'Software Engineering Intern',
          company: 'Nexus Cloud Systems',
          period: 'June 2025 — Sept 2025',
          description: 'Designed real-time metric dashboards using React and WebSocket streams, reducing latency by 32%.'
        },
        {
          title: 'Full-Stack Developer Fellow',
          company: 'Open Source Labs',
          period: 'Jan 2024 — May 2025',
          description: 'Contributed to high-throughput REST API gateways and automated regression testing pipelines.'
        }
      ],
      projects: [
        {
          name: 'Distributed Task Orchestrator',
          tech: 'C++, gRPC, Raft Consensus',
          description: 'Fault-tolerant distributed worker queue supporting 10k tasks/sec with leader election.'
        },
        {
          name: 'AI Code Reviewer CLI',
          tech: 'Python, AST, LLM API',
          description: 'Automated pull-request feedback bot highlighting style and security vulnerabilities.'
        }
      ],
      certifications: [
        'AWS Certified Cloud Practitioner (2025)',
        'Meta Front-End Developer Professional Certificate (2024)'
      ]
    }
  }
};

export const initialCompanyProfile = {
  id: 'comp-1',
  companyName: 'TechCorp Global',
  contactPerson: 'Sarah Jenkins',
  workEmail: 'recruiter@techcorp.io',
  designation: 'Lead Technical Talent Partner',
  website: 'https://techcorp.io',
  industry: 'Artificial Intelligence & Enterprise Cloud',
  size: '250 - 500 Employees'
};

export const initialSubmissions = [
  {
    id: 'sub-301',
    interviewId: 'int-201',
    interviewTitle: 'Adaptive AI Technical & Behavioral Screening',
    jobId: 'job-101',
    jobTitle: 'Senior Full-Stack & AI Engineer',
    candidateId: 'cand-1',
    candidateName: 'Alex Rivera',
    candidateEmail: 'alex@candidate.com',
    candidateCollege: 'Stanford University',
    submittedAt: '2026-10-08T18:45:00Z',
    status: 'Evaluated',
    timeSpentMinutes: 38,
    proctoringSummary: {
      integrityScore: 98,
      strikes: 0,
      eventsCount: 1,
      events: [
        { type: 'TAB_BLUR', timestamp: '2026-10-08T18:12:10Z', details: 'Candidate temporarily blurred browser window for 1.4s (within grace threshold)' }
      ]
    },
    answers: [
      {
        questionId: 'q-1',
        questionText: 'Based on your resume, you built full-stack reactive applications. How did you manage state synchronization and minimize redundant re-renders?',
        candidateAnswer: 'I separated global state from local UI ephemeral state using atomic stores (such as Zustand) and leveraged selective subscriptions. For high-frequency events like metric updates or typing, I utilized debounced updates, memoized selectors, and React 19 compiler-level optimizers to avoid full sub-tree recalculations.',
        score: 95,
        feedback: 'Excellent grasp of rendering lifecycles and practical state separation strategies.'
      },
      {
        questionId: 'q-2',
        questionText: 'When architecting a real-time streaming endpoint, would you choose WebSockets, Server-Sent Events (SSE), or WebRTC?',
        candidateAnswer: 'For unidirectional token or event streaming like LLM outputs, SSE over HTTP/2 is ideal because it uses standard HTTP, handles automatic reconnections natively, and works seamlessly through corporate proxies without custom WS handshakes. For bidirectional low-latency duplexing, WebSockets would be the preferred choice.',
        score: 92,
        feedback: 'Well-reasoned trade-off analysis between SSE and WebSockets.'
      },
      {
        questionId: 'q-3',
        questionText: 'Describe a situation where a critical production bug emerged right before a release.',
        candidateAnswer: 'During a release at Nexus Cloud, memory consumption spiked when 5,000 concurrent sockets connected. I used heap snapshot analysis to identify an unbound event listener in our socket handler, patched the teardown logic in a hotfix branch, tested it with an artillery load script, and documented the root cause in a post-mortem.',
        score: 90,
        feedback: 'Structured response demonstrating calm triage and post-incident accountability.'
      },
      {
        questionId: 'q-4',
        questionText: 'How do you safeguard user data and maintain prompt injection resistance when integrating external LLM APIs?',
        candidateAnswer: 'I enforce a strict boundary: untrusted candidate inputs are wrapped inside delimiter tags with explicit system-prompt guardrails, never executed directly as commands. Furthermore, sensitive PII is tokenized or redacted before API egress, and API egress tokens are strictly bounded by least-privilege service accounts.',
        score: 94,
        feedback: 'Solid security posture and awareness of LLM prompt hygiene.'
      }
    ],
    codingSubmission: {
      problemId: 'prob-1',
      problemTitle: 'Subarray Sum Equals K',
      language: 'cpp',
      code: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> prefixCounts;
        prefixCounts[0] = 1;
        int currentSum = 0;
        int count = 0;
        
        for (int num : nums) {
            currentSum += num;
            if (prefixCounts.find(currentSum - k) != prefixCounts.end()) {
                count += prefixCounts[currentSum - k];
            }
            prefixCounts[currentSum]++;
        }
        
        return count;
    }
};`,
      testResults: [
        { testCaseId: 'tc-1', passed: true, runtime: '2ms', memory: '14.2MB' },
        { testCaseId: 'tc-2', passed: true, runtime: '2ms', memory: '14.1MB' },
        { testCaseId: 'tc-3', passed: true, runtime: '3ms', memory: '14.5MB' }
      ],
      passedCount: 3,
      totalCount: 3,
      score: 100
    },
    evaluationReport: {
      overallScore: 94,
      verdict: 'Strong Hire',
      rubricScores: {
        technicalKnowledge: 93,
        communicationClarity: 91,
        problemSolving: 94,
        codingCorrectness: 100,
        integrityScore: 98
      },
      strengths: [
        'Demonstrates deep algorithmic comprehension with optimal O(N) prefix-hash solution',
        'Clear, structured verbal communication with precise terminology',
        'Practical understanding of full-stack scalability and modern browser APIs'
      ],
      areasForGrowth: [
        'Could elaborate further on distributed telemetry tracing across microservices'
      ],
      recruiterNotes: 'Top 5% candidate for the Full-Stack & AI team. Recommend advancing to final leadership chat.',
      status: 'Reviewed'
    }
  }
];
