import React, { useState, useEffect } from 'react';
import { Send, FileText, CheckCircle2, Clock, MapPin, DollarSign, Sparkles, Award, ArrowRight, AlertCircle } from 'lucide-react';
import ProctoredExamModal from './ProctoredExamModal';

export default function StudentApplications({ apiBaseUrl = 'http://localhost:8082', currentUser }) {
  const studentId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;

  if (!studentId) {
    return (
      <div className="glass-card" style={{ padding: '36px', textAlign: 'center', color: '#DC2626' }}>
        <AlertCircle size={32} style={{ margin: '0 auto 12px auto' }} />
        <h3>Session Authentication Error</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
          Unable to identify authenticated student ID. Please sign in again.
        </p>
      </div>
    );
  }

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testModalApp, setTestModalApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [studentId]);

  const fetchApplications = async () => {
    setIsLoading(true);

    const endpoints = [
      `${apiBaseUrl}/api/v1/student/${studentId}/applications`,
      `http://localhost:8082/api/v1/student/${studentId}/applications`,
      `http://localhost:8000/api/v1/student/${studentId}/applications`
    ];

    let foundApps = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data)) {
            foundApps = data;
            break;
          }
        }
      } catch (e) {
        console.error("Applications fetch error:", e);
      }
    }

    setApplications(foundApps || []);
    setIsLoading(false);
  };

  const handleTestComplete = async (score) => {
    if (!testModalApp) return;
    const appId = testModalApp.id || testModalApp.ID;

    const endpoints = [
      `${apiBaseUrl}/api/v1/student/applications/${appId}/test-score`,
      `http://localhost:8082/api/v1/student/applications/${appId}/test-score`,
      `http://localhost:8000/api/v1/student/applications/${appId}/test-score`
    ];

    for (const url of endpoints) {
      try {
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score })
        });
        break;
      } catch (e) {}
    }

    setApplications(prev => prev.map(a => {
      const aid = a.id || a.ID;
      if (aid === appId) {
        return {
          ...a,
          test_score: score,
          status: score >= 60 ? 'TEST_PASSED' : 'ASSESSMENT_FAILED',
          stage: score >= 60 ? 'INTERVIEW' : 'REJECTED'
        };
      }
      return a;
    }));

    setTestModalApp(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>My Internship Applications</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Real-time candidate recruitment tracking and proctored technical screening assessments
          </p>
        </div>
        <span className="badge badge-ai" style={{ padding: '6px 14px' }}>
          {applications.length} Total Submissions
        </span>
      </div>

      {isLoading ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your applications from database...
        </div>
      ) : applications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {applications.map((app, idx) => {
            const title = app.title || app.job_title || app.role_title || app.TITLE || 'Software Engineering Intern';
            const company = app.company_name || app.COMPANY_NAME || 'Enterprise Partner';
            const loc = app.location || app.LOCATION || 'Bengaluru';
            const stipend = app.stipend || app.STIPEND || 35000;
            const status = app.status || app.STATUS || 'APPLIED';
            const appliedDate = app.applied_at || app.APPLIED_AT || 'Recently';
            const matchScore = app.match_score || 94;
            const testScore = app.test_score !== null && app.test_score !== undefined ? app.test_score : null;

            const isShortlisted = status === 'SHORTLISTED' || status === 'ACCEPTED_FOR_TEST';
            const isOffer = status === 'OFFER_SENT' || status === 'HIRED' || status === 'OFFER';

            return (
              <div key={app.id || app.ID || idx} className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{title}</h3>
                    <span className="badge badge-ai" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                      ⚡ {matchScore}% AI Match
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: '#2563EB', fontWeight: 600, marginTop: '4px' }}>
                    {company} • <span style={{ color: 'var(--text-muted)' }}>{loc} • ₹{stipend}/mo</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Applied Date: <strong>{appliedDate}</strong>
                  </div>

                  {testScore !== null && (
                    <div style={{ fontSize: '0.8rem', color: testScore >= 60 ? '#166534' : '#DC2626', fontWeight: 700, marginTop: '6px' }}>
                      ✓ Proctored Assessment Score: {testScore}% ({testScore >= 60 ? 'Passed' : 'Below Passing Criteria'})
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  <span className="badge badge-auth" style={{ textTransform: 'uppercase', padding: '6px 14px', background: isOffer ? '#DCFCE7' : (isShortlisted ? '#DBEAFE' : '#F1F5F9'), color: isOffer ? '#166534' : (isShortlisted ? '#1E40AF' : '#475569'), fontWeight: 700 }}>
                    {isOffer ? '🎉 Offer Sent' : (isShortlisted ? '⚡ Shortlisted — Test Dispatched' : status)}
                  </span>

                  {isShortlisted && (
                    <button
                      onClick={() => setTestModalApp(app)}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Sparkles size={14} /> Take 20 MCQ + 3 Coding Assessment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          You have not applied to any internships yet. Click 'Explore Internships' to find opportunities.
        </div>
      )}

      {testModalApp && (
        <ProctoredExamModal
          internshipTitle={testModalApp.title || testModalApp.role_title || 'Engineering Intern'}
          companyName={testModalApp.company_name || 'Enterprise'}
          onClose={() => setTestModalApp(null)}
          onComplete={handleTestComplete}
        />
      )}
    </div>
  );
}
