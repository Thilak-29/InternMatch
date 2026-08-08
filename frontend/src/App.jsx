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

  const API_BASE_URL = API_CONFIG.getUrl('GATEWAY');

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('internmatch_tab', tab);
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('internmatch_user', JSON.stringify(userData));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('internmatch_user');
    localStorage.removeItem('internmatch_tab');
    setActiveTab('dashboard');
  };

  if (!currentUser) {
    return <LandingPage apiBaseUrl={API_BASE_URL} onLoginSuccess={handleLoginSuccess} />;
  }

  const role = (currentUser?.role || 'STUDENT').toUpperCase();

  const renderContent = () => {
    if (role === 'ADMIN') {
      return <AdminDashboard apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
    }

    if (role === 'COMPANY') {
      switch (activeTab) {
        case 'dashboard':
          return <CompanyDashboard apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
        case 'post':
        case 'post-internship':
          return <PostInternship apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
        case 'applicants':
        case 'view-applicants':
          return <ViewApplicants apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
        default:
          return <CompanyDashboard apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
      }
    }

    // Default: STUDENT
    switch (activeTab) {
      case 'dashboard':
        return <StudentDashboard apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
      case 'explore':
        return <ExploreInternships apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
      case 'applications':
        return <StudentApplications apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
      case 'profile':
        return <StudentProfile apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
      default:
        return <StudentDashboard apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
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

      <AIChatAssistant apiBaseUrl={API_BASE_URL} />
    </div>
  );
}
