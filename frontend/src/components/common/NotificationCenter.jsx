import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, Award, Zap, ThumbsUp, FileText, AlertCircle, X, Sparkles, ExternalLink, Clock } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

export default function NotificationCenter({ currentUser, role, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all | unread
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const userId = currentUser?.id || currentUser?.user_id || 'guest';
  const readKey = `internmatch_read_notifs_${userId}_${role}`;
  const token = currentUser?.token || localStorage.getItem('token') || '';

  // Helper to get relative time from date string or timestamp
  const formatTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  // Fetch real data from microservices and derive live notifications
  const fetchLiveNotifications = useCallback(async () => {
    if (!userId || userId === 'guest') return;
    setIsLoading(true);

    try {
      let readIds = new Set();
      try {
        const savedRead = localStorage.getItem(readKey);
        if (savedRead) readIds = new Set(JSON.parse(savedRead));
      } catch (e) {}

      const derivedList = [];

      if (role === 'STUDENT') {
        const studentId = currentUser?.id || currentUser?.user_id || currentUser?.student_id;
        const res = await fetch(`${API_CONFIG.STUDENT_SERVICE_URL || 'http://localhost:8082'}/api/v1/student/${studentId}/applications`, {
          headers: { 'Authorization': token, 'Content-Type': 'application/json' }
        });

        if (res.ok) {
          const apps = await res.json();
          if (Array.isArray(apps)) {
            apps.forEach(app => {
              const appId = app.id || app.ID || app.application_id;
              const roleTitle = app.role_title || app.title || app.ROLE_TITLE || app.TITLE || 'Internship';
              const compName = app.company_name || app.COMPANY_NAME || 'Company';
              const status = (app.status || app.STATUS || '').toUpperCase();
              const score = app.test_score !== undefined && app.test_score !== null ? Number(app.test_score) : (app.TEST_SCORE !== undefined && app.TEST_SCORE !== null ? Number(app.TEST_SCORE) : null);
              const appliedAt = app.applied_at || app.created_at || app.APPLIED_AT;

              if (status === 'SHORTLISTED' || status === 'ACCEPTED_FOR_TEST') {
                const notifId = `notif_stud_short_${appId}`;
                derivedList.push({
                  id: notifId,
                  title: `⚡ Shortlisted: ${roleTitle}`,
                  message: `Your application for ${roleTitle} at ${compName} has been shortlisted! Your proctored AI screening exam is unlocked.`,
                  time: formatTime(appliedAt),
                  type: 'shortlist',
                  read: readIds.has(notifId),
                  actionTab: 'applications',
                  actionLabel: 'Take Screening Test'
                });
              } else if (status === 'TEST_PASSED') {
                const notifId = `notif_stud_tpass_${appId}`;
                derivedList.push({
                  id: notifId,
                  title: `🎯 Test Passed: ${score !== null ? `${score}%` : '60%+'}`,
                  message: `You scored ${score !== null ? `${score}%` : 'passing marks'} on the AI screening test for ${roleTitle} at ${compName}. Recruiter is reviewing your offer letter approval.`,
                  time: formatTime(appliedAt),
                  type: 'test_passed',
                  read: readIds.has(notifId),
                  actionTab: 'applications',
                  actionLabel: 'View Applications'
                });
              } else if (status === 'TEST_FAILED') {
                const notifId = `notif_stud_tfail_${appId}`;
                derivedList.push({
                  id: notifId,
                  title: `🎯 Test Completed: ${score !== null ? `${score}%` : 'Failed'}`,
                  message: `You scored ${score !== null ? `${score}%` : 'below passing criteria'} on the AI screening test for ${roleTitle} at ${compName}.`,
                  time: formatTime(appliedAt),
                  type: 'alert',
                  read: readIds.has(notifId),
                  actionTab: 'applications',
                  actionLabel: 'View Applications'
                });
              } else if (['OFFER_ISSUED', 'OFFER_EXTENDED', 'ACCEPTED'].includes(status)) {
                const notifId = `notif_stud_offer_${appId}`;
                derivedList.push({
                  id: notifId,
                  title: `🎉 Offer Letter Extended!`,
                  message: `Congratulations! ${compName} has officially extended an internship offer letter for ${roleTitle}.`,
                  time: formatTime(appliedAt),
                  type: 'offer',
                  read: readIds.has(notifId),
                  actionTab: 'applications',
                  actionLabel: 'View & Accept Offer'
                });
              } else if (status === 'PROCTORING_FAILED') {
                const notifId = `notif_stud_proctor_${appId}`;
                derivedList.push({
                  id: notifId,
                  title: `🚫 Exam Disqualified`,
                  message: `A proctoring violation was recorded during your screening assessment for ${roleTitle} at ${compName}.`,
                  time: formatTime(appliedAt),
                  type: 'alert',
                  read: readIds.has(notifId),
                  actionTab: 'applications',
                  actionLabel: 'View Details'
                });
              } else if (status === 'REJECTED') {
                const notifId = `notif_stud_rej_${appId}`;
                derivedList.push({
                  id: notifId,
                  title: `🔴 Application Update: ${roleTitle}`,
                  message: `Your application for ${roleTitle} at ${compName} was reviewed and closed.`,
                  time: formatTime(appliedAt),
                  type: 'alert',
                  read: readIds.has(notifId),
                  actionTab: 'applications',
                  actionLabel: 'View Applications'
                });
              } else {
                // APPLIED status
                const notifId = `notif_stud_app_${appId}`;
                derivedList.push({
                  id: notifId,
                  title: `📝 Application Submitted: ${roleTitle}`,
                  message: `Your application for ${roleTitle} at ${compName} is registered and under review with the recruiting team.`,
                  time: formatTime(appliedAt),
                  type: 'system',
                  read: readIds.has(notifId),
                  actionTab: 'applications',
                  actionLabel: 'Track Status'
                });
              }
            });
          }
        }
      } else if (role === 'COMPANY') {
        const companyId = currentUser?.id || currentUser?.user_id || currentUser?.company_id || 0;
        const res = await fetch(`${API_CONFIG.COMPANY_SERVICE_URL || 'http://localhost:8083'}/api/v1/company/applicants?companyId=${companyId}`, {
          headers: { 'Authorization': token, 'Content-Type': 'application/json' }
        });

        if (res.ok) {
          const applicants = await res.json();
          if (Array.isArray(applicants)) {
            applicants.forEach(cand => {
              const appId = cand.id || cand.ID || cand.application_id;
              const candName = cand.name || cand.student_name || cand.candidate_name || 'Candidate';
              const roleTitle = cand.role_title || cand.title || 'Internship';
              const status = (cand.status || cand.STATUS || '').toUpperCase();
              const score = cand.test_score !== undefined && cand.test_score !== null ? Number(cand.test_score) : null;
              const appliedAt = cand.applied_at || cand.created_at;

              if (status === 'TEST_PASSED' || (score !== null && score >= 60)) {
                const notifId = `notif_rec_pass_${appId}`;
                derivedList.push({
                  id: notifId,
                  title: `🎯 ${candName} Passed AI Screening (${score || 85}%)`,
                  message: `${candName} scored ${score || 85}% for ${roleTitle}. You can now review performance breakdown and issue offer letter.`,
                  time: formatTime(appliedAt),
                  type: 'test_passed',
                  read: readIds.has(notifId),
                  actionTab: 'applicants',
                  actionLabel: 'Review Candidate'
                });
              } else if (status === 'SHORTLISTED') {
                const notifId = `notif_rec_short_${appId}`;
                derivedList.push({
                  id: notifId,
                  title: `🔵 Candidate Shortlisted: ${candName}`,
                  message: `${candName} has been shortlisted for ${roleTitle}. Their proctored AI test is unlocked.`,
                  time: formatTime(appliedAt),
                  type: 'shortlist',
                  read: readIds.has(notifId),
                  actionTab: 'applicants',
                  actionLabel: 'View Applicants'
                });
              } else if (['OFFER_ISSUED', 'OFFER_EXTENDED', 'ACCEPTED'].includes(status)) {
                const notifId = `notif_rec_offered_${appId}`;
                derivedList.push({
                  id: notifId,
                  title: `🟢 Offer Extended to ${candName}`,
                  message: `Offer letter for ${roleTitle} has been generated and registered in the database for ${candName}.`,
                  time: formatTime(appliedAt),
                  type: 'offer',
                  read: readIds.has(notifId),
                  actionTab: 'applicants',
                  actionLabel: 'View Hires'
                });
              } else {
                const notifId = `notif_rec_app_${appId}`;
                derivedList.push({
                  id: notifId,
                  title: `📝 New Applicant: ${candName}`,
                  message: `${candName} applied for ${roleTitle}${cand.match_score ? ` (AI Match: ${cand.match_score}%)` : ''}.`,
                  time: formatTime(appliedAt),
                  type: 'system',
                  read: readIds.has(notifId),
                  actionTab: 'applicants',
                  actionLabel: 'View Profile'
                });
              }
            });
          }
        }
      }

      setNotifications(derivedList);
    } catch (err) {
      console.warn('Notification fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, role, token, readKey, currentUser]);

  // Initial fetch and window event listeners
  useEffect(() => {
    fetchLiveNotifications();

    const handleSync = () => fetchLiveNotifications();
    window.addEventListener('application_submitted', handleSync);
    window.addEventListener('test_submitted', handleSync);
    window.addEventListener('status_updated', handleSync);
    window.addEventListener('internmatch_notification', handleSync);

    return () => {
      window.removeEventListener('application_submitted', handleSync);
      window.removeEventListener('test_submitted', handleSync);
      window.removeEventListener('status_updated', handleSync);
      window.removeEventListener('internmatch_notification', handleSync);
    };
  }, [fetchLiveNotifications]);

  // Refetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchLiveNotifications();
    }
  }, [isOpen, fetchLiveNotifications]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem(readKey, JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    let readIds = [];
    try {
      const saved = localStorage.getItem(readKey);
      if (saved) readIds = JSON.parse(saved);
    } catch (e) {}
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem(readKey, JSON.stringify(readIds));
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'shortlist':
        return <Zap size={16} color="#2563EB" />;
      case 'test_passed':
        return <Award size={16} color="#16A34A" />;
      case 'offer':
        return <ThumbsUp size={16} color="#059669" />;
      case 'alert':
        return <AlertCircle size={16} color="#DC2626" />;
      default:
        return <FileText size={16} color="#4F46E5" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Live Notifications & Status Updates"
        aria-label="Notifications"
        style={{
          background: isOpen ? '#EFF6FF' : '#F8FAFC',
          border: '1px solid var(--border-light)',
          borderRadius: '10px',
          padding: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isOpen ? '#2563EB' : '#64748B',
          position: 'relative',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 3px rgba(37,99,235,0.15)' : 'none'
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: '#FFFFFF',
              fontSize: '0.68rem',
              fontWeight: 800,
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 5px rgba(220,38,38,0.3)'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: '380px',
            maxWidth: '90vw',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -10px rgba(15,23,42,0.18), 0 0 0 1px rgba(15,23,42,0.08)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'dropdownFadeIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '12px' }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs: Only All & Unread */}
          <div style={{ display: 'flex', gap: '6px', padding: '10px 16px', borderBottom: '1px solid #F1F5F9', background: '#FFFFFF' }}>
            {['all', 'unread'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  padding: '4px 12px',
                  fontSize: '0.74rem',
                  fontWeight: filter === t ? 700 : 600,
                  borderRadius: '6px',
                  border: 'none',
                  background: filter === t ? '#EFF6FF' : '#F8FAFC',
                  color: filter === t ? '#2563EB' : '#64748B',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* List Content */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94A3B8' }}>
                <Clock size={24} style={{ marginBottom: '8px', animation: 'spin 1.5s linear infinite' }} />
                <p style={{ fontSize: '0.82rem', margin: 0 }}>Syncing live notifications...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #F8FAFC',
                    background: notif.read ? '#FFFFFF' : 'rgba(239, 246, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? '#FFFFFF' : 'rgba(239, 246, 255, 0.5)'}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: notif.read ? '#F1F5F9' : '#DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    {getNotifIcon(notif.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: notif.read ? 700 : 800, color: notif.read ? '#334155' : '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {notif.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8', marginLeft: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={10} /> {notif.time}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4, margin: '2px 0 8px 0' }}>
                      {notif.message}
                    </p>

                    {notif.actionTab && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                          setIsOpen(false);
                          if (onNavigate) onNavigate(notif.actionTab);
                        }}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: '#2563EB',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 1px 3px rgba(37,99,235,0.2)'
                        }}
                      >
                        {notif.actionLabel || 'View Details'} <ExternalLink size={10} />
                      </button>
                    )}
                  </div>

                  {!notif.read && (
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563EB', flexShrink: 0, marginTop: '8px' }} />
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8' }}>
                <Bell size={28} color="#CBD5E1" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '0.82rem', margin: 0 }}>No notifications at this time.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
              Live Database Notifications • InternMatch AI
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
