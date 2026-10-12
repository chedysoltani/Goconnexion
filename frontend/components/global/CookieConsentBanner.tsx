'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getConsent, setConsent } from '@/lib/tracking/consent';

/**
 * Bandeau minimal, affiché une seule fois tant qu'aucun choix n'a été fait. Ne conditionne que le
 * Pixel Meta (publicitaire) — Plausible tourne déjà, sans cookie, avant même ce choix.
 */
export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
  }, []);

  if (!visible) return null;

  const choose = (value: 'accepted' | 'rejected') => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Préférences de cookies"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 9998,
        maxWidth: 560,
        margin: '0 auto',
        background: '#0f172a',
        color: '#e2e8f0',
        borderRadius: 16,
        padding: '18px 20px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, flex: '1 1 260px', color: 'rgba(226,232,240,0.85)' }}>
        En plus de la mesure d’audience anonyme (qui ne dépend pas de ce choix), nous aimerions utiliser un cookie
        publicitaire pour savoir quelles campagnes fonctionnent. Vous pouvez refuser sans que ça change votre
        expérience du site.{' '}
        <Link href="/privacy#cookies" style={{ color: '#93c5fd', textDecoration: 'underline' }}>
          En savoir plus
        </Link>
        .
      </p>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => choose('rejected')}
          style={{
            padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(226,232,240,0.3)',
          }}
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={() => choose('accepted')}
          style={{
            padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: '#f97316', color: '#0f172a', border: 'none',
          }}
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
