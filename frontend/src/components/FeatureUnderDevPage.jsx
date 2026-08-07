import React from 'react';
import { LayoutDashboard, User, FileText, Layers, Bell, PlusCircle, Users, Trash2 } from 'lucide-react';

export default function FeatureUnderDevPage({ activeTab, currentUser }) {
  const pageConfigs = {
    dashboard: { title: 'Dashboard', desc: 'Overview of platform activities', icon: LayoutDashboard },
    profile: { title: 'Student Profile', desc: 'Personal details, education, and verified skills', icon: User },
    resume: { title: 'Resume', desc: 'Uploaded resume details and ATS analysis', icon: FileText },
    applications: { title: 'Applications', desc: 'Applied internship statuses and schedule', icon: Layers },
    notifications: { title: 'Notifications', desc: 'Platform alerts and updates', icon: Bell },
    'post-internship': { title: 'Post Internship', desc: 'Post new internship listings for candidates', icon: PlusCircle },
    'view-applicants': { title: 'View Applicants', desc: 'Inspect candidate applications and screening scores', icon: Users },
    'delete-internship': { title: 'Delete Internship', desc: 'Remove or close existing internship postings', icon: Trash2 }
  };

  const currentConfig = pageConfigs[activeTab] || pageConfigs.dashboard;
  const Icon = currentConfig.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
          <Icon size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>{currentConfig.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{currentConfig.desc}</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
          <Icon size={28} />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {currentConfig.title} Page
        </h2>

        <p style={{ maxWidth: '480px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Welcome to the {currentConfig.title} view.
        </p>
      </div>
    </div>
  );
}
