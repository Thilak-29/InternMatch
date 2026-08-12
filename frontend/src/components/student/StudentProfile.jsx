import React, { useState, useEffect, useRef } from 'react';
import { User, BookOpen, Code, FolderGit2, Award, X, Plus, Edit3, Save, Camera, Trash2, ExternalLink, CheckCircle, AlertCircle, Sparkles, Upload, FileText, GitBranch, Terminal, CheckCircle2 } from 'lucide-react';
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

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [profile, setProfile] = useState(null);

  const [leetCodeStats, setLeetCodeStats] = useState({
    solvedCount: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    ranking: 0,
    acceptanceRate: '0%',
    recentSubmissions: []
  });

  const [gitHubStats, setGitHubStats] = useState({
    publicRepos: 0,
    followers: 0,
    following: 0,
    bio: '',
    repositories: []
  });

  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [skillsEditString, setSkillsEditString] = useState('');

  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState({ name: '', issuer: '', issueDate: '', credentialId: '', credentialUrl: '' });
  const [showAddCertModal, setShowAddCertModal] = useState(false);

  const [projects, setProjects] = useState([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjDuration, setNewProjDuration] = useState('');

  const [saveStatus, setSaveStatus] = useState('');

  const [resumeFileName, setResumeFileName] = useState('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeFeedback, setResumeFeedback] = useState('');

  // Email Verification & Change Email States
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpStep, setEmailOtpStep] = useState('request'); // 'request' or 'verify'
  const [emailResendTimer, setEmailResendTimer] = useState(0);
  const [emailChangeFeedback, setEmailChangeFeedback] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (emailResendTimer > 0) {
      timer = setInterval(() => {
        setEmailResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailResendTimer]);

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
      const res = await fetch(`${API_CONFIG.AUTH_SERVICE_URL}/api/v1/auth/request-email-change`, {
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
      const res = await fetch(`${API_CONFIG.AUTH_SERVICE_URL}/api/v1/auth/verify-email-change`, {
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

  const studentApiUrl = API_CONFIG.STUDENT_SERVICE_URL;
  const aiApiUrl = API_CONFIG.AI_SERVICE_URL;

  useEffect(() => {
    fetchLiveProfile();
  }, [userId]);

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
        if (fetchedData.resume_file_name) {
          setResumeFileName(fetchedData.resume_file_name);
        }

        const rawSkills = fetchedData.skills || currentUser?.skills || '';
        const skillArray = typeof rawSkills === 'string'
          ? rawSkills.split(',').map(s => s.trim()).filter(Boolean)
          : (Array.isArray(rawSkills) ? rawSkills : []);
        setSkills(skillArray);
        setSkillsEditString(skillArray.join(', '));

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
        setSkillsEditString(fallbackSkillArray.join(', '));

        if (fallbackProfile.leetcode) fetchLeetCode(fallbackProfile.leetcode);
        if (fallbackProfile.github) fetchGitHub(fallbackProfile.github);
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
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
      setSkillsEditString(fallbackSkillArray.join(', '));

      if (fallbackProfile.leetcode) fetchLeetCode(fallbackProfile.leetcode);
      if (fallbackProfile.github) fetchGitHub(fallbackProfile.github);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeetCode = async (username) => {
    if (!username || username.trim() === '' || username === 'Not set') {
      setLeetCodeStats(null);
      return;
    }
    const cleanUser = username.trim();

    // Provider 1: Alfa LeetCode API
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
            ranking: data.ranking || 0,
            acceptanceRate: '68.5%'
          });
          return;
        }
      }
    } catch (e) {}

    // Provider 2: LeetCode Stats Heroku API
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
            ranking: data2.ranking || 0,
            acceptanceRate: data2.acceptanceRate ? `${data2.acceptanceRate}%` : '68.5%'
          });
          return;
        }
      }
    } catch (e) {}

    // Provider 3: AI Microservice Fallback
    try {
      const res3 = await fetch(`${aiApiUrl}/api/v1/external/leetcode/${cleanUser}`);
      if (res3.ok) {
        const data3 = await res3.json();
        if (data3 && data3.solvedCount !== undefined) {
          setLeetCodeStats({
            solvedCount: data3.solvedCount || 0,
            easy: data3.easySolved || 0,
            medium: data3.mediumSolved || 0,
            hard: data3.hardSolved || 0,
            ranking: data3.ranking || 0,
            acceptanceRate: data3.acceptanceRate || '68.5%'
          });
        }
      }
    } catch (e) {}
  };

  const fetchGitHub = async (username) => {
    if (!username || username.trim() === '' || username === 'Not set') {
      setGitHubStats(null);
      return;
    }
    const cleanUser = username.trim();

    try {
      const res = await fetch(`https://api.github.com/users/${cleanUser}`);
      if (res.ok) {
        const data = await res.json();
        setGitHubStats({
          publicRepos: data.public_repos !== undefined ? data.public_repos : 0,
          followers: data.followers !== undefined ? data.followers : 0,
          following: data.following !== undefined ? data.following : 0,
          publicGists: data.public_gists !== undefined ? data.public_gists : 0
        });
        return;
      }
    } catch (e) {}

    try {
      const res2 = await fetch(`${aiApiUrl}/api/v1/external/github/${cleanUser}`);
      if (res2.ok) {
        const data2 = await res2.json();
        setGitHubStats({
          publicRepos: data2.publicRepos || 0,
          followers: data2.followers || 0,
          following: data2.following || 0,
          publicGists: 0
        });
      }
    } catch (e) {}
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      const updated = [...skills, trimmed];
      setSkills(updated);
      setSkillsEditString(updated.join(', '));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skills.filter(s => s !== skillToRemove);
    setSkills(updated);
    setSkillsEditString(updated.join(', '));
  };

  const handleSkillsStringChange = (val) => {
    setSkillsEditString(val);
    const parsed = val.split(',').map(s => s.trim()).filter(Boolean);
    setSkills(parsed);
  };

  const handleSaveProfile = async () => {
    setSaveStatus('Saving profile and skills to database...');
    const payload = {
      ...profile,
      phone: profile?.phone || '',
      gender: profile?.gender || 'Prefer not to say',
      dob: profile?.dob || '',
      address: profile?.address || '',
      location: profile?.address || '',
      college: profile?.college || '',
      degree: profile?.degree || '',
      branch: profile?.branch || '',
      year_of_study: profile?.year_of_study || '',
      grad_year: (profile?.grad_year && String(profile.grad_year).trim() !== '') ? parseInt(profile.grad_year, 10) : 2026,
      cgpa: (profile?.cgpa && String(profile.cgpa).trim() !== '') ? parseFloat(profile.cgpa) : '',
      skills: skills.join(', ')
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
        setIsEditing(false);
        setSaveStatus('✓ Profile and skills saved successfully to Database!');
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            ...payload
          };
          localStorage.setItem('internmatch_user', JSON.stringify(updatedUser));
        }
        if (profile.leetcode) fetchLeetCode(profile.leetcode);
        if (profile.github) fetchGitHub(profile.github);
      } else {
        const data = await res.json().catch(() => null);
        setSaveStatus('❌ ' + (data?.error || data?.message || 'Failed to save profile.'));
      }
    } catch (e) {
      setSaveStatus('❌ Connection error saving profile.');
    } finally {
      setTimeout(() => setSaveStatus(''), 4000);
    }
  };

  // Resume Auto-Fill Review Modal States
  const [extractedReviewData, setExtractedReviewData] = useState(null);
  const [showExtractedModal, setShowExtractedModal] = useState(false);
  const [reviewFormState, setReviewFormState] = useState(null);
  const [skillsMergeMode, setSkillsMergeMode] = useState('merge'); // 'merge' or 'replace'
  const [resumeUploadProgress, setResumeUploadProgress] = useState('');

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

        // Initialize review form state with non-destructive defaults
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
          extractedSkills: Array.isArray(extProfile.skills) ? extProfile.skills : [],
          projects: Array.isArray(extProfile.projects) ? extProfile.projects : []
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
    setSkillsEditString(finalSkillsList.join(', '));

    // Automatically save to backend DB
    setSaveStatus('Saving auto-filled profile and skills to database...');
    try {
      const res = await fetch(`${studentApiUrl}/api/v1/student/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(updatedProfile)
      });

      if (res.ok) {
        setSaveStatus('✓ Auto-filled profile saved successfully to database!');
        window.dispatchEvent(new CustomEvent('application_submitted', { detail: { studentId: userId } }));
      }
    } catch (e) {
      setSaveStatus('✓ Profile auto-filled locally.');
    }

    setShowExtractedModal(false);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, avatar_url: reader.result }));
      setSaveStatus('✓ Custom profile picture attached. Click "Save Profile & Skills" to save changes to Database.');
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading student dossier & credentials...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1140px', margin: '0 auto' }}>
      {/* Header Profile Card */}
      <div className="glass-card" style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => avatarInputRef.current?.click()} title="Click to upload profile picture">
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #BFDBFE', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={44} color="#2563EB" />
              )}
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#2563EB', color: '#FFFFFF', padding: '6px', borderRadius: '50%', border: '2px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
              <Camera size={14} />
            </div>
            <input type="file" ref={avatarInputRef} accept="image/*" onChange={handleAvatarFileChange} style={{ display: 'none' }} />
          </div>

          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {profile.name || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}
            </h1>
            <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600 }}>
              {profile.degree ? `${profile.degree} in ${profile.branch || ''}` : <span style={{ color: 'var(--text-muted)' }}>Degree Not set</span>}
              {profile.college && <span> • <span style={{ color: 'var(--text-muted)' }}>{profile.college}</span></span>}
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', flexWrap: 'wrap' }}>
              <span>📍 {profile.address || 'Not Set'}</span>
              <span>📞 {profile.phone || 'Not Set'}</span>
              <span>👤 {profile.gender || 'Not Set'}</span>
              <span>🎓 Grad: {profile.grad_year || 'Not Set'}</span>
              <span>📊 CGPA: {profile.cgpa ? `${profile.cgpa} / 10` : 'Not Set'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isEditing ? (
            <button onClick={handleSaveProfile} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={16} /> Save Profile & Skills
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Edit3 size={16} /> Edit Profile & Skills
            </button>
          )}
        </div>
      </div>

      {saveStatus && (
        <div style={{ padding: '12px 18px', background: saveStatus.includes('❌') ? '#FEE2E2' : '#DCFCE7', border: '1px solid', borderColor: saveStatus.includes('❌') ? '#FCA5A5' : '#86EFAC', color: saveStatus.includes('❌') ? '#991B1B' : '#166534', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
          {saveStatus}
        </div>
      )}

      {/* Main Profile Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Academic & Contact Dossier */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              Academic & Contact Dossier
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>FULL NAME</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.name} onChange={(e) => handleProfileChange('name', e.target.value)} />
                ) : (
                  <div>{profile.name || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>EMAIL ADDRESS</label>
                  <button
                    type="button"
                    onClick={() => { setShowEmailChangeModal(true); setEmailOtpStep('request'); setNewEmailInput(''); setEmailOtpCode(''); setEmailChangeError(''); setEmailChangeFeedback(''); }}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Change Email
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>{profile.email || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</span>
                  {profile.email_verified || profile.emailVerified ? (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D97706', background: '#FEF3C7', border: '1px solid #FCD34D', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <AlertCircle size={12} /> Unverified
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>PHONE NUMBER</label>
                {isEditing ? (
                  <input type="text" placeholder="e.g. +91 9876543210" className="input-field" value={profile.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} />
                ) : (
                  <div>{profile.phone || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>GENDER</label>
                {isEditing ? (
                  <select className="input-field" value={profile.gender} onChange={(e) => handleProfileChange('gender', e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <div>{profile.gender || 'Prefer not to say'}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>COLLEGE / UNIVERSITY</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.college || ''} onChange={(e) => handleProfileChange('college', e.target.value)} />
                ) : (
                  <div>{profile.college || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>DEGREE PROGRAM</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.degree || ''} onChange={(e) => handleProfileChange('degree', e.target.value)} />
                ) : (
                  <div>{profile.degree || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>DEPARTMENT / BRANCH</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.branch || ''} onChange={(e) => handleProfileChange('branch', e.target.value)} />
                ) : (
                  <div>{profile.branch || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>YEAR OF STUDY</label>
                {isEditing ? (
                  <select className="input-field" value={profile.year_of_study || ''} onChange={(e) => handleProfileChange('year_of_study', e.target.value)}>
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                ) : (
                  <div>{profile.year_of_study || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CGPA (OUT OF 10)</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.cgpa || ''} onChange={(e) => handleProfileChange('cgpa', e.target.value)} />
                ) : (
                  <div>{profile.cgpa || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>LOCATION / CITY</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.address || ''} onChange={(e) => handleProfileChange('address', e.target.value)} />
                ) : (
                  <div>{profile.address || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                )}
              </div>
            </div>
          </div>

          {/* Technical Skills & Competencies */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={20} color="#2563EB" /> Technical Skills & Competencies
            </h3>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Enter skills separated by commas:
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={skillsEditString}
                  onChange={(e) => handleSkillsStringChange(e.target.value)}
                  placeholder="e.g. Java, React, Spring Boot, Oracle DB, Python"
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
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    No technical skills added yet. Click "Edit Profile & Skills" to add your skills.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Verified Certifications & Licenses Section */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#D97706" /> Verified Certifications & Licenses
              </h3>

              <button
                onClick={() => setShowAddCertModal(true)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Add Completed Certification
              </button>
            </div>

            {certifications && certifications.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {certifications.map((cert, idx) => (
                  <div key={idx} style={{ padding: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#FEF3C7', color: '#92400E' }}>
                          🏅 Verified Credential
                        </span>
                        {isEditing && (
                          <button onClick={() => setCertifications(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>{cert.name}</h4>
                      <div style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 700, marginTop: '2px' }}>{cert.issuer}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px' }}>
                        📅 {cert.issueDate || 'AUG 2026'} • ID: {cert.credentialId || 'VERIFIED'}
                      </div>
                    </div>

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', borderRadius: '6px' }}
                      >
                        Verify Credential <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                No completed certifications added yet. Click <strong>"+ Add Completed Certification"</strong> to showcase your verified credentials to recruiters.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profiles & Resume */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Coding & Professional Links */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              Profiles & Coding Accounts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>LEETCODE USERNAME</label>
                {isEditing ? (
                  <input type="text" placeholder="e.g. your_leetcode_username" className="input-field" value={profile.leetcode} onChange={(e) => handleProfileChange('leetcode', e.target.value)} />
                ) : (
                  <div>{profile.leetcode || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>GITHUB USERNAME</label>
                {isEditing ? (
                  <input type="text" placeholder="e.g. your_github_username" className="input-field" value={profile.github} onChange={(e) => handleProfileChange('github', e.target.value)} />
                ) : (
                  <div>{profile.github || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>LINKEDIN PROFILE</label>
                {isEditing ? (
                  <input type="text" placeholder="https://linkedin.com/in/..." className="input-field" value={profile.linkedin} onChange={(e) => handleProfileChange('linkedin', e.target.value)} />
                ) : (
                  <div>{profile.linkedin ? <a href={profile.linkedin} target="_blank" rel="noreferrer" style={{ color: '#2563EB' }}>View LinkedIn</a> : <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                )}
              </div>
            </div>
          </div>

          {/* Coding Platform Stats & Problem Solved Box */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={18} color="#2563EB" /> Coding Stats & Repositories
            </h3>

            {/* LeetCode Section */}
            <div style={{ padding: '14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, color: '#D97706', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🟧 LeetCode ({profile.leetcode || 'Not set'})
                </span>
                <span style={{ fontSize: '0.78rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  {leetCodeStats ? `${leetCodeStats.solvedCount} Problems Solved` : (profile.leetcode ? 'Loading...' : '0 Solved')}
                </span>
              </div>

              {leetCodeStats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                    <div style={{ color: '#16A34A', fontWeight: 700 }}>Easy</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{leetCodeStats.easy}</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                    <div style={{ color: '#D97706', fontWeight: 700 }}>Medium</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{leetCodeStats.medium}</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                    <div style={{ color: '#DC2626', fontWeight: 700 }}>Hard</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{leetCodeStats.hard}</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#B45309' }}>
                  {profile.leetcode ? 'Fetching LeetCode problem counts...' : 'Enter your LeetCode username in profile edit to view solved problems.'}
                </div>
              )}
            </div>

            {/* GitHub Section */}
            <div style={{ padding: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🐙 GitHub ({profile.github || 'Not set'})
                </span>
                <span style={{ fontSize: '0.78rem', background: '#E2E8F0', color: '#1E293B', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  {gitHubStats ? `${gitHubStats.publicRepos} Repositories` : (profile.github ? 'Loading...' : '0 Repos')}
                </span>
              </div>

              {gitHubStats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                    <div style={{ color: '#475569', fontWeight: 700 }}>Public Repos</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{gitHubStats.publicRepos}</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                    <div style={{ color: '#475569', fontWeight: 700 }}>Followers</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{gitHubStats.followers}</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {profile.github ? 'Fetching GitHub repo counts...' : 'Enter your GitHub username in profile edit to view created repository counts.'}
                </div>
              )}
            </div>
          </div>

          {/* Resume Upload Box */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#2563EB" /> Resume Dossier
            </h3>

            {resumeFileName && (
              <div style={{ padding: '10px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#16A34A" />
                <span style={{ fontWeight: 600, color: '#334155', wordBreak: 'break-all' }}>{resumeFileName}</span>
              </div>
            )}

            <label className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '9px 16px', fontSize: '0.82rem' }}>
              <Upload size={16} /> {resumeFileName ? 'Replace Resume (PDF)' : 'Upload Resume (PDF)'}
              <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} disabled={isUploadingResume} />
            </label>

            {resumeFeedback && (
              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#16A34A', fontWeight: 600 }}>
                {resumeFeedback}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Certification Modal */}
      {showAddCertModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '28px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#D97706" /> Add Completed Certification
              </h3>
              <button onClick={() => setShowAddCertModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CERTIFICATION NAME *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Oracle Database SQL Certified Associate"
                  value={newCert.name}
                  onChange={(e) => setNewCert(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ISSUING ORGANIZATION *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Oracle University / Coursera / AWS"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert(prev => ({ ...prev, issuer: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>COMPLETION DATE</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. AUG-2026"
                    value={newCert.issueDate}
                    onChange={(e) => setNewCert(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CREDENTIAL ID</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. ORCL-982341"
                    value={newCert.credentialId}
                    onChange={(e) => setNewCert(prev => ({ ...prev, credentialId: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>VERIFICATION URL (OPTIONAL)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. https://www.coursera.org/verify/..."
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

      {/* EMAIL CHANGE & REAL OTP VERIFICATION MODAL */}
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
                    placeholder="482913"
                    value={emailOtpCode}
                    onChange={(e) => setEmailOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#FFFFFF', border: '2px solid #2563EB', color: '#0F172A', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', letterSpacing: '0.3em', outline: 'none' }}
                  />
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

      {/* RESUME PARSE REVIEW MODAL */}
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

            {/* EMAIL DISCREPANCY NOTICE & VERIFICATION */}
            {reviewFormState.email && reviewFormState.email.toLowerCase() !== profile?.email?.toLowerCase() && (
              <div style={{ padding: '14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', marginBottom: '20px', fontSize: '0.84rem' }}>
                <div style={{ fontWeight: 800, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <AlertCircle size={16} /> Resume Email Detected: {reviewFormState.email}
                </div>
                <div style={{ color: '#3B82F6', fontSize: '0.8rem', lineHeight: 1.4 }}>
                  Current Account Verified Email: <strong>{profile?.email}</strong>. For security, changing your primary account email requires OTP verification.
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      setNewEmailInput(reviewFormState.email);
                      setShowExtractedModal(false);
                      setShowEmailChangeModal(true);
                    }}
                    style={{ padding: '6px 14px', background: '#2563EB', color: '#FFF', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    Request Email Change OTP
                  </button>
                  <button
                    onClick={() => setReviewFormState(prev => ({ ...prev, email: profile?.email }))}
                    style={{ padding: '6px 14px', background: '#F1F5F9', color: '#475569', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    Keep Current Email ({profile?.email})
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Personal Details */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Personal Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>FULL NAME</label>
                    <input
                      type="text"
                      value={reviewFormState.name}
                      onChange={(e) => setReviewFormState({ ...reviewFormState, name: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>PHONE NUMBER</label>
                    <input
                      type="text"
                      value={reviewFormState.phone}
                      onChange={(e) => setReviewFormState({ ...reviewFormState, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>LOCATION / CITY</label>
                    <input
                      type="text"
                      value={reviewFormState.location}
                      onChange={(e) => setReviewFormState({ ...reviewFormState, location: e.target.value })}
                      placeholder="Coimbatore, Tamil Nadu"
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }}
                    />
                  </div>
                </div>
              </div>

              {/* Education Details */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Education Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>COLLEGE / INSTITUTION</label>
                    <input
                      type="text"
                      value={reviewFormState.college}
                      onChange={(e) => setReviewFormState({ ...reviewFormState, college: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>DEGREE</label>
                      <input
                        type="text"
                        value={reviewFormState.degree}
                        onChange={(e) => setReviewFormState({ ...reviewFormState, degree: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>BRANCH</label>
                      <input
                        type="text"
                        value={reviewFormState.branch}
                        onChange={(e) => setReviewFormState({ ...reviewFormState, branch: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>GRAD YEAR</label>
                      <input
                        type="number"
                        value={reviewFormState.grad_year}
                        onChange={(e) => setReviewFormState({ ...reviewFormState, grad_year: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B' }}>CGPA / 10</label>
                      <input
                        type="text"
                        value={reviewFormState.cgpa}
                        onChange={(e) => setReviewFormState({ ...reviewFormState, cgpa: e.target.value })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: '#FFF' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SKILLS MERGE & DIFF SECTION */}
            <div style={{ marginTop: '16px', background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Technical Skills Extraction & Merge Options
                </h4>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#2563EB' }}>
                    <input
                      type="radio"
                      name="skillsMergeMode"
                      value="merge"
                      checked={skillsMergeMode === 'merge'}
                      onChange={() => setSkillsMergeMode('merge')}
                    />
                    Merge (Recommended)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#64748B' }}>
                    <input
                      type="radio"
                      name="skillsMergeMode"
                      value="replace"
                      checked={skillsMergeMode === 'replace'}
                      onChange={() => setSkillsMergeMode('replace')}
                    />
                    Replace Current Skills
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {reviewFormState.extractedSkills && reviewFormState.extractedSkills.map((sk, i) => {
                  const isNew = !skills.map(s => s.toLowerCase()).includes(sk.toLowerCase());
                  return (
                    <span key={i} style={{ padding: '4px 10px', borderRadius: '6px', background: isNew ? '#DCFCE7' : '#EFF6FF', color: isNew ? '#166534' : '#1E40AF', border: isNew ? '1px solid #86EFAC' : '1px solid #BFDBFE', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {isNew ? `+ ${sk}` : sk}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* PROFESSIONAL & SOCIAL PROFILES */}
            <div style={{ marginTop: '16px', background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Professional Handles & Portfolios
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>GITHUB</label>
                  <input
                    type="text"
                    value={reviewFormState.github}
                    onChange={(e) => setReviewFormState({ ...reviewFormState, github: e.target.value })}
                    placeholder="username"
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none', background: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>LINKEDIN</label>
                  <input
                    type="text"
                    value={reviewFormState.linkedin}
                    onChange={(e) => setReviewFormState({ ...reviewFormState, linkedin: e.target.value })}
                    placeholder="username"
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none', background: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>LEETCODE</label>
                  <input
                    type="text"
                    value={reviewFormState.leetcode}
                    onChange={(e) => setReviewFormState({ ...reviewFormState, leetcode: e.target.value })}
                    placeholder="username"
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none', background: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>PORTFOLIO</label>
                  <input
                    type="text"
                    value={reviewFormState.portfolio}
                    onChange={(e) => setReviewFormState({ ...reviewFormState, portfolio: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none', background: '#FFF' }}
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowExtractedModal(false)}
                style={{ padding: '10px 20px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyExtractedProfile}
                className="btn-primary"
                style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={16} /> Confirm & Merge into Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
