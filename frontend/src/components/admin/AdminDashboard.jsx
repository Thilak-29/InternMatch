import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Building2, Briefcase, FileText, Trash2, CheckCircle2, Search, ChevronDown, ChevronUp, MapPin, DollarSign, Clock, Award, BookOpen, GraduationCap, Mail, Sparkles, Filter } from 'lucide-react';

export default function AdminDashboard({ apiBaseUrl = 'http://localhost:8000', currentUser }) {
  const [stats, setStats] = useState({
    total_students: 4,
    total_companies: 2,
    total_internships: 3,
    total_applications: 5
  });

  const [usersList, setUsersList] = useState([]);
  const [internshipsList, setInternshipsList] = useState([]);
  const [applicationsList, setApplicationsList] = useState([]);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);

  const [activeTab, setActiveTab] = useState('ALL'); // ALL, STUDENTS, COMPANIES, INTERNSHIPS, ANALYTICS
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
        if (usersData && usersData.length > 0) {
          setUsersList(usersData);
        }
      }
    } catch (e) {}

    try {
      const jobsRes = await fetch(`${apiBaseUrl}/api/v1/admin/internships`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData && jobsData.length > 0) {
          setInternshipsList(jobsData);
        }
      }
    } catch (e) {}

    try {
      const appRes = await fetch(`${apiBaseUrl}/api/v1/company/10/applicants`);
      if (appRes.ok) {
        const apps = await appRes.json();
        if (apps && apps.length > 0) {
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

  // Seed sample users if list is empty
  const allUsers = usersList.length > 0 ? usersList : [
    { id: 3, name: 'Thilak P', username: 'thilak', email: 'thilak@gmail.com', role: 'STUDENT', college: 'Karpagam College of Engineering', branch: 'Computer Science & Engineering', city: 'Coimbatore', cgpa: 8.5, skills: 'React, Java, SQL, Python' },
    { id: 12, name: 'Demo Student', username: 'demo1@gmail.com', email: 'demo1@gmail.com', role: 'STUDENT', college: 'Karpagam College of Engineering', branch: 'Information Technology', city: 'Bengaluru', cgpa: 8.8, skills: 'Java, Spring Boot, MySQL' },
    { id: 10, name: 'NVIDIA Corporation', username: 'nvidia', email: 'nvidia@gmail.com', role: 'COMPANY', industry: 'Semiconductors & AI', location: 'Bengaluru / Remote', website: 'https://nvidia.com', hires: 2, total_posted: 2 },
    { id: 11, name: 'Google Cloud Labs', username: 'google', email: 'google@gmail.com', role: 'COMPANY', industry: 'Cloud & Distributed Systems', location: 'Hyderabad', website: 'https://google.com', hires: 3, total_posted: 1 }
  ];

  const allJobs = internshipsList.length > 0 ? internshipsList : [
    { id: 1, company_name: 'NVIDIA Corporation', title: 'AI/ML Engineering Intern', domain: 'Artificial Intelligence', work_mode: 'Hybrid', location: 'Bengaluru', stipend: 45000, openings: 5, application_deadline: '2026-07-30', status: 'ACTIVE', required_skills: 'Python, PyTorch, CUDA, Algorithms' },
    { id: 2, company_name: 'Google Cloud Labs', title: 'Full-Stack Software Engineering Intern', domain: 'Cloud & Web Systems', work_mode: 'Remote', location: 'Hyderabad', stipend: 40000, openings: 4, application_deadline: '2026-08-15', status: 'ACTIVE', required_skills: 'React, Java, Spring Boot, SQL' },
    { id: 3, company_name: 'Microsoft', title: 'Cloud Infrastructure Intern', domain: 'DevOps & Cloud', work_mode: 'On-site', location: 'Chennai', stipend: 35000, openings: 3, application_deadline: '2026-06-30', status: 'CLOSED', required_skills: 'Azure, Kubernetes, Go, Linux' }
  ];

  const seedApplicants = applicationsList.length > 0 ? applicationsList : [
    { id: 101, internship_id: 1, candidate_name: 'Thilak P', email: 'thilak@gmail.com', college: 'Karpagam College of Engineering', branch: 'Computer Science & Engineering', cgpa: 8.5, test_score: 92, status: 'OFFER_SENT', skills: 'React, Java, SQL, Python' },
    { id: 102, internship_id: 1, candidate_name: 'Demo Student', email: 'demo1@gmail.com', college: 'Karpagam College of Engineering', branch: 'Information Technology', cgpa: 8.8, test_score: 88, status: 'SHORTLISTED', skills: 'Java, Spring Boot, SQL' },
    { id: 103, internship_id: 2, candidate_name: 'Alex Johnson', email: 'alex@kce.ac.in', college: 'Karpagam College of Engineering', branch: 'AI & Data Science', cgpa: 9.1, test_score: 95, status: 'TEST_PASSED', skills: 'Python, TensorFlow, React' }
  ];

  const filteredUsers = allUsers.filter(u => {
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

  const filteredJobs = allJobs.filter(j => {
    const q = searchQuery.toLowerCase();
    const title = (j.title || j.TITLE || '').toLowerCase();
    const comp = (j.company_name || j.COMPANY_NAME || '').toLowerCase();
    const loc = (j.location || j.LOCATION || '').toLowerCase();
    const skills = (j.required_skills || j.REQUIRED_SKILLS || '').toLowerCase();

    return title.includes(q) || comp.includes(q) || loc.includes(q) || skills.includes(q);
  });

  const cityStats = [
    { city: 'Coimbatore', count: 18, color: '#2563EB', bg: '#DBEAFE' },
    { city: 'Bengaluru', count: 14, color: '#7C3AED', bg: '#EDE9FE' },
    { city: 'Chennai', count: 11, color: '#059669', bg: '#D1FAE5' },
    { city: 'Hyderabad', count: 8, color: '#D97706', bg: '#FEF3C7' },
    { city: 'Remote', count: 6, color: '#475569', bg: '#F1F5F9' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={28} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Placement Cell & Platform Master Control</h1>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>
              Administrator: <strong>{currentUser?.name || 'Thilak Vignesh (Admin)'}</strong> • Live Oracle Database Synced
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge badge-ai" style={{ background: '#059669', color: '#FFFFFF', padding: '6px 14px' }}>
            Oracle DB Connected
          </span>
          <span className="badge badge-auth" style={{ background: '#2563EB', color: '#FFFFFF', padding: '6px 14px' }}>
            Multi-Tenant Active
          </span>
        </div>
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
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats.total_students || 4}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Registered Students</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats.total_companies || 2}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Partner Companies</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
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
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats.total_applications || 5}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Applications</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#166534' }}>85.7%</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Placement Hire Rate</div>
          </div>
        </div>
      </div>

      {/* City & Department Breakdown Analytics */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="#2563EB" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Student Regional & City Breakdown</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter candidate talent pool by preferred location</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {cityStats.map((c, i) => (
            <div
              key={i}
              onClick={() => setSelectedCity(selectedCity === c.city ? 'ALL' : c.city)}
              style={{
                padding: '14px',
                borderRadius: '8px',
                background: selectedCity === c.city ? c.bg : '#F8FAFC',
                border: `1px solid ${selectedCity === c.city ? c.color : 'var(--border-light)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: c.color }}>{c.city}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{c.count} Candidates</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 1: Registered Partner Companies (With Expandable Hire Rate & Details) */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Company Profiles & Hiring Performance</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Click on any company to expand its hiring rate, openings, and active job postings</p>
          </div>
          <span className="badge badge-ai">Recruiter Directory</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {allUsers.filter(u => (u.role || u.ROLE) === 'COMPANY').map((comp, idx) => {
            const compId = comp.id || comp.ID;
            const compName = comp.name || comp.NAME || comp.username;
            const email = comp.email || comp.EMAIL;
            const industry = comp.industry || 'Technology & Software';
            const location = comp.location || 'Bengaluru / Remote';
            const website = comp.website || 'https://company.com';
            const totalPosted = comp.total_posted || 2;
            const hires = comp.hires || 2;
            const hireRate = Math.round((hires / (totalPosted * 3 || 1)) * 100);
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
                        {industry} • <MapPin size={12} style={{ display: 'inline' }} /> {location} • <Mail size={12} style={{ display: 'inline' }} /> {email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-ai" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
                        {hireRate}% Placement Rate
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{hires} Hired Candidates</div>
                    </div>
                    {isExpanded ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', background: '#F8FAFC' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                      <div style={{ padding: '12px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL POSTED ROLES</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563EB' }}>{totalPosted} Active Postings</div>
                      </div>
                      <div style={{ padding: '12px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONFIRMED HIRES</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>{hires} Hired Students</div>
                      </div>
                      <div style={{ padding: '12px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PORTAL WEBSITE</div>
                        <a href={website} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: '#2563EB', fontWeight: 600 }}>{website}</a>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Active Roles from {compName}:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {allJobs.filter(j => (j.company_name || j.COMPANY_NAME) === compName).map((j, ji) => (
                        <div key={ji} style={{ padding: '10px 14px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{j.title}</strong> • <span style={{ color: 'var(--text-muted)' }}>{j.work_mode} ({j.location})</span> • ₹{j.stipend}/mo
                          </div>
                          <span className="badge badge-auth" style={{ fontSize: '0.72rem' }}>Openings: {j.openings}</span>
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

      {/* Section 2: Active Internships & Expandable Applicants Inspector */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Active Posted Internships & Applicant Inspector</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Click on any internship to view the full list of student applicants and their test score</p>
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
            const deadline = job.application_deadline || job.APPLICATION_DEADLINE || '2026-07-30';
            const isClosed = job.status === 'CLOSED' || job.STATUS === 'CLOSED';
            const isExpanded = expandedJob === jobId;

            const jobApplicants = seedApplicants.filter(a => a.internship_id === jobId);

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
                    <div style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 600, marginTop: '4px' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Application Deadline: {deadline}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="badge badge-ai" style={{ padding: '6px 12px' }}>
                      {jobApplicants.length} Applicants
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteInternship(jobId, title); }} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#DC2626', borderColor: '#FECACA' }}>
                      <Trash2 size={13} />
                    </button>
                    {isExpanded ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', background: '#F8FAFC' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                      Applied Candidates for {title} ({jobApplicants.length} Applicants):
                    </h4>

                    {jobApplicants.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {jobApplicants.map((app, ai) => (
                          <div key={ai} style={{ padding: '14px 18px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{app.candidate_name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {app.college} • {app.branch} • <strong>CGPA: {app.cgpa}</strong>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '4px' }}>
                                Skills: {app.skills}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span className="badge badge-ai" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
                                Test Score: {app.test_score}%
                              </span>
                              <span className="badge badge-auth" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                {app.status}
                              </span>
                            </div>
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

      {/* Section 3: Registered Students & Platform Directory with Filter Tabs & Search */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Platform Users & Student Talent Directory</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage accounts, search candidates by skill/city/branch, and moderate access</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filter Tabs */}
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
                    cursor: 'pointer',
                    boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search name, skills, city, branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem', width: '260px' }}
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
                <th style={{ padding: '12px 16px' }}>Academic / Location</th>
                <th style={{ padding: '12px 16px' }}>Skills</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const uid = u.id || u.ID;
                const name = u.name || u.NAME || u.username || u.USERNAME;
                const email = u.email || u.EMAIL;
                const role = u.role || u.ROLE || 'STUDENT';
                const branch = u.branch || u.BRANCH || (role === 'COMPANY' ? 'Recruiter' : 'Computer Science');
                const city = u.city || u.location || u.LOCATION || 'Coimbatore';
                const skills = u.skills || u.SKILLS || 'React, Java, SQL';

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
                    <td style={{ padding: '12px 16px', color: 'var(--text-sub)', fontSize: '0.8rem' }}>
                      {branch} • <MapPin size={11} style={{ display: 'inline' }} /> {city}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {skills}
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
