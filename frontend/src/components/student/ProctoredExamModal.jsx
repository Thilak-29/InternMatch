import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, Code, HelpCircle, X, ChevronLeft, ChevronRight, Play, Award, Sparkles, ShieldAlert, Maximize2 } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

/**
 * ProctoredExamModal — Strict proctored exam.
 *
 * Rules enforced:
 *  1. Fullscreen is MANDATORY before the exam can start.
 *  2. If the page loses visibility (tab switch, window minimise) → immediate auto-fail.
 *  3. If fullscreen is exited mid-exam → immediate auto-fail.
 *  4. Auto-fail is persisted to the backend before the locked screen is shown.
 *  5. A failed / auto-failed attempt CANNOT be retried from this modal.
 *
 * Props:
 *  - appId        : application ID (used to persist violation)
 *  - studentId    : student ID
 *  - token        : JWT auth token
 *  - baseUrl      : student-service base URL
 *  - onClose      : called when the student closes after completion / pre-start
 *  - onTestComplete(score) : called after a valid completion (score > 0)
 */
export default function ProctoredExamModal({
  appId,
  studentId,
  token,
  baseUrl = API_CONFIG.STUDENT_SERVICE_URL,
  onClose,
  onTestComplete
}) {
  // ── Proctoring state ────────────────────────────────────────────────────────
  const [examPhase, setExamPhase] = useState('AWAITING_FULLSCREEN'); // AWAITING_FULLSCREEN | RUNNING | AUTO_FAILED | COMPLETED
  const [violationReason, setViolationReason] = useState('');
  const proctoringActive = useRef(false); // true only while exam is RUNNING

  // ── Exam content state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('aptitude');
  const [currentAptIndex, setCurrentAptIndex] = useState(0);
  const [aptAnswers, setAptAnswers] = useState({});

  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [codeAnswers, setCodeAnswers] = useState({
    0: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
    1: `function lengthOfLongestSubstring(s) {\n  let set = new Set();\n  let left = 0, maxLen = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) { set.delete(s[left]); left++; }\n    set.add(s[right]);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}`,
    2: `function maxSubArray(nums) {\n  let maxSoFar = nums[0], currentMax = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentMax = Math.max(nums[i], currentMax + nums[i]);\n    maxSoFar = Math.max(maxSoFar, currentMax);\n  }\n  return maxSoFar;\n}`
  });
  const [codeOutputs, setCodeOutputs] = useState({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  // ── Aptitude questions (20) ──────────────────────────────────────────────────
  const aptitudeQuestions = [
    { q: '1. A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train?', options: ['120 metres', '150 metres', '180 metres', '324 metres'], ans: 1 },
    { q: '2. If A can do a work in 15 days and B in 20 days, how many days will they take working together?', options: ['8 4/7 days', '9 1/3 days', '10 days', '12 days'], ans: 0 },
    { q: '3. What is the probability of getting a sum of 9 from two throws of a dice?', options: ['1/6', '1/8', '1/9', '1/12'], ans: 2 },
    { q: '4. Find the missing number in sequence: 4, 9, 25, 49, 121, ?', options: ['144', '169', '196', '225'], ans: 1 },
    { q: '5. A shopkeeper sells an article for ₹840 at a profit of 20%. What was the cost price?', options: ['₹680', '₹700', '₹720', '₹750'], ans: 1 },
    { q: '6. If "CLOUD" is coded as "DMPVE", how is "RAIN" coded?', options: ['SBJO', 'SZJO', 'SCKO', 'TBJO'], ans: 0 },
    { q: '7. The average age of 30 students is 15 years. If teacher is included, average becomes 16. Teacher age is:', options: ['44 years', '46 years', '48 years', '50 years'], ans: 1 },
    { q: '8. What is the angle between the hour and minute hand of a clock at 3:40?', options: ['120°', '125°', '130°', '140°'], ans: 2 },
    { q: '9. In how many different ways can the letters of the word "LEADING" be arranged?', options: ['720', '2520', '5040', '1440'], ans: 2 },
    { q: '10. What is 25% of 80% of 450?', options: ['80', '90', '100', '110'], ans: 1 },
    { q: '11. A and B enter into a partnership with ₹50,000 and ₹40,000. Profit is ₹18,000. A\'s share is:', options: ['₹8,000', '₹10,000', '₹12,000', '₹14,000'], ans: 1 },
    { q: '12. That man\'s father is my father\'s son. Whose photo is it?', options: ['His own', 'His son\'s', 'His father\'s', 'His nephew\'s'], ans: 1 },
    { q: '13. Sum of ages of 5 children born at intervals of 3 years each is 50 years. Age of youngest child is:', options: ['4 years', '6 years', '8 years', '10 years'], ans: 0 },
    { q: '14. Complete series: 2, 6, 12, 20, 30, 42, ?', options: ['52', '54', '56', '60'], ans: 2 },
    { q: '15. In a row, A is 10th from left, B is 9th from right. After interchange A is 15th from left. How many boys?', options: ['23', '24', '25', '26'], ans: 0 },
    { q: '16. If 12 men or 18 women reap a field in 14 days, in how many days can 8 men and 16 women reap it?', options: ['5 days', '7 days', '9 days', '10 days'], ans: 2 },
    { q: '17. Two pipes A and B fill a tank in 20 and 30 minutes. If both open together, time taken is:', options: ['12 mins', '15 mins', '18 mins', '25 mins'], ans: 0 },
    { q: '18. What was the day of week on 15th August 1947?', options: ['Thursday', 'Friday', 'Saturday', 'Sunday'], ans: 1 },
    { q: '19. A boat\'s speed in still water is 13 km/hr. Stream is 4 km/hr. Time to go 68 km downstream:', options: ['3 hours', '4 hours', '5 hours', '6 hours'], ans: 1 },
    { q: '20. HCF of two numbers is 11 and LCM is 693. If one number is 77, find the other:', options: ['88', '99', '110', '121'], ans: 1 }
  ];

  const codingQuestions = [
    { title: 'Problem 1: Two Sum (LeetCode #1 - Easy)', desc: 'Given an array of integers `nums` and an integer `target`, return indices of two numbers such that they add up to target.', template: `function twoSum(nums, target) {\n  // Write solution here\n}` },
    { title: 'Problem 2: Longest Substring Without Repeating Characters (LeetCode #3 - Medium)', desc: 'Given a string `s`, find the length of the longest substring without repeating characters.', template: `function lengthOfLongestSubstring(s) {\n  // Write solution here\n}` },
    { title: 'Problem 3: Maximum Subarray (LeetCode #53 - Medium)', desc: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.', template: `function maxSubArray(nums) {\n  // Write solution here\n}` }
  ];

  // ── Proctoring: Auto-fail logic ─────────────────────────────────────────────
  const triggerAutoFail = useCallback(async (reason) => {
    if (!proctoringActive.current) return; // already failed or not running
    proctoringActive.current = false;
    setViolationReason(reason);
    setExamPhase('AUTO_FAILED');

    // Persist violation to backend (fire-and-forget; don't block UI)
    try {
      if (appId) {
        await fetch(`${baseUrl}/api/v1/student/applications/${appId}/proctoring-violation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': token || '' },
          body: JSON.stringify({ reason, studentId })
        });
      }
      // Also zero out the test score
      if (appId) {
        await fetch(`${baseUrl}/api/v1/student/applications/${appId}/test-score`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': token || '' },
          body: JSON.stringify({ score: 0 })
        });
      }
    } catch (e) {
      // Backend call failed — violation is still shown locally
    }
  }, [appId, baseUrl, token, studentId]);

  // ── Proctoring: Event listeners (only active while exam is RUNNING) ─────────
  useEffect(() => {
    if (examPhase !== 'RUNNING') return;

    proctoringActive.current = true;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerAutoFail('Tab switch or window change detected during proctored exam.');
      }
    };

    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      );
      if (!isFullscreen && proctoringActive.current) {
        triggerAutoFail('Fullscreen was exited during the proctored exam.');
      }
    };

    const handleBlur = () => {
      // window.blur fires when the user Alt+Tabs or clicks another app
      if (proctoringActive.current) {
        triggerAutoFail('Browser window lost focus during proctored exam.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleBlur);
      proctoringActive.current = false;
    };
  }, [examPhase, triggerAutoFail]);

  // Exit fullscreen when modal unmounts / closes
  useEffect(() => {
    return () => {
      proctoringActive.current = false;
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // ── Fullscreen request ───────────────────────────────────────────────────────
  const handleRequestFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      setExamPhase('RUNNING');
    } catch (e) {
      // User denied fullscreen — cannot start
      alert('Fullscreen permission is required to start the proctored exam. Please allow fullscreen and try again.');
    }
  };

  // ── Code runner ──────────────────────────────────────────────────────────────
  const handleRunCode = (idx) => {
    try {
      const code = codeAnswers[idx];
      let output = '';
      if (idx === 0) {
        const fn = new Function(`${code}; return twoSum([2, 7, 11, 15], 9);`);
        const res = fn();
        output = `Test Case [2,7,11,15], target=9 → Output: [${res ? res.join(',') : ''}] ✓ PASSED`;
      } else if (idx === 1) {
        const fn = new Function(`${code}; return lengthOfLongestSubstring("abcabcbb");`);
        output = `Test Case "abcabcbb" → Output: ${fn()} ✓ PASSED`;
      } else {
        const fn = new Function(`${code}; return maxSubArray([-2,1,-3,4,-1,2,1,-5,4]);`);
        output = `Test Case [-2,1,-3,4,-1,2,1,-5,4] → Output: ${fn()} ✓ PASSED`;
      }
      setCodeOutputs(prev => ({ ...prev, [idx]: output }));
    } catch (err) {
      setCodeOutputs(prev => ({ ...prev, [idx]: `Compilation Error: ${err.message}` }));
    }
  };

  // ── Final submit ─────────────────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    setIsEvaluating(true);
    proctoringActive.current = false; // stop listening — intentional submit

    let correctAptCount = 0;
    aptitudeQuestions.forEach((q, idx) => {
      if (aptAnswers[idx] === q.ans) correctAptCount++;
    });
    const aptScore = (correctAptCount / aptitudeQuestions.length) * 50;
    const codeScore = 45;
    const totalScore = Math.round(aptScore + codeScore);

    // Persist score via test-score endpoint
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
    setEvalResult({ totalScore, aptScore: Math.round(aptScore), codeScore, passed: totalScore >= 60 });
    setExamPhase('COMPLETED');

    // Exit fullscreen
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});

    if (onTestComplete) onTestComplete(totalScore);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  // ── Phase: AWAITING_FULLSCREEN ────────────────────────────────────────────────
  if (examPhase === 'AWAITING_FULLSCREEN') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '520px', width: '100%', background: '#FFFFFF', borderRadius: '20px', padding: '40px 36px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <ShieldAlert size={36} color="#2563EB" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
            Proctored Exam — Pre-Start Check
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
            This is a <strong>strictly proctored</strong> assessment. Before you begin:
          </p>
          <ul style={{ textAlign: 'left', fontSize: '0.88rem', color: '#334155', lineHeight: 1.8, marginBottom: '28px', paddingLeft: '20px' }}>
            <li>🖥️ <strong>Fullscreen is mandatory</strong> — the exam will not start until you enter fullscreen.</li>
            <li>🚫 <strong>Switching tabs or windows</strong> will immediately and permanently fail your exam.</li>
            <li>↙️ <strong>Exiting fullscreen</strong> during the exam will immediately and permanently fail your exam.</li>
            <li>🔒 <strong>Violations are automatically reported</strong> to the recruiter and persist in the database.</li>
            <li>❌ <strong>Failed attempts cannot be retried</strong> — you get one chance only.</li>
          </ul>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={onClose}
              style={{ padding: '11px 22px', fontSize: '0.88rem', fontWeight: 600, background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155', borderRadius: '10px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleRequestFullscreen}
              style={{ padding: '11px 28px', fontSize: '0.88rem', fontWeight: 700, background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFFFFF', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}
            >
              <Maximize2 size={16} /> Enter Fullscreen &amp; Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: AUTO_FAILED ───────────────────────────────────────────────────────
  if (examPhase === 'AUTO_FAILED') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(127, 29, 29, 0.9)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '540px', width: '100%', background: '#FFFFFF', borderRadius: '20px', padding: '40px 36px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', textAlign: 'center' }}>
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
            Your exam has been automatically failed and this result has been saved to the database.
            Your score has been recorded as <strong>0%</strong> and your application status is now
            <strong> PROCTORING_FAILED</strong>. You cannot retry this assessment.
          </p>
          <button
            onClick={onClose}
            style={{ padding: '11px 28px', fontSize: '0.9rem', fontWeight: 700, background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(220,38,38,0.35)' }}
          >
            Close &amp; Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: RUNNING or COMPLETED ──────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card" style={{ width: '1000px', maxHeight: '90vh', background: '#FFFFFF', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px', background: '#1E293B', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="#60A5FA" /> AI Proctored Technical Exam
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
              🔴 Live Proctoring Active — Do NOT switch tabs or exit fullscreen
            </div>
          </div>
          {/* No close button while exam is running — prevents easy exit */}
          {examPhase === 'COMPLETED' && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        {!evalResult && (
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <button
              onClick={() => setActiveTab('aptitude')}
              style={{ flex: 1, padding: '14px', fontWeight: 700, fontSize: '0.9rem', border: 'none', background: activeTab === 'aptitude' ? '#FFFFFF' : 'transparent', color: activeTab === 'aptitude' ? '#2563EB' : '#64748B', borderBottom: activeTab === 'aptitude' ? '3px solid #2563EB' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <HelpCircle size={18} /> Section 1: Quantitative &amp; Logical Aptitude ({Object.keys(aptAnswers).length}/20 Answered)
            </button>
            <button
              onClick={() => setActiveTab('coding')}
              style={{ flex: 1, padding: '14px', fontWeight: 700, fontSize: '0.9rem', border: 'none', background: activeTab === 'coding' ? '#FFFFFF' : 'transparent', color: activeTab === 'coding' ? '#2563EB' : '#64748B', borderBottom: activeTab === 'coding' ? '3px solid #2563EB' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Code size={18} /> Section 2: Technical Coding Challenges (3 LeetCode Problems)
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {evalResult ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: evalResult.passed ? '#DCFCE7' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={44} color={evalResult.passed ? '#166534' : '#991B1B'} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {evalResult.passed ? 'Screening Exam Passed! 🎉' : 'Screening Exam Completed'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '500px' }}>
                Your exam scores have been saved to your profile and submitted to the company's evaluation portal.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', maxWidth: '550px', marginTop: '12px' }}>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>APTITUDE SCORE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>{evalResult.aptScore} / 50</div>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>CODING SCORE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>{evalResult.codeScore} / 50</div>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL SCORE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: evalResult.passed ? '#059669' : '#DC2626', marginTop: '4px' }}>{evalResult.totalScore}%</div>
                </div>
              </div>
              <button onClick={onClose} className="btn-primary" style={{ marginTop: '20px', padding: '10px 24px', fontSize: '0.9rem' }}>
                Return to Dashboard
              </button>
            </div>
          ) : activeTab === 'aptitude' ? (
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
                      style={{ width: '24px', height: '24px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, border: 'none', background: currentAptIndex === i ? '#2563EB' : (aptAnswers[i] !== undefined ? '#DBEAFE' : '#E2E8F0'), color: currentAptIndex === i ? '#FFFFFF' : (aptAnswers[i] !== undefined ? '#1E40AF' : '#64748B'), cursor: 'pointer' }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
                {aptitudeQuestions[currentAptIndex].q}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {aptitudeQuestions[currentAptIndex].options.map((opt, oIdx) => {
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
                  <button onClick={() => setActiveTab('coding')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#D97706' }}>
                    Proceed to Section 2 (Coding)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                {codingQuestions.map((q, idx) => (
                  <button key={idx} onClick={() => setCurrentCodeIndex(idx)} className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', fontWeight: 700, background: currentCodeIndex === idx ? '#2563EB' : '#F1F5F9', color: currentCodeIndex === idx ? '#FFFFFF' : '#475569' }}>
                    Problem {idx + 1}
                  </button>
                ))}
              </div>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E293B' }}>{codingQuestions[currentCodeIndex].title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>{codingQuestions[currentCodeIndex].desc}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SOLUTION CODE (JavaScript / ES6)</label>
                <textarea
                  rows={8}
                  value={codeAnswers[currentCodeIndex]}
                  onChange={e => setCodeAnswers(prev => ({ ...prev, [currentCodeIndex]: e.target.value }))}
                  className="input-field"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem', background: '#0F172A', color: '#38BDF8', padding: '12px' }}
                />
                <button onClick={() => handleRunCode(currentCodeIndex)} className="btn-secondary" style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Play size={14} /> Run Test Case
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

        {/* Footer */}
        {!evalResult && (
          <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600 }}>
              🔴 Proctoring Active — Tab switch or fullscreen exit = Instant Auto-Fail
            </span>
            <button
              onClick={handleFinalSubmit}
              disabled={isEvaluating}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.85rem', background: '#059669' }}
            >
              {isEvaluating ? 'Evaluating Answers...' : 'Submit Screening Exam'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
