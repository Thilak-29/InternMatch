import React, { useState } from 'react';
import { Sparkles, LogOut, User, Building2, Briefcase, PlusCircle, Users, Search, FileText, ShieldCheck } from 'lucide-react';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import NotificationCenter from './NotificationCenter';

export default function Header({ role, onNavigate, currentTab, onLogout, currentUser }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const roleLabel = role === 'ADMIN' ? 'Placement Admin' : (role === 'COMPANY' ? 'Recruiter' : 'Student');
  const roleBadgeColor = role === 'ADMIN' ? '#059669' : (role === 'COMPANY' ? '#7C3AED' : '#2563EB');
  const roleBadgeBg = role === 'ADMIN' ? '#D1FAE5' : (role === 'COMPANY' ? '#EDE9FE' : '#DBEAFE');

  const navBtnStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    fontSize: '0.84rem',
    fontWeight: isActive ? 700 : 600,
    borderRadius: '8px',
    border: 'none',
    background: isActive ? '#EFF6FF' : 'transparent',
    color: isActive ? '#2563EB' : '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: isActive ? '0 1px 3px rgba(37,99,235,0.1)' : 'none',
    whiteSpace: 'nowrap'
  });

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onLogout) {
        await onLogout();
      }
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px -2px rgba(15,23,42,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '68px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '16px' }}>
          
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }} onClick={() => onNavigate('dashboard')}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(37,99,235,0.25)' }}>
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Intern<span style={{ color: '#2563EB' }}>Match</span> <span style={{ fontSize: '0.75rem', background: '#DBEAFE', color: '#2563EB', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>AI</span>
            </span>
          </div>

          {role && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'nowrap' }}>
              {/* Student / Role Navigation */}
              <nav style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'nowrap' }}>
                {/* Student Navigation */}
                {role === 'STUDENT' && (
                  <>
                    <button style={navBtnStyle(currentTab === 'dashboard')} onClick={() => onNavigate('dashboard')}>
                      <Briefcase size={16} /> Dashboard
                    </button>
                    <button style={navBtnStyle(currentTab === 'explore')} onClick={() => onNavigate('explore')}>
                      <Search size={16} /> Explore Internships
                    </button>
                    <button style={navBtnStyle(currentTab === 'applications')} onClick={() => onNavigate('applications')}>
                      <FileText size={16} /> My Applications
                    </button>
                    <button style={navBtnStyle(currentTab === 'career-advisor')} onClick={() => onNavigate('career-advisor')}>
                      <Sparkles size={16} /> Career Advisor
                    </button>
                    <button style={navBtnStyle(currentTab === 'profile')} onClick={() => onNavigate('profile')}>
                      <User size={16} /> Profile
                    </button>
                  </>
                )}

                {/* Company Navigation */}
                {role === 'COMPANY' && (
                  <>
                    <button style={navBtnStyle(currentTab === 'dashboard')} onClick={() => onNavigate('dashboard')}>
                      <Building2 size={16} /> Dashboard
                    </button>
                    <button style={navBtnStyle(currentTab === 'post' || currentTab === 'post-internship')} onClick={() => onNavigate('post')}>
                      <PlusCircle size={16} /> Post Internship
                    </button>
                    <button style={navBtnStyle(currentTab === 'applicants' || currentTab === 'view-applicants')} onClick={() => onNavigate('applicants')}>
                      <Users size={16} /> Applicants & Hires
                    </button>
                    <button style={navBtnStyle(currentTab === 'company-profile' || currentTab === 'profile')} onClick={() => onNavigate('company-profile')}>
                      <User size={16} /> Company Profile
                    </button>
                  </>
                )}

                {/* Admin Navigation */}
                {role === 'ADMIN' && (
                  <>
                    <button style={navBtnStyle(currentTab === 'dashboard')} onClick={() => onNavigate('dashboard')}>
                      <Briefcase size={16} /> Dashboard
                    </button>
                    <button style={navBtnStyle(currentTab === 'users')} onClick={() => onNavigate('users')}>
                      <Users size={16} /> Users Directory
                    </button>
                    <button style={navBtnStyle(currentTab === 'recruiter-verification' || currentTab === 'verification')} onClick={() => onNavigate('recruiter-verification')}>
                      <ShieldCheck size={16} /> Recruiter Verification
                    </button>
                    <button style={navBtnStyle(currentTab === 'internship-analytics')} onClick={() => onNavigate('internship-analytics')}>
                      <Briefcase size={16} /> Internship Analytics
                    </button>
                    <button style={navBtnStyle(currentTab === 'student-demographics')} onClick={() => onNavigate('student-demographics')}>
                      <User size={16} /> Student Demographics
                    </button>
                  </>
                )}
              </nav>

              <div style={{ height: '24px', width: '1px', background: 'var(--border-light)', margin: '0 2px', flexShrink: 0 }} />

              {/* Notification Center */}
              <NotificationCenter
                currentUser={currentUser}
                role={role}
                onNavigate={onNavigate}
              />

              {/* User Profile & Role Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '4px 10px', borderRadius: '10px', border: '1px solid var(--border-light)', flexShrink: 0 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: roleBadgeBg, color: roleBadgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                  {(currentUser?.name || currentUser?.username || 'U')[0].toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                    {currentUser?.name || currentUser?.username || 'User'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: roleBadgeColor, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {roleLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  title="Sign Out"
                  aria-label="Sign Out"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#94A3B8', transition: 'color 0.2s ease', flexShrink: 0 }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Reusable Logout Confirmation Dialog Modal */}
      <ConfirmLogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
}
