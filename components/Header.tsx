'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

const navLinks = [
  { label: 'Pourquoi GoConnexions', href: '#problem' },
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Comment ça marche', href: '#how-it-works' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'nav-scrolled' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <AppLogo
              size={90}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="drop-shadow-lg hover:drop-shadow-xl transition-all duration-300"
            />
          </div>
          <span className={`font-sans font-700 text-lg tracking-tight transition-colors ${
            scrolled ? 'text-foreground group-hover:text-accent' : 'text-white group-hover:text-accent-light'
          }`}>
            GoConnexions
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks?.map((link) => (
            <a
              key={link?.href}
              href={link?.href}
              className={`text-[13px] font-medium tracking-wide transition-colors ${
                scrolled ? 'text-muted hover:text-foreground' : 'text-white/90 hover:text-white'
              }`}
            >
              {link?.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a
            href="/auth/login"
            className={`hidden sm:inline-flex items-center gap-2 text-[13px] font-semibold transition-colors ${
                scrolled ? 'text-muted hover:text-accent' : 'text-white/90 hover:text-white'
              }`}
          >
            Connexion
          </a>
          <a
            href="/auth/select-role"
            className="btn-primary px-5 py-2.5 rounded-full text-[13px] inline-flex items-center gap-2"
          >
            S'inscrire
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}