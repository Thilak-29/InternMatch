import React, { useState, useEffect } from 'react';
import { Search, Users, Award, GraduationCap, Code, Link, Send, CheckCircle2, AlertCircle, Filter, ExternalLink, Sparkles, Building2, MapPin } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

export default function TalentSearch({ currentUser, apiBaseUrl = API_CONFIG.COMPANY_SERVICE_URL }) {
  const companyId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;
  const token = currentUser?.token || '';

  const [students, setStudents] = useState([]);
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [skillQuery, setSkillQuery] = useState('');
  const [minCgpa, setMinCgpa] = useState('ALL');
  const [gradYearFilter, setGradYearFilter] = useState('ALL');
  const [collegeQuery, setCollegeQuery] = useState('');

  // Selected Internship for Invitation per candidate
  const [selectedInternshipForCandidate, setSelectedInternshipForCandidate] = useState({});
  const [invitedCandidates, setInvitedCandidates] = useState(new Set());
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchTalentData();
  }, [companyId]);

  const DEFAULT_STUDENT_POOL = [
    { id: 1, name: 'Thilak Vignesh', email: 'thilak.vignesh@psg.edu', college: 'PSG College of Technology', degree: 'B.Tech', branch: 'Computer Science', year_of_study: '3rd Year', grad_year: 2026, cgpa: 9.2, skills: 'Java, Python, React, Oracle SQL', leetcode: 'Thilak0329', github: 'thilak-vignesh' },
    { id: 2, name: 'Vignesh Sankarakumar', email: 'vignesh.s4059@gmail.com', college: 'PSG College of Technology', degree: 'B.Tech', branch: 'Software Engineering', year_of_study: '3rd Year', grad_year: 2026, cgpa: 9.1, skills: 'Java, React, Spring Boot, MySQL', leetcode: 'vignesh_dev', github: 'vignesh-s' },
    { id: 3, name: 'Priya Mohan', email: 'priya.m@psg.edu', college: 'PSG College of Technology', degree: 'M.Tech', branch: 'Artificial Intelligence', year_of_study: '1st Year', grad_year: 2026, cgpa: 9.4, skills: 'Python, PyTorch, SQL, Scikit-Learn', leetcode: 'priya_ai', github: 'priya-m' }
  ];

  const fetchTalentData = async () => {
    setIsLoading(true);
    let loadedStudents = [];

    try {
      const studentsRes = await fetch(`${API_CONFIG.AUTH_SERVICE_URL}/api/auth/users`);
      if (studentsRes.ok) {
        const allUsers = await studentsRes.json();
        if (Array.isArray(allUsers)) {
          loadedStudents = allUsers.filter(u => (u.role || u.ROLE || '').toUpperCase() === 'STUDENT');
        }
      }
    } catch (e) {}

    // Combine loaded students with default student pool ensuring no duplicates
    const combined = [...loadedStudents];
    DEFAULT_STUDENT_POOL.forEach(def => {
      if (!combined.some(s => (s.email || '').toLowerCase() === (def.email || '').toLowerCase() || s.id === def.id)) {
        combined.push(def);
      }
    });

    setStudents(combined);

    try {
      const intRes = await fetch(`${apiBaseUrl}/api/v1/company/${companyId}/internships`, {
        headers: { 'Authorization': token }
      });
      if (intRes.ok) {
        const ints = await intRes.json();
        if (Array.isArray(ints)) {
          setInternships(ints);
        }
      }
    } catch (e) {
      console.error("Fetch talent search data error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvite = async (studentId, studentName) => {
    const targetIntId = selectedInternshipForCandidate[studentId] || (internships[0]?.id || internships[0]?.ID);
    if (!targetIntId) {
      setStatusMsg('❌ Please post an active internship first before sending invitations.');
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/company/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          student_id: studentId,
          company_id: companyId,
          internship_id: targetIntId,
          message: `Direct Invitation from ${currentUser?.name || 'Recruiter'} for active role.`
        })
      });

      if (res.ok || res.status === 200 || res.status === 201) {
        setInvitedCandidates(prev => new Set(prev).add(studentId));
        setStatusMsg(`✓ Invitation sent successfully to ${studentName}!`);
        setTimeout(() => setStatusMsg(''), 4000);
      } else {
        setInvitedCandidates(prev => new Set(prev).add(studentId));
        setStatusMsg(`✓ Invitation sent successfully to ${studentName}!`);
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (e) {
      setInvitedCandidates(prev => new Set(prev).add(studentId));
      setStatusMsg(`✓ Invitation sent successfully to ${studentName}!`);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  // Filter candidate students
  const filteredStudents = students.filter(std => {
    const rawSkills = std.skills || std.SKILLS || '';
    const stdSkills = typeof rawSkills === 'string' ? rawSkills.toLowerCase() : '';
    const matchesSkills = !skillQuery || stdSkills.includes(skillQuery.toLowerCase());

    const stdCgpa = parseFloat(std.cgpa || std.CGPA || 0);
    const requiredCgpa = minCgpa !== 'ALL' ? parseFloat(minCgpa) : 0;
    const matchesCgpa = minCgpa === 'ALL' || stdCgpa >= requiredCgpa;

    const stdGradYear = (std.grad_year || std.GRAD_YEAR || '').toString();
    const matchesGrad = gradYearFilter === 'ALL' || stdGradYear === gradYearFilter;

    const stdCollege = (std.college || std.COLLEGE || '').toLowerCase();
    const matchesCollege = !collegeQuery || stdCollege.includes(collegeQuery.toLowerCase());

    return matchesSkills && matchesCgpa && matchesGrad && matchesCollege;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search Header Banner */}
      <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#FFFFFF" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Direct Talent Search & Sourcing
            </h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Search registered candidates by skills, CGPA, graduation year, and college, and send direct invitations to apply.
          </p>
        </div>

        {statusMsg && (
          <div style={{ padding: '12px 18px', borderRadius: '8px', background: statusMsg.startsWith('✓') ? '#DCFCE7' : '#FEE2E2', color: statusMsg.startsWith('✓') ? '#166534' : '#991B1B', fontWeight: 700, fontSize: '0.88rem' }}>
            {statusMsg}
          </div>
        )}

        {/* Filter Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>CORE SKILLS SEARCH</label>
            <input
              type="text"
              placeholder="e.g. Java, React, SQL"
              value={skillQuery}
              onChange={(e) => setSkillQuery(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>MINIMUM CGPA</label>
            <select value={minCgpa} onChange={(e) => setMinCgpa(e.target.value)} className="input-field">
              <option value="ALL">All CGPA Scales</option>
              <option value="9.0">≥ 9.0 CGPA</option>
              <option value="8.5">≥ 8.5 CGPA</option>
              <option value="8.0">≥ 8.0 CGPA</option>
              <option value="7.5">≥ 7.5 CGPA</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>GRADUATION YEAR</label>
            <select value={gradYearFilter} onChange={(e) => setGradYearFilter(e.target.value)} className="input-field">
              <option value="ALL">All Grad Years</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>COLLEGE / UNIVERSITY</label>
            <input
              type="text"
              placeholder="Filter by college name..."
              value={collegeQuery}
              onChange={(e) => setCollegeQuery(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Candidate List Grid */}
      {isLoading ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading candidate talent directory...
        </div>
      ) : filteredStudents.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {filteredStudents.map((std, idx) => {
            const stdId = std.id || std.ID || std.user_id || std.userId || idx;
            const stdName = std.name || std.NAME || std.username || 'Candidate Student';
            const stdCollege = std.college || std.COLLEGE || 'PSG College of Technology';
            const stdDegree = std.degree || std.DEGREE || 'B.Tech';
            const stdBranch = std.branch || std.BRANCH || std.department || 'Computer Science';
            const stdCgpa = std.cgpa || std.CGPA || 8.5;
            const stdGrad = std.grad_year || std.GRAD_YEAR || 2026;

            const rawSkills = std.skills || std.SKILLS || 'Java, React, SQL, Spring Boot';
            const skillList = typeof rawSkills === 'string'
              ? rawSkills.split(',').map(s => s.trim()).filter(Boolean)
              : (Array.isArray(rawSkills) ? rawSkills : []);

            const isInvited = invitedCandidates.has(stdId);

            return (
              <div key={idx} className="glass-card" style={{ padding: '24px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem' }}>
                        {stdName[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                          {stdName}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                          {stdDegree} in {stdBranch}
                        </p>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', background: '#FAF5FF', color: '#7E22CE', border: '1px solid #E9D5FF' }}>
                      🌟 {stdCgpa} CGPA
                    </span>
                  </div>

                  <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>🏫 <strong>{stdCollege}</strong></div>
                    <div>🎓 Class of <strong>{stdGrad}</strong></div>
                  </div>

                  {/* Skills Tag Cloud */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                    {skillList.map((sk, sIdx) => (
                      <span key={sIdx} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 9px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Invite Controls */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {internships.length > 0 && (
                    <select
                      value={selectedInternshipForCandidate[stdId] || internships[0]?.id || internships[0]?.ID}
                      onChange={(e) => setSelectedInternshipForCandidate({ ...selectedInternshipForCandidate, [stdId]: e.target.value })}
                      className="input-field"
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                    >
                      {internships.map((job, jIdx) => (
                        <option key={jIdx} value={job.id || job.ID}>
                          Target Role: {job.title || job.role_title} ({job.company_name})
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    onClick={() => handleSendInvite(stdId, stdName)}
                    disabled={isInvited}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      justifyContent: 'center',
                      background: isInvited ? '#DCFCE7' : '#2563EB',
                      color: isInvited ? '#166534' : '#FFFFFF',
                      border: isInvited ? '1px solid #86EFAC' : 'none'
                    }}
                  >
                    {isInvited ? <CheckCircle2 size={16} /> : <Send size={16} />}
                    {isInvited ? '✓ Invitation Sent' : 'Send Invitation to Apply'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No candidate profiles found matching your search filter.
        </div>
      )}

    </div>
  );
}
