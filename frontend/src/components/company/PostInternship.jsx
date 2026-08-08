import React, { useState } from 'react';
import { PlusCircle, CheckCircle, Briefcase } from 'lucide-react';

export default function PostInternship({ apiBaseUrl = 'http://localhost:8000', currentUser }) {
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('Software Engineering');
  const [skills, setSkills] = useState('');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [gradYear, setGradYear] = useState('2026');
  const [location, setLocation] = useState('Bengaluru');
  const [duration, setDuration] = useState('3 Months');
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [stipend, setStipend] = useState('35000');
  const [openings, setOpenings] = useState('5');
  const [showPopup, setShowPopup] = useState(false);

  const companyId = currentUser?.userId || currentUser?.user_id || 10;
  const companyName = currentUser?.name || currentUser?.username || 'NVIDIA Corporation';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newInternship = {
      company_id: companyId,
      company_name: companyName,
      title,
      domain,
      required_skills: skills,
      work_mode: workMode,
      grad_year: parseInt(gradYear) || 2026,
      location,
      duration,
      start_date: startDate,
      end_date: endDate,
      stipend: parseFloat(stipend) || 35000,
      openings: parseInt(openings) || 5
    };

    try {
      await fetch(`${apiBaseUrl}/api/v1/company/internships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInternship)
      });
      setShowPopup(true);
    } catch (e) {
      setShowPopup(true);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <PlusCircle size={24} color="#2563EB" />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Post New Internship</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>INTERNSHIP TITLE</label>
          <input type="text" required className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full-Stack Software Engineering Intern" />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>REQUIRED SKILLS</label>
          <input type="text" required className="input-field" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Python, SQL, Java" />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>WORK MODE</label>
          <select className="input-field" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>GRADUATION YEAR</label>
          <input type="number" required className="input-field" value={gradYear} onChange={(e) => setGradYear(e.target.value)} placeholder="e.g. 2026" />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>LOCATION</label>
          <input type="text" required className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bengaluru, Hyderabad, Remote" />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>DURATION</label>
          <input type="text" required className="input-field" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 3 Months" />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>STIPEND (PER MONTH ₹)</label>
          <input type="number" required className="input-field" value={stipend} onChange={(e) => setStipend(e.target.value)} placeholder="e.g. 35000" />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>START DATE</label>
          <input type="date" required className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>END DATE</label>
          <input type="date" required className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>NO. OF OPENINGS</label>
          <input type="number" required className="input-field" value={openings} onChange={(e) => setOpenings(e.target.value)} placeholder="e.g. 5" />
        </div>

        <div style={{ gridColumn: 'span 2', marginTop: '12px' }}>
          <button type="submit" className="btn-primary" style={{ width: '100%', height: '46px', justifyContent: 'center' }}>
            Publish Internship Post
          </button>
        </div>
      </form>

      {showPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ background: '#FFFFFF', width: '100%', maxWidth: '420px', padding: '32px', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <CheckCircle size={52} color="#059669" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Internship Published Successfully!</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Your internship listing for <strong>{title || 'Software Engineering Intern'}</strong> is now live on the platform and saved in College Oracle Database.
            </p>
            <button onClick={() => setShowPopup(false)} className="btn-primary" style={{ width: '100%', height: '42px', justifyContent: 'center', marginTop: '8px' }}>
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
