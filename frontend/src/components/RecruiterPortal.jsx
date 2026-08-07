import React, { useState, useEffect } from 'react';
import { Building2, UserCheck, CheckCircle2, Award, Send, Sparkles, Filter, Search, BarChart2, Plus, X } from 'lucide-react';
import CandidateTimeline from './CandidateTimeline';

export default function RecruiterPortal({ apiBaseUrl, currentUser }) {
  const [internships, setInternships] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);

  const [newJob, setNewJob] = useState({
    title: '',
    domain: 'Artificial Intelligence',
    location_type: 'Hybrid',
    location: 'Bengaluru',
    duration_weeks: 12,
    stipend: 45000,
    openings: 3,
    deadline: '2026-08-30',
    description: ''
  });

  const safeUser = currentUser || {};
  const userId = (safeUser.userId || safeUser.user_id) ? Number(safeUser.userId || safeUser.user_id) : 1;

  useEffect(() => {
    fetchCompanyInternships();
  }, [userId]);

  const fetchCompanyInternships = async () => {
    try {
      setLoading(true);
      const companyId = userId || 1;
      let res = await fetch(`${apiBaseUrl}/api/v1/internships/company/${companyId}`);
      let data = [];
      if (res.ok) {
        data = await res.json();
      }

      if (!data || data.length === 0) {
        const fallbackRes = await fetch(`${apiBaseUrl}/api/v1/internships`);
        if (fallbackRes.ok) {
          data = await fallbackRes.json();
        }
      }

      setInternships(data || []);
      if (data && data.length > 0) {
        const activeJob = data[0];
        setSelectedJob(activeJob);
        fetchApplicantsForJob(activeJob.id || activeJob.internship_id);
      }
    } catch (err) {
      console.error('Error fetching internships:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicantsForJob = async (internshipId) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/applications/internship/${internshipId}`);
      if (res.ok) {
        const data = await res.json();
        setApplicants(data.applicants || []);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    fetchApplicantsForJob(job.id || job.internship_id);
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        if (selectedJob) fetchApplicantsForJob(selectedJob.id || selectedJob.internship_id);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      setPosting(true);
      const res = await fetch(`${apiBaseUrl}/api/v1/internships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newJob,
          company_id: userId,
          company_name: currentUser.company_name || currentUser.name || "Google"
        })
      });
      if (res.ok) {
        setShowPostModal(false);
        fetchCompanyInternships();
      }
    } catch (err) {
      console.error('Post job error:', err);
    } finally {
      setPosting(false);
    }
  };

  const filteredApplicants = applicants.filter(app => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'SHORTLISTED') return app.status === 'SHORTLISTED_FOR_TEST' || app.status === 'INTERVIEW_SCHEDULED';
    if (statusFilter === 'ACCEPTED') return app.status === 'ACCEPTED' || app.status === 'OFFER_ACCEPTED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', paddingTop: 'var(--space-24)' }}>
      {/* RECRUITER HEADER HERO */}
      <div className="neo-card" style={{ padding: 'var(--space-32)', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge badge-verified" style={{ marginBottom: '8px' }}>
              <Building2 size={14} /> Recruiter & Employer Console
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Manage Postings & Candidate Pipeline
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              {currentUser.company_name || currentUser.name || "Enterprise Partner"} • AI-Powered Candidate Evaluation
            </p>
          </div>

          <button onClick={() => setShowPostModal(true)} className="btn-primary">
            <Plus size={18} /> Post New Internship
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--space-24)' }}>
        {/* LEFT COLUMN: POSTINGS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <div className="neo-card">
            <div className="neo-card-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Active Positions ({internships.length})
              </h2>
            </div>
            <div className="neo-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {loading ? (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Loading positions...</p>
              ) : internships.map((job) => {
                const isSelected = selectedJob?.id === job.id || selectedJob?.internship_id === job.id;
                return (
                  <div
                    key={job.id || job.internship_id}
                    onClick={() => handleSelectJob(job)}
                    style={{
                      padding: 'var(--space-16)',
                      borderRadius: '14px',
                      border: '1.5px solid var(--border-color)',
                      background: isSelected ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{job.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{job.domain}</span>
                      <span>{job.openings || 3} Openings</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: APPLICANTS PIPELINE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          {selectedJob && (
            <div className="neo-card">
              <div className="neo-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="badge badge-ai" style={{ marginBottom: '4px' }}>AI RANKING ACTIVE</span>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedJob.title}</h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Location: {selectedJob.location} • Stipend: ₹{selectedJob.stipend?.toLocaleString()}/mo
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setStatusFilter('ALL')} className={statusFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'} style={{ height: '36px', fontSize: '0.82rem' }}>All</button>
                  <button onClick={() => setStatusFilter('SHORTLISTED')} className={statusFilter === 'SHORTLISTED' ? 'btn-primary' : 'btn-ghost'} style={{ height: '36px', fontSize: '0.82rem' }}>Shortlisted</button>
                  <button onClick={() => setStatusFilter('ACCEPTED')} className={statusFilter === 'ACCEPTED' ? 'btn-primary' : 'btn-ghost'} style={{ height: '36px', fontSize: '0.82rem' }}>Accepted</button>
                </div>
              </div>

              <div className="neo-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
                {filteredApplicants.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: 'var(--space-24)' }}>No applicants currently match the selected filter.</p>
                ) : (
                  filteredApplicants.map((app) => (
                    <div key={app.id} style={{ padding: 'var(--space-16)', background: 'var(--bg-secondary-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{app.student_name}</h3>
                          <span className="badge badge-verified">CGPA: {app.cgpa || 8.5}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          College: {app.college || "Karpagam College of Engineering"} • GitHub: @{app.github || "vignesh"} • LeetCode: @{app.leetcode || "vignesh"}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {app.status === 'APPLIED' && (
                          <button onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED_FOR_TEST')} className="btn-outline" style={{ height: '38px', fontSize: '0.85rem' }}>
                            Invite to Test
                          </button>
                        )}
                        {app.status !== 'ACCEPTED' && (
                          <button onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')} className="btn-primary" style={{ height: '38px', fontSize: '0.85rem' }}>
                            Extend Offer
                          </button>
                        )}
                        <span className="badge badge-hybrid">{app.status || 'APPLIED'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POST INTERNSHIP MODAL */}
      {showPostModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="neo-card" style={{ maxWidth: '580px', width: '100%', padding: 'var(--space-32)', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Post New Internship</h2>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowPostModal(false)} />
            </div>

            <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>TITLE</label>
                <input type="text" required className="input-field" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} placeholder="AI & Machine Learning Research Intern" />
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>DOMAIN</label>
                <select className="input-field" value={newJob.domain} onChange={(e) => setNewJob({ ...newJob, domain: e.target.value })}>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                  <option value="Data Science & Analytics">Data Science & Analytics</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>MONTHLY STIPEND (₹)</label>
                <input type="number" required className="input-field" value={newJob.stipend} onChange={(e) => setNewJob({ ...newJob, stipend: Number(e.target.value) })} placeholder="45000" />
              </div>

              <button type="submit" disabled={posting} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {posting ? 'Publishing...' : 'Publish Internship Position'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
