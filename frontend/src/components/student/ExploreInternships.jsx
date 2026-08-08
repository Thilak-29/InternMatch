import React, { useState, useEffect } from 'react';
import { Briefcase, Search, MapPin, DollarSign, Send, CheckCircle, Clock } from 'lucide-react';

export default function ExploreInternships({ apiBaseUrl = 'http://localhost:8000', currentUser }) {
  const [internships, setInternships] = useState(() => {
    try {
      const cached = localStorage.getItem('internmatch_posted_jobs');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [search, setSearch] = useState('');
  const [appliedIds, setAppliedIds] = useState(() => {
    const cached = localStorage.getItem('internmatch_applied_ids');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  });
  const [statusMsg, setStatusMsg] = useState('');

  const studentId = currentUser?.userId || currentUser?.user_id || 3;

  useEffect(() => {
    fetchLiveInternships();
    fetchStudentAppliedIds();
  }, [studentId]);

  const fetchLiveInternships = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/company/internships`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data)) {
          let local = [];
          try {
            const cached = localStorage.getItem('internmatch_posted_jobs');
            if (cached) local = JSON.parse(cached);
          } catch (e) {}

          const mergedMap = new Map();
          [...data, ...local].forEach(job => {
            const key = job.id || job.ID || job.title || job.TITLE;
            if (key && !mergedMap.has(key)) {
              mergedMap.set(key, job);
            }
          });
          setInternships(Array.from(mergedMap.values()));
        }
      }
    } catch (e) {}
  };

  const fetchStudentAppliedIds = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/student/${studentId}/applications`);
      if (res.ok) {
        const data = await res.json();
        const ids = data.map(a => a.internship_id || a.INTERNSHIP_ID);
        const merged = Array.from(new Set([...appliedIds, ...ids]));
        setAppliedIds(merged);
        localStorage.setItem('internmatch_applied_ids', JSON.stringify(merged));
      }
    } catch (e) {}
  };

  const handleApply = async (job) => {
    const jobId = job.id || job.ID;
    const companyId = job.company_id || job.COMPANY_ID || 1;
    const companyName = job.company_name || job.COMPANY_NAME || 'Company';
    const jobTitle = job.title || job.TITLE || 'Internship';

    const newApplied = [...appliedIds, jobId];
    setAppliedIds(newApplied);
    localStorage.setItem('internmatch_applied_ids', JSON.stringify(newApplied));
    setStatusMsg(`Applied successfully to ${jobTitle} at ${companyName}!`);
    setTimeout(() => setStatusMsg(''), 4000);

    try {
      await fetch(`${apiBaseUrl}/api/v1/student/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          internship_id: jobId,
          company_id: companyId,
          company_name: companyName,
          job_title: jobTitle
        })
      });
    } catch (e) {}
  };

  const filteredJobs = internships.filter((job) => {
    const title = (job.title || job.TITLE || '').toLowerCase();
    const company = (job.company_name || job.COMPANY_NAME || '').toLowerCase();
    const skills = (job.required_skills || job.REQUIRED_SKILLS || '').toLowerCase();
    const loc = (job.location || job.LOCATION || '').toLowerCase();
    const q = search.toLowerCase();

    return title.includes(q) || company.includes(q) || skills.includes(q) || loc.includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Explore Live Internships</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time internship postings from recruiters in College Oracle Database.</p>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search Role, Company, Skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem', minWidth: '260px' }}
          />
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '12px 16px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
          ✓ {statusMsg}
        </div>
      )}

      {filteredJobs && filteredJobs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredJobs.map((job, idx) => {
            const jobId = job.id || job.ID || idx;
            const title = job.title || job.TITLE || 'Internship Role';
            const company = job.company_name || job.COMPANY_NAME || 'Company';
            const mode = job.work_mode || job.WORK_MODE || 'Hybrid';
            const location = job.location || job.LOCATION || 'Location';
            const stipend = job.stipend || job.STIPEND || 0;
            const skills = job.required_skills || job.REQUIRED_SKILLS || '';
            const duration = job.duration || job.DURATION || '3 Months';
            const deadline = job.application_deadline || job.APPLICATION_DEADLINE || '';
            const isClosed = job.status === 'CLOSED' || job.STATUS === 'CLOSED';

            const hasApplied = appliedIds.includes(jobId);

            return (
              <div key={jobId} className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h3>
                    {isClosed && (
                      <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '0.72rem', fontWeight: 700 }}>
                        Positions Filled
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                    {company} • <span style={{ color: 'var(--text-muted)' }}>{mode}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> ₹{stipend}/mo</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> {duration}</span>
                    {deadline && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontWeight: 600 }}><Clock size={14} /> Deadline: {deadline}</span>
                    )}
                  </div>
                  {skills && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '8px' }}>
                      <strong>Required Skills:</strong> {skills}
                    </div>
                  )}
                </div>

                <div>
                  {isClosed ? (
                    <button disabled className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#64748B', background: '#F1F5F9', cursor: 'not-allowed' }}>
                      Application Closed
                    </button>
                  ) : hasApplied ? (
                    <button disabled className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#059669', background: '#ECFDF5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} /> Applied
                    </button>
                  ) : (
                    <button onClick={() => handleApply(job)} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Send size={14} /> Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          No active internship postings available. Recruiters can post roles from Company Dashboard.
        </div>
      )}
    </div>
  );
}
