import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

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
  const [requiredSkills, setRequiredSkills] = useState('');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [gradYear, setGradYear] = useState('2026');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('3 Months');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stipend, setStipend] = useState('');
  const [openings, setOpenings] = useState('1');
  const [deadline, setDeadline] = useState('');

  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg('');

    if (!title || !requiredSkills) {
      setStatusMsg('❌ Role Title and Required Technical Skills are mandatory fields.');
      setIsLoading(false);
      return;
    }

    const payload = {
      company_id: companyId,
      company_name: currentUser?.name || '',
      title,
      domain,
      required_skills: requiredSkills,
      work_mode: workMode,
      grad_year: parseInt(gradYear) || 2026,
      location: location || 'Coimbatore',
      duration: duration || '3 Months',
      start_date: startDate,
      end_date: endDate,
      stipend: parseFloat(stipend) || 0,
      openings: parseInt(openings) || 1,
      application_deadline: deadline
    };

    try {
      const res = await fetch(`${baseUrl}/api/v1/company/internships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && (data.success || data.internship_id || data.id)) {
        const generatedId = data.internship_id || data.id;
        setStatusMsg(`✓ Internship published successfully in Oracle Database! (ID: #${generatedId})`);
        setTimeout(() => onNavigate('dashboard'), 1200);
      } else {
        const detail = data?.error || data?.message || data?.detail || 'Database insert failed.';
        setStatusMsg(`❌ Failed to publish internship: ${detail}`);
      }
    } catch (e) {
      setStatusMsg(`❌ Failed to publish internship: Connection error to Company Service (${baseUrl}).`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Post New Internship Opportunity
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Publish job specifications for AI candidate matching
          </p>
        </div>

        <button onClick={() => onNavigate('dashboard')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>

      {statusMsg && (
        <div style={{ padding: '14px 20px', background: statusMsg.includes('❌') ? '#FEE2E2' : '#DCFCE7', border: '1px solid', borderColor: statusMsg.includes('❌') ? '#FCA5A5' : '#86EFAC', color: statusMsg.includes('❌') ? '#991B1B' : '#166534', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>ROLE TITLE *</label>
            <input type="text" required placeholder="e.g. Full-Stack Engineering Intern" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>DOMAIN / DISCIPLINE</label>
            <select value={domain} onChange={(e) => setDomain(e.target.value)} className="input-field">
              <option value="" disabled>Select Domain</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Cloud & Web Systems">Cloud & Web Systems</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>REQUIRED TECHNICAL SKILLS (Comma Separated) *</label>
            <input type="text" required placeholder="e.g. React, Java, Spring Boot, SQL, Python" value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} className="input-field" />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>WORK MODE</label>
            <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className="input-field">
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="On-Site">On-Site</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>STIPEND (PER MONTH in ₹)</label>
            <input type="number" placeholder="e.g. 35000" value={stipend} onChange={(e) => setStipend(e.target.value)} className="input-field" />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>LOCATION / CITY</label>
            <input type="text" placeholder="e.g. Coimbatore" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>OPEN POSITIONS</label>
            <input type="number" value={openings} onChange={(e) => setOpenings(e.target.value)} className="input-field" />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary" style={{ marginTop: '12px', padding: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {isLoading ? 'Publishing...' : 'Publish Internship Opportunity'} <Send size={16} />
        </button>
      </form>
    </div>
  );
}
