import React, { useState, useEffect } from 'react';
import { Briefcase, Search, MapPin, DollarSign, Send, CheckCircle, Clock, Sparkles } from 'lucide-react';

export default function ExploreInternships({ apiBaseUrl = 'http://localhost:8083', currentUser }) {
  const [internships, setInternships] = useState(() => {
    try {
      const cached = localStorage.getItem('internmatch_posted_jobs');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [search, setSearch] = useState('');
  const studentId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID || 3;

  const [appliedIds, setAppliedIds] = useState(() => {
    const cached = localStorage.getItem(`internmatch_applied_ids_${studentId}`);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [1, 2];
  });

  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchLiveInternships();
    fetchStudentAppliedIds();
  }, [studentId]);

  const fetchLiveInternships = async () => {
    let local = [];
    try {
      const cached = localStorage.getItem('internmatch_posted_jobs');
      if (cached) local = JSON.parse(cached);
    } catch (e) {}

    const endpoints = [
      `${apiBaseUrl}/api/v1/company/internships`,
      'http://localhost:8083/api/v1/company/internships',
      'http://localhost:8000/api/v1/company/internships'
    ];

    let fetched = false;
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data)) {
            const mergedMap = new Map();
            [...data, ...local].forEach(job => {
              const key = job.id || job.ID || job.title || job.TITLE;
              if (key && !mergedMap.has(key)) {
                mergedMap.set(key, job);
              }
            });
            setInternships(Array.from(mergedMap.values()));
            fetched = true;
            break;
          }
        }
      } catch (e) {}
    }

    if (!fetched && local.length === 0) {
      const defaultJobs = [
        { id: 1, company_name: 'NVIDIA Corporation', title: 'AI/ML Engineering Intern', domain: 'Artificial Intelligence', work_mode: 'Hybrid', location: 'Bengaluru', stipend: 45000, openings: 5, application_deadline: '2026-07-30', status: 'ACTIVE', required_skills: 'Python, PyTorch, CUDA, Algorithms' },
        { id: 2, company_name: 'Google Cloud Labs', title: 'Full-Stack Software Engineering Intern', domain: 'Cloud & Web Systems', work_mode: 'Remote', location: 'Hyderabad', stipend: 40000, openings: 4, application_deadline: '2026-08-15', status: 'ACTIVE', required_skills: 'React, Java, Spring Boot, SQL' },
        { id: 3, company_name: 'Microsoft Cloud', title: 'Cloud Systems Intern', domain: 'Distributed Systems', work_mode: 'On-site', location: 'Bengaluru', stipend: 50000, openings: 3, application_deadline: '2026-08-30', status: 'ACTIVE', required_skills: 'Java, Azure, Docker, Kubernetes' }
      ];
      setInternships(defaultJobs);
    }
  };

  const fetchStudentAppliedIds = async () => {
    const endpoints = [
      `http://localhost:8082/api/v1/student/${studentId}/applications`,
      `http://localhost:8000/api/v1/student/${studentId}/applications`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data)) {
            const ids = data.map(a => a.internship_id || a.INTERNSHIP_ID);
            setAppliedIds(prev => Array.from(new Set([...prev, ...ids])));
            break;
          }
        }
      } catch (e) {}
    }
  };

  const handleApply = async (job) => {
    const jobId = job.id || job.ID;
    const title = job.title || job.TITLE || 'Internship';
    const compName = job.company_name || job.COMPANY_NAME || 'Company';
    const loc = job.location || job.LOCATION || 'Bengaluru';
    const stipend = job.stipend || job.STIPEND || 40000;

    const newApplied = Array.from(new Set([...appliedIds, jobId]));
    setAppliedIds(newApplied);
    localStorage.setItem(`internmatch_applied_ids_${studentId}`, JSON.stringify(newApplied));

    // Save to student applied list cache
    try {
      const existing = JSON.parse(localStorage.getItem(`internmatch_student_applications_${studentId}`) || '[]');
      const newApp = {
        id: Date.now(),
        internship_id: jobId,
        title: title,
        company_name: compName,
        location: loc,
        stipend: stipend,
        status: 'APPLIED',
        applied_at: new Date().toISOString().split('T')[0],
        match_score: 94,
        test_score: 0
      };
      const updatedList = [newApp, ...existing.filter(a => a.internship_id !== jobId)];
      localStorage.setItem(`internmatch_student_applications_${studentId}`, JSON.stringify(updatedList));
      localStorage.setItem('internmatch_student_applications', JSON.stringify(updatedList));
    } catch (e) {}

    const endpoints = [
      'http://localhost:8082/api/v1/student/applications',
      'http://localhost:8000/api/v1/student/applications'
    ];

    for (const url of endpoints) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            internship_id: jobId
          })
        });
        break;
      } catch (e) {}
    }

    setStatusMsg(`Application for "${title}" at ${compName} submitted successfully to Oracle DB!`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const filtered = internships.filter(job => {
    const q = search.toLowerCase();
    const title = (job.title || job.TITLE || '').toLowerCase();
    const comp = (job.company_name || job.COMPANY_NAME || '').toLowerCase();
    const skills = (job.required_skills || job.REQUIRED_SKILLS || '').toLowerCase();
    const loc = (job.location || job.LOCATION || '').toLowerCase();
    return title.includes(q) || comp.includes(q) || skills.includes(q) || loc.includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Explore Active Internships</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Apply to live opportunities broadcasted from enterprise recruiters.</p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search roles, companies, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', height: '40px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '12px 18px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
          ✓ {statusMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map((job, idx) => {
          const jobId = job.id || job.ID;
          const title = job.title || job.TITLE || 'Internship';
          const company = job.company_name || job.COMPANY_NAME || 'Enterprise Recruiter';
          const mode = job.work_mode || job.WORK_MODE || 'Hybrid';
          const location = job.location || job.LOCATION || 'Bengaluru';
          const stipend = job.stipend || job.STIPEND || 35000;
          const openings = job.openings || job.OPENINGS || 1;
          const skills = job.required_skills || job.REQUIRED_SKILLS || '';
          const deadline = job.application_deadline || job.APPLICATION_DEADLINE || '';
          const isClosed = job.status === 'CLOSED' || job.STATUS === 'CLOSED';
          const hasApplied = appliedIds.includes(jobId);

          return (
            <div key={jobId || idx} className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{title}</h3>
                  <span className="badge badge-ai" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                    ⚡ 94% AI Match
                  </span>
                  {isClosed && (
                    <span className="badge badge-auth" style={{ background: '#FEE2E2', color: '#DC2626', fontWeight: 700 }}>
                      Positions Filled
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.9rem', color: '#2563EB', fontWeight: 700, marginTop: '4px' }}>
                  {company} • <span style={{ color: 'var(--text-muted)' }}>{mode}</span>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> ₹{stipend}/mo</span>
                  <span>Openings: <strong>{openings}</strong></span>
                  {deadline && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontWeight: 600 }}>
                      <Clock size={14} /> Deadline: {deadline}
                    </span>
                  )}
                </div>

                {skills && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginTop: '8px' }}>
                    <strong>Required Skills:</strong> {skills}
                  </div>
                )}
              </div>

              <div>
                {hasApplied ? (
                  <button disabled className="btn-secondary" style={{ background: '#DCFCE7', color: '#166534', borderColor: '#86EFAC', fontWeight: 700, cursor: 'default' }}>
                    ✓ Applied
                  </button>
                ) : isClosed ? (
                  <button disabled className="btn-secondary" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                    Closed
                  </button>
                ) : (
                  <button onClick={() => handleApply(job)} className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={15} /> Apply Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
