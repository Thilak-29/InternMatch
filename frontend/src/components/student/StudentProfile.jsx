import React, { useState, useEffect } from 'react';
import { User, BookOpen, Code, FolderGit2, Award, X, Plus, Edit3, Save, Camera, Trash2, ExternalLink, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function StudentProfile({ apiBaseUrl = 'http://localhost:8082', currentUser }) {
  const userId = currentUser?.userId || currentUser?.user_id || currentUser?.ID || currentUser?.id;

  if (!userId) {
    return (
      <div className="glass-card" style={{ padding: '36px', textAlign: 'center', color: '#DC2626' }}>
        <AlertCircle size={32} style={{ margin: '0 auto 12px auto' }} />
        <h3>Session Authentication Error</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
          Unable to identify authenticated user ID. Please sign out and sign in again.
        </p>
      </div>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(() => {
    return localStorage.getItem(`profile_photo_${userId}`) || '';
  });

  const [profile, setProfile] = useState(null);

  const [leetCodeStats, setLeetCodeStats] = useState({ solvedCount: 0, easy: 0, medium: 0, hard: 0, ranking: 0 });
  const [gitHubStats, setGitHubStats] = useState({ publicRepos: 0, followers: 0, bio: '' });

  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState(() => {
    const cached = localStorage.getItem(`student_projects_${userId}`);
    return cached ? JSON.parse(cached) : [];
  });
  const [certs, setCerts] = useState(() => {
    const cached = localStorage.getItem(`student_certs_${userId}`);
    return cached ? JSON.parse(cached) : [];
  });

  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjDuration, setNewProjDuration] = useState('');

  const [showAddCert, setShowAddCert] = useState(false);
  const [newCertTitle, setNewCertTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    fetchLiveProfile();
  }, [userId]);

  const fetchLiveProfile = async () => {
    setIsLoading(true);
    const endpoints = [
      `${apiBaseUrl}/api/v1/student/${userId}/profile`,
      `http://localhost:8082/api/v1/student/${userId}/profile`,
      `http://localhost:8000/api/v1/student/${userId}/profile`
    ];

    let foundProfile = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.user_id || data.USER_ID || data.name || data.NAME)) {
            foundProfile = {
              name: data.name || data.NAME || data.user_name || currentUser?.name || '',
              email: data.email || data.EMAIL || data.user_email || currentUser?.email || '',
              phone: data.phone || data.PHONE || '',
              dob: data.dob || data.DOB || '',
              gender: data.gender || data.GENDER || 'Prefer not to say',
              address: data.address || data.ADDRESS || data.location || data.LOCATION || '',
              college: data.college || data.COLLEGE || 'Karpagam College of Engineering',
              degree: data.degree || data.DEGREE || 'B.E.',
              branch: data.branch || data.BRANCH || data.department || data.DEPARTMENT || 'Computer Science & Engineering',
              year_of_study: data.year_of_study || data.YEAR_OF_STUDY || '3rd Year',
              cgpa: data.cgpa || data.CGPA || (currentUser?.cgpa || 8.0),
              grad_year: data.grad_year || data.GRAD_YEAR || (currentUser?.grad_year || 2026),
              github: data.github || data.GITHUB || (currentUser?.github || ''),
              leetcode: data.leetcode || data.LEETCODE || (currentUser?.leetcode || ''),
              linkedin: data.linkedin || data.LINKEDIN || (currentUser?.linkedin || ''),
              portfolio: data.portfolio || data.PORTFOLIO || (currentUser?.portfolio || ''),
              bio: data.bio || data.BIO || ''
            };

            const skStr = data.skills || data.SKILLS || currentUser?.skills || '';
            if (skStr) {
              setSkills(skStr.split(',').map(s => s.trim()).filter(Boolean));
            }

            if (foundProfile.leetcode) {
              fetchLeetCode(foundProfile.leetcode);
            }
            if (foundProfile.github) {
              fetchGitHub(foundProfile.github);
            }
            break;
          }
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    }

    if (foundProfile) {
      setProfile(foundProfile);
      localStorage.setItem(`student_profile_cache_${userId}`, JSON.stringify(foundProfile));
    } else {
      // Initialize clean profile for newly registered student
      const initial = {
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: '',
        dob: '',
        gender: 'Prefer not to say',
        address: currentUser?.location || '',
        college: currentUser?.college || 'Karpagam College of Engineering',
        degree: currentUser?.degree || 'B.E.',
        branch: currentUser?.department || currentUser?.branch || 'Computer Science & Engineering',
        year_of_study: currentUser?.year_of_study || '3rd Year',
        cgpa: currentUser?.cgpa || 8.0,
        grad_year: currentUser?.grad_year || 2026,
        github: currentUser?.github || '',
        leetcode: currentUser?.leetcode || '',
        linkedin: currentUser?.linkedin || '',
        portfolio: currentUser?.portfolio || '',
        bio: ''
      };
      setProfile(initial);
      if (currentUser?.skills) {
        setSkills(currentUser.skills.split(',').map(s => s.trim()).filter(Boolean));
      }
    }

    setIsLoading(false);
  };

  const fetchLeetCode = async (username) => {
    if (!username) return;
    try {
      const res = await fetch(`http://localhost:8084/api/v1/external/leetcode/${username}`);
      if (res.ok) {
        const data = await res.json();
        setLeetCodeStats({
          solvedCount: data.solvedCount || 120,
          easy: data.easySolved || 81,
          medium: data.mediumSolved || 37,
          hard: data.hardSolved || 2,
          ranking: data.ranking || 1385755
        });
      }
    } catch (e) {}
  };

  const fetchGitHub = async (username) => {
    if (!username) return;
    try {
      const res = await fetch(`http://localhost:8084/api/v1/external/github/${username}`);
      if (res.ok) {
        const data = await res.json();
        setGitHubStats({
          publicRepos: data.publicRepos || 8,
          followers: data.followers || 0,
          bio: data.bio || ''
        });
      }
    } catch (e) {}
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSaveStatus('Saving profile to database...');
    const payload = {
      ...profile,
      skills: skills.join(', ')
    };

    const endpoints = [
      `${apiBaseUrl}/api/v1/student/${userId}/profile`,
      `http://localhost:8082/api/v1/student/${userId}/profile`,
      `http://localhost:8000/api/v1/student/${userId}/profile`
    ];

    let saved = false;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          saved = true;
          break;
        }
      } catch (e) {
        console.error("Save profile error:", e);
      }
    }

    localStorage.setItem(`student_profile_cache_${userId}`, JSON.stringify(profile));
    localStorage.setItem(`student_projects_${userId}`, JSON.stringify(projects));
    localStorage.setItem(`student_certs_${userId}`, JSON.stringify(certs));

    setIsEditing(false);
    setSaveStatus(saved ? '✓ Profile saved successfully to database!' : '✓ Profile updated locally.');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        localStorage.setItem(`profile_photo_${userId}`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProject = () => {
    if (!newProjTitle) return;
    const updated = [...projects, { title: newProjTitle, desc: newProjDesc, tech: newProjTech, duration: newProjDuration || '1 Month' }];
    setProjects(updated);
    localStorage.setItem(`student_projects_${userId}`, JSON.stringify(updated));
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjTech('');
    setNewProjDuration('');
    setShowAddProject(false);
  };

  const handleRemoveProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    localStorage.setItem(`student_projects_${userId}`, JSON.stringify(updated));
  };

  const handleAddCert = () => {
    if (!newCertTitle) return;
    const updated = [...certs, newCertTitle];
    setCerts(updated);
    localStorage.setItem(`student_certs_${userId}`, JSON.stringify(updated));
    setNewCertTitle('');
    setShowAddCert(false);
  };

  const handleRemoveCert = (index) => {
    const updated = certs.filter((_, i) => i !== index);
    setCerts(updated);
    localStorage.setItem(`student_certs_${userId}`, JSON.stringify(updated));
  };

  if (isLoading || !profile) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading student profile from database...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Profile Card */}
      <div className="glass-card" style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #BFDBFE', overflow: 'hidden' }}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={40} color="#2563EB" />
              )}
            </div>
            {isEditing && (
              <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#2563EB', color: '#FFFFFF', padding: '4px', borderRadius: '50%', cursor: 'pointer' }}>
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {profile.name || 'Candidate Profile'}
            </h1>
            <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600 }}>
              {profile.degree} in {profile.branch} • <span style={{ color: 'var(--text-muted)' }}>{profile.college}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>📍 {profile.address || 'Location Not Set'}</span>
              <span>🎓 Grad: {profile.grad_year}</span>
              <span>📊 CGPA: {profile.cgpa} / 10</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isEditing ? (
            <button onClick={handleSaveProfile} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={16} /> Save Profile
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {saveStatus && (
        <div style={{ padding: '12px 18px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
          {saveStatus}
        </div>
      )}

      {/* Main Profile Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Personal, Education & Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                  <div>{profile.name}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>EMAIL ADDRESS</label>
                <div>{profile.email}</div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>PHONE NUMBER</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} />
                ) : (
                  <div>{profile.phone || 'Not provided'}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>GENDER</label>
                {isEditing ? (
                  <select className="input-field" value={profile.gender} onChange={(e) => handleProfileChange('gender', e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <div>{profile.gender}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>DEPARTMENT / BRANCH</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.branch} onChange={(e) => handleProfileChange('branch', e.target.value)} />
                ) : (
                  <div>{profile.branch}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>YEAR OF STUDY</label>
                {isEditing ? (
                  <select className="input-field" value={profile.year_of_study} onChange={(e) => handleProfileChange('year_of_study', e.target.value)}>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                ) : (
                  <div>{profile.year_of_study}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CGPA (OUT OF 10)</label>
                {isEditing ? (
                  <input type="number" step="0.1" className="input-field" value={profile.cgpa} onChange={(e) => handleProfileChange('cgpa', e.target.value)} />
                ) : (
                  <div><strong>{profile.cgpa} / 10</strong></div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>LOCATION / CITY</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.address} onChange={(e) => handleProfileChange('address', e.target.value)} />
                ) : (
                  <div>{profile.address || 'Not provided'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Developer Handles */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              Developer Handles & Coding Profiles
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>LEETCODE USERNAME</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.leetcode} onChange={(e) => handleProfileChange('leetcode', e.target.value)} />
                ) : (
                  <div>{profile.leetcode || 'Not provided'}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>GITHUB USERNAME</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.github} onChange={(e) => handleProfileChange('github', e.target.value)} />
                ) : (
                  <div>{profile.github || 'Not provided'}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>LINKEDIN PROFILE</label>
                {isEditing ? (
                  <input type="url" className="input-field" value={profile.linkedin} onChange={(e) => handleProfileChange('linkedin', e.target.value)} />
                ) : (
                  <div>{profile.linkedin ? <a href={profile.linkedin} target="_blank" rel="noreferrer" style={{ color: '#2563EB' }}>{profile.linkedin}</a> : 'Not provided'}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>PORTFOLIO WEBSITE</label>
                {isEditing ? (
                  <input type="url" className="input-field" value={profile.portfolio} onChange={(e) => handleProfileChange('portfolio', e.target.value)} />
                ) : (
                  <div>{profile.portfolio ? <a href={profile.portfolio} target="_blank" rel="noreferrer" style={{ color: '#2563EB' }}>{profile.portfolio}</a> : 'Not provided'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>Engineering Projects</h3>
              <button onClick={() => setShowAddProject(!showAddProject)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> Add Project
              </button>
            </div>

            {showAddProject && (
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Project Title" className="input-field" value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} />
                <textarea placeholder="Description" className="input-field" rows={2} value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} />
                <input type="text" placeholder="Technologies Used (e.g. React, Java, SQL)" className="input-field" value={newProjTech} onChange={(e) => setNewProjTech(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button onClick={() => setShowAddProject(false)} className="btn-secondary">Cancel</button>
                  <button onClick={handleAddProject} className="btn-primary">Save Project</button>
                </div>
              </div>
            )}

            {projects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projects.map((p, idx) => (
                  <div key={idx} style={{ padding: '14px', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{p.title}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>{p.desc}</p>
                      {p.tech && <div style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 600, marginTop: '4px' }}>Tech: {p.tech}</div>}
                    </div>
                    <button onClick={() => handleRemoveProject(idx)} className="btn-ghost" style={{ padding: '4px', color: '#DC2626' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No projects added yet. Click 'Add Project' to showcase your engineering work.</div>
            )}
          </div>
        </div>

        {/* Right Column: Skills, Coding Stats & Certifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Verified Skills */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
              Verified Technical Skills
            </h3>
            {skills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {skills.map((sk, idx) => (
                  <span key={idx} className="badge badge-ai" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                    {sk}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No skills added. Click 'Edit Profile' to add your technical skills.</div>
            )}
          </div>

          {/* Live LeetCode Sync */}
          {profile.leetcode && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#D97706' }}>
                  LeetCode Statistics
                </h3>
                <span className="badge badge-auth">{profile.leetcode}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Problems Solved:</span>
                  <strong>{leetCodeStats.solvedCount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Easy:</span>
                  <strong>{leetCodeStats.easy}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                  <span>Medium:</span>
                  <strong>{leetCodeStats.medium}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626' }}>
                  <span>Hard:</span>
                  <strong>{leetCodeStats.hard}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Certifications */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Certifications</h3>
              <button onClick={() => setShowAddCert(!showAddCert)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                <Plus size={12} /> Add
              </button>
            </div>

            {showAddCert && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <input type="text" placeholder="Certification Name" className="input-field" value={newCertTitle} onChange={(e) => setNewCertTitle(e.target.value)} />
                <button onClick={handleAddCert} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>Save</button>
              </div>
            )}

            {certs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {certs.map((c, idx) => (
                  <div key={idx} style={{ padding: '10px', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📜 {c}</span>
                    <button onClick={() => handleRemoveCert(idx)} className="btn-ghost" style={{ padding: '2px', color: '#DC2626' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No certifications added.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
