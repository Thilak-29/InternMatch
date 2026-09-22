import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowLeft, AlertCircle, FlaskConical } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';
import SkillsSelector from '../common/SkillsSelector';

export default function PostInternship({ currentUser, onNavigate }) {
  const companyId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;
  const token = currentUser?.token || '';
  const baseUrl = API_CONFIG.COMPANY_SERVICE_URL;

  if (!companyId) {
    return (
      <div className="glass-card" style={{ padding: '36px', textAlign: 'center', color: '#DC2626' }}>
        <AlertCircle size={32} style={{ margin: '0 auto 12px auto' }} />
        <h3>Session Authentication Error</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
          Unable to identify authenticated company ID. Please sign in again.
        </p>
      </div>
    );
  }

  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [workMode, setWorkMode] = useState('Hybrid');
  const [gradYear, setGradYear] = useState('2026');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [stipend, setStipend] = useState('');
  const [openings, setOpenings] = useState('1');
  const [deadline, setDeadline] = useState('');

  // ── Date helpers ─────────────────────────────────────────────────────────
  const computeDuration = (start, end) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (months <= 0) return '';
    return months === 1 ? '1 Month' : `${months} Months`;
  };

  const handleStartDate = (val) => {
    setStartDate(val);
    setDateError('');
    if (endDate && val && new Date(val) > new Date(endDate)) {
      setEndDate('');
      setDuration('');
    } else {
      setDuration(computeDuration(val, endDate));
    }
  };

  const handleEndDate = (val) => {
    if (startDate && val && new Date(val) < new Date(startDate)) {
      setDateError('End date cannot be before the start date.');
      setEndDate('');
      setDuration('');
      return;
    }
    setDateError('');
    setEndDate(val);
    setDuration(computeDuration(startDate, val));
  };

  // Test configuration
  const [enableTest, setEnableTest] = useState(false);
  const [testDuration, setTestDuration] = useState('45');
  const [aptCount, setAptCount] = useState('10');
  const [verbalCount, setVerbalCount] = useState('5');
  const [codingCount, setCodingCount] = useState('3');
  const [passingScore, setPassingScore] = useState('60');

  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg('');

    if (!title || requiredSkills.length === 0) {
      setStatusMsg('❌ Role Title and Required Technical Skills are mandatory fields.');
      setIsLoading(false);
      return;
    }

    const payload = {
      company_id: companyId,
      company_name: currentUser?.name || '',
      title,
      domain,
      required_skills: requiredSkills.join(', '),
      work_mode: workMode,
      grad_year: parseInt(gradYear) || 2026,
      location: location || 'Coimbatore',
      duration: duration || '3 Months',
      start_date: startDate,
      end_date: endDate,
      stipend: parseFloat(stipend) || 0,
      openings: parseInt(openings) || 1,
      application_deadline: deadline,
      has_test: enableTest
    };

    try {
      const res = await fetch(`${baseUrl}/api/v1/company/internships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && (data.success || data.internship_id || data.id)) {
        const generatedId = data.internship_id || data.id;

        // If recruiter enabled screening test, call generate-test
        if (enableTest && generatedId) {
          setStatusMsg('⚙️ Generating AI screening test questions...');
          try {
            await fetch(`${baseUrl}/api/v1/company/generate-test`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': token },
              body: JSON.stringify({
                internship_id: generatedId,
                test_title: `${title} — Screening Test`,
                passing_score: parseInt(passingScore) || 60,
                duration_minutes: parseInt(testDuration) || 45,
                required_skills: requiredSkills.join(', '),
                aptitude_count: parseInt(aptCount) || 10,
                verbal_count: parseInt(verbalCount) || 5,
                coding_count: parseInt(codingCount) || 3
              })
            });
          } catch (_) { /* non-fatal */ }
        }

        setStatusMsg(`✓ Internship published successfully! (ID: #${generatedId})${enableTest ? ' Screening test generated.' : ''}`);
        setTimeout(() => onNavigate('dashboard'), 1400);
      } else {
        const detail = data?.error || data?.message || data?.detail || 'Database insert failed.';
        setStatusMsg(`❌ Failed to publish internship: ${detail}`);
      }
    } catch (e) {
      setStatusMsg(`❌ Connection error to Company Service (${baseUrl}).`);
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyle = { fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Post New Internship Opportunity</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Publish job specs for AI candidate matching</p>
        </div>
        <button onClick={() => onNavigate('dashboard')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>

      {statusMsg && (
        <div style={{ padding: '14px 20px', background: statusMsg.includes('❌') ? '#FEE2E2' : (statusMsg.includes('⚙️') ? '#FEF9C3' : '#DCFCE7'), border: '1px solid', borderColor: statusMsg.includes('❌') ? '#FCA5A5' : (statusMsg.includes('⚙️') ? '#FDE047' : '#86EFAC'), color: statusMsg.includes('❌') ? '#991B1B' : (statusMsg.includes('⚙️') ? '#713F12' : '#166534'), borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* ── Internship fields ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>ROLE TITLE *</label>
            <input type="text" required placeholder="e.g. Full-Stack Engineering Intern" value={title} onChange={e => setTitle(e.target.value)} className="input-field" />
          </div>
          <div>
            <label style={labelStyle}>DOMAIN / DISCIPLINE</label>
            <select value={domain} onChange={e => setDomain(e.target.value)} className="input-field">
              <option value="" disabled>Select Domain</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Cloud & Web Systems">Cloud & Web Systems</option>
              <option value="Data Science">Data Science</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>REQUIRED TECHNICAL SKILLS *</label>
            <SkillsSelector
              selectedSkills={requiredSkills}
              onChange={setRequiredSkills}
              placeholder="Search skills (e.g. React, Java, Python, AWS...)"
              maxSkills={20}
            />
          </div>
          <div>
            <label style={labelStyle}>WORK MODE</label>
            <select
              value={workMode}
              onChange={e => {
                const mode = e.target.value;
                setWorkMode(mode);
                if (mode === 'Remote') setLocation('Remote');
                else if (location === 'Remote') setLocation('');
              }}
              className="input-field"
            >
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="On-Site">On-Site</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>STIPEND (PER MONTH in ₹)</label>
            <input type="number" placeholder="e.g. 35000" value={stipend} onChange={e => setStipend(e.target.value)} className="input-field" />
          </div>
          <div>
            <label style={labelStyle}>LOCATION / CITY</label>
            <input
              type="text"
              placeholder={workMode === 'Remote' ? 'Remote' : 'e.g. Coimbatore'}
              value={location}
              readOnly={workMode === 'Remote'}
              onChange={e => { if (workMode !== 'Remote') setLocation(e.target.value); }}
              className="input-field"
              style={workMode === 'Remote' ? { background: 'rgba(99,102,241,0.06)', color: '#1D4ED8', fontWeight: 700, cursor: 'default' } : {}}
            />
          </div>
          <div>
            <label style={labelStyle}>OPEN POSITIONS</label>
            <input type="number" min="1" value={openings} onChange={e => setOpenings(e.target.value)} className="input-field" />
          </div>
          <div>
            <label style={labelStyle}>START DATE</label>
            <input type="date" value={startDate} onChange={e => handleStartDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label style={labelStyle}>END DATE</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={e => handleEndDate(e.target.value)}
              className="input-field"
              style={dateError ? { borderColor: '#DC2626' } : {}}
            />
            {dateError && (
              <p style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', fontWeight: 600 }}>
                ⚠ {dateError}
              </p>
            )}
          </div>
          <div>
            <label style={labelStyle}>APPLICATION DEADLINE</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="input-field" />
          </div>
          <div>
            <label style={labelStyle}>DURATION (auto-calculated)</label>
            <input
              type="text"
              readOnly
              value={duration || (startDate && endDate ? '' : 'Set start & end date')}
              className="input-field"
              style={{ background: 'rgba(99,102,241,0.06)', color: duration ? '#1D4ED8' : '#94A3B8', fontWeight: duration ? 700 : 400, cursor: 'default' }}
            />
          </div>
        </div>

        {/* ── Screening Test Config ── */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={enableTest} onChange={e => setEnableTest(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#6366f1' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FlaskConical size={16} color="#6366f1" /> Enable AI-Proctored Screening Test
            </span>
          </label>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '26px' }}>
            Shortlisted candidates must pass an AI-evaluated test before being considered.
          </p>

          {enableTest && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '16px', padding: '16px', background: 'rgba(99,102,241,0.06)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div>
                <label style={{ ...labelStyle, color: '#6366f1' }}>DURATION (mins)</label>
                <input type="number" min="10" max="180" value={testDuration} onChange={e => setTestDuration(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#6366f1' }}>APTITUDE Qs</label>
                <input type="number" min="1" max="30" value={aptCount} onChange={e => setAptCount(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#6366f1' }}>VERBAL Qs</label>
                <input type="number" min="0" max="20" value={verbalCount} onChange={e => setVerbalCount(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#6366f1' }}>CODING Qs</label>
                <input type="number" min="0" max="10" value={codingCount} onChange={e => setCodingCount(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#6366f1' }}>PASS SCORE (%)</label>
                <input type="number" min="1" max="100" value={passingScore} onChange={e => setPassingScore(e.target.value)} className="input-field" />
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary" style={{ marginTop: '8px', padding: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {isLoading ? 'Publishing...' : 'Publish Internship Opportunity'} <Send size={16} />
        </button>
      </form>
    </div>
  );
}
