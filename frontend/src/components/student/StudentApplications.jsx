import React, { useState, useEffect } from 'react';
import { Send, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function StudentApplications({ apiBaseUrl = 'http://localhost:8000', currentUser }) {
  const [applications, setApplications] = useState([]);
  const studentId = currentUser?.userId || currentUser?.user_id || 3;

  useEffect(() => {
    fetchApplications();
  }, [studentId]);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/student/${studentId}/applications`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setApplications(data);
        }
      }
    } catch (e) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>My Submitted Applications</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Track recruitment lifecycle stages from screening test to offer dispatch.</p>
        </div>
        <span className="badge badge-ai">Oracle DB Synced</span>
      </div>

      {applications && applications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {applications.map((app, idx) => {
            const title = app.title || app.job_title || app.JOB_TITLE || 'Software Engineering Intern';
            const company = app.company_name || app.COMPANY_NAME || 'Company';
            const status = app.status || app.STATUS || 'APPLIED';
            const appliedDate = app.applied_at || app.APPLIED_AT || '2026-08-08';

            return (
              <div key={app.id || app.ID || idx} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                    {company}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Applied on: {appliedDate}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge badge-auth" style={{ textTransform: 'uppercase', padding: '6px 14px', fontWeight: 700 }}>
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          No applications submitted yet. Browse active internships from the "Explore Internships" tab to apply.
        </div>
      )}
    </div>
  );
}
