import React, { useState, useEffect } from 'react';
import { Briefcase, Sparkles, FileText, Bookmark, Calendar, TrendingUp } from 'lucide-react';

export default function StudentDashboard({ apiBaseUrl, currentUser }) {
  const [data, setData] = useState({
    total_applications: 0,
    ai_match_score: 0,
    resume_score: 0,
    saved_internships: 0,
    upcoming_interviews: 0,
    recent_applications: [],
    ai_suggestions: [],
    weekly_progress: {
      applicationsSent: 0,
      skillsAdded: 0,
      profileCompletion: 20,
      resumeScoreChange: 0
    }
  });

  const studentId = currentUser?.userId || currentUser?.user_id;

  useEffect(() => {
    if (studentId) {
      fetchDashboard();
    }
  }, [studentId]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/student/${studentId}/dashboard`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (e) {}
  };

  const kpis = [
    { label: 'Applications Applied', value: data.total_applications || 0, icon: Briefcase, color: '#2563EB', bg: '#DBEAFE' },
    { label: 'AI Match Score', value: data.ai_match_score > 0 ? `${data.ai_match_score}%` : 'Not available', icon: Sparkles, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Resume Score', value: data.resume_score > 0 ? `${data.resume_score}/100` : 'Resume not analyzed yet', icon: FileText, color: '#059669', bg: '#D1FAE5' },
    { label: 'Saved Internships', value: data.saved_internships || 0, icon: Bookmark, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Upcoming Interviews', value: data.upcoming_interviews || 0, icon: Calendar, color: '#DC2626', bg: '#FEE2E2' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                <Icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{kpi.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
            Recent Applications
          </h3>

          {data.recent_applications && data.recent_applications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.recent_applications.map((app, idx) => (
                <div key={idx} style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{app.title || app.JOB_TITLE || 'Internship Application'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.company_name || app.COMPANY_NAME || 'Company'} • {app.location || app.LOCATION || 'Location'}</div>
                  </div>
                  <span className="badge badge-auth">{app.status || app.STATUS || 'APPLIED'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No applications yet. Browse active internships and apply to get started!
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#7C3AED', fontWeight: 700 }}>
              <Sparkles size={18} /> AI Recommendations
            </div>

            {data.ai_suggestions && data.ai_suggestions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.ai_suggestions.map((s, idx) => (
                  <div key={idx} style={{ fontSize: '0.85rem', padding: '10px 12px', background: '#F8FAFC', borderLeft: '3px solid #2563EB', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{s.title}</span>
                    <span className="badge badge-ai" style={{ fontSize: '0.7rem' }}>{s.boost}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '12px 0' }}>
                Complete your profile to start receiving AI recommendations.
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#059669', fontWeight: 700 }}>
              <TrendingUp size={18} /> Activity Tracker
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Applications Sent</span>
                <strong>{data.total_applications || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Upcoming Interviews</span>
                <strong>{data.upcoming_interviews || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Saved Internships</span>
                <strong>{data.saved_internships || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
