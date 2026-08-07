import React, { useState, useEffect } from 'react';
import { Sparkles, Award, ExternalLink, Bot, CheckCircle2, Target, ArrowRight, Send, ShieldCheck, Zap, BookOpen } from 'lucide-react';

export default function AICoach({ apiBaseUrl, currentUser }) {
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customQuestion, setCustomQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [asking, setAsking] = useState(false);

  const safeUser = currentUser || {};
  const userId = safeUser.userId || safeUser.user_id || 9;

  useEffect(() => {
    fetchCoachData();
  }, [userId]);

  const fetchCoachData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/v1/ai-coach/certifications/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCoachData(data);
      }
    } catch (err) {
      console.error('Error fetching AI Coach data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const userQ = customQuestion;
    setCustomQuestion('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userQ }]);

    try {
      setAsking(true);
      const res = await fetch(`${apiBaseUrl}/api/v1/ai-assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userQ })
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(prev => [...prev, { sender: 'ai', text: data.response }]);
      }
    } catch (err) {
      console.error('Ask error:', err);
    } finally {
      setAsking(false);
    }
  };

  const getCertificationUrl = (title) => {
    if (title?.includes("AWS") || title?.includes("Machine Learning")) {
      return "https://aws.amazon.com/certification/certified-machine-learning-specialty/";
    }
    if (title?.includes("TensorFlow") || title?.includes("Deep Learning")) {
      return "https://www.tensorflow.org/certificate";
    }
    return "https://spring.io/projects/spring-boot";
  };

  if (loading) {
    return (
      <div className="neo-card" style={{ padding: 'var(--space-48)', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Analyzing candidate profile & skill gaps...
        </p>
      </div>
    );
  }

  const certs = coachData?.top3_certifications || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', paddingTop: 'var(--space-24)' }}>
      {/* HERO BANNER */}
      <div className="neo-card" style={{ padding: 'var(--space-32)', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="icon-circle icon-purple">
              <Bot size={26} />
            </div>
            <div>
              <div className="badge badge-ai" style={{ marginBottom: '8px' }}>
                <Sparkles size={14} /> AI Career Advisor Active
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Personalized AI Skill & Certification Coach
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                Candidate: <strong>{currentUser.name}</strong> • Customized Career Growth Roadmaps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ATS RESUME & SKILL SCORES WIDGET GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-20)' }}>
        <div className="neo-card" style={{ padding: 'var(--space-24)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>ATS RESUME SCORE</span>
            <span className="badge badge-verified">OPTIMIZED</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>92 / 100</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Strong keyword density for Machine Learning & Full-Stack Java positions.
          </p>
        </div>

        <div className="neo-card" style={{ padding: 'var(--space-24)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>AI MATCH PERCENTAGE</span>
            <span className="badge badge-ai">HIGH FIT</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-secondary)' }}>94.5%</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Top 5% candidate ranking among all active applicants.
          </p>
        </div>

        <div className="neo-card" style={{ padding: 'var(--space-24)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>INTERVIEW READINESS</span>
            <span className="badge badge-remote">PROCTORED</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-success)' }}>98.5</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            High daily practice test accuracy & coding speed.
          </p>
        </div>
      </div>

      {/* TOP RECOMMENDED CERTIFICATIONS */}
      <div className="neo-card">
        <div className="neo-card-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Top 3 High-Impact Certifications
          </h2>
        </div>
        <div className="neo-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          {certs.map((c, i) => {
            const certUrl = getCertificationUrl(c.title);

            return (
              <div key={i} style={{ padding: 'var(--space-16)', background: 'var(--bg-secondary-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="icon-circle icon-blue">
                    <Award size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.title}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>Issued by: {c.issuer}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge badge-verified">{c.impact_boost}</span>
                  <button onClick={() => window.open(certUrl, '_blank', 'noopener,noreferrer')} className="btn-secondary" style={{ height: '40px' }}>
                    Learn More <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE AI CAREER CHAT */}
      <div className="neo-card">
        <div className="neo-card-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Ask InterSearch AI Mentor
          </h2>
        </div>
        <div className="neo-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ minHeight: '120px', maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  background: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--bg-secondary-surface)',
                  color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleAskQuestion} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="input-field"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask about AI recommendations, certifications, or career roadmaps..."
            />
            <button type="submit" disabled={asking} className="btn-primary">
              {asking ? 'Asking...' : <><Send size={16} /> Ask AI</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
