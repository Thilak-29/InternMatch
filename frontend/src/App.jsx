import React, { useState } from 'react';
import { API_CONFIG } from './config/apiConfig';

import Header from './components/common/Header';
import AIChatAssistant from './components/common/AIChatAssistant';
import LandingPage from './components/landing/LandingPage';
import StudentDashboard from './components/student/StudentDashboard';
import ExploreInternships from './components/student/ExploreInternships';
import StudentProfile from './components/student/StudentProfile';
import StudentApplications from './components/student/StudentApplications';
import StudentNotifications from './components/student/StudentNotifications';
import CompanyDashboard from './components/company/CompanyDashboard';
import PostInternship from './components/company/PostInternship';
import ViewApplicants from './components/company/ViewApplicants';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const cached = localStorage.getItem('internmatch_user');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return null;
  });

  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('internmatch_tab') || 'dashboard';
  });

  const AUTH_URL = API_CONFIG.AUTH_SERVICE_URL;
  const STUDENT_URL = API_CONFIG.STUDENT_SERVICE_URL;
  const COMPANY_URL = API_CONFIG.COMPANY_SERVICE_URL;
  const AI_URL = API_CONFIG.AI_SERVICE_URL;

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('internmatch_tab', tab);
  };

  const handleLoginSuccess = (userData) => {
    // Clear any previous stale session keys from prior user
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('student_profile_cache_') || k.startsWith('student_projects_') || k.startsWith('student_certs_') || k.startsWith('student_applications_') || k.startsWith('resume_score_') || k.startsWith('ai_match_rate_')) {
        localStorage.removeItem(k);
      }
    });

    setCurrentUser(userData);
    localStorage.setItem('internmatch_user', JSON.stringify(userData));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('internmatch_user');
    localStorage.removeItem('internmatch_tab');

    // Wipe all identity-sensitive keys completely
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('student_profile_cache_') || k.startsWith('student_projects_') || k.startsWith('student_certs_') || k.startsWith('student_applications_') || k.startsWith('resume_score_') || k.startsWith('ai_match_rate_') || k.startsWith('profile_photo_')) {
        localStorage.removeItem(k);
      }
    });

    setActiveTab('dashboard');
  };

  if (!currentUser) {
    return <LandingPage apiBaseUrl={AUTH_URL} onLoginSuccess={handleLoginSuccess} />;
  }

  const role = (currentUser?.role || 'STUDENT').toUpperCase();

  const renderContent = () => {
    if (role === 'ADMIN') {
      return <AdminDashboard apiBaseUrl={AUTH_URL} currentUser={currentUser} />;
    }

    if (role === 'COMPANY') {
      switch (activeTab) {
        case 'dashboard':
          return <CompanyDashboard apiBaseUrl={COMPANY_URL} currentUser={currentUser} onNavigate={setActiveTab} />;
        case 'post':
        case 'post-internship':
          return <PostInternship apiBaseUrl={COMPANY_URL} currentUser={currentUser} onNavigate={setActiveTab} />;
        case 'applicants':
        case 'view-applicants':
          return <ViewApplicants apiBaseUrl={COMPANY_URL} currentUser={currentUser} />;
        default:
          return <CompanyDashboard apiBaseUrl={COMPANY_URL} currentUser={currentUser} onNavigate={setActiveTab} />;
      }
    }

    // Default: STUDENT
    switch (activeTab) {
      case 'dashboard':
        return <StudentDashboard apiBaseUrl={STUDENT_URL} currentUser={currentUser} onNavigate={setActiveTab} />;
      case 'explore':
        return <ExploreInternships apiBaseUrl={COMPANY_URL} currentUser={currentUser} />;
      case 'applications':
        return <StudentApplications apiBaseUrl={STUDENT_URL} currentUser={currentUser} />;
      case 'profile':
        return <StudentProfile apiBaseUrl={STUDENT_URL} currentUser={currentUser} />;
      default:
        return <StudentDashboard apiBaseUrl={STUDENT_URL} currentUser={currentUser} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <Header
        role={role}
        onNavigate={setActiveTab}
        currentTab={activeTab}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      <main style={{ flex: 1, padding: '32px 24px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {renderContent()}
      </main>

      <AIChatAssistant apiBaseUrl={AI_URL} />
    </div>
  );
}
