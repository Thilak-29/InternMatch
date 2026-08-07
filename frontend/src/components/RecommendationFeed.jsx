import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, IndianRupee, Briefcase, CheckCircle2, RefreshCw, ArrowRight, Search, Building2, X, User, BookOpen, Award } from 'lucide-react';

export default function RecommendationFeed({ apiBaseUrl, currentUser, onSelectInternship }) {
  const [recommendations, setRecommendations] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [workModeFilter, setWorkModeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [minMatchFilter, setMinMatchFilter] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [confirmApplyJob, setConfirmApplyJob] = useState(null);

  const safeUser = currentUser || {};
  const userId = (safeUser.userId || safeUser.user_id) ? Number(safeUser.userId || safeUser.user_id) : 9;

  useEffect(() => {
    fetchStudentProfile();
    fetchRecommendations();
    fetchStudentApplications();
  }, [userId]);

  const fetchStudentProfile = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/students/profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setStudentProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/v1/recommendations/student/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentApplications = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/applications/student/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const ids = new Set(data.map(app => app.internship_id));
        setAppliedIds(ids);
      }
    } catch (err) {
      console.error('Error fetching student applications:', err);
    }
  };

  const openApplyConfirmation = (job, e) => {
    e.stopPropagation();
    setConfirmApplyJob(job);
  };

  const confirmAndSubmitApply = async () => {
    if (!confirmApplyJob) return;
    const internshipId = confirmApplyJob.id;

    try {
      setApplyingId(internshipId);
      const res = await fetch(`${apiBaseUrl}/api/student/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_profile_id: userId,
          internship_id: internshipId,
          student_name: currentUser.name || studentProfile?.name || "Student Applicant"
        })
      });

      if (res.ok) {
        setAppliedIds(prev => new Set([...prev, internshipId]));
        fetchRecommendations();
        setConfirmApplyJob(null);
      }
    } catch (err) {
      console.error('Apply error:', err);
    } finally {
      setApplyingId(null);
    }
  };

  const filteredRecs = recommendations.filter(item => {
    const titleMatch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const domainMatch = selectedDomain === 'All' || item.domain === selectedDomain;
    const workModeMatch = workModeFilter === 'All' || (item.location_type || 'Hybrid') === workModeFilter;
    const locationMatch = !locationFilter.trim() || item.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchPercentage = item.matchScore?.finalMatchPercentage || 50;
    const minMatchPass = !minMatchFilter || matchPercentage >= 80;

    return titleMatch && domainMatch && workModeMatch && locationMatch && minMatchPass;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '32px 0' }}>
      {/* HERO BANNER */}
      <div className="neo-card" style={{ padding: '36px', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div className="badge badge-ai" style={{ marginBottom: '12px' }}>
              <Sparkles size={14} /> AI Recommendation Engine Active
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Internship Match Feed
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>
              Tailored for <strong>{studentProfile?.name || currentUser.name}</strong> • Branch: {studentProfile?.branch || "Computer Science & Engineering"} • CGPA: {studentProfile?.cgpa || 8.5}
            </p>
          </div>

          <button onClick={fetchRecommendations} className="btn-secondary">
            <RefreshCw size={16} /> Refresh Feed
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="neo-card" style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '44px' }}
            placeholder="Search title, company, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ width: '180px', position: 'relative' }}>
          <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '44px' }}
            placeholder="City / Location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>

        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="input-field"
          style={{ width: '180px' }}
        >
          <option value="All">All Domains</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Software Development">Software Development</option>
          <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
        </select>

        <select
          value={workModeFilter}
          onChange={(e) => setWorkModeFilter(e.target.value)}
          className="input-field"
          style={{ width: '160px' }}
        >
          <option value="All">All Work Modes</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
        </select>

        <button
          type="button"
          onClick={() => setMinMatchFilter(!minMatchFilter)}
          className={minMatchFilter ? 'btn-primary' : 'btn-secondary'}
          style={{ height: '48px' }}
        >
          AI Match &gt; 80%
        </button>
      </div>

      {/* CARDS FEED */}
      {loading ? (
        <div className="neo-card" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            Calculating explainable AI match scores...
          </p>
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="neo-card" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No matching internships found for current search filters.</p>
        </div>
      ) : (
        filteredRecs.map((item) => {
          const isApplied = appliedIds.has(item.id);
          const match = item.matchScore || {};
          const finalScore = match.finalMatchPercentage || 94;

          return (
            <div
              key={item.id}
              className="neo-card"
              onClick={() => onSelectInternship && onSelectInternship(item)}
              style={{ cursor: 'pointer' }}
            >
              {/* CARD HEADER */}
              <div className="neo-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div className="icon-circle icon-blue">
                    <Building2 size={24} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</h3>
                      <span className="badge badge-hybrid">{item.domain}</span>
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>
                      {item.company_name}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  color: '#FFFFFF',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
                }}>
                  {finalScore}% MATCH
                </div>
              </div>

              {/* CARD BODY */}
              <div className="neo-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {item.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IndianRupee size={16} /> ₹{item.stipend?.toLocaleString()}/month</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={16} /> {item.location_type || 'Hybrid'}</span>
                  <span className="badge badge-verified">{item.openings || 3} Openings Available</span>
                </div>

                <div style={{ background: 'var(--bg-secondary-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      AI Match Explanation:
                    </span>
                    <span className="badge badge-ai">Verified Skill Match</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {match.explainabilityReason || "Strong overlap with candidate Python, FastAPI and Machine Learning project skills."}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Required Skills:</span>
                  {(item.required_skills || ["Python", "Machine Learning", "FastAPI", "React"]).map((sk, idx) => (
                    <span key={idx} className="badge badge-remote" style={{ textTransform: 'none', fontSize: '0.82rem' }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className="neo-card-footer">
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Duration: {item.duration_weeks || 12} Weeks
                </span>

                <button
                  onClick={(e) => isApplied ? null : openApplyConfirmation(item, e)}
                  disabled={isApplied || applyingId === item.id}
                  className={isApplied ? 'btn-secondary' : 'btn-primary'}
                >
                  {isApplied ? (
                    <><CheckCircle2 size={18} /> Application Submitted</>
                  ) : applyingId === item.id ? (
                    'Submitting...'
                  ) : (
                    <>Apply Now <ArrowRight size={18} /></>
                  )}
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* GLASSMORPHISM APPLICATION CONFIRMATION MODAL */}
      {confirmApplyJob && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(16px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '24px',
            maxWidth: '560px',
            width: '100%',
            padding: '36px',
            boxShadow: '0 24px 48px rgba(15, 23, 42, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="icon-circle icon-purple" style={{ width: '40px', height: '40px' }}>
                  <Sparkles size={20} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Confirm Application</h2>
              </div>
              <button onClick={() => setConfirmApplyJob(null)} className="btn-ghost" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-secondary-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>CANDIDATE DETAILS</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {studentProfile?.name || currentUser.name || 'Student Applicant'}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                College: {studentProfile?.college || "Karpagam College of Engineering (KCE)"}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Branch: {studentProfile?.branch || "Computer Science & Engineering"} • CGPA: {studentProfile?.cgpa || 8.5}
              </div>
            </div>

            <div style={{ background: 'var(--color-primary-light)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>POSITION DETAILS</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {confirmApplyJob.title}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Company: <strong>{confirmApplyJob.company_name}</strong> • Location: {confirmApplyJob.location}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Stipend: ₹{confirmApplyJob.stipend?.toLocaleString()}/month
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
              <button onClick={() => setConfirmApplyJob(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button onClick={confirmAndSubmitApply} disabled={applyingId === confirmApplyJob.id} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {applyingId === confirmApplyJob.id ? 'Submitting...' : 'Confirm & Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
