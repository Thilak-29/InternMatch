import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { ShieldCheck, Users, Building2, Briefcase, FileText, Trash2, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

export default function AdminDashboard({ apiBaseUrl = 'http://localhost:8000', currentUser }) {
  const [stats, setStats] = useState({
    total_students: 0,
    total_companies: 0,
    total_internships: 0,
    total_applications: 0
  });

  const [usersList, setUsersList] = useState([]);
  const [internshipsList, setInternshipsList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const statsRes = await fetch(`${apiBaseUrl}/api/v1/admin/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const usersRes = await fetch(`${apiBaseUrl}/api/v1/admin/users`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData);
      }

      const jobsRes = await fetch(`${apiBaseUrl}/api/v1/admin/internships`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setInternshipsList(jobsData);
      }
    } catch (e) {}
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${username}" from the platform?`)) {
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setAlertMsg(`User "${username}" was deleted successfully from Oracle DB.`);
        fetchAdminData();
        setTimeout(() => setAlertMsg(''), 4000);
      }
    } catch (e) {}
  };

  const handleDeleteInternship = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to remove internship listing "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/admin/internships/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        setAlertMsg(`Internship "${title}" was removed successfully.`);
        fetchAdminData();
        setTimeout(() => setAlertMsg(''), 4000);
      }
    } catch (e) {}
  };

  const filteredUsers = usersList.filter(u => {
    const q = userSearch.toLowerCase();
    const uname = (u.username || u.USERNAME || '').toLowerCase();
    const name = (u.name || u.NAME || '').toLowerCase();
    const email = (u.email || u.EMAIL || '').toLowerCase();
    const role = (u.role || u.ROLE || '').toLowerCase();
    return uname.includes(q) || name.includes(q) || email.includes(q) || role.includes(q);
  });

  const filteredJobs = internshipsList.filter(j => {
    const q = jobSearch.toLowerCase();
    const title = (j.title || j.TITLE || '').toLowerCase();
    const comp = (j.company_name || j.COMPANY_NAME || '').toLowerCase();
    const loc = (j.location || j.LOCATION || '').toLowerCase();
    return title.includes(q) || comp.includes(q) || loc.includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={28} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Master Administrator Control Panel</h1>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>Logged in as <strong>{currentUser?.name || 'Thilak Vignesh (Admin)'}</strong> • System privileges active</p>
          </div>
        </div>
        <span className="badge badge-ai" style={{ background: '#059669', color: '#FFFFFF', padding: '6px 14px' }}>Live Oracle DB Connected</span>
      </div>

      {alertMsg && (
        <div style={{ padding: '12px 18px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
          ✓ {alertMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        <div className="glass-card" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats.total_students || 0}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered Students</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats.total_companies || 0}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered Companies</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats.total_internships || 0}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Posted Internships</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats.total_applications || 0}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Applications Submitted</div>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Platform Users Management</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Privilege to remove misbehaving student or company accounts</p>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search user by name, email, role..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem', width: '280px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--border-light)', color: '#475569' }}>
                <th style={{ padding: '12px 16px' }}>User ID</th>
                <th style={{ padding: '12px 16px' }}>Name / Company</th>
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
                        style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                        title="Delete User"
                      >
                        <Trash2 size={13} style={{ display: 'inline', marginRight: '4px' }} /> Delete User
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Internship Management Section */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Company Posted Internships Management</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Privilege to remove spam or non-compliant internship roles</p>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search internship by title, company..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem', width: '280px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--border-light)', color: '#475569' }}>
                <th style={{ padding: '12px 16px' }}>Role Title</th>
                <th style={{ padding: '12px 16px' }}>Company</th>
                <th style={{ padding: '12px 16px' }}>Location</th>
                <th style={{ padding: '12px 16px' }}>Stipend</th>
                <th style={{ padding: '12px 16px' }}>Openings</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((j) => {
                const jid = j.id || j.ID;
                const title = j.title || j.TITLE;
                const comp = j.company_name || j.COMPANY_NAME;
                const loc = j.location || j.LOCATION;
                const stipend = j.stipend || j.STIPEND || 25000;
                const openings = j.openings || j.OPENINGS || 5;

                return (
                  <tr key={jid} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{title}</td>
                    <td style={{ padding: '12px 16px', color: '#2563EB', fontWeight: 600 }}>{comp}</td>
                    <td style={{ padding: '12px 16px' }}>{loc}</td>
                    <td style={{ padding: '12px 16px' }}>₹{stipend}/mo</td>
                    <td style={{ padding: '12px 16px' }}>{openings} Openings</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => handleDeleteInternship(jid, title)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                        title="Delete Internship"
                      >
                        <Trash2 size={13} style={{ display: 'inline', marginRight: '4px' }} /> Remove Listing
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
=======
import { Shield, TrendingUp, Building2, Users, Search, X } from 'lucide-react';

export default function AdminDashboard({ apiBaseUrl, currentUser }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('1m');
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdminReports(timeframe);
  }, [timeframe]);

  useEffect(() => {
    if (activeTab === 'companies') fetchCompaniesDirectory();
    else if (activeTab === 'students') fetchStudentsDirectory();
  }, [activeTab]);

  const fetchAdminReports = async (selectedTimeframe) => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/v1/analytics/admin-reports?timeframe=${selectedTimeframe}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompaniesDirectory = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/admin/companies`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error('Error fetching admin companies:', err);
    }
  };

  const fetchStudentsDirectory = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/admin/students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching admin students:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', paddingTop: 'var(--space-24)' }}>
      {/* ADMIN HERO BANNER */}
      <div className="neo-card" style={{ padding: 'var(--space-32)', background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', color: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge badge-verified" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)', marginBottom: '8px' }}>
              <Shield size={14} /> National PM Scheme Admin Console
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF' }}>
              InterSearch Platform Overview & Governance
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', marginTop: '4px' }}>
              Super Admin: <strong>{currentUser.name}</strong> • Real-Time MySQL Analytics & Compliance Tracking
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'} style={{ background: activeTab === 'overview' ? '#FFFFFF' : 'transparent', color: activeTab === 'overview' ? 'var(--color-primary)' : '#FFFFFF' }}>
              Overview
            </button>
            <button onClick={() => setActiveTab('companies')} className={activeTab === 'companies' ? 'btn-primary' : 'btn-secondary'} style={{ background: activeTab === 'companies' ? '#FFFFFF' : 'transparent', color: activeTab === 'companies' ? 'var(--color-primary)' : '#FFFFFF' }}>
              Companies
            </button>
            <button onClick={() => setActiveTab('students')} className={activeTab === 'students' ? 'btn-primary' : 'btn-secondary'} style={{ background: activeTab === 'students' ? '#FFFFFF' : 'transparent', color: activeTab === 'students' ? 'var(--color-primary)' : '#FFFFFF' }}>
              Students
            </button>
          </div>
        </div>
      </div>

      {/* OVERVIEW STATS GRID */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-20)' }}>
          <div className="neo-card" style={{ padding: 'var(--space-24)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>REGISTERED CANDIDATES</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '8px' }}>6</div>
            <span className="badge badge-verified" style={{ marginTop: '8px' }}>+100% Growth</span>
          </div>

          <div className="neo-card" style={{ padding: 'var(--space-24)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE POSITIONS</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-secondary)', marginTop: '8px' }}>11</div>
            <span className="badge badge-ai" style={{ marginTop: '8px' }}>100% Verified</span>
          </div>

          <div className="neo-card" style={{ padding: 'var(--space-24)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>PLACEMENT RATE</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '8px' }}>94.2%</div>
            <span className="badge badge-verified" style={{ marginTop: '8px' }}>Target Achieved</span>
          </div>

          <div className="neo-card" style={{ padding: 'var(--space-24)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVERAGE MATCH SCORE</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '8px' }}>91.5%</div>
            <span className="badge badge-premium" style={{ marginTop: '8px' }}>Explainable AI</span>
          </div>
        </div>
      )}

      {/* DIRECTORY TABLES */}
      {activeTab === 'companies' && (
        <div className="neo-card">
          <div className="neo-card-header">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Registered Employer Directory</h2>
          </div>
          <div className="neo-card-body">
            {companies.map((c) => (
              <div key={c.id} style={{ padding: 'var(--space-16)', background: 'var(--bg-secondary-surface)', borderRadius: '14px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.company_name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>HQ: {c.headquarters} • Industry: {c.industry}</div>
                </div>
                <span className="badge badge-verified">Verified Employer</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="neo-card">
          <div className="neo-card-header">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Registered Candidate Directory</h2>
          </div>
          <div className="neo-card-body">
            {students.map((s) => (
              <div key={s.id} style={{ padding: 'var(--space-16)', background: 'var(--bg-secondary-surface)', borderRadius: '14px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.college} • {s.branch} • CGPA: {s.cgpa}</div>
                </div>
                <span className="badge badge-ai">GitHub: @{s.github || "vignesh"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
>>>>>>> 26c430b2b8530a875a41bfc9a9c1514a365a9811
    </div>
  );
}
