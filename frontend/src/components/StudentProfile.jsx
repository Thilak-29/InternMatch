import React, { useState, useEffect } from 'react';
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
    </div>
  );
}
