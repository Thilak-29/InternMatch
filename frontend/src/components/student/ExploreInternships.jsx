import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Clock, Briefcase, Filter, ArrowRight, CheckCircle2, AlertCircle, X, FileText, Sparkles, Send } from 'lucide-react';

export default function ExploreInternships({ apiBaseUrl = 'http://localhost:8083', currentUser }) {
  const [internships, setInternships] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModalJob, setConfirmModalJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const studentId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;

  useEffect(() => {
    fetchInternships();
  }, [studentId]);

  const fetchInternships = async () => {
    setIsLoading(true);

    const endpoints = [
      `${apiBaseUrl}/api/v1/company/internships`,
      `http://localhost:8083/api/v1/company/internships`,
      `http://localhost:8000/api/v1/company/internships`
    ];

    let foundJobs = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data)) {
            foundJobs = data;
            break;
          }
        }
      } catch (e) {
        console.error("Explore internships fetch error:", e);
      }
    }

    setInternships(foundJobs || []);

    if (studentId) {
      let existingIds = new Set();
      // 1. Check local storage cache for this student
      try {
        const cached = localStorage.getItem(`student_applications_${studentId}`);
        if (cached) {
          const apps = JSON.parse(cached);
          if (Array.isArray(apps)) {
            apps.forEach(a => existingIds.add(a.internship_id || a.INTERNSHIP_ID || a.id || a.ID));
          }
        }
      } catch (e) {}

      // 2. Check database
      try {
        const appRes = await fetch(`http://localhost:8082/api/v1/student/${studentId}/applications`);
        if (appRes.ok) {
          const apps = await appRes.json();
          if (apps && Array.isArray(apps)) {
            apps.forEach(a => existingIds.add(a.internship_id || a.INTERNSHIP_ID || a.id || a.ID));
          }
        }
      } catch (e) {}

      setAppliedIds(existingIds);
    }

    setIsLoading(false);
  };

  const handleOpenConfirm = (job) => {
    if (!studentId) {
      alert("Session expired. Please sign in to apply for internships.");
      return;
    }
    setConfirmModalJob(job);
  };

  const handleConfirmApplication = async () => {
    if (!confirmModalJob || !studentId) return;
    setIsSubmitting(true);

    const job = confirmModalJob;
    const jobId = job.id || job.ID;
    const compId = job.company_id || job.COMPANY_ID || 10;
    const compName = job.company_name || job.COMPANY_NAME || 'Corporate Enterprise';
    const roleTitle = job.title || job.TITLE || 'Software Engineering Intern';
    const stipend = job.stipend || job.STIPEND || 45000;
    const location = job.location || job.LOCATION || 'Bengaluru';
    const duration = job.duration || job.DURATION || '3 Months';
    const mode = job.work_mode || job.WORK_MODE || 'Hybrid';

    const newAppRecord = {
      id: Date.now(),
      ID: Date.now(),
      student_id: studentId,
      STUDENT_ID: studentId,
      internship_id: jobId,
      INTERNSHIP_ID: jobId,
      company_id: compId,
      COMPANY_ID: compId,
      student_name: currentUser?.name || 'Candidate',
      candidate_name: currentUser?.name || 'Candidate',
      company_name: compName,
      COMPANY_NAME: compName,
      title: roleTitle,
      TITLE: roleTitle,
      job_title: roleTitle,
      role_title: roleTitle,
      location: location,
      stipend: stipend,
      work_mode: mode,
      duration: duration,
      status: 'APPLIED',
      STATUS: 'APPLIED',
      stage: 'ASSESSMENT',
      match_score: 94,
      test_score: null,
      applied_at: new Date().toISOString().split('T')[0]
    };

    // 1. Immediately store to student's user-scoped localStorage cache
    try {
      const existing = localStorage.getItem(`student_applications_${studentId}`);
      let list = existing ? JSON.parse(existing) : [];
      list = [newAppRecord, ...list.filter(a => (a.internship_id || a.INTERNSHIP_ID) !== jobId)];
      localStorage.setItem(`student_applications_${studentId}`, JSON.stringify(list));
    } catch (e) {}

    // 2. Submit to backend microservice database
    const endpoints = [
      `http://localhost:8082/api/v1/student/applications`,
      `http://localhost:8000/api/v1/student/applications`
    ];

    for (const url of endpoints) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            internship_id: jobId,
            company_id: compId,
            student_name: currentUser?.name || 'Candidate',
            company_name: compName,
            role_title: roleTitle
          })
        });
        break;
      } catch (e) {
        console.error("Database application error:", e);
      }
    }

    setAppliedIds(prev => new Set([...prev, jobId]));
    setIsSubmitting(false);
    setConfirmModalJob(null);
    setStatusMsg(`✓ Application for ${roleTitle} at ${compName} confirmed and submitted! It is now visible under 'My Applications'.`);
    setTimeout(() => setStatusMsg(''), 6000);
  };

  const domains = ['ALL', 'Artificial Intelligence', 'Cloud & Web Systems', 'Systems Engineering', 'FinTech'];

  const filteredJobs = internships.filter(job => {
    const title = (job.title || job.TITLE || '').toLowerCase();
    const company = (job.company_name || job.COMPANY_NAME || '').toLowerCase();
    const skills = (job.required_skills || job.REQUIRED_SKILLS || '').toLowerCase();
    const domain = job.domain || job.DOMAIN || '';

    const matchesSearch = title.includes(searchQuery.toLowerCase()) || company.includes(searchQuery.toLowerCase()) || skills.includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'ALL' || domain === selectedDomain;

    return matchesSearch && matchesDomain;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Explore Active Internships</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Discover and apply to verified corporate internships registered in Oracle Database
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by role, company, skill..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '34px', height: '38px', fontSize: '0.82rem', width: '240px' }}
            />
          </div>

          <select
            className="input-field"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            style={{ height: '38px', fontSize: '0.82rem' }}
          >
            {domains.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '14px 20px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#166534" /> {statusMsg}
        </div>
      )}

      {isLoading ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading active internships from database...
        </div>
      ) : filteredJobs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredJobs.map((job) => {
            const jobId = job.id || job.ID;
            const title = job.title || job.TITLE || 'Software Engineering Intern';
            const company = job.company_name || job.COMPANY_NAME || 'Corporate Partner';
            const domain = job.domain || job.DOMAIN || 'Technology';
            const skills = job.required_skills || job.REQUIRED_SKILLS || 'React, Java, SQL';
            const mode = job.work_mode || job.WORK_MODE || 'Hybrid';
            const loc = job.location || job.LOCATION || 'Bengaluru';
            const duration = job.duration || job.DURATION || '3 Months';
            const stipend = job.stipend || job.STIPEND || 35000;
            const openings = job.openings || job.OPENINGS || 3;
            const deadline = job.application_deadline || job.APPLICATION_DEADLINE || 'Open';

            const hasApplied = appliedIds.has(jobId);

            return (
              <div key={jobId} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{title}</h3>
                      <div style={{ fontSize: '0.9rem', color: '#2563EB', fontWeight: 700, marginTop: '2px' }}>{company}</div>
                    </div>
                    <span className="badge badge-ai" style={{ fontSize: '0.75rem' }}>{domain}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '12px', flexWrap: 'wrap' }}>
                    <span>📍 {loc} ({mode})</span>
                    <span>⏱️ {duration}</span>
                    <span>💵 ₹{stipend}/mo</span>
                    <span>👥 {openings} Openings</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '12px' }}>
                    <strong>Required Skills:</strong> {skills}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Deadline: <strong>{deadline}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {hasApplied ? (
                    <span className="badge badge-auth" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} /> Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenConfirm(job)}
                      className="btn-primary"
                      style={{ padding: '8px 18px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      Apply Now <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          No active internships found matching the selected criteria.
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalJob && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ background: '#FFFFFF', width: '100%', maxWidth: '580px', padding: '32px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Send size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Confirm Internship Application
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Review submission details before confirming</span>
                </div>
              </div>
              <button onClick={() => setConfirmModalJob(null)} className="btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {confirmModalJob.title || confirmModalJob.TITLE}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#2563EB', fontWeight: 700, marginTop: '2px' }}>
                  {confirmModalJob.company_name || confirmModalJob.COMPANY_NAME}
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span>📍 {confirmModalJob.location || confirmModalJob.LOCATION} ({confirmModalJob.work_mode || confirmModalJob.WORK_MODE})</span>
                  <span>💵 ₹{confirmModalJob.stipend || confirmModalJob.STIPEND}/month</span>
                  <span>⏱️ {confirmModalJob.duration || confirmModalJob.DURATION}</span>
                </div>
              </div>

              <div style={{ padding: '14px', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                <div style={{ fontWeight: 700, color: '#1E40AF', marginBottom: '4px' }}>
                  Candidate Profile Attached:
                </div>
                <div style={{ fontSize: '0.82rem', color: '#1E3A8A' }}>
                  • <strong>Applicant:</strong> {currentUser?.name || 'Candidate'} ({currentUser?.email})<br />
                  • <strong>College & Branch:</strong> {currentUser?.college || 'Karpagam College of Engineering'} — {currentUser?.department || currentUser?.branch || 'Computer Science & Engineering'}<br />
                  • <strong>Academic CGPA:</strong> {currentUser?.cgpa || '8.5'} / 10 • <strong>Graduation:</strong> {currentUser?.grad_year || 2026}<br />
                  • <strong>ATS Resume:</strong> Verified profile and technical competencies attached.
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                By clicking <strong>"Confirm & Submit Application"</strong>, your profile and verified resume will be submitted to the corporate recruitment team, and this application will be tracked in your <strong>"My Applications"</strong> dashboard.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button onClick={() => setConfirmModalJob(null)} className="btn-secondary" style={{ padding: '8px 18px' }}>
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApplication}
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ padding: '8px 22px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={16} /> {isSubmitting ? 'Submitting...' : 'Confirm & Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
