import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle, Code, Clock, X, Zap, ShieldAlert } from 'lucide-react';

export default function DailyPracticeModal({ apiBaseUrl, currentUser, onClose, onPracticeCompleted }) {
  const [questions, setQuestions] = useState(null);
  const [aptitudeAnswers, setAptitudeAnswers] = useState({});
  const [verbalAnswers, setVerbalAnswers] = useState({});
  const [codingAnswer, setCodingAnswer] = useState('def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []');
  
  const [submitting, setSubmitting] = useState(false);
  const [violationTerminated, setViolationTerminated] = useState(false);

  useEffect(() => {
    fetchQuestions();
    requestFullScreenMode();

    // Prevent Copy, Paste, Cut, Right Click Context Menu
    const preventAction = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('copy', preventAction);
    window.addEventListener('paste', preventAction);
    window.addEventListener('cut', preventAction);
    window.addEventListener('contextmenu', preventAction);

    // Tab Switch & Focus Loss Detection
    const handleVisibilityChange = () => {
      if (document.hidden && !violationTerminated) {
        handleViolationTermination("Tab switch detected during proctored exam view");
      }
    };

    const handleWindowBlur = () => {
      if (!violationTerminated) {
        handleViolationTermination("Window blur/focus loss detected during proctored exam view");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('copy', preventAction);
      window.removeEventListener('paste', preventAction);
      window.removeEventListener('cut', preventAction);
      window.removeEventListener('contextmenu', preventAction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      exitFullScreenMode();
    };
  }, [violationTerminated]);

  const requestFullScreenMode = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const exitFullScreenMode = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const safeUser = currentUser || {};
  const userId = safeUser.userId || safeUser.user_id || 9;

  const handleViolationTermination = async (reason) => {
    setViolationTerminated(true);
    try {
      await fetch(`${apiBaseUrl}/api/v1/daily-practice/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          coding_answer: "TERMINATED_FOR_VIOLATION",
          aptitude_answers: {},
          time_taken_seconds: 0
        })
      });
    } catch (err) {
      console.error('Violation submit error:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      // 1. Immediately record started_at in Supabase DB
      await fetch(`${apiBaseUrl}/api/v1/daily-practice/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      // 2. Fetch shared daily questions
      const res = await fetch(`${apiBaseUrl}/api/v1/daily-practice/questions`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Error fetching practice questions:', err);
    }
  };

  const handleSubmitPractice = async () => {
    try {
      setSubmitting(true);

      const res = await fetch(`${apiBaseUrl}/api/v1/daily-practice/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          coding_answer: codingAnswer,
          aptitude_answers: aptitudeAnswers,
          time_taken_seconds: 90
        })
      });

      if (res.ok) {
        const data = await res.json();
        onPracticeCompleted(100, data.final_score || 95.0);
      } else {
        onPracticeCompleted(50, 80.0);
      }
    } catch (err) {
      console.error('Submit error:', err);
      onPracticeCompleted(50, 80.0);
    } finally {
      setSubmitting(false);
    }
  };

  if (violationTerminated) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="neo-card" style={{ padding: '40px', background: '#ffebee', border: '3px solid #d32f2f', textAlign: 'center', maxWidth: '540px' }}>
          <ShieldAlert size={48} color="#d32f2f" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d32f2f', marginBottom: '8px' }}>PROCTORING VIOLATION DETECTED</h2>
          <p style={{ fontSize: '1rem', fontWeight: 800, color: '#111', marginBottom: '16px' }}>
            Tab Switch / Window Focus Loss Detected!
          </p>
          <div style={{ padding: '14px', background: '#fff', borderRadius: '12px', border: '2px solid #d32f2f', fontWeight: 800, fontSize: '1.1rem', color: '#d32f2f', marginBottom: '24px' }}>
            Awarded Score: 0 Marks (Terminated)
          </div>
          <button 
            onClick={() => {
              onPracticeCompleted(0, 0);
              onClose();
            }} 
            className="btn-primary"
            style={{ background: '#d32f2f', color: '#fff', width: '100%', justifyContent: 'center' }}
          >
            Close & Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="neo-card" style={{ width: '100%', maxWidth: '960px', maxHeight: '95vh', overflowY: 'auto', padding: '32px', background: 'var(--color-white)', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #111', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame color="#111" size={24} />
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Full-Screen Proctored Exam Environment</h3>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d32f2f' }}>
                ⚠️ Anti-Cheating Active: Fullscreen Enforced | Copy/Paste Disabled | Tab Switch Terminates Exam with 0 Marks
              </p>
            </div>
          </div>
          <X size={22} style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>

        {!questions ? (
          <p style={{ textAlign: 'center', fontWeight: 800, padding: '40px' }}>Loading proctored practice questions...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Aptitude Section */}
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              1. Aptitude Reasoning (5 Questions)
            </h4>
            {(questions.aptitude || []).map((q, idx) => (
              <div key={q.id || idx} style={{ background: 'var(--bg-cream)', padding: '14px', borderRadius: '12px', border: 'var(--border-thick)' }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '10px' }}>Q{idx + 1}. {q.question}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => setAptitudeAnswers({ ...aptitudeAnswers, [idx]: oIdx })}
                      className={aptitudeAnswers[idx] === oIdx ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.8rem', padding: '8px', justifyContent: 'flex-start', background: aptitudeAnswers[idx] === oIdx ? 'var(--color-yellow)' : '#fff' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Verbal Section */}
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '10px' }}>
              2. Verbal Ability (5 Questions)
            </h4>
            {(questions.verbal || []).map((q, idx) => (
              <div key={q.id || idx} style={{ background: 'var(--bg-cream)', padding: '14px', borderRadius: '12px', border: 'var(--border-thick)' }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '10px' }}>Q{idx + 1}. {q.question}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => setVerbalAnswers({ ...verbalAnswers, [idx]: oIdx })}
                      className={verbalAnswers[idx] === oIdx ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.8rem', padding: '8px', justifyContent: 'flex-start', background: verbalAnswers[idx] === oIdx ? 'var(--color-yellow)' : '#fff' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Coding Challenge */}
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '10px' }}>
              3. Python Algorithmic Challenge (1 Question)
            </h4>
            <div style={{ background: '#111', color: '#fff', padding: '16px', borderRadius: '12px', border: 'var(--border-thick)' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', color: 'var(--color-yellow)' }}>
                Challenge: Implement Two-Sum algorithm in Python returning indices of numbers summing to target.
              </p>
              <textarea
                value={codingAnswer}
                onChange={(e) => setCodingAnswer(e.target.value)}
                style={{ width: '100%', height: '110px', background: '#222', color: '#50fa7b', fontFamily: 'monospace', fontSize: '0.85rem', padding: '10px', borderRadius: '8px', border: '1px solid #444', resize: 'vertical' }}
              />
            </div>

            <button
              onClick={handleSubmitPractice}
              disabled={submitting}
              className="btn-primary"
              style={{ padding: '14px', justifyContent: 'center', fontSize: '1rem', background: 'var(--color-green)' }}
            >
              <CheckCircle size={18} /> Submit Proctored Exam & Record Score
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
