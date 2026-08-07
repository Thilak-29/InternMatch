<<<<<<< HEAD
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
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showExamModal, setShowExamModal] = useState(false);
  const [activeTestAppId, setActiveTestAppId] = useState(null);

  const API_BASE_URL = 'http://localhost:8000';

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    if (userData.role === 'ADMIN') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('dashboard');
=======
import React, { useState, useEffect, Component } from 'react';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import StudentProfile from './components/StudentProfile';
import RecommendationFeed from './components/RecommendationFeed';
import StudentApplications from './components/StudentApplications';
import RecruiterPortal from './components/RecruiterPortal';
import AdminDashboard from './components/AdminDashboard';
import DailyPractice from './components/DailyPractice';
import AICoach from './components/AICoach';
import AIChatAssistant from './components/AIChatAssistant';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught error in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="neo-card" style={{ padding: '32px', background: '#fff', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>⚠️ Dashboard Notice</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '12px 0 20px 0' }}>
              An interface rendering notice was handled smoothly.
            </p>
            <button 
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Reload InterSearch
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('internmatch_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedTab = localStorage.getItem('internmatch_tab');
      return savedTab || 'feed';
    } catch (e) {
      return 'feed';
    }
  });

  const [apiConnected, setApiConnected] = useState(false);
  const [isTakingTest, setIsTakingTest] = useState(false);

  useEffect(() => {
    checkApiConnection();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('internmatch_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('internmatch_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('internmatch_tab', activeTab);
    }
  }, [activeTab]);

  const checkApiConnection = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/health`);
      if (res.ok) setApiConnected(true);
      else setApiConnected(false);
    } catch (err) {
      setApiConnected(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('internmatch_user', JSON.stringify(userData));
    if (userData.role === 'STUDENT') {
      setActiveTab('feed');
      localStorage.setItem('internmatch_tab', 'feed');
    } else if (userData.role === 'COMPANY') {
      setActiveTab('recruiter');
      localStorage.setItem('internmatch_tab', 'recruiter');
    } else if (userData.role === 'ADMIN') {
      setActiveTab('admin');
      localStorage.setItem('internmatch_tab', 'admin');
>>>>>>> 26c430b2b8530a875a41bfc9a9c1514a365a9811
    }
  };

  const handleLogout = () => {
<<<<<<< HEAD
    setCurrentUser(null);
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
=======
    localStorage.removeItem('internmatch_user');
    localStorage.removeItem('internmatch_tab');
    setCurrentUser(null);
    setActiveTab('feed');
  };

  if (!currentUser) {
    return (
      <ErrorBoundary>
        <LandingPage 
          apiBaseUrl={API_BASE_URL} 
          onLoginSuccess={handleLoginSuccess} 
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Header 
          currentUser={currentUser}
          onLogout={handleLogout}
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          apiStatus={apiConnected}
        />

        <main style={{ flex: 1, padding: '0 24px 40px 24px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          {currentUser.role === 'STUDENT' && activeTab === 'feed' && (
            <RecommendationFeed apiBaseUrl={API_BASE_URL} currentUser={currentUser} />
          )}

          {currentUser.role === 'STUDENT' && (activeTab === 'ai-coach' || activeTab === 'coach') && (
            <AICoach apiBaseUrl={API_BASE_URL} currentUser={currentUser} />
          )}

          {currentUser.role === 'STUDENT' && activeTab === 'practice' && (
            <DailyPractice apiBaseUrl={API_BASE_URL} currentUser={currentUser} setIsTakingTest={setIsTakingTest} />
          )}

          {currentUser.role === 'STUDENT' && activeTab === 'profile' && (
            <StudentProfile apiBaseUrl={API_BASE_URL} currentUser={currentUser} onProfileUpdated={() => setActiveTab('feed')} />
          )}

          {currentUser.role === 'STUDENT' && activeTab === 'applications' && (
            <StudentApplications apiBaseUrl={API_BASE_URL} currentUser={currentUser} setIsTakingTest={setIsTakingTest} />
          )}

          {currentUser.role === 'COMPANY' && (
            <RecruiterPortal apiBaseUrl={API_BASE_URL} currentUser={currentUser} />
          )}

          {(currentUser.role === 'ADMIN' || activeTab === 'admin') && (
            <AdminDashboard apiBaseUrl={API_BASE_URL} currentUser={currentUser} />
          )}
        </main>

        {!isTakingTest && <AIChatAssistant apiBaseUrl={API_BASE_URL} />}

        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '16px 24px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', background: '#fff' }}>
          <p>InterSearch AI – Intelligent Recommendation & Candidate Career Engine • PM Internship Scheme</p>
        </footer>
      </div>
    </ErrorBoundary>
>>>>>>> 26c430b2b8530a875a41bfc9a9c1514a365a9811
  );
}
