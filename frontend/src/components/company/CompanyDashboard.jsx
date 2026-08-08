import React, { useState, useEffect } from 'react';
import { Briefcase, Users, UserCheck, Calendar, Send, Award } from 'lucide-react';

export default function CompanyDashboard({ apiBaseUrl, currentUser }) {
  const [stats, setStats] = useState({
    total_posted: 0,
    total_applicants: 0,
    shortlisted: 0,
    interviews_scheduled: 0,
    offers_sent: 0,
    hires_count: 0,
    posted_internships: []
  });

  const companyId = currentUser?.userId || currentUser?.user_id;

  useEffect(() => {
    if (companyId) {
      fetchStats();
    }
  }, [companyId]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/company/${companyId}/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {}
  };

  const kpis = [
    { label: 'Total Internships Posted', value: stats.total_posted || 0, icon: Briefcase, color: '#2563EB', bg: '#DBEAFE' },
    { label: 'Total Applicants', value: stats.total_applicants || 0, icon: Users, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Shortlisted Candidates', value: stats.shortlisted || 0, icon: UserCheck, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Interviews Scheduled', value: stats.interviews_scheduled || 0, icon: Calendar, color: '#2563EB', bg: '#E0F2FE' },
    { label: 'Offers Sent', value: stats.offers_sent || 0, icon: Send, color: '#059669', bg: '#D1FAE5' },
    { label: 'Hired Students', value: stats.hires_count || 0, icon: Award, color: '#166534', bg: '#DCFCE7' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                <Icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{kpi.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
          Active Posted Internships
        </h2>

        {stats.posted_internships && stats.posted_internships.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.posted_internships.map((job, idx) => {
              const title = job.title || job.TITLE || 'Internship';
              const company = job.company_name || job.COMPANY_NAME || 'Company';
              const mode = job.work_mode || job.WORK_MODE || 'Hybrid';
              const location = job.location || job.LOCATION || 'Location';
              const stipend = job.stipend || job.STIPEND || 25000;
              const openings = job.openings || job.OPENINGS || 1;

              return (
                <div key={job.id || job.ID || idx} style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {company} • {mode} • {location} • ₹{stipend}/mo • Openings: {openings}
                    </div>
                  </div>
                  <span className="badge badge-auth">Active</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No internships posted yet. Use the "Post Internship" tab to publish your first role.
          </div>
        )}
      </div>
    </div>
  );
}
