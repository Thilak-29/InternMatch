import React from 'react';
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
        </button>
      </div>
    </header>
  );
}
