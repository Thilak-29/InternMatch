import React, { useState, useEffect } from 'react';
import { User, BookOpen, Code, FolderGit2, Award, X, Plus, Edit3, Save, Camera, Trash2, ExternalLink } from 'lucide-react';

export default function StudentProfile({ apiBaseUrl = 'http://localhost:8000', currentUser }) {
  const userId = currentUser?.userId || currentUser?.user_id || currentUser?.ID || currentUser?.id || 1;

  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(() => {
    return localStorage.getItem(`profile_photo_${userId}`) || '';
  });

  const [profile, setProfile] = useState(() => {
    const cached = localStorage.getItem(`student_profile_cache_${userId}`);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return {
      name: currentUser?.name || currentUser?.NAME || '',
      email: currentUser?.email || currentUser?.EMAIL || '',
      phone: '',
      dob: '',
      gender: 'Male',
      address: '',
      college: currentUser?.college || currentUser?.COLLEGE || 'Karpagam College of Engineering',
      degree: currentUser?.degree || currentUser?.DEGREE || 'B.E.',
      branch: currentUser?.department || currentUser?.branch || currentUser?.BRANCH || 'Computer Science & Engineering',
      year_of_study: currentUser?.year_of_study || currentUser?.YEAR_OF_STUDY || '3rd Year',
      cgpa: currentUser?.cgpa || currentUser?.CGPA || 8.5,
      grad_year: currentUser?.grad_year || currentUser?.GRAD_YEAR || 2026,
      github: currentUser?.github || currentUser?.GITHUB || 'Thilak-29',
      leetcode: currentUser?.leetcode || currentUser?.LEETCODE || 'Thilak0329',
      linkedin: '',
      portfolio: '',
      codechef: '',
      hackerrank: '',
      bio: ''
    };
  });

  const [leetCodeStats, setLeetCodeStats] = useState({
    total_solved: 185,
    easy_solved: 82,
    medium_solved: 88,
    hard_solved: 15,
    ranking: 45200
  });

  const [gitHubStats, setGitHubStats] = useState({
    public_repos: 14,
    followers: 28,
    repositories: [
      { name: 'InternMatch-AI', description: 'AI-driven candidate screening platform', language: 'Java / React', stars: 12, url: 'https://github.com/Thilak-29/InternMatch' },
      { name: 'Distributed-Oracle-Connector', description: 'Enterprise Spring Boot connection suite', language: 'Java', stars: 8, url: 'https://github.com/Thilak-29' }
    ]
  });

  const [skills, setSkills] = useState(['React', 'Java', 'SQL', 'Python']);
  const [projects, setProjects] = useState(() => {
    const cached = localStorage.getItem(`student_projects_${userId}`);
    return cached ? JSON.parse(cached) : [
      { title: 'InternMatch AI Platform', desc: 'AI-driven candidate screening, LeetCode sync, and proctored technical evaluations.', tech: 'React, Java, Spring Boot, Oracle SQL', duration: '2 Months' }
    ];
  });
  const [certs, setCerts] = useState(() => {
    const cached = localStorage.getItem(`student_certs_${userId}`);
    return cached ? JSON.parse(cached) : ['Oracle Database SQL Certified Associate', 'AWS Certified Cloud Practitioner'];
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
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/student/${userId}/profile`);
      if (res.ok) {
        const data = await res.json();
        const updated = {
          name: data.NAME || data.name || profile.name || currentUser?.name || 'Student Candidate',
          email: data.EMAIL || data.email || profile.email || currentUser?.email || '',
          phone: data.PHONE || data.phone || profile.phone || '',
          dob: data.DOB || data.dob || profile.dob || '',
          gender: data.GENDER || data.gender || profile.gender || 'Male',
          address: data.ADDRESS || data.address || profile.address || '',
          college: data.COLLEGE || data.college || profile.college || 'Karpagam College of Engineering',
          degree: data.DEGREE || data.degree || profile.degree || 'B.E.',
          branch: data.BRANCH || data.branch || profile.branch || 'Computer Science & Engineering',
          year_of_study: data.YEAR_OF_STUDY || data.year_of_study || profile.year_of_study || '3rd Year',
          cgpa: data.CGPA || data.cgpa || profile.cgpa || 8.5,
          grad_year: data.GRAD_YEAR || data.grad_year || profile.grad_year || 2026,
          github: data.GITHUB || data.github || profile.github || 'Thilak-29',
          leetcode: data.LEETCODE || data.leetcode || profile.leetcode || 'Thilak0329',
          linkedin: data.LINKEDIN || data.linkedin || profile.linkedin || '',
          portfolio: data.PORTFOLIO || data.portfolio || profile.portfolio || '',
          bio: data.BIO || data.bio || profile.bio || ''
        };

        setProfile(updated);
        localStorage.setItem(`student_profile_cache_${userId}`, JSON.stringify(updated));

        const rawSkills = data.SKILLS || data.skills;
        if (rawSkills && typeof rawSkills === 'string' && rawSkills.trim().length > 0) {
          setSkills(rawSkills.split(',').map(s => s.trim()).filter(Boolean));
        }

        const lc = updated.leetcode;
        const gh = updated.github;
        if (lc) fetchLeetCode(lc);
        if (gh) fetchGitHub(gh);
      }
    } catch (err) {}
  };

  const fetchLeetCode = async (lcHandle) => {
    if (!lcHandle) return;
    try {
      const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${lcHandle}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.totalSolved !== undefined && data.totalSolved > 0) {
          setLeetCodeStats({
            total_solved: data.totalSolved,
            easy_solved: data.easySolved || 0,
            medium_solved: data.mediumSolved || 0,
            hard_solved: data.hardSolved || 0,
            ranking: data.ranking || 0
          });
          return;
        }
      }
    } catch (e) {}

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/external/leetcode/${lcHandle}`);
      if (res.ok) {
        const data = await res.json();
        setLeetCodeStats(data);
      }
    } catch (e) {}
  };

  const fetchGitHub = async (ghHandle) => {
    if (!ghHandle) return;
    try {
      const userRes = await fetch(`https://api.github.com/users/${ghHandle}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        const repoRes = await fetch(`https://api.github.com/users/${ghHandle}/repos?sort=updated&per_page=6`);
        const reposData = repoRes.ok ? await repoRes.json() : [];
        setGitHubStats({
          public_repos: userData.public_repos || 0,
          followers: userData.followers || 0,
          repositories: Array.isArray(reposData) && reposData.length > 0 ? reposData.map(r => ({
            name: r.name,
            description: r.description || 'Open-source repository',
            language: r.language || 'Code',
            stars: r.stargazers_count || 0,
            url: r.html_url
          })) : [
            { name: 'InternMatch-AI', description: 'AI-driven candidate screening platform', language: 'Java / React', stars: 12, url: `https://github.com/${ghHandle}` }
          ]
        });
        return;
      }
    } catch (e) {}

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/external/github/${ghHandle}`);
      if (res.ok) {
        const data = await res.json();
        setGitHubStats(data);
      }
    } catch (e) {}
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        localStorage.setItem(`profile_photo_${userId}`, reader.result);
        setSaveStatus('Profile photo updated & saved!');
        setTimeout(() => setSaveStatus(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const ALL_SKILLS = [
    'React', 'React Native', 'Redux', 'REST API',
    'Python', 'PyTorch', 'Pandas',
    'Java', 'Spring Boot', 'Microservices', 'Hibernate',
    'SQL', 'Oracle Database', 'MySQL', 'PostgreSQL',
    'Docker', 'Kubernetes', 'AWS', 'Git & GitHub', 'CI/CD Pipelines'
  ];

  const handleToggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;
    const updated = [
      ...projects,
      {
        title: newProjTitle,
        desc: newProjDesc,
        tech: newProjTech,
        duration: newProjDuration || '1 Month'
      }
    ];
    setProjects(updated);
    localStorage.setItem(`student_projects_${userId}`, JSON.stringify(updated));
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjTech('');
    setNewProjDuration('');
    setShowAddProject(false);
    setSaveStatus('Project added successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleDeleteProject = (idx) => {
    const updated = projects.filter((_, i) => i !== idx);
    setProjects(updated);
    localStorage.setItem(`student_projects_${userId}`, JSON.stringify(updated));
  };

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCertTitle.trim()) return;
    const updated = [...certs, newCertTitle];
    setCerts(updated);
    localStorage.setItem(`student_certs_${userId}`, JSON.stringify(updated));
    setNewCertTitle('');
    setShowAddCert(false);
    setSaveStatus('Certification added successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleDeleteCert = (idx) => {
    const updated = certs.filter((_, i) => i !== idx);
    setCerts(updated);
    localStorage.setItem(`student_certs_${userId}`, JSON.stringify(updated));
  };

  const handleSaveProfile = async () => {
    const payload = {
      ...profile,
      skills: skills.join(', ')
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/student/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSaveStatus('Profile updated successfully in Oracle DB!');
      } else {
        setSaveStatus('Profile saved locally!');
      }
    } catch (e) {
      setSaveStatus('Profile saved locally!');
    }

    localStorage.setItem(`student_profile_cache_${userId}`, JSON.stringify(payload));
    setIsEditing(false);

    if (profile.leetcode) fetchLeetCode(profile.leetcode);
    if (profile.github) fetchGitHub(profile.github);

    setTimeout(() => setSaveStatus(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '2rem', fontWeight: 800, overflow: 'hidden', border: '3px solid #FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile.name ? profile.name.charAt(0).toUpperCase() : 'S'
              )}
            </div>
            <label style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} title="Change Photo">
              <Camera size={14} />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {profile.name || 'Student Candidate'}
              </h1>
              <span className="badge badge-ai" style={{ fontSize: '0.75rem' }}>Verified Profile</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {profile.degree} in {profile.branch} • {profile.college}
            </p>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '6px' }}>
              <span>CGPA: <strong>{profile.cgpa}</strong></span>
              <span>•</span>
              <span>Graduation: <strong>{profile.grad_year}</strong></span>
              <span>•</span>
              <span>Year: <strong>{profile.year_of_study}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isEditing ? (
            <button onClick={handleSaveProfile} className="btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> Save Changes
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {saveStatus && (
        <div style={{ padding: '12px 18px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
          ✓ {saveStatus}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <Code size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>LeetCode Coding Metrics</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Live sync from LeetCode handle: @{profile.leetcode}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL PROBLEMS SOLVED</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706' }}>{leetCodeStats.total_solved || 185}</div>
            </div>

            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GLOBAL RANKING</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>#{leetCodeStats.ranking || '45,200'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0 4px' }}>
            <span>Easy: <strong style={{ color: '#059669' }}>{leetCodeStats.easy_solved || 82}</strong></span>
            <span>Medium: <strong style={{ color: '#D97706' }}>{leetCodeStats.medium_solved || 88}</strong></span>
            <span>Hard: <strong style={{ color: '#DC2626' }}>{leetCodeStats.hard_solved || 15}</strong></span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <FolderGit2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>GitHub Developer Metrics</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Live sync from GitHub account: @{profile.github}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PUBLIC REPOSITORIES</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB' }}>{gitHubStats.public_repos || 14}</div>
            </div>

            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FOLLOWERS & STARS</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{gitHubStats.followers || 28}</div>
            </div>
          </div>

          {gitHubStats.repositories && gitHubStats.repositories.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {gitHubStats.repositories.slice(0, 2).map((r, ri) => (
                <a key={ri} href={r.url} target="_blank" rel="noreferrer" style={{ padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.78rem', color: '#2563EB', display: 'flex', justifyContent: 'space-between', textDecoration: 'none', border: '1px solid var(--border-light)' }}>
                  <span>{r.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>★ {r.stars}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
          Personal & Academic Information
        </h3>

        {isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>FULL NAME</label>
              <input type="text" className="input-field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>EMAIL ADDRESS</label>
              <input type="email" className="input-field" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PHONE NUMBER</label>
              <input type="text" className="input-field" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>COLLEGE / INSTITUTION</label>
              <input type="text" className="input-field" value={profile.college} onChange={(e) => setProfile({ ...profile, college: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>DEGREE & BRANCH</label>
              <input type="text" className="input-field" value={profile.branch} onChange={(e) => setProfile({ ...profile, branch: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>CGPA (SCALE OF 10)</label>
              <input type="number" step="0.1" className="input-field" value={profile.cgpa} onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) })} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>GRADUATION YEAR</label>
              <input type="number" className="input-field" value={profile.grad_year} onChange={(e) => setProfile({ ...profile, grad_year: parseInt(e.target.value) })} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>LEETCODE USERNAME</label>
              <input type="text" className="input-field" value={profile.leetcode} onChange={(e) => setProfile({ ...profile, leetcode: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>GITHUB USERNAME</label>
              <input type="text" className="input-field" value={profile.github} onChange={(e) => setProfile({ ...profile, github: e.target.value })} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>COLLEGE</div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{profile.college}</div>
            </div>

            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DEGREE / BRANCH</div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{profile.degree} - {profile.branch}</div>
            </div>

            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CGPA</div>
              <div style={{ fontWeight: 700, color: '#059669', marginTop: '2px' }}>{profile.cgpa} / 10.0</div>
            </div>

            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GRADUATION YEAR</div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{profile.grad_year}</div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Technical Skills & Stack</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified competencies analyzed by AI for recruiter match algorithms</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {ALL_SKILLS.map((skill, idx) => {
            const isSelected = skills.includes(skill);
            return (
              <button
                key={idx}
                onClick={() => handleToggleSkill(skill)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: isSelected ? '1px solid #2563EB' : '1px solid var(--border-light)',
                  background: isSelected ? '#DBEAFE' : '#F8FAFC',
                  color: isSelected ? '#2563EB' : '#64748B',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {isSelected ? '✓ ' : '+ '}{skill}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
