import React, { useState, useEffect } from 'react';
import { Briefcase, Sparkles, FileText, Bookmark, Calendar, TrendingUp, Upload, AlertCircle, ArrowRight, CheckCircle2, Award, ExternalLink, BookOpen, Cpu, ShieldCheck, RefreshCw, UserCheck } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

export default function StudentDashboard({ currentUser, onNavigate }) {
  const studentId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;
  const token = currentUser?.token || '';
  const baseUrl = API_CONFIG.STUDENT_SERVICE_URL;
  const aiApiUrl = API_CONFIG.AI_SERVICE_URL;
  const companyUrl = API_CONFIG.COMPANY_SERVICE_URL;

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
    top_recs_count: 0,
    profile_score: 20,
    available_internships_count: 0,
    recent_applications: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [studentId]);

  // Transparent Weighted Scoring for Overall Profile Strength (0-100)
  const calculateOverallProfileScore = (profile) => {
    if (!profile) return 20;
    let score = 0;

    // 1. Basic Info (Name, College, Degree, Branch, Phone) -> Max 20 pts
    const name = profile.name || profile.student_name || currentUser?.name || '';
    const college = profile.college || profile.COLLEGE || '';
    const degree = profile.degree || profile.DEGREE || '';
    const branch = profile.branch || profile.department || profile.BRANCH || '';
    const phone = profile.phone || profile.PHONE || '';

    if (name.trim()) score += 4;
    if (college.trim() && college.trim() !== 'Not set') score += 4;
    if (degree.trim() && degree.trim() !== 'Not set') score += 4;
    if (branch.trim() && branch.trim() !== 'Not set') score += 4;
    if (phone.trim()) score += 4;

    // 2. Skills Profile -> Max 20 pts
    const skillsStr = profile.skills || profile.SKILLS || '';
    const skillList = typeof skillsStr === 'string'
      ? skillsStr.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(skillsStr) ? skillsStr : []);
    if (skillList.length >= 5) score += 20;
    else if (skillList.length >= 3) score += 15;
    else if (skillList.length >= 1) score += 10;

    // 3. Resume Uploaded -> Max 20 pts
    const hasResume = profile.resume_file_name || profile.RESUME_FILE_NAME || profile.resume_text || profile.resume_data;
    if (hasResume) score += 20;

    // 4. Certifications -> Max 15 pts
    const certsStr = profile.certifications || profile.CERTIFICATIONS || '';
    const certList = typeof certsStr === 'string'
      ? certsStr.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(certsStr) ? certsStr : []);
    if (certList.length >= 2) score += 15;
    else if (certList.length === 1) score += 10;

    // 5. Bio / Summary -> Max 10 pts
    const bioStr = profile.bio || profile.BIO || '';
    if (bioStr.trim().length > 15) score += 10;
    else if (bioStr.trim().length > 0) score += 5;

    // 6. External Developer Profiles (GitHub / LeetCode) -> Max 15 pts
    const hasGithub = profile.github || profile.github_username || profile.GITHUB;
    const hasLeetcode = profile.leetcode || profile.leetcode_username || profile.LEETCODE;
    if (hasGithub) score += 10;
    if (hasLeetcode) score += 5;

    return Math.min(100, Math.max(10, score));
  };

  // Calculates real total count of active available internships across all aggregated sources (InternMatch + Unstop + Adzuna)
  const fetchTotalAvailableInternshipsCount = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/student/internships/aggregated?page=1&perPage=200`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.total !== undefined) {
          return data.total;
        }
      }
    } catch (e) {
      console.warn("Dashboard aggregated count notice:", e);
    }
    return 0;
  };

  const fetchDashboard = async () => {
    setIsLoading(true);
    let profScore = 20;
    let recsCount = 0;
    let availableCount = 0;
    let profSkills = '';
    let profCerts = '';
    let profDeg = '';
    let profBr = '';
    let profBio = '';

    // 1. Fetch Student Profile for Profile Strength Score & Career Advisor inputs
    try {
      const profRes = await fetch(`${baseUrl}/api/v1/student/${studentId}/profile`, {
        headers: { 'Authorization': token }
      });
      if (profRes.ok) {
        const profData = await profRes.json();
        profScore = calculateOverallProfileScore(profData);

        profSkills = profData.skills || profData.SKILLS || '';
        profCerts = profData.certifications || profData.CERTIFICATIONS || '';
        profDeg = profData.degree || profData.DEGREE || '';
        profBr = profData.branch || profData.department || profData.BRANCH || '';
        profBio = profData.bio || profData.BIO || '';
      }
    } catch (e) {
      console.warn("Dashboard profile fetch notice:", e);
    }

    // 2. Fetch Total Available Internships Count across all sources (InternMatch + Unstop) and all pages
    try {
      availableCount = await fetchTotalAvailableInternshipsCount();
    } catch (e) {
      console.warn("Dashboard available count notice:", e);
    }

    // 3. Fetch Career Recommendations (Reuses CareerAdvisorEngine via backend)
    try {
      const aiRes = await fetch(`${aiApiUrl}/api/v1/ai/career-advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: profSkills,
          certifications: profCerts,
          degree: profDeg,
          branch: profBr,
          bio: profBio
        })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const courses = Array.isArray(aiData.courses) ? aiData.courses : [];
        const certs = Array.isArray(aiData.certifications) ? aiData.certifications : [];

        // Combine courses + certs, sort by relevanceScore/score, take MAX 3
        const combined = [...courses, ...certs].sort((a, b) => {
          const sA = a.relevanceScore || a.score || 70;
          const sB = b.relevanceScore || b.score || 70;
          return sB - sA;
        });

        recsCount = Math.min(3, combined.length);
      }
    } catch (e) {
      console.warn("Dashboard recommendation fetch notice:", e);
    }

    // 4. Fetch Applications & Dashboard Metrics
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

        setData({
          total_applied: result.total_applied !== undefined ? result.total_applied : appsList.length,
          top_recs_count: recsCount,
          profile_score: profScore,
          available_internships_count: availableCount,
          recent_applications: appsList
        });
      } else {
        const appRes = await fetch(`${baseUrl}/api/v1/student/${studentId}/applications`, {
          headers: { 'Authorization': token }
        });
        if (appRes.ok) {
          const apps = await appRes.json();

          setData({
            total_applied: apps.length,
            top_recs_count: recsCount,
            profile_score: profScore,
            available_internships_count: availableCount,
            recent_applications: apps
          });
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

      {/* KPI Metric Grid (4 Cards in one row) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        {/* CARD 1: TOTAL APPLICATIONS (Clickable -> My Applications, No Subtitle) */}
        <div
          className="glass-card"
          onClick={() => onNavigate('applications')}
          style={{
            padding: '20px',
            borderLeft: '4px solid #2563EB',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          title="Click to view My Applications"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>TOTAL APPLICATIONS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{data.total_applied}</div>
        </div>

        {/* CARD 2: TOP CAREER RECOMMENDATIONS (Clickable -> Career Advisor, Max 3) */}
        <div
          className="glass-card"
          onClick={() => onNavigate('career-advisor')}
          style={{
            padding: '20px',
            borderLeft: '4px solid #D97706',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          title="Click to view Career Advisor"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>TOP CAREER RECOMMENDATIONS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706' }}>{data.top_recs_count}</div>
          <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '4px', fontWeight: 600 }}>Courses & Certifications</div>
        </div>

        {/* CARD 3: OVERALL PROFILE SCORE (Clickable -> Profile, 0-100 score) */}
        <div
          className="glass-card"
          onClick={() => onNavigate('profile')}
          style={{
            padding: '20px',
            borderLeft: '4px solid #059669',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          title="Click to view Student Profile"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>OVERALL PROFILE SCORE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>{data.profile_score} / 100</div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px', fontWeight: 600 }}>Profile Strength</div>
        </div>

        {/* CARD 4: AVAILABLE INTERNSHIPS (Replaces SKILL MATCH STRENGTH, Clickable -> Explore Internships) */}
        <div
          className="glass-card"
          onClick={() => onNavigate('explore')}
          style={{
            padding: '20px',
            borderLeft: '4px solid #7C3AED',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          title="Click to view Explore Internships"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>AVAILABLE INTERNSHIPS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7C3AED' }}>{data.available_internships_count}</div>
          <div style={{ fontSize: '0.75rem', color: '#7C3AED', marginTop: '4px', fontWeight: 600 }}>Open Opportunities</div>
        </div>
      </div>

      {/* Recent Applications Table */}
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
    </div>
  );
}
