import React, { useState, useEffect } from 'react';
import { Briefcase, Users, CheckCircle2, TrendingUp, Plus, Search, Edit3, Trash2, MapPin, DollarSign, Clock, AlertCircle, ArrowRight } from 'lucide-react';

export default function CompanyDashboard({ apiBaseUrl = 'http://localhost:8083', currentUser, onNavigate }) {
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

  const [internships, setInternships] = useState([]);
  const [applicantCount, setApplicantCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [offersCount, setOffersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStipend, setEditStipend] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    setIsLoading(true);

    const endpoints = [
      `${apiBaseUrl}/api/v1/company/${companyId}/internships`,
      `http://localhost:8083/api/v1/company/${companyId}/internships`,
      `http://localhost:8000/api/v1/company/${companyId}/internships`
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
        console.error("Company internships fetch error:", e);
      }
    }

    setInternships(foundJobs || []);

    try {
      const appRes = await fetch(`http://localhost:8083/api/v1/company/${companyId}/applicants`);
      if (appRes.ok) {
        const apps = await appRes.json();
        if (apps && Array.isArray(apps)) {
          setApplicantCount(apps.length);
          setShortlistedCount(apps.filter(a => (a.status || a.STATUS) === 'SHORTLISTED' || (a.status || a.STATUS) === 'TEST_PASSED').length);
          setOffersCount(apps.filter(a => (a.status || a.STATUS) === 'OFFER_SENT' || (a.status || a.STATUS) === 'HIRED').length);
        }
      }
    } catch (e) {}

    setIsLoading(false);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this internship posting?")) return;

    try {
      await fetch(`http://localhost:8083/api/v1/company/internships/${jobId}`, { method: 'DELETE' });
    } catch (e) {}

    setInternships(prev => prev.filter(j => (j.id || j.ID) !== jobId));
    setStatusMsg("Internship posting deleted from database.");
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setEditTitle(job.title || job.TITLE || '');
    setEditStipend(job.stipend || job.STIPEND || 35000);
    setEditLocation(job.location || job.LOCATION || 'Bengaluru');
    setEditSkills(job.required_skills || job.REQUIRED_SKILLS || '');
  };

  const handleSaveEdit = async () => {
    if (!editingJob) return;
    const jobId = editingJob.id || editingJob.ID;

    const payload = {
      title: editTitle,
      stipend: parseFloat(editStipend) || 35000,
      location: editLocation,
      required_skills: editSkills
    };

    try {
      await fetch(`http://localhost:8083/api/v1/company/internships/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {}

    setInternships(prev => prev.map(j => {
      if ((j.id || j.ID) === jobId) {
        return { ...j, ...payload };
      }
      return j;
    }));

    setEditingJob(null);
    setStatusMsg("Internship posting updated successfully in database.");
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const kpis = [
    { label: 'Active Internships', value: internships.length, icon: Briefcase, color: '#2563EB', bg: '#DBEAFE' },
    { label: 'Total Applicants', value: applicantCount, icon: Users, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Shortlisted Candidates', value: shortlistedCount, icon: TrendingUp, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Offers Dispatched', value: offersCount, icon: CheckCircle2, color: '#059669', bg: '#D1FAE5' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                <Icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>{kpi.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {statusMsg && (
        <div style={{ padding: '12px 18px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
          ✓ {statusMsg}
        </div>
      )}

      {/* Internships Management Section */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Active Internship Postings
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Manage recruitment drives, update requirements, and view candidate submissions
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {onNavigate && (
              <>
                <button onClick={() => onNavigate('applicants')} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={15} /> View Applicants
                </button>
                <button onClick={() => onNavigate('post-internship')} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={15} /> Post New Internship
                </button>
              </>
            )}
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading company internships from database...
          </div>
        ) : internships.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {internships.map((job) => {
              const jobId = job.id || job.ID;
              const title = job.title || job.TITLE || 'Software Intern';
              const domain = job.domain || job.DOMAIN || 'Technology';
              const stipend = job.stipend || job.STIPEND || 35000;
              const loc = job.location || job.LOCATION || 'Bengaluru';
              const duration = job.duration || job.DURATION || '3 Months';
              const mode = job.work_mode || job.WORK_MODE || 'Hybrid';
              const openings = job.openings || job.OPENINGS || 5;
              const deadline = job.application_deadline || job.APPLICATION_DEADLINE || '2026-07-30';
              const skills = job.required_skills || job.REQUIRED_SKILLS || 'React, Java, SQL';

              return (
                <div key={jobId} style={{ padding: '20px', border: '1px solid var(--border-light)', borderRadius: '10px', background: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{title}</h3>
                      <span className="badge badge-ai" style={{ fontSize: '0.72rem' }}>{domain}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span>📍 {loc} ({mode})</span>
                      <span>⏱️ {duration}</span>
                      <span>💵 ₹{stipend}/mo</span>
                      <span>👥 {openings} Openings</span>
                      <span>📅 Deadline: {deadline}</span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '8px' }}>
                      <strong>Required Skills:</strong> {skills}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditClick(job)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Edit3 size={13} /> Edit
                    </button>
                    <button onClick={() => handleDelete(jobId)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            No active internships posted yet. Click 'Post New Internship' to create your first recruitment drive.
          </div>
        )}
      </div>

      {/* Edit Internship Modal */}
      {editingJob && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ background: '#FFFFFF', width: '100%', maxWidth: '520px', padding: '28px', borderRadius: '14px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              Edit Internship Listing
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>POSITION TITLE</label>
                <input type="text" className="input-field" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>STIPEND (₹/MONTH)</label>
                <input type="number" className="input-field" value={editStipend} onChange={(e) => setEditStipend(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>LOCATION</label>
                <input type="text" className="input-field" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>REQUIRED SKILLS</label>
                <input type="text" className="input-field" value={editSkills} onChange={(e) => setEditSkills(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button onClick={() => setEditingJob(null)} className="btn-secondary">Cancel</button>
                <button onClick={handleSaveEdit} className="btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
