import React, { useState, useEffect } from 'react';
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
    </div>
  );
}
