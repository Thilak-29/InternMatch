import React, { useState, useEffect } from 'react';
import { Briefcase, Users, CheckCircle2, TrendingUp, Plus, Search, Edit3, Trash2, MapPin, DollarSign, Clock, AlertCircle, ArrowRight, Calendar, Tag, ShieldCheck, X } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

export default function CompanyDashboard({ currentUser, onNavigate }) {
  const companyId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;
  const token = currentUser?.token || '';
  const baseUrl = API_CONFIG.COMPANY_SERVICE_URL;

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
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [editModalJob, setEditModalJob] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editStatusMsg, setEditStatusMsg] = useState('');

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    setIsLoading(true);

    try {
      let activeJobs = [];
      const res = await fetch(`${baseUrl}/api/v1/company/${companyId}/internships`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        activeJobs = Array.isArray(data) ? data : [];
        setInternships(activeJobs);
      }

      const appRes = await fetch(`${baseUrl}/api/v1/company/${companyId}/applicants`, {
        headers: { 'Authorization': token }
      });
      if (appRes.ok) {
        const apps = await appRes.json();
        if (Array.isArray(apps)) {
          const countToUse = apps.length;
          setApplicantCount(countToUse);
          setShortlistedCount(apps.filter(a => ['SHORTLISTED', 'OFFERED', 'OFFER_ISSUED', 'ACCEPTED'].includes((a.status || a.STATUS || '').toUpperCase())).length);
        }
      }
    } catch (e) {
      console.error("Company dashboard fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditModal = (job) => {
    setEditModalJob({
      id: job.id || job.ID,
      title: job.title || job.TITLE || '',
      domain: job.domain || job.DOMAIN || 'Engineering',
      required_skills: job.required_skills || job.REQUIRED_SKILLS || job.skills_required || job.skills || '',
      work_mode: job.work_mode || job.WORK_MODE || 'Hybrid',
      location: job.location || job.LOCATION || 'Coimbatore',
      duration: job.duration || job.DURATION || '3 Months',
      stipend: job.stipend !== undefined ? job.stipend : (job.STIPEND || 0),
      openings: job.openings !== undefined ? job.openings : (job.OPENINGS || 1),
      application_deadline: job.application_deadline || job.APPLICATION_DEADLINE || job.deadline || ''
    });
    setEditStatusMsg('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModalJob) return;

    setIsSavingEdit(true);
    setEditStatusMsg('Saving changes...');

    try {
      const res = await fetch(`${baseUrl}/api/v1/company/internships/${editModalJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(editModalJob)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && (data?.success || data?.status === 'success' || res.status === 200)) {
        setEditStatusMsg('✓ Internship updated successfully!');
        setTimeout(() => {
          setEditModalJob(null);
          fetchCompanyData();
        }, 1200);
      } else {
        setEditStatusMsg('❌ ' + (data?.error || data?.message || 'Failed to update internship.'));
      }
    } catch (err) {
      setEditStatusMsg('❌ Connection error updating internship.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteInternship = async (job) => {
    const jobId = job.id || job.ID;
    const jobTitle = job.title || job.TITLE || 'this internship';
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action will remove the listing across all portals.`)) {
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/v1/company/internships/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });

      if (res.ok) {
        alert(`✓ Internship "${jobTitle}" deleted successfully.`);
        fetchCompanyData();
      } else {
        alert('❌ Failed to delete internship.');
      }
    } catch (err) {
      alert('❌ Connection error deleting internship.');
    }
  };

  const verificationStatus = (currentUser?.verification_status || currentUser?.verificationStatus || 'APPROVED').toUpperCase();
  const rejectionReason = currentUser?.rejection_reason || currentUser?.rejectionReason || '';

  if (verificationStatus === 'PENDING_ADMIN_REVIEW' || verificationStatus === 'PENDING_VERIFICATION') {
    return (
      <div style={{ maxWidth: '800px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '36px', background: '#FFFFFF', borderLeft: '6px solid #D97706', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706', letterSpacing: '1px', textTransform: 'uppercase' }}>
                STATUS: PENDING REVIEW
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                Recruiter Verification Pending
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#475569', marginTop: '8px', lineHeight: 1.6 }}>
                Your company and recruiter information has been submitted for verification.
                You will be able to access the recruiter dashboard after your account is approved by an administrator.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700 }}>RECRUITER NAME</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {currentUser?.recruiter_name || currentUser?.name || 'Recruiter Candidate'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700 }}>COMPANY NAME</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {currentUser?.company_name || currentUser?.username || 'Corporate Partner'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700 }}>OFFICIAL EMAIL</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {currentUser?.email || 'email@company.com'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700 }}>EMAIL STATUS</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> ✓ Verified Mailbox
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'REJECTED') {
    return (
      <div style={{ maxWidth: '800px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '36px', background: '#FFFFFF', borderLeft: '6px solid #DC2626', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', letterSpacing: '1px', textTransform: 'uppercase' }}>
                STATUS: REJECTED
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                Recruiter Verification Rejected
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#475569', marginTop: '8px', lineHeight: 1.6 }}>
                Your recruiter account could not be verified by our administrative team.
              </p>
              {rejectionReason && (
                <div style={{ marginTop: '14px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.85rem', fontWeight: 600 }}>
                  <strong>Reason:</strong> {rejectionReason}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'SUSPENDED') {
    return (
      <div style={{ maxWidth: '800px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '36px', background: '#FFFFFF', borderLeft: '6px solid #DC2626' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', letterSpacing: '1px', textTransform: 'uppercase' }}>
                STATUS: SUSPENDED
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                Recruiter Account Suspended
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#475569', marginTop: '8px', lineHeight: 1.6 }}>
                Your recruiter account has been suspended by an administrator. Recruiter dashboard access and job posting features are disabled.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading recruiter dashboard...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '28px', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {currentUser?.name || 'Recruiter Portal'}
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#DCFCE7', color: '#166534', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> ✓ Verified Recruiter
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px' }}>
            Manage active internship listings, evaluate applicants, and generate screening tests.
          </p>
        </div>

        <button
          onClick={() => onNavigate('post')}
          className="btn-primary"
          style={{ padding: '10px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Post New Internship
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #2563EB' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>ACTIVE LISTINGS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{internships.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '4px', fontWeight: 600 }}>Posted Jobs</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #D97706' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>TOTAL APPLICANTS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706' }}>{applicantCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '4px', fontWeight: 600 }}>Candidate Applications</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>SHORTLISTED CANDIDATES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>{shortlistedCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px', fontWeight: 600 }}>Qualified for Interview</div>
        </div>
      </div>

      {/* Posted / Active Internships List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Posted / Active Internships ({internships.length})
          </h3>
          <button onClick={() => onNavigate('applicants')} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            Review Applicants
          </button>
        </div>

        {internships.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {internships.map((job, idx) => {
              const title = job.title || job.TITLE || 'Internship Role';
              const companyName = job.company_name || job.COMPANY_NAME || currentUser?.name || 'Company Partner';
              const domain = job.domain || job.DOMAIN || 'Engineering';
              const rawSkills = job.required_skills || job.REQUIRED_SKILLS || job.skills_required || job.skills || '';
              const skillList = typeof rawSkills === 'string'
                ? rawSkills.split(',').map(s => s.trim()).filter(Boolean)
                : (Array.isArray(rawSkills) ? rawSkills : []);
              const location = job.location || job.LOCATION || 'Not Specified';
              const workMode = job.work_mode || job.WORK_MODE || 'Hybrid';
              const duration = job.duration || job.DURATION || 'Not Specified';
              const startDate = job.start_date || job.START_DATE || '';
              const endDate = job.end_date || job.END_DATE || '';
              const stipendNum = job.stipend !== undefined ? job.stipend : (job.STIPEND !== undefined ? job.STIPEND : 0);
              const stipendFormatted = typeof stipendNum === 'number' ? `₹${stipendNum.toLocaleString()}/month` : `₹${stipendNum}`;
              const openings = job.openings !== undefined ? job.openings : (job.OPENINGS !== undefined ? job.OPENINGS : 1);
              const deadline = job.application_deadline || job.APPLICATION_DEADLINE || job.deadline || '';
              const status = (job.status || job.STATUS || 'ACTIVE').toUpperCase();

              return (
                <div key={idx} style={{ padding: '20px', border: '1px solid var(--border-light)', borderRadius: '12px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  {/* Title & Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>
                        {title}
                      </h4>
                      <div style={{ fontSize: '0.88rem', color: '#2563EB', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{companyName}</span>
                        {domain && (
                          <span style={{ fontSize: '0.75rem', background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                            {domain}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-auth" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                        {workMode}
                      </span>
                      <span style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, background: status === 'ACTIVE' ? '#DCFCE7' : '#F1F5F9', color: status === 'ACTIVE' ? '#166534' : '#64748B' }}>
                        {status}
                      </span>

                      {/* Recruiter Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(job)}
                        title="Edit Internship Details"
                        style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>

                      {/* Recruiter Delete Button */}
                      <button
                        onClick={() => handleDeleteInternship(job)}
                        title="Delete Internship Listing"
                        style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Skills Pills */}
                  {skillList.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {skillList.map((skill, sIdx) => (
                        <span key={sIdx} style={{ fontSize: '0.75rem', fontWeight: 600, background: '#F1F5F9', color: '#334155', padding: '3px 10px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Detailed Metadata Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted)', background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px' }}>
                    <div>📍 <strong>Location:</strong> {location}</div>
                    <div>🏢 <strong>Work Mode:</strong> {workMode}</div>
                    <div>⏱️ <strong>Duration:</strong> {duration}</div>
                    <div>💰 <strong>Stipend:</strong> {stipendFormatted}</div>
                    <div>👥 <strong>Openings:</strong> {openings}</div>
                    {deadline && <div>⏳ <strong>Deadline:</strong> {deadline}</div>}
                    {startDate && <div>📅 <strong>Start Date:</strong> {startDate}</div>}
                    {endDate && <div>🏁 <strong>End Date:</strong> {endDate}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No internship listings posted yet. Click 'Post New Internship' to create your first listing.
          </div>
        )}
      </div>

      {/* Recruiter Edit Internship Modal */}
      {editModalJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="glass-card" style={{ background: '#FFFFFF', width: '100%', maxWidth: '580px', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Edit Internship Listing
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Update job details for candidate explore portal
                  </p>
                </div>
              </div>
              <button onClick={() => setEditModalJob(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Role Title</label>
                <input
                  type="text"
                  className="input-field"
                  value={editModalJob.title}
                  onChange={(e) => setEditModalJob({ ...editModalJob, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Domain / Field</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editModalJob.domain}
                    onChange={(e) => setEditModalJob({ ...editModalJob, domain: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Work Mode</label>
                  <select
                    className="input-field"
                    value={editModalJob.work_mode}
                    onChange={(e) => setEditModalJob({ ...editModalJob, work_mode: e.target.value })}
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Required Skills (comma separated)</label>
                <input
                  type="text"
                  className="input-field"
                  value={editModalJob.required_skills}
                  onChange={(e) => setEditModalJob({ ...editModalJob, required_skills: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Location</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editModalJob.location}
                    onChange={(e) => setEditModalJob({ ...editModalJob, location: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Duration</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editModalJob.duration}
                    onChange={(e) => setEditModalJob({ ...editModalJob, duration: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Stipend (₹/month)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editModalJob.stipend}
                    onChange={(e) => setEditModalJob({ ...editModalJob, stipend: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Openings</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editModalJob.openings}
                    onChange={(e) => setEditModalJob({ ...editModalJob, openings: Number(e.target.value) })}
                  />
                </div>
              </div>

              {editStatusMsg && (
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: editStatusMsg.includes('✓') ? '#059669' : '#DC2626', textAlign: 'center', padding: '6px' }}>
                  {editStatusMsg}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditModalJob(null)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
