'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import FunnelCta from './FunnelCta';

/** En-tête volontairement minimal : logo, connexion, un seul CTA — pas de navigation à explorer. */
export default function JoinHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="gcj-header gcj-dark fixed inset-x-0 top-0 z-50" data-scrolled={scrolled}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/auth/login"
            className="flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Se connecter
          </Link>
          {/* Sur mobile, le CTA vit dans le hero puis dans la barre collante. */}
          <div className="hidden sm:block">
            <FunnelCta placement="header" size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
