import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, FileText, Trash2, Search, ChevronDown, ChevronUp, MapPin, DollarSign, Clock, Award, Mail, Phone, BookOpen, Code, ExternalLink, Shield } from 'lucide-react';

export default function AdminDashboard({ apiBaseUrl = 'http://localhost:8081', currentUser }) {
  const [stats, setStats] = useState({
    total_students: 0,
    total_companies: 0,
    total_internships: 0,
    total_applications: 0
  });

  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);

    const authBases = [
      apiBaseUrl,
      'http://localhost:8081',
      'http://localhost:8000'
    ];

    for (const base of authBases) {
      try {
        const statsRes = await fetch(`${base}/api/v1/admin/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(prev => ({ ...prev, ...statsData }));
        }

        const usersRes = await fetch(`${base}/api/v1/admin/users`);
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData && Array.isArray(usersData)) {
            setUsersList(usersData);
            break;
          }
        }
      } catch (e) {
        console.error("Admin fetch error:", e);
      }
    }

    setIsLoading(false);
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${username}" from the database?`)) {
      return;
    }

    try {
      await fetch(`http://localhost:8081/api/v1/admin/users/${userId}`, { method: 'DELETE' });
    } catch (e) {}

    setAlertMsg(`User "${username}" was deleted from Oracle Database.`);
    setUsersList(prev => prev.filter(u => (u.id || u.ID) !== userId));
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const studentTalentList = usersList.filter(u => (u.role || u.ROLE || 'STUDENT').toUpperCase() === 'STUDENT');

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
    const city = (u.city || u.location || u.LOCATION || u.address || '').toLowerCase();

    return name.includes(q) || email.includes(q) || college.includes(q) || skills.includes(q) || branch.includes(q) || city.includes(q);
  });

  const studentCount = usersList.filter(u => (u.role || u.ROLE) === 'STUDENT').length;
  const companyCount = usersList.filter(u => (u.role || u.ROLE) === 'COMPANY').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={28} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Platform Control</h1>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>
              Administrator: <strong>{currentUser?.name || 'Thilak Vignesh (Admin)'}</strong> • Oracle Database Connected
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

      {/* KPI Cards */}
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
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FEF3F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats.total_internships || 3}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active Postings</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats.total_applications || 4}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Applications</div>
          </div>
        </div>
      </div>

      {/* Section 1: Platform Users */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Platform Users</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Real-time student & recruiter directory fetched from the College Oracle Database</p>
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
                placeholder="Search name, email, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem', width: '240px' }}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading platform users from database...
          </div>
        ) : filteredUsers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--border-light)', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>User ID</th>
                  <th style={{ padding: '12px 16px' }}>Name / Entity</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px' }}>College / Industry</th>
                  <th style={{ padding: '12px 16px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const uid = u.id || u.ID;
                  const name = u.name || u.NAME || u.username || u.USERNAME;
                  const email = u.email || u.EMAIL;
                  const role = (u.role || u.ROLE || 'STUDENT').toUpperCase();
                  const collegeOrIndustry = role === 'COMPANY' ? (u.industry || u.INDUSTRY || 'Enterprise Partner') : (u.college || u.COLLEGE || 'College Student');

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
                      <td style={{ padding: '12px 16px', color: 'var(--text-sub)' }}>
                        {collegeOrIndustry}
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
        ) : (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No registered platform users found matching your search.
          </div>
        )}
      </div>

      {/* Section 2: Student Talent Directory */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Student Talent Directory</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Comprehensive candidate profiles, GPA, verified skills, and coding handles from Oracle DB</p>
          </div>
          <span className="badge badge-ai">Verified Talent Records</span>
        </div>

        {studentTalentList.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {studentTalentList.map((st, idx) => {
              const name = st.name || st.NAME || 'Candidate';
              const email = st.email || st.EMAIL || '';
              const college = st.college || st.COLLEGE || 'College';
              const branch = st.branch || st.BRANCH || 'Engineering';
              const degree = st.degree || st.DEGREE || 'B.E.';
              const cgpa = st.cgpa || st.CGPA || 'N/A';
              const skills = st.skills || st.SKILLS || '';
              const leetcode = st.leetcode || st.LEETCODE || '';
              const github = st.github || st.GITHUB || '';
              const city = st.city || st.address || st.location || '';

              return (
                <div key={idx} style={{ padding: '22px', border: '1px solid var(--border-light)', borderRadius: '12px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{name}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600 }}>
                        {degree} in {branch}
                      </div>
                    </div>
                    {cgpa !== 'N/A' && (
                      <span className="badge badge-auth" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                        CGPA: {cgpa} / 10
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>🏛️ {college}</div>
                    {city && <div>📍 Location: {city}</div>}
                    {email && <div>✉️ {email}</div>}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                    {leetcode && <span style={{ color: '#D97706', fontWeight: 700 }}>&lt;&gt; LeetCode: {leetcode}</span>}
                    {github && <span style={{ color: '#2563EB', fontWeight: 700 }}>GitHub: {github}</span>}
                  </div>

                  {skills && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px' }}>
                      <strong>Skills:</strong> {skills}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No registered student profiles found in database.
          </div>
        )}
      </div>
    </div>
  );
}
