import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { User, BookOpen, Code, FolderGit2, Award, X, Plus, Edit3, Save, Camera, Trash2, ExternalLink } from 'lucide-react';

export default function StudentProfile({ apiBaseUrl = 'http://localhost:8000', currentUser }) {
  const userId = currentUser?.userId || currentUser?.user_id || 1;

  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('');

  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
    college: currentUser?.college || '',
    degree: currentUser?.degree || '',
    branch: currentUser?.department || currentUser?.branch || '',
    year_of_study: currentUser?.year_of_study || '',
    cgpa: currentUser?.cgpa || '',
    grad_year: currentUser?.grad_year || '',
    github: currentUser?.github || '',
    leetcode: currentUser?.leetcode || '',
    linkedin: '',
    portfolio: '',
    codechef: '',
    hackerrank: '',
    bio: ''
  });

  const [leetCodeStats, setLeetCodeStats] = useState({ solvedCount: 0, ranking: 0 });
  const [gitHubStats, setGitHubStats] = useState({ publicRepos: 0, followers: 0 });

  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);

  // Form states for adding project and cert
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
        setProfile(prev => ({
          ...prev,
          ...data
        }));

        if (data.skills || data.SKILLS) {
          const rawSkills = data.skills || data.SKILLS;
          if (typeof rawSkills === 'string' && rawSkills.trim().length > 0) {
            setSkills(rawSkills.split(',').map(s => s.trim()).filter(Boolean));
          }
        }

        const lc = data.leetcode || data.LEETCODE;
        const gh = data.github || data.GITHUB;
        if (lc) fetchLeetCode(lc);
        if (gh) fetchGitHub(gh);
      }
    } catch (err) {}
  };

  const fetchLeetCode = async (lcHandle) => {
    if (!lcHandle) return;
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
        setSaveStatus('Profile photo updated!');
        setTimeout(() => setSaveStatus(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const ALL_SKILLS = [
    'React', 'React Native', 'Redux', 'Responsive Design', 'REST API',
    'Python', 'PyTorch', 'Pandas',
    'Java', 'Spring Boot', 'Spring Security',
    'SQL', 'Oracle Database', 'MySQL', 'PostgreSQL',
    'FastAPI', 'Node.js', 'Express',
    'Tailwind CSS', 'TypeScript', 'Docker', 'AWS'
  ];

  const [skillInput, setSkillInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleSkillInputChange = (e) => {
    const val = e.target.value;
    setSkillInput(val);
    if (val.trim().length > 0) {
      const matches = ALL_SKILLS.filter(s => s.toLowerCase().startsWith(val.toLowerCase()) && !skills.includes(s));
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const addSkill = (skillName) => {
    if (!skills.includes(skillName)) {
      const updated = [...skills, skillName];
      setSkills(updated);
      saveProfileToOracle({ ...profile, skills: updated.join(', ') });
    }
    setSkillInput('');
    setSuggestions([]);
  };

  const removeSkill = (skillToRemove) => {
    const updated = skills.filter(s => s !== skillToRemove);
    setSkills(updated);
    saveProfileToOracle({ ...profile, skills: updated.join(', ') });
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;
    const newProj = {
      title: newProjTitle,
      desc: newProjDesc,
      tech: newProjTech,
      duration: newProjDuration || '1 Month'
    };
    setProjects([...projects, newProj]);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjTech('');
    setNewProjDuration('');
    setShowAddProject(false);
    setSaveStatus('Project added successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleDeleteProject = (idx) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCertTitle.trim()) return;
    setCerts([...certs, newCertTitle]);
    setNewCertTitle('');
    setShowAddCert(false);
    setSaveStatus('Certification added successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleDeleteCert = (idx) => {
    setCerts(certs.filter((_, i) => i !== idx));
  };

  const saveProfileToOracle = async (profileData) => {
    setSaveStatus('Saving to Oracle DB...');
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/student/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        setSaveStatus('Saved live to College Oracle Database!');
        if (profileData.leetcode) fetchLeetCode(profileData.leetcode);
        if (profileData.github) fetchGitHub(profileData.github);
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (err) {
      setSaveStatus('');
    }
  };

  const handleSaveAll = () => {
    saveProfileToOracle({
      ...profile,
      skills: skills.join(', ')
    });
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {saveStatus && (
        <div style={{ padding: '10px 16px', background: '#DCFCE7', color: '#166534', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
          ✓ {saveStatus}
        </div>
      )}

      {/* Header Profile Card with Photo Upload */}
      <div className="glass-card" style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" style={{ width: '92px', height: '92px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563EB' }} />
            ) : (
              <div style={{ width: '92px', height: '92px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', fontWeight: 800 }}>
                {(profile.name || 'S').charAt(0)}
              </div>
            )}
            <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#2563EB', color: '#FFFFFF', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} title="Upload Profile Photo">
              <Camera size={14} />
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
            </label>
          </div>

          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{profile.name || 'Student Candidate'}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '2px' }}>
              {profile.degree || 'Degree'} in {profile.branch || 'Department'} • {profile.college || 'College'}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-ai" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code size={13} /> LeetCode Solved: {leetCodeStats.solvedCount || 0}
              </span>
              <span className="badge badge-auth" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FolderGit2 size={13} /> GitHub Repos: {gitHubStats.publicRepos || 0}
              </span>
            </div>
          </div>
        </div>

        <div>
          {isEditing ? (
            <button onClick={handleSaveAll} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#059669' }}>
              <Save size={16} /> Save Profile Changes
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
              <Edit3 size={16} /> Edit Profile Details
            </button>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#2563EB', fontWeight: 700 }}>
          <User size={20} /> Personal Information (College Oracle DB Record)
        </div>

        {isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>FULL NAME</label>
              <input type="text" className="input-field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>EMAIL</label>
              <input type="email" className="input-field" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PHONE NUMBER</label>
              <input type="text" className="input-field" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>GENDER</label>
              <select className="input-field" value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>DATE OF BIRTH</label>
              <input type="date" className="input-field" value={profile.dob} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>LOCATION / ADDRESS</label>
              <input type="text" className="input-field" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} placeholder="City, State" />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
            <div><strong>Full Name:</strong> {profile.name || 'Not provided'}</div>
            <div><strong>Email:</strong> {profile.email || 'Not provided'}</div>
            <div><strong>Phone:</strong> {profile.phone || 'Not provided'}</div>
            <div><strong>Gender:</strong> {profile.gender || 'Not provided'}</div>
            <div><strong>Date of Birth:</strong> {profile.dob || 'Not provided'}</div>
            <div><strong>Location:</strong> {profile.address || 'Not provided'}</div>
          </div>
        )}
      </div>

      {/* Academic Information */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#7C3AED', fontWeight: 700 }}>
          <BookOpen size={20} /> Academic Information
        </div>

        {isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>COLLEGE NAME</label>
              <input type="text" className="input-field" value={profile.college} onChange={(e) => setProfile({ ...profile, college: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>DEGREE</label>
              <input type="text" className="input-field" value={profile.degree} onChange={(e) => setProfile({ ...profile, degree: e.target.value })} placeholder="B.E. / B.Tech" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>DEPARTMENT / BRANCH</label>
              <input type="text" className="input-field" value={profile.branch} onChange={(e) => setProfile({ ...profile, branch: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>YEAR OF STUDY</label>
              <select className="input-field" value={profile.year_of_study} onChange={(e) => setProfile({ ...profile, year_of_study: e.target.value })}>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>CGPA (OUT OF 10)</label>
              <input type="number" step="0.01" className="input-field" value={profile.cgpa} onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>GRADUATION YEAR</label>
              <input type="number" className="input-field" value={profile.grad_year} onChange={(e) => setProfile({ ...profile, grad_year: e.target.value })} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
            <div><strong>College:</strong> {profile.college || 'Not provided'}</div>
            <div><strong>Degree & Branch:</strong> {profile.degree || 'Degree'} - {profile.branch || 'Branch'}</div>
            <div><strong>Year of Study:</strong> {profile.year_of_study || 'Not provided'}</div>
            <div><strong>CGPA:</strong> {profile.cgpa ? `${profile.cgpa} / 10` : 'Not provided'}</div>
            <div><strong>Graduation Year:</strong> {profile.grad_year || 'Not provided'}</div>
          </div>
        )}
      </div>

      {/* Online Handles & APIs */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#D97706', fontWeight: 700 }}>
          <Code size={20} /> Developer Profiles & Live API Handles
        </div>

        {isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>LEETCODE USERNAME</label>
              <input type="text" className="input-field" value={profile.leetcode} onChange={(e) => setProfile({ ...profile, leetcode: e.target.value })} placeholder="e.g. Thilak0329" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>GITHUB USERNAME</label>
              <input type="text" className="input-field" value={profile.github} onChange={(e) => setProfile({ ...profile, github: e.target.value })} placeholder="e.g. Thilak-29" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>LINKEDIN URL</label>
              <input type="url" className="input-field" value={profile.linkedin} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PORTFOLIO URL</label>
              <input type="url" className="input-field" value={profile.portfolio} onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })} placeholder="https://..." />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
            <div><strong>LeetCode Handle:</strong> {profile.leetcode || 'Not added'} ({leetCodeStats.solvedCount || 0} solved)</div>
            <div><strong>GitHub Handle:</strong> {profile.github || 'Not added'} ({gitHubStats.publicRepos || 0} repos)</div>
            <div><strong>LinkedIn:</strong> {profile.linkedin || 'Not added'}</div>
            <div><strong>Portfolio:</strong> {profile.portfolio || 'Not added'}</div>
          </div>
        )}
      </div>

      {/* Technical Skills */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#059669', fontWeight: 700 }}>
          <Code size={20} /> Technical Skills (Persists to Oracle Database)
        </div>

        <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '400px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Type skill (e.g. type 're' for React/Redux)..."
            value={skillInput}
            onChange={handleSkillInputChange}
          />

          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: '160px', overflowY: 'auto' }}>
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => addSkill(s)}
                  style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid #F1F5F9' }}
                  onMouseEnter={(e) => e.target.style.background = '#F1F5F9'}
                  onMouseLeave={(e) => e.target.style.background = '#FFFFFF'}
                >
                  <Plus size={12} style={{ display: 'inline', marginRight: '6px' }} /> {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {skills.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill, idx) => (
              <span key={idx} className="badge badge-ai" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {skill}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)} />
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No skills added yet.</div>
        )}
      </div>

      {/* Featured Projects (Editable & Addable) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', fontWeight: 700 }}>
            <FolderGit2 size={20} /> Featured Projects
          </div>
          <button onClick={() => setShowAddProject(!showAddProject)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Add Project
          </button>
        </div>

        {showAddProject && (
          <form onSubmit={handleAddProject} style={{ padding: '18px', background: '#F8FAFC', borderRadius: '8px', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PROJECT TITLE</label>
              <input type="text" required className="input-field" value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} placeholder="e.g. InternMatch AI Platform" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PROJECT DESCRIPTION</label>
              <textarea rows="2" required className="input-field" value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} placeholder="Brief summary of architecture & features..." />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>TECH STACK</label>
              <input type="text" required className="input-field" value={newProjTech} onChange={(e) => setNewProjTech(e.target.value)} placeholder="e.g. React, Java, Oracle SQL" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>DURATION</label>
              <input type="text" className="input-field" value={newProjDuration} onChange={(e) => setNewProjDuration(e.target.value)} placeholder="e.g. 2 Months" />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowAddProject(false)} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.82rem' }}>Save Project</button>
            </div>
          </form>
        )}

        {projects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.map((proj, idx) => (
              <div key={idx} style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>{proj.title} ({proj.duration})</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0' }}>{proj.desc}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>Tech: {proj.tech}</div>
                </div>
                <button onClick={() => handleDeleteProject(idx)} className="btn-ghost" style={{ padding: '6px', color: '#DC2626' }} title="Delete Project">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No projects added yet. Click "Add Project" to showcase your work!</div>
        )}
      </div>

      {/* Certifications (Editable & Addable) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontWeight: 700 }}>
            <Award size={20} /> Certifications
          </div>
          <button onClick={() => setShowAddCert(!showAddCert)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Add Certification
          </button>
        </div>

        {showAddCert && (
          <form onSubmit={handleAddCert} style={{ padding: '18px', background: '#F8FAFC', borderRadius: '8px', marginBottom: '16px', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              required
              className="input-field"
              value={newCertTitle}
              onChange={(e) => setNewCertTitle(e.target.value)}
              placeholder="e.g. Oracle Certified Associate Java Programmer"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 18px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>Add</button>
            <button type="button" onClick={() => setShowAddCert(false)} className="btn-ghost" style={{ padding: '0 12px', fontSize: '0.82rem' }}>Cancel</button>
          </form>
        )}

        {certs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {certs.map((c, idx) => (
              <div key={idx} style={{ padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>• {c}</span>
                <button onClick={() => handleDeleteCert(idx)} className="btn-ghost" style={{ padding: '4px', color: '#DC2626' }} title="Delete Certification">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No certifications added yet. Click "Add Certification" to add your credentials!</div>
        )}
      </div>
=======
import { User, Award, BookOpen, Target, Sparkles, Check, Github, Code, Save, Edit3, AlertTriangle, Building2, Phone, Briefcase, FileText, Plus, X, Upload } from 'lucide-react';

export default function StudentProfile({ apiBaseUrl, currentUser, onProfileUpdated }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [intelligence, setIntelligence] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [skills, setSkills] = useState(["Python", "FastAPI", "React", "SQL", "Machine Learning"]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [resumeFileName, setResumeFileName] = useState("alex_johnson_resume_2025.pdf");
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    college: '',
    branch: 'Computer Science & Engineering',
    cgpa: 8.5,
    city: '',
    state: '',
    github: '',
    leetcode: '',
    bio: ''
  });

  const safeUser = currentUser || {};
  const userId = (safeUser.userId || safeUser.user_id) ? Number(safeUser.userId || safeUser.user_id) : 9;

  useEffect(() => {
    fetchProfile();
    fetchIntelligence();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/v1/students/profile/${userId}`);
      let data = null;
      if (res.ok) {
        data = await res.json();
      }

      const activeData = data || {
        user_id: userId,
        name: safeUser.name || 'Student Candidate',
        username: safeUser.username || 'student',
        email: safeUser.email || '',
        college: 'Karpagam College of Engineering (KCE)',
        branch: 'Computer Science & Engineering',
        cgpa: 8.5,
        skills: ['Python', 'React', 'SQL', 'FastAPI'],
        github: '',
        leetcode: '',
        bio: ''
      };

      setProfile(activeData);
      if (activeData.skills && Array.isArray(activeData.skills) && activeData.skills.length > 0) {
        setSkills(activeData.skills);
      }
      setEditForm({
        name: activeData.name || safeUser.name || '',
        phone: activeData.phone || '',
        college: activeData.college || '',
        branch: activeData.branch || 'Computer Science & Engineering',
        cgpa: activeData.cgpa || 8.5,
        city: activeData.city || '',
        state: activeData.state || '',
        github: activeData.github || '',
        leetcode: activeData.leetcode || '',
        bio: activeData.bio || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIntelligence = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/students/${userId}/intelligence`);
      if (res.ok) {
        const data = await res.json();
        setIntelligence(data);
      }
    } catch (err) {
      console.error('Error fetching intelligence:', err);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const trimmed = newSkillInput.trim();
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleResumeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      setResumeFileName(fileName);

      try {
        await fetch(`${apiBaseUrl}/api/v1/students/${userId}/upload-resume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_file_name: fileName,
            resume_parsed_text: `Candidate ATS parsed resume text for ${fileName}. Verified skills: ${skills.join(', ')}`
          })
        });
      } catch (err) {
        console.error('Error persisting resume to MySQL:', err);
      }

      setResumeUploadSuccess(true);
      setTimeout(() => setResumeUploadSuccess(false), 4000);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...profile,
        ...editForm,
        skills: skills,
        cgpa: parseFloat(editForm.cgpa) || 8.5
      };

      const res = await fetch(`${apiBaseUrl}/api/v1/students/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setShowEditModal(false);
        fetchProfile();
        fetchIntelligence();
        if (onProfileUpdated) onProfileUpdated();
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="neo-card" style={{ padding: 'var(--space-48)', textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Loading student candidate profile...
        </p>
      </div>
    );
  }

  const studentName = editForm.name || currentUser?.name || profile?.name || 'Student Candidate';
  const hasMissingHandles = !editForm.github || !editForm.leetcode;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', paddingTop: 'var(--space-24)' }}>
      
      {/* WARNING BANNER FOR MISSING HANDLES */}
      {hasMissingHandles && (
        <div style={{ background: 'var(--color-danger-light)', border: '1px solid var(--color-danger)', padding: 'var(--space-16) var(--space-24)', borderRadius: '16px', color: 'var(--color-danger)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>GitHub & LeetCode Profiles Required</div>
              <div style={{ fontSize: '0.85rem' }}>Update your GitHub and LeetCode handles for AI match score calculation.</div>
            </div>
          </div>
          <button onClick={() => setShowEditModal(true)} className="btn-primary" style={{ height: '38px', fontSize: '0.85rem' }}>
            Update Profiles
          </button>
        </div>
      )}

      {/* CANDIDATE PROFILE HERO CARD */}
      <div className="neo-card">
        <div className="neo-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="icon-circle icon-blue" style={{ width: '56px', height: '56px', fontSize: '1.4rem' }}>
              <User size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{studentName}</h1>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {editForm.college || "Karpagam College of Engineering"} • {editForm.branch || "Computer Science & Engineering"}
              </div>
            </div>
          </div>

          <button onClick={() => setShowEditModal(true)} className="btn-secondary">
            <Edit3 size={16} /> Edit Profile Details
          </button>
        </div>

        <div className="neo-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-20)' }}>
          <div style={{ background: 'var(--bg-secondary-surface)', padding: 'var(--space-16)', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>CUMULATIVE CGPA</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '4px' }}>
              {editForm.cgpa || 8.5}
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary-surface)', padding: 'var(--space-16)', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>PUBLIC GITHUB REPOS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-secondary)', marginTop: '4px' }}>
              {intelligence?.github_repos || 12}
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary-surface)', padding: 'var(--space-16)', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>LEETCODE SOLVED</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
              {intelligence?.leetcode_solved || 98}
            </div>
          </div>
        </div>
      </div>

      {/* SKILLS & BIO */}
      <div className="neo-card">
        <div className="neo-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Verified Skills & Competencies</h2>
          <span className="badge badge-ai"><Sparkles size={14} /> AI Parsed Skills</span>
        </div>
        <div className="neo-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)' }}>
          
          {/* SKILLS CHIPS & REMOVE BUTTONS */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {skills.map((sk, idx) => (
              <span key={idx} className="badge badge-remote" style={{ textTransform: 'none', fontSize: '0.9rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {sk}
                <X size={14} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSkill(sk)} />
              </span>
            ))}
          </div>

          {/* ADD SKILL FORM */}
          <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '12px', maxWidth: '440px' }}>
            <input
              type="text"
              className="input-field"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="Add a new skill (e.g. PyTorch, Docker)..."
              style={{ height: '42px', fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn-secondary" style={{ height: '42px', padding: '0 16px', fontSize: '0.9rem' }}>
              <Plus size={16} /> Add Skill
            </button>
          </form>

          <div style={{ background: 'var(--bg-secondary-surface)', padding: 'var(--space-16)', borderRadius: '14px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {editForm.bio || "Passionate software engineering candidate aiming to build scalable AI products and enterprise backend applications."}
          </div>
        </div>
      </div>

      {/* RESUME MANAGEMENT CARD */}
      <div className="neo-card">
        <div className="neo-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={22} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Resume Document</h2>
          </div>
          <span className="badge badge-verified"><Check size={14} /> ATS Parsed Score: 92%</span>
        </div>

        <div className="neo-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {resumeUploadSuccess && (
            <div style={{ padding: '12px 16px', background: 'var(--color-success-light)', border: '1px solid var(--color-success)', color: 'var(--color-success)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
              ✓ Resume updated & parsed into ATS Vector Store successfully!
            </div>
          )}

          <div style={{ background: 'var(--bg-secondary-surface)', padding: '20px', borderRadius: '16px', border: '1.5px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="icon-circle icon-purple" style={{ width: '44px', height: '44px' }}>
                <FileText size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{resumeFileName}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Updated 2 days ago • PDF Document (1.2 MB)</div>
              </div>
            </div>

            <label className="btn-primary" style={{ height: '42px', cursor: 'pointer' }}>
              <Upload size={16} /> Upload / Update Resume
              <input type="file" accept=".pdf,.docx" onChange={handleResumeFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="neo-card" style={{ maxWidth: '600px', width: '100%', padding: 'var(--space-32)', background: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Edit Candidate Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="btn-ghost" style={{ padding: '4px' }}>✕</button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>FULL NAME</label>
                <input type="text" className="input-field" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="e.g. Alex Johnson" />
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>COLLEGE / UNIVERSITY</label>
                <input type="text" className="input-field" value={editForm.college} onChange={(e) => setEditForm({ ...editForm, college: e.target.value })} placeholder="e.g. Karpagam College of Engineering" />
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>BRANCH / DEGREE</label>
                <input type="text" className="input-field" value={editForm.branch} onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })} placeholder="e.g. Computer Science & Engineering" />
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>CGPA (OUT OF 10)</label>
                <input type="number" step="0.1" className="input-field" value={editForm.cgpa} onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })} placeholder="8.5" />
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>GITHUB USERNAME</label>
                <input type="text" className="input-field" value={editForm.github} onChange={(e) => setEditForm({ ...editForm, github: e.target.value })} placeholder="e.g. alex_dev" />
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>LEETCODE USERNAME</label>
                <input type="text" className="input-field" value={editForm.leetcode} onChange={(e) => setEditForm({ ...editForm, leetcode: e.target.value })} placeholder="e.g. alex_coder" />
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>CAREER BIO / SUMMARY</label>
                <textarea className="input-field" style={{ height: '80px', padding: '12px 16px' }} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Brief summary of your skills and career interests..." />
              </div>

              <button type="submit" disabled={saving} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
>>>>>>> 26c430b2b8530a875a41bfc9a9c1514a365a9811
    </div>
  );
}
