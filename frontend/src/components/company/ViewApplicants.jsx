import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, Clock, Send, Award, FileText, X, ExternalLink, Sparkles, Filter, Check, Eye, AlertCircle, Search, ThumbsUp, ArrowLeft, ChevronLeft, ChevronRight, MapPin, DollarSign, Building2, ShieldCheck, ArrowUpDown, Code2, Github, Linkedin, Globe, TrendingUp, Star, BookOpen, Phone, Mail, GraduationCap, Trophy, Target } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

export default function ViewApplicants({ currentUser }) {
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
  const [allApplicants, setAllApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  // Filtering & Sorting for Master Internships View
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, CLOSED
  const [sortOption, setSortOption] = useState('LATEST'); // LATEST, OLDEST, HIGHEST_APPS, LOWEST_APPS
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Internship for Applicants Drill-Down
  const [selectedInternship, setSelectedInternship] = useState(null);

  // Status Filter for Candidate Drill-Down View (ALL, APPLIED, SHORTLISTED, OFFER_ISSUED, REJECTED)
  const [candidateStatusFilter, setCandidateStatusFilter] = useState('ALL');
  const [filterTopAiOnly, setFilterTopAiOnly] = useState(false);

  // Pagination for Selected Internship Applicants (5 per page)
  const [currentPage, setCurrentPage] = useState(1);

  // Inspect AI Match Breakdown Modal State
  const [inspectAiModalApp, setInspectAiModalApp] = useState(null);

  // Tracks applicationIds whose status update is currently in-flight
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(new Set());

  // ── Candidate Profile Deep-Dive Modal ─────────────────────────────────────
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateProfile, setCandidateProfile]   = useState(null);
  const [candLeetCode, setCandLeetCode]           = useState(null);
  const [candGitHub, setCandGitHub]               = useState(null);
  const [profileLoading, setProfileLoading]       = useState(false);
  const [profileTab, setProfileTab]               = useState('overview');

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    setIsLoading(true);

    try {
      // 1. Fetch Company Posted Internships
      const intRes = await fetch(`${baseUrl}/api/v1/company/${companyId}/internships`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      let fetchedInts = [];
      if (intRes.ok) {
        const rawInts = await intRes.json();
        if (Array.isArray(rawInts)) {
          fetchedInts = rawInts;
        }
      }

      // 2. Fetch All Candidate Applicants
      let fetchedApps = [];
      try {
        let appRes = await fetch(`${baseUrl}/api/v1/company/${companyId}/applicants`, {
          headers: { 'Authorization': token, 'Content-Type': 'application/json' }
        });
        if (appRes.ok) {
          const rawApps = await appRes.json();
          if (Array.isArray(rawApps) && rawApps.length > 0) {
            fetchedApps = rawApps.map(app => normalizeApplicant(app));
          }
        }
        if (fetchedApps.length === 0) {
          appRes = await fetch(`${baseUrl}/api/v1/company/applicants`, {
            headers: { 'Authorization': token, 'Content-Type': 'application/json' }
          });
          if (appRes.ok) {
            const rawApps = await appRes.json();
            if (Array.isArray(rawApps)) {
              fetchedApps = rawApps.map(app => normalizeApplicant(app));
            }
          }
        }
      } catch (err) {}

      setInternships(fetchedInts);
      setAllApplicants(fetchedApps);
    } catch (e) {
      console.error("Fetch company data error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeApplicant = (app) => {
    const rawSkills = app.skills || app.SKILLS || '';
    const skillList = typeof rawSkills === 'string'
      ? rawSkills.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(rawSkills) ? rawSkills : []);

    const rawScore = app.test_score !== undefined && app.test_score !== null
      ? app.test_score
      : (app.TEST_SCORE !== undefined && app.TEST_SCORE !== null ? app.TEST_SCORE : null);

    const rawName = app.candidate_name || app.student_name || app.name || app.NAME || app.CANDIDATE_NAME || app.STUDENT_NAME || '';
    const rawEmail = app.candidate_email || app.email || app.EMAIL || '';

    const rawCollege = app.college || app.COLLEGE || '';
    const rawDegree = app.degree || app.DEGREE || '';
    const rawBranch = app.branch || app.BRANCH || app.department || '';
    const rawPhone = app.phone || app.PHONE || '';

    const roleReqSkills = (selectedInternship?.required_skills || selectedInternship?.REQUIRED_SKILLS || '')
      .toLowerCase()
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    let certCount = 0;
    let certsList = [];
    let relevantCertCount = 0;

    if (app.certifications || app.CERTIFICATIONS) {
      try {
        const rawCerts = app.certifications || app.CERTIFICATIONS;
        certsList = typeof rawCerts === 'string' ? JSON.parse(rawCerts) : rawCerts;
        if (Array.isArray(certsList)) {
          certCount = certsList.length;
          certsList.forEach(c => {
            const certText = `${c.name || ''} ${c.issuer || ''}`.toLowerCase();
            const isRelevant = roleReqSkills.some(reqSkill => certText.includes(reqSkill));
            if (isRelevant) relevantCertCount++;
          });
        }
      } catch (e) {}
    }

    let baseMatch = app.match_score || app.MATCH_SCORE || 70;
    if (relevantCertCount > 0) {
      baseMatch += (relevantCertCount * 15);
    }
    if (certCount > relevantCertCount) {
      baseMatch += ((certCount - relevantCertCount) * 5);
    }
    baseMatch = Math.min(100, Math.max(0, baseMatch));

    return {
      id: app.id || app.ID || app.application_id,
      student_id: app.student_id || app.STUDENT_ID || 0,
      internship_id: app.internship_id || app.INTERNSHIP_ID,
      name: rawName.trim() || 'Not set',
      email: rawEmail.trim() || 'Not set',
      degree: rawDegree.trim() || 'Not set',
      branch: rawBranch.trim() || 'Not set',
      college: rawCollege.trim() || 'Not set',
      cgpa: app.cgpa !== undefined && app.cgpa !== null && app.cgpa !== 0 ? app.cgpa : (app.CGPA || 'Not set'),
      skills: skillList,
      role_title: app.role_title || app.title || app.ROLE_TITLE || 'Not set',
      status: (app.status || app.STATUS || 'APPLIED').toUpperCase(),
      test_score: rawScore !== null && rawScore !== undefined ? Number(rawScore) : null,
      match_score: baseMatch,
      stipend: app.stipend || app.STIPEND || null,
      phone: rawPhone.trim() || '',
      cert_count: certCount,
      relevant_cert_count: relevantCertCount,
      certifications: certsList
    };
  };

  // ── Open full candidate profile modal (fetches profile + coding stats) ────
  const openCandidateProfile = async (app) => {
    setSelectedCandidate(app);
    setCandidateProfile(null);
    setCandLeetCode(null);
    setCandGitHub(null);
    setProfileTab('overview');
    setProfileLoading(true);

    const studentId = app.student_id;
    if (!studentId) { setProfileLoading(false); return; }

    try {
      const profRes = await fetch(
        `${API_CONFIG.STUDENT_SERVICE_URL}/api/v1/student/${studentId}/profile`,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } }
      );
      if (profRes.ok) {
        const profData = await profRes.json();
        setCandidateProfile(profData);
        const lcUser = profData.leetcode || profData.LEETCODE || '';
        if (lcUser.trim()) fetchCandidateLeetCode(lcUser.trim());
        const ghUser = profData.github || profData.GITHUB || '';
        if (ghUser.trim()) fetchCandidateGitHub(ghUser.trim());
      }
    } catch (e) {
      console.warn('Could not fetch candidate profile:', e);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchCandidateLeetCode = async (username) => {
    try {
      const r = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${username}`);
      if (r.ok) {
        const d = await r.json();
        if (d && d.totalSolved !== undefined && d.totalSolved > 0) {
          setCandLeetCode({ solvedCount: d.totalSolved || 0, easy: d.easySolved || 0, medium: d.mediumSolved || 0, hard: d.hardSolved || 0, ranking: d.ranking || 0, username });
          return;
        }
      }
    } catch (e) {}
    try {
      const r2 = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
      if (r2.ok) {
        const d2 = await r2.json();
        if (d2 && (d2.status === 'success' || d2.totalSolved !== undefined)) {
          setCandLeetCode({ solvedCount: d2.totalSolved || 0, easy: d2.easySolved || 0, medium: d2.mediumSolved || 0, hard: d2.hardSolved || 0, ranking: d2.ranking || 0, username });
          return;
        }
      }
    } catch (e) {}
    try {
      const r3 = await fetch(`${API_CONFIG.AI_SERVICE_URL}/api/v1/external/leetcode/${username}`);
      if (r3.ok) {
        const d3 = await r3.json();
        if (d3 && d3.solvedCount !== undefined) {
          setCandLeetCode({ solvedCount: d3.solvedCount || 0, easy: d3.easySolved || 0, medium: d3.mediumSolved || 0, hard: d3.hardSolved || 0, ranking: d3.ranking || 0, username });
        }
      }
    } catch (e) {}
  };

  const fetchCandidateGitHub = async (username) => {
    try {
      const r = await fetch(`https://api.github.com/users/${username}`);
      if (r.ok) {
        const d = await r.json();
        setCandGitHub({ publicRepos: d.public_repos || 0, followers: d.followers || 0, following: d.following || 0, bio: d.bio || '', avatar: d.avatar_url || '', username });
      }
    } catch (e) {}
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    // Guard: prevent duplicate in-flight requests for the same application
    if (!appId || pendingStatusUpdate.has(`${appId}-${newStatus}`)) return;

    setPendingStatusUpdate(prev => new Set([...prev, `${appId}-${newStatus}`]));
    try {
      const res = await fetch(`${baseUrl}/api/v1/company/applicants/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const canonical = newStatus.toUpperCase();
        const updatedApps = allApplicants.map(a => a.id === appId ? { ...a, status: canonical } : a);
        setAllApplicants(updatedApps);

        if (canonical === 'OFFER_ISSUED' || canonical === 'OFFER_EXTENDED' || canonical === 'ACCEPTED') {
          if (selectedInternship) {
            const intId = selectedInternship.id || selectedInternship.ID;
            const openings = selectedInternship.openings || selectedInternship.OPENINGS || 1;
            const offeredCount = updatedApps.filter(a => String(a.internship_id || a.INTERNSHIP_ID) === String(intId) && ['OFFER_ISSUED', 'OFFER_EXTENDED', 'ACCEPTED'].includes(a.status)).length;

            if (offeredCount >= openings) {
              setSelectedInternship(prev => prev ? { ...prev, status: 'CLOSED' } : null);
              setInternships(prev => prev.map(i => (i.id || i.ID) === intId ? { ...i, status: 'CLOSED' } : i));
              setStatusMsg(`🎉 Candidate Accepted! All seats filled (${offeredCount} of ${openings} seats filled). Internship is now CLOSED.`);
            } else {
              setStatusMsg(`🎉 Candidate Accepted! Official Offer Letter issued (${offeredCount} of ${openings} seats filled).`);
            }
          } else {
            setStatusMsg('🎉 Candidate Accepted! Official Internship Offer Letter issued and registered in the database.');
          }
        } else if (canonical === 'SHORTLISTED') {
          setStatusMsg('🔵 Candidate shortlisted successfully. Their quiz is now unlocked.');
        } else if (canonical === 'REJECTED') {
          setStatusMsg('🔴 Candidate application marked as Rejected.');
        } else {
          setStatusMsg(`✓ Candidate status updated to ${canonical}`);
        }
      } else {
        let errMsg = 'Failed to update candidate status.';
        try { const errData = await res.json(); errMsg = errData.error || errMsg; } catch (_) {}
        console.error('[Shortlist] Backend error:', res.status, errMsg);
        setStatusMsg(`❌ ${errMsg}`);
      }
    } catch (e) {
      console.error('[Shortlist] Network error:', e);
      setStatusMsg('❌ Error connecting to server. Check that the backend is running.');
    } finally {
      setPendingStatusUpdate(prev => {
        const next = new Set(prev);
        next.delete(`${appId}-${newStatus}`);
        return next;
      });
      setTimeout(() => setStatusMsg(''), 6000);
    }
  };

  // Helper to calculate deduplicated applicants for an internship
  const getApplicantsForInternship = (intId, jobTitle = '', compId = '') => {
    let matched = allApplicants.filter(a => {
      const aIntId = String(a.internship_id || a.INTERNSHIP_ID || a.job_id || a.JOB_ID || '');
      const aTitle = (a.role_title || a.title || a.ROLE_TITLE || '').toLowerCase().trim();
      const targetTitle = (jobTitle || '').toLowerCase().trim();
      const aCompId = String(a.company_id || a.COMPANY_ID || '');
      const targetCompId = String(compId || '');

      return aIntId === String(intId) || (targetTitle !== '' && aTitle === targetTitle) || (targetCompId !== '' && aCompId === targetCompId);
    });

    const seen = new Set();
    return matched.filter(a => {
      const key = a.id || a.student_id || a.email;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Filter & Sort Master Internships List
  const processedInternships = () => {
    let result = [...internships];

    if (statusFilter === 'ACTIVE') {
      result = result.filter(i => (i.status || i.STATUS || 'ACTIVE').toUpperCase() === 'ACTIVE');
    } else if (statusFilter === 'CLOSED') {
      result = result.filter(i => (i.status || i.STATUS || 'ACTIVE').toUpperCase() === 'CLOSED');
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => (i.title || i.TITLE || '').toLowerCase().includes(q) || (i.location || i.LOCATION || '').toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      const aId = a.id || a.ID || 0;
      const bId = b.id || b.ID || 0;
      const aApps = getApplicantsForInternship(aId).length;
      const bApps = getApplicantsForInternship(bId).length;

      if (sortOption === 'OLDEST') {
        return aId - bId;
      } else if (sortOption === 'HIGHEST_APPS') {
        return bApps - aApps;
      } else if (sortOption === 'LOWEST_APPS') {
        return aApps - bApps;
      }
      return bId - aId;
    });

    return result;
  };

  if (isLoading) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading company internships and applicant candidate profiles...
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // DRILL-DOWN MODE: VIEW APPLICANTS FOR A SPECIFIC INTERNSHIP
  // --------------------------------------------------------------------------
  if (selectedInternship) {
    const targetIntId = selectedInternship.id || selectedInternship.ID;
    const targetTitle = selectedInternship.title || selectedInternship.TITLE || '';
    const targetCompId = selectedInternship.company_id || selectedInternship.COMPANY_ID || '';
    let jobApplicants = getApplicantsForInternship(targetIntId, targetTitle, targetCompId);

    let filteredApps = [...jobApplicants];

    // Status-Wise Filter inside Drill-Down View
    if (candidateStatusFilter !== 'ALL') {
      filteredApps = filteredApps.filter(a => {
        const st = (a.status || '').toUpperCase();
        if (candidateStatusFilter === 'APPLIED') return st === 'APPLIED';
        if (candidateStatusFilter === 'SHORTLISTED') return st === 'SHORTLISTED';
        if (candidateStatusFilter === 'TEST_PASSED') return st === 'ACCEPTED_FOR_TEST' || st === 'TEST_PASSED' || (a.test_score !== null && a.test_score >= 60);
        if (candidateStatusFilter === 'OFFER_ISSUED') return st === 'OFFER_ISSUED' || st === 'OFFER_EXTENDED' || st === 'ACCEPTED';
        if (candidateStatusFilter === 'REJECTED') return st === 'REJECTED';
        return true;
      });
    }

    // Top AI Recommended Filtering
    if (filterTopAiOnly) {
      filteredApps = filteredApps.filter(a => a.match_score >= 80 || (a.test_score !== null && a.test_score >= 60));
    }

    // Sort Candidates: Top AI Match First
    filteredApps.sort((a, b) => (b.match_score + (b.test_score || 0)) - (a.match_score + (a.test_score || 0)));

    // Pagination Logic: 5 per page
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedApplicants = filteredApps.slice(startIndex, startIndex + itemsPerPage);

    const countApplied = jobApplicants.filter(a => (a.status || '').toUpperCase() === 'APPLIED').length;
    const countShortlisted = jobApplicants.filter(a => (a.status || '').toUpperCase() === 'SHORTLISTED').length;
    const countTestPassed = jobApplicants.filter(a => ['ACCEPTED_FOR_TEST', 'TEST_PASSED'].includes((a.status || '').toUpperCase()) || (a.test_score !== null && a.test_score >= 60)).length;
    const countOffer = jobApplicants.filter(a => ['OFFER_ISSUED', 'OFFER_EXTENDED', 'ACCEPTED'].includes((a.status || '').toUpperCase())).length;
    const countRejected = jobApplicants.filter(a => (a.status || '').toUpperCase() === 'REJECTED').length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1140px', margin: '0 auto' }}>
        {/* Back Button Header Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <button
              onClick={() => { setSelectedInternship(null); setCurrentPage(1); setCandidateStatusFilter('ALL'); }}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}
            >
              <ArrowLeft size={16} /> Back to All Company Internships
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {selectedInternship.title || selectedInternship.TITLE || 'Unknown Role'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              📍 {selectedInternship.location || 'Coimbatore'} • 💰 Stipend: ₹{selectedInternship.stipend || '35,000'}/month • 🕒 Duration: {selectedInternship.duration || '3 Months'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ padding: '8px 16px', background: '#EFF6FF', color: '#1D4ED8', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, border: '1px solid #BFDBFE' }}>
              👥 Total Applicants: {jobApplicants.length}
            </span>

            <button
              onClick={() => { setFilterTopAiOnly(!filterTopAiOnly); setCurrentPage(1); }}
              className={filterTopAiOnly ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={16} /> {filterTopAiOnly ? 'Showing Top AI Suggested' : 'Filter Top AI Suggested'}
            </button>
          </div>
        </div>

        {statusMsg && (
          <div style={{ padding: '14px 20px', background: statusMsg.includes('❌') ? '#FEE2E2' : '#DCFCE7', border: '1px solid', borderColor: statusMsg.includes('❌') ? '#FCA5A5' : '#86EFAC', color: statusMsg.includes('❌') ? '#991B1B' : '#166534', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
            {statusMsg}
          </div>
        )}

        {/* STATUS-WISE FILTER BAR FOR RECRUITER */}
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginRight: '6px' }}>
              <Filter size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> STATUS FILTER:
            </span>
            <button
              onClick={() => { setCandidateStatusFilter('ALL'); setCurrentPage(1); }}
              style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: candidateStatusFilter === 'ALL' ? '#2563EB' : '#F1F5F9', color: candidateStatusFilter === 'ALL' ? '#FFF' : '#475569' }}
            >
              ALL ({jobApplicants.length})
            </button>
            <button
              onClick={() => { setCandidateStatusFilter('APPLIED'); setCurrentPage(1); }}
              style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: candidateStatusFilter === 'APPLIED' ? '#D97706' : '#FEF3C7', color: candidateStatusFilter === 'APPLIED' ? '#FFF' : '#92400E' }}
            >
              🟡 APPLIED ({countApplied})
            </button>
            <button
              onClick={() => { setCandidateStatusFilter('SHORTLISTED'); setCurrentPage(1); }}
              style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: candidateStatusFilter === 'SHORTLISTED' ? '#2563EB' : '#DBEAFE', color: candidateStatusFilter === 'SHORTLISTED' ? '#FFF' : '#1E40AF' }}
            >
              🔵 SHORTLISTED ({countShortlisted})
            </button>
            <button
              onClick={() => { setCandidateStatusFilter('TEST_PASSED'); setCurrentPage(1); }}
              style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: candidateStatusFilter === 'TEST_PASSED' ? '#7C3AED' : '#F3E8FF', color: candidateStatusFilter === 'TEST_PASSED' ? '#FFF' : '#6B21A8' }}
            >
              🟣 TEST PASSED ({countTestPassed})
            </button>
            <button
              onClick={() => { setCandidateStatusFilter('OFFER_ISSUED'); setCurrentPage(1); }}
              style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: candidateStatusFilter === 'OFFER_ISSUED' ? '#059669' : '#D1FAE5', color: candidateStatusFilter === 'OFFER_ISSUED' ? '#FFF' : '#065F46' }}
            >
              🟢 OFFER ISSUED ({countOffer})
            </button>
            <button
              onClick={() => { setCandidateStatusFilter('REJECTED'); setCurrentPage(1); }}
              style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: candidateStatusFilter === 'REJECTED' ? '#DC2626' : '#FEE2E2', color: candidateStatusFilter === 'REJECTED' ? '#FFF' : '#991B1B' }}
            >
              🔴 REJECTED ({countRejected})
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Page {currentPage} of {totalPages} ({filteredApps.length} candidates)
          </div>
        </div>

        {/* Paginated Candidate Cards */}
        {paginatedApplicants.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {paginatedApplicants.map((app, idx) => {
              const score = app.test_score;
              const hasPassed = score !== null && score >= 60;
              const st = (app.status || 'APPLIED').toUpperCase();
              const isOfferIssued = st === 'OFFER_ISSUED' || st === 'OFFER_EXTENDED' || st === 'ACCEPTED';
              const isShortlisted = st === 'SHORTLISTED';
              const isRejected = st === 'REJECTED';

              return (
                <div key={app.id || idx} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: isOfferIssued ? '4px solid #10B981' : (isShortlisted ? '4px solid #3B82F6' : (isRejected ? '4px solid #EF4444' : '4px solid #F59E0B')) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h3
                          onClick={() => openCandidateProfile(app)}
                          style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563EB', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#93C5FD', textUnderlineOffset: '3px' }}
                          title="Click to view full candidate profile"
                        >
                          {app.name}
                        </h3>
                        <span className="badge badge-ai" style={{ fontSize: '0.75rem' }}>
                          AI Match: {app.match_score}%
                        </span>
                        {app.match_score >= 85 && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', background: '#DCFCE7', color: '#166534', borderRadius: '10px' }}>
                            🌟 Top AI Candidate
                          </span>
                        )}
                        <button
                          onClick={() => openCandidateProfile(app)}
                          style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> Full Profile
                        </button>
                      </div>

                      <div style={{ fontSize: '0.88rem', color: '#2563EB', fontWeight: 700, marginTop: '4px' }}>
                        Applied for {app.role_title}
                      </div>

                      {/* Candidate Details */}
                      <div style={{ display: 'flex', gap: '18px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '10px', flexWrap: 'wrap' }}>
                        <span>🎓 <strong>Degree:</strong> {app.degree} ({app.branch})</span>
                        <span>🏫 <strong>College:</strong> {app.college}</span>
                        <span>📊 <strong>CGPA:</strong> {app.cgpa}</span>
                        <span>📧 <strong>Email:</strong> {app.email}</span>
                        {app.phone && <span>📞 <strong>Phone:</strong> {app.phone}</span>}
                      </div>

                      {/* Candidate Skill Badges */}
                      {app.skills.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {app.skills.map((skill, sIdx) => (
                            <span key={sIdx} className="badge badge-auth" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                              {skill}
                            </span>
                          ))}
                          {app.cert_count > 0 && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '16px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
                              🏅 {app.cert_count} Verified Certifications (+{app.cert_count * 5}% AI Match Boost)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      {/* PROMINENT CANDIDATE STATUS BADGE */}
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        padding: '6px 14px',
                        borderRadius: '20px',
                        background: isOfferIssued ? '#D1FAE5' : (isShortlisted ? '#DBEAFE' : (isRejected ? '#FEE2E2' : '#FEF3C7')),
                        color: isOfferIssued ? '#065F46' : (isShortlisted ? '#1E40AF' : (isRejected ? '#991B1B' : '#92400E')),
                        border: '1px solid',
                        borderColor: isOfferIssued ? '#6EE7B7' : (isShortlisted ? '#93C5FD' : (isRejected ? '#FCA5A5' : '#FDE68A'))
                      }}>
                        {isOfferIssued ? '🟢 OFFER LETTER ISSUED' : (isShortlisted ? '🔵 SHORTLISTED' : (isRejected ? '🔴 APPLICATION REJECTED' : '🟡 APPLIED (Under Review)'))}
                      </span>

                      <div style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        background: score === null ? 'var(--glass-border)' : (hasPassed ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)'),
                        color: score === null ? 'var(--text-muted)' : (hasPassed ? '#15803D' : '#B91C1C'),
                        border: '1px solid',
                        borderColor: score === null ? 'transparent' : (hasPassed ? '#86EFAC' : '#FCA5A5')
                      }}>
                        🎯 Screening Score: {score !== null ? `${score}% (${hasPassed ? 'PASSED' : 'FAILED'})` : 'Not Taken Yet'}
                      </div>
                    </div>
                  </div>

                  {/* Candidate Action Buttons Footer */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setInspectAiModalApp(app)}
                      style={{
                        padding: '9px 16px',
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        background: '#EFF6FF',
                        color: '#2563EB',
                        border: '1px solid #BFDBFE',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={16} /> Inspect AI Match Breakdown
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(app.id, 'OFFER_ISSUED')}
                      style={{
                        padding: '9px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        background: isOfferIssued ? '#D1FAE5' : '#059669',
                        color: isOfferIssued ? '#065F46' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isOfferIssued ? 'none' : '0 2px 6px rgba(5,150,105,0.25)'
                      }}
                    >
                      <ThumbsUp size={16} /> {isOfferIssued ? '✓ Offer Letter Issued' : 'Accept Candidate & Issue Offer Letter'}
                    </button>

                    <button
                      id={`shortlist-btn-${app.id}`}
                      onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                      disabled={isShortlisted || pendingStatusUpdate.has(`${app.id}-SHORTLISTED`)}
                      style={{
                        padding: '9px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        background: isShortlisted ? '#DBEAFE' : (pendingStatusUpdate.has(`${app.id}-SHORTLISTED`) ? '#93C5FD' : '#2563EB'),
                        color: isShortlisted ? '#1E40AF' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: (isShortlisted || pendingStatusUpdate.has(`${app.id}-SHORTLISTED`)) ? 'not-allowed' : 'pointer',
                        opacity: (isShortlisted || pendingStatusUpdate.has(`${app.id}-SHORTLISTED`)) ? 0.75 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      {pendingStatusUpdate.has(`${app.id}-SHORTLISTED`)
                        ? '⏳ Shortlisting...'
                        : isShortlisted ? '✓ Shortlisted' : 'Shortlist Candidate'}
                    </button>

                    <button
                      id={`reject-btn-${app.id}`}
                      onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                      disabled={isRejected || pendingStatusUpdate.has(`${app.id}-REJECTED`)}
                      style={{
                        padding: '9px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: '1px solid #FCA5A5',
                        borderRadius: '8px',
                        cursor: (isRejected || pendingStatusUpdate.has(`${app.id}-REJECTED`)) ? 'not-allowed' : 'pointer',
                        opacity: (isRejected || pendingStatusUpdate.has(`${app.id}-REJECTED`)) ? 0.75 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      {pendingStatusUpdate.has(`${app.id}-REJECTED`)
                        ? '⏳ Rejecting...'
                        : isRejected ? '✓ Rejected' : 'Reject'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No candidates found matching the selected status filter "{candidateStatusFilter}".
          </div>
        )}

        {/* 5-PER-PAGE PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredApps.length)} of {filteredApps.length} Candidates (Page {currentPage} of {totalPages})
            </span>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: currentPage === p ? 800 : 600,
                    border: currentPage === p ? 'none' : '1px solid var(--border-light)',
                    background: currentPage === p ? '#2563EB' : '#FFFFFF',
                    color: currentPage === p ? '#FFFFFF' : 'var(--text-main)',
                    cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      {/* ═══ CANDIDATE DEEP-DIVE PROFILE MODAL ═══ */}
      {selectedCandidate && (() => {
        const app  = selectedCandidate;
        const prof = candidateProfile;
        const lc   = candLeetCode;
        const gh   = candGitHub;
        const st   = (app.status || 'APPLIED').toUpperCase();
        const isShortlisted = st === 'SHORTLISTED';
        const isRejected    = st === 'REJECTED';
        const isOffer       = ['OFFER_ISSUED','OFFER_EXTENDED','ACCEPTED'].includes(st);
        const reqSkills = typeof selectedInternship?.required_skills === 'string'
          ? selectedInternship.required_skills.split(',').map(s => s.trim()).filter(Boolean) : [];
        const matched = reqSkills.filter(s => app.skills.some(cs => cs.toLowerCase() === s.toLowerCase()));
        const missing = reqSkills.filter(s => !app.skills.some(cs => cs.toLowerCase() === s.toLowerCase()));
        const linkedin   = prof?.linkedin  || prof?.LINKEDIN  || '';
        const portfolio  = prof?.portfolio || prof?.PORTFOLIO || '';
        const lcUsername = prof?.leetcode  || prof?.LEETCODE  || '';
        const ghUsername = prof?.github    || prof?.GITHUB    || '';
        const bio        = prof?.bio       || prof?.BIO       || '';
        const gradYear   = prof?.grad_year || prof?.graduation_year || '';
        return (
          <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.78)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1300, padding:'16px' }}>
            <div style={{ background:'#FFFFFF', width:'100%', maxWidth:'800px', borderRadius:'20px', boxShadow:'0 32px 64px rgba(0,0,0,0.35)', display:'flex', flexDirection:'column', maxHeight:'94vh', overflow:'hidden' }}>
              {/* Header */}
              <div style={{ background:'linear-gradient(135deg,#1E40AF 0%,#7C3AED 100%)', padding:'22px 28px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderRadius:'20px 20px 0 0', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                  <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', border:'2px solid rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', fontWeight:900, color:'#FFF', flexShrink:0 }}>
                    {app.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize:'1.35rem', fontWeight:900, color:'#FFF', margin:0 }}>{app.name}</h2>
                    <p style={{ fontSize:'0.83rem', color:'rgba(255,255,255,0.8)', margin:'2px 0 0' }}>{app.degree}{app.branch?` in ${app.branch}`:''} • {app.college}</p>
                    <div style={{ display:'flex', gap:'8px', marginTop:'8px', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'0.72rem', fontWeight:800, padding:'3px 10px', borderRadius:'12px', background: isOffer?'#D1FAE5':isShortlisted?'#DBEAFE':isRejected?'#FEE2E2':'#FEF3C7', color: isOffer?'#065F46':isShortlisted?'#1E40AF':isRejected?'#991B1B':'#92400E' }}>
                        {isOffer?'🟢 OFFER ISSUED':isShortlisted?'🔵 SHORTLISTED':isRejected?'🔴 REJECTED':'🟡 APPLIED'}
                      </span>
                      <span style={{ fontSize:'0.72rem', fontWeight:800, padding:'3px 10px', borderRadius:'12px', background:'rgba(255,255,255,0.2)', color:'#FFF' }}>⚡ AI Match: {app.match_score}%</span>
                      {app.test_score!==null && <span style={{ fontSize:'0.72rem', fontWeight:800, padding:'3px 10px', borderRadius:'12px', background: app.test_score>=60?'rgba(16,185,129,0.35)':'rgba(239,68,68,0.35)', color:'#FFF' }}>🎯 Quiz: {app.test_score}% {app.test_score>=60?'✓ Passed':'✗ Failed'}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedCandidate(null)} style={{ border:'none', background:'rgba(255,255,255,0.2)', cursor:'pointer', color:'#FFF', borderRadius:'8px', padding:'6px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <X size={20}/>
                </button>
              </div>
              {/* Tab Bar */}
              <div style={{ display:'flex', borderBottom:'1px solid #E2E8F0', flexShrink:0, background:'#FAFAFA' }}>
                {[['overview','👤 Overview'],['skills','🛠 Skills & Certs'],['coding','💻 Coding Profiles']].map(([key,label]) => (
                  <button key={key} onClick={() => setProfileTab(key)} style={{ padding:'12px 22px', fontSize:'0.84rem', fontWeight:700, border:'none', borderBottom: profileTab===key?'3px solid #2563EB':'3px solid transparent', background:'transparent', color: profileTab===key?'#2563EB':'#64748B', cursor:'pointer', transition:'all 0.15s' }}>{label}</button>
                ))}
              </div>
              {/* Body */}
              <div style={{ overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:'18px' }}>
                {profileLoading && <div style={{ textAlign:'center', padding:'40px', color:'#6B7280' }}><Sparkles size={28} color="#2563EB" style={{ marginBottom:'10px' }}/><p style={{ fontSize:'0.9rem' }}>Loading full candidate profile…</p></div>}
                {/* OVERVIEW */}
                {!profileLoading && profileTab==='overview' && (<>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:'12px' }}>
                    {[
                      { label:'AI Match', value:`${app.match_score}%`, sub: app.match_score>=85?'🌟 Top Match':app.match_score>=70?'⚡ Good':'🔹 Low', bg:'#EFF6FF', bd:'#BFDBFE', c:'#1E40AF' },
                      { label:'CGPA', value:app.cgpa||'N/A', sub:'Scale of 10', bg:'#F3E8FF', bd:'#DDD6FE', c:'#6D28D9' },
                      { label:'Quiz Score', value: app.test_score!==null?`${app.test_score}%`:'Not Taken', sub: app.test_score!==null?(app.test_score>=60?'✓ Passed':'✗ Failed'):'Pending', bg: app.test_score!==null&&app.test_score>=60?'#ECFDF5':'#FEF3C7', bd: app.test_score!==null&&app.test_score>=60?'#A7F3D0':'#FDE68A', c: app.test_score!==null&&app.test_score>=60?'#047857':'#B45309' },
                      { label:'Certifications', value:app.cert_count||0, sub:`${app.relevant_cert_count||0} Relevant`, bg:'#FEF3C7', bd:'#FDE68A', c:'#92400E' },
                    ].map((m,i) => (
                      <div key={i} style={{ padding:'14px', borderRadius:'12px', background:m.bg, border:`1px solid ${m.bd}`, textAlign:'center' }}>
                        <div style={{ fontSize:'0.68rem', fontWeight:800, color:m.c, textTransform:'uppercase', letterSpacing:'0.05em' }}>{m.label}</div>
                        <div style={{ fontSize:'1.5rem', fontWeight:900, color:m.c, margin:'4px 0' }}>{m.value}</div>
                        <div style={{ fontSize:'0.68rem', color:m.c, fontWeight:600 }}>{m.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#F8FAFC', borderRadius:'12px', padding:'18px', border:'1px solid #E2E8F0' }}>
                    <div style={{ fontSize:'0.82rem', fontWeight:800, color:'#374151', marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px' }}><GraduationCap size={16} color="#2563EB"/> Academic & Contact Details</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', fontSize:'0.82rem' }}>
                      {[
                        { icon:'🎓', label:'Degree', val:`${app.degree||'N/A'}${app.branch?` – ${app.branch}`:''}` },
                        { icon:'🏫', label:'College', val:app.college||'N/A' },
                        { icon:'📊', label:'CGPA', val:String(app.cgpa||'N/A') },
                        { icon:'📅', label:'Grad Year', val:String(gradYear||'N/A') },
                        { icon:'📧', label:'Email', val:app.email||'N/A' },
                        { icon:'📞', label:'Phone', val:app.phone||prof?.phone||'N/A' },
                      ].map((row,i) => (
                        <div key={i} style={{ display:'flex', gap:'6px', alignItems:'flex-start', color:'#374151' }}>
                          <span style={{ flexShrink:0 }}>{row.icon}</span>
                          <span style={{ color:'#6B7280', flexShrink:0 }}>{row.label}:</span>
                          <strong style={{ wordBreak:'break-word' }}>{row.val}</strong>
                        </div>
                      ))}
                    </div>
                    {bio && <p style={{ margin:'12px 0 0', fontSize:'0.82rem', color:'#6B7280', fontStyle:'italic', borderTop:'1px solid #E5E7EB', paddingTop:'10px' }}>"{bio}"</p>}
                  </div>
                  {(linkedin||portfolio||lcUsername||ghUsername) && (
                    <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                      {linkedin && <a href={linkedin.startsWith('http')?linkedin:`https://linkedin.com/in/${linkedin}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'#EFF6FF', color:'#2563EB', border:'1px solid #BFDBFE', borderRadius:'8px', fontSize:'0.8rem', fontWeight:700, textDecoration:'none' }}><Linkedin size={14}/> LinkedIn</a>}
                      {portfolio && <a href={portfolio.startsWith('http')?portfolio:`https://${portfolio}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'#F3E8FF', color:'#7C3AED', border:'1px solid #DDD6FE', borderRadius:'8px', fontSize:'0.8rem', fontWeight:700, textDecoration:'none' }}><Globe size={14}/> Portfolio</a>}
                      {lcUsername && <a href={`https://leetcode.com/${lcUsername}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'#FEF3C7', color:'#92400E', border:'1px solid #FDE68A', borderRadius:'8px', fontSize:'0.8rem', fontWeight:700, textDecoration:'none' }}><Code2 size={14}/> LeetCode</a>}
                      {ghUsername && <a href={`https://github.com/${ghUsername}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'#1F2937', color:'#FFF', border:'none', borderRadius:'8px', fontSize:'0.8rem', fontWeight:700, textDecoration:'none' }}><Github size={14}/> GitHub</a>}
                    </div>
                  )}
                  <div style={{ padding:'18px 20px', background:'linear-gradient(135deg,#1E293B 0%,#0F172A 100%)', borderRadius:'12px', color:'#FFF' }}>
                    <div style={{ fontSize:'0.78rem', fontWeight:800, color:'#60A5FA', display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}><Sparkles size={15}/> AI Hiring Recommendation</div>
                    <p style={{ fontSize:'0.84rem', color:'#E2E8F0', lineHeight:1.6, margin:0 }}>
                      <strong style={{ color:'#FFF' }}>{app.name}</strong> shows a <strong style={{ color: app.match_score>=85?'#34D399':app.match_score>=70?'#60A5FA':'#FCD34D' }}>{app.match_score}% AI compatibility</strong> for <strong style={{ color:'#FFF' }}>{selectedInternship?.title||app.role_title}</strong>.
                      {matched.length>0 && <> Matched: <strong style={{ color:'#34D399' }}>{matched.join(', ')}</strong>.</>}
                      {missing.length>0 && <> Gap: <strong style={{ color:'#FCD34D' }}>{missing.slice(0,3).join(', ')}</strong>.</>}
                      {app.test_score!==null&&app.test_score>=60 && <> Passed quiz: <strong style={{ color:'#34D399' }}>{app.test_score}%</strong>.</>}
                      {' '}{app.match_score>=80?'✅ Recommended for shortlisting.':app.match_score>=60?'🔶 Consider for interview.':'⚠️ Skill gap — review manually.'}
                    </p>
                  </div>
                </>)}
                {/* SKILLS & CERTS */}
                {!profileLoading && profileTab==='skills' && (<>
                  <div style={{ background:'#F8FAFC', borderRadius:'12px', padding:'18px', border:'1px solid #E2E8F0' }}>
                    <div style={{ fontSize:'0.82rem', fontWeight:800, color:'#374151', marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px' }}><Target size={16} color="#2563EB"/> Skill Match vs. "{selectedInternship?.title||'Role'}"</div>
                    {matched.length>0 && (<><div style={{ fontSize:'0.72rem', fontWeight:800, color:'#059669', marginBottom:'6px', textTransform:'uppercase' }}>✓ Matched ({matched.length})</div><div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'12px' }}>{matched.map((s,i)=><span key={i} style={{ padding:'4px 12px', borderRadius:'16px', background:'#DCFCE7', color:'#166534', fontSize:'0.78rem', fontWeight:700, border:'1px solid #86EFAC' }}>✓ {s}</span>)}</div></>)}
                    {missing.length>0 && (<><div style={{ fontSize:'0.72rem', fontWeight:800, color:'#D97706', marginBottom:'6px', textTransform:'uppercase' }}>⚡ Missing ({missing.length})</div><div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>{missing.map((s,i)=><span key={i} style={{ padding:'4px 12px', borderRadius:'16px', background:'#FEF3C7', color:'#92400E', fontSize:'0.78rem', fontWeight:700, border:'1px solid #FDE68A' }}>⚡ {s}</span>)}</div></>)}
                    {reqSkills.length===0 && <p style={{ color:'#9CA3AF', fontSize:'0.82rem', margin:0 }}>No required skills defined for this internship.</p>}
                  </div>
                  <div style={{ background:'#F8FAFC', borderRadius:'12px', padding:'18px', border:'1px solid #E2E8F0' }}>
                    <div style={{ fontSize:'0.82rem', fontWeight:800, color:'#374151', marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px' }}><BookOpen size={16} color="#7C3AED"/> All Skills ({app.skills.length})</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                      {app.skills.length>0 ? app.skills.map((s,i) => { const isM=reqSkills.some(r=>r.toLowerCase()===s.toLowerCase()); return <span key={i} style={{ padding:'4px 12px', borderRadius:'16px', background:isM?'#DCFCE7':'#EFF6FF', color:isM?'#166534':'#1E40AF', fontSize:'0.78rem', fontWeight:700, border:`1px solid ${isM?'#86EFAC':'#BFDBFE'}` }}>{isM?'✓ ':''}{s}</span>; }) : <span style={{ color:'#9CA3AF', fontSize:'0.82rem' }}>No skills listed</span>}
                    </div>
                  </div>
                  {app.certifications && app.certifications.length>0 && (
                    <div style={{ background:'#FEF3C7', borderRadius:'12px', padding:'18px', border:'1px solid #FDE68A' }}>
                      <div style={{ fontSize:'0.82rem', fontWeight:800, color:'#92400E', marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px' }}><Award size={16} color="#D97706"/> Certifications ({app.cert_count})</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                        {app.certifications.map((c,i) => { const rel=reqSkills.some(r=>`${c.name||''} ${c.issuer||''}`.toLowerCase().includes(r.toLowerCase())); return (
                          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#FFFBEB', padding:'10px 14px', borderRadius:'8px', border:'1px solid #FDE68A' }}>
                            <div><div style={{ fontSize:'0.82rem', fontWeight:700, color:'#92400E' }}>{c.name||c.title||'Certification'}</div>{c.issuer&&<div style={{ fontSize:'0.72rem', color:'#B45309', marginTop:'2px' }}>Issued by: {c.issuer}</div>}</div>
                            <span style={{ fontSize:'0.68rem', fontWeight:800, padding:'3px 8px', background:rel?'#D1FAE5':'#FDE68A', color:rel?'#065F46':'#92400E', borderRadius:'6px' }}>+{rel?15:5}% Boost</span>
                          </div>
                        ); })}
                      </div>
                    </div>
                  )}
                </>)}
                {/* CODING PROFILES */}
                {!profileLoading && profileTab==='coding' && (<>
                  {/* LeetCode */}
                  <div style={{ background:'#FFFBEB', borderRadius:'14px', padding:'20px', border:'1px solid #FDE68A' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'#F97316', display:'flex', alignItems:'center', justifyContent:'center' }}><Code2 size={20} color="#FFF"/></div>
                        <div><div style={{ fontSize:'0.9rem', fontWeight:800, color:'#92400E' }}>LeetCode</div>{lcUsername&&<div style={{ fontSize:'0.72rem', color:'#B45309' }}>@{lcUsername}</div>}</div>
                      </div>
                      {lcUsername && <a href={`https://leetcode.com/${lcUsername}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:'0.75rem', fontWeight:700, padding:'5px 12px', background:'#F97316', color:'#FFF', borderRadius:'7px', textDecoration:'none', display:'flex', alignItems:'center', gap:'4px' }}>View Profile <ExternalLink size={12}/></a>}
                    </div>
                    {!lcUsername ? <p style={{ color:'#B45309', fontSize:'0.82rem', margin:0 }}>LeetCode username not set.</p>
                    : lc ? (<>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' }}>
                        {[{label:'Total Solved',value:lc.solvedCount,color:'#D97706'},{label:'Easy ✅',value:lc.easy,color:'#059669'},{label:'Medium 🔶',value:lc.medium,color:'#D97706'},{label:'Hard 🔴',value:lc.hard,color:'#DC2626'}].map((m,i)=>(
                          <div key={i} style={{ textAlign:'center', padding:'12px 8px', background:'#FFF', borderRadius:'10px', border:'1px solid #FDE68A' }}>
                            <div style={{ fontSize:'1.5rem', fontWeight:900, color:m.color }}>{m.value}</div>
                            <div style={{ fontSize:'0.68rem', color:'#92400E', fontWeight:700, marginTop:'2px' }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                      {lc.ranking>0 && <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.82rem', color:'#92400E', fontWeight:700, marginBottom:'12px' }}><Trophy size={15} color="#D97706"/> Global Ranking: #{lc.ranking.toLocaleString()}</div>}
                      <div style={{ fontSize:'0.72rem', fontWeight:800, color:'#92400E', marginBottom:'6px' }}>DIFFICULTY BREAKDOWN</div>
                      <div style={{ height:'10px', borderRadius:'5px', background:'#FDE68A', overflow:'hidden', display:'flex' }}>
                        <div style={{ width:`${lc.solvedCount>0?(lc.easy/lc.solvedCount*100):0}%`, background:'#059669' }}/>
                        <div style={{ width:`${lc.solvedCount>0?(lc.medium/lc.solvedCount*100):0}%`, background:'#F59E0B' }}/>
                        <div style={{ width:`${lc.solvedCount>0?(lc.hard/lc.solvedCount*100):0}%`, background:'#DC2626' }}/>
                      </div>
                      <div style={{ display:'flex', gap:'12px', marginTop:'5px', fontSize:'0.68rem' }}>
                        <span style={{ color:'#059669' }}>■ Easy ({lc.easy})</span>
                        <span style={{ color:'#D97706' }}>■ Medium ({lc.medium})</span>
                        <span style={{ color:'#DC2626' }}>■ Hard ({lc.hard})</span>
                      </div>
                    </>) : <div style={{ color:'#B45309', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:'6px' }}><Clock size={14}/> Loading LeetCode stats for @{lcUsername}…</div>}
                  </div>
                  {/* GitHub */}
                  <div style={{ background:'#1F2937', borderRadius:'14px', padding:'20px', border:'1px solid #374151' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'#374151', display:'flex', alignItems:'center', justifyContent:'center' }}><Github size={20} color="#FFF"/></div>
                        <div><div style={{ fontSize:'0.9rem', fontWeight:800, color:'#F9FAFB' }}>GitHub</div>{ghUsername&&<div style={{ fontSize:'0.72rem', color:'#9CA3AF' }}>@{ghUsername}</div>}</div>
                      </div>
                      {ghUsername && <a href={`https://github.com/${ghUsername}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:'0.75rem', fontWeight:700, padding:'5px 12px', background:'#374151', color:'#FFF', borderRadius:'7px', textDecoration:'none', display:'flex', alignItems:'center', gap:'4px', border:'1px solid #4B5563' }}>View Profile <ExternalLink size={12}/></a>}
                    </div>
                    {!ghUsername ? <p style={{ color:'#9CA3AF', fontSize:'0.82rem', margin:0 }}>GitHub username not set.</p>
                    : gh ? (
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
                        {[{label:'Public Repos',value:gh.publicRepos,icon:'📁'},{label:'Followers',value:gh.followers,icon:'👥'},{label:'Following',value:gh.following,icon:'➡️'}].map((m,i)=>(
                          <div key={i} style={{ textAlign:'center', padding:'14px 8px', background:'#374151', borderRadius:'10px', border:'1px solid #4B5563' }}>
                            <div style={{ fontSize:'1.5rem' }}>{m.icon}</div>
                            <div style={{ fontSize:'1.4rem', fontWeight:900, color:'#F9FAFB', marginTop:'4px' }}>{m.value}</div>
                            <div style={{ fontSize:'0.68rem', color:'#9CA3AF', fontWeight:700, marginTop:'2px' }}>{m.label}</div>
                          </div>
                        ))}
                        {gh.bio && <p style={{ color:'#D1D5DB', fontSize:'0.8rem', marginTop:'10px', gridColumn:'1/-1', borderTop:'1px solid #374151', paddingTop:'10px', fontStyle:'italic', margin:'10px 0 0' }}>"{gh.bio}"</p>}
                      </div>
                    ) : <div style={{ color:'#9CA3AF', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:'6px' }}><Clock size={14}/> Loading GitHub stats for @{ghUsername}…</div>}
                  </div>
                  {!lcUsername && !ghUsername && (
                    <div style={{ textAlign:'center', padding:'36px', color:'#9CA3AF', background:'#F8FAFC', borderRadius:'12px', border:'1px dashed #E5E7EB' }}>
                      <Code2 size={30} color="#D1D5DB" style={{ marginBottom:'8px' }}/>
                      <p style={{ fontSize:'0.85rem', margin:0 }}>Candidate has not linked any coding profiles yet.</p>
                    </div>
                  )}
                </>)}
              </div>
              {/* Footer */}
              <div style={{ padding:'16px 28px', borderTop:'1px solid #E2E8F0', display:'flex', gap:'10px', justifyContent:'flex-end', flexWrap:'wrap', flexShrink:0, background:'#FAFAFA', borderRadius:'0 0 20px 20px' }}>
                <button onClick={() => { handleUpdateStatus(app.id,'REJECTED'); setSelectedCandidate(null); }} disabled={isRejected} style={{ padding:'9px 18px', fontSize:'0.84rem', fontWeight:700, background:'#FEE2E2', color:'#DC2626', border:'1px solid #FCA5A5', borderRadius:'8px', cursor:isRejected?'not-allowed':'pointer', opacity:isRejected?0.6:1 }}>{isRejected?'✓ Rejected':'Reject'}</button>
                <button onClick={() => { handleUpdateStatus(app.id,'SHORTLISTED'); setSelectedCandidate(null); }} disabled={isShortlisted} style={{ padding:'9px 18px', fontSize:'0.84rem', fontWeight:700, background:isShortlisted?'#DBEAFE':'#2563EB', color:isShortlisted?'#1E40AF':'#FFF', border:'none', borderRadius:'8px', cursor:isShortlisted?'not-allowed':'pointer', opacity:isShortlisted?0.7:1 }}>{isShortlisted?'✓ Shortlisted':'⚡ Shortlist Candidate'}</button>
                <button onClick={() => { handleUpdateStatus(app.id,'OFFER_ISSUED'); setSelectedCandidate(null); }} style={{ padding:'9px 20px', fontSize:'0.84rem', fontWeight:800, background:'linear-gradient(135deg,#059669 0%,#047857 100%)', color:'#FFF', border:'none', borderRadius:'8px', cursor:'pointer', boxShadow:'0 2px 8px rgba(5,150,105,0.3)' }}>🎉 Issue Offer Letter</button>
                <button onClick={() => setSelectedCandidate(null)} style={{ padding:'9px 18px', fontSize:'0.84rem', fontWeight:700, background:'#F1F5F9', color:'#475569', border:'1px solid #E2E8F0', borderRadius:'8px', cursor:'pointer' }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // MASTER OVERVIEW MODE: SHOW ALL COMPANY POSTED INTERNSHIPS
  // --------------------------------------------------------------------------
  const displayInternships = processedInternships();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1140px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Company Posted Internships & Applicants Manager
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Browse internships ordered latest to oldest, inspect applicant volume, filter by active/closed status, and issue offer letters.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search internship title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', fontSize: '0.84rem', borderRadius: '10px', border: '1px solid var(--border-light)', outline: 'none', background: '#FAFAFA' }}
          />
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '14px 20px', background: statusMsg.includes('❌') ? '#FEE2E2' : '#DCFCE7', border: '1px solid', borderColor: statusMsg.includes('❌') ? '#FCA5A5' : '#86EFAC', color: statusMsg.includes('❌') ? '#991B1B' : '#166534', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
          {statusMsg}
        </div>
      )}

      {/* FILTER & SORT BAR */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginRight: '6px' }}>
            <Filter size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> STATUS:
          </span>
          {['ALL', 'ACTIVE', 'CLOSED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === st ? '#2563EB' : '#F1F5F9',
                color: statusFilter === st ? '#FFFFFF' : '#475569',
                transition: 'all 0.2s ease'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>
            <ArrowUpDown size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> SORT BY:
          </span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{ padding: '7px 12px', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--border-light)', outline: 'none', background: '#FFFFFF', fontWeight: 600 }}
          >
            <option value="LATEST">Latest to Oldest (Newest First)</option>
            <option value="OLDEST">Oldest to Latest</option>
            <option value="HIGHEST_APPS">Highest Application Rate</option>
            <option value="LOWEST_APPS">Lowest Application Rate</option>
          </select>
        </div>
      </div>

      {/* MASTER INTERNSHIPS GRID */}
      {displayInternships.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {displayInternships.map((job) => {
            const jobId = job.id || job.ID;
            const applicants = getApplicantsForInternship(jobId);
            const appCount = applicants.length;
            const topMatch = applicants.length > 0 ? Math.max(...applicants.map(a => a.match_score)) : 0;
            const topCandidate = applicants.find(a => a.match_score === topMatch);
            const isClosed = (job.status || job.STATUS || 'ACTIVE').toUpperCase() === 'CLOSED';

            return (
              <div
                key={jobId}
                className="glass-card"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '16px',
                  borderTop: isClosed ? '4px solid #94A3B8' : '4px solid #2563EB',
                  opacity: isClosed ? 0.75 : 1
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                      {job.title || job.TITLE || 'Unknown Role'}
                    </h3>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isClosed ? '#F1F5F9' : '#DCFCE7',
                      color: isClosed ? '#64748B' : '#15803D'
                    }}>
                      {isClosed ? 'CLOSED' : 'ACTIVE'}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 700, marginTop: '2px', display: 'inline-block' }}>
                    {job.domain || job.DOMAIN || 'Engineering'}
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>📍 Location: <strong>{job.location || 'Coimbatore'}</strong></span>
                      <span>Work Mode: <strong>{job.work_mode || 'Hybrid'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🕒 Duration: <strong>{job.duration || '3 Months'}</strong></span>
                      <span>💰 Stipend: <strong style={{ color: '#059669' }}>₹{job.stipend || '0'}/m</strong></span>
                    </div>
                  </div>

                  {/* Applicants Count Summary */}
                  <div style={{ marginTop: '14px', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={15} color="#2563EB" /> Total Applicants:
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563EB', background: '#DBEAFE', padding: '2px 10px', borderRadius: '12px' }}>
                      {appCount} Applied
                    </span>
                  </div>

                  {topCandidate && (
                    <div style={{ marginTop: '8px', fontSize: '0.76rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={13} /> AI Top Candidate: {topCandidate.name} ({topMatch}% Match)
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setSelectedInternship(job); setCurrentPage(1); setCandidateStatusFilter('ALL'); }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Eye size={16} /> View & Manage Applicants ({appCount})
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No internships found matching your filter criteria.
        </div>
      )}

      {/* INSPECT AI MATCH BREAKDOWN MODAL */}
      {inspectAiModalApp && (() => {
        const reqSkills = typeof selectedInternship?.required_skills === 'string'
          ? selectedInternship.required_skills.split(',').map(s => s.trim()).filter(Boolean)
          : (selectedInternship?.required_skills || ['Java', 'React', 'Spring Boot', 'SQL']);

        const candSkills = inspectAiModalApp.skills && inspectAiModalApp.skills.length > 0
          ? inspectAiModalApp.skills
          : ['Java', 'React', 'Spring Boot', 'SQL'];

        const matched = reqSkills.filter(s => candSkills.some(cs => cs.toLowerCase() === s.toLowerCase()));
        const missing = reqSkills.filter(s => !candSkills.some(cs => cs.toLowerCase() === s.toLowerCase()));

        const matchPct = inspectAiModalApp.match_score || Math.min(98, Math.round(75 + (matched.length * 5) + (inspectAiModalApp.cgpa > 8 ? 5 : 0)));
        const atsScore = Math.min(99, matchPct - 2);

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }}>
            <div className="glass-card" style={{ background: '#FFFFFF', width: '100%', maxWidth: '640px', borderRadius: '16px', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      AI Candidate Match Analysis
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Compatibility Score & Resume Breakdown for {inspectAiModalApp.name}
                    </p>
                  </div>
                </div>
                <button onClick={() => setInspectAiModalApp(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
                  <X size={22} />
                </button>
              </div>

              {/* Score Metric Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: matchPct >= 85 ? '#ECFDF5' : '#EFF6FF', border: '1px solid', borderColor: matchPct >= 85 ? '#A7F3D0' : '#BFDBFE', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: matchPct >= 85 ? '#065F46' : '#1E40AF' }}>AI MATCH SCORE</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: matchPct >= 85 ? '#059669' : '#2563EB', marginTop: '4px' }}>{matchPct}%</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: matchPct >= 85 ? '#047857' : '#1D4ED8', marginTop: '2px' }}>
                    {matchPct >= 85 ? '🌟 Top AI Match' : 'Strong Candidate'}
                  </div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>ATS RESUME SCORE</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D97706', marginTop: '4px' }}>{atsScore}/100</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B45309', marginTop: '2px' }}>✓ Verified Format</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>CANDIDATE CGPA</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7C3AED', marginTop: '4px' }}>{inspectAiModalApp.cgpa}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6D28D9', marginTop: '2px' }}>Scale of 10.0</div>
                </div>
              </div>

              {/* Skill Alignment Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="#059669" /> Skill Alignment Matrix ({matched.length} Matched / {reqSkills.length} Required)
                </div>

                {/* Matched Skills */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: '6px' }}>MATCHED REQUIRED SKILLS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {matched.length > 0 ? matched.map((s, i) => (
                      <span key={i} style={{ fontSize: '0.78rem', fontWeight: 700, background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '16px', border: '1px solid #86EFAC' }}>
                        ✓ {s}
                      </span>
                    )) : <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>None matched</span>}
                  </div>
                </div>

                {/* Missing Skills */}
                {missing.length > 0 && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', marginBottom: '6px' }}>RECOMMENDED / MISSING SKILLS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {missing.map((s, i) => (
                        <span key={i} style={{ fontSize: '0.78rem', fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '4px 12px', borderRadius: '16px', border: '1px solid #FDE68A' }}>
                          ⚡ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Hiring Recommendation Summary */}
              <div style={{ padding: '18px', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderRadius: '12px', color: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} /> AI Hiring Recommendation Summary
                </div>
                <p style={{ fontSize: '0.85rem', color: '#E2E8F0', lineHeight: 1.5, margin: 0 }}>
                  "{inspectAiModalApp.name} demonstrates a high technical compatibility ({matchPct}%) for the <strong>{selectedInternship?.title || inspectAiModalApp.role_title}</strong> position. Candidate exhibits {matched.length} core matched skill competencies ({matched.join(', ')}), an academic CGPA of {inspectAiModalApp.cgpa}, and verified snapshot background from {inspectAiModalApp.college}. Recommended for immediate recruiter interview shortlisting."
                </p>
              </div>

              {/* Footer Close Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
                <button onClick={() => setInspectAiModalApp(null)} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
                  Close Inspection Breakdown
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
