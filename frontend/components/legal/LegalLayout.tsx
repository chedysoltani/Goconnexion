import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  updatedAt?: string; // libellé déjà formaté, ex. "7 octobre 2026"
  toc?: ReadonlyArray<{ id: string; label: string }>;
  children: React.ReactNode;
}

/**
 * Coquille commune à /terms, /privacy, /a-propos et /faq : même en-tête minimal que /pricing (retour à l'accueil,
 * connexion), un sommaire d'ancres, puis le contenu. Pas d'animation : des pages qu'on lit, pas
 * qu'on parcourt.
 */
export default function LegalLayout({ title, updatedAt, toc, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      <header className="fixed top-0 left-0 right-0 z-50 topbar-glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] font-semibold transition-colors py-2 -my-2"
            style={{ color: '#64748b' }}
          >
            <ArrowLeft size={15} />
            GoConnexions
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors"
            style={{ color: '#64748b' }}
          >
            Connexion
          </Link>
        </div>
      </header>

      <main className="pt-28 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[2rem] sm:text-[2.5rem] font-bold tracking-tight leading-tight mb-3" style={{ color: '#0f172a' }}>
            {title}
          </h1>
          {updatedAt
            ? <p className="text-sm mb-10" style={{ color: '#94a3b8' }}>Dernière mise à jour : {updatedAt}</p>
            : <div className="mb-8" />}

          {toc && <nav aria-label="Sommaire" className="mb-12 rounded-2xl border p-5" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>Sommaire</p>
            <ol className="grid gap-1.5 sm:grid-cols-2">
              {toc.map((item, i) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="inline-block py-1.5 text-[14px] hover:underline" style={{ color: '#3b82f6' }}>
                    {i + 1}. {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>}

          <article
            className="space-y-10 text-[15px] leading-relaxed [&_h2]:text-[1.3rem] [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:scroll-mt-28 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1.5 [&_a]:underline [&_strong]:font-semibold"
            style={{ color: '#334155' }}
          >
            {children}
          </article>

          <p className="mt-14 pt-8 border-t text-sm" style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}>
            Une question sur cette page ?{' '}
            <a href="mailto:bonjour@goconnexions.com" className="underline" style={{ color: '#3b82f6' }}>
              bonjour@goconnexions.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
