import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Search, Download, Award, CheckCircle, FileText, Printer, X, Building2 } from 'lucide-react';

export default function StudentApplications({ apiBaseUrl, currentUser, onTakeTest }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [applications, setApplications] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const studentId = currentUser?.userId || currentUser?.user_id || 1;

  useEffect(() => {
    fetchApplications();
  }, [studentId]);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/student/${studentId}/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {}
  };

  const filteredApps = applications.filter((app) => {
    const appStatus = app.status || app.STATUS || 'APPLIED';
    const appStage = app.timeline_stage || app.TIMELINE_STAGE || 'APPLIED';
    const title = app.title || app.JOB_TITLE || app.TITLE || '';
    const company = app.company_name || app.COMPANY_NAME || '';
    const skills = app.skills || app.SKILLS || '';

    const matchesFilter = filter === 'ALL' || appStage === filter || appStatus === filter;
    const matchesSearch = company.toLowerCase().includes(search.toLowerCase()) ||
                          title.toLowerCase().includes(search.toLowerCase()) ||
                          skills.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const timelineSteps = ['APPLIED', 'SHORTLISTED', 'ASSESSMENT', 'OFFER'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>My Applications</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Track recruitment stages backed by Oracle database records.</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search Company, Role, Skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['ALL', 'APPLIED', 'SHORTLISTED', 'ASSESSMENT', 'OFFER', 'REJECTED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'btn-primary' : 'btn-ghost'}
            style={{ height: '34px', padding: '0 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredApps.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredApps.map((app) => {
            const title = app.title || app.JOB_TITLE || app.TITLE || 'Internship';
            const company = app.company_name || app.COMPANY_NAME || 'Company';
            const location = app.location || app.LOCATION || 'Remote';
            const stipend = app.stipend || app.STIPEND || 25000;
            const status = app.status || app.STATUS || 'APPLIED';
            const stage = app.timeline_stage || app.TIMELINE_STAGE || 'APPLIED';
            const testScore = app.test_score || app.TEST_SCORE || 0;

            return (
              <div key={app.id || app.ID} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {company} • {location} • ₹{stipend}/mo
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-auth" style={{ textTransform: 'uppercase' }}>{status}</span>

                    {(status === 'ACCEPTED_FOR_TEST' || status === 'ASSESSMENT' || status === 'SHORTLISTED') && (
                      <button onClick={onTakeTest} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem', background: '#7C3AED' }}>
                        Take 20 Aptitude + 3 Coding Screening Exam
                      </button>
                    )}

                    {testScore > 0 && (
                      <span className="badge badge-ai" style={{ background: '#DCFCE7', color: '#166534' }}>
                        Screening Score: {testScore}%
                      </span>
                    )}

                    {status === 'OFFER_SENT' && (
                      <button onClick={() => setSelectedOffer({ title, company, location, stipend })} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem', background: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={15} /> View & Download Offer Letter
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>APPLICATION RECRUITMENT PIPELINE</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                    {timelineSteps.map((step, idx) => {
                      const currentIdx = timelineSteps.indexOf(stage);
                      const isDone = idx <= currentIdx || status === 'OFFER_SENT';

                      return (
                        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isDone ? '#2563EB' : '#E2E8F0', color: isDone ? '#FFFFFF' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <div style={{ fontSize: '0.7rem', fontWeight: isDone ? 700 : 500, color: isDone ? '#0F172A' : '#94A3B8', marginTop: '4px' }}>
                            {step}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          You haven't applied for any internships yet.
        </div>
      )}

      {/* Official Offer Letter Modal */}
      {selectedOffer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', padding: '36px', borderRadius: '12px', border: '1px solid #CBD5E1', color: '#0F172A', fontFamily: 'Georgia, serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2563EB', paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>{selectedOffer.company}</h1>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Corporate Headquarters • {selectedOffer.location}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => window.print()} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={14} /> Print / PDF
                </button>
                <button onClick={() => setSelectedOffer(null)} className="btn-ghost" style={{ padding: '6px' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.92rem', lineHeight: 1.7, color: '#334155' }}>
              <p><strong>Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Candidate Name:</strong> {currentUser?.name || 'Student Candidate'}</p>
              <p><strong>Institution:</strong> {currentUser?.college || 'Karpagam College of Engineering'}</p>

              <div style={{ background: '#F8FAFC', borderLeft: '4px solid #059669', padding: '16px', margin: '20px 0', borderRadius: '4px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065F46', marginBottom: '6px' }}>
                  🎉 Formal Internship Offer & Welcome Greeting
                </h3>
                <p style={{ margin: 0 }}>
                  Dear <strong>{currentUser?.name || 'Candidate'}</strong>,<br />
                  On behalf of <strong>{selectedOffer.company}</strong>, we are thrilled to formally offer you the position of <strong>{selectedOffer.title}</strong>! Your performance in our technical screening assessment demonstrated outstanding algorithmic problem solving and development aptitude.
                </p>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', marginBottom: '8px' }}>Internship Terms & Compensation</h4>
              <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                <li><strong>Designated Position:</strong> {selectedOffer.title}</li>
                <li><strong>Monthly Stipend:</strong> ₹{selectedOffer.stipend} / month</li>
                <li><strong>Work Location / Mode:</strong> {selectedOffer.location} (Hybrid / Office)</li>
                <li><strong>Duration:</strong> 3 - 6 Months</li>
                <li><strong>Expected Start Date:</strong> Immediate / Next Cohort</li>
              </ul>

              <p>
                As part of this program, you will collaborate with our senior engineering architects on high-impact production systems, participate in agile sprints, and receive dedicated technical mentorship.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '36px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                <div>
                  <p style={{ fontWeight: 700, color: '#1E293B', marginBottom: '2px' }}>Authorized Talent Acquisition</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>{selectedOffer.company} Human Resources & Campus Hiring</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-ai" style={{ background: '#DCFCE7', color: '#166534', padding: '6px 14px', fontSize: '0.8rem' }}>
                    ✓ Officially Issued via InternMatch AI
                  </span>
                </div>
              </div>
            </div>
=======
import { CheckCircle2, Clock, MapPin, IndianRupee, Play, Award, Sparkles, X, Building2, ShieldAlert } from 'lucide-react';
import ProctoredScreeningTestModal from './ProctoredScreeningTestModal';

export default function StudentApplications({ apiBaseUrl, currentUser, setIsTakingTest }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applied');
  const [activeTestAppId, setActiveTestAppId] = useState(null);
  const [selectedOfferApp, setSelectedOfferApp] = useState(null);

  const safeUser = currentUser || {};
  const userId = (safeUser.userId || safeUser.user_id) ? Number(safeUser.userId || safeUser.user_id) : 9;

  useEffect(() => {
    fetchApplications();
  }, [userId]);

  useEffect(() => {
    if (activeTestAppId && setIsTakingTest) {
      setIsTakingTest(true);
    } else if (setIsTakingTest) {
      setIsTakingTest(false);
    }
    return () => {
      if (setIsTakingTest) setIsTakingTest(false);
    };
  }, [activeTestAppId, setIsTakingTest]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/v1/applications/student/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setApps(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const appliedApps = apps.filter(item => item.status === 'APPLIED' || item.status === 'UNDER_REVIEW');
  const testApps = apps.filter(item => {
    const isPassed = item.status === 'TEST_PASSED';
    const isFailedMalpractice = item.status === 'TEST_FAILED_MALPRACTICE';
    const isAccepted = item.status === 'ACCEPTED' || item.status === 'OFFER_ACCEPTED' || item.status === 'HIRED';
    return !isAccepted && (item.status === 'SHORTLISTED_FOR_TEST' || item.status === 'SHORTLISTED' || item.status === 'TEST_INVITED' || item.status === 'ASSESSMENT' || isPassed || isFailedMalpractice || item.status === 'APPLIED');
  });
  const offerApps = apps.filter(item => item.status === 'ACCEPTED' || item.status === 'OFFER_ACCEPTED' || item.status === 'HIRED');

  const getDisplayedApps = () => {
    if (activeTab === 'applied') return appliedApps;
    if (activeTab === 'test') return testApps;
    if (activeTab === 'offer') return offerApps;
    return apps;
  };

  const displayedApps = getDisplayedApps();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', paddingTop: 'var(--space-24)' }}>
      {/* TABS HEADER */}
      <div className="neo-card" style={{ padding: 'var(--space-16)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setActiveTab('applied')}
          className={activeTab === 'applied' ? 'btn-primary' : 'btn-ghost'}
          style={{ height: '40px' }}
        >
          Submitted Applications ({appliedApps.length})
        </button>

        <button
          onClick={() => setActiveTab('test')}
          className={activeTab === 'test' ? 'btn-primary' : 'btn-ghost'}
          style={{ height: '40px' }}
        >
          Proctored Screening Tests ({testApps.length})
        </button>

        <button
          onClick={() => setActiveTab('offer')}
          className={activeTab === 'offer' ? 'btn-primary' : 'btn-ghost'}
          style={{ height: '40px' }}
        >
          Official Offers ({offerApps.length})
        </button>
      </div>

      {loading && (
        <div className="neo-card" style={{ padding: 'var(--space-48)', textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Loading application records...</p>
        </div>
      )}

      {!loading && displayedApps.length === 0 && (
        <div className="neo-card" style={{ padding: 'var(--space-48)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No applications found in this category.</p>
        </div>
      )}

      {/* APPLICATIONS FEED */}
      {!loading && displayedApps.map((item) => (
        <div key={item.id} className="neo-card">
          <div className="neo-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="icon-circle icon-blue">
                <Building2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</h3>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.company_name}
                </div>
              </div>
            </div>

            <span className={`badge ${item.status === 'ACCEPTED' ? 'badge-verified' : 'badge-hybrid'}`}>
              {item.status || 'APPLIED'}
            </span>
          </div>

          <div className="neo-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {item.location}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IndianRupee size={16} /> ₹{item.stipend?.toLocaleString()}/month</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> Applied: {item.applied_at ? item.applied_at.split('T')[0] : 'Today'}</span>
            </div>
          </div>

          <div className="neo-card-footer">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Candidate Status: Tracked in MySQL Workbench
            </span>

            {activeTab === 'test' && item.status !== 'TEST_PASSED' && item.status !== 'TEST_FAILED_MALPRACTICE' && (
              <button
                onClick={() => setActiveTestAppId(item.id)}
                className="btn-primary"
              >
                <Play size={16} /> Start Proctored Screening Test
              </button>
            )}

            {item.status === 'TEST_PASSED' && (
              <span className="badge badge-verified"><CheckCircle2 size={14} /> Test Passed (Score: 98.5%)</span>
            )}

            {item.status === 'ACCEPTED' && (
              <button
                onClick={() => setSelectedOfferApp(item)}
                className="btn-primary"
              >
                <Award size={16} /> View Official Offer Letter
              </button>
            )}
          </div>
        </div>
      ))}

      {/* PROCTORED TEST MODAL */}
      {activeTestAppId && (
        <ProctoredScreeningTestModal
          apiBaseUrl={apiBaseUrl}
          applicationId={activeTestAppId}
          currentUser={currentUser}
          onClose={() => {
            setActiveTestAppId(null);
            fetchApplications();
          }}
        />
      )}

      {/* OFFER LETTER MODAL */}
      {selectedOfferApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="neo-card" style={{ maxWidth: '600px', width: '100%', padding: 'var(--space-32)', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={24} color="var(--color-primary)" />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Official Internship Offer</h2>
              </div>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setSelectedOfferApp(null)} />
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Congratulations <strong>{currentUser.name}</strong>! <strong>{selectedOfferApp.company_name}</strong> is pleased to extend an offer for the position of <strong>{selectedOfferApp.title}</strong> with a stipend of ₹{selectedOfferApp.stipend?.toLocaleString()}/month.
            </p>

            <button onClick={() => setSelectedOfferApp(null)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Accept Offer & Confirm Placement
            </button>
>>>>>>> 26c430b2b8530a875a41bfc9a9c1514a365a9811
          </div>
        </div>
      )}
    </div>
  );
}
