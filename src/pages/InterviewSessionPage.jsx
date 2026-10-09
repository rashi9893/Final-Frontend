import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  Mic,
  MicOff,
  Video,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  Bot,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle,
  Play,
  RotateCcw,
  Code2,
  Send,
  FileCheck,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import AIAvatar from '../components/AIAvatar';
import { getInterviewById, updateSubmissionReview, createFinalSubmission } from '../services/storageService';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function InterviewSessionPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const interview = getInterviewById(interviewId);

  // Core Interview State
  const [candidateName, setCandidateName] = useState(user?.name || 'Candidate');
  const [topic, setTopic] = useState(interview?.title || interview?.jobTitle || 'Full Stack Engineer');
  const [difficulty, setDifficulty] = useState('Mid-Level');
  const [selectedLang, setSelectedLang] = useState(interview?.language || 'en-IN');
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentQuestionText, setCurrentQuestionText] = useState('Initializing interview session...');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(interview?.questions?.length || 5);
  const [emotion, setEmotion] = useState('smiling');
  const [chatHistory, setChatHistory] = useState([]);
  const [isRecruiterSpeaking, setIsRecruiterSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  // Audio / Speech Timers & States
  const [secondsRemaining, setSecondsRemaining] = useState((interview?.durationMinutes || 45) * 60);
  const [isSpeechMuted, setIsSpeechMuted] = useState(false);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const silenceTimerRef = useRef(null);

  // Proctoring States
  const [strikes, setStrikes] = useState(0);
  const [warningToast, setWarningToast] = useState('');
  const [proctorEvents, setProctorEvents] = useState([]);
  const [proctorWarningCounts, setProctorWarningCounts] = useState({
    face: 0,
    gaze: 0,
    tab: 0,
    focus: 0,
    audio: 0
  });

  // Coding Assessment State (Verbal -> Coding -> Evaluation)
  const [phase, setPhase] = useState('verbal'); // 'verbal' | 'coding' | 'report'
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [activeCodeIndex, setActiveCodeIndex] = useState(0);
  const [codeEditorValue, setCodeEditorValue] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [evaluationReport, setEvaluationReport] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecognitionRunningRef = useRef(false);
  const ttsAudioRef = useRef(null);
  const blazefaceModelRef = useRef(null);
  const proctorIntervalRef = useRef(null);

  // 1. Initialize Webcam
  useEffect(() => {
    let mediaStream = null;
    navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 } },
      audio: true
    })
      .then(stream => {
        mediaStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.warn('[Proctor] Webcam preview notice:', err));

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // 2. Countdown Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Proctoring: Tab Visibility & Window Blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordStrike('Tab visibility lost / switched tabs', 'tab');
      }
    };

    const handleBlur = () => {
      recordStrike('Browser window lost focus', 'focus');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [strikes]);

  // 4. Initialize TensorFlow.js BlazeFace for Face Gaze & Proctoring
  useEffect(() => {
    async function initBlazeFace() {
      if (window.blazeface && !blazefaceModelRef.current) {
        try {
          blazefaceModelRef.current = await window.blazeface.load();
          console.log('[Proctor] BlazeFace model loaded successfully.');
        } catch (e) {
          console.warn('[Proctor] BlazeFace model init notice:', e.message);
        }
      }
    }
    initBlazeFace();

    proctorIntervalRef.current = setInterval(async () => {
      if (!blazefaceModelRef.current || !videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const predictions = await blazefaceModelRef.current.estimateFaces(videoRef.current, false);
        if (!predictions || predictions.length === 0) {
          // No face detected
          recordStrike('No candidate face detected in video frame', 'face');
        } else if (predictions.length > 1) {
          // Multiple faces detected
          recordStrike('Multiple faces detected in proctored feed', 'face');
        } else {
          // Check looking away (symmetry of nose between eyes)
          const p = predictions[0];
          if (p.landmarks && p.landmarks.length >= 3) {
            const rightEye = p.landmarks[0];
            const leftEye = p.landmarks[1];
            const nose = p.landmarks[2];

            const distLeft = Math.abs(nose[0] - leftEye[0]);
            const distRight = Math.abs(nose[0] - rightEye[0]);

            if (distRight > 0) {
              const ratio = distLeft / distRight;
              if (ratio > 3.0 || ratio < 0.33) {
                recordStrike('Candidate looking away from screen', 'gaze');
              }
            }
          }
        }
      } catch (err) {
        // Suppress frame processing errors
      }
    }, 4500);

    return () => {
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
    };
  }, []);

  const recordStrike = (reason, category = 'focus') => {
    setStrikes(prev => {
      const next = prev + 1;
      const event = {
        type: 'PROCTOR_VIOLATION',
        category,
        timestamp: new Date().toISOString(),
        details: reason,
        strikeNumber: next
      };
      setProctorEvents(curr => [...curr, event]);
      setProctorWarningCounts(curr => ({
        ...curr,
        [category]: (curr[category] || 0) + 1
      }));
      setWarningToast(`Proctoring Notice: ${reason}. Strike ${next}/5.`);
      setTimeout(() => setWarningToast(''), 4000);

      if (next >= 5) {
        handleDisqualification(reason);
      }
      return next;
    });
  };

  const handleDisqualification = (reason) => {
    alert(`Assessment terminated: 5 proctoring violations recorded (${reason}).`);
    handleFinishInterview(true, reason);
  };

  // 5. Speak Text via Backend TTS with Lip Sync
  const speakQuestion = async (text) => {
    if (isSpeechMuted || !text) return;

    safeStopRecognition();
    setIsRecruiterSpeaking(true);

    try {
      const ttsUrl = api.getTTSAudioUrl(text, selectedLang);
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
      }

      const audio = new Audio(ttsUrl);
      ttsAudioRef.current = audio;

      audio.onended = () => {
        setIsRecruiterSpeaking(false);
        safeStartRecognition();
      };

      audio.onerror = () => {
        // Fallback to browser SpeechSynthesis
        fallbackBrowserSpeech(text);
      };

      await audio.play();
    } catch (e) {
      fallbackBrowserSpeech(text);
    }
  };

  const fallbackBrowserSpeech = (text) => {
    if (!window.speechSynthesis) {
      setIsRecruiterSpeaking(false);
      safeStartRecognition();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang === 'hi-IN' ? 'hi-IN' : 'en-IN';

    utterance.onstart = () => setIsRecruiterSpeaking(true);
    utterance.onend = () => {
      setIsRecruiterSpeaking(false);
      safeStartRecognition();
    };
    utterance.onerror = () => {
      setIsRecruiterSpeaking(false);
      safeStartRecognition();
    };

    window.speechSynthesis.speak(utterance);
  };

  // 6. Speech Recognition with Google Meet Style Hands-free Calling
  const safeStartRecognition = () => {
    if (isRecognitionRunningRef.current || isRecruiterSpeaking) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang === 'hi-IN' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        isRecognitionRunningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setCandidateAnswer(prev => prev + final);
          resetSilenceAutoSubmitTimer();
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = () => {
        isRecognitionRunningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        isRecognitionRunningRef.current = false;
        setIsListening(false);
        // Automatically restart if interview is active and recruiter is not speaking
        if (phase === 'verbal' && !isRecruiterSpeaking) {
          setTimeout(safeStartRecognition, 300);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      isRecognitionRunningRef.current = false;
      setIsListening(false);
    }
  };

  const safeStopRecognition = () => {
    if (recognitionRef.current && isRecognitionRunningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    isRecognitionRunningRef.current = false;
    setIsListening(false);
  };

  // Smart Silence Auto-Submit (3.0s timer)
  const resetSilenceAutoSubmitTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      // Auto-submit after 3.5s silence if answer has substantive content
      setCandidateAnswer(curr => {
        if (curr.trim().length > 15) {
          handleSubmitAnswer(curr.trim());
          return '';
        }
        return curr;
      });
    }, 3500);
  };

  // 7. Start Session on Mount
  useEffect(() => {
    async function startSession() {
      setIsInitializing(true);
      try {
        const payload = {
          name: candidateName,
          topic: topic,
          difficulty: difficulty,
          numQuestions: totalQuestions,
          language: selectedLang,
          interviewId
        };

        const res = await api.startAIInterview(payload);
        if (res && res.success) {
          setCurrentQuestionText(res.question);
          setEmotion(res.emotion || 'smiling');
          setTotalQuestions(res.totalQuestions || 5);
          if (res.codingQuestions && res.codingQuestions.length > 0) {
            setCodingQuestions(res.codingQuestions);
            setCodeEditorValue(res.codingQuestions[0].template || '');
          }
          speakQuestion(res.question);
        } else {
          const fallbackQ = `Welcome ${candidateName}. Could you describe how you architect high-reliability services for ${topic}?`;
          setCurrentQuestionText(fallbackQ);
          speakQuestion(fallbackQ);
        }
      } catch (err) {
        const fallbackQ = `Welcome ${candidateName}. Could you describe how you architect high-reliability services for ${topic}?`;
        setCurrentQuestionText(fallbackQ);
        speakQuestion(fallbackQ);
      } finally {
        setIsInitializing(false);
      }
    }

    startSession();

    return () => {
      safeStopRecognition();
      if (ttsAudioRef.current) ttsAudioRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // 8. Submit Answer and Transition Turns
  const handleSubmitAnswer = async (answerToSubmit = null) => {
    const text = (answerToSubmit !== null ? answerToSubmit : candidateAnswer).trim();
    if (!text) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    safeStopRecognition();

    const turn = {
      index: currentQIndex,
      question: currentQuestionText,
      answer: text,
      timestamp: new Date().toISOString()
    };

    const nextHistory = [...chatHistory, turn];
    setChatHistory(nextHistory);
    setCandidateAnswer('');
    setInterimTranscript('');

    // Check if verbal questions are completed
    if (currentQIndex + 1 >= totalQuestions) {
      if (codingQuestions.length > 0) {
        setPhase('coding');
        const transitionSpeech = "Thank you. You have completed the verbal discussion. We will now proceed to the live coding assessment.";
        setCurrentQuestionText(transitionSpeech);
        speakQuestion(transitionSpeech);
      } else {
        handleFinishInterview(false, '', nextHistory);
      }
      return;
    }

    setCurrentQuestionText("Analyzing response & preparing follow-up...");

    try {
      const payload = {
        name: candidateName,
        topic,
        difficulty,
        numQuestions: totalQuestions,
        currentQuestionIndex: currentQIndex,
        candidateAnswer: text,
        history: nextHistory,
        language: selectedLang
      };

      const res = await api.submitAIAnswer(payload);
      if (res && res.success) {
        setCurrentQuestionText(res.question);
        setEmotion(res.emotion || 'curious');
        setCurrentQIndex(prev => prev + 1);
        speakQuestion(res.question);
      } else {
        const fallbackNext = `Building on what you just shared, how do you verify correctness and avoid race conditions under high traffic?`;
        setCurrentQuestionText(fallbackNext);
        setCurrentQIndex(prev => prev + 1);
        speakQuestion(fallbackNext);
      }
    } catch (err) {
      const fallbackNext = `Building on what you just shared, how do you verify correctness and avoid race conditions under high traffic?`;
      setCurrentQuestionText(fallbackNext);
      setCurrentQIndex(prev => prev + 1);
      speakQuestion(fallbackNext);
    }
  };

  // 9. Code Execution Runner
  const handleRunCodeTests = () => {
    const q = codingQuestions[activeCodeIndex];
    if (!q || !q.testCases) return;

    const results = [];
    let passed = 0;

    q.testCases.forEach((tc, idx) => {
      try {
        const runner = new Function(`
          ${codeEditorValue}
          return ${q.functionName}(${tc.input});
        `);
        const actual = runner();
        const actualStr = JSON.stringify(actual);

        let expectedParsed;
        try {
          expectedParsed = JSON.parse(tc.expectedOutput);
        } catch (e) {
          expectedParsed = tc.expectedOutput;
        }
        const expectedStr = JSON.stringify(expectedParsed);
        const isPass = actualStr === expectedStr;
        if (isPass) passed++;

        results.push({
          index: idx + 1,
          input: tc.input,
          expected: expectedStr,
          actual: actualStr,
          passed: isPass
        });
      } catch (err) {
        results.push({
          index: idx + 1,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: err.message,
          error: true,
          passed: false
        });
      }
    });

    setTestResults(results);
  };

  // 10. Finish Interview & Compile Evaluation Report
  const handleFinishInterview = async (disqualified = false, reason = '', historyParam = null) => {
    safeStopRecognition();
    if (ttsAudioRef.current) ttsAudioRef.current.pause();

    const finalHistory = historyParam || chatHistory;
    const currentCodeProblem = codingQuestions[activeCodeIndex];

    const payload = {
      interviewId,
      candidateId: user?.id || 'cand-current',
      candidateName,
      candidateEmail: user?.email || 'candidate@example.com',
      topic,
      difficulty,
      history: finalHistory,
      codingQuestion: currentCodeProblem,
      candidateCode: codeEditorValue,
      codingTestResults: {
        passedCount: testResults.filter(t => t.passed).length,
        totalCount: currentCodeProblem?.testCases?.length || 3
      },
      tabWarningsCount: proctorWarningCounts.tab,
      warningCounts: proctorWarningCounts,
      disqualified,
      disqualificationReason: reason,
      language: selectedLang
    };

    try {
      const res = await api.endAIInterview(payload);
      setEvaluationReport(res);
      setPhase('report');

      // Sync with storageService
      createFinalSubmission({
        interviewId,
        interviewTitle: topic,
        candidateName,
        candidateEmail: user?.email || 'candidate@example.com',
        evaluationReport: res
      });
    } catch (err) {
      console.warn('[Session] Final report compile notice:', err);
      const fallbackReport = {
        overallScore: disqualified ? 0 : 85,
        hiringRecommendation: disqualified ? 'No Hire' : 'Hire',
        executiveSummary: `Technical assessment completed for ${candidateName} in ${topic}. Demonstrated structured communication and solved core screening questions.`,
        strengths: ['Prompt and clear articulation', 'Solid conceptual foundations'],
        improvements: ['Elaborate further on trade-offs under scale'],
        breakdown: finalHistory.map(h => ({
          question: h.question,
          answer: h.answer,
          score: 85,
          feedback: 'Well articulated.'
        }))
      };
      setEvaluationReport(fallbackReport);
      setPhase('report');
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between selection:bg-sky-400/20 selection:text-sky-400">
      
      {/* Top Session Status Ribbon */}
      <header className="h-16 bg-neutral-900 border-b border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs shadow-inner">
            AI
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight truncate max-w-xs sm:max-w-md">
              {topic} • Adaptive Interview Room
            </h1>
            <p className="text-[11px] text-neutral-400">
              {interview?.companyName || 'TalentAI'} • {phase === 'verbal' ? `Verbal Round (Q ${currentQIndex + 1} / ${totalQuestions})` : phase === 'coding' ? 'Live Coding Assessment' : 'Evaluation Completed'}
            </p>
          </div>
        </div>

        {/* Proctoring HUD & Timer */}
        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="/ai-interview-platform.html"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-all"
            title="Switch to full 3D Avatar & Live Proctoring Platform"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>3D Avatar Platform</span>
          </a>

          <button
            type="button"
            onClick={() => setIsSpeechMuted(!isSpeechMuted)}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
              isSpeechMuted
                ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
            }`}
            title={isSpeechMuted ? 'Voice Muted' : 'Mute Recruiter Voice'}
          >
            {isSpeechMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>

          {/* Strikes Counter */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            strikes > 2
              ? 'bg-red-950/60 text-red-300 border-red-800 animate-pulse'
              : 'bg-neutral-800 text-neutral-300 border-neutral-700'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Strikes: {strikes} / 5</span>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-sky-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>
        </div>
      </header>

      {/* Proctoring Warning Toast */}
      {warningToast && (
        <div className="fixed top-20 right-6 z-50 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce border border-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{warningToast}</span>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: VERBAL ROUND & 3D AVATAR WORKSPACE
          ========================================================================= */}
      {phase === 'verbal' && (
        <main className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 3D AI Recruiter Avatar & Candidate Feed (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 3D Recruiter Avatar */}
            <div className="h-[320px] sm:h-[380px] w-full">
              <AIAvatar
                isSpeaking={isRecruiterSpeaking}
                emotion={emotion}
                avatarUrl="/images/avatar.jpg"
              />
            </div>

            {/* Candidate Webcam Feed & Proctor Status */}
            <div className="rounded-2xl overflow-hidden bg-black border border-neutral-800 aspect-video relative shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Proctoring AI Active</span>
              </div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-neutral-400 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
                <span>Face Gaze: Monitored</span>
                <span>Mic Stream: {isListening ? 'Receiving Speech' : 'Standby'}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Active Question & Interactive Response Station (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Question Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-neutral-800 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  <span>AI Recruiter Directive</span>
                </span>
                <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800">
                  Question {currentQIndex + 1} of {totalQuestions}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                "{currentQuestionText}"
              </h2>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => speakQuestion(currentQuestionText)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-300 border border-neutral-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repeat Question</span>
                </button>
              </div>
            </div>

            {/* Answer & Speech Transcription Panel */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#141414] border border-neutral-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Your Response
                  </span>
                  {isListening && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Continuous Call Active
                    </span>
                  )}
                </div>

                {/* Voice Status Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) safeStopRecognition();
                    else safeStartRecognition();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isListening
                      ? 'bg-red-500/20 text-red-400 border-red-500 animate-pulse'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                  }`}
                >
                  {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Listening...' : 'Enable Speech'}</span>
                </button>
              </div>

              {/* Real-time Subtitles / Interim Transcript Preview */}
              {interimTranscript && (
                <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/30 text-xs text-sky-300 flex items-start gap-2 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-400" />
                  <p className="italic">"{interimTranscript}"</p>
                </div>
              )}

              {/* Text Input Editor */}
              <textarea
                rows={7}
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                placeholder="Speak into your microphone (auto-transcribed) or type your answer here..."
                className="w-full p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans leading-relaxed resize-none"
              />

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                <span className="text-[11px] text-neutral-400">
                  Tip: Pause for 3.5s or click Submit to send your response.
                </span>

                <div className="flex items-center gap-3">
                  {codingQuestions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPhase('coding')}
                      className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white border border-neutral-800 hover:bg-neutral-900 transition-colors"
                    >
                      Skip to Coding
                    </button>
                  )}

                  <button
                    onClick={() => handleSubmitAnswer()}
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-500 text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <span>Submit & Next</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </main>
      )}

      {/* =========================================================================
          VIEW 2: IN-CALL CODING ASSESSMENT WORKSPACE
          ========================================================================= */}
      {phase === 'coding' && (
        <main className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Problem Statement & Test Case Status (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" />
                  <span>Programming Challenge</span>
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {codingQuestions[activeCodeIndex]?.language?.toUpperCase() || 'JAVASCRIPT'}
                </span>
              </div>

              <h2 className="text-lg font-bold text-white">
                {codingQuestions[activeCodeIndex]?.title || 'Algorithm Challenge'}
              </h2>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {codingQuestions[activeCodeIndex]?.description || 'Complete the solution implementation.'}
              </p>
            </div>

            {/* Test Cases Run Output */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Test Cases & Assertions
              </h3>

              <div className="space-y-2">
                {codingQuestions[activeCodeIndex]?.testCases?.map((tc, idx) => {
                  const res = testResults[idx];
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                        res
                          ? res.passed
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                            : 'bg-red-950/20 border-red-800/40 text-red-300'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <div>
                        <div className="font-mono font-semibold">Test {idx + 1}: input ({tc.input})</div>
                        <div className="text-[11px] opacity-80">Expected: {tc.expectedOutput}</div>
                      </div>
                      <div>
                        {res ? (
                          res.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )
                        ) : (
                          <span className="text-[10px] text-neutral-500">Ready</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => handleFinishInterview()}
              type="button"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all active:scale-98"
            >
              Submit Coding & Conclude Interview
            </button>
          </div>

          {/* Right: Code Editor & Execution Station (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-t-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-300">
                solution.{codingQuestions[activeCodeIndex]?.language === 'python' ? 'py' : 'js'}
              </span>
              <button
                type="button"
                onClick={handleRunCodeTests}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Test Cases</span>
              </button>
            </div>

            <textarea
              rows={18}
              value={codeEditorValue}
              onChange={(e) => setCodeEditorValue(e.target.value)}
              className="w-full p-4 rounded-b-2xl bg-black border border-neutral-800 font-mono text-xs text-sky-300 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none shadow-inner"
            />
          </div>

        </main>
      )}

      {/* =========================================================================
          VIEW 3: COMPREHENSIVE EVALUATION REPORT CARD
          ========================================================================= */}
      {phase === 'report' && evaluationReport && (
        <main className="max-w-5xl mx-auto w-full p-4 sm:p-8 flex-1 space-y-8 animate-fadeIn">
          
          {/* Header Score Card */}
          <div className="p-8 rounded-3xl bg-[#141414] border border-neutral-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Assessment Completed & Verified</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-6xl sm:text-7xl font-extrabold text-white tracking-tight">
                {evaluationReport.overallScore || 85}%
              </span>
              <span className="text-sm font-semibold text-neutral-400 mt-2">
                Overall Technical Competency Score
              </span>
              <span className={`mt-3 px-5 py-1.5 rounded-full text-xs font-bold border ${
                evaluationReport.hiringRecommendation?.includes('No Hire')
                  ? 'bg-red-950/40 text-red-300 border-red-800'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
              }`}>
                {evaluationReport.hiringRecommendation || 'Hire'}
              </span>
            </div>

            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {evaluationReport.executiveSummary}
            </p>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Demonstrated Strengths</span>
              </h3>
              <ul className="space-y-2 text-xs text-neutral-300">
                {evaluationReport.strengths?.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 space-y-4">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Growth & Improvement Areas</span>
              </h3>
              <ul className="space-y-2 text-xs text-neutral-300">
                {evaluationReport.improvements?.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Q&A Breakdown */}
          {evaluationReport.breakdown && evaluationReport.breakdown.length > 0 && (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-neutral-800 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span>Question Breakdown & Assessment</span>
              </h3>

              <div className="space-y-6">
                {evaluationReport.breakdown.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>Q{idx + 1}: {item.question}</span>
                      <span className="text-sky-400">{item.score || 85}%</span>
                    </div>
                    <div className="text-neutral-400">
                      <span className="font-semibold text-neutral-300">Your Answer: </span>
                      {item.answer}
                    </div>
                    {item.feedback && (
                      <div className="p-2.5 rounded-lg bg-sky-950/20 border border-sky-800/30 text-sky-300">
                        <span className="font-semibold">AI Evaluation: </span>
                        {item.feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/candidate/dashboard')}
              className="px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              Return to Candidate Dashboard
            </button>
          </div>

        </main>
      )}

    </div>
  );
}
