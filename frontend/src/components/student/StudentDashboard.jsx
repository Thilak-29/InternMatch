import React, { useState, useEffect } from 'react';
import { Briefcase, Sparkles, FileText, Bookmark, Calendar, TrendingUp, Upload, AlertCircle, ArrowRight, CheckCircle2, Award, ExternalLink, BookOpen, Cpu, ShieldCheck, RefreshCw } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

export default function StudentDashboard({ currentUser, onNavigate }) {
  const studentId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;
  const token = currentUser?.token || '';
  const baseUrl = API_CONFIG.STUDENT_SERVICE_URL;
  const aiApiUrl = API_CONFIG.AI_SERVICE_URL;

  if (!studentId) {
    return (
      <div className="glass-card" style={{ padding: '36px', textAlign: 'center', color: '#DC2626' }}>
        <AlertCircle size={32} style={{ margin: '0 auto 12px auto' }} />
        <h3>Session Authentication Error</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
          Unable to identify authenticated student ID. Please sign in again.
        </p>
      </div>
    );
  }

  const [data, setData] = useState({
    total_applied: 0,
    ai_match_rate: '0%',
    resume_score: 0,
    saved_internships: 0,
    upcoming_interviews: 0,
    recent_applications: []
  });

  const [existingSkills, setExistingSkills] = useState([]);
  const [profileDegree, setProfileDegree] = useState('');
  const [profileBranch, setProfileBranch] = useState('');
  const [profileBio, setProfileBio] = useState('');

  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [recommendedCertifications, setRecommendedCertifications] = useState([]);
  const [isAiAdvisorLoading, setIsAiAdvisorLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    fetchStudentProfileAndAiRecommendations();
  }, [studentId]);

  const fetchStudentProfileAndAiRecommendations = async () => {
    setIsAiAdvisorLoading(true);
    let skillsString = '';
    let deg = '';
    let br = '';
    let bi = '';
    let parsed = [];

    try {
      const res = await fetch(`${baseUrl}/api/v1/student/${studentId}/profile`, {
        headers: { 'Authorization': token }
      });
      if (res.ok) {
        const prof = await res.json();
        skillsString = prof.skills || prof.SKILLS || '';
        deg = prof.degree || prof.DEGREE || '';
        br = prof.branch || prof.department || prof.BRANCH || '';
        bi = prof.bio || prof.BIO || '';

        parsed = typeof skillsString === 'string'
          ? skillsString.split(',').map(s => s.trim()).filter(Boolean)
          : (Array.isArray(skillsString) ? skillsString : []);

        setExistingSkills(parsed);
        setProfileDegree(deg);
        setProfileBranch(br);
        setProfileBio(bi);
      }
    } catch (e) {}

    const defaultRecs = generateFallbackRecommendations(parsed.length > 0 ? parsed : ['SQL']);

    try {
      const aiRes = await fetch(`${aiApiUrl}/api/v1/ai/career-advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: skillsString || 'SQL',
          degree: deg,
          branch: br,
          bio: bi
        })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        if (Array.isArray(aiData.courses) && aiData.courses.length > 0) {
          setRecommendedCourses(aiData.courses);
        } else {
          setRecommendedCourses(defaultRecs.courses);
        }
        if (Array.isArray(aiData.certifications) && aiData.certifications.length > 0) {
          setRecommendedCertifications(aiData.certifications);
        } else {
          setRecommendedCertifications(defaultRecs.certs);
        }
      } else {
        setRecommendedCourses(defaultRecs.courses);
        setRecommendedCertifications(defaultRecs.certs);
      }
    } catch (e) {
      setRecommendedCourses(defaultRecs.courses);
      setRecommendedCertifications(defaultRecs.certs);
    } finally {
      setIsAiAdvisorLoading(false);
    }
  };

  const generateFallbackRecommendations = (skillsArr) => {
    const sLower = skillsArr.map(s => String(s).toLowerCase()).join(' ');
    
    if (sLower.includes('sql') || sLower.includes('database') || sLower.includes('oracle') || sLower.includes('postgres') || skillsArr.length === 0) {
      return {
        courses: [
          {
            id: 1,
            title: "Oracle Database SQL Certified Associate Mastery",
            provider: "Oracle University & Coursera",
            duration: "4 Weeks",
            level: "Intermediate",
            reason: "Validates your SQL query optimization, DDL/DML, and database schema design skills",
            badge: "Recommended for SQL",
            url: "https://www.coursera.org/learn/oracle-sql-basics"
          },
          {
            id: 2,
            title: "Advanced PostgreSQL Tuning & High-Performance Indexing",
            provider: "PostgreSQL Guild & edX",
            duration: "5 Weeks",
            level: "Advanced",
            reason: "Complements your SQL background for Enterprise Backend & Data Engineer roles",
            badge: "High Demand",
            url: "https://www.edx.org/learn/postgresql"
          },
          {
            id: 3,
            title: "Cloud Database Engineering & AWS RDS Architecture",
            provider: "AWS Training & Udemy",
            duration: "6 Weeks",
            level: "Intermediate",
            reason: "Bridges SQL relational databases to cloud database infrastructure",
            badge: "Top Rated",
            url: "https://aws.amazon.com/training/course-descriptions/database-offering/"
          }
        ],
        certs: [
          {
            id: 1,
            name: "Oracle Database SQL Certified Associate (1Z0-071)",
            issuer: "Oracle University",
            description: "Official Oracle credential verifying SQL fundamental & advanced query expertise.",
            url: "https://education.oracle.com/oracle-database-sql/pexam_1Z0-071",
            color: "#DC2626"
          },
          {
            id: 2,
            name: "AWS Certified Database – Specialty",
            issuer: "Amazon Web Services (AWS)",
            description: "Industry benchmark for designing, deploying, and managing relational cloud SQL databases.",
            url: "https://aws.amazon.com/certification/certified-database-specialty/",
            color: "#F59E0B"
          },
          {
            id: 3,
            name: "Meta Database Engineer Professional Certificate",
            issuer: "Meta & Coursera",
            description: "Verified credential covering SQL, Database Administration, and Data Modeling.",
            url: "https://www.coursera.org/professional-certificates/meta-database-engineer",
            color: "#2563EB"
          }
        ]
      };
    }

    return {
      courses: [
        {
          id: 1,
          title: "Cloud Native Microservices with Docker & AWS",
          provider: "AWS Academy & Coursera",
          duration: "6 Weeks",
          level: "Advanced",
          reason: "Bridges your technical skills to Enterprise Cloud Deployment & Microservices",
          badge: "High Impact",
          url: "https://www.coursera.org/specializations/aws-cloud-solutions-architect"
        },
        {
          id: 2,
          title: "Full-Stack Enterprise Systems with React & Spring Boot",
          provider: "Meta Tech Professional",
          duration: "4 Weeks",
          level: "Intermediate",
          reason: "Enhances your frontend/backend architecture with production API security",
          badge: "In Demand",
          url: "https://www.coursera.org/professional-certificates/meta-back-end-developer"
        },
        {
          id: 3,
          title: "High-Scale Distributed System Design & Data Lakes",
          provider: "MIT OpenCourseWare",
          duration: "8 Weeks",
          level: "Advanced",
          reason: "Complements your profile for Solution Architect and High-Load Engineering roles",
          badge: "Top Rated",
          url: "https://ocw.mit.edu/courses/6-824-distributed-systems-spring-2020/"
        }
      ],
      certs: [
        {
          id: 1,
          name: "AWS Certified Developer – Associate",
          issuer: "Amazon Web Services (AWS)",
          description: "Industry standard certification for developing and deploying cloud microservices.",
          url: "https://aws.amazon.com/certification/certified-developer-associate/",
          color: "#F59E0B"
        },
        {
          id: 2,
          name: "Oracle Certified Professional: Java SE 17 Developer",
          issuer: "Oracle Corporation",
          description: "Official credential verifying high-level mastery of core Java, JVM, and enterprise APIs.",
          url: "https://education.oracle.com/oracle-certified-professional-java-se-17-developer/trackp_OCPJAV17",
          color: "#DC2626"
        },
        {
          id: 3,
          name: "Meta Front-End Developer Professional Certificate",
          issuer: "Meta & Coursera",
          description: "Verified credential validating React, Javascript, and responsive UX design skills.",
          url: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
          color: "#2563EB"
        }
      ]
    };
  };

  const fetchDashboard = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/v1/student/${studentId}/dashboard`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const result = await res.json();
        const appsList = Array.isArray(result.recent_applications) ? result.recent_applications : [];
        const liveUpcoming = appsList.filter(a => ['SHORTLISTED', 'ACCEPTED_FOR_TEST', 'TEST_PASSED', 'OFFER_ISSUED', 'OFFER_EXTENDED', 'ACCEPTED', 'INTERVIEW_SCHEDULED'].includes((a.status || a.STATUS || '').toUpperCase())).length;

        setData({
          total_applied: result.total_applied !== undefined ? result.total_applied : appsList.length,
          ai_match_rate: result.ai_match_rate || '0%',
          resume_score: result.resume_score || 0,
          saved_internships: result.saved_internships || 0,
          upcoming_interviews: liveUpcoming,
          recent_applications: appsList
        });
      } else {
        const appRes = await fetch(`${baseUrl}/api/v1/student/${studentId}/applications`, {
          headers: { 'Authorization': token }
        });
        if (appRes.ok) {
          const apps = await appRes.json();
          const upcoming = apps.filter(a => ['SHORTLISTED', 'ACCEPTED_FOR_TEST', 'TEST_PASSED', 'OFFER_ISSUED', 'OFFER_EXTENDED', 'ACCEPTED', 'INTERVIEW_SCHEDULED'].includes((a.status || a.STATUS || '').toUpperCase())).length;
          const matchScores = apps.map(a => a.match_score || a.MATCH_SCORE).filter(s => s && s > 0);
          const avgMatch = matchScores.length > 0 ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length) + '%' : '0%';

          setData(prev => ({
            ...prev,
            total_applied: apps.length,
            ai_match_rate: avgMatch,
            upcoming_interviews: upcoming,
            recent_applications: apps
          }));
        }
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading dashboard metrics & AI skill recommendations...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1140px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div className="glass-card" style={{ padding: '28px', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Welcome back, {currentUser?.name || 'Candidate'}!
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px' }}>
            Track your internship applications, ATS resume scores, and live recruitment timelines.
          </p>
        </div>

        <button
          onClick={() => onNavigate('explore')}
          className="btn-primary"
          style={{ padding: '10px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Explore Open Internships <ArrowRight size={16} />
        </button>
      </div>

      {/* KPI Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #2563EB' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>TOTAL APPLICATIONS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{data.total_applied}</div>
          <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '4px', fontWeight: 600 }}>Active Candidates</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #D97706' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>SAVED INTERNSHIPS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706' }}>{data.saved_internships || 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '4px', fontWeight: 600 }}>Bookmarked Opportunities</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>RESUME ATS SCORE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>{data.resume_score} / 100</div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px', fontWeight: 600 }}>ATS Verified</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #7C3AED' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>UPCOMING INTERVIEWS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7C3AED' }}>{data.upcoming_interviews}</div>
          <div style={{ fontSize: '0.75rem', color: '#7C3AED', marginTop: '4px', fontWeight: 600 }}>Shortlisted Stages</div>
        </div>
      </div>

      {/* SIDE-BY-SIDE GRID LAYOUT: Left = Recent Applications, Right = AI Career Advisor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Recent Applications Table */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Recent Applications
            </h3>
            <button onClick={() => onNavigate('applications')} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              View All
            </button>
          </div>

          {data.recent_applications.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    <th style={{ padding: '10px 6px' }}>ROLE TITLE</th>
                    <th style={{ padding: '10px 6px' }}>COMPANY</th>
                    <th style={{ padding: '10px 6px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_applications.slice(0, 6).map((app, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 6px', fontWeight: 700, color: 'var(--text-main)' }}>{app.title || app.role_title || 'Unknown Role'}</td>
                      <td style={{ padding: '12px 6px', color: '#2563EB', fontWeight: 600 }}>{app.company_name || 'Unknown Company'}</td>
                      <td style={{ padding: '12px 6px' }}>
                        <span className="badge badge-auth" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>{app.status || 'APPLIED'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No applications submitted yet. Click 'Explore Open Internships' to apply.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ✨ DYNAMIC AI CAREER ADVISOR CARD */}
        <div className="glass-card" style={{ padding: '24px', border: '1px solid #BFDBFE', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '6px', background: '#EFF6FF', borderRadius: '8px', color: '#2563EB' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  AI Career Advisor & Personal Skill Analysis
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Dynamic recommendations for your profile ({profileDegree} • {profileBranch})
                </p>
              </div>
            </div>

            <button
              onClick={fetchStudentProfileAndAiRecommendations}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={12} /> Refresh AI
            </button>
          </div>

          {/* Candidate's Unique Database Skills */}
          <div style={{ padding: '10px 14px', background: '#F1F5F9', borderRadius: '10px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Cpu size={14} color="#2563EB" /> Analyzed Database Skills:
            </span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {existingSkills.length > 0 ? (
                existingSkills.map((sk, i) => (
                  <span key={i} style={{ padding: '2px 8px', background: '#FFFFFF', color: '#1E293B', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600, border: '1px solid #CBD5E1' }}>
                    ✓ {sk}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Java, React, Spring Boot, Oracle DB</span>
              )}
            </div>
          </div>

          {isAiAdvisorLoading ? (
            <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              🤖 AI Advisor is evaluating your unique skill profile and generating custom recommendations...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Section 1: Dynamic Top 3 Recommended Courses */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={16} color="#2563EB" /> Top 3 Tailored AI-Recommended Courses
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recommendedCourses.map((c, i) => (
                    <div key={c.id || i} style={{ padding: '12px 14px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{c.title}</h5>
                          <div style={{ fontSize: '0.74rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                            {c.provider} • ⏱️ {c.duration || '4 Weeks'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '8px', background: '#EFF6FF', color: '#1D4ED8', whiteSpace: 'nowrap' }}>
                            {c.badge || 'Tailored'}
                          </span>
                          <a
                            href={c.url || 'https://www.coursera.org/'}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'none',
                              borderRadius: '6px',
                              borderColor: '#CBD5E1',
                              color: '#1E293B',
                              background: '#F8FAFC',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            View Course <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '6px', lineHeight: '1.35' }}>
                        💡 <strong>AI Analysis:</strong> {c.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Dynamic Top 3 Online Certifications with External Redirect Buttons */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="#D97706" /> Top 3 Recognized Professional Certifications
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recommendedCertifications.map((cert, i) => (
                    <div key={cert.id || i} style={{ padding: '12px 14px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={14} color={cert.color || '#2563EB'} />
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: cert.color || '#2563EB' }}>{cert.issuer}</span>
                        </div>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{cert.name}</h5>
                      </div>

                      <a
                        href={cert.url || 'https://aws.amazon.com/certification/'}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          borderColor: '#CBD5E1',
                          color: '#1E293B',
                          background: '#F8FAFC',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Apply <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
