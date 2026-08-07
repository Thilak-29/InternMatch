import React, { useState, useEffect, useRef } from 'react';
import { Camera, Monitor, AlertTriangle, Clock, CheckCircle, ShieldAlert, Code, X, Maximize2 } from 'lucide-react';

export default function ProctoredTestModal({ apiBaseUrl, application, onClose, onTestCompleted }) {
  const [questions, setQuestions] = useState(null);
  const [aptitudeAnswers, setAptitudeAnswers] = useState({});
  const [verbalAnswers, setVerbalAnswers] = useState({});
  const [codingAnswer, setCodingAnswer] = useState('def reverseWords(s: str) -> str:\n    return " ".join(s.split()[::-1])');
  
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [warnings, setWarnings] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    fetchQuestions();
    enterFullscreen();
    startWebcam();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleMalpracticeWarning("Tab Switching Detected");
      }
    };

    const handleWindowBlur = () => {
      handleMalpracticeWarning("Window Focus Lost");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        handleMalpracticeWarning("Fullscreen Mode Exited");
      } else {
        setIsFullscreen(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      clearInterval(timer);
      stopWebcam();
    };
  }, []);

  const startWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      }
    } catch (err) {
      console.warn('Webcam access not granted or unavailable:', err);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    }
  };

  const handleMalpracticeWarning = (reason) => {
    setTabSwitchCount(prev => {
      const updated = prev + 1;
      if (updated >= 2) {
        setIsTerminated(true);
        handleAutoTerminate();
      }
      return updated;
    });
    setWarnings(w => w + 1);
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/tests/questions?role_title=${encodeURIComponent(application.internship_title)}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleAutoTerminate = async () => {
    try {
      await fetch(`${apiBaseUrl}/api/v1/tests/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: application.id,
          score: 0.0,
          malpractice_flags: 2
        })
      });
      if (onTestCompleted) onTestCompleted();
    } catch (err) {
      console.error('Auto termination error:', err);
    }
  };

  const handleSubmitTest = async () => {
    try {
      setSubmitting(true);
      let correctCount = 0;
      if (questions) {
        if (questions.aptitude) {
          questions.aptitude.forEach((q, idx) => {
            if (aptitudeAnswers[idx] === q.correct) correctCount++;
          });
        }
        if (questions.verbal) {
          questions.verbal.forEach((q, idx) => {
            if (verbalAnswers[idx] === q.correct) correctCount++;
          });
        }
      }

      const totalQs = (questions?.aptitude?.length || 5) + (questions?.verbal?.length || 5) + 1;
      const score = Math.round(((correctCount + 1) / totalQs) * 100);

      const res = await fetch(`${apiBaseUrl}/api/v1/tests/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: application.id,
          score: score,
          malpractice_flags: tabSwitchCount
        })
      });

      if (res.ok) {
        if (onTestCompleted) onTestCompleted();
      }
    } catch (err) {
      console.error('Submit test error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isTerminated) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="neo-card" style={{ maxWidth: '500px', padding: '32px', textAlign: 'center', background: 'var(--color-pink)' }}>
          <ShieldAlert size={56} color="#111" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Assessment Terminated</h2>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '20px', lineHeight: '1.5' }}>
            Multiple tab switches, window blur events, or fullscreen exits were detected by the proctoring engine. The test has been automatically terminated.
          </p>
          <button onClick={onClose} className="btn-primary" style={{ background: '#111', color: '#fff' }}>Close Assessment Window</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-cream)', zIndex: 1000, display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto' }}>
      
      {/* Top Header */}
      <header className="neo-card" style={{ padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', background: 'var(--color-white)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge-tag badge-amber">● PROCTORED SESSION ACTIVE</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{application.internship_title} Assessment</h3>
          </div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{application.company_name} • Dynamic AI Question Generation</p>
        </div>

        {/* Live Camera & Fullscreen Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          <div style={{ width: '96px', height: '64px', borderRadius: '10px', overflow: 'hidden', background: '#000', border: 'var(--border-thick)', position: 'relative' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{ position: 'absolute', bottom: '2px', left: '4px', fontSize: '0.6rem', color: '#34d399', fontWeight: 800 }}>
              {cameraActive ? '● REC' : 'CAM'}
            </span>
          </div>

          {!isFullscreen && (
            <button type="button" onClick={enterFullscreen} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--color-yellow)' }}>
              <Maximize2 size={14} /> Fullscreen Mode
            </button>
          )}

          {tabSwitchCount > 0 && (
            <div className="badge-tag badge-pink">
              <AlertTriangle size={14} /> Warnings: {tabSwitchCount}/2
            </div>
          )}

          <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'var(--color-yellow)', padding: '8px 16px', borderRadius: '12px', border: 'var(--border-thick)', boxShadow: '3px 3px 0px #111', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={18} /> {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Main Questions Layout */}
      {!questions ? (
        <div className="neo-card" style={{ padding: '60px', textAlign: 'center', background: 'var(--color-yellow)' }}>
          <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>Generating tailored AI technical assessment questions...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', flex: 1 }}>
          
          {/* Section 1: Aptitude & Verbal */}
          <div className="neo-card" style={{ padding: '24px', background: 'var(--color-white)', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '78vh', overflowY: 'auto' }}>
            
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, borderBottom: '3px solid #111', paddingBottom: '8px' }}>
              Section 1: Aptitude & Reasoning (5 Questions)
            </h4>

            {(questions.aptitude || []).map((q, idx) => (
              <div key={q.id || idx} style={{ background: 'var(--bg-cream)', padding: '16px', borderRadius: '14px', border: 'var(--border-thick)' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>Q{idx + 1}. {q.question}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => setAptitudeAnswers({ ...aptitudeAnswers, [idx]: oIdx })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '2px solid #111',
                        background: aptitudeAnswers[idx] === oIdx ? 'var(--color-yellow)' : '#fff',
                        color: '#111',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, borderBottom: '3px solid #111', paddingBottom: '8px', marginTop: '12px' }}>
              Section 2: Verbal Communication (5 Questions)
            </h4>

            {(questions.verbal || []).map((q, idx) => (
              <div key={q.id || idx} style={{ background: 'var(--bg-cream)', padding: '16px', borderRadius: '14px', border: 'var(--border-thick)' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>Q{idx + 6}. {q.question}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => setVerbalAnswers({ ...verbalAnswers, [idx]: oIdx })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '2px solid #111',
                        background: verbalAnswers[idx] === oIdx ? 'var(--color-green)' : '#fff',
                        color: '#111',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

          </div>

          {/* Section 2: Coding Sandbox */}
          <div className="neo-card" style={{ padding: '24px', background: 'var(--color-white)', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '78vh', overflowY: 'auto' }}>
            
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, borderBottom: '3px solid #111', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={20} /> Section 3: Algorithmic Coding Challenge
            </h4>

            {questions.coding && questions.coding[0] && (
              <div style={{ background: 'var(--bg-cream)', padding: '16px', borderRadius: '12px', border: 'var(--border-thick)' }}>
                <h5 style={{ fontSize: '1rem', fontWeight: 800 }}>{questions.coding[0].title}</h5>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', margin: '6px 0 10px 0' }}>{questions.coding[0].description}</p>
                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 700 }}>
                  Input Sample: {questions.coding[0].input_sample} | Output: {questions.coding[0].output_sample}
                </div>
              </div>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px' }}>PYTHON SOLUTION SANDBOX</label>
              <textarea 
                rows={10} 
                className="input-field" 
                style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.4' }}
                value={codingAnswer}
                onChange={(e) => setCodingAnswer(e.target.value)}
              />
            </div>

            <button onClick={handleSubmitTest} className="btn-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '14px', background: 'var(--color-green)' }}>
              <CheckCircle size={18} /> {submitting ? 'Evaluating Test Score...' : 'Submit Final Assessment'}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
