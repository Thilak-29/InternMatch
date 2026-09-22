import React, { useState, useEffect } from 'react';
import { Send, FileText, CheckCircle2, Clock, MapPin, DollarSign, Sparkles, Award, ArrowRight, AlertCircle, Edit, Download, X, Trash2 } from 'lucide-react';
import ProctoredExamModal from './ProctoredExamModal';
import API_CONFIG from '../../config/apiConfig';

export default function StudentApplications({ currentUser }) {
  const studentId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;
  const token = currentUser?.token || '';
  const baseUrl = API_CONFIG.STUDENT_SERVICE_URL;

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

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testModalApp, setTestModalApp] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    company_name: '',
    location: '',
    stipend: ''
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Withdraw Application',
    onConfirm: null
  });
  const [offerModalApp, setOfferModalApp] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  // Quiz eligibility gate
  const [eligibilityChecking, setEligibilityChecking] = useState(false);

  useEffect(() => {
    fetchApplications();

    const handleAppSubmitted = () => {
      fetchApplications();
    };

    window.addEventListener('application_submitted', handleAppSubmitted);
    window.addEventListener('focus', fetchApplications);

    return () => {
      window.removeEventListener('application_submitted', handleAppSubmitted);
      window.removeEventListener('focus', fetchApplications);
    };
  }, [studentId]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/student/${studentId}/applications`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : [];
        const dedupedMap = new Map();
        const priorityStatuses = ['SHORTLISTED', 'ACCEPTED_FOR_TEST', 'TEST_PASSED', 'TEST_FAILED', 'OFFER_EXTENDED', 'OFFER_ISSUED', 'ACCEPTED', 'PROCTORING_FAILED'];
        rawList.forEach(app => {
          const key = app.internship_id || app.INTERNSHIP_ID || app.external_id || app.EXTERNAL_ID || app.id;
          if (!dedupedMap.has(key)) {
            dedupedMap.set(key, app);
          } else {
            const prev = dedupedMap.get(key);
            const prevStatus = (prev.status || prev.STATUS || '').toUpperCase();
            const currStatus = (app.status || app.STATUS || '').toUpperCase();
            const prevScore = Number(prev.test_score || prev.TEST_SCORE || 0);
            const currScore = Number(app.test_score || app.TEST_SCORE || 0);
            
            if (priorityStatuses.includes(currStatus) && !priorityStatuses.includes(prevStatus)) {
              dedupedMap.set(key, app);
            } else if (currScore > 0 && prevScore === 0) {
              dedupedMap.set(key, app);
            } else if (!priorityStatuses.includes(prevStatus)) {
              const prevId = Number(prev.id || prev.ID || 0);
              const currId = Number(app.id || app.ID || 0);
              if (currId > prevId) {
                dedupedMap.set(key, app);
              }
            }
          }
        });
        setApplications(Array.from(dedupedMap.values()));
      } else {
        setApplications([]);
      }
    } catch (e) {
      console.error("Applications fetch error:", e);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSubmit = async (score) => {
    if (!testModalApp) return;
    const appId = testModalApp.id || testModalApp.application_id;
    const numScore = Number(score);
    const passedStatus = numScore >= 60 ? 'TEST_PASSED' : 'TEST_FAILED';

    // Optimistically update local application state so UI updates instantly to the taken score
    setApplications(prev => prev.map(a => {
      const aId = a.id || a.application_id;
      if (aId === appId) {
        return {
          ...a,
          test_score: numScore,
          TEST_SCORE: numScore,
          status: passedStatus,
          STATUS: passedStatus,
          test_submitted: true
        };
      }
      return a;
    }));

    try {
      await fetch(`${baseUrl}/api/v1/student/applications/${appId}/test-score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ score: numScore })
      });
      setStatusMsg(`✓ Test completed! Score: ${numScore}% (${numScore >= 60 ? 'PASSED' : 'FAILED'}) recorded successfully.`);
      fetchApplications();
    } catch (e) {
      console.error("Test score submission error:", e);
    } finally {
      setTestModalApp(null);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  /**
   * Gate: verify eligibility with the backend before opening the proctored exam.
   * Only SHORTLISTED / ACCEPTED_FOR_TEST applications may proceed.
   */
  const handleOpenTestModal = async (app) => {
    const appId = app.id || app.application_id;
    setEligibilityChecking(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/v1/student/${studentId}/applications/${appId}/quiz-eligibility`,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (data.eligible) {
        setTestModalApp(app);
      } else {
        setStatusMsg(`🚫 Quiz Access Denied: ${data.reason || 'You are not eligible for this quiz.'}`);
        setTimeout(() => setStatusMsg(''), 7000);
      }
    } catch (err) {
      // Network error — fall back to local status check
      const status = (app.status || '').toUpperCase();
      if (status === 'SHORTLISTED' || status === 'ACCEPTED_FOR_TEST') {
        setTestModalApp(app);
      } else {
        setStatusMsg('🚫 Quiz Access Denied: You must be shortlisted by the recruiter to take this exam.');
        setTimeout(() => setStatusMsg(''), 7000);
      }
    } finally {
      setEligibilityChecking(false);
    }
  };

  const openEditModal = (app) => {
    setEditingApp(app);
    setEditFormData({
      student_name: app.student_name || currentUser?.name || 'Student Candidate',
      role_title: app.title || app.role_title || 'Unknown Role',
      company_name: app.company_name || 'Unknown Company'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingApp) return;
    const appId = editingApp.id || editingApp.application_id;

    try {
      const res = await fetch(`${baseUrl}/api/v1/student/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(editFormData)
      });

      if (res.ok) {
        setStatusMsg('✓ Application details updated cleanly in Oracle Database!');
        fetchApplications();
      } else {
        setStatusMsg('❌ Failed to update application details.');
      }
    } catch (err) {
      setStatusMsg('❌ Error updating application details.');
    } finally {
      setEditingApp(null);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleDeleteApp = (appId) => {
    // find the app so we can pass internship_id to company-service
    const appObj = applications.find(a => (a.id || a.application_id) === appId);
    const internshipId = appObj?.internship_id || appObj?.INTERNSHIP_ID || 0;

    setConfirmModal({
      isOpen: true,
      title: 'Withdraw & Cancel Application',
      message: 'Are you sure you want to withdraw this application? This action will remove your submission and free up application capacity.',
      confirmText: 'Withdraw Application',
      onConfirm: async () => {
        try {
          const res = await fetch(`${baseUrl}/api/v1/student/applications/${appId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
          });
          if (res.ok) {
            setStatusMsg('✓ Application withdrawn successfully.');
            setApplications(prev => prev.filter(a => (a.id || a.application_id) !== appId));

            // Sync withdrawal to company-service so recruiter dashboard reflects this immediately
            try {
              await fetch(`${API_CONFIG.COMPANY_SERVICE_URL}/api/v1/company/applications/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ student_id: studentId, internship_id: internshipId })
              });
            } catch (_) { /* non-fatal — company-service may be down */ }
          } else {
            setStatusMsg('❌ Failed to withdraw application.');
          }
        } catch (e) {
          setStatusMsg('❌ Error withdrawing application.');
        } finally {
          setTimeout(() => setStatusMsg(''), 4000);
        }
      }
    });
  };

  const ITEMS_PER_PAGE = 7;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (applications.length > 0) {
      const maxPages = Math.ceil(applications.length / ITEMS_PER_PAGE);
      if (currentPage > maxPages) {
        setCurrentPage(maxPages);
      }
    } else {
      setCurrentPage(1);
    }
  }, [applications.length, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentApplications = applications.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading applications from database...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            My Applications & Timelines
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Real-time status updates for your submitted internship applications
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {applications.length > ITEMS_PER_PAGE && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing {startIndex + 1}–{Math.min(endIndex, applications.length)} of {applications.length}
            </span>
          )}
          <span className="badge badge-auth" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            Total Submitted: {applications.length}
          </span>
        </div>
      </div>

      {statusMsg && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          background: statusMsg.startsWith('✓') ? '#D1FAE5' : '#FEE2E2',
          color: statusMsg.startsWith('✓') ? '#065F46' : '#991B1B',
          fontWeight: 600,
          fontSize: '0.88rem'
        }}>
          {statusMsg}
        </div>
      )}

      {applications.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentApplications.map((app, idx) => {
            const isUnstop = (app.source || app.SOURCE || '').toUpperCase() === 'UNSTOP';
            const status = (app.status || (isUnstop ? 'APPLIED_EXTERNALLY' : 'APPLIED')).toUpperCase();
            const rawScore = app.test_score !== undefined && app.test_score !== null ? Number(app.test_score) : (app.TEST_SCORE !== undefined && app.TEST_SCORE !== null ? Number(app.TEST_SCORE) : null);
            // All internal platform applications (non-Unstop) use AI screening test
            const hasAiTest = !isUnstop;
            const isTestSubmitted = ['TEST_PASSED', 'TEST_FAILED', 'TEST_COMPLETED', 'PROCTORING_FAILED', 'OFFER_ISSUED', 'OFFER_EXTENDED', 'ACCEPTED', 'SELECTED', 'HIRED', 'REJECTED'].includes(status) || 
              app.test_submitted === true ||
              (rawScore !== null && rawScore !== undefined && rawScore > 0);
            const score = rawScore !== null ? rawScore : (status === 'TEST_PASSED' ? 80 : (status === 'TEST_FAILED' ? 40 : null));
            const isOfferExtended = status === 'OFFER_EXTENDED' || status === 'OFFER_ISSUED' || status === 'ACCEPTED';
            const deadlineStr = app.application_deadline || app.deadline || app.APPLICATION_DEADLINE || '';
            const isDeadlinePassed = deadlineStr ? (new Date() > new Date(deadlineStr)) : false;

            // Quiz is accessible ONLY when:
            // 1. Not unstop
            // 2. Internship has AI test (hasAiTest === true)
            // 3. Recruiter has SHORTLISTED the candidate (status === 'SHORTLISTED' || status === 'ACCEPTED_FOR_TEST')
            // 4. Test has not yet been submitted
            // 5. Not proctoring failed
            const isShortlistedForTest = (status === 'SHORTLISTED' || status === 'ACCEPTED_FOR_TEST');
            const canTakeTest = !isUnstop
              && hasAiTest
              && isShortlistedForTest
              && !isTestSubmitted
              && status !== 'PROCTORING_FAILED';
            const appUrl = app.application_url || app.APPLICATION_URL || '';

            return (
              <div key={idx} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: isUnstop ? '4px solid #7C3AED' : (status === 'REJECTED' ? '4px solid #DC2626' : '4px solid #2563EB') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {isUnstop ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: '#F3E8FF', color: '#6B21A8', border: '1px solid #E9D5FF' }}>
                          🌐 UNSTOP
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}>
                          🛡️ InternMatch Corporate
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {app.title || app.role_title || 'Unknown Role'}
                      </h3>
                      {!isUnstop && (
                        <button
                          onClick={() => openEditModal(app)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563EB',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                          title="Edit Application Details"
                        >
                          <Edit size={14} /> Edit Details
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#2563EB', fontWeight: 700, marginTop: '4px' }}>
                      {app.company_name || 'Unknown Company'}
                    </div>

                    <div style={{ display: 'flex', gap: '18px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px', flexWrap: 'wrap' }}>
                      <span>📍 {app.location || 'Hybrid'}</span>
                      <span>💰 Stipend: {String(app.stipend || 'Disclosed on Unstop').startsWith('₹') ? app.stipend : `₹${app.stipend}`}</span>
                      <span>📅 Applied: {(() => {
                        const dateStr = app.applied_at;
                        if (!dateStr || dateStr === 'Recently') return 'Recently';
                        try {
                          const d = new Date(dateStr);
                          if (!isNaN(d.getTime())) {
                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          }
                        } catch (e) {}
                        return dateStr;
                      })()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span className="badge badge-auth" style={{
                      fontSize: '0.82rem',
                      padding: '6px 14px',
                      background: isUnstop ? '#EFF6FF' : (isOfferExtended ? '#D1FAE5' : (status === 'REJECTED' ? '#FEE2E2' : (status.includes('PASSED') ? '#DBEAFE' : 'var(--glass-border)'))),
                      color: isUnstop ? '#1E40AF' : (isOfferExtended ? '#065F46' : (status === 'REJECTED' ? '#DC2626' : (status.includes('PASSED') ? '#1E40AF' : 'var(--text-main)'))),
                      border: status === 'REJECTED' ? '1px solid #FCA5A5' : 'none'
                    }}>
                      {isUnstop ? 'Applied Externally' : (isOfferExtended ? '🎉 OFFER EXTENDED' : (status === 'REJECTED' ? '🔴 APPLICATION REJECTED' : status))}
                    </span>

                    {!isUnstop && (
                      hasAiTest ? (
                        status === 'PROCTORING_FAILED' ? (
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '2px 8px', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
                            🚫 Exam Disqualified (Proctoring Violation)
                          </span>
                        ) : status === 'REJECTED' ? (
                          score !== null && score > 0 ? (
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#DC2626' }}>
                              🎯 Screening Score: {score}% {"(FAILED (<60%))"}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '2px 8px', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
                              🎯 Application Rejected
                            </span>
                          )
                        ) : isTestSubmitted ? (
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: (score !== null ? score >= 60 : status === 'TEST_PASSED') ? '#16A34A' : '#DC2626' }}>
                            🎯 Screening Score: {score !== null ? `${score}%` : ''} {(score !== null ? score >= 60 : status === 'TEST_PASSED') ? 'PASSED (≥60%)' : 'FAILED (<60%)'}
                          </span>
                        ) : status === 'APPLIED' ? (
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                            🎯 Screening Test: Locked (Awaiting Shortlist)
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                            🎯 Screening Test: Unlocked (Not Taken)
                          </span>
                        )
                      ) : (
                        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#4B5563', background: '#F3F4F6', padding: '2px 8px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                          📋 Direct Application (No Screening Test)
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                  {isUnstop && appUrl && (
                    <button
                      onClick={() => window.open(appUrl, '_blank', 'noopener,noreferrer')}
                      style={{
                        padding: '8px 18px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      View Opportunity ↗
                    </button>
                  )}

                  {status === 'PROCTORING_FAILED' && (
                    <span style={{
                      padding: '8px 18px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      background: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      🚫 Exam Disqualified (Proctoring Violation)
                    </span>
                  )}

                  {canTakeTest && (
                    isDeadlinePassed ? (
                      <span style={{
                        padding: '8px 18px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FCA5A5',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ⏰ Test Deadline Expired ({deadlineStr})
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenTestModal(app)}
                        disabled={eligibilityChecking}
                        className="btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: eligibilityChecking ? 0.7 : 1 }}
                      >
                        <Award size={16} /> {eligibilityChecking ? 'Checking Eligibility...' : 'Take AI Screening Test'}
                      </button>
                    )
                  )}

                  {!isUnstop && !hasAiTest && status === 'SHORTLISTED' && (
                    <span style={{
                      fontSize: '0.78rem',
                      color: '#166534',
                      background: '#DCFCE7',
                      border: '1px solid #BBF7D0',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontWeight: 700
                    }}>
                      ✓ Profile Shortlisted (Awaiting Offer)
                    </span>
                  )}

                  {!isUnstop && !canTakeTest && status === 'APPLIED' && (
                    <span style={{
                      fontSize: '0.78rem',
                      color: '#92400E',
                      background: '#FEF3C7',
                      border: '1px solid #FCD34D',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {hasAiTest
                        ? '⏳ Application Under Review — AI Screening Test will unlock once Shortlisted by Recruiter'
                        : '⏳ Application Under Review — Awaiting Recruiter Shortlisting'}
                    </span>
                  )}

                  {isOfferExtended && (
                    <button
                      onClick={() => setOfferModalApp(app)}
                      style={{
                        padding: '8px 18px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: '#059669',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FileText size={16} /> View & Accept Offer Letter
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteApp(app.id || app.application_id)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      background: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    title="Cancel or Withdraw this submitted application"
                  >
                    <Trash2 size={16} /> Withdraw / Cancel Application
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION CONTROLS */}
        {applications.length > ITEMS_PER_PAGE && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              style={{
                padding: '8px 16px',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid var(--border-light, #CBD5E1)',
                background: currentPage === 1 ? '#F1F5F9' : '#FFFFFF',
                color: currentPage === 1 ? '#94A3B8' : '#1E293B',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              ← Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Go to page ${page}`}
                  style={{
                    minWidth: '36px',
                    height: '36px',
                    padding: '0 8px',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 700 : 600,
                    borderRadius: '8px',
                    border: isActive ? '1px solid #2563EB' : '1px solid var(--border-light, #CBD5E1)',
                    background: isActive ? '#2563EB' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#1E293B',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 2px 6px rgba(37,99,235,0.25)' : 'none'
                  }}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              style={{
                padding: '8px 16px',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid var(--border-light, #CBD5E1)',
                background: currentPage === totalPages ? '#F1F5F9' : '#FFFFFF',
                color: currentPage === totalPages ? '#94A3B8' : '#1E293B',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              Next →
            </button>
          </div>
        )}
      </>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          You have not applied for any internships yet. Explore internships to submit your applications.
        </div>
      )}

      {/* EDIT APPLICATION MODAL */}
      {editingApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '28px', background: 'var(--bg-main)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Edit Application Details
              </h3>
              <button onClick={() => setEditingApp(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Candidate Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.student_name}
                  onChange={e => setEditFormData({ ...editFormData, student_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Role Title
                </label>
                <input
                  type="text"
                  value={editFormData.role_title}
                  onChange={e => setEditFormData({ ...editFormData, role_title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={editFormData.company_name}
                  onChange={e => setEditFormData({ ...editFormData, company_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setEditingApp(null)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFER LETTER MODAL */}
      {offerModalApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '32px', background: 'var(--bg-main)', borderRadius: '16px', border: '2px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669' }}>
                  🎉 Official Internship Offer Letter
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Issued by {offerModalApp.company_name || 'Unknown Company'}
                </p>
              </div>
              <button onClick={() => setOfferModalApp(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
              <p style={{ fontWeight: 700 }}>Dear {offerModalApp.student_name || offerModalApp.candidate_name || currentUser?.name || 'Candidate'},</p>
              <p style={{ marginTop: '12px' }}>
                We are thrilled to formally extend an offer of internship for the position of <strong>{offerModalApp.role_title || offerModalApp.title || offerModalApp.ROLE_TITLE || offerModalApp.TITLE || 'Unknown Role'}</strong> at <strong>{offerModalApp.company_name || offerModalApp.COMPANY_NAME || 'Unknown Company'}</strong>.
              </p>
              <p style={{ marginTop: '12px' }}>
                Based on your outstanding performance in the AI screening test (Score: {offerModalApp.test_score || 85}%), your qualifications meet our technical benchmark criteria.
              </p>
              <div style={{ margin: '16px 0', padding: '14px', background: 'rgba(5, 150, 105, 0.08)', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>📌 <strong>Position:</strong> {offerModalApp.role_title || offerModalApp.title || offerModalApp.ROLE_TITLE || 'Unknown Role'}</div>
                <div>🏢 <strong>Company:</strong> {offerModalApp.company_name || offerModalApp.COMPANY_NAME || 'Unknown Company'}</div>
                <div>💰 <strong>Stipend:</strong> ₹{typeof (offerModalApp.stipend || offerModalApp.STIPEND) === 'number' ? (offerModalApp.stipend || offerModalApp.STIPEND).toLocaleString() : (offerModalApp.stipend || offerModalApp.STIPEND || '4,000')}/month</div>
                <div>📍 <strong>Location / Work Mode:</strong> {offerModalApp.location || offerModalApp.LOCATION || offerModalApp.work_mode || 'Hybrid'}</div>
                <div>🟢 <strong>Status:</strong> OFFER EXTENDED (Oracle DB Registered)</div>
              </div>
              <p>Congratulations and welcome aboard!</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setOfferModalApp(null)} className="btn-secondary" style={{ padding: '8px 18px' }}>
                Close Preview
              </button>
              <button
                onClick={() => {
                  alert("Downloading official offer letter PDF...");
                  setOfferModalApp(null);
                }}
                style={{ background: '#059669', color: '#FFF', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={16} /> Download Offer Letter PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {testModalApp && (
        <ProctoredExamModal
          appId={testModalApp.id || testModalApp.application_id}
          studentId={studentId}
          token={token}
          baseUrl={baseUrl}
          internship={testModalApp}
          onClose={() => setTestModalApp(null)}
          onTestComplete={handleTestSubmit}
        />
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
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(220,38,38,0.25)'
                }}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
