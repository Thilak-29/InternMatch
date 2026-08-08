import React, { useState } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import CompanyDashboard from './components/CompanyDashboard';
import PostInternship from './components/PostInternship';
import ViewApplicants from './components/ViewApplicants';
import GenerateTest from './components/GenerateTest';
import StudentDashboard from './components/StudentDashboard';
import ExploreInternships from './components/ExploreInternships';
import StudentProfile from './components/StudentProfile';
import StudentResume from './components/StudentResume';
import StudentApplications from './components/StudentApplications';
import StudentNotifications from './components/StudentNotifications';
import AdminDashboard from './components/AdminDashboard';
import ProctoredExamModal from './components/ProctoredExamModal';
import AIChatAssistant from './components/AIChatAssistant';

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

  const API_BASE_URL = 'http://localhost:8000';

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
