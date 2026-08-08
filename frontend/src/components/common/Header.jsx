import React from 'react';
import { Sparkles, LogOut, User } from 'lucide-react';

export default function Header({ role, onNavigate, currentTab, onLogout, currentUser }) {
  return (
    <header className="header-container" style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Intern<span style={{ color: '#2563EB' }}>Match</span> <span style={{ fontSize: '0.8rem', background: '#DBEAFE', color: '#2563EB', padding: '2px 8px', borderRadius: '6px' }}>AI</span>
          </span>
        </div>

        {role && (
          <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {role === 'STUDENT' && (
              <>
                <button className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate('dashboard')}>Dashboard</button>
                <button className={`nav-link ${currentTab === 'explore' ? 'active' : ''}`} onClick={() => onNavigate('explore')}>Explore Internships</button>
                <button className={`nav-link ${currentTab === 'applications' ? 'active' : ''}`} onClick={() => onNavigate('applications')}>My Applications</button>
                <button className={`nav-link ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => onNavigate('profile')}>Profile</button>
              </>
            )}

            {role === 'COMPANY' && (
              <>
                <button className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate('dashboard')}>Company Dashboard</button>
                <button className={`nav-link ${currentTab === 'post' ? 'active' : ''}`} onClick={() => onNavigate('post')}>Post Internship</button>
                <button className={`nav-link ${currentTab === 'applicants' ? 'active' : ''}`} onClick={() => onNavigate('applicants')}>Applicants & Hires</button>
              </>
            )}

            {role === 'ADMIN' && (
              <>
                <button className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate('dashboard')}>Placement Cell Control</button>
              </>
            )}

            <div style={{ height: '24px', width: '1px', background: 'var(--border-light)', margin: '0 8px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} color="#64748B" />
                {currentUser?.name || currentUser?.username || 'User'}
              </div>
              <button onClick={onLogout} className="btn-ghost" title="Log Out" style={{ padding: '6px' }}>
                <LogOut size={16} color="#DC2626" />
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
