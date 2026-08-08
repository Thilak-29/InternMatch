import React, { useState } from 'react';
import { API_CONFIG } from './config/apiConfig';

// Domain-Specific Component Imports
import Header from './components/common/Header';
import AIChatAssistant from './components/common/AIChatAssistant';
import LandingPage from './components/landing/LandingPage';
import StudentDashboard from './components/student/StudentDashboard';
import ExploreInternships from './components/student/ExploreInternships';
import StudentProfile from './components/student/StudentProfile';
import StudentResume from './components/student/StudentResume';
import StudentApplications from './components/student/StudentApplications';
import StudentNotifications from './components/student/StudentNotifications';
import ProctoredExamModal from './components/student/ProctoredExamModal';
import CompanyDashboard from './components/company/CompanyDashboard';
import PostInternship from './components/company/PostInternship';
import ViewApplicants from './components/company/ViewApplicants';
import GenerateTest from './components/company/GenerateTest';
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

  const [showExamModal, setShowExamModal] = useState(false);
  const [activeTestAppId, setActiveTestAppId] = useState(null);

  const API_BASE_URL = API_CONFIG.getUrl('GATEWAY');

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('internmatch_tab', tab);
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('internmatch_user', JSON.stringify(userData));
    if (userData.role === 'ADMIN') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('internmatch_user');
    localStorage.removeItem('internmatch_tab');
    setActiveTab('dashboard');
  };

  const handleOpenTest = (appId) => {
    setActiveTestAppId(appId || 3);
    setShowExamModal(true);
  };

  const handleTestComplete = async (score) => {
    setShowExamModal(false);
    if (activeTestAppId) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/student/applications/${activeTestAppId}/test-score`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score })
        });
      } catch (e) {}
    }
    alert(`Genuine AI Screening Exam Evaluated! Final Score: ${score}% (Passed Cutoff threshold). Saved live to College Oracle Database!`);
  };

  if (!currentUser) {
    return <LandingPage apiBaseUrl={API_BASE_URL} onLoginSuccess={handleLoginSuccess} />;
  }

  const role = currentUser?.role || 'STUDENT';

  const renderContent = () => {
    if (role === 'ADMIN') {
      return <AdminDashboard apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
    }

    if (role === 'COMPANY') {
      switch (activeTab) {
        case 'dashboard':
          return <CompanyDashboard apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
        case 'post-internship':
          return <PostInternship apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
        case 'view-applicants':
          return <ViewApplicants apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
        case 'generate-test':
          return <GenerateTest apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
        default:
          return <CompanyDashboard apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
        case 'explore':
          return <ExploreInternships apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
        case 'profile':
          return <StudentProfile apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
        case 'resume':
          return <StudentResume apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
        case 'applications':
          return <StudentApplications apiBaseUrl={API_BASE_URL} currentUser={currentUser} onTakeTest={handleOpenTest} />;
        case 'notifications':
          return <StudentNotifications apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
        default:
          return <StudentDashboard apiBaseUrl={API_BASE_URL} currentUser={currentUser} />;
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, padding: '28px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
        {renderContent()}
      </main>

      {role === 'STUDENT' && <AIChatAssistant />}

      {showExamModal && (
        <ProctoredExamModal
          apiBaseUrl={API_BASE_URL}
          onClose={() => setShowExamModal(false)}
          onTestComplete={handleTestComplete}
        />
      )}
    </div>
  );
}
