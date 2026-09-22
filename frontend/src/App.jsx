import React, { useState, useEffect } from 'react';
import { API_CONFIG } from './config/apiConfig';

import Header from './components/common/Header';
import LandingPage from './components/landing/LandingPage';
import StudentDashboard from './components/student/StudentDashboard';
import ExploreInternships from './components/student/ExploreInternships';
import StudentProfile from './components/student/StudentProfile';
import StudentApplications from './components/student/StudentApplications';
import CareerAdvisor from './components/student/CareerAdvisor';
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

  const [currentPath, setCurrentPath] = useState(() => (window.location.pathname + window.location.search) || '/');

  const AUTH_URL = API_CONFIG.AUTH_SERVICE_URL;
  const STUDENT_URL = API_CONFIG.STUDENT_SERVICE_URL;
  const COMPANY_URL = API_CONFIG.COMPANY_SERVICE_URL;
  const AI_URL = API_CONFIG.AI_SERVICE_URL;

  // Sync state on browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath((window.location.pathname + window.location.search) || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path, tabKey) => {
    const fullCurrent = window.location.pathname + window.location.search;
    if (fullCurrent !== path) {
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
    else if (target === 'career-advisor' || target === 'career') navigateTo('/student/career-advisor', 'career-advisor');
    else navigateTo('/student/dashboard', 'dashboard');
  };

  // Helper mapper for company tab navigation
  const handleCompanyNavigate = (target) => {
    if (target === 'post' || target === 'post-internship') navigateTo('/company/post-internship', 'post');
    else if (target === 'applicants' || target === 'view-applicants') navigateTo('/company/applicants', 'applicants');
    else if (target === 'profile' || target === 'company-profile') navigateTo('/company/profile', 'company-profile');
    else navigateTo('/company/dashboard', 'dashboard');
  };

  // Helper mapper for admin tab navigation
  const handleAdminNavigate = (target) => {
    if (target === 'users') navigateTo('/admin/users', 'users');
    else if (target === 'users-students') navigateTo('/admin/users?role=STUDENTS', 'users');
    else if (target === 'users-companies') navigateTo('/admin/users?role=COMPANIES', 'users');
    else if (target === 'recruiter-verification' || target === 'verification') navigateTo('/admin/recruiter-verification', 'recruiter-verification');
    else if (target === 'internship-analytics' || target === 'analytics') navigateTo('/admin/internship-analytics', 'internship-analytics');
    else if (target === 'student-demographics' || target === 'demographics') navigateTo('/admin/student-demographics', 'student-demographics');
    else navigateTo('/admin/dashboard', 'dashboard');
  };

  // Route Content Resolver based on currentPath and user Role
  const renderContent = () => {
    const cleanPath = currentPath.split('?')[0];
    if (role === 'ADMIN') {
      if (cleanPath === '/admin/users') {
        return <AdminDashboard key="users" apiBaseUrl={AUTH_URL} currentUser={currentUser} activeSection="users" onNavigate={handleAdminNavigate} />;
      }
      if (cleanPath === '/admin/recruiter-verification' || cleanPath === '/admin/verification') {
        return <AdminDashboard key="verification" apiBaseUrl={AUTH_URL} currentUser={currentUser} activeSection="recruiter-verification" onNavigate={handleAdminNavigate} />;
      }
      if (cleanPath === '/admin/internship-analytics') {
        return <AdminDashboard key="analytics" apiBaseUrl={AUTH_URL} currentUser={currentUser} activeSection="internship-analytics" onNavigate={handleAdminNavigate} />;
      }
      if (cleanPath === '/admin/student-demographics') {
        return <AdminDashboard key="demographics" apiBaseUrl={AUTH_URL} currentUser={currentUser} activeSection="student-demographics" onNavigate={handleAdminNavigate} />;
      }
      if (cleanPath !== '/admin/dashboard') {
        window.history.replaceState({}, '', '/admin/dashboard');
      }
      return <AdminDashboard key="dashboard" apiBaseUrl={AUTH_URL} currentUser={currentUser} activeSection="dashboard" onNavigate={handleAdminNavigate} />;
    }

    if (role === 'COMPANY') {
      if (cleanPath.startsWith('/admin')) {
        window.history.replaceState({}, '', '/company/dashboard');
        return <CompanyDashboard apiBaseUrl={COMPANY_URL} currentUser={currentUser} onNavigate={handleCompanyNavigate} />;
      }
      if (cleanPath === '/company/post-internship' || cleanPath === '/company/post') {
        return <PostInternship apiBaseUrl={COMPANY_URL} currentUser={currentUser} onNavigate={handleCompanyNavigate} />;
      }
      if (cleanPath === '/company/applicants' || cleanPath === '/company/view-applicants') {
        return <ViewApplicants apiBaseUrl={COMPANY_URL} currentUser={currentUser} />;
      }
      if (cleanPath === '/company/talent-search' || cleanPath === '/company/sourcing') {
        return <TalentSearch apiBaseUrl={COMPANY_URL} currentUser={currentUser} />;
      }
      if (cleanPath === '/company/profile' || cleanPath === '/company/company-profile') {
        return <CompanyProfile apiBaseUrl={COMPANY_URL} currentUser={currentUser} />;
      }
      // Default Company Dashboard
      if (cleanPath !== '/company/dashboard') {
        window.history.replaceState({}, '', '/company/dashboard');
      }
      return <CompanyDashboard apiBaseUrl={COMPANY_URL} currentUser={currentUser} onNavigate={handleCompanyNavigate} />;
    }

    // Default: STUDENT
    if (cleanPath.startsWith('/admin')) {
      window.history.replaceState({}, '', '/student/dashboard');
      return <StudentDashboard apiBaseUrl={STUDENT_URL} currentUser={currentUser} onNavigate={handleStudentNavigate} />;
    }
    if (cleanPath === '/student/explore') {
      return <ExploreInternships apiBaseUrl={COMPANY_URL} currentUser={currentUser} />;
    }
    if (cleanPath === '/student/applications') {
      return <StudentApplications apiBaseUrl={STUDENT_URL} currentUser={currentUser} />;
    }
    if (cleanPath === '/student/profile') {
      return <StudentProfile apiBaseUrl={STUDENT_URL} currentUser={currentUser} />;
    }
    if (cleanPath === '/student/career-advisor') {
      return <CareerAdvisor currentUser={currentUser} onNavigate={handleStudentNavigate} />;
    }
    // Default Student Dashboard
    if (cleanPath !== '/student/dashboard') {
      window.history.replaceState({}, '', '/student/dashboard');
    }
    return <StudentDashboard apiBaseUrl={STUDENT_URL} currentUser={currentUser} onNavigate={handleStudentNavigate} />;
  };

  // Current tab identifier for Header highlight
  const getCurrentTabIdentifier = () => {
    if (role === 'ADMIN') {
      if (currentPath.includes('users')) return 'users';
      if (currentPath.includes('recruiter-verification') || currentPath.includes('verification')) return 'recruiter-verification';
      if (currentPath.includes('analytics')) return 'internship-analytics';
      if (currentPath.includes('demographics')) return 'student-demographics';
      return 'dashboard';
    }
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
      if (currentPath.includes('career-advisor')) return 'career-advisor';
      return 'dashboard';
    }
    return 'dashboard';
  };

  const handleHeaderNavigate = (target) => {
    if (role === 'COMPANY') handleCompanyNavigate(target);
    else if (role === 'STUDENT') handleStudentNavigate(target);
    else if (role === 'ADMIN') handleAdminNavigate(target);
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
    </div>
  );
}
