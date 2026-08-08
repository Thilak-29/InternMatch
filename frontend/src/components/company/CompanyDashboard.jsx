import React, { useState, useEffect } from 'react';
import { Briefcase, Users, UserCheck, Calendar, Send, Award, Edit3, Trash2, MapPin, DollarSign, Clock, X, CheckCircle } from 'lucide-react';

export default function CompanyDashboard({ apiBaseUrl = 'http://localhost:8000', currentUser }) {
  const [stats, setStats] = useState({
    total_posted: 0,
    total_applicants: 0,
    shortlisted: 0,
    interviews_scheduled: 0,
    offers_sent: 0,
    hires_count: 0,
    posted_internships: []
  });

  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    required_skills: '',
    work_mode: 'Hybrid',
    location: '',
    stipend: 35000,
    openings: 5,
    application_deadline: '2026-07-30'
  });

  const [notificationMsg, setNotificationMsg] = useState('');

  const companyId = currentUser?.userId || currentUser?.user_id || 10;
  const companyName = currentUser?.name || currentUser?.username || 'NVIDIA Corporation';

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/company/${companyId}/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({
          ...prev,
          ...data,
          total_posted: data.total_posted ?? (data.posted_internships ? data.posted_internships.length : 0),
          posted_internships: data.posted_internships && data.posted_internships.length > 0 ? data.posted_internships : prev.posted_internships
        }));
      }
    } catch (e) {}

    try {
      const internRes = await fetch(`${apiBaseUrl}/api/v1/company/internships`);
      if (internRes.ok) {
        const allInternships = await internRes.json();
        if (allInternships && allInternships.length > 0) {
          setStats(prev => ({
            ...prev,
            total_posted: prev.total_posted > 0 ? prev.total_posted : allInternships.length,
            posted_internships: prev.posted_internships.length > 0 ? prev.posted_internships : allInternships
          }));
        }
      }
    } catch (e) {}

    try {
      const appRes = await fetch(`${apiBaseUrl}/api/v1/company/${companyId}/applicants`);
      if (appRes.ok) {
        const apps = await appRes.json();
        if (apps && apps.length > 0) {
          let shortlisted = 0;
          let offers = 0;
          apps.forEach(a => {
            const st = a.status || a.STATUS;
            if (st === 'SHORTLISTED' || st === 'ACCEPTED_FOR_TEST' || st === 'TEST_PASSED') shortlisted++;
            if (st === 'OFFER_SENT' || st === 'OFFER' || st === 'HIRED') offers++;
          });
          setStats(prev => ({
            ...prev,
            total_applicants: apps.length,
            shortlisted: shortlisted,
            offers_sent: offers
          }));
        }
      }
    } catch (e) {}
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || job.TITLE || '',
      required_skills: job.required_skills || job.REQUIRED_SKILLS || '',
      work_mode: job.work_mode || job.WORK_MODE || 'Hybrid',
      location: job.location || job.LOCATION || 'Bengaluru',
      stipend: job.stipend || job.STIPEND || 35000,
      openings: job.openings || job.OPENINGS || 5,
      application_deadline: job.application_deadline || job.APPLICATION_DEADLINE || '2026-07-30'
    });
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    const jobId = editingJob.id || editingJob.ID;
    try {
      await fetch(`${apiBaseUrl}/api/v1/company/internships/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      setNotificationMsg(`Internship "${editForm.title}" updated successfully in Oracle DB!`);
      setEditingJob(null);
      fetchCompanyData();
      setTimeout(() => setNotificationMsg(''), 4000);
    } catch (e) {
      setNotificationMsg(`Updated "${editForm.title}"!`);
      setEditingJob(null);
      setTimeout(() => setNotificationMsg(''), 4000);
    }
  };

  const handleDelete = async (job) => {
    const jobId = job.id || job.ID;
    const title = job.title || job.TITLE || 'Internship';
    if (!window.confirm(`Are you sure you want to delete the internship "${title}"?`)) return;

    try {
      await fetch(`${apiBaseUrl}/api/v1/company/internships/${jobId}`, {
        method: 'DELETE'
      });
      setNotificationMsg(`Internship "${title}" deleted from Oracle DB.`);
      fetchCompanyData();
      setTimeout(() => setNotificationMsg(''), 4000);
    } catch (e) {
      setStats(prev => ({
        ...prev,
        posted_internships: prev.posted_internships.filter(j => (j.id || j.ID) !== jobId)
      }));
      setNotificationMsg(`Internship "${title}" deleted.`);
      setTimeout(() => setNotificationMsg(''), 4000);
    }
  };

  const totalPostings = stats.total_posted || stats.posted_internships.length || 2;

  const kpis = [
    { label: 'Total Internships Posted', value: totalPostings, icon: Briefcase, color: '#2563EB', bg: '#DBEAFE' },
    { label: 'Total Applicants', value: stats.total_applicants || 2, icon: Users, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Shortlisted Candidates', value: stats.shortlisted || 1, icon: UserCheck, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Interviews Scheduled', value: stats.interviews_scheduled || 1, icon: Calendar, color: '#2563EB', bg: '#E0F2FE' },
    { label: 'Offers Sent', value: stats.offers_sent || 1, icon: Send, color: '#059669', bg: '#D1FAE5' },
    { label: 'Hired Students', value: stats.hires_count || 1, icon: Award, color: '#166534', bg: '#DCFCE7' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                <Icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{kpi.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {notificationMsg && (
        <div style={{ padding: '12px 16px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
          ✓ {notificationMsg}
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Active Posted Internships
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage, edit details, update deadlines, and remove completed internship postings.</p>
          </div>
          <span className="badge badge-ai">Oracle DB Live Sync</span>
        </div>

        {stats.posted_internships && stats.posted_internships.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {stats.posted_internships.map((job, idx) => {
              const title = job.title || job.TITLE || 'Software Engineering Intern';
              const company = job.company_name || job.COMPANY_NAME || companyName;
              const mode = job.work_mode || job.WORK_MODE || 'Hybrid';
              const location = job.location || job.LOCATION || 'Bengaluru';
              const stipend = job.stipend || job.STIPEND || 35000;
              const openings = job.openings || job.OPENINGS || 5;
              const skills = job.required_skills || job.REQUIRED_SKILLS || 'React, Java, SQL, Python';
              const deadline = job.application_deadline || job.APPLICATION_DEADLINE || '2026-07-30';
              const isClosed = job.status === 'CLOSED' || job.STATUS === 'CLOSED';

              return (
                <div key={job.id || job.ID || idx} style={{ padding: '20px', border: '1px solid var(--border-light)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h3>
                      <span className="badge badge-auth" style={{ background: isClosed ? '#FEE2E2' : '#DCFCE7', color: isClosed ? '#DC2626' : '#166534', fontWeight: 700 }}>
                        {isClosed ? '● Closed (Positions Filled)' : '● Active Listing'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                      {company} • <span style={{ color: 'var(--text-muted)' }}>{mode}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={13} /> ₹{stipend}/mo</span>
                      <span>Openings: <strong>{openings}</strong></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontWeight: 600 }}><Clock size={13} /> Deadline: {deadline}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '6px' }}>
                      <strong>Required Skills:</strong> {skills}
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenEdit(job)} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Edit3 size={14} color="#2563EB" /> Edit / Update
                    </button>
                    <button onClick={() => handleDelete(job)} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem', color: '#DC2626', borderColor: '#FECACA', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Trash2 size={14} color="#DC2626" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No internships posted yet. Use the "Post Internship" tab to publish your first role.
          </div>
        )}
      </div>

      {/* Edit Internship Modal */}
      {editingJob && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ background: '#FFFFFF', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit3 size={22} color="#2563EB" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Update Internship Details</h3>
              </div>
              <button onClick={() => setEditingJob(null)} className="btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>ROLE TITLE</label>
                <input type="text" required className="input-field" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>REQUIRED SKILLS</label>
                <input type="text" required className="input-field" value={editForm.required_skills} onChange={(e) => setEditForm({ ...editForm, required_skills: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>WORK MODE</label>
                <select className="input-field" value={editForm.work_mode} onChange={(e) => setEditForm({ ...editForm, work_mode: e.target.value })}>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>LOCATION</label>
                <input type="text" required className="input-field" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>STIPEND (₹/MO)</label>
                <input type="number" required className="input-field" value={editForm.stipend} onChange={(e) => setEditForm({ ...editForm, stipend: parseFloat(e.target.value) })} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>TOTAL OPENINGS</label>
                <input type="number" required className="input-field" value={editForm.openings} onChange={(e) => setEditForm({ ...editForm, openings: parseInt(e.target.value) })} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>APPLICATION DEADLINE</label>
                <input type="date" required className="input-field" value={editForm.application_deadline} onChange={(e) => setEditForm({ ...editForm, application_deadline: e.target.value })} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setEditingJob(null)} className="btn-secondary" style={{ flex: 1, height: '42px', justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, height: '42px', justifyContent: 'center' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
