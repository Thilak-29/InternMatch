import React, { useEffect, useRef } from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

/**
 * ConfirmLogoutModal — Reusable Confirmation Dialog for User Logout
 *
 * Features:
 * - Clean, modern glassmorphism dialog styled for InternMatch AI design system.
 * - Backdrop click & ESC key support to close without logging out.
 * - Accessible with proper dialog roles, keyboard focus, and explicit button elements.
 * - Double-click protection with loading state during logout execution.
 * - Destructive action styling on the confirm button.
 */
export default function ConfirmLogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false
}) {
  const cancelButtonRef = useRef(null);

  // Focus cancel button on open for keyboard accessibility & prevention of accidental confirmation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoggingOut) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLoggingOut]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoggingOut) {
      onClose();
    }
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    if (isLoggingOut) return;
    onConfirm();
  };

  return (
    <div
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      aria-describedby="logout-modal-desc"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '420px',
          width: '100%',
          padding: '28px 24px 24px 24px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Close Icon (Top Right) */}
        <button
          onClick={onClose}
          disabled={isLoggingOut}
          title="Close dialog"
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            cursor: isLoggingOut ? 'not-allowed' : 'pointer',
            color: '#94A3B8',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            opacity: isLoggingOut ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoggingOut) {
              e.currentTarget.style.background = '#F1F5F9';
              e.currentTarget.style.color = '#334155';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoggingOut) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94A3B8';
            }
          }}
        >
          <X size={18} />
        </button>

        {/* Header Warning Icon Badge */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#FEE2E2',
            border: '4px solid #FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#DC2626',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)'
          }}
        >
          <LogOut size={26} style={{ marginLeft: '2px' }} />
        </div>

        {/* Modal Title */}
        <h3
          id="logout-modal-title"
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em'
          }}
        >
          Confirm Logout
        </h3>

        {/* Modal Description */}
        <p
          id="logout-modal-desc"
          style={{
            fontSize: '0.92rem',
            color: '#64748B',
            lineHeight: 1.5,
            margin: '0 0 24px 0',
            maxWidth: '340px'
          }}
        >
          Are you sure you want to logout? You will need to login again to access your account.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          {/* Cancel Button */}
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            style={{
              flex: 1,
              padding: '11px 18px',
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              opacity: isLoggingOut ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.borderColor = '#94A3B8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }
            }}
          >
            Cancel
          </button>

          {/* Logout Button (Destructive) */}
          <button
            type="button"
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            style={{
              flex: 1,
              padding: '11px 18px',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              background: isLoggingOut
                ? '#94A3B8'
                : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: '#FFFFFF',
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isLoggingOut
                ? 'none'
                : '0 4px 12px rgba(220, 38, 38, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isLoggingOut ? (
              <span>Logging out...</span>
            ) : (
              <>
                <LogOut size={16} />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
