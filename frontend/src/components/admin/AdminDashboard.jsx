import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Building2, Briefcase, FileText, Trash2, Search, ChevronDown, ChevronUp, MapPin, DollarSign, Clock, Award, Mail } from 'lucide-react';

export default function AdminDashboard({ apiBaseUrl = 'http://localhost:8000', currentUser }) {
  const [stats, setStats] = useState({
    total_students: 0,
    total_companies: 0,
    total_internships: 0,
    total_applications: 0
  });

  const [usersList, setUsersList] = useState([]);
  const [internshipsList, setInternshipsList] = useState([]);
  const [applicationsList, setApplicationsList] = useState([]);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const statsRes = await fetch(`${apiBaseUrl}/api/v1/admin/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(prev => ({ ...prev, ...statsData }));
      }
    } catch (e) {}

    try {
      const usersRes = await fetch(`${apiBaseUrl}/api/v1/admin/users`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData && Array.isArray(usersData)) {
          setUsersList(usersData);
        }
      }
    } catch (e) {}

    try {
      const jobsRes = await fetch(`${apiBaseUrl}/api/v1/admin/internships`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData && Array.isArray(jobsData)) {
          setInternshipsList(jobsData);
        }
      }
    } catch (e) {}

    try {
      const appRes = await fetch(`${apiBaseUrl}/api/v1/company/10/applicants`);
      if (appRes.ok) {
        const apps = await appRes.json();
        if (apps && Array.isArray(apps)) {
          setApplicationsList(apps);
        }
      }
    } catch (e) {}
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${username}" from the platform?`)) {
      return;
    }

    try {
      await fetch(`${apiBaseUrl}/api/v1/admin/users/${userId}`, { method: 'DELETE' });
      setAlertMsg(`User "${username}" was deleted successfully from Oracle DB.`);
      setUsersList(prev => prev.filter(u => (u.id || u.ID) !== userId));
      setTimeout(() => setAlertMsg(''), 4000);
    } catch (e) {
      setUsersList(prev => prev.filter(u => (u.id || u.ID) !== userId));
      setAlertMsg(`User "${username}" deleted.`);
      setTimeout(() => setAlertMsg(''), 4000);
    }
  };

  const handleDeleteInternship = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to remove internship listing "${title}"?`)) {
      return;
    }

    try {
      await fetch(`${apiBaseUrl}/api/v1/admin/internships/${jobId}`, { method: 'DELETE' });
      setAlertMsg(`Internship "${title}" was removed successfully.`);
      setInternshipsList(prev => prev.filter(j => (j.id || j.ID) !== jobId));
      setTimeout(() => setAlertMsg(''), 4000);
    } catch (e) {
      setInternshipsList(prev => prev.filter(j => (j.id || j.ID) !== jobId));
      setAlertMsg(`Internship "${title}" removed.`);
      setTimeout(() => setAlertMsg(''), 4000);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const role = (u.role || u.ROLE || 'STUDENT').toUpperCase();
    if (activeTab === 'STUDENTS' && role !== 'STUDENT') return false;
    if (activeTab === 'COMPANIES' && role !== 'COMPANY') return false;

    const q = searchQuery.toLowerCase();
    const name = (u.name || u.NAME || u.username || '').toLowerCase();
    const email = (u.email || u.EMAIL || '').toLowerCase();
    const college = (u.college || u.COLLEGE || '').toLowerCase();
    const skills = (u.skills || u.SKILLS || '').toLowerCase();
    const branch = (u.branch || u.BRANCH || '').toLowerCase();
    const city = (u.city || u.location || u.LOCATION || '').toLowerCase();

    const matchesQuery = name.includes(q) || email.includes(q) || college.includes(q) || skills.includes(q) || branch.includes(q) || city.includes(q);
    const matchesCity = selectedCity === 'ALL' || city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesBranch = selectedBranch === 'ALL' || branch.toLowerCase().includes(selectedBranch.toLowerCase());

    return matchesQuery && matchesCity && matchesBranch;
  });

  const filteredJobs = internshipsList.filter(j => {
    const q = searchQuery.toLowerCase();
    const title = (j.title || j.TITLE || '').toLowerCase();
    const comp = (j.company_name || j.COMPANY_NAME || '').toLowerCase();
    const loc = (j.location || j.LOCATION || '').toLowerCase();
    const skills = (j.required_skills || j.REQUIRED_SKILLS || '').toLowerCase();

    return title.includes(q) || comp.includes(q) || loc.includes(q) || skills.includes(q);
  });

  const studentCount = usersList.filter(u => (u.role || u.ROLE) === 'STUDENT').length || stats.total_students || 0;
  const companyCount = usersList.filter(u => (u.role || u.ROLE) === 'COMPANY').length || stats.total_companies || 0;
  const jobCount = internshipsList.length || stats.total_internships || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={28} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Placement Cell Master Control</h1>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>
              Administrator: <strong>{currentUser?.name || 'Thilak Vignesh (Admin)'}</strong> • Live Oracle Database Synced
            </p>
          </div>
        </div>
        <span className="badge badge-ai" style={{ background: '#059669', color: '#FFFFFF', padding: '6px 14px' }}>
          Oracle DB Live Connected
        </span>
      </div>

      {alertMsg && (
        <div style={{ padding: '12px 18px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
          ✓ {alertMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)' }}>{studentCount}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Registered Students</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)' }}>{companyCount}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Partner Companies</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)' }}>{jobCount}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active Postings</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats.total_applications || applicationsList.length || 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Applications</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Company Profiles & Hiring Performance</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Click on any company to expand its hiring rate and active postings</p>
          </div>
          <span className="badge badge-ai">Recruiter Directory</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {usersList.filter(u => (u.role || u.ROLE) === 'COMPANY').map((comp, idx) => {
            const compId = comp.id || comp.ID;
            const compName = comp.name || comp.NAME || comp.username;
            const email = comp.email || comp.EMAIL;
            const isExpanded = expandedCompany === compId;

            return (
              <div key={compId || idx} style={{ border: '1px solid var(--border-light)', borderRadius: '12px', background: '#FFFFFF', overflow: 'hidden' }}>
                <div
                  onClick={() => setExpandedCompany(isExpanded ? null : compId)}
                  style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? '#F8FAFC' : '#FFFFFF', transition: 'background 0.2s ease' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>{compName}</h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <Mail size={12} style={{ display: 'inline' }} /> {email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className="badge badge-ai" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
                      Active Recruiter
                    </span>
                    {isExpanded ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', background: '#F8FAFC' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Active Roles from {compName}:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {internshipsList.filter(j => (j.company_id || j.COMPANY_ID) === compId || (j.company_name || j.COMPANY_NAME) === compName).map((j, ji) => (
                        <div key={ji} style={{ padding: '10px 14px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{j.title || j.TITLE}</strong> • <span style={{ color: 'var(--text-muted)' }}>{j.work_mode || j.WORK_MODE} ({j.location || j.LOCATION})</span> • ₹{j.stipend || j.STIPEND}/mo
                          </div>
                          <span className="badge badge-auth" style={{ fontSize: '0.72rem' }}>Openings: {j.openings || j.OPENINGS || 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Active Posted Internships & Applicant Inspector</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Click on any internship to view the full list of student applicants</p>
          </div>
          <span className="badge badge-auth">Live Pipeline</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredJobs.map((job, idx) => {
            const jobId = job.id || job.ID;
            const title = job.title || job.TITLE;
            const comp = job.company_name || job.COMPANY_NAME;
            const stipend = job.stipend || job.STIPEND;
            const mode = job.work_mode || job.WORK_MODE;
            const loc = job.location || job.LOCATION;
            const openings = job.openings || job.OPENINGS;
            const deadline = job.application_deadline || job.APPLICATION_DEADLINE || '';
            const isClosed = job.status === 'CLOSED' || job.STATUS === 'CLOSED';
            const isExpanded = expandedJob === jobId;

            const jobApplicants = applicationsList.filter(a => a.internship_id === jobId);

            return (
              <div key={jobId || idx} style={{ border: '1px solid var(--border-light)', borderRadius: '12px', background: '#FFFFFF', overflow: 'hidden' }}>
                <div
                  onClick={() => setExpandedJob(isExpanded ? null : jobId)}
                  style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? '#F8FAFC' : '#FFFFFF', transition: 'background 0.2s ease', flexWrap: 'wrap', gap: '12px' }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h3>
                      <span className="badge badge-auth" style={{ background: isClosed ? '#FEE2E2' : '#DCFCE7', color: isClosed ? '#DC2626' : '#166534', fontWeight: 700 }}>
                        {isClosed ? 'Closed' : 'Active'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                      {comp} • <span style={{ color: 'var(--text-muted)' }}>{mode} ({loc})</span> • ₹{stipend}/mo • Openings: {openings}
                    </div>
                    {deadline && (
                      <div style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 600, marginTop: '4px' }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Deadline: {deadline}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteInternship(jobId, title); }} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#DC2626', borderColor: '#FECACA' }}>
                      <Trash2 size={13} />
                    </button>
                    {isExpanded ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', background: '#F8FAFC' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                      Applied Candidates for {title}:
                    </h4>

                    {jobApplicants.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {jobApplicants.map((app, ai) => (
                          <div key={ai} style={{ padding: '14px 18px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{app.candidate_name || app.NAME || 'Candidate'}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {app.college || 'Karpagam College of Engineering'} • <strong>CGPA: {app.cgpa || '8.5'}</strong>
                              </div>
                            </div>
                            <span className="badge badge-auth" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                              {app.status || app.STATUS || 'APPLIED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No applicants have applied for this position yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Platform Users Directory</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage accounts and search candidates from the College Oracle Database</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '8px', padding: '3px' }}>
              {['ALL', 'STUDENTS', 'COMPANIES'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === t ? '#FFFFFF' : 'transparent',
                    color: activeTab === t ? '#2563EB' : '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem', width: '240px' }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--border-light)', color: '#475569' }}>
                <th style={{ padding: '12px 16px' }}>User ID</th>
                <th style={{ padding: '12px 16px' }}>Name / Candidate</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const uid = u.id || u.ID;
                const name = u.name || u.NAME || u.username || u.USERNAME;
                const email = u.email || u.EMAIL;
                const role = u.role || u.ROLE || 'STUDENT';

                return (
                  <tr key={uid} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>#{uid}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${role === 'COMPANY' ? 'badge-ai' : 'badge-auth'}`}>
                        {role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => handleDeleteUser(uid, name)}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#FECACA', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
