import React from 'react';
<<<<<<< HEAD
import { Sparkles, LayoutDashboard, User, FileText, Layers, Bell, PlusCircle, Users, FileCheck, LogOut, Briefcase, ShieldCheck } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, currentUser, onLogout }) {
  const role = currentUser?.role || 'STUDENT';

  const studentTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explore', label: 'Explore Internships', icon: Briefcase },
    { id: 'profile', label: 'Student Profile', icon: User },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'applications', label: 'Applications', icon: Layers },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const companyTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'post-internship', label: 'Post Internship', icon: PlusCircle },
    { id: 'view-applicants', label: 'View Applicants', icon: Users },
    { id: 'generate-test', label: 'Generate Test', icon: FileCheck }
  ];

  const adminTabs = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: ShieldCheck }
  ];

  let tabs = studentTabs;
  if (role === 'ADMIN') tabs = adminTabs;
  else if (role === 'COMPANY') tabs = companyTabs;

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 500, background: '#FFFFFF', borderBottom: '1px solid var(--border-light)', padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab(role === 'ADMIN' ? 'admin-dashboard' : 'dashboard')}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: role === 'ADMIN' ? '#1E293B' : '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {role === 'ADMIN' ? <ShieldCheck size={20} color="#FFFFFF" /> : <Sparkles size={18} color="#FFFFFF" />}
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
          InternMatch AI {role === 'ADMIN' && <span style={{ fontSize: '0.75rem', background: '#2563EB', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', marginLeft: '6px' }}>ADMIN</span>}
        </span>
      </div>

      <nav style={{ display: 'flex', gap: '6px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={isActive ? 'btn-primary' : 'btn-ghost'}
              style={{ height: '36px', padding: '0 14px', fontSize: '0.85rem' }}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{currentUser?.name || currentUser?.username}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser?.role}</div>
        </div>

        <button onClick={onLogout} className="btn-ghost" style={{ padding: '6px 12px', color: '#DC2626' }} title="Logout">
          <LogOut size={16} /> Logout
=======
import { Sparkles, Layers, BookOpen, User, Building2, Shield, LogOut } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, currentUser, onLogout }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '0 36px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => setActiveTab('feed')}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
          }}
        >
          <Sparkles size={22} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.35rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            InterSearch
          </span>
          <span className="badge badge-verified">
            PM Scheme AI
          </span>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {currentUser?.role === 'STUDENT' && (
          <>
            <button
              onClick={() => setActiveTab('feed')}
              className={activeTab === 'feed' ? 'btn-primary' : 'btn-ghost'}
            >
              <Sparkles size={18} /> AI Match Feed
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={activeTab === 'applications' ? 'btn-primary' : 'btn-ghost'}
            >
              <Layers size={18} /> Applications
            </button>

            <button
              onClick={() => setActiveTab('ai-coach')}
              className={activeTab === 'ai-coach' ? 'btn-primary' : 'btn-ghost'}
            >
              <BookOpen size={18} /> AI Coach
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}
            >
              <User size={18} /> Profile
            </button>
          </>
        )}

        {currentUser?.role === 'COMPANY' && (
          <button
            onClick={() => setActiveTab('recruiter')}
            className="btn-primary"
          >
            <Building2 size={18} /> Recruiter Portal
          </button>
        )}

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('admin')}
            className="btn-primary"
          >
            <Shield size={18} /> Admin Console
          </button>
        )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentUser?.name || currentUser?.username}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {currentUser?.role}
          </div>
        </div>

        <button onClick={onLogout} className="btn-ghost" style={{ padding: '10px' }} title="Logout">
          <LogOut size={18} />
>>>>>>> 26c430b2b8530a875a41bfc9a9c1514a365a9811
        </button>
      </div>
    </header>
  );
}
