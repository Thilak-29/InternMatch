import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

export default function StudentNotifications({ apiBaseUrl, currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const studentId = currentUser?.userId || currentUser?.user_id;

  useEffect(() => {
    if (studentId) {
      fetchNotifications();
    }
  }, [studentId]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/student/${studentId}/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {}
  };

  const markAsRead = async (id) => {
    setNotifications(notifications.map(n => (n.id === id || n.ID === id) ? { ...n, is_read: 1, IS_READ: 1 } : n));
    try {
      await fetch(`${apiBaseUrl}/api/v1/student/notifications/${id}/read`, { method: 'PUT' });
    } catch (e) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell size={24} color="#2563EB" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Notifications & Platform Alerts</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Read notifications automatically update style backed by Oracle DB.</p>
          </div>
        </div>
      </div>

      {notifications && notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => {
            const id = n.id || n.ID;
            const isRead = n.is_read === 1 || n.IS_READ === 1 || n.is_read === true;
            const msg = n.message || n.MESSAGE || 'Notification alert';
            const createdAt = n.created_at || n.CREATED_AT || 'Recently';

            return (
              <div
                key={id}
                onClick={() => markAsRead(id)}
                style={{
                  padding: '18px 24px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  background: isRead ? '#F8FAFC' : '#FFFFFF',
                  boxShadow: isRead ? 'none' : '0 2px 8px rgba(37,99,235,0.06)',
                  opacity: isRead ? 0.75 : 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isRead ? '#CBD5E1' : '#2563EB' }} />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: isRead ? 500 : 700, color: isRead ? '#64748B' : '#0F172A' }}>
                      {msg}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>{createdAt}</div>
                  </div>
                </div>

                {!isRead && (
                  <span className="badge badge-ai" style={{ fontSize: '0.7rem' }}>Click to Mark Read</span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          No notifications.
        </div>
      )}
    </div>
  );
}
