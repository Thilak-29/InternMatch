import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, FileText, Code, Award, Send } from 'lucide-react';

export default function CandidateTimeline({ candidateStatus, testStatus }) {
  const isRegistered = true;
  const isResumeVerified = true;
  const isGitHubAnalyzed = true;
  const isAssessmentCompleted = testStatus === 'COMPLETED';
  const isInterviewCleared = candidateStatus === 'INTERVIEW' || candidateStatus === 'ACCEPTED';
  const isOfferIssued = candidateStatus === 'ACCEPTED';

  const stages = [
    { label: "Registered", status: isRegistered ? "done" : "pending", icon: ShieldCheck },
    { label: "Resume Verified", status: isResumeVerified ? "done" : "pending", icon: FileText },
    { label: "GitHub Analyzed", status: isGitHubAnalyzed ? "done" : "pending", icon: Code },
    { label: "Assessment", status: isAssessmentCompleted ? "done" : "pending", icon: Award },
    { label: "Interview", status: isInterviewCleared ? "done" : "pending", icon: CheckCircle2 },
    { label: "Offer Letter", status: isOfferIssued ? "done" : "pending", icon: Send }
  ];

  return (
    <div className="neo-card" style={{ padding: '16px 20px', background: '#fff' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', color: 'var(--text-muted)' }}>
        📍 Candidate Hiring Journey Timeline
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = stage.status === 'done';

          return (
            <React.Fragment key={idx}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isDone ? 'var(--color-green)' : '#eee',
                  border: '2px solid #111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  {isDone ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isDone ? '#111' : 'var(--text-muted)' }}>
                  {stage.label}
                </span>
              </div>

              {idx < stages.length - 1 && (
                <div style={{ flex: 1, minWidth: '16px', height: '3px', background: isDone ? '#111' : '#ccc' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
