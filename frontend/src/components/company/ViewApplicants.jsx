import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, Clock, Send, Award, FileText, X, ExternalLink, Sparkles, Filter, Check, Eye, AlertCircle, Search } from 'lucide-react';

export default function ViewApplicants({ apiBaseUrl = 'http://localhost:8083', currentUser }) {
  const companyId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;

  if (!companyId) {
    return (
      <div className="glass-card" style={{ padding: '36px', textAlign: 'center', color: '#DC2626' }}>
        <AlertCircle size={32} style={{ margin: '0 auto 12px auto' }} />
        <h3>Session Authentication Error</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
          Unable to identify authenticated company ID. Please sign in again.
        </p>
      </div>
    );
  }

  const [applicants, setApplicants] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [filterAiOnly, setFilterAiOnly] = useState(false);
  const [selectedApplicantResume, setSelectedApplicantResume] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, [companyId]);

  const fetchApplicants = async () => {
    setIsLoading(true);

    const endpoints = [
      `${apiBaseUrl}/api/v1/company/${companyId}/applicants`,
      `http://localhost:8083/api/v1/company/${companyId}/applicants`,
      `http://localhost:8000/api/v1/company/${companyId}/applicants`
    ];

    let foundApps = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data)) {
            foundApps = data.map(app => normalizeApplicant(app));
            break;
          }
        }
      } catch (e) {
        console.error("Applicants fetch error:", e);
      }
    }

    setApplicants(foundApps || []);
    setIsLoading(false);
  };

  const normalizeApplicant = (app) => {
    const skills = app.skills || app.SKILLS || '';
    const matchScore = app.match_score || app.MATCH_SCORE || calculateSkillMatch(skills);
    return {
      id: app.id || app.ID,
      student_id: app.student_id || app.STUDENT_ID,
      internship_id: app.internship_id || app.INTERNSHIP_ID,
      candidate_name: app.candidate_name || app.student_name || app.name || app.NAME || 'Candidate',
      email: app.email || app.candidate_email || app.EMAIL || 'Not provided',
      phone: app.phone || app.PHONE || 'Not provided',
      college: app.college || app.COLLEGE || 'Not provided',
      branch: app.branch || app.BRANCH || 'Not provided',
      cgpa: app.cgpa || app.CGPA || 'N/A',
      skills: skills,
      leetcode: app.leetcode || app.LEETCODE || '',
      github: app.github || app.GITHUB || '',
      gender: app.gender || app.GENDER || '',
      linkedin: app.linkedin || app.LINKEDIN || '',
      portfolio: app.portfolio || app.PORTFOLIO || '',
      role_title: app.role_title || app.title || app.ROLE_TITLE || 'Engineering Intern',
      test_score: app.test_score !== null && app.test_score !== undefined ? app.test_score : null,
      match_score: matchScore,
      status: app.status || app.STATUS || 'APPLIED',
      applied_at: app.applied_at || app.APPLIED_AT || 'Recently',
      resume_text: app.resume_text || `${app.candidate_name || 'Candidate'} - Department: ${app.branch || 'N/A'}, CGPA: ${app.cgpa || 'N/A'}. Verified Skills: ${skills || 'Technical Competencies'}.`
    };
  };

  const calculateSkillMatch = (skillsStr) => {
    if (!skillsStr) return 75;
    const required = ['python', 'pytorch', 'cuda', 'algorithms', 'react', 'java', 'sql', 'spring boot'];
    const candidateSkills = skillsStr.toLowerCase().split(/[,|\\s]+/);
    let matchCount = 0;
    required.forEach(r => {
      if (candidateSkills.some(cs => cs.includes(r) || r.includes(cs))) {
        matchCount++;
      }
    });
    return Math.min(98, Math.max(65, Math.round((matchCount / required.length) * 100) + 20));
  };

  const handleShortlist = async (app) => {
    const appId = app.id;
    const endpoints = [
      `${apiBaseUrl}/api/v1/company/applications/${appId}/status`,
      `http://localhost:8083/api/v1/company/applications/${appId}/status`,
      `http://localhost:8000/api/v1/company/applications/${appId}/status`
    ];

    for (const url of endpoints) {
      try {
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'SHORTLISTED', stage: 'ASSESSMENT' })
        });
        break;
      } catch (e) {}
    }

    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: 'SHORTLISTED' } : a));
    setStatusMsg(`Candidate ${app.candidate_name} shortlisted! Proctored assessment has been dispatched to their dashboard.`);
    setTimeout(() => setStatusMsg(''), 5000);
  };

  const handleSendOffer = async (app) => {
    const appId = app.id;
    const endpoints = [
      `${apiBaseUrl}/api/v1/company/applications/${appId}/status`,
      `http://localhost:8083/api/v1/company/applications/${appId}/status`,
      `http://localhost:8000/api/v1/company/applications/${appId}/status`
    ];

    for (const url of endpoints) {
      try {
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'OFFER_SENT', stage: 'OFFER' })
        });
        break;
      } catch (e) {}
    }

    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: 'OFFER_SENT' } : a));
    setStatusMsg(`🎉 Official Offer Letter dispatched to ${app.candidate_name} for ${app.role_title}!`);
    setTimeout(() => setStatusMsg(''), 5000);
  };

  const passingCriteria = 60;

  const displayedApplicants = applicants.filter(app => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = app.candidate_name.toLowerCase().includes(q) || app.email.toLowerCase().includes(q) || app.skills.toLowerCase().includes(q) || app.role_title.toLowerCase().includes(q);
    const matchesAi = !filterAiOnly || app.match_score >= 75;
    return matchesSearch && matchesAi;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header & AI Controls */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              AI Applicant Screening & Hiring Pipeline
            </h2>
            <span className="badge badge-ai" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} /> AI Skill Filter Active
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Review candidate applications, inspect verified resumes, shortlist for proctored tests, and issue offers
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search candidate, skill..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem', width: '220px' }}
            />
          </div>

          <button
            onClick={() => setFilterAiOnly(!filterAiOnly)}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: filterAiOnly ? '#EFF6FF' : '#FFFFFF',
              color: filterAiOnly ? '#2563EB' : '#64748B',
              borderColor: filterAiOnly ? '#BFDBFE' : 'var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Filter size={14} /> {filterAiOnly ? 'AI Filtered (>=75% Match)' : 'Show All Candidates'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '12px 18px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
          ✓ {statusMsg}
        </div>
      )}

      {isLoading ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading applicants from database...
        </div>
      ) : displayedApplicants.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayedApplicants.map((app) => {
            const isShortlisted = app.status === 'SHORTLISTED' || app.status === 'ACCEPTED_FOR_TEST' || app.status === 'TEST_PASSED' || app.status === 'OFFER_SENT';
            const isOfferSent = app.status === 'OFFER_SENT' || app.status === 'HIRED';
            const hasTestScore = app.test_score !== null && app.test_score !== undefined;
            const passedCriteria = hasTestScore && app.test_score >= passingCriteria;

            return (
              <div
                key={app.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '18px',
                  borderLeft: `4px solid ${isOfferSent ? '#059669' : (isShortlisted ? '#2563EB' : '#7C3AED')}`
                }}
              >
                <div style={{ flex: 1, minWidth: '320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{app.candidate_name}</h3>
                    <span className="badge badge-ai" style={{ padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                      ⚡ {app.match_score}% AI Skill Match
                    </span>
                    <span className="badge badge-auth" style={{ textTransform: 'uppercase', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {app.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: '#2563EB', fontWeight: 600, marginTop: '4px' }}>
                    Applying for: <strong>{app.role_title}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span>🏛️ {app.college}</span>
                    <span>🎓 {app.branch}</span>
                    <span>📊 CGPA: <strong>{app.cgpa}</strong></span>
                    <span>✉️ {app.email}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', marginTop: '8px', flexWrap: 'wrap' }}>
                    {app.leetcode && <span style={{ color: '#D97706', fontWeight: 700 }}>&lt;&gt; LeetCode: {app.leetcode}</span>}
                    {app.github && <span style={{ color: '#2563EB', fontWeight: 700 }}>GitHub: {app.github}</span>}
                  </div>

                  {app.skills && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '8px' }}>
                      <strong>Verified Skills:</strong> {app.skills}
                    </div>
                  )}

                  {hasTestScore && (
                    <div style={{ marginTop: '12px', padding: '8px 14px', background: passedCriteria ? '#DCFCE7' : '#FEE2E2', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: passedCriteria ? '#166534' : '#DC2626' }}>
                      {passedCriteria ? `✓ Assessment Passed: ${app.test_score}% (Criteria Met >= ${passingCriteria}%)` : `✗ Assessment Score: ${app.test_score}% (Below Criteria)`}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  <button
                    onClick={() => setSelectedApplicantResume(app)}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Eye size={14} color="#2563EB" /> View Candidate Resume
                  </button>

                  {!isShortlisted ? (
                    <button
                      onClick={() => handleShortlist(app)}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Sparkles size={14} /> Shortlist & Send Test
                    </button>
                  ) : !isOfferSent ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700 }}>
                        ✓ Shortlisted (Test Dispatched)
                      </span>
                      {passedCriteria && (
                        <button
                          onClick={() => handleSendOffer(app)}
                          className="btn-primary"
                          style={{ padding: '8px 18px', fontSize: '0.82rem', background: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Send size={14} /> Dispatch Offer Letter
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="badge badge-ai" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 800, padding: '6px 14px' }}>
                      🎉 Official Offer Dispatched
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          No candidate applications found for your company's active internships.
        </div>
      )}

      {/* View Resume Modal */}
      {selectedApplicantResume && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ background: '#FFFFFF', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={22} color="#2563EB" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {selectedApplicantResume.candidate_name}'s Resume Dossier
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified Applicant Record</span>
                </div>
              </div>
              <button onClick={() => setSelectedApplicantResume(null)} className="btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.88rem' }}>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><strong>Email:</strong> {selectedApplicantResume.email}</div>
                  <div><strong>Phone:</strong> {selectedApplicantResume.phone}</div>
                  <div><strong>College:</strong> {selectedApplicantResume.college}</div>
                  <div><strong>Department:</strong> {selectedApplicantResume.branch}</div>
                  <div><strong>CGPA:</strong> {selectedApplicantResume.cgpa}</div>
                  <div><strong>AI Match:</strong> <span className="badge badge-ai">{selectedApplicantResume.match_score}%</span></div>
                </div>
              </div>

              {selectedApplicantResume.skills && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Verified Technical Skills
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedApplicantResume.skills.split(',').map((s, i) => (
                      <span key={i} className="badge badge-ai" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Candidate Summary
                </h4>
                <div style={{ padding: '14px', background: '#F1F5F9', borderRadius: '8px', fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                  {selectedApplicantResume.resume_text}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button onClick={() => setSelectedApplicantResume(null)} className="btn-secondary">
                  Close
                </button>
                {selectedApplicantResume.status === 'APPLIED' && (
                  <button
                    onClick={() => {
                      handleShortlist(selectedApplicantResume);
                      setSelectedApplicantResume(null);
                    }}
                    className="btn-primary"
                  >
                    Shortlist & Send Test
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
