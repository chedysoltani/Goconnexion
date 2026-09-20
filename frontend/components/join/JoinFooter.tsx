import React from 'react';
import Link from 'next/link';
import { FOOTER_LINKS, SOCIAL_LINKS } from '@/lib/join/content';
import Logo from './Logo';

/** Footer volontairement minimal : l'objectif reste la conversion, pas une seconde navigation. */
export default function JoinFooter() {
  return (
    <footer className="gcj-dark bg-[var(--j-ink)] pb-28 pt-12 md:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
            Se connecter. Se faire connaître. Créer des opportunités.
          </p>
        </div>

        <nav aria-label="Liens essentiels">
          <ul className="flex flex-wrap gap-x-6 text-sm">
            {FOOTER_LINKS.map((l) => (
              <li key={l.label}>
                {l.href.startsWith('mailto:') ? (
                  <a href={l.href} className="inline-block py-3 text-slate-300 transition-colors hover:text-white">{l.label}</a>
                ) : (
                  <Link href={l.href} className="inline-block py-3 text-slate-300 transition-colors hover:text-white">{l.label}</Link>
                )}
              </li>
            ))}
            {SOCIAL_LINKS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-block py-3 text-slate-300 transition-colors hover:text-white">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 px-5 pt-6 sm:px-8">
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} GoConnexions. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
