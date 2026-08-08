import React, { useState, useEffect } from 'react';
import { FileCheck, CheckCircle, Code, HelpCircle } from 'lucide-react';

export default function GenerateTest({ apiBaseUrl, currentUser }) {
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState('');
  const [testTitle, setTestTitle] = useState('Proctored Technical & Aptitude Screening Test');
  const [passingScore, setPassingScore] = useState('70');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [aptitudeCount, setAptitudeCount] = useState('20');
  const [codingCount, setCodingCount] = useState('3');
  const [successMsg, setSuccessMsg] = useState('');

  const companyId = currentUser?.userId || currentUser?.user_id || 1;

  useEffect(() => {
    fetchCompanyInternships();
  }, [companyId]);

  const fetchCompanyInternships = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/company/${companyId}/internships`);
      if (res.ok) {
        const data = await res.json();
        setInternships(data);
        if (data.length > 0) setSelectedInternship(data[0].id);
      }
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/company/generate-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internship_id: selectedInternship ? parseInt(selectedInternship) : 1,
          test_title: testTitle,
          passing_score: parseInt(passingScore),
          duration_minutes: parseInt(durationMinutes)
        })
      });
      if (res.ok) {
        setSuccessMsg('Proctored screening test with 20 Aptitude Questions & 3 Coding Challenges generated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (e) {}
  };

  return (
    <div className="glass-card" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <FileCheck size={24} color="#2563EB" />
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Generate Screening Test</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select an internship and configure proctored test details.</p>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>SELECT INTERNSHIP FOR THIS TEST</label>
          <select className="input-field" value={selectedInternship} onChange={(e) => setSelectedInternship(e.target.value)}>
            {internships.length > 0 ? (
              internships.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.company_name}) - {job.location}
                </option>
              ))
            ) : (
              <option value="1">Full-Stack Software Engineering Intern (Google)</option>
            )}
          </select>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>TEST TITLE</label>
          <input type="text" required className="input-field" value={testTitle} onChange={(e) => setTestTitle(e.target.value)} />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>PASSING CUTOFF SCORE (%)</label>
          <input type="number" required className="input-field" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} placeholder="70" />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>DURATION (MINUTES)</label>
          <input type="number" required className="input-field" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder="60" />
        </div>

        <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
            <HelpCircle size={18} color="#2563EB" /> Aptitude Section
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Fixed: {aptitudeCount} Multiple Choice Aptitude Questions (Quantitative, Logical, Verbal Reasoning).
          </p>
        </div>

        <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
            <Code size={18} color="#7C3AED" /> Coding Section
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Fixed: {codingCount} Live Algorithmic & Data Structure Coding Challenges.
          </p>
        </div>

        <div style={{ gridColumn: 'span 2', marginTop: '12px' }}>
          <button type="submit" className="btn-primary" style={{ width: '100%', height: '46px', justifyContent: 'center' }}>
            Generate & Publish Screening Test
          </button>
        </div>
      </form>
    </div>
  );
}
