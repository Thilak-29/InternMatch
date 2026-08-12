import React, { useState, useEffect } from 'react';
import { API_CONFIG } from './config/apiConfig';

import Header from './components/common/Header';
import AIChatAssistant from './components/common/AIChatAssistant';
import LandingPage from './components/landing/LandingPage';
import StudentDashboard from './components/student/StudentDashboard';
import ExploreInternships from './components/student/ExploreInternships';
import StudentProfile from './components/student/StudentProfile';
import StudentApplications from './components/student/StudentApplications';
import CompanyDashboard from './components/company/CompanyDashboard';
import PostInternship from './components/company/PostInternship';
import ViewApplicants from './components/company/ViewApplicants';
import TalentSearch from './components/company/TalentSearch';
import CompanyProfile from './components/company/CompanyProfile';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const cached = localStorage.getItem('internmatch_user');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return null;
  });

  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');

  const AUTH_URL = API_CONFIG.AUTH_SERVICE_URL;
  const STUDENT_URL = API_CONFIG.STUDENT_SERVICE_URL;
  const COMPANY_URL = API_CONFIG.COMPANY_SERVICE_URL;
  const AI_URL = API_CONFIG.AI_SERVICE_URL;

  // Sync state on browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path, tabKey) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    if (tabKey) {
      localStorage.setItem('internmatch_tab', tabKey);
    }
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

    const role = (userData?.role || 'STUDENT').toUpperCase();
    if (role === 'ADMIN') {
      navigateTo('/admin/dashboard', 'dashboard');
    } else if (role === 'COMPANY') {
      navigateTo('/company/dashboard', 'dashboard');
    } else {
      navigateTo('/student/dashboard', 'dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('internmatch_user');
    localStorage.removeItem('internmatch_tab');

    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('student_profile_cache_') || k.startsWith('student_projects_') || k.startsWith('student_certs_') || k.startsWith('student_applications_') || k.startsWith('resume_score_') || k.startsWith('ai_match_rate_') || k.startsWith('profile_photo_')) {
        localStorage.removeItem(k);
      }
    });

    navigateTo('/login', 'dashboard');
  };

  // Unauthenticated user route guard
  if (!currentUser) {
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/login');
    }
    return <LandingPage apiBaseUrl={AUTH_URL} onLoginSuccess={handleLoginSuccess} />;
  }

  const role = (currentUser?.role || 'STUDENT').toUpperCase();

  // Helper mapper for student tab navigation
  const handleStudentNavigate = (target) => {
    if (target === 'explore') navigateTo('/student/explore', 'explore');
    else if (target === 'applications') navigateTo('/student/applications', 'applications');
    else if (target === 'profile') navigateTo('/student/profile', 'profile');
    else navigateTo('/student/dashboard', 'dashboard');
  };

  // Helper mapper for company tab navigation
  const handleCompanyNavigate = (target) => {
    if (target === 'post' || target === 'post-internship') navigateTo('/company/post-internship', 'post');
    else if (target === 'applicants' || target === 'view-applicants') navigateTo('/company/applicants', 'applicants');
    else if (target === 'profile' || target === 'company-profile') navigateTo('/company/profile', 'company-profile');
    else navigateTo('/company/dashboard', 'dashboard');
  };

  // Route Content Resolver based on currentPath and user Role
  const renderContent = () => {
    if (role === 'ADMIN') {
      if (currentPath !== '/admin/dashboard') {
        window.history.replaceState({}, '', '/admin/dashboard');
      }
      return <AdminDashboard apiBaseUrl={AUTH_URL} currentUser={currentUser} />;
    }

    if (role === 'COMPANY') {
      if (currentPath === '/company/post-internship' || currentPath === '/company/post') {
        return <PostInternship apiBaseUrl={COMPANY_URL} currentUser={currentUser} onNavigate={handleCompanyNavigate} />;
      }
      if (currentPath === '/company/applicants' || currentPath === '/company/view-applicants') {
        return <ViewApplicants apiBaseUrl={COMPANY_URL} currentUser={currentUser} />;
      }
      if (currentPath === '/company/talent-search' || currentPath === '/company/sourcing') {
        return <TalentSearch apiBaseUrl={COMPANY_URL} currentUser={currentUser} />;
      }
      if (currentPath === '/company/profile' || currentPath === '/company/company-profile') {
        return <CompanyProfile apiBaseUrl={COMPANY_URL} currentUser={currentUser} />;
      }
      // Default Company Dashboard
      if (currentPath !== '/company/dashboard') {
        window.history.replaceState({}, '', '/company/dashboard');
      }
      return <CompanyDashboard apiBaseUrl={COMPANY_URL} currentUser={currentUser} onNavigate={handleCompanyNavigate} />;
    }

    // Default: STUDENT
    if (currentPath === '/student/explore') {
      return <ExploreInternships apiBaseUrl={COMPANY_URL} currentUser={currentUser} />;
    }
    if (currentPath === '/student/applications') {
      return <StudentApplications apiBaseUrl={STUDENT_URL} currentUser={currentUser} />;
    }
    if (currentPath === '/student/profile') {
      return <StudentProfile apiBaseUrl={STUDENT_URL} currentUser={currentUser} />;
    }
    // Default Student Dashboard
    if (currentPath !== '/student/dashboard') {
      window.history.replaceState({}, '', '/student/dashboard');
    }
    return <StudentDashboard apiBaseUrl={STUDENT_URL} currentUser={currentUser} onNavigate={handleStudentNavigate} />;
  };

  // Current tab identifier for Header highlight
  const getCurrentTabIdentifier = () => {
    if (role === 'COMPANY') {
      if (currentPath.includes('post')) return 'post';
      if (currentPath.includes('applicant')) return 'applicants';
      if (currentPath.includes('talent-search')) return 'talent-search';
      if (currentPath.includes('profile')) return 'company-profile';
      return 'dashboard';
    }
    if (role === 'STUDENT') {
      if (currentPath.includes('explore')) return 'explore';
      if (currentPath.includes('application')) return 'applications';
      if (currentPath.includes('profile')) return 'profile';
      return 'dashboard';
    }
    return 'dashboard';
  };

  const handleHeaderNavigate = (target) => {
    if (role === 'COMPANY') handleCompanyNavigate(target);
    else if (role === 'STUDENT') handleStudentNavigate(target);
    else navigateTo('/admin/dashboard', 'dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <Header
        role={role}
        onNavigate={handleHeaderNavigate}
        currentTab={getCurrentTabIdentifier()}
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
