import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Lock, Mail, User, BookOpen, GraduationCap, MapPin, Code, Link, Globe, Building2, Briefcase, DollarSign, Award, ChevronRight, X, Phone, Check, AlertCircle, FileText, Search, KeyRound, RefreshCw, ArrowLeft } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

export default function LandingPage({ onLoginSuccess, apiBaseUrl = API_CONFIG.AUTH_SERVICE_URL }) {
  // Modal / Auth Drawer state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot_email', 'verify_otp', 'reset_password', 'reset_success'
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' or 'COMPANY'

  // Login States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Forgot Password & OTP States
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Student Comprehensive Registration States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [department, setDepartment] = useState('Computer Science & Eng.');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [gradYear, setGradYear] = useState('2026');
  const [cgpa, setCgpa] = useState('');
  const [skills, setSkills] = useState('Java, React, Spring Boot, SQL');
  const [leetcode, setLeetcode] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [location, setLocation] = useState('Coimbatore');

  // Company Comprehensive Registration States
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterRole, setRecruiterRole] = useState('Talent Acquisition Lead');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [industry, setIndustry] = useState('Software & Cloud Systems');
  const [companyLocation, setCompanyLocation] = useState('Bengaluru');
  const [companyBio, setCompanyBio] = useState('');

  // Live Data & Filter
  const [activeInternships, setActiveInternships] = useState([]);
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLiveInternships();
  }, []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const fetchLiveInternships = async () => {
    try {
      const res = await fetch(`${API_CONFIG.COMPANY_SERVICE_URL}/api/v1/company/internships`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setActiveInternships(data);
        }
      }
    } catch (e) {
      console.warn("Could not fetch live internships for landing page preview:", e);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setIsLoading(true);

    const targetBase = apiBaseUrl || API_CONFIG.AUTH_SERVICE_URL;

    if (authMode === 'login') {
      const cleanId = (identifier || '').trim();
      if (!cleanId || !password) {
        setErrorMsg('Please enter your email or username and password.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${targetBase}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: cleanId, password })
        });

        const data = await res.json().catch(() => null);

        if (res.ok && data && data.success) {
          onLoginSuccess(data);
        } else if (data?.email_unverified || res.status === 403) {
          setForgotEmail(data?.email || cleanId);
          setAuthMode('verify_registration_otp');
          setInfoMsg(data?.detail || 'Your email address has not been verified yet. A 6-digit OTP code has been sent to ' + (data?.email || cleanId) + '.');
          setResendTimer(30);
        } else {
          setErrorMsg(data?.detail || data?.error || 'Invalid login credentials. Please check password.');
        }
      } catch (err) {
        setErrorMsg('Backend connection error. Please ensure Spring Boot Auth Service is running.');
      } finally {
        setIsLoading(false);
      }
    } else if (authMode === 'register') {
      // Registration Flow
      if (role === 'STUDENT') {
        if (!name.trim() || !email.trim() || !phone.trim() || !regPassword.trim() || !college.trim() || !degree.trim() || !department.trim() || !yearOfStudy.trim() || !gradYear.trim() || !cgpa.trim() || !skills.trim() || !leetcode.trim() || !github.trim()) {
          setErrorMsg('❌ All student profile fields marked with * are strictly mandatory.');
          setIsLoading(false);
          return;
        }

        const payload = {
          account_type: 'STUDENT',
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          username: username.trim() || email.trim().split('@')[0],
          password: regPassword,
          college: college.trim(),
          degree: degree.trim(),
          department: department.trim(),
          branch: department.trim(),
          year_of_study: yearOfStudy.trim(),
          grad_year: parseInt(gradYear, 10) || 2026,
          cgpa: parseFloat(cgpa) || 0.0,
          skills: skills.trim(),
          leetcode: leetcode.trim(),
          github: github.trim(),
          linkedin: linkedin.trim(),
          portfolio: portfolio.trim(),
          gender: gender,
          location: location.trim()
        };

        try {
          const res = await fetch(`${targetBase}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json().catch(() => null);

          if (res.ok && data && data.success) {
            if (data.verification_required) {
              setForgotEmail(data.email || email);
              setAuthMode('verify_registration_otp');
              setInfoMsg(data.message || 'Registration recorded! Please check your email for the 6-digit verification code.');
              setResendTimer(30);
            } else {
              onLoginSuccess(data);
            }
          } else {
            setErrorMsg(data?.detail || data?.message || data?.error || 'Student registration failed.');
          }
        } catch (err) {
          setErrorMsg('Backend connection error during registration.');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Company Recruiter Registration
        if (!recruiterName.trim() || !companyName.trim() || !companyEmail.trim() || !regPassword.trim()) {
          setErrorMsg('❌ Recruiter Name, Company Name, Official Email, and Password are required.');
          setIsLoading(false);
          return;
        }

        const payload = {
          account_type: 'COMPANY',
          username: companyName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
          email: companyEmail.trim(),
          password: regPassword,
          name: companyName.trim(),
          recruiter_name: recruiterName.trim(),
          recruiter_role: recruiterRole.trim(),
          company_website: companyWebsite.trim(),
          industry: industry,
          location: companyLocation.trim(),
          bio: companyBio.trim()
        };

        try {
          const res = await fetch(`${targetBase}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json().catch(() => null);

          if (res.ok && data && data.success) {
            if (data.verification_required) {
              setForgotEmail(data.email || companyEmail);
              setAuthMode('verify_registration_otp');
              setInfoMsg(data.message || 'Registration recorded! Please check your email for the 6-digit verification code.');
              setResendTimer(30);
            } else {
              onLoginSuccess(data);
            }
          } else {
            setErrorMsg(data?.detail || data?.message || data?.error || 'Company registration failed.');
          }
        } catch (err) {
          setErrorMsg('Backend connection error during registration.');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleVerifyRegistrationOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    const targetBase = apiBaseUrl || API_CONFIG.AUTH_SERVICE_URL;

    const cleanOtp = (otpCode || '').trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    const cleanEmail = (forgotEmail || email || companyEmail || identifier || '').trim();

    setIsLoading(true);
    try {
      const res = await fetch(`${targetBase}/api/v1/auth/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp })
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        setInfoMsg('Email verified successfully! Your account is active.');
        setTimeout(() => {
          onLoginSuccess(data);
        }, 600);
      } else {
        setErrorMsg(data?.detail || data?.error || 'Invalid OTP verification code.');
      }
    } catch (err) {
      setErrorMsg('Backend connection error reaching Auth Service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    const targetBase = apiBaseUrl || API_CONFIG.AUTH_SERVICE_URL;

    const cleanEmail = (forgotEmail || identifier || '').trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${targetBase}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        setForgotEmail(cleanEmail);
        setAuthMode('verify_otp');
        setInfoMsg(data.message || 'Verification code sent! Check your email inbox.');
        setResendTimer(30);
      } else {
        setErrorMsg(data?.detail || data?.error || 'Could not send verification code.');
      }
    } catch (err) {
      setErrorMsg('Backend connection error reaching Auth Service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    const targetBase = apiBaseUrl || API_CONFIG.AUTH_SERVICE_URL;

    const cleanOtp = (otpCode || '').trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${targetBase}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: cleanOtp })
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success && data.resetToken) {
        setResetToken(data.resetToken);
        setAuthMode('reset_password');
        setInfoMsg('OTP verified successfully! Create your new password.');
      } else {
        setErrorMsg(data?.detail || data?.error || 'Invalid OTP verification code.');
      }
    } catch (err) {
      setErrorMsg('Backend connection error reaching Auth Service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    const targetBase = apiBaseUrl || API_CONFIG.AUTH_SERVICE_URL;

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${targetBase}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword, confirmPassword })
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        setAuthMode('reset_success');
        setInfoMsg('Password reset successfully! You can now log in using your new password.');
      } else {
        setErrorMsg(data?.detail || data?.error || 'Failed to reset password.');
      }
    } catch (err) {
      setErrorMsg('Backend connection error reaching Auth Service.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInternships = activeInternships.filter(job => {
    const cName = (job.company_name || job.COMPANY_NAME || '').toLowerCase();
    if (!cName || cName === 'deleted company' || cName === 'null') return false;

    const titleMatch = (job.title || job.TITLE || '').toLowerCase().includes(searchQuery.toLowerCase());
    const companyMatch = cName.includes(searchQuery.toLowerCase());
    const domainMatch = domainFilter === 'ALL' || (job.domain || job.DOMAIN || '').toUpperCase() === domainFilter.toUpperCase();
    return (titleMatch || companyMatch) && domainMatch;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
            <Sparkles size={20} color="#FFFFFF" />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(90deg, #0F172A 0%, #2563EB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              InternMatch AI
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', display: 'block', letterSpacing: '0.05em' }}>
              AI-POWERED HIRING & PLACEMENT PLATFORM
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => { setAuthMode('login'); setErrorMsg(''); setInfoMsg(''); setShowAuthModal(true); }}
            style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setAuthMode('register'); setErrorMsg(''); setInfoMsg(''); setShowAuthModal(true); }}
            style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '0.86rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)', transition: 'all 0.2s ease' }}
          >
            Get Started <ArrowRight size={16} style={{ display: 'inline', marginLeft: '4px' }} />
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <section style={{ textAlign: 'center', padding: '40px 20px 60px 20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: '0.82rem', fontWeight: 700, marginBottom: '20px' }}>
            <ShieldCheck size={16} /> Enterprise Microservices Platform Architecture 2.0
          </div>
          
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.2, maxWidth: '850px', margin: '0 auto 20px auto' }}>
            Connect Top Engineering Candidates with Verified Corporate Tech Teams
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '680px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
            Automated screening, AI resume ATS matching, live coding evaluations, and instant offer letter issuance powered by Spring Boot microservices and MySQL Workbench database.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setAuthMode('register'); setRole('STUDENT'); setErrorMsg(''); setInfoMsg(''); setShowAuthModal(true); }}
              style={{ padding: '14px 28px', borderRadius: '10px', background: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '0.95rem', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <GraduationCap size={20} /> Join as Student Candidate
            </button>
            <button
              onClick={() => { setAuthMode('register'); setRole('COMPANY'); setErrorMsg(''); setInfoMsg(''); setShowAuthModal(true); }}
              style={{ padding: '14px 28px', borderRadius: '10px', background: '#FFFFFF', color: '#0F172A', fontWeight: 800, fontSize: '0.95rem', border: '1px solid #CBD5E1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Building2 size={20} color="#2563EB" /> Register as Corporate Recruiter
            </button>
          </div>
        </section>

        {/* 3. PLATFORM HIGHLIGHTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Code size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>AI Technical Screening</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
              Dynamic coding and aptitude assessments custom-generated per role with automated evaluation and match scoring.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>ATS Resume Matcher</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
              Instant compatibility scoring against job requirements with skill gap highlights and recommended certifications.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F3E8FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Award size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>Official Offer Letters</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
              Instant offer issuance with real-time seat allocation updates and recruiter status management.
            </p>
          </div>
        </div>

        {/* 4. LIVE INTERNSHIP EXPLORER PREVIEW */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
                Featured Active Opportunities
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
                Explore live internship postings from verified corporate hiring partners
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter role or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {filteredInternships.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {filteredInternships.slice(0, 6).map((job, idx) => {
                return (
                  <div key={job.id || job.ID || idx} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                            {job.title || job.TITLE || 'Software Engineering Intern'}
                          </h3>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2563EB', marginTop: '2px' }}>
                            {job.company_name || job.COMPANY_NAME || 'Corporate Partner'}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: '#EFF6FF', color: '#1D4ED8' }}>
                          {job.work_mode || job.WORK_MODE || 'Hybrid'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                        {(job.required_skills || job.REQUIRED_SKILLS || 'Java, React, SQL').split(',').map((st, i) => (
                          <span key={i} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }}>
                            {st.trim()}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px', fontSize: '0.82rem', color: '#64748B' }}>
                        <div>📍 Location: <strong style={{ color: '#0F172A' }}>{job.location || job.LOCATION || 'Bengaluru'}</strong></div>
                        <div>🕒 Duration: <strong style={{ color: '#0F172A' }}>{job.duration || job.DURATION || '3 Months'}</strong></div>
                        <div>💰 Stipend: <strong style={{ color: '#059669' }}>₹{job.stipend || job.STIPEND || '15,000'}/month</strong></div>
                      </div>
                    </div>

                    <button
                      onClick={() => { setAuthMode('login'); setErrorMsg(''); setInfoMsg(''); setShowAuthModal(true); }}
                      style={{ width: '100%', padding: '10px', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      Apply Now <ArrowRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#64748B' }}>
              No verified internships found matching your filter criteria.
            </div>
          )}
        </section>

      </main>

      {/* 5. FOOTER */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '20px 40px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={14} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>InternMatch AI</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
            🟢 Services Operational
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
          © 2026 InternMatch AI. All rights reserved.
        </div>
      </footer>

      {/* 6. AUTHENTICATION & FORGOT PASSWORD MODAL */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: authMode === 'register' ? '640px' : '420px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <KeyRound size={20} color="#FFFFFF" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {authMode === 'login' && 'Account Sign In'}
                  {authMode === 'register' && 'Create Account'}
                  {authMode === 'forgot_email' && 'Forgot Password'}
                  {authMode === 'verify_otp' && 'Verify OTP Code'}
                  {authMode === 'reset_password' && 'Create New Password'}
                  {authMode === 'reset_success' && 'Password Changed'}
                </h3>
              </div>
              <button onClick={() => setShowAuthModal(false)} style={{ border: 'none', background: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.84rem', marginBottom: '18px', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {infoMsg && (
              <div style={{ padding: '12px 16px', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', color: '#166534', fontSize: '0.84rem', marginBottom: '18px', fontWeight: 600 }}>
                {infoMsg}
              </div>
            )}

            {/* Auth Mode Tabs (Shown only during Login & Register) */}
            {(authMode === 'login' || authMode === 'register') && (
              <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMsg(''); setInfoMsg(''); }}
                  style={{ flex: 1, padding: '9px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 800, background: authMode === 'login' ? '#2563EB' : 'transparent', color: authMode === 'login' ? '#FFFFFF' : '#475569', border: 'none', cursor: 'pointer' }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMsg(''); setInfoMsg(''); }}
                  style={{ flex: 1, padding: '9px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 800, background: authMode === 'register' ? '#2563EB' : 'transparent', color: authMode === 'register' ? '#FFFFFF' : '#475569', border: 'none', cursor: 'pointer' }}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Role Switcher for Registration */}
            {authMode === 'register' && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 800, background: role === 'STUDENT' ? '#EFF6FF' : '#FFFFFF', color: role === 'STUDENT' ? '#2563EB' : '#475569', border: role === 'STUDENT' ? '2px solid #2563EB' : '1px solid #CBD5E1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <GraduationCap size={16} /> Student Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setRole('COMPANY')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 800, background: role === 'COMPANY' ? '#EFF6FF' : '#FFFFFF', color: role === 'COMPANY' ? '#2563EB' : '#475569', border: role === 'COMPANY' ? '2px solid #2563EB' : '1px solid #CBD5E1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Building2 size={16} /> Company Recruiter
                </button>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>EMAIL OR USERNAME</label>
                  <input
                    type="text"
                    required
                    placeholder="student@domain.com or company handle"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', margin: 0 }}>PASSWORD</label>
                    <button
                      type="button"
                      onClick={() => { setForgotEmail(identifier && identifier.includes('@') ? identifier : ''); setAuthMode('forgot_email'); setErrorMsg(''); setInfoMsg(''); }}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ marginTop: '12px', padding: '13px', borderRadius: '8px', background: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '0.92rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}
                >
                  {isLoading ? 'Authenticating...' : 'Sign In to Account'} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* 2. REGISTRATION FORM */}
            {authMode === 'register' && (
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {role === 'STUDENT' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                      1. BASIC CREDENTIALS
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>FULL NAME *</label>
                        <input type="text" required placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>EMAIL ADDRESS *</label>
                        <input type="email" required placeholder="student@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>PHONE NUMBER *</label>
                        <input type="text" required placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>CREATE PASSWORD *</label>
                        <input type="password" required placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginTop: '6px' }}>
                      2. EDUCATION DETAILS
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>COLLEGE NAME *</label>
                        <input type="text" required placeholder="PSG College of Technology" value={college} onChange={(e) => setCollege(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>DEGREE *</label>
                        <input type="text" required placeholder="B.Tech / B.E." value={degree} onChange={(e) => setDegree(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>BRANCH / DEPT *</label>
                        <input type="text" required placeholder="Computer Science" value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>CGPA *</label>
                        <input type="number" step="0.01" required placeholder="9.15" value={cgpa} onChange={(e) => setCgpa(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginTop: '6px' }}>
                      3. TECH SKILLS & PROFILES
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>SKILLS *</label>
                        <input type="text" required placeholder="Java, React, SQL" value={skills} onChange={(e) => setSkills(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>LEETCODE HANDLE *</label>
                        <input type="text" required placeholder="alex_johnson" value={leetcode} onChange={(e) => setLeetcode(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>GITHUB USERNAME *</label>
                        <input type="text" required placeholder="alexjohnson" value={github} onChange={(e) => setGithub(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                      1. RECRUITER INFO
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>RECRUITER NAME *</label>
                        <input type="text" required placeholder="Sarah Jenkins" value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>COMPANY NAME *</label>
                        <input type="text" required placeholder="NVIDIA Corporation" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>OFFICIAL EMAIL *</label>
                        <input type="email" required placeholder="recruiter@nvidia.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>PASSWORD *</label>
                        <input type="password" required placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }} />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ marginTop: '12px', padding: '13px', borderRadius: '8px', background: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '0.92rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}
                >
                  {isLoading ? 'Processing...' : 'Complete Registration'} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* REGISTRATION OTP VERIFICATION FORM */}
            {authMode === 'verify_registration_otp' && (
              <form onSubmit={handleVerifyRegistrationOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <Mail size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                    Verify Your Email Address
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                    We sent a 6-digit OTP verification code to: <br/>
                    <strong style={{ color: '#2563EB', wordBreak: 'break-all' }}>{forgotEmail || email || companyEmail || identifier}</strong>
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px', textAlign: 'center' }}>
                    ENTER 6-DIGIT OTP VERIFICATION CODE
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="482913"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', background: '#FFFFFF', border: '2px solid #2563EB', color: '#0F172A', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.3em', textAlign: 'center', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748B' }}>
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    disabled={resendTimer > 0 || isLoading}
                    onClick={handleSendOtp}
                    style={{ background: 'none', border: 'none', color: resendTimer > 0 ? '#94A3B8' : '#2563EB', fontWeight: 700, cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RefreshCw size={13} /> {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMsg(''); setInfoMsg(''); }}
                    style={{ flex: 1, padding: '11px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer' }}
                  >
                    Change Info
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{ flex: 1.5, padding: '11px', borderRadius: '8px', background: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}
                  >
                    {isLoading ? 'Activating...' : 'Verify & Activate Account'} <CheckCircle2 size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* 3. FORGOT PASSWORD STEP 1: ENTER EMAIL */}
            {authMode === 'forgot_email' && (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                  Enter your registered account email address. We will send a 6-digit OTP code to verify your identity.
                </p>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>REGISTERED EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    placeholder="student@domain.com or recruiter@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMsg(''); setInfoMsg(''); }}
                    style={{ flex: 1, padding: '11px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <ArrowLeft size={16} /> Back to Sign In
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{ flex: 1.5, padding: '11px', borderRadius: '8px', background: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {isLoading ? 'Sending...' : 'Send OTP Code'} <Mail size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* 4. FORGOT PASSWORD STEP 2: VERIFY OTP */}
            {authMode === 'verify_otp' && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                  We sent a 6-digit verification code to <strong style={{ color: '#2563EB' }}>{forgotEmail}</strong>. Code expires in 5 minutes.
                </p>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>ENTER 6-DIGIT OTP CODE</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="482913"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', background: '#FFFFFF', border: '2px solid #2563EB', color: '#0F172A', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.3em', textAlign: 'center', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748B' }}>
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    disabled={resendTimer > 0 || isLoading}
                    onClick={handleSendOtp}
                    style={{ background: 'none', border: 'none', color: resendTimer > 0 ? '#94A3B8' : '#2563EB', fontWeight: 700, cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RefreshCw size={13} /> {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot_email'); setErrorMsg(''); setInfoMsg(''); }}
                    style={{ flex: 1, padding: '11px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer' }}
                  >
                    Change Email
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{ flex: 1.5, padding: '11px', borderRadius: '8px', background: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP Code'} <CheckCircle2 size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* 5. FORGOT PASSWORD STEP 3: CREATE NEW PASSWORD */}
            {authMode === 'reset_password' && (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                  Create a new secure password for <strong style={{ color: '#2563EB' }}>{forgotEmail}</strong>.
                </p>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>NEW PASSWORD</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>CONFIRM NEW PASSWORD</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ marginTop: '8px', padding: '13px', borderRadius: '8px', background: '#059669', color: '#FFFFFF', fontWeight: 800, fontSize: '0.92rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 6px rgba(5,150,105,0.25)' }}
                >
                  {isLoading ? 'Updating Password...' : 'Save New Password & Reset'} <ShieldCheck size={18} />
                </button>
              </form>
            )}

            {/* 6. FORGOT PASSWORD STEP 4: SUCCESS CONFIRMATION */}
            {authMode === 'reset_success' && (
              <div style={{ textAlign: 'center', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Password Reset Successfully!
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                  Your password has been updated in the MySQL database. You can now log in using your new password.
                </p>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setPassword(''); setErrorMsg(''); setInfoMsg(''); }}
                  style={{ width: '100%', marginTop: '8px', padding: '12px', borderRadius: '8px', background: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}
                >
                  Back to Sign In
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
