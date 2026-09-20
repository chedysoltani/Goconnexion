import React from 'react';
import Link from 'next/link';

/** Marque GC + nom, comme sur le reste du site, avec l'orange d'action du tunnel. */
export default function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <Link href="/" className="flex min-h-[44px] items-center gap-2.5" aria-label="GoConnexions — accueil">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-extrabold tracking-tight"
        style={{
          background: 'linear-gradient(135deg, #fb923c, #f97316)',
          color: '#050e1f',
          boxShadow: '0 6px 16px -4px rgba(249,115,22,0.6)',
        }}
        aria-hidden="true"
      >
        GC
      </span>
      <span className={`text-[15px] font-bold tracking-tight ${tone === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        GoConnexions
      </span>
    </Link>
  );
}
