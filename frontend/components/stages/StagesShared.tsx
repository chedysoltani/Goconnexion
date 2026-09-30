'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

/* ─── Constantes ────────────────────────────────────────────── */

export const DOMAINS = [
  'Informatique',
  'Marketing',
  'Finance',
  'Design',
  'Communication',
  'Commerce/Vente',
  'Ressources humaines',
  'Autre',
];

export const MODES = [
  { id: 'ON_SITE', label: 'Sur place' },
  { id: 'REMOTE',  label: 'À distance' },
  { id: 'HYBRID',  label: 'Hybride' },
];

export const modeLabel = (id: string) => MODES.find(m => m.id === id)?.label ?? id;

export const APPLICATION_STATUS: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'En attente', color: '#f59e0b' },
  REVIEWED: { label: 'Consultée',  color: '#3b82f6' },
  ACCEPTED: { label: 'Acceptée',   color: '#10b981' },
  REJECTED: { label: 'Refusée',    color: '#ef4444' },
};

export const CV_MAX_SIZE = 5 * 1024 * 1024;

/* ─── Design tokens (alignés sur /marketplace) ──────────────── */

export const T = {
  bg: '#09090B',
  card: 'rgba(15,23,42,0.7)',
  border: 'rgba(255,255,255,0.07)',
  text: '#f1f5f9',
  muted: '#64748b',
  subtle: '#475569',
  accent: '#2563eb',
  accentLight: '#3b82f6',
  gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
};

export const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10, boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: T.text, fontSize: 14, outline: 'none', fontFamily: 'inherit',
};

export const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6,
};

export const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '11px 20px', borderRadius: 11, border: 'none', cursor: 'pointer',
  background: T.gradient, color: '#fff', fontWeight: 700, fontSize: 14,
  boxShadow: '0 4px 16px rgba(37,99,235,0.35)', textDecoration: 'none',
};

export const secondaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '8px 14px', borderRadius: 9, cursor: 'pointer',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#cbd5e1', fontWeight: 600, fontSize: 13, textDecoration: 'none',
};

export const cardStyle: React.CSSProperties = {
  background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
};

/* ─── Helpers ───────────────────────────────────────────────── */

export function formatDate(d?: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Utilisateur connu côté UI (non sensible) — évite un appel authentifié sur les pages publiques. */
export function useStoredUser() {
  const [user, setUser] = useState<{ id: string; role?: string; firstName?: string } | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
    setReady(true);
  }, []);
  return { user, ready };
}

/** Ouvre le CV via la route protégée (cookie de session), jamais via /uploads. */
export async function openCv(applicationId: string) {
  // Onglet ouvert avant l'appel async pour ne pas être bloqué par le navigateur
  const win = window.open('', '_blank');
  try {
    const blob = await api.internships.getCv(applicationId);
    const url = URL.createObjectURL(blob);
    if (win) {
      win.location.href = url;
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CV.pdf';
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err: any) {
    win?.close();
    alert(err.message || "Impossible d'ouvrir le CV");
  }
}

/* ─── Composants ────────────────────────────────────────────── */

export function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: `${color}1f`, color, border: `1px solid ${color}40`, whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const meta = APPLICATION_STATUS[status] ?? { label: status, color: '#6b7280' };
  return <Badge color={meta.color}>{meta.label}</Badge>;
}

/** Métadonnées d'une offre : lieu, mode, durée, rémunération. */
export function OfferMeta({ offer }: { offer: any }) {
  const items = [
    offer.location && `📍 ${offer.location}`,
    `🏢 ${modeLabel(offer.mode)}`,
    offer.durationMonths && `⏱ ${offer.durationMonths} mois`,
    offer.isPaid ? '💰 Rémunéré' : 'Non rémunéré',
  ].filter(Boolean) as string[];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: 12, color: '#94a3b8' }}>
      {items.map(i => <span key={i}>{i}</span>)}
    </div>
  );
}

export function EmptyState({ emoji, title, text, action }: { emoji: string; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 16px' }}>
      <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.4 }}>{emoji}</div>
      <h3 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 8px', color: T.text }}>{title}</h3>
      <p style={{ color: T.subtle, margin: '0 0 24px', fontSize: 14 }}>{text}</p>
      {action}
    </div>
  );
}

export function SkeletonList({ count = 3, height = 120 }: { count?: number; height?: number }) {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ height, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', animation: 'stagesPulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  );
}

const NAV_LINKS = [
  { href: '/stages',                  label: 'Offres',            key: 'list' },
  { href: '/stages/mes-candidatures', label: 'Mes candidatures',  key: 'applications', auth: true },
  { href: '/stages/mes-offres',       label: 'Mes offres',        key: 'offers',       auth: true },
];

export function StagesLayout({ active, children }: { active?: string; children: React.ReactNode }) {
  const { user, ready } = useStoredUser();

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(9,9,11,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', minHeight: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: '#fff', textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ color: T.accent }}>Go</span>Connexions
          </Link>
          <div className="stages-nav-links" style={{ display: 'flex', gap: 4, flex: 1, overflowX: 'auto' }}>
            {NAV_LINKS.filter(l => !l.auth || user).map(l => (
              <Link key={l.key} href={l.href} style={{
                padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                textDecoration: 'none',
                color: active === l.key ? '#fff' : T.muted,
                background: active === l.key ? 'rgba(37,99,235,0.18)' : 'transparent',
              }}>
                {l.label}
              </Link>
            ))}
          </div>
          {ready && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <Link href="/stages/nouvelle" className="stages-hide-mobile" style={{
                ...secondaryBtn, color: T.accentLight, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
              }}>
                + Publier une offre
              </Link>
              <Link href={user ? '/dashboard' : '/auth/login?redirect=/stages'} style={{ ...primaryBtn, padding: '8px 14px', fontSize: 13, boxShadow: 'none' }}>
                {user ? 'Dashboard' : 'Connexion'}
              </Link>
            </div>
          )}
        </div>
      </nav>

      {children}

      <style>{`
        @keyframes stagesPulse { 0%,100%{opacity:.5} 50%{opacity:.8} }
        .stages-nav-links::-webkit-scrollbar { display: none; }
        .stages-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 640px) {
          .stages-hide-mobile { display: none !important; }
          .stages-form-grid { grid-template-columns: 1fr; }
          .stages-hero-title { font-size: 30px !important; }
        }
        select option { background: #0f172a; color: #f1f5f9; }
      `}</style>
    </div>
  );
}
