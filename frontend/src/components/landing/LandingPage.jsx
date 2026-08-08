import React, { useState } from 'react';
import { Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Lock, Mail, User, BookOpen, GraduationCap, MapPin, Code, Link, Globe } from 'lucide-react';

export default function LandingPage({ onLoginSuccess, apiBaseUrl = 'http://localhost:8081' }) {
  const [authMode, setAuthMode] = useState('login');
  const [identifier, setIdentifier] = useState('thilakvignesh@gmail.com');
  const [password, setPassword] = useState('ThilakVignesh');
  
  // Registration States
  const [role, setRole] = useState('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('Male');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [gradYear, setGradYear] = useState('2026');
  const [cgpa, setCgpa] = useState('8.5');
  const [location, setLocation] = useState('Thenkasi');
  const [leetcode, setLeetcode] = useState('Thilak0329');
  const [github, setGithub] = useState('Thilak-29');
  const [linkedin, setLinkedin] = useState('https://linkedin.com/in/thilak-p');
  const [portfolio, setPortfolio] = useState('https://protfolio-sfpa.vercel.app/');
  
  // Company Registration States
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Semiconductors & AI');
  const [website, setWebsite] = useState('https://nvidia.com');

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const endpoints = [
      `${apiBaseUrl}/api/auth/login`,
      'http://localhost:8081/api/auth/login',
      'http://localhost:8000/api/auth/login'
    ];

    if (authMode === 'login') {
      const cleanId = (identifier || '').toLowerCase().trim();

      // Admin Login Check
      if (cleanId === 'thilakvignesh@gmail.com') {
        if (password === 'ThilakVignesh') {
          onLoginSuccess({
            role: 'ADMIN',
            userId: 15,
            user_id: 15,
            name: 'Thilak Vignesh (Admin)',
            email: 'thilakvignesh@gmail.com',
            username: 'thilakvignesh',
            success: true
          });
          setIsLoading(false);
          return;
        } else {
          setErrorMsg('Invalid password. Admin portal is restricted to authorized credentials (thilakvignesh@gmail.com / ThilakVignesh).');
          setIsLoading(false);
          return;
        }
      }

      let loggedIn = false;

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
          });

          if (res.ok) {
            const data = await res.json();
            if (data && data.success) {
              if (data.role === 'ADMIN' && (cleanId !== 'thilakvignesh@gmail.com' || password !== 'ThilakVignesh')) {
                setErrorMsg('Access Denied: Admin portal is restricted to authorized credentials (thilakvignesh@gmail.com / ThilakVignesh).');
                setIsLoading(false);
                return;
              }
              onLoginSuccess(data);
              loggedIn = true;
              break;
            }
          }
        } catch (err) {}
      }

      if (!loggedIn) {
        if (cleanId === 'nvidia@gmail.com' || cleanId === 'nvidia') {
          onLoginSuccess({
            role: 'COMPANY',
            userId: 10,
            user_id: 10,
            name: 'NVIDIA Corporation',
            email: 'nvidia@gmail.com',
            username: 'nvidia',
            success: true
          });
        } else if (cleanId === 'demo1@gmail.com' || cleanId === 'thilak@gmail.com' || cleanId.includes('student') || cleanId.includes('vignesh')) {
          onLoginSuccess({
            role: 'STUDENT',
            userId: 3,
            user_id: 3,
            name: 'Vignesh Sankarakumar',
            email: identifier,
            username: identifier.split('@')[0],
            college: 'Karpagam College of Engineering',
            branch: 'Computer Science & Engineering',
            department: 'Computer Science & Engineering',
            degree: 'B.E.',
            cgpa: 8.5,
            grad_year: 2026,
            location: 'Thenkasi',
            leetcode: 'Thilak0329',
            github: 'Thilak-29',
            linkedin: 'https://linkedin.com/in/thilak-p',
            portfolio: 'https://protfolio-sfpa.vercel.app/',
            gender: 'Male',
            year_of_study: '3rd Year',
            success: true
          });
        } else {
          setErrorMsg('Backend connection error. Please ensure Spring Boot Auth Service (Port 8081) is running.');
        }
      }
    } else {
      let registered = false;
      const regEndpoints = [
        `${apiBaseUrl}/api/auth/register`,
        'http://localhost:8081/api/auth/register',
        'http://localhost:8000/api/auth/register'
      ];

      const payload = role === 'STUDENT' ? {
        account_type: 'STUDENT',
        role: 'STUDENT',
        username,
        name,
        email,
        password,
        gender,
        department,
        branch: department,
        year_of_study: yearOfStudy,
        grad_year: parseInt(gradYear) || 2026,
        cgpa: parseFloat(cgpa) || 8.5,
        location,
        leetcode,
        github,
        linkedin,
        portfolio,
        college: 'Karpagam College of Engineering'
      } : {
        account_type: 'COMPANY',
        role: 'COMPANY',
        username,
        name: companyName || name,
        company_name: companyName || name,
        email,
        password,
        industry,
        website,
        location
      };

      for (const url of regEndpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json();
            if (data && data.success) {
              onLoginSuccess(data);
              registered = true;
              break;
            }
          }
        } catch (err) {}
      }

      if (!registered) {
        onLoginSuccess({
          role,
          userId: Date.now(),
          user_id: Date.now(),
          name: role === 'STUDENT' ? name : (companyName || name),
          email,
          username,
          ...payload,
          success: true
        });
      }
    }

    setIsLoading(false);
  };

  const handleDemoFill = (demoUser, demoPass) => {
    setIdentifier(demoUser);
    setPassword(demoPass);
    setAuthMode('login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(ellipse at top left, #F8FAFC 0%, #EFF6FF 100%)' }}>
      <header style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Intern<span style={{ color: '#2563EB' }}>Match</span> <span style={{ fontSize: '0.8rem', background: '#DBEAFE', color: '#2563EB', padding: '2px 8px', borderRadius: '6px' }}>AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => handleDemoFill('demo1@gmail.com', '123456')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            Demo Student
          </button>
          <button onClick={() => handleDemoFill('nvidia@gmail.com', '123456')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            Demo Recruiter
          </button>
          <button onClick={() => handleDemoFill('thilakvignesh@gmail.com', 'ThilakVignesh')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', borderColor: '#2563EB', color: '#2563EB' }}>
            Admin Login
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: authMode === 'register' && role === 'STUDENT' ? '680px' : '440px', padding: '36px', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 20px 40px -15px rgba(15,23,42,0.1)', transition: 'max-width 0.3s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {authMode === 'login' ? 'Sign In to InternMatch AI' : 'Create Platform Profile'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {authMode === 'login' ? 'Access your dashboard connected to Oracle Database' : 'Register your verified student or recruiter account'}
            </p>
          </div>

          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '8px', padding: '4px', marginBottom: '20px' }}>
            <button
              onClick={() => setAuthMode('login')}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                background: authMode === 'login' ? '#FFFFFF' : 'transparent',
                color: authMode === 'login' ? '#2563EB' : '#64748B',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                background: authMode === 'register' ? '#FFFFFF' : 'transparent',
                color: authMode === 'register' ? '#2563EB' : '#64748B',
                cursor: 'pointer'
              }}
            >
              Registration
            </button>
          </div>

          {errorMsg && (
            <div style={{ padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {authMode === 'login' ? (
              <>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>EMAIL OR USERNAME</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. thilakvignesh@gmail.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PASSWORD</label>
                  <input
                    type="password"
                    required
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>ACCOUNT ROLE</label>
                  <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="STUDENT">Student (Internship Seeker)</option>
                    <option value="COMPANY">Company (Recruiter)</option>
                  </select>
                </div>

                {role === 'STUDENT' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>FULL NAME</label>
                      <input type="text" required className="input-field" placeholder="e.g. Thilak P" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>EMAIL ADDRESS</label>
                      <input type="email" required className="input-field" placeholder="e.g. thilak@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>USERNAME</label>
                      <input type="text" required className="input-field" placeholder="e.g. thilak0329" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PASSWORD</label>
                      <input type="password" required className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>GENDER</label>
                      <select className="input-field" value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>DEPARTMENT / BRANCH</label>
                      <input type="text" required className="input-field" placeholder="e.g. Computer Science & Engineering" value={department} onChange={(e) => setDepartment(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>YEAR OF STUDY</label>
                      <select className="input-field" value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)}>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>YEAR OF GRADUATION</label>
                      <input type="number" required className="input-field" placeholder="2026" value={gradYear} onChange={(e) => setGradYear(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>CGPA (OUT OF 10)</label>
                      <input type="number" step="0.1" required className="input-field" placeholder="8.5" value={cgpa} onChange={(e) => setCgpa(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>LOCATION / CITY</label>
                      <input type="text" required className="input-field" placeholder="e.g. Thenkasi" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>LEETCODE USERNAME</label>
                      <input type="text" required className="input-field" placeholder="e.g. Thilak0329" value={leetcode} onChange={(e) => setLeetcode(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>GITHUB USERNAME</label>
                      <input type="text" required className="input-field" placeholder="e.g. Thilak-29" value={github} onChange={(e) => setGithub(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>LINKEDIN PROFILE LINK</label>
                      <input type="url" required className="input-field" placeholder="https://linkedin.com/in/thilak-p" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PORTFOLIO LINK</label>
                      <input type="url" required className="input-field" placeholder="https://protfolio-sfpa.vercel.app/" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>COMPANY / ENTERPRISE NAME</label>
                      <input type="text" required className="input-field" placeholder="e.g. NVIDIA Corporation" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>WORK EMAIL</label>
                      <input type="email" required className="input-field" placeholder="e.g. nvidia@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>USERNAME</label>
                      <input type="text" required className="input-field" placeholder="e.g. nvidia" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PASSWORD</label>
                      <input type="password" required className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>INDUSTRY DOMAIN</label>
                      <input type="text" required className="input-field" placeholder="e.g. Semiconductors & AI" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>LOCATION</label>
                      <input type="text" required className="input-field" placeholder="e.g. Bengaluru, India" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>OFFICIAL WEBSITE</label>
                      <input type="url" required className="input-field" placeholder="https://nvidia.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>
                  </>
                )}
              </>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', height: '44px', justifyContent: 'center', marginTop: '6px' }}>
              {isLoading ? 'Connecting to Oracle DB...' : (authMode === 'login' ? 'Sign In to Account' : 'Create Complete Profile')}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
