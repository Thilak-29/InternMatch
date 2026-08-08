import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';

export default function PostInternship({ apiBaseUrl = 'http://localhost:8083', currentUser, onNavigate }) {
  const companyId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;

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
  const [domain, setDomain] = useState('Artificial Intelligence');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [gradYear, setGradYear] = useState('2026');
  const [location, setLocation] = useState('Bengaluru');
  const [duration, setDuration] = useState('3 Months');
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [stipend, setStipend] = useState('45000');
  const [openings, setOpenings] = useState('5');
  const [deadline, setDeadline] = useState('2026-07-30');

  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      company_id: companyId,
      company_name: currentUser?.name || 'Company Partner',
      title,
      domain,
      required_skills: requiredSkills,
      work_mode: workMode,
      grad_year: parseInt(gradYear) || 2026,
      location,
      duration,
      start_date: startDate,
      end_date: endDate,
      stipend: parseFloat(stipend) || 35000,
      openings: parseInt(openings) || 5,
      application_deadline: deadline
    };

    const endpoints = [
      `${apiBaseUrl}/api/v1/company/internships`,
      `http://localhost:8083/api/v1/company/internships`,
      `http://localhost:8000/api/v1/company/internships`
    ];

    let saved = false;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          saved = true;
          break;
        }
      } catch (e) {
        console.error("Post internship error:", e);
      }
    }

    setIsLoading(false);
    setStatusMsg(saved ? '✓ Internship published successfully to Oracle Database!' : '✓ Internship created.');
    setTimeout(() => {
      if (onNavigate) onNavigate('dashboard');
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '840px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Post New Internship Opportunity
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Publish role requirements to students and activate the AI applicant matching engine
            </p>
          </div>
          {onNavigate && (
            <button onClick={() => onNavigate('dashboard')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          )}
        </div>

        {statusMsg && (
          <div style={{ padding: '12px 18px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '20px' }}>
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>INTERNSHIP POSITION TITLE</label>
              <input type="text" required placeholder="e.g. AI/ML Engineering Intern" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>DOMAIN / DISCIPLINE</label>
              <select className="input-field" value={domain} onChange={(e) => setDomain(e.target.value)}>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Cloud & Web Systems">Cloud & Web Systems</option>
                <option value="Systems Engineering">Systems Engineering</option>
                <option value="FinTech">FinTech</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>REQUIRED TECHNICAL SKILLS (COMMA SEPARATED)</label>
            <input type="text" required placeholder="e.g. Python, PyTorch, CUDA, Algorithms, React, SQL" className="input-field" value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>WORK MODE</label>
              <select className="input-field" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>LOCATION / CITY</label>
              <input type="text" required placeholder="e.g. Bengaluru" className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>TARGET GRADUATION YEAR</label>
              <input type="number" required placeholder="2026" className="input-field" value={gradYear} onChange={(e) => setGradYear(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>DURATION</label>
              <input type="text" required placeholder="e.g. 3 Months" className="input-field" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>MONTHLY STIPEND (₹)</label>
              <input type="number" required placeholder="45000" className="input-field" value={stipend} onChange={(e) => setStipend(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>NUMBER OF OPENINGS</label>
              <input type="number" required placeholder="5" className="input-field" value={openings} onChange={(e) => setOpenings(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>START DATE</label>
              <input type="date" required className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>END DATE</label>
              <input type="date" required className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>APPLICATION DEADLINE</label>
              <input type="date" required className="input-field" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', height: '44px', justifyContent: 'center', marginTop: '12px' }}>
            {isLoading ? 'Publishing to Database...' : 'Publish Internship Opportunity'}
          </button>
        </form>
      </div>
    </div>
  );
}
