import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Clock, Briefcase, Filter, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ExploreInternships({ apiBaseUrl = 'http://localhost:8083', currentUser }) {
  const [internships, setInternships] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
      try {
        const appRes = await fetch(`http://localhost:8082/api/v1/student/${studentId}/applications`);
        if (appRes.ok) {
          const apps = await appRes.json();
          if (apps && Array.isArray(apps)) {
            const ids = new Set(apps.map(a => a.internship_id || a.INTERNSHIP_ID));
            setAppliedIds(ids);
          }
        }
      } catch (e) {}
    }

    setIsLoading(false);
  };

  const handleApply = async (job) => {
    if (!studentId) {
      alert("Session expired. Please sign in to submit your application.");
      return;
    }

    const jobId = job.id || job.ID;
    const compId = job.company_id || job.COMPANY_ID || 10;
    const compName = job.company_name || job.COMPANY_NAME || 'Enterprise';
    const roleTitle = job.title || job.TITLE || 'Engineering Intern';

    const endpoints = [
      `http://localhost:8082/api/v1/student/applications`,
      `http://localhost:8000/api/v1/student/applications`
    ];

    let applied = false;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
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

        if (res.ok) {
          applied = true;
          break;
        }
      } catch (e) {
        console.error("Application submission error:", e);
      }
    }

    setAppliedIds(prev => new Set([...prev, jobId]));
    setStatusMsg(`✓ Application for ${roleTitle} at ${compName} submitted successfully!`);
    setTimeout(() => setStatusMsg(''), 5000);
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
        <div style={{ padding: '12px 18px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
          {statusMsg}
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
                    <span className="badge badge-auth" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700, padding: '8px 16px' }}>
                      ✓ Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(job)}
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
    </div>
  );
}
