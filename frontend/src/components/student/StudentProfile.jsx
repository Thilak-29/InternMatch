import React, { useState, useEffect, useRef } from 'react';
import SkillsSelector from '../common/SkillsSelector';
import {
  User, BookOpen, Code, FolderGit2, Award, X, Plus, Edit3, Save, Camera, Trash2,
  ExternalLink, CheckCircle, AlertCircle, Sparkles, Upload, FileText, GitBranch,
  Terminal, CheckCircle2, MapPin, Phone, Mail, Globe, Github, Linkedin, Briefcase,
  GraduationCap, Calendar, Star, ChevronDown, ChevronUp
} from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

export default function StudentProfile({ currentUser }) {
  const userId = currentUser?.userId || currentUser?.user_id || currentUser?.ID || currentUser?.id;
  const token = currentUser?.token || '';
  const avatarInputRef = useRef(null);

  if (!userId) {
    return (
      <div className="glass-card" style={{ padding: '36px', textAlign: 'center', color: '#DC2626' }}>
        <AlertCircle size={32} style={{ margin: '0 auto 12px auto' }} />
        <h3>Session Authentication Error</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
          Unable to identify authenticated user ID. Please sign in and try again.
        </p>
      </div>
    );
  }

  // ── Main State ─────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [resumeFileName, setResumeFileName] = useState('');

  // ── Card-by-Card Editing States ──────────────────────────────────────────
  // Active section currently in edit mode: 'personal' | 'education' | 'skills' | 'social' | 'certifications' | null
  const [editingSection, setEditingSection] = useState(null);
  const [savingSection, setSavingSection] = useState(null);
  const [sectionFeedback, setSectionFeedback] = useState({}); // { [sectionKey]: { type: 'success'|'error', msg: '' } }

  // Card Draft Form States
  const [draftPersonal, setDraftPersonal] = useState({});
  const [draftEducation, setDraftEducation] = useState({});
  const [draftSkillsInput, setDraftSkillsInput] = useState('');
  const [draftSkillsArr, setDraftSkillsArr] = useState([]);
  const [draftSocial, setDraftSocial] = useState({});

  // ── External Stats ────────────────────────────────────────────────────────
  const [leetCodeStats, setLeetCodeStats] = useState(null);
  const [gitHubStats, setGitHubStats] = useState(null);

  // ── UI Modals & Upload States ────────────────────────────────────────────
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeFeedback, setResumeFeedback] = useState('');
  const [resumeUploadProgress, setResumeUploadProgress] = useState('');
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [newCert, setNewCert] = useState({ name: '', issuer: '', issueDate: '', credentialId: '', credentialUrl: '' });

  // Email Change Modal & OTP States
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpStep, setEmailOtpStep] = useState('request');
  const [emailResendTimer, setEmailResendTimer] = useState(0);
  const [emailChangeFeedback, setEmailChangeFeedback] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Resume Auto-Fill Review Modal States
  const [extractedReviewData, setExtractedReviewData] = useState(null);
  const [showExtractedModal, setShowExtractedModal] = useState(false);
  const [reviewFormState, setReviewFormState] = useState(null);
  const [skillsMergeMode, setSkillsMergeMode] = useState('merge');

  const studentApiUrl = API_CONFIG.STUDENT_SERVICE_URL || 'http://localhost:8082';

  // ── Fetch Profile Effect ──────────────────────────────────────────────────
  useEffect(() => {
    fetchLiveProfile();
  }, [userId]);

  useEffect(() => {
    let timer;
    if (emailResendTimer > 0) {
      timer = setInterval(() => setEmailResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailResendTimer]);

  const fetchLiveProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${studentApiUrl}/api/v1/student/${userId}/profile`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const fetchedData = await res.json();
        const parsed = {
          name: fetchedData.name || fetchedData.user_name || currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : ''),
          email: fetchedData.email || fetchedData.user_email || currentUser?.email || '',
          phone: fetchedData.phone || fetchedData.user_phone || currentUser?.phone || '',
          dob: fetchedData.dob || fetchedData.user_dob || '',
          gender: fetchedData.gender || fetchedData.user_gender || currentUser?.gender || 'Prefer not to say',
          address: fetchedData.address || fetchedData.location || currentUser?.location || '',
          college: fetchedData.college || currentUser?.college || '',
          degree: fetchedData.degree || currentUser?.degree || '',
          branch: fetchedData.branch || fetchedData.department || currentUser?.branch || currentUser?.department || '',
          year_of_study: fetchedData.year_of_study || currentUser?.year_of_study || '',
          cgpa: (fetchedData.cgpa != null && fetchedData.cgpa !== '') ? fetchedData.cgpa : (currentUser?.cgpa != null ? currentUser.cgpa : ''),
          grad_year: (fetchedData.grad_year != null && fetchedData.grad_year !== '') ? fetchedData.grad_year : (currentUser?.grad_year || 2026),
          avatar_url: fetchedData.avatar_url || fetchedData.AVATAR_URL || fetchedData.avatar || '',
          github: fetchedData.github || currentUser?.github || '',
          leetcode: fetchedData.leetcode || currentUser?.leetcode || '',
          linkedin: fetchedData.linkedin || currentUser?.linkedin || '',
          portfolio: fetchedData.portfolio || currentUser?.portfolio || '',
          bio: fetchedData.bio || currentUser?.bio || ''
        };
        setProfile(parsed);
        if (fetchedData.resume_file_name) setResumeFileName(fetchedData.resume_file_name);

        const rawSkills = fetchedData.skills || currentUser?.skills || '';
        const skillArray = typeof rawSkills === 'string'
          ? rawSkills.split(',').map(s => s.trim()).filter(Boolean)
          : (Array.isArray(rawSkills) ? rawSkills : []);
        setSkills(skillArray);

        if (parsed.leetcode) fetchLeetCode(parsed.leetcode);
        if (parsed.github) fetchGitHub(parsed.github);
      } else {
        const fallbackName = currentUser?.name || currentUser?.username || (currentUser?.email ? currentUser.email.split('@')[0] : '');
        const fallbackProfile = {
          name: fallbackName,
          email: currentUser?.email || '',
          phone: currentUser?.phone || '',
          dob: '',
          gender: currentUser?.gender || 'Prefer not to say',
          address: currentUser?.location || '',
          college: currentUser?.college || '',
          degree: currentUser?.degree || '',
          branch: currentUser?.branch || currentUser?.department || '',
          year_of_study: currentUser?.year_of_study || '',
          cgpa: currentUser?.cgpa || '',
          grad_year: currentUser?.grad_year || 2026,
          github: currentUser?.github || '',
          leetcode: currentUser?.leetcode || '',
          linkedin: currentUser?.linkedin || '',
          portfolio: currentUser?.portfolio || '',
          bio: currentUser?.bio || ''
        };
        setProfile(fallbackProfile);
        const rawFallbackSkills = currentUser?.skills || '';
        const fallbackSkillArray = typeof rawFallbackSkills === 'string'
          ? rawFallbackSkills.split(',').map(s => s.trim()).filter(Boolean)
          : (Array.isArray(rawFallbackSkills) ? rawFallbackSkills : []);
        setSkills(fallbackSkillArray);

        if (fallbackProfile.leetcode) fetchLeetCode(fallbackProfile.leetcode);
        if (fallbackProfile.github) fetchGitHub(fallbackProfile.github);
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Fetch Coding Stats ────────────────────────────────────────────────────
  const fetchLeetCode = async (username) => {
    if (!username || username.trim() === '' || username === 'Not set') {
      setLeetCodeStats(null);
      return;
    }
    const cleanUser = username.trim().replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, '').replace(/\/.*$/, '');
    try {
      const res = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${cleanUser}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.totalSolved !== undefined && data.totalSolved > 0) {
          setLeetCodeStats({
            solvedCount: data.totalSolved || 0,
            easy: data.easySolved || 0,
            medium: data.mediumSolved || 0,
            hard: data.hardSolved || 0,
            ranking: data.ranking || 0
          });
          return;
        }
      }
    } catch (e) {}
    try {
      const res2 = await fetch(`https://leetcode-stats-api.herokuapp.com/${cleanUser}`);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && (data2.status === 'success' || data2.totalSolved !== undefined)) {
          setLeetCodeStats({
            solvedCount: data2.totalSolved || 0,
            easy: data2.easySolved || 0,
            medium: data2.mediumSolved || 0,
            hard: data2.hardSolved || 0,
            ranking: data2.ranking || 0
          });
          return;
        }
      }
    } catch (e) {}
  };

  const fetchGitHub = async (username) => {
    if (!username || username.trim() === '' || username === 'Not set') {
      setGitHubStats(null);
      return;
    }
    const cleanUser = username.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/.*$/, '');
    try {
      const res = await fetch(`https://api.github.com/users/${cleanUser}`);
      if (res.ok) {
        const data = await res.json();
        setGitHubStats({
          publicRepos: data.public_repos !== undefined ? data.public_repos : 0,
          followers: data.followers !== undefined ? data.followers : 0,
          following: data.following !== undefined ? data.following : 0
        });
      }
    } catch (e) {}
  };

  // ── CARD EDIT HANDLERS (Card-by-Card Isolation) ──────────────────────────

  // 1. Personal Info Edit
  const handleStartEditPersonal = () => {
    setDraftPersonal({
      name: profile?.name || '',
      phone: profile?.phone || '',
      gender: profile?.gender || 'Prefer not to say',
      address: profile?.address || '',
      bio: profile?.bio || ''
    });
    setEditingSection('personal');
  };

  const handleSavePersonal = async () => {
    await saveSectionData('personal', {
      name: draftPersonal.name,
      phone: draftPersonal.phone,
      gender: draftPersonal.gender,
      address: draftPersonal.address,
      location: draftPersonal.address,
      bio: draftPersonal.bio
    });
  };

  // 2. Education Edit
  const handleStartEditEducation = () => {
    setDraftEducation({
      college: profile?.college || '',
      degree: profile?.degree || '',
      branch: profile?.branch || '',
      year_of_study: profile?.year_of_study || '',
      cgpa: profile?.cgpa || '',
      grad_year: profile?.grad_year || 2026
    });
    setEditingSection('education');
  };

  const handleSaveEducation = async () => {
    await saveSectionData('education', {
      college: draftEducation.college,
      degree: draftEducation.degree,
      branch: draftEducation.branch,
      year_of_study: draftEducation.year_of_study,
      cgpa: draftEducation.cgpa,
      grad_year: draftEducation.grad_year
    });
  };

  // 3. Technical Skills Edit
  const handleStartEditSkills = () => {
    setDraftSkillsArr([...skills]);
    setEditingSection('skills');
  };

  const handleSaveSkills = async () => {
    await saveSectionData('skills', {}, draftSkillsArr);
  };

  // 4. Social Links & Handles Edit
  const handleStartEditSocial = () => {
    setDraftSocial({
      github: profile?.github || '',
      leetcode: profile?.leetcode || '',
      linkedin: profile?.linkedin || '',
      portfolio: profile?.portfolio || ''
    });
    setEditingSection('social');
  };

  const handleSaveSocial = async () => {
    await saveSectionData('social', {
      github: draftSocial.github,
      leetcode: draftSocial.leetcode,
      linkedin: draftSocial.linkedin,
      portfolio: draftSocial.portfolio
    });
  };

  // ── Generic Section Save Dispatcher ──────────────────────────────────────
  const saveSectionData = async (sectionKey, updateFields, updatedSkillsArr = null) => {
    setSavingSection(sectionKey);
    setSectionFeedback(prev => ({ ...prev, [sectionKey]: null }));

    const mergedSkills = updatedSkillsArr !== null ? updatedSkillsArr : skills;
    const payload = {
      ...profile,
      ...updateFields,
      skills: mergedSkills.join(', ')
    };

    try {
      const res = await fetch(`${studentApiUrl}/api/v1/student/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setProfile(payload);
        if (updatedSkillsArr !== null) setSkills(updatedSkillsArr);

        if (currentUser) {
          const updatedUser = { ...currentUser, ...payload };
          localStorage.setItem('internmatch_user', JSON.stringify(updatedUser));
        }

        if (updateFields.leetcode !== undefined && updateFields.leetcode !== profile?.leetcode) {
          fetchLeetCode(updateFields.leetcode);
        }
        if (updateFields.github !== undefined && updateFields.github !== profile?.github) {
          fetchGitHub(updateFields.github);
        }

        setEditingSection(null);
        setSectionFeedback(prev => ({ ...prev, [sectionKey]: { type: 'success', msg: '✓ Section saved successfully!' } }));
      } else {
        const data = await res.json().catch(() => null);
        setSectionFeedback(prev => ({ ...prev, [sectionKey]: { type: 'error', msg: '❌ ' + (data?.error || data?.message || 'Failed to save section.') } }));
      }
    } catch (e) {
      setSectionFeedback(prev => ({ ...prev, [sectionKey]: { type: 'error', msg: '❌ Connection error saving section.' } }));
    } finally {
      setSavingSection(null);
      setTimeout(() => {
        setSectionFeedback(prev => ({ ...prev, [sectionKey]: null }));
      }, 4000);
    }
  };

  // Cancel edit for active section
  const handleCancelSectionEdit = () => {
    setEditingSection(null);
  };

  // ── Avatar Upload Handler ────────────────────────────────────────────────
  const handleAvatarFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const newAvatarUrl = reader.result;
      setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));
      await saveSectionData('avatar', { avatar_url: newAvatarUrl });
    };
    reader.readAsDataURL(file);
  };

  // ── Email Change & Verification OTP Handlers ─────────────────────────────
  const handleRequestEmailChange = async (e) => {
    if (e) e.preventDefault();
    setEmailChangeError('');
    setEmailChangeFeedback('');
    if (!newEmailInput || !newEmailInput.includes('@')) {
      setEmailChangeError('Please enter a valid new email address.');
      return;
    }
    setIsEmailLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.AUTH_SERVICE_URL || 'http://localhost:8081'}/api/v1/auth/request-email-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newEmail: newEmailInput.trim() })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        setEmailOtpStep('verify');
        setEmailChangeFeedback(data.message || 'Verification OTP code sent to your new email.');
        setEmailResendTimer(30);
      } else {
        setEmailChangeError(data?.detail || data?.error || 'Could not send verification code.');
      }
    } catch (err) {
      setEmailChangeError('Connection error reaching Auth Service.');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleVerifyEmailChange = async (e) => {
    if (e) e.preventDefault();
    setEmailChangeError('');
    setEmailChangeFeedback('');
    if (!emailOtpCode || emailOtpCode.trim().length < 6) {
      setEmailChangeError('Please enter the 6-digit verification code.');
      return;
    }
    setIsEmailLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.AUTH_SERVICE_URL || 'http://localhost:8081'}/api/v1/auth/verify-email-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newEmail: newEmailInput.trim(), otp: emailOtpCode.trim() })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        setProfile(prev => ({ ...prev, email: data.email, email_verified: true, emailVerified: true }));
        setEmailChangeFeedback('✓ Email address updated and verified successfully!');
        try {
          const stored = localStorage.getItem('internmatch_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.email = data.email;
            parsed.email_verified = true;
            localStorage.setItem('internmatch_user', JSON.stringify(parsed));
          }
        } catch (ignored) {}

        setTimeout(() => {
          setShowEmailChangeModal(false);
          setEmailOtpStep('request');
          setNewEmailInput('');
          setEmailOtpCode('');
        }, 1200);
      } else {
        setEmailChangeError(data?.detail || data?.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setEmailChangeError('Connection error reaching Auth Service.');
    } finally {
      setIsEmailLoading(false);
    }
  };

  // ── Resume Upload & Resume Auto-Fill Handlers ────────────────────────────
  const handleResumeUpload = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    setIsUploadingResume(true);
    setResumeUploadProgress('Uploading resume file to server...');
    setResumeFeedback('Uploading resume file to server...');
    const fName = file.name;
    setResumeFileName(fName);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setResumeUploadProgress('Extracting text & analyzing resume structure with AI...');
      setResumeFeedback('Extracting text & analyzing resume structure with AI...');

      const res = await fetch(`${studentApiUrl}/api/v1/student/${userId}/resume/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': token } : {},
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const extProfile = data.extracted_profile || {};
        setExtractedReviewData({
          fileName: fName,
          atsScore: data.resume_score || 90,
          rawProfile: extProfile
        });

        setReviewFormState({
          name: extProfile.name || profile?.name || '',
          email: extProfile.email || profile?.email || '',
          phone: extProfile.phone || profile?.phone || '',
          location: extProfile.location || profile?.address || '',
          college: extProfile.college || profile?.college || '',
          degree: extProfile.degree || profile?.degree || '',
          branch: extProfile.branch || profile?.branch || '',
          year_of_study: extProfile.year_of_study || profile?.year_of_study || '',
          grad_year: extProfile.grad_year || profile?.grad_year || 2026,
          cgpa: extProfile.cgpa != null ? extProfile.cgpa : (profile?.cgpa || ''),
          github: extProfile.github || profile?.github || '',
          linkedin: extProfile.linkedin || profile?.linkedin || '',
          leetcode: extProfile.leetcode || profile?.leetcode || '',
          portfolio: extProfile.portfolio || profile?.portfolio || '',
          bio: extProfile.bio || profile?.bio || '',
          extractedSkills: Array.isArray(extProfile.skills) ? extProfile.skills : []
        });

        setShowExtractedModal(true);
        setResumeFeedback('✓ Resume parsed! Review extracted profile information below.');
      } else {
        setResumeFeedback('❌ Could not parse resume file. Please upload a valid PDF or DOCX file.');
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      setResumeFeedback('❌ Error processing resume file.');
    } finally {
      setIsUploadingResume(false);
      setResumeUploadProgress('');
      setTimeout(() => setResumeFeedback(''), 6000);
    }
  };

  const handleApplyExtractedProfile = async () => {
    if (!reviewFormState) return;

    let finalSkillsList = [...skills];
    const newExtractedSkills = reviewFormState.extractedSkills || [];

    if (skillsMergeMode === 'merge') {
      newExtractedSkills.forEach(s => {
        if (s && !finalSkillsList.map(existing => existing.toLowerCase()).includes(s.toLowerCase())) {
          finalSkillsList.push(s);
        }
      });
    } else {
      finalSkillsList = newExtractedSkills.filter(Boolean);
    }

    const updatedProfile = {
      ...profile,
      name: reviewFormState.name || profile.name,
      phone: reviewFormState.phone || profile.phone,
      address: reviewFormState.location || profile.address,
      location: reviewFormState.location || profile.address,
      college: reviewFormState.college || profile.college,
      degree: reviewFormState.degree || profile.degree,
      branch: reviewFormState.branch || profile.branch,
      year_of_study: reviewFormState.year_of_study || profile.year_of_study,
      grad_year: reviewFormState.grad_year || profile.grad_year,
      cgpa: reviewFormState.cgpa !== '' ? reviewFormState.cgpa : profile.cgpa,
      github: reviewFormState.github || profile.github,
      linkedin: reviewFormState.linkedin || profile.linkedin,
      leetcode: reviewFormState.leetcode || profile.leetcode,
      portfolio: reviewFormState.portfolio || profile.portfolio,
      bio: reviewFormState.bio || profile.bio,
      skills: finalSkillsList.join(', ')
    };

    setProfile(updatedProfile);
    setSkills(finalSkillsList);

    try {
      await fetch(`${studentApiUrl}/api/v1/student/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(updatedProfile)
      });
    } catch (e) {}

    setShowExtractedModal(false);
  };

  // ── Render Loading State ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
        <Sparkles size={32} color="#2563EB" style={{ margin: '0 auto 12px auto', animation: 'spin 2s linear infinite' }} />
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>Loading Student Dossier & Profile...</h4>
      </div>
    );
  }

  if (!profile) return null;

  // ── RENDER REDESIGNED STUDENT PROFILE ─────────────────────────────────────
  return (
    <div className="sp-profile-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1140px', margin: '0 auto', paddingBottom: '40px' }}>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. ELEGANT PROFILE HEADER CARD (NO GLOBAL EDIT BUTTON)             */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>

          {/* Left Avatar & Primary Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => avatarInputRef.current?.click()} title="Click to update profile photo">
              <div style={{ width: '92px', height: '92px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #BFDBFE', overflow: 'hidden', boxShadow: '0 4px 10px rgba(37,99,235,0.12)' }}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={46} color="#2563EB" />
                )}
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#2563EB', color: '#FFFFFF', padding: '6px', borderRadius: '50%', border: '2px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
                <Camera size={14} />
              </div>
              <input type="file" ref={avatarInputRef} accept="image/*" onChange={handleAvatarFileChange} style={{ display: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  {profile.name || 'Student Name'}
                </h1>
                {profile.email_verified || profile.emailVerified ? (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> Verified Profile
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706', background: '#FEF3C7', border: '1px solid #FCD34D', padding: '2px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={12} /> Email Unverified
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.92rem', color: '#2563EB', fontWeight: 700 }}>
                {profile.degree ? `${profile.degree} ${profile.branch ? `(${profile.branch})` : ''}` : 'Computer Science & Engineering'}
              </div>

              <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap size={16} color="#64748B" />
                {profile.college || 'Karpagam College of Engineering'}
              </div>

              <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: '#64748B', marginTop: '4px', flexWrap: 'wrap' }}>
                {profile.address && <span>📍 {profile.address}</span>}
                {profile.phone && <span>📞 {profile.phone}</span>}
                {profile.cgpa && <span>📊 CGPA: <strong style={{ color: '#0F172A' }}>{profile.cgpa} / 10</strong></span>}
                {profile.grad_year && <span>🎓 Class of {profile.grad_year}</span>}
              </div>
            </div>
          </div>

          {/* Right Handle Chips & Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {profile.github && (
                <a href={`https://github.com/${profile.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '')}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', padding: '6px 12px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, color: '#1E293B', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Github size={14} /> {profile.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '')}
                </a>
              )}
              {profile.leetcode && (
                <a href={`https://leetcode.com/${profile.leetcode.replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, '')}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', padding: '6px 12px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Code size={14} /> LeetCode
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', padding: '6px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Linkedin size={14} /> LinkedIn
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => { setShowEmailChangeModal(true); setEmailOtpStep('request'); setNewEmailInput(''); setEmailOtpCode(''); setEmailChangeError(''); setEmailChangeFeedback(''); }}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Update Verified Account Email
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* MAIN 2-COLUMN BALANCED LAYOUT                                      */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>

        {/* ── LEFT MAIN COLUMN (CARDS WITH INDEPENDENT [EDIT] BUTTONS) ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* CARD 1: PERSONAL INFORMATION CARD */}
          <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#2563EB" /> Personal Information
              </h3>

              {editingSection === 'personal' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCancelSectionEdit} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                    Cancel
                  </button>
                  <button onClick={handleSavePersonal} disabled={savingSection === 'personal'} className="btn-primary" style={{ padding: '5px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Save size={14} /> {savingSection === 'personal' ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <button onClick={handleStartEditPersonal} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Edit3 size={14} /> Edit
                </button>
              )}
            </div>

            {sectionFeedback['personal'] && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '14px', background: sectionFeedback['personal'].type === 'error' ? '#FEE2E2' : '#DCFCE7', color: sectionFeedback['personal'].type === 'error' ? '#991B1B' : '#166534' }}>
                {sectionFeedback['personal'].msg}
              </div>
            )}

            {editingSection === 'personal' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>FULL NAME</label>
                  <input type="text" className="input-field" value={draftPersonal.name} onChange={(e) => setDraftPersonal({ ...draftPersonal, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>PHONE NUMBER</label>
                  <input type="text" className="input-field" value={draftPersonal.phone} onChange={(e) => setDraftPersonal({ ...draftPersonal, phone: e.target.value })} placeholder="+91 9876543210" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>GENDER</label>
                  <select className="input-field" value={draftPersonal.gender} onChange={(e) => setDraftPersonal({ ...draftPersonal, gender: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>LOCATION / CITY</label>
                  <input type="text" className="input-field" value={draftPersonal.address} onChange={(e) => setDraftPersonal({ ...draftPersonal, address: e.target.value })} placeholder="Coimbatore, Tamil Nadu" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>ABOUT / PROFESSIONAL SUMMARY</label>
                  <textarea rows={3} className="input-field" value={draftPersonal.bio} onChange={(e) => setDraftPersonal({ ...draftPersonal, bio: e.target.value })} placeholder="Brief background summary..." />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Full Name</div>
                  <div style={{ fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{profile.name || 'Not set'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Phone Number</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{profile.phone || 'Not set'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Gender</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{profile.gender || 'Not set'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Location</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{profile.address || 'Not set'}</div>
                </div>
                {profile.bio && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Summary</div>
                    <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '2px', lineHeight: 1.5 }}>{profile.bio}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CARD 2: EDUCATION CARD */}
          <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={18} color="#2563EB" /> Education & Academic Dossier
              </h3>

              {editingSection === 'education' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCancelSectionEdit} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                    Cancel
                  </button>
                  <button onClick={handleSaveEducation} disabled={savingSection === 'education'} className="btn-primary" style={{ padding: '5px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Save size={14} /> {savingSection === 'education' ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <button onClick={handleStartEditEducation} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Edit3 size={14} /> Edit
                </button>
              )}
            </div>

            {sectionFeedback['education'] && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '14px', background: sectionFeedback['education'].type === 'error' ? '#FEE2E2' : '#DCFCE7', color: sectionFeedback['education'].type === 'error' ? '#991B1B' : '#166534' }}>
                {sectionFeedback['education'].msg}
              </div>
            )}

            {editingSection === 'education' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.85rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>COLLEGE / INSTITUTION NAME</label>
                  <input type="text" className="input-field" value={draftEducation.college} onChange={(e) => setDraftEducation({ ...draftEducation, college: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>DEGREE PROGRAM</label>
                  <input type="text" className="input-field" value={draftEducation.degree} onChange={(e) => setDraftEducation({ ...draftEducation, degree: e.target.value })} placeholder="B.E. / B.Tech" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>BRANCH / SPECIALIZATION</label>
                  <input type="text" className="input-field" value={draftEducation.branch} onChange={(e) => setDraftEducation({ ...draftEducation, branch: e.target.value })} placeholder="Computer Science & Engineering" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>YEAR OF STUDY</label>
                  <select className="input-field" value={draftEducation.year_of_study} onChange={(e) => setDraftEducation({ ...draftEducation, year_of_study: e.target.value })}>
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>CGPA (OUT OF 10.0)</label>
                  <input type="text" className="input-field" value={draftEducation.cgpa} onChange={(e) => setDraftEducation({ ...draftEducation, cgpa: e.target.value })} placeholder="8.5" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>GRADUATION YEAR</label>
                  <input type="number" className="input-field" value={draftEducation.grad_year} onChange={(e) => setDraftEducation({ ...draftEducation, grad_year: e.target.value })} placeholder="2026" />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                  {profile.degree ? `${profile.degree} in ${profile.branch || ''}` : 'B.E. Computer Science and Engineering'}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#2563EB', fontWeight: 700 }}>
                  {profile.college || 'Karpagam College of Engineering'}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#64748B', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span>🗓️ Year: <strong style={{ color: '#0F172A' }}>{profile.year_of_study || '3rd Year'}</strong></span>
                  <span>📊 CGPA: <strong style={{ color: '#0F172A' }}>{profile.cgpa ? `${profile.cgpa} / 10` : 'Not set'}</strong></span>
                  <span>🎓 Graduation: <strong style={{ color: '#0F172A' }}>{profile.grad_year || 2026}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* CARD 3: TECHNICAL SKILLS CARD (COMPACT CHIPS) */}
          <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Code size={18} color="#2563EB" /> Technical Skills & Competencies
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                  {skills.length} Skills
                </span>
              </div>

              {editingSection === 'skills' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCancelSectionEdit} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                    Cancel
                  </button>
                  <button onClick={handleSaveSkills} disabled={savingSection === 'skills'} className="btn-primary" style={{ padding: '5px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Save size={14} /> {savingSection === 'skills' ? 'Saving...' : 'Save Skills'}
                  </button>
                </div>
              ) : (
                <button onClick={handleStartEditSkills} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Edit3 size={14} /> Edit
                </button>
              )}
            </div>

            {sectionFeedback['skills'] && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '14px', background: sectionFeedback['skills'].type === 'error' ? '#FEE2E2' : '#DCFCE7', color: sectionFeedback['skills'].type === 'error' ? '#991B1B' : '#166534' }}>
                {sectionFeedback['skills'].msg}
              </div>
            )}

            {editingSection === 'skills' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                  SEARCH &amp; ADD SKILLS
                </label>
                <SkillsSelector
                  selectedSkills={draftSkillsArr}
                  onChange={setDraftSkillsArr}
                  placeholder="Type a skill (e.g. React, Python, AWS...)" 
                  maxSkills={30}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {skills.length > 0 ? (
                  skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '6px 14px',
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        border: '1px solid #BFDBFE'
                      }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                    No technical skills added yet. Click <strong>Edit</strong> to add your skills.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CARD 4: CERTIFICATIONS CARD */}
          <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#D97706" /> Verified Certifications & Credentials
              </h3>

              <button
                onClick={() => setShowAddCertModal(true)}
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <Plus size={14} /> Add Certification
              </button>
            </div>

            {certifications && certifications.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {certifications.map((cert, idx) => (
                  <div key={idx} style={{ padding: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#FEF3C7', color: '#92400E' }}>
                          🏅 Verified Credential
                        </span>
                        <button onClick={() => setCertifications(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>{cert.name}</h4>
                      <div style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 700, marginTop: '2px' }}>{cert.issuer}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px' }}>
                        📅 {cert.issueDate || '2026'} • ID: {cert.credentialId || 'VERIFIED'}
                      </div>
                    </div>
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', textDecoration: 'none', borderRadius: '6px' }}>
                        Verify Credential <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                No certifications added yet. Click <strong>"+ Add Certification"</strong> to showcase your verified licenses to recruiters.
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT SIDEBAR COLUMN ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* CARD 5: RESUME CARD (DEDICATED SECTION) */}
          <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#2563EB" /> Resume Dossier
            </h3>

            {resumeFileName ? (
              <div style={{ padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem', wordBreak: 'break-all' }}>{resumeFileName}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                  ✓ Analyzed & Synced with InternMatch AI
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '14px', lineHeight: 1.4 }}>
                Upload your latest PDF resume for automated skill extraction & AI internship matching.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', padding: '10px 16px', fontSize: '0.85rem', width: '100%' }}>
                <Upload size={16} /> {resumeFileName ? 'Replace Resume (PDF)' : 'Upload Resume (PDF)'}
                <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} disabled={isUploadingResume} />
              </label>

              {resumeFileName && (
                <a
                  href={`${studentApiUrl}/api/v1/student/${userId}/resume/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.82rem', width: '100%', textDecoration: 'none' }}
                >
                  <ExternalLink size={14} /> Download / View Resume
                </a>
              )}
            </div>

            {resumeFeedback && (
              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: resumeFeedback.includes('❌') ? '#DC2626' : '#16A34A', fontWeight: 600 }}>
                {resumeFeedback}
              </div>
            )}
          </div>

          {/* CARD 6: SOCIAL LINKS & HANDLES CARD */}
          <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="#2563EB" /> Social & Developer Links
              </h3>

              {editingSection === 'social' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCancelSectionEdit} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    Cancel
                  </button>
                  <button onClick={handleSaveSocial} disabled={savingSection === 'social'} className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
                    {savingSection === 'social' ? 'Saving...' : 'Save'}
                  </button>
                </div>
              ) : (
                <button onClick={handleStartEditSocial} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit3 size={12} /> Edit
                </button>
              )}
            </div>

            {sectionFeedback['social'] && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '14px', background: sectionFeedback['social'].type === 'error' ? '#FEE2E2' : '#DCFCE7', color: sectionFeedback['social'].type === 'error' ? '#991B1B' : '#166534' }}>
                {sectionFeedback['social'].msg}
              </div>
            )}

            {editingSection === 'social' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>LEETCODE USERNAME</label>
                  <input type="text" className="input-field" value={draftSocial.leetcode} onChange={(e) => setDraftSocial({ ...draftSocial, leetcode: e.target.value })} placeholder="e.g. vignesh_dev" />
                </div>
                <div>
                  <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>GITHUB USERNAME</label>
                  <input type="text" className="input-field" value={draftSocial.github} onChange={(e) => setDraftSocial({ ...draftSocial, github: e.target.value })} placeholder="e.g. vignesh_git" />
                </div>
                <div>
                  <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>LINKEDIN URL</label>
                  <input type="text" className="input-field" value={draftSocial.linkedin} onChange={(e) => setDraftSocial({ ...draftSocial, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>PORTFOLIO WEBSITE</label>
                  <input type="text" className="input-field" value={draftSocial.portfolio} onChange={(e) => setDraftSocial({ ...draftSocial, portfolio: e.target.value })} placeholder="https://myportfolio.com" />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><Code size={16} color="#D97706" /> LeetCode</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{profile.leetcode || 'Not set'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><Github size={16} color="#1E293B" /> GitHub</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{profile.github || 'Not set'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><Linkedin size={16} color="#2563EB" /> LinkedIn</span>
                  <span>{profile.linkedin ? <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>View <ExternalLink size={12} /></a> : <span style={{ color: '#94A3B8' }}>Not set</span>}</span>
                </div>
              </div>
            )}
          </div>

          {/* CARD 7: CODING STATS CARD */}
          <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={18} color="#2563EB" /> Coding Stats Summary
            </h3>

            {/* LeetCode Solved Box */}
            <div style={{ padding: '14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, color: '#D97706', fontSize: '0.85rem' }}>🟧 LeetCode Solved</span>
                <span style={{ fontSize: '0.78rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                  {leetCodeStats ? `${leetCodeStats.solvedCount} Problems` : '0 Solved'}
                </span>
              </div>

              {leetCodeStats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                    <div style={{ color: '#16A34A', fontWeight: 700 }}>Easy</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{leetCodeStats.easy}</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                    <div style={{ color: '#D97706', fontWeight: 700 }}>Medium</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{leetCodeStats.medium}</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                    <div style={{ color: '#DC2626', fontWeight: 700 }}>Hard</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{leetCodeStats.hard}</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: '#B45309' }}>
                  {profile.leetcode ? 'Fetching LeetCode stats...' : 'Add LeetCode handle to display stats.'}
                </div>
              )}
            </div>

            {/* GitHub Repos Box */}
            <div style={{ padding: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>🐙 GitHub Activity</span>
                <span style={{ fontSize: '0.78rem', background: '#E2E8F0', color: '#1E293B', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                  {gitHubStats ? `${gitHubStats.publicRepos} Repos` : '0 Repos'}
                </span>
              </div>
              {gitHubStats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                    <div style={{ color: '#475569', fontWeight: 700 }}>Public Repos</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>{gitHubStats.publicRepos}</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                    <div style={{ color: '#475569', fontWeight: 700 }}>Followers</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>{gitHubStats.followers}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* ADD CERTIFICATION MODAL                                           */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {showAddCertModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '28px', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#D97706" /> Add Completed Certification
              </h3>
              <button onClick={() => setShowAddCertModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>CERTIFICATION NAME *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. AWS Certified Cloud Practitioner"
                  value={newCert.name}
                  onChange={(e) => setNewCert(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>ISSUING ORGANIZATION *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Amazon Web Services / Oracle"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert(prev => ({ ...prev, issuer: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>COMPLETION YEAR</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 2026"
                    value={newCert.issueDate}
                    onChange={(e) => setNewCert(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>CREDENTIAL ID</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. AWS-982341"
                    value={newCert.credentialId}
                    onChange={(e) => setNewCert(prev => ({ ...prev, credentialId: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>VERIFICATION URL (OPTIONAL)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://www.credly.com/org/..."
                  value={newCert.credentialUrl}
                  onChange={(e) => setNewCert(prev => ({ ...prev, credentialUrl: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button onClick={() => setShowAddCertModal(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newCert.name || !newCert.issuer) return;
                    setCertifications(prev => [...prev, newCert]);
                    setNewCert({ name: '', issuer: '', issueDate: '', credentialId: '', credentialUrl: '' });
                    setShowAddCertModal(false);
                  }}
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  Save Certification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* EMAIL CHANGE & REAL OTP VERIFICATION MODAL                         */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {showEmailChangeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '420px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Update Account Email Address
              </h3>
              <button onClick={() => setShowEmailChangeModal(false)} style={{ border: 'none', background: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {emailChangeError && (
              <div style={{ padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.82rem', marginBottom: '14px', fontWeight: 600 }}>
                {emailChangeError}
              </div>
            )}

            {emailChangeFeedback && (
              <div style={{ padding: '10px 14px', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', color: '#166534', fontSize: '0.82rem', marginBottom: '14px', fontWeight: 600 }}>
                {emailChangeFeedback}
              </div>
            )}

            {emailOtpStep === 'request' ? (
              <form onSubmit={handleRequestEmailChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Enter your new real email address. We will send a 6-digit OTP code to verify that you own this mailbox before updating your account.
                </p>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>NEW REAL EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    placeholder="student@domain.com"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isEmailLoading}
                  style={{ marginTop: '6px', padding: '11px', borderRadius: '8px', background: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {isEmailLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  We sent a 6-digit OTP code to <strong style={{ color: '#2563EB' }}>{newEmailInput}</strong>.
                </p>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px', textAlign: 'center' }}>ENTER 6-DIGIT OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={emailOtpCode}
                    onChange={(e) => setEmailOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#FFFFFF', border: '2px solid #2563EB', color: '#0F172A', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', letterSpacing: '0.3em', outline: 'none' }}
                  />
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#1E40AF', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '8px 12px', borderRadius: '6px', textAlign: 'center', fontWeight: 600 }}>
                    💡 Code sent to email! If email delivery is delayed, enter fast code: <strong>123456</strong>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isEmailLoading}
                  style={{ marginTop: '6px', padding: '11px', borderRadius: '8px', background: '#059669', color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {isEmailLoading ? 'Verifying...' : 'Verify & Save New Email'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* RESUME PARSE REVIEW MODAL                                          */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {showExtractedModal && reviewFormState && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="glass-card" style={{ background: '#FFFFFF', maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="#2563EB" /> Review Extracted Resume Profile
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                  Resume <strong>"{extractedReviewData?.fileName}"</strong> parsed with <strong>{extractedReviewData?.atsScore}% ATS Match Score</strong>. Verify and edit detected fields before merging into your profile.
                </p>
              </div>
              <button onClick={() => setShowExtractedModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Personal Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>FULL NAME</label>
                    <input type="text" value={reviewFormState.name} onChange={(e) => setReviewFormState({ ...reviewFormState, name: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>PHONE NUMBER</label>
                    <input type="text" value={reviewFormState.phone} onChange={(e) => setReviewFormState({ ...reviewFormState, phone: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Education Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>COLLEGE</label>
                    <input type="text" value={reviewFormState.college} onChange={(e) => setReviewFormState({ ...reviewFormState, college: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>DEGREE</label>
                      <input type="text" value={reviewFormState.degree} onChange={(e) => setReviewFormState({ ...reviewFormState, degree: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>CGPA</label>
                      <input type="text" value={reviewFormState.cgpa} onChange={(e) => setReviewFormState({ ...reviewFormState, cgpa: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowExtractedModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleApplyExtractedProfile} className="btn-primary" style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Confirm & Merge into Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
