import React, { useState } from 'react';
import { Sparkles, Building2, UserCheck, ShieldCheck, FileUp } from 'lucide-react';

export default function LandingPage({ apiBaseUrl, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  // Login state (Starts empty with placeholders)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');

  // Radio button for Account Type
  const [accountType, setAccountType] = useState('STUDENT'); // 'STUDENT' or 'COMPANY'

  // Student Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCollege, setRegCollege] = useState('');
  const [regGradYear, setRegGradYear] = useState('');
  const [regCgpa, setRegCgpa] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regLocation, setRegLocation] = useState('');
  const [regResume, setRegResume] = useState('resume.pdf');
  const [regLeetcode, setRegLeetcode] = useState('');
  const [regGithub, setRegGithub] = useState('');
  const [regYear, setRegYear] = useState('3rd Year');
  const [regDegree, setRegDegree] = useState('B.E.');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');

  // Company Registration State
  const [compName, setCompName] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compPassword, setCompPassword] = useState('');
  const [compConfirmPassword, setCompConfirmPassword] = useState('');
  const [compIndustry, setCompIndustry] = useState('');
  const [compWebsite, setCompWebsite] = useState('');
  const [compLocation, setCompLocation] = useState('');
  const [compDesc, setCompDesc] = useState('');

  const [regErr, setRegErr] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginErr('');

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginEmail, email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data);
      } else {
        setLoginErr(data.detail || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setLoginErr('Backend connection error. Please ensure Spring Boot is running.');
    }
  };

  const handleResumeFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRegResume(file.name);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegErr('');
    setRegSuccess('');

    if (accountType === 'STUDENT' && regPassword !== regConfirmPassword) {
      setRegErr('Password and Confirm Password do not match.');
      return;
    }

    if (accountType === 'COMPANY' && compPassword !== compConfirmPassword) {
      setRegErr('Password and Confirm Password do not match.');
      return;
    }

    const payload = accountType === 'COMPANY' ? {
      account_type: 'COMPANY',
      company_name: compName,
      email: compEmail,
      password: compPassword,
      industry: compIndustry,
      website: compWebsite,
      location: compLocation,
      description: compDesc
    } : {
      account_type: 'STUDENT',
      name: regName,
      email: regEmail,
      password: regPassword,
      college: regCollege,
      grad_year: parseInt(regGradYear) || 2026,
      cgpa: parseFloat(regCgpa) || 8.5,
      gender: regGender,
      location: regLocation,
      resume_file_name: regResume || 'resume.pdf',
      leetcode: regLeetcode || 'Thilak0329',
      github: regGithub || 'Thilak-29',
      year_of_study: regYear,
      degree: regDegree,
      department: regDept
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegSuccess(`${accountType === 'COMPANY' ? 'Company' : 'Student'} registration successful! Entering dashboard...`);
        setTimeout(() => {
          onLoginSuccess(data);
        }, 1200);
      } else {
        setRegErr(data.detail || 'Registration failed.');
      }
    } catch (err) {
      setRegErr('Backend connection error. Please ensure Spring Boot is running.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: isLogin ? '440px' : '780px', padding: '36px', background: '#FFFFFF', transition: 'all 0.3s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', marginBottom: '12px' }}>
            <Sparkles size={24} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>InternMatch AI</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>AI-Driven Internship Matching & Recruitment Platform</p>
        </div>

        <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '8px', marginBottom: '24px' }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: isLogin ? '#FFFFFF' : 'transparent', fontWeight: isLogin ? 700 : 500, cursor: 'pointer', color: isLogin ? '#2563EB' : '#64748B', transition: 'all 0.2s ease' }}
          >
            Sign In (Student / Company / Admin)
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: !isLogin ? '#FFFFFF' : 'transparent', fontWeight: !isLogin ? 700 : 500, cursor: 'pointer', color: !isLogin ? '#2563EB' : '#64748B', transition: 'all 0.2s ease' }}
          >
            Registration
          </button>
        </div>

        {!isLogin && (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: accountType === 'STUDENT' ? 700 : 500, color: accountType === 'STUDENT' ? '#2563EB' : '#475569' }}>
              <input
                type="radio"
                name="accountType"
                value="STUDENT"
                checked={accountType === 'STUDENT'}
                onChange={() => setAccountType('STUDENT')}
              />
              <UserCheck size={18} /> Student Registration
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: accountType === 'COMPANY' ? 700 : 500, color: accountType === 'COMPANY' ? '#2563EB' : '#475569' }}>
              <input
                type="radio"
                name="accountType"
                value="COMPANY"
                checked={accountType === 'COMPANY'}
                onChange={() => setAccountType('COMPANY')}
              />
              <Building2 size={18} /> Company Registration
            </label>
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loginErr && <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#DC2626', borderRadius: '6px', fontSize: '0.85rem' }}>{loginErr}</div>}

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>EMAIL OR USERNAME</label>
              <input type="text" required className="input-field" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="e.g. name@example.com / recruiter" />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>PASSWORD</label>
              <input type="password" required className="input-field" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', height: '44px', justifyContent: 'center', marginTop: '8px' }}>
              Sign In to Account
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {regErr && <div style={{ gridColumn: 'span 2', padding: '10px 14px', background: '#FEE2E2', color: '#DC2626', borderRadius: '6px', fontSize: '0.85rem' }}>{regErr}</div>}
            {regSuccess && <div style={{ gridColumn: 'span 2', padding: '10px 14px', background: '#DCFCE7', color: '#166534', borderRadius: '6px', fontSize: '0.85rem' }}>{regSuccess}</div>}

            {accountType === 'STUDENT' ? (
              <>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>FULL NAME</label>
                  <input type="text" required className="input-field" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="e.g. Alex Johnson" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>EMAIL ADDRESS</label>
                  <input type="email" required className="input-field" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="e.g. alex@example.com" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PASSWORD</label>
                  <input type="password" required className="input-field" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>CONFIRM PASSWORD</label>
                  <input type="password" required className="input-field" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="••••••••" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>GENDER</label>
                  <select className="input-field" value={regGender} onChange={(e) => setRegGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>LOCATION / CITY</label>
                  <input type="text" required className="input-field" value={regLocation} onChange={(e) => setRegLocation(e.target.value)} placeholder="e.g. Coimbatore, Tamil Nadu" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>COLLEGE NAME</label>
                  <input type="text" required className="input-field" value={regCollege} onChange={(e) => setRegCollege(e.target.value)} placeholder="e.g. Karpagam College of Engineering" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>GRADUATION YEAR</label>
                  <input type="number" required className="input-field" value={regGradYear} onChange={(e) => setRegGradYear(e.target.value)} placeholder="e.g. 2026" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>CGPA (OUT OF 10)</label>
                  <input type="number" step="0.1" required className="input-field" value={regCgpa} onChange={(e) => setRegCgpa(e.target.value)} placeholder="e.g. 8.9" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>DEGREE</label>
                  <input type="text" required className="input-field" value={regDegree} onChange={(e) => setRegDegree(e.target.value)} placeholder="e.g. B.E." />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>DEPARTMENT / BRANCH</label>
                  <input type="text" required className="input-field" value={regDept} onChange={(e) => setRegDept(e.target.value)} placeholder="e.g. Computer Science & Engineering" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>YEAR OF PURSUING</label>
                  <select className="input-field" value={regYear} onChange={(e) => setRegYear(e.target.value)}>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>UPLOAD RESUME (PDF)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeFileSelect} style={{ fontSize: '0.8rem' }} />
                  </div>
                  {regResume && <span style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '2px', display: 'block' }}>Selected: {regResume}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>LEETCODE USERNAME</label>
                  <input type="text" required className="input-field" value={regLeetcode} onChange={(e) => setRegLeetcode(e.target.value)} placeholder="e.g. Thilak0329" />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>GITHUB USERNAME</label>
                  <input type="text" required className="input-field" value={regGithub} onChange={(e) => setRegGithub(e.target.value)} placeholder="e.g. Thilak-29" />
                </div>
              </>
            ) : (
              <>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>COMPANY NAME</label>
                  <input type="text" required className="input-field" value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="e.g. Google Inc" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>OFFICIAL WORK EMAIL</label>
                  <input type="email" required className="input-field" value={compEmail} onChange={(e) => setCompEmail(e.target.value)} placeholder="e.g. recruiter@google.com" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>INDUSTRY</label>
                  <input type="text" required className="input-field" value={compIndustry} onChange={(e) => setCompIndustry(e.target.value)} placeholder="e.g. Software & Cloud Technology" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PASSWORD</label>
                  <input type="password" required className="input-field" value={compPassword} onChange={(e) => setCompPassword(e.target.value)} placeholder="••••••••" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>CONFIRM PASSWORD</label>
                  <input type="password" required className="input-field" value={compConfirmPassword} onChange={(e) => setCompConfirmPassword(e.target.value)} placeholder="••••••••" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>COMPANY WEBSITE</label>
                  <input type="url" required className="input-field" value={compWebsite} onChange={(e) => setCompWebsite(e.target.value)} placeholder="e.g. https://company.com" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>HEADQUARTER LOCATION</label>
                  <input type="text" required className="input-field" value={compLocation} onChange={(e) => setCompLocation(e.target.value)} placeholder="e.g. Bengaluru, Karnataka" />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>COMPANY DESCRIPTION</label>
                  <textarea rows="3" required className="input-field" value={compDesc} onChange={(e) => setCompDesc(e.target.value)} placeholder="Overview of company products & hiring domain..." />
                </div>
              </>
            )}

            <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', height: '44px', justifyContent: 'center' }}>
                Complete {accountType === 'COMPANY' ? 'Company' : 'Student'} Registration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
