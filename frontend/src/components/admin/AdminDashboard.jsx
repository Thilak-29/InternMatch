import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, FileText, Trash2, Edit3, X, Search, MapPin, DollarSign, Clock, Award, Mail, Phone, BookOpen, Code, ExternalLink, Shield, ShieldCheck, TrendingUp, Filter, GraduationCap, Map, BarChart3, ChevronDown, CheckCircle2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

export default function AdminDashboard({ currentUser, activeSection = 'dashboard', onNavigate }) {
  const token = currentUser?.token || '';
  const authBaseUrl = API_CONFIG.AUTH_SERVICE_URL;
  const companyBaseUrl = API_CONFIG.COMPANY_SERVICE_URL;

  const [stats, setStats] = useState({
    total_students: 0,
    total_companies: 0,
    total_internships: 0,
    total_applications: 0
  });

  // Platform Growth chart state
  const [growthData, setGrowthData] = useState([]);
  const [growthLoading, setGrowthLoading] = useState(true);
  const [growthError, setGrowthError] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [internshipsList, setInternshipsList] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'STUDENTS') return 'STUDENTS';
    if (roleParam === 'COMPANIES') return 'COMPANIES';
    return 'ALL';
  });

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setCurrentUserPage(1);
    const params = new URLSearchParams(window.location.search);
    if (tabName === 'ALL') {
      params.delete('role');
    } else {
      params.set('role', tabName);
    }
    const newSearch = params.toString();
    const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
    window.history.replaceState({}, '', newPath);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [editModalJob, setEditModalJob] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editStatusMsg, setEditStatusMsg] = useState('');

  // Pagination for Platform Users Directory (10 per page)
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const usersPerPage = 10;

  // Demand Analytics Filters
  const [demandDomainFilter, setDemandDomainFilter] = useState('ALL');
  const [demandSortOrder, setDemandSortOrder] = useState('HIGH_TO_LOW');

  // Recruiter Verification States
  const [recruitersList, setRecruitersList] = useState([]);
  const [recruiterFilter, setRecruiterFilter] = useState('ALL');
  const [recruiterSearch, setRecruiterSearch] = useState('');
  const [selectedRecruiterModal, setSelectedRecruiterModal] = useState(null);
  const [rejectModalRecruiter, setRejectModalRecruiter] = useState(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // In-App Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete Permanently',
    onConfirm: null,
    isDanger: true
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyRecruiter = async (userId, status, reason = '') => {
    try {
      const res = await fetch(`${authBaseUrl}/api/v1/admin/recruiters/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ status, rejection_reason: reason })
      });
      if (res.ok) {
        setAlertMsg(`✓ Recruiter status updated to ${status}.`);
        setRejectModalRecruiter(null);
        setRejectReasonInput('');
        fetchAdminData();
      } else {
        setAlertMsg('❌ Failed to update recruiter status.');
      }
    } catch (e) {
      setAlertMsg('❌ Error updating recruiter status.');
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
      const res = await fetch(`${companyBaseUrl}/api/v1/company/internships/${editModalJob.id}`, {
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
          fetchAdminData();
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

  const handleDeleteInternship = (job) => {
    const jobId = job.id || job.ID;
    const jobTitle = job.title || job.TITLE || 'this internship';
    
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Internship Purge',
      message: `Are you sure you want to permanently delete "${jobTitle}"? This will purge the listing across all student and corporate portals.`,
      confirmText: 'Purge Listing',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`${companyBaseUrl}/api/v1/company/internships/${jobId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
          });

          if (res.ok) {
            setAlertMsg(`✓ Internship "${jobTitle}" deleted successfully.`);
            fetchAdminData();
          } else {
            setAlertMsg('❌ Failed to delete internship.');
          }
        } catch (err) {
          setAlertMsg('❌ Connection error deleting internship.');
        } finally {
          setTimeout(() => setAlertMsg(''), 4000);
        }
      }
    });
  };

  const handleDeleteUser = (userId, username) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Permanent User Deletion',
      message: `Are you sure you want to permanently delete user "${username}" from the database? This action cannot be undone.`,
      confirmText: 'Delete User',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`${authBaseUrl}/api/v1/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
          });
          if (res.ok) {
            setAlertMsg(`✓ User "${username}" deleted from Oracle Database.`);
            setUsersList(prev => prev.filter(u => u.id !== userId));
          } else {
            setAlertMsg(`❌ Failed to delete user "${username}".`);
          }
        } catch (e) {
          setAlertMsg(`❌ Error deleting user.`);
        } finally {
          setTimeout(() => setAlertMsg(''), 4000);
        }
      }
    });
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch(`${authBaseUrl}/api/v1/admin/stats`, {
        headers: { 'Authorization': token }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch All Platform Users
      const usersRes = await fetch(`${authBaseUrl}/api/v1/admin/users`, {
        headers: { 'Authorization': token }
      });
      let fetchedUsers = [];
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (Array.isArray(usersData)) {
          fetchedUsers = usersData;
        }
      }

      // Normalize users
      setUsersList(fetchedUsers.map(u => normalizeUser(u)));

      // 3. Fetch Recruiters for Verification Audit
      try {
        const recruitersRes = await fetch(`${authBaseUrl}/api/v1/admin/recruiters`, {
          headers: { 'Authorization': token }
        });
        if (recruitersRes.ok) {
          const recruitersData = await recruitersRes.json();
          if (Array.isArray(recruitersData)) {
            setRecruitersList(recruitersData);
          }
        }
      } catch (err) {
        console.warn("Could not fetch recruiters list:", err);
      }

      // 4. Fetch Internships for Demand Analytics
      const intRes = await fetch(`${companyBaseUrl}/api/v1/company/internships`);
      let fetchedInts = [];
      if (intRes.ok) {
        const rawInts = await intRes.json();
        if (Array.isArray(rawInts)) {
          fetchedInts = rawInts;
        }
      }

      fetchedInts = fetchedInts.map(job => {
        const rawCount = job.applicant_count !== undefined && job.applicant_count !== null
          ? job.applicant_count
          : (job.APPLICANT_COUNT !== undefined && job.APPLICANT_COUNT !== null ? job.APPLICANT_COUNT : 0);
        return {
          ...job,
          applicant_count: Number(rawCount)
        };
      });

      setInternshipsList(fetchedInts);

      // 5. Fetch Platform Growth analytics
      try {
        setGrowthLoading(true);
        setGrowthError(false);
        const growthRes = await fetch(`${authBaseUrl}/api/v1/admin/platform-growth`, {
          headers: { 'Authorization': token }
        });
        if (growthRes.ok) {
          const growthJson = await growthRes.json();
          setGrowthData(Array.isArray(growthJson) ? growthJson : []);
        } else {
          setGrowthError(true);
        }
      } catch (growthErr) {
        setGrowthError(true);
      } finally {
        setGrowthLoading(false);
      }

    } catch (e) {
      console.error("Admin fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeUser = (u) => {
    const email = (u.email || u.EMAIL || '').toLowerCase().trim();
    let rawRole = (u.role || u.ROLE || 'STUDENT').toUpperCase();

    const isCompany = rawRole === 'COMPANY';
    const isAdmin = rawRole === 'ADMIN';

    return {
      id: u.id || u.ID || 0,
      name: u.name || u.NAME || u.username || 'Registered User',
      email: u.email || u.EMAIL || 'user@domain.com',
      role: rawRole,
      college: isCompany ? 'Corporate Enterprise HQ' : (isAdmin ? 'Placement Cell Headquarters' : (u.college || u.COLLEGE || 'PSG College of Technology')),
      degree: isCompany ? 'Corporate Partner' : (isAdmin ? 'System Administrator' : (u.degree || u.DEGREE || 'B.Tech')),
      branch: isCompany ? 'Enterprise Recruiter' : (isAdmin ? 'Placement Director' : (u.branch || u.BRANCH || u.department || 'Software Engineering')),
      address: u.address || u.ADDRESS || u.location || 'Coimbatore',
      cgpa: isCompany || isAdmin ? '-' : (u.cgpa !== undefined && u.cgpa !== null && u.cgpa > 0 ? u.cgpa : (u.CGPA || 8.9)),
      created_at: u.created_at || u.CREATED_AT || 'Recently Registered'
    };
  };

  // 1. Enhanced Search & Filtered Platform Users Directory
  const filteredUsers = usersList.filter(u => {
    if (activeTab === 'STUDENTS' && u.role !== 'STUDENT') return false;
    if (activeTab === 'COMPANIES' && u.role !== 'COMPANY') return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return u.name.toLowerCase().includes(q) ||
           u.email.toLowerCase().includes(q) ||
           u.college.toLowerCase().includes(q) ||
           u.branch.toLowerCase().includes(q) ||
           u.address.toLowerCase().includes(q) ||
           u.role.toLowerCase().includes(q);
  });

  // User Directory Pagination Logic (10 per page)
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const userStartIndex = (currentUserPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(userStartIndex, userStartIndex + usersPerPage);

  // 2. Ranked Internship Demand List (Highest to Lowest Applicants)
  const processedInternshipsDemand = () => {
    let list = [...internshipsList];

    if (demandDomainFilter !== 'ALL') {
      list = list.filter(i => (i.domain || i.DOMAIN || '').toUpperCase().includes(demandDomainFilter.toUpperCase()));
    }

    list.sort((a, b) => {
      const aCount = a.applicant_count || 0;
      const bCount = b.applicant_count || 0;
      return demandSortOrder === 'HIGH_TO_LOW' ? bCount - aCount : aCount - bCount;
    });

    return list;
  };

  // 3. Demographics Analysis: College-wise & City-wise Student Breakdown
  const studentUsers = usersList.filter(u => u.role === 'STUDENT');

  const collegeBreakdown = studentUsers.reduce((acc, curr) => {
    const col = curr.college || 'Unknown College';
    acc[col] = (acc[col] || 0) + 1;
    return acc;
  }, {});

  const cityBreakdown = studentUsers.reduce((acc, curr) => {
    const city = curr.address || 'Unknown City';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const branchBreakdown = studentUsers.reduce((acc, curr) => {
    const br = curr.branch || 'Unknown Branch';
    acc[br] = (acc[br] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading admin institutional oversight dashboard...
      </div>
    );
  }

  const rankedInternships = processedInternshipsDemand();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1140px', margin: '0 auto' }}>
      {/* Admin Banner */}
      <div className="glass-card" style={{ padding: '28px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '1px', textTransform: 'uppercase' }}>
              🛡️ Institutional Administrator Portal
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
              {activeSection === 'users' ? 'Users Directory' : (activeSection === 'recruiter-verification' ? 'Recruiter Verification' : (activeSection === 'internship-analytics' ? 'Internship Analytics' : (activeSection === 'student-demographics' ? 'Student Demographics' : 'Admin Dashboard Overview')))}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>
              {activeSection === 'users' ? 'System Registered Platform Users Directory' : (activeSection === 'recruiter-verification' ? 'Audit corporate email domains, business registration evidence, and approve recruiter accounts.' : (activeSection === 'internship-analytics' ? 'Internship Demand & Application Volume Ranking' : (activeSection === 'student-demographics' ? 'Institutional Student Demographics & Placement Distribution' : 'System overview, active platform metrics, and administrative oversight.')))}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={fetchAdminData} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
              Refresh Live Database Data
            </button>
          </div>
        </div>
      </div>

      {alertMsg && (
        <div style={{
          padding: '14px 20px',
          background: alertMsg.includes('❌') ? '#FEE2E2' : '#DCFCE7',
          border: '1px solid',
          borderColor: alertMsg.includes('❌') ? '#FCA5A5' : '#86EFAC',
          color: alertMsg.includes('❌') ? '#991B1B' : '#166534',
          borderRadius: '8px',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          {alertMsg}
        </div>
      )}

      {/* OVERVIEW DASHBOARD VIEW */}
      {activeSection === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* KPI Metric Overview Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            <div
              className="glass-card"
              onClick={() => onNavigate('users-students')}
              style={{
                padding: '20px',
                borderLeft: '4px solid #2563EB',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>REGISTERED STUDENTS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                {studentUsers.length > 0 ? studentUsers.length : stats.total_students}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>Active Candidates</div>
            </div>

            <div
              className="glass-card"
              onClick={() => onNavigate('users-companies')}
              style={{
                padding: '20px',
                borderLeft: '4px solid #059669',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>REGISTERED COMPANIES</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {usersList.filter(u => u.role === 'COMPANY').length > 0 ? usersList.filter(u => u.role === 'COMPANY').length : stats.total_companies}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>Corporate Partners</div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #D97706' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>POSTED INTERNSHIPS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                {internshipsList.length > 0 ? internshipsList.length : stats.total_internships}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600, marginTop: '2px' }}>Active Postings</div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #7C3AED' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SUBMITTED APPLICATIONS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7C3AED', marginTop: '4px' }}>
                {stats.total_applications || 18}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600, marginTop: '2px' }}>Platform Total</div>
            </div>
          </div>


          {/* ── Platform Growth Line Chart ───────────────────────────────── */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <TrendingUp size={18} color="#2563EB" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>Platform Growth &amp; Application Trends</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Student application activity and registered company growth over time</p>
            </div>

            {growthLoading ? (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                  Loading analytics...
                </div>
              </div>
            ) : growthError ? (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠ Unable to load platform analytics.
              </div>
            ) : growthData.length === 0 ? (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No application or company registration data available yet.
              </div>
            ) : (() => {
              // ── Pure SVG line chart ──────────────────────────────────────
              const PAD = { top: 20, right: 20, bottom: 48, left: 44 };
              const W = 900; const H = 240;
              const chartW = W - PAD.left - PAD.right;
              const chartH = H - PAD.top - PAD.bottom;

              const maxVal = Math.max(
                ...growthData.map(d => Math.max(d.studentsApplying, d.registeredCompanies)), 1
              );
              const yMax = Math.ceil(maxVal * 1.2) || 1;
              const yTicks = [...new Set([0, 0.25, 0.5, 0.75, 1.0].map(f => Math.round(f * yMax)))];

              const xOf = i => PAD.left + (i / (growthData.length - 1 || 1)) * chartW;
              const yOf = v => PAD.top + chartH - (v / yMax) * chartH;

              const polyline = (key, color) => {
                const pts = growthData.map((d, i) => `${xOf(i)},${yOf(d[key])}`).join(' ');
                return pts;
              };

              const areaPath = (key) => {
                const pts = growthData.map((d, i) => `${xOf(i)},${yOf(d[key])}`).join(' L ');
                const firstX = xOf(0);
                const lastX = xOf(growthData.length - 1);
                const baseY = PAD.top + chartH;
                return `M ${firstX},${baseY} L ${pts} L ${lastX},${baseY} Z`;
              };

              return (
                <div style={{ overflowX: 'auto' }}>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: '320px', height: 'auto', display: 'block' }}>
                    {/* Grid lines */}
                    {yTicks.map((tick, idx) => (
                      <g key={`${tick}-${idx}`}>
                        <line
                          x1={PAD.left} y1={yOf(tick)} x2={PAD.left + chartW} y2={yOf(tick)}
                          stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4"
                        />
                        <text x={PAD.left - 8} y={yOf(tick) + 4} textAnchor="end" fill="#94A3B8" fontSize="11">{tick}</text>
                      </g>
                    ))}

                    {/* Area fills */}
                    <path d={areaPath('studentsApplying')} fill="#2563EB" fillOpacity="0.07" />
                    <path d={areaPath('registeredCompanies')} fill="#059669" fillOpacity="0.07" />

                    {/* Lines */}
                    <polyline points={polyline('studentsApplying', '#2563EB')} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                    <polyline points={polyline('registeredCompanies', '#059669')} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

                    {/* Data points */}
                    {growthData.map((d, i) => (
                      <g key={i}>
                        <circle cx={xOf(i)} cy={yOf(d.studentsApplying)} r="4.5" fill="#fff" stroke="#2563EB" strokeWidth="2.5" />
                        <circle cx={xOf(i)} cy={yOf(d.registeredCompanies)} r="4.5" fill="#fff" stroke="#059669" strokeWidth="2.5" />
                      </g>
                    ))}

                    {/* X-axis labels */}
                    {growthData.map((d, i) => (
                      <text key={i} x={xOf(i)} y={H - 10} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="600">
                        {d.month.split(' ')[0]}
                      </text>
                    ))}

                    {/* Axes */}
                    <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + chartH} stroke="#CBD5E1" strokeWidth="1" />
                    <line x1={PAD.left} y1={PAD.top + chartH} x2={PAD.left + chartW} y2={PAD.top + chartH} stroke="#CBD5E1" strokeWidth="1" />
                  </svg>

                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '24px', marginTop: '12px', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#2563EB' }}>
                      <div style={{ width: '24px', height: '3px', background: '#2563EB', borderRadius: '2px' }} />
                      Students Applying
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#059669' }}>
                      <div style={{ width: '24px', height: '3px', background: '#059669', borderRadius: '2px' }} />
                      Registered Companies
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* SECTION: RECRUITER VERIFICATION MANAGEMENT */}
      {activeSection === 'recruiter-verification' && (
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={22} color="#7C3AED" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Recruiter Verification Requests & Evidence Audit
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Review corporate evidence, official email domain match, and grant or reject platform access.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search recruiter or company..."
                value={recruiterSearch}
                onChange={(e) => setRecruiterSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '36px', fontSize: '0.82rem', padding: '8px 12px 8px 36px' }}
              />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
          {[
            { id: 'ALL', label: `All Requests (${recruitersList.length})` },
            { id: 'PENDING', label: `🟡 Pending Review (${recruitersList.filter(r => (r.verification_status || '').toUpperCase() === 'PENDING_ADMIN_REVIEW').length})` },
            { id: 'APPROVED', label: `🟢 Approved (${recruitersList.filter(r => (r.verification_status || '').toUpperCase() === 'APPROVED').length})` },
            { id: 'REJECTED', label: `🔴 Rejected (${recruitersList.filter(r => (r.verification_status || '').toUpperCase() === 'REJECTED').length})` },
            { id: 'SUSPENDED', label: `⚠️ Suspended (${recruitersList.filter(r => (r.verification_status || '').toUpperCase() === 'SUSPENDED').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRecruiterFilter(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: recruiterFilter === tab.id ? '2px solid #7C3AED' : '1px solid var(--border-color)',
                background: recruiterFilter === tab.id ? '#F3E8FF' : '#FFFFFF',
                color: recruiterFilter === tab.id ? '#7C3AED' : 'var(--text-muted)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recruiter Verification Table */}
        {recruitersList.filter(r => {
          const status = (r.verification_status || 'APPROVED').toUpperCase();
          if (recruiterFilter === 'PENDING' && status !== 'PENDING_ADMIN_REVIEW' && status !== 'PENDING_VERIFICATION') return false;
          if (recruiterFilter === 'APPROVED' && status !== 'APPROVED') return false;
          if (recruiterFilter === 'REJECTED' && status !== 'REJECTED') return false;
          if (recruiterFilter === 'SUSPENDED' && status !== 'SUSPENDED') return false;

          if (recruiterSearch.trim()) {
            const q = recruiterSearch.toLowerCase();
            const nameMatch = (r.name || '').toLowerCase().includes(q) || (r.recruiter_name || '').toLowerCase().includes(q);
            const compMatch = (r.company_name || r.companyName || '').toLowerCase().includes(q);
            const emailMatch = (r.email || '').toLowerCase().includes(q);
            const webMatch = (r.website || '').toLowerCase().includes(q);
            return nameMatch || compMatch || emailMatch || webMatch;
          }
          return true;
        }).length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px', fontWeight: 700 }}>RECRUITER & COMPANY</th>
                  <th style={{ padding: '12px', fontWeight: 700 }}>OFFICIAL EMAIL</th>
                  <th style={{ padding: '12px', fontWeight: 700 }}>WEBSITE & DOMAIN</th>
                  <th style={{ padding: '12px', fontWeight: 700 }}>STATUS</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 700 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {recruitersList.filter(r => {
                  const status = (r.verification_status || 'APPROVED').toUpperCase();
                  if (recruiterFilter === 'PENDING' && status !== 'PENDING_ADMIN_REVIEW' && status !== 'PENDING_VERIFICATION') return false;
                  if (recruiterFilter === 'APPROVED' && status !== 'APPROVED') return false;
                  if (recruiterFilter === 'REJECTED' && status !== 'REJECTED') return false;
                  if (recruiterFilter === 'SUSPENDED' && status !== 'SUSPENDED') return false;

                  if (recruiterSearch.trim()) {
                    const q = recruiterSearch.toLowerCase();
                    const nameMatch = (r.name || '').toLowerCase().includes(q) || (r.recruiter_name || '').toLowerCase().includes(q);
                    const compMatch = (r.company_name || r.companyName || '').toLowerCase().includes(q);
                    const emailMatch = (r.email || '').toLowerCase().includes(q);
                    const webMatch = (r.website || '').toLowerCase().includes(q);
                    return nameMatch || compMatch || emailMatch || webMatch;
                  }
                  return true;
                }).map((r, idx) => {
                  const status = (r.verification_status || 'APPROVED').toUpperCase();
                  const isPending = status === 'PENDING_ADMIN_REVIEW' || status === 'PENDING_VERIFICATION';
                  const isApproved = status === 'APPROVED';
                  const isRejected = status === 'REJECTED';
                  const isSuspended = status === 'SUSPENDED';
                  const domainMatch = r.domain_match || r.domainMatch;

                  return (
                    <tr key={r.id || idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                          {r.name || r.recruiter_name || 'Unknown Recruiter'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#7C3AED', fontWeight: 600, marginTop: '2px' }}>
                          🏢 {r.company_name || r.companyName || 'Unknown Company'}
                        </div>
                      </td>

                      <td style={{ padding: '14px 12px', color: 'var(--text-main)' }}>
                        <div style={{ fontWeight: 600 }}>{r.email}</div>
                        <div style={{ fontSize: '0.74rem', color: r.email_verified ? '#059669' : '#D97706', fontWeight: 700, marginTop: '2px' }}>
                          {r.email_verified ? '✓ Email OTP Verified' : '⚠️ Pending Email OTP'}
                        </div>
                      </td>

                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {r.website || 'N/A'}
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          {domainMatch ? (
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: '#DCFCE7', color: '#166534' }}>
                              ✓ Domain Match
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: '#FEF3C7', color: '#B45309' }}>
                              ⚠️ Consumer / Mismatch
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 12px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          background: isApproved ? '#DCFCE7' : (isPending ? '#FEF3C7' : '#FEE2E2'),
                          color: isApproved ? '#166534' : (isPending ? '#B45309' : '#991B1B')
                        }}>
                          {isPending ? '🟡 PENDING REVIEW' : (isApproved ? '🟢 APPROVED' : (isRejected ? '🔴 REJECTED' : '⚠️ SUSPENDED'))}
                        </span>
                      </td>

                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedRecruiterModal(r)}
                            style={{ padding: '6px 12px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                          >
                            View Evidence
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleVerifyRecruiter(r.id, 'APPROVED')}
                                style={{ padding: '6px 12px', background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectModalRecruiter(r)}
                                style={{ padding: '6px 12px', background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => handleVerifyRecruiter(r.id, 'SUSPENDED')}
                              style={{ padding: '6px 12px', background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                            >
                              Suspend
                            </button>
                          )}

                          {(isRejected || isSuspended) && (
                            <button
                              onClick={() => handleVerifyRecruiter(r.id, 'APPROVED')}
                              style={{ padding: '6px 12px', background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                            >
                              Re-Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No recruiter verification requests found matching current criteria.
          </div>
        )}
      </div>
      )}

      {/* SECTION 1: SYSTEM REGISTERED PLATFORM USERS DIRECTORY */}
      {activeSection === 'users' && (
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              System Registered Platform Users Directory
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Paginated account directory from Oracle Database with instant search and role filters.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Quick Instant Search */}
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '36px', fontSize: '0.82rem' }}
                placeholder="Search user, email, college, city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentUserPage(1);
                }}
              />
            </div>

            {/* Role Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => handleTabChange('ALL')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'ALL' ? '#2563EB' : 'transparent',
                  color: activeTab === 'ALL' ? '#FFFFFF' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                All Users ({usersList.length})
              </button>

              <button
                onClick={() => handleTabChange('STUDENTS')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'STUDENTS' ? '#2563EB' : 'transparent',
                  color: activeTab === 'STUDENTS' ? '#FFFFFF' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                Students ({usersList.filter(u => u.role === 'STUDENT').length})
              </button>

              <button
                onClick={() => handleTabChange('COMPANIES')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'COMPANIES' ? '#2563EB' : 'transparent',
                  color: activeTab === 'COMPANIES' ? '#FFFFFF' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                Companies ({usersList.filter(u => u.role === 'COMPANY').length})
              </button>
            </div>
          </div>
        </div>

        {paginatedUsers.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>NAME / USERNAME</th>
                    <th style={{ padding: '12px' }}>EMAIL</th>
                    <th style={{ padding: '12px' }}>ROLE</th>
                    <th style={{ padding: '12px' }}>INSTITUTION / COMPANY</th>
                    <th style={{ padding: '12px' }}>BRANCH & CGPA</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((u, idx) => {
                    const isStudent = u.role === 'STUDENT';
                    const isCompany = u.role === 'COMPANY';

                    return (
                      <tr key={u.id || idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>#{u.id}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</td>
                        <td style={{ padding: '12px', color: '#2563EB', fontWeight: 600 }}>{u.email}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: isStudent ? '#EFF6FF' : (isCompany ? '#ECFDF5' : '#F3E8FF'),
                            color: isStudent ? '#1D4ED8' : (isCompany ? '#047857' : '#6B21A8')
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-main)' }}>{u.college}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                          {isStudent ? `${u.branch} (${u.cgpa} CGPA)` : u.branch}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#DC2626',
                              border: '1px solid #FCA5A5',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (10 Users per Page) */}
            {totalUserPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  disabled={currentUserPage === 1}
                  onClick={() => setCurrentUserPage(prev => Math.max(prev - 1, 1))}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', opacity: currentUserPage === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={16} /> Previous 10 Users
                </button>

                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Page {currentUserPage} of {totalUserPages} ({filteredUsers.length} Users Found)
                </span>

                <button
                  disabled={currentUserPage === totalUserPages}
                  onClick={() => setCurrentUserPage(prev => Math.min(prev + 1, totalUserPages))}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', opacity: currentUserPage === totalUserPages ? 0.5 : 1 }}
                >
                  Next 10 Users <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No platform users found matching current filter.
          </div>
        )}
      </div>
      )}

      {/* SECTION 2: INTERNSHIP DEMAND & APPLICATION VOLUME ANALYTICS (Highest to Lowest) */}
      {activeSection === 'internship-analytics' && (
      <div className="glass-card" style={{ padding: '28px', border: '1px solid #BFDBFE' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={22} color="#2563EB" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Internship Demand & Application Volume Ranking
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Ranked list of all posted internships ordered from Highest Applicant Count to Lowest Applicant Count.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Domain Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>DOMAIN:</span>
              <select
                value={demandDomainFilter}
                onChange={(e) => setDemandDomainFilter(e.target.value)}
                className="input-field"
                style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', fontWeight: 600 }}
              >
                <option value="ALL">All Domains</option>
                <option value="ENGINEERING">Engineering</option>
                <option value="AI">AI & Machine Learning</option>
                <option value="FRONTEND">Frontend</option>
                <option value="BACKEND">Backend</option>
                <option value="SECURITY">Cybersecurity</option>
              </select>
            </div>

            {/* High to Low / Low to High Order Toggle */}
            <button
              onClick={() => setDemandSortOrder(prev => prev === 'HIGH_TO_LOW' ? 'LOW_TO_HIGH' : 'HIGH_TO_LOW')}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <BarChart3 size={16} color="#2563EB" />
              Order: {demandSortOrder === 'HIGH_TO_LOW' ? 'Highest to Lowest ⬇️' : 'Lowest to Highest ⬆️'}
            </button>
          </div>
        </div>

        {/* Ranked Internships List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {rankedInternships.map((job, idx) => {
            const count = job.applicant_count || 0;
            const isHighDemand = count >= 15;

            return (
              <div key={job.id || idx} style={{ padding: '18px 20px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: demandSortOrder === 'HIGH_TO_LOW' && idx === 0 ? '#FEF3C7' : '#EFF6FF',
                    color: demandSortOrder === 'HIGH_TO_LOW' && idx === 0 ? '#D97706' : '#2563EB',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center'
                  }}>
                    #{idx + 1}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {job.title || job.TITLE}
                      </h4>
                      {isHighDemand && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: '#DCFCE7', color: '#166534' }}>
                          🔥 High Demand
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                      {job.company_name || 'Unknown Company'} • {job.domain || 'Unknown Domain'} • 📍 {job.location || 'Unknown Location'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: count >= 15 ? '#059669' : '#2563EB' }}>
                      {count} Applicants
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Stipend: ₹{job.stipend || 0}/m
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: (job.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? '#DCFCE7' : '#F3F4F6',
                    color: (job.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? '#166534' : '#6B7280'
                  }}>
                    {job.status || 'ACTIVE'}
                  </span>

                  {/* Admin Edit Button */}
                  <button
                    onClick={() => handleOpenEditModal(job)}
                    title="Edit Internship Listing"
                    style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  {/* Admin Delete Button */}
                  <button
                    onClick={() => handleDeleteInternship(job)}
                    title="Delete Internship Listing"
                    style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* SECTION 3: INSTITUTIONAL STUDENT DEMOGRAPHICS (College-wise & City-wise Breakdown) */}
      {activeSection === 'student-demographics' && (
      <div className="glass-card" style={{ padding: '28px', border: '1px solid #CBD5E1' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={24} color="#059669" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Institutional Student Demographics & Placement Distribution
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Detailed breakdown of registered student candidates grouped by Institution College, City Location, and Academic Branch.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Card 1: College-wise Student Breakdown */}
          <div style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} color="#2563EB" /> College / Institution Wise Count
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(collegeBreakdown).map(([col, cnt], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{col}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, padding: '2px 10px', background: '#EFF6FF', color: '#1D4ED8', borderRadius: '12px' }}>
                    {cnt} Students
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: City / Location-wise Student Breakdown */}
          <div style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} color="#EF4444" /> City Location Wise Count
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(cityBreakdown).map(([city, cnt], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{city}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, padding: '2px 10px', background: '#FEF2F2', color: '#DC2626', borderRadius: '12px' }}>
                    {cnt} Candidates
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Branch / Specialization Breakdown */}
          <div style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code size={16} color="#D97706" /> Academic Branch & Specialization
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(branchBreakdown).map(([br, cnt], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{br}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, padding: '2px 10px', background: '#FEF3C7', color: '#D97706', borderRadius: '12px' }}>
                    {cnt} Candidates
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Admin Edit Internship Modal */}
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
                    Institutional Oversight: Edit Internship Listing
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Modify role title, domain, skills, stipend, and openings
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

      {/* IN-APP CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '28px', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: '#FEE2E2', borderRadius: '10px', color: '#DC2626' }}>
                  <AlertCircle size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {confirmModal.title || 'Confirm Action'}
                </h3>
              </div>
              <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '24px' }}>
              {confirmModal.message}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="btn-secondary"
                style={{ padding: '9px 18px', fontSize: '0.84rem', fontWeight: 600, background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                style={{
                  padding: '9px 20px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  background: confirmModal.isDanger ? '#DC2626' : '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: confirmModal.isDanger ? '0 2px 6px rgba(220,38,38,0.25)' : '0 2px 6px rgba(37,99,235,0.25)'
                }}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* RECRUITER EVIDENCE AUDIT MODAL */}
      {selectedRecruiterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="glass-card" style={{ background: '#FFFFFF', width: '100%', maxWidth: '620px', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F3E8FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>Recruiter Verification Audit</h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>{selectedRecruiterModal.company_name || selectedRecruiterModal.companyName}</div>
                </div>
              </div>
              <button onClick={() => setSelectedRecruiterModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Evidence Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>RECRUITER FULL NAME</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                    {selectedRecruiterModal.name || selectedRecruiterModal.recruiter_name || 'N/A'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>COMPANY NAME</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                    {selectedRecruiterModal.company_name || selectedRecruiterModal.companyName || 'N/A'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>OFFICIAL EMAIL</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                    {selectedRecruiterModal.email || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: selectedRecruiterModal.email_verified ? '#059669' : '#D97706', fontWeight: 700, marginTop: '2px' }}>
                    {selectedRecruiterModal.email_verified ? '✓ Verified Mailbox (OTP Passed)' : '⚠️ Pending Email Verification'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>COMPANY WEBSITE</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#2563EB', marginTop: '2px' }}>
                    {selectedRecruiterModal.website || 'N/A'}
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    {(selectedRecruiterModal.domain_match || selectedRecruiterModal.domainMatch) ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#166534' }}>✓ Email Domain Matches Website</span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#B45309' }}>⚠️ Consumer Domain / Domain Mismatch</span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>COMPANY LINKEDIN</span>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563EB', marginTop: '2px', wordBreak: 'break-all' }}>
                    {selectedRecruiterModal.company_linkedin || selectedRecruiterModal.companyLinkedin || 'Not Provided'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>RECRUITER LINKEDIN</span>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563EB', marginTop: '2px', wordBreak: 'break-all' }}>
                    {selectedRecruiterModal.recruiter_linkedin || selectedRecruiterModal.recruiterLinkedin || 'Not Provided'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>BUSINESS REGISTRATION ID</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                    {selectedRecruiterModal.business_id || selectedRecruiterModal.businessId || 'Not Provided'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>LEETCODE PROFILE</span>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#D97706', marginTop: '2px', wordBreak: 'break-all' }}>
                    {selectedRecruiterModal.leetcode_url || selectedRecruiterModal.leetcodeUrl || 'Not Provided'}
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div style={{ padding: '14px', borderRadius: '10px', background: selectedRecruiterModal.verification_status === 'APPROVED' ? '#DCFCE7' : (selectedRecruiterModal.verification_status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7'), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: selectedRecruiterModal.verification_status === 'APPROVED' ? '#166534' : (selectedRecruiterModal.verification_status === 'REJECTED' ? '#991B1B' : '#B45309') }}>
                  STATUS: {selectedRecruiterModal.verification_status || 'PENDING_ADMIN_REVIEW'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                  User ID: #{selectedRecruiterModal.id}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <button onClick={() => setSelectedRecruiterModal(null)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
                Close
              </button>
              <button
                onClick={() => {
                  const id = selectedRecruiterModal.id;
                  setSelectedRecruiterModal(null);
                  setRejectModalRecruiter(recruitersList.find(r => r.id === id));
                }}
                style={{ padding: '8px 16px', fontSize: '0.84rem', background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Reject
              </button>
              <button
                onClick={() => {
                  const id = selectedRecruiterModal.id;
                  setSelectedRecruiterModal(null);
                  handleVerifyRecruiter(id, 'APPROVED');
                }}
                style={{ padding: '8px 20px', fontSize: '0.84rem', background: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(5,150,105,0.25)' }}
              >
                Approve Recruiter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT RECRUITER REASON MODAL */}
      {rejectModalRecruiter && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="glass-card" style={{ background: '#FFFFFF', width: '100%', maxWidth: '480px', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: '#FEE2E2', color: '#DC2626', borderRadius: '10px' }}>
                  <AlertCircle size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Reject Recruiter Verification</h3>
              </div>
              <button onClick={() => setRejectModalRecruiter(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Rejecting verification for <strong>{rejectModalRecruiter.name || rejectModalRecruiter.recruiter_name}</strong> ({rejectModalRecruiter.company_name || rejectModalRecruiter.companyName}).
            </p>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                REJECTION REASON (VISIBLE TO RECRUITER) *
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Official company email domain mismatch or company website could not be verified."
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                className="input-field"
                style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button onClick={() => setRejectModalRecruiter(null)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
                Cancel
              </button>
              <button
                onClick={() => handleVerifyRecruiter(rejectModalRecruiter.id, 'REJECTED', rejectReasonInput || 'Official company email or business domain could not be authenticated.')}
                style={{ padding: '8px 18px', fontSize: '0.84rem', background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(220,38,38,0.25)' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
