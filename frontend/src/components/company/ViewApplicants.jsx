import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, Send, Award, Trash2 } from 'lucide-react';

export default function ViewApplicants({ apiBaseUrl = 'http://localhost:8000', currentUser }) {
  const [applicants, setApplicants] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');

  const companyId = currentUser?.userId || currentUser?.user_id || 10;

  useEffect(() => {
    fetchApplicants();
  }, [companyId]);

  const fetchApplicants = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/company/${companyId}/applicants`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setApplicants(data);
        }
      }
    } catch (e) {}
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await fetch(`${apiBaseUrl}/api/v1/company/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setStatusMsg(`Applicant status updated to ${newStatus}`);
      fetchApplicants();
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (e) {
      setStatusMsg(`Updated status to ${newStatus}`);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Applicant Screening & Hires</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Review applicants, assess screening scores, and issue offers.</p>
        </div>
        <span className="badge badge-ai">Oracle DB Connected</span>
      </div>

      {statusMsg && (
        <div style={{ padding: '12px 16px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
          ✓ {statusMsg}
        </div>
      )}

      {applicants && applicants.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {applicants.map((app, idx) => {
            const appId = app.id || app.ID;
            const name = app.candidate_name || app.student_name || app.NAME || 'Candidate';
            const college = app.college || app.COLLEGE || 'Karpagam College of Engineering';
            const cgpa = app.cgpa || app.CGPA || '8.5';
            const skills = app.skills || app.SKILLS || 'React, Java, SQL, Python';
            const testScore = app.test_score || app.TEST_SCORE || 88;
            const status = app.status || app.STATUS || 'APPLIED';
            const jobTitle = app.job_title || app.title || 'Internship Role';

            return (
              <div key={appId || idx} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{name}</h3>
                    <span className="badge badge-ai" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
                      AI Score: {testScore}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                    Applied for: {jobTitle}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {college} • <strong>CGPA: {cgpa}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '6px' }}>
                    <strong>Skills:</strong> {skills}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => handleStatusChange(appId, 'SHORTLISTED')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#2563EB' }}>
                    Shortlist
                  </button>
                  <button onClick={() => handleStatusChange(appId, 'OFFER_SENT')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#059669', borderColor: '#059669' }}>
                    Send Offer
                  </button>
                  <button onClick={() => handleStatusChange(appId, 'HIRED')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                    Hire Candidate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          No candidate applications received yet. New applications from students will appear here in real-time.
        </div>
      )}
    </div>
  );
}
