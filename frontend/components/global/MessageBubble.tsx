'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGlobalSocket } from '@/context/GlobalSocketContext';

const ROLE_COLOR: Record<string, string> = {
  FREELANCER:   '#3b82f6',
  ENTREPRENEUR: '#8b5cf6',
  USER:         '#2563eb',
};

function avatarColor(role: string) {
  return ROLE_COLOR[(role ?? 'USER').toUpperCase()] ?? '#2563eb';
}

export default function MessageBubble() {
  const { messageBubble, dismissBubble } = useGlobalSocket();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate in/out when bubble changes
  useEffect(() => {
    if (messageBubble) {
      setVisible(true);
      setProgress(100);
      progressRef.current = setInterval(() => {
        setProgress(p => {
          const next = p - 2; // 100 steps × 50ms = 5 000ms
          if (next <= 0) {
            clearInterval(progressRef.current!);
            return 0;
          }
          return next;
        });
      }, 50);
    } else {
      setVisible(false);
      if (progressRef.current) clearInterval(progressRef.current);
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [messageBubble?.id]);  // eslint-disable-line react-hooks/exhaustive-deps

  if (!messageBubble) return null;

  const { senderFirstName, senderLastName, preview, senderRole } = messageBubble;
  const initials = `${senderFirstName[0] ?? ''}${senderLastName[0] ?? ''}`.toUpperCase();
  const color = avatarColor(senderRole);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 24,
        zIndex: 9998,
        width: 320,
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.9)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(15,23,42,0.16), 0 2px 8px rgba(15,23,42,0.08)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: '#f1f5f9' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            transition: 'width 50ms linear',
          }} />
        </div>

        <div style={{ padding: '14px 16px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {/* Avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${color}, ${color}bb)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 13,
          }}>
            {initials}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                {senderFirstName} {senderLastName}
              </p>
              {/* Close */}
              <button
                onClick={dismissBubble}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#94a3b8', lineHeight: 1 }}
                aria-label="Fermer"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p style={{ margin: '0 0 10px', fontSize: 12, color: '#64748b', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {preview || '…'}
            </p>

            {/* Reply button */}
            <button
              onClick={dismissBubble}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 8,
                background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
                boxShadow: `0 2px 8px ${color}40`,
              }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Répondre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
