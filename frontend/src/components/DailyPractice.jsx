import React, { useState, useEffect } from 'react';
import { Award, Flame, CheckCircle, Trophy, Code, ArrowUpRight, Zap, Play } from 'lucide-react';
import DailyPracticeModal from './DailyPracticeModal';

export default function DailyPractice({ apiBaseUrl, currentUser, setIsTakingTest }) {
  const [top3, setTop3] = useState([]);
  const [ownRank, setOwnRank] = useState(null);
  const [userInTop3, setUserInTop3] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedScore, setEarnedScore] = useState(0);

  const safeUser = currentUser || {};
  const userId = safeUser.userId || safeUser.user_id || 9;

  useEffect(() => {
    fetchLeaderboard();
  }, [userId]);

  useEffect(() => {
    if (showModal && setIsTakingTest) {
      setIsTakingTest(true);
    } else if (setIsTakingTest) {
      setIsTakingTest(false);
    }
    return () => {
      if (setIsTakingTest) setIsTakingTest(false);
    };
  }, [showModal, setIsTakingTest]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/v1/daily-practice/leaderboard?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTop3(data.top_3 || []);
        setOwnRank(data.own_rank || null);
        setUserInTop3(data.user_in_top_3 || false);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeCompleted = (xp, score) => {
    setEarnedXp(xp);
    setEarnedScore(score);
    setPracticeCompleted(true);
    setShowModal(false);
    fetchLeaderboard();
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'var(--gradient-glow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Flame color="var(--accent-amber)" size={24} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Daily Practice & Global Student Leaderboard</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Complete 4 daily questions (3 Aptitude, 1 Python Algorithmic Challenge) to earn score points & boost your total practice score for recruiters!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge-tag badge-amber" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            ⚡ Daily Bonus: Up to +100 Points
          </span>
        </div>
      </div>

      {/* Main Two Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Daily Practice Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--accent-cyan)" /> Today's Interactive Practice Assessment
          </h3>

          <div style={{ background: 'rgba(11,15,25,0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>3 Aptitude & Reasoning Questions</span>
              <span className="badge-tag badge-indigo">Logical / Verbal</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>1 Python Algorithmic Challenge</span>
              <span className="badge-tag badge-purple">Coding</span>
            </div>
          </div>

          {practiceCompleted ? (
            <div style={{ background: 'rgba(16,185,129,0.12)', padding: '16px', borderRadius: '12px', border: '1px solid #10b981', color: '#34d399', textAlign: 'center' }}>
              <CheckCircle size={24} style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Daily Challenge Completed!</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Assessment Score: <strong>{earnedScore} Points</strong> | Saved directly to Supabase DB! Your candidate profile rank has been updated.
              </p>
            </div>
          ) : (
            <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '12px', justifyContent: 'center' }}>
              <Play size={18} /> Launch Daily Practice Test (4 Questions)
            </button>
          )}
        </div>

        {/* Right Column: Global Leaderboard */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} color="var(--accent-amber)" /> Global Daily Leaderboard
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top 3 + Your Standing</span>
          </div>

          {loading && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Loading global leaderboard ranks...</p>
          )}

          {!loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* TOP 3 RANK CARDS */}
              {top3.map((st, idx) => (
                <div key={idx} style={{ background: 'rgba(11,15,25,0.6)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={idx === 0 ? 'badge-tag badge-amber' : idx === 1 ? 'badge-tag badge-indigo' : 'badge-tag badge-purple'} style={{ padding: '4px 10px', fontWeight: 800 }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{st.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.branch || 'CSE'} • {st.college || 'Engineering College'}</p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge-tag badge-emerald" style={{ fontSize: '0.85rem' }}>
                      {st.final_score || st.total_practice_score || 100} pts
                    </span>
                  </div>

                </div>
              ))}

              {/* SEPARATE HIGHLIGHTED OWN RANK ROW (If rank >= 4) */}
              {!userInTop3 && ownRank && (
                <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px dashed var(--border-glass)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    ● Your Current Standing Today
                  </div>
                  <div style={{ background: 'var(--gradient-glow)', padding: '12px 16px', borderRadius: '10px', border: '2px solid var(--accent-amber)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="badge-tag badge-amber" style={{ padding: '4px 10px', fontWeight: 800 }}>
                        #{ownRank.rank}
                      </span>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{ownRank.name} (You)</h4>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{ownRank.branch} • {ownRank.college}</p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="badge-tag badge-emerald" style={{ fontSize: '0.85rem' }}>
                        {ownRank.final_score} pts
                      </span>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* Practice Test Modal */}
      {showModal && (
        <DailyPracticeModal 
          apiBaseUrl={apiBaseUrl}
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
          onPracticeCompleted={handlePracticeCompleted}
        />
      )}

    </div>
  );
}
