import React, { useState, useEffect } from 'react';
import { Users, Check, X, Award, Mail, BookOpen, GraduationCap, Award as AwardIcon, CheckCircle, Clock } from 'lucide-react';

export default function ViewApplicants({ apiBaseUrl = 'http://localhost:8000', currentUser }) {
  const [applicants, setApplicants] = useState([]);
  const [actionStatus, setActionStatus] = useState('');
  const companyId = currentUser?.userId || currentUser?.user_id;

  useEffect(() => {
    if (companyId) {
      fetchApplicants();
    }
  }, [companyId]);

  const fetchApplicants = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/company/${companyId}/applicants`);
      if (res.ok) {
        const data = await res.json();
        setApplicants(data);
      }
    } catch (e) {}
  };

  const handleAction = async (appId, status, stage, candidateName) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/company/applicants/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, stage })
      });
      if (res.ok) {
        setActionStatus(`Status updated to "${status}" for ${candidateName}!`);
        fetchApplicants();
        setTimeout(() => setActionStatus(''), 4000);
      }
    } catch (e) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={24} color="#2563EB" />
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Candidate Recruitment Pipeline</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Shortlist candidates, assign screening exams, review scores, and issue official joining offers.</p>
          </div>
        </div>
        <span className="badge badge-ai">Oracle DB Live Sync</span>
      </div>

      {actionStatus && (
        <div style={{ padding: '12px 16px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
          ✓ {actionStatus}
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px' }}>
        {applicants && applicants.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {applicants.map((app, idx) => {
              const appId = app.id || app.ID;
              const name = app.candidate_name || app.CANDIDATE_NAME || app.NAME || 'Student Candidate';
              const email = app.email || app.EMAIL || 'N/A';
              const title = app.job_title || app.JOB_TITLE || app.TITLE || 'Internship Role';
              const college = app.college || app.COLLEGE || 'College';
              const degree = app.degree || app.DEGREE || 'Degree';
              const branch = app.branch || app.BRANCH || 'Branch';
              const yearOfStudy = app.year_of_study || app.YEAR_OF_STUDY || '';
              const cgpa = app.cgpa || app.CGPA || 'N/A';
              const skills = app.skills || app.SKILLS || 'Not specified';
              const status = app.status || app.STATUS || 'APPLIED';
              const testScore = app.test_score || app.TEST_SCORE || 0;

              return (
                <div key={appId || idx} style={{ padding: '22px', border: '1px solid var(--border-light)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '18px', background: '#FFFFFF' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{name}</h3>
                      <span className="badge badge-auth" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{status}</span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: '#2563EB', fontWeight: 600, marginTop: '4px' }}>
                      Applied for: <strong>{title}</strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                      <div><Mail size={13} style={{ display: 'inline', marginRight: '4px' }} /> <strong>Email:</strong> {email}</div>
                      <div><GraduationCap size={13} style={{ display: 'inline', marginRight: '4px' }} /> <strong>College:</strong> {college}</div>
                      <div><BookOpen size={13} style={{ display: 'inline', marginRight: '4px' }} /> <strong>Program:</strong> {degree} - {branch} ({yearOfStudy})</div>
                      <div><AwardIcon size={13} style={{ display: 'inline', marginRight: '4px' }} /> <strong>CGPA:</strong> {cgpa} / 10</div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '10px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px' }}>
                      <strong>Verified Skills:</strong> {skills}
                    </div>

                    {testScore > 0 ? (
                      <div style={{ fontSize: '0.88rem', color: '#166534', marginTop: '10px', fontWeight: 700, background: '#DCFCE7', padding: '8px 12px', borderRadius: '6px', display: 'inline-block' }}>
                        ✓ Screening Exam Result: {testScore}% (20 Aptitude + 3 Coding Challenges Passed)
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> Assessment Stage: Pending candidate test submission
                      </div>
                    )}
                  </div>

                  {/* Recruiter Workflow Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '220px' }}>
                    {status === 'APPLIED' && (
                      <>
                        <button onClick={() => handleAction(appId, 'SHORTLISTED', 'SHORTLISTED', name)} className="btn-primary" style={{ width: '100%', padding: '8px 14px', fontSize: '0.82rem', background: '#2563EB' }}>
                          <Check size={14} style={{ display: 'inline', marginRight: '4px' }} /> 1. Shortlist Candidate
                        </button>
                        <button onClick={() => handleAction(appId, 'REJECTED', 'REJECTED', name)} className="btn-secondary" style={{ width: '100%', padding: '8px 14px', fontSize: '0.82rem', color: '#DC2626' }}>
                          <X size={14} style={{ display: 'inline', marginRight: '4px' }} /> Reject Application
                        </button>
                      </>
                    )}

                    {status === 'SHORTLISTED' && (
                      <button onClick={() => handleAction(appId, 'ACCEPTED_FOR_TEST', 'ASSESSMENT', name)} className="btn-primary" style={{ width: '100%', padding: '8px 14px', fontSize: '0.82rem', background: '#7C3AED' }}>
                        <Award size={14} style={{ display: 'inline', marginRight: '4px' }} /> 2. Accept & Assign Test
                      </button>
                    )}

                    {(status === 'ACCEPTED_FOR_TEST' || status === 'ASSESSMENT' || status === 'TEST_PASSED') && (
                      <button onClick={() => handleAction(appId, 'OFFER_SENT', 'OFFER', name)} className="btn-primary" style={{ width: '100%', padding: '8px 14px', fontSize: '0.82rem', background: '#059669' }}>
                        <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> 3. Release Official Joining Offer
                      </button>
                    )}

                    {status === 'OFFER_SENT' && (
                      <span className="badge badge-ai" style={{ background: '#DCFCE7', color: '#166534', padding: '8px 16px', fontSize: '0.85rem' }}>
                        ✓ Official Offer Issued
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No student applications received yet.
          </div>
        )}
      </div>
    </div>
  );
}
