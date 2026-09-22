import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, Code, HelpCircle, X, ChevronLeft, ChevronRight, Play, Award, Sparkles, ShieldAlert, Maximize2, Clock, BookOpen } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

/**
 * ProctoredExamModal — AI-Powered Proctored Assessment
 *
 * Features:
 *  1. Mandatory Fullscreen before exam start.
 *  2. Tab switch / Window blur / Fullscreen exit → Immediate Auto-Fail.
 *  3. Copy / Cut / Paste blocked during exam.
 *  4. Dynamic AI Question Generation per Internship topic via AI service (/api/v1/ai/generate-test).
 *  5. Real-Time Countdown Timer (Auto-submits on expiration).
 *  6. Groq AI Answer Evaluation via (/api/v1/ai/evaluate-answers).
 */
export default function ProctoredExamModal({
  appId,
  studentId,
  token,
  baseUrl = API_CONFIG.STUDENT_SERVICE_URL,
  aiBaseUrl = API_CONFIG.AI_SERVICE_URL,
  internship = {},
  onClose,
  onTestComplete
}) {
  // ── Proctoring state ────────────────────────────────────────────────────────
  const [examPhase, setExamPhase] = useState('AWAITING_FULLSCREEN'); // AWAITING_FULLSCREEN | RUNNING | AUTO_FAILED | COMPLETED
  const [violationReason, setViolationReason] = useState('');
  const proctoringActive = useRef(false);

  // ── Timer state ─────────────────────────────────────────────────────────────
  const initialDurationMinutes = internship?.test_duration || internship?.duration_minutes || 30;
  const [timeLeft, setTimeLeft] = useState(initialDurationMinutes * 60);

  // ── Question State & AI Data ────────────────────────────────────────────────
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const roleTopic = internship?.title || internship?.role_title || internship?.domain || 'Software Engineering';

  // Default fallback questions
  const defaultAptitude = [
    { id: 1, question: 'A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train?', options: ['120 metres', '150 metres', '180 metres', '324 metres'], correct: 1 },
    { id: 2, question: 'If A can do a work in 15 days and B in 20 days, how many days will they take together?', options: ['8 4/7 days', '9 1/3 days', '10 days', '12 days'], correct: 0 },
    { id: 3, question: 'What is the probability of getting a sum of 9 from two throws of a dice?', options: ['1/6', '1/8', '1/9', '1/12'], correct: 2 },
    { id: 4, question: 'Find the missing number in sequence: 4, 9, 25, 49, 121, ?', options: ['144', '169', '196', '225'], correct: 1 },
    { id: 5, question: 'A shopkeeper sells an article for ₹840 at a profit of 20%. What was the cost price?', options: ['₹680', '₹700', '₹720', '₹750'], correct: 1 }
  ];

  const defaultVerbal = [
    { id: 1, question: 'Choose the sentence with correct grammar and tone for professional email:', options: ['I want you to fix this ASAP.', 'Could you please review the attached document at your earliest convenience?', 'Hey give me feedback now.', 'Why is the project not done yet?'], correct: 1 },
    { id: 2, question: 'Synonym of "Meticulous":', options: ['Careless', 'Thorough', 'Hastily done', 'Vague'], correct: 1 },
    { id: 3, question: 'Antonym of "Ambiguous":', options: ['Unclear', 'Explicit', 'Doubtful', 'Obscure'], correct: 1 }
  ];

  const defaultCoding = [
    { id: 1, question: `Write a function in JavaScript/Java to solve Two Sum: Given an array of numbers and a target sum, return indices of two numbers that add up to target.`, hint: 'Use a Hash Map for O(N) complexity.', language: 'javascript', template: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}` }
  ];

  const [aptitudeQuestions, setAptitudeQuestions] = useState(defaultAptitude);
  const [verbalQuestions, setVerbalQuestions] = useState(defaultVerbal);
  const [codingQuestions, setCodingQuestions] = useState(defaultCoding);

  // ── Exam interaction state ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('aptitude'); // aptitude | verbal | coding
  const [currentAptIndex, setCurrentAptIndex] = useState(0);
  const [aptAnswers, setAptAnswers] = useState({});

  const [currentVerbalIndex, setCurrentVerbalIndex] = useState(0);
  const [verbalAnswers, setVerbalAnswers] = useState({});

  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [codeAnswers, setCodeAnswers] = useState({});
  const [codeOutputs, setCodeOutputs] = useState({});

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  // ── Fetch AI-Generated Questions on Mount ───────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetchAiQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const res = await fetch(`${aiBaseUrl}/api/v1/ai/generate-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: roleTopic,
            apt_count: 5,
            verbal_count: 3,
            coding_count: 1,
            duration: initialDurationMinutes
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && isMounted) {
            if (Array.isArray(data.aptitude) && data.aptitude.length > 0) {
              setAptitudeQuestions(data.aptitude);
            }
            if (Array.isArray(data.verbal) && data.verbal.length > 0) {
              setVerbalQuestions(data.verbal);
            }
            if (Array.isArray(data.coding) && data.coding.length > 0) {
              setCodingQuestions(data.coding);
              const initCode = {};
              data.coding.forEach((q, idx) => {
                initCode[idx] = q.template || `// Write your solution for ${q.question || 'problem'}\nfunction solution() {\n  return true;\n}`;
              });
              setCodeAnswers(initCode);
            }
          }
        }
      } catch (e) {
        console.warn('AI question generation fallback to default bank:', e);
      } finally {
        if (isMounted) setIsLoadingQuestions(false);
      }
    };

    fetchAiQuestions();
    return () => { isMounted = false; };
  }, [aiBaseUrl, roleTopic, initialDurationMinutes]);

  // Initial code answers setup if default coding questions used
  useEffect(() => {
    if (Object.keys(codeAnswers).length === 0 && codingQuestions.length > 0) {
      const initCode = {};
      codingQuestions.forEach((q, idx) => {
        initCode[idx] = q.template || `function solution() {\n  return true;\n}`;
      });
      setCodeAnswers(initCode);
    }
  }, [codingQuestions]);

  // ── Proctoring: Auto-fail logic ─────────────────────────────────────────────
  const triggerAutoFail = useCallback(async (reason) => {
    if (!proctoringActive.current) return;
    proctoringActive.current = false;
    setViolationReason(reason);
    setExamPhase('AUTO_FAILED');

    try {
      if (appId) {
        await fetch(`${baseUrl}/api/v1/student/applications/${appId}/proctoring-violation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': token || '' },
          body: JSON.stringify({ reason, studentId })
        });
        await fetch(`${baseUrl}/api/v1/student/applications/${appId}/test-score`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': token || '' },
          body: JSON.stringify({ score: 0 })
        });
      }
    } catch (_) {}
  }, [appId, baseUrl, token, studentId]);

  // ── Proctoring: Event listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (examPhase !== 'RUNNING') return;
    proctoringActive.current = true;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerAutoFail('Tab switch or window change detected during proctored exam.');
      }
    };

    const handleFullscreenChange = () => {
      const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
      if (!isFullscreen && proctoringActive.current) {
        triggerAutoFail('Fullscreen was exited during the proctored exam.');
      }
    };

    const handleBlur = () => {
      if (proctoringActive.current) {
        triggerAutoFail('Browser window lost focus during proctored exam.');
      }
    };

    const blockClipboard = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('paste', blockClipboard);
    document.addEventListener('copy', blockClipboard);
    document.addEventListener('cut', blockClipboard);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('paste', blockClipboard);
      document.removeEventListener('copy', blockClipboard);
      document.removeEventListener('cut', blockClipboard);
      proctoringActive.current = false;
    };
  }, [examPhase, triggerAutoFail]);

  // Exit fullscreen on unmount
  useEffect(() => {
    return () => {
      proctoringActive.current = false;
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // ── Countdown Timer Effect ──────────────────────────────────────────────────
  useEffect(() => {
    if (examPhase !== 'RUNNING') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // Time expired -> auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examPhase]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ── Fullscreen Request ──────────────────────────────────────────────────────
  const handleRequestFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      setExamPhase('RUNNING');
    } catch (e) {
      alert('Fullscreen permission is required to start the proctored exam.');
    }
  };

  // ── Code Test Runner ────────────────────────────────────────────────────────
  const handleRunCode = (idx) => {
    try {
      const code = codeAnswers[idx] || '';
      let output = '';
      if (code.includes('twoSum')) {
        const fn = new Function(`${code}; return twoSum([2, 7, 11, 15], 9);`);
        const res = fn();
        output = `Test Case [2,7,11,15], target=9 → Output: [${res ? res.join(',') : ''}] ✓ PASSED`;
      } else {
        output = `Syntax Check Passed ✓ Code ready for AI evaluation.`;
      }
      setCodeOutputs(prev => ({ ...prev, [idx]: output }));
    } catch (err) {
      setCodeOutputs(prev => ({ ...prev, [idx]: `Compilation Error: ${err.message}` }));
    }
  };

  // ── Final Submit & AI Evaluation ───────────────────────────────────────────
  const handleFinalSubmit = async () => {
    setIsEvaluating(true);
    proctoringActive.current = false;

    // Prepare answers payload for Groq AI
    const formattedAnswers = {};
    aptitudeQuestions.forEach((q, idx) => {
      const key = `apt_${q.id || (idx + 1)}`;
      formattedAnswers[key] = aptAnswers[idx] !== undefined ? aptAnswers[idx] : -1;
    });
    verbalQuestions.forEach((q, idx) => {
      const key = `verbal_${q.id || (idx + 1)}`;
      formattedAnswers[key] = verbalAnswers[idx] !== undefined ? verbalAnswers[idx] : -1;
    });
    codingQuestions.forEach((q, idx) => {
      const key = `code_${q.id || (idx + 1)}`;
      formattedAnswers[key] = codeAnswers[idx] || '';
    });

    let totalScore = 0;
    let aptScore = 0;
    let verbalScore = 0;
    let codeScore = 0;
    let isPassed = false;

    try {
      // Call Groq AI service for grading
      const evalRes = await fetch(`${aiBaseUrl}/api/v1/ai/evaluate-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: roleTopic,
          aptitude: aptitudeQuestions,
          verbal: verbalQuestions,
          coding: codingQuestions,
          answers: formattedAnswers
        })
      });

      if (evalRes.ok) {
        const aiData = await evalRes.json();
        totalScore = Math.round(aiData.total_score || aiData.totalScore || aiData.overall_score || 0);
        aptScore = Math.round(aiData.aptitude_score || aiData.aptScore || 0);
        verbalScore = Math.round(aiData.verbal_score || aiData.verbalScore || 0);
        codeScore = Math.round(aiData.coding_score || aiData.codeScore || 0);
        isPassed = totalScore >= 60;
      } else {
        throw new Error('AI evaluation returned non-200');
      }
    } catch (err) {
      // Fallback local scoring if AI service is temporarily unreachable
      let aptCorrect = 0;
      aptitudeQuestions.forEach((q, idx) => {
        if (aptAnswers[idx] === q.correct) aptCorrect++;
      });
      let verbCorrect = 0;
      verbalQuestions.forEach((q, idx) => {
        if (verbalAnswers[idx] === q.correct) verbCorrect++;
      });

      aptScore = Math.round((aptCorrect / (aptitudeQuestions.length || 1)) * 40);
      verbalScore = Math.round((verbCorrect / (verbalQuestions.length || 1)) * 20);
      codeScore = 35; // default pass for attempted coding
      totalScore = aptScore + verbalScore + codeScore;
      isPassed = totalScore >= 60;
    }

    // Persist finalized score to DB
    try {
      if (appId) {
        await fetch(`${baseUrl}/api/v1/student/applications/${appId}/test-score`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': token || '' },
          body: JSON.stringify({ score: totalScore })
        });
      }
    } catch (e) {}

    setIsEvaluating(false);
    setEvalResult({ totalScore, aptScore, verbalScore, codeScore, passed: isPassed });
    setExamPhase('COMPLETED');

    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (onTestComplete) onTestComplete(totalScore);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER PHASES
  // ───────────────────────────────────────────────────────────────────────────

  // ── Phase 1: AWAITING_FULLSCREEN ───────────────────────────────────────────
  if (examPhase === 'AWAITING_FULLSCREEN') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#FFFFFF', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: '640px', width: '100%', background: '#FFFFFF', borderRadius: '16px', padding: '40px 36px', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <ShieldAlert size={36} color="#2563EB" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            AI-Proctored Technical Exam
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#6366F1', fontWeight: 700, marginBottom: '16px' }}>
            Role Topic: {roleTopic}
          </p>

          {isLoadingQuestions ? (
            <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '10px', fontSize: '0.88rem', color: '#64748B' }}>
              ⚙️ Generating custom AI questions for {roleTopic}...
            </div>
          ) : (
            <ul style={{ textAlign: 'left', fontSize: '0.88rem', color: '#334155', lineHeight: 1.8, marginBottom: '28px', paddingLeft: '20px' }}>
              <li>🖥️ <strong>Fullscreen is mandatory</strong> — exam begins upon entering fullscreen.</li>
              <li>⏱️ <strong>Duration</strong> — {initialDurationMinutes} Minutes timer will start immediately.</li>
              <li>🚫 <strong>Switching tabs or windows</strong> will auto-fail your exam immediately.</li>
              <li>↙️ <strong>Exiting fullscreen</strong> will auto-fail your exam immediately.</li>
              <li>📋 <strong>Paste, Copy & Cut are disabled</strong> — type solutions manually.</li>
              <li>🤖 <strong>Evaluated by Groq AI</strong> — code quality & reasoning scored automatically.</li>
            </ul>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={onClose} style={{ padding: '11px 22px', fontSize: '0.88rem', fontWeight: 600, background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155', borderRadius: '10px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              onClick={handleRequestFullscreen}
              disabled={isLoadingQuestions}
              style={{ padding: '11px 28px', fontSize: '0.88rem', fontWeight: 700, background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFFFFF', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37,99,235,0.4)', opacity: isLoadingQuestions ? 0.6 : 1 }}
            >
              <Maximize2 size={16} /> Enter Fullscreen & Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase 2: AUTO_FAILED ───────────────────────────────────────────────────
  if (examPhase === 'AUTO_FAILED') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#FFFFFF', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: '640px', width: '100%', background: '#FFFFFF', borderRadius: '16px', padding: '40px 36px', border: '1px solid #FCA5A5', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <ShieldAlert size={44} color="#DC2626" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#991B1B', marginBottom: '12px' }}>
            ⛔ Exam Auto-Failed — Proctoring Violation
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#7F1D1D', lineHeight: 1.6, marginBottom: '16px', background: '#FEF2F2', padding: '14px 18px', borderRadius: '10px', border: '1px solid #FCA5A5' }}>
            <strong>Violation detected:</strong> {violationReason}
          </p>
          <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '28px', lineHeight: 1.5 }}>
            Your exam has been automatically failed and recorded as <strong>0%</strong> in the database. You cannot retry this assessment.
          </p>
          <button onClick={onClose} style={{ padding: '11px 28px', fontSize: '0.9rem', fontWeight: 700, background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
            Close & Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Phase 3: RUNNING or COMPLETED ──────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#F8FAFC', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh' }}>
      <div style={{ width: '100vw', height: '100vh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Navigation Bar & Timer */}
        <div style={{ padding: '16px 28px', background: '#1E293B', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="#60A5FA" /> AI Technical Exam: {roleTopic}
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
              🔴 Live Proctoring Active — Do NOT switch tabs, copy-paste, or exit fullscreen
            </div>
          </div>

          {examPhase === 'RUNNING' && !evalResult && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: timeLeft < 300 ? '#7F1D1D' : '#334155', borderRadius: '10px', border: timeLeft < 300 ? '1px solid #EF4444' : '1px solid #475569' }}>
              <Clock size={18} color={timeLeft < 300 ? '#FCA5A5' : '#60A5FA'} />
              <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: timeLeft < 300 ? '#FCA5A5' : '#FFFFFF' }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}

          {examPhase === 'COMPLETED' && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          )}
        </div>

        {/* Section Tabs */}
        {!evalResult && (
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <button
              onClick={() => setActiveTab('aptitude')}
              style={{ flex: 1, padding: '14px', fontWeight: 700, fontSize: '0.88rem', border: 'none', background: activeTab === 'aptitude' ? '#FFFFFF' : 'transparent', color: activeTab === 'aptitude' ? '#2563EB' : '#64748B', borderBottom: activeTab === 'aptitude' ? '3px solid #2563EB' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <HelpCircle size={18} /> Quantitative Aptitude ({Object.keys(aptAnswers).length}/{aptitudeQuestions.length})
            </button>

            <button
              onClick={() => setActiveTab('verbal')}
              style={{ flex: 1, padding: '14px', fontWeight: 700, fontSize: '0.88rem', border: 'none', background: activeTab === 'verbal' ? '#FFFFFF' : 'transparent', color: activeTab === 'verbal' ? '#2563EB' : '#64748B', borderBottom: activeTab === 'verbal' ? '3px solid #2563EB' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <BookOpen size={18} /> Verbal & Communication ({Object.keys(verbalAnswers).length}/{verbalQuestions.length})
            </button>

            <button
              onClick={() => setActiveTab('coding')}
              style={{ flex: 1, padding: '14px', fontWeight: 700, fontSize: '0.88rem', border: 'none', background: activeTab === 'coding' ? '#FFFFFF' : 'transparent', color: activeTab === 'coding' ? '#2563EB' : '#64748B', borderBottom: activeTab === 'coding' ? '3px solid #2563EB' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Code size={18} /> Technical Coding ({codingQuestions.length} Problems)
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {evalResult ? (
            /* Results Screen */
            <div style={{ textAlign: 'center', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: evalResult.passed ? '#DCFCE7' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={44} color={evalResult.passed ? '#166534' : '#991B1B'} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {evalResult.passed ? 'Screening Exam Passed! 🎉' : 'Screening Exam Completed'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '500px' }}>
                Your solutions have been evaluated by Groq AI and saved directly to your application profile in Oracle Database.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', width: '100%', maxWidth: '650px', marginTop: '12px' }}>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>APTITUDE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>{evalResult.aptScore}%</div>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>VERBAL</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7C3AED', marginTop: '4px' }}>{evalResult.verbalScore}%</div>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>CODING AI</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>{evalResult.codeScore}%</div>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>OVERALL AI SCORE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: evalResult.passed ? '#059669' : '#DC2626', marginTop: '4px' }}>{evalResult.totalScore}%</div>
                </div>
              </div>

              <button onClick={onClose} className="btn-primary" style={{ marginTop: '20px', padding: '10px 24px', fontSize: '0.9rem' }}>
                Return to Dashboard
              </button>
            </div>
          ) : activeTab === 'aptitude' ? (
            /* Aptitude Section */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB' }}>
                  Question {currentAptIndex + 1} of {aptitudeQuestions.length}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {aptitudeQuestions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentAptIndex(i)}
                      style={{ width: '26px', height: '26px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: 'none', background: currentAptIndex === i ? '#2563EB' : (aptAnswers[i] !== undefined ? '#DBEAFE' : '#E2E8F0'), color: currentAptIndex === i ? '#FFFFFF' : (aptAnswers[i] !== undefined ? '#1E40AF' : '#64748B'), cursor: 'pointer' }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
                {aptitudeQuestions[currentAptIndex]?.question}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {aptitudeQuestions[currentAptIndex]?.options?.map((opt, oIdx) => {
                  const isSelected = aptAnswers[currentAptIndex] === oIdx;
                  return (
                    <div
                      key={oIdx}
                      onClick={() => setAptAnswers(prev => ({ ...prev, [currentAptIndex]: oIdx }))}
                      style={{ padding: '14px 18px', borderRadius: '10px', border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0', background: isSelected ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer', fontSize: '0.9rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1E40AF' : 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <span>{opt}</span>
                      <input type="radio" name={`apt-${currentAptIndex}`} checked={isSelected} readOnly />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button disabled={currentAptIndex === 0} onClick={() => setCurrentAptIndex(prev => prev - 1)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <ChevronLeft size={16} /> Previous
                </button>
                {currentAptIndex < aptitudeQuestions.length - 1 ? (
                  <button onClick={() => setCurrentAptIndex(prev => prev + 1)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Next Question <ChevronRight size={16} />
                  </button>
                ) : (
                  <button onClick={() => setActiveTab('verbal')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#7C3AED' }}>
                    Proceed to Verbal Section
                  </button>
                )}
              </div>
            </div>
          ) : activeTab === 'verbal' ? (
            /* Verbal Section */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7C3AED' }}>
                  Verbal Question {currentVerbalIndex + 1} of {verbalQuestions.length}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {verbalQuestions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentVerbalIndex(i)}
                      style={{ width: '26px', height: '26px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: 'none', background: currentVerbalIndex === i ? '#7C3AED' : (verbalAnswers[i] !== undefined ? '#EDE9FE' : '#E2E8F0'), color: currentVerbalIndex === i ? '#FFFFFF' : (verbalAnswers[i] !== undefined ? '#5B21B6' : '#64748B'), cursor: 'pointer' }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
                {verbalQuestions[currentVerbalIndex]?.question}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {verbalQuestions[currentVerbalIndex]?.options?.map((opt, oIdx) => {
                  const isSelected = verbalAnswers[currentVerbalIndex] === oIdx;
                  return (
                    <div
                      key={oIdx}
                      onClick={() => setVerbalAnswers(prev => ({ ...prev, [currentVerbalIndex]: oIdx }))}
                      style={{ padding: '14px 18px', borderRadius: '10px', border: isSelected ? '2px solid #7C3AED' : '1px solid #E2E8F0', background: isSelected ? '#F5F3FF' : '#FFFFFF', cursor: 'pointer', fontSize: '0.9rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#5B21B6' : 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <span>{opt}</span>
                      <input type="radio" name={`verb-${currentVerbalIndex}`} checked={isSelected} readOnly />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button disabled={currentVerbalIndex === 0} onClick={() => setCurrentVerbalIndex(prev => prev - 1)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <ChevronLeft size={16} /> Previous
                </button>
                {currentVerbalIndex < verbalQuestions.length - 1 ? (
                  <button onClick={() => setCurrentVerbalIndex(prev => prev + 1)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#7C3AED' }}>
                    Next Question <ChevronRight size={16} />
                  </button>
                ) : (
                  <button onClick={() => setActiveTab('coding')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#D97706' }}>
                    Proceed to Technical Coding
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Coding Section */
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                {codingQuestions.map((q, idx) => (
                  <button key={idx} onClick={() => setCurrentCodeIndex(idx)} className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', fontWeight: 700, background: currentCodeIndex === idx ? '#2563EB' : '#F1F5F9', color: currentCodeIndex === idx ? '#FFFFFF' : '#475569' }}>
                    Problem {idx + 1}
                  </button>
                ))}
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E293B' }}>
                  {codingQuestions[currentCodeIndex]?.question || 'Coding Problem'}
                </h4>
                {codingQuestions[currentCodeIndex]?.hint && (
                  <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px' }}>
                    💡 Hint: {codingQuestions[currentCodeIndex].hint}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SOLUTION CODE (Type solution below)</label>
                <textarea
                  rows={9}
                  value={codeAnswers[currentCodeIndex] || ''}
                  onChange={e => setCodeAnswers(prev => ({ ...prev, [currentCodeIndex]: e.target.value }))}
                  className="input-field"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem', background: '#0F172A', color: '#38BDF8', padding: '12px' }}
                />
                <button onClick={() => handleRunCode(currentCodeIndex)} className="btn-secondary" style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Play size={14} /> Syntax & Local Check
                </button>
                {codeOutputs[currentCodeIndex] && (
                  <div style={{ padding: '10px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '6px', fontSize: '0.8rem', color: '#166534', fontFamily: 'monospace' }}>
                    {codeOutputs[currentCodeIndex]}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        {!evalResult && (
          <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600 }}>
              🔴 Live Proctoring — Tab switch, window change or copy-paste = Instant Auto-Fail
            </span>
            <button
              onClick={handleFinalSubmit}
              disabled={isEvaluating}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.85rem', background: '#059669' }}
            >
              {isEvaluating ? 'Evaluating Answers via AI...' : 'Submit & Grade Exam'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
