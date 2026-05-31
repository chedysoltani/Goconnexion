'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import AppLogo from '@/components/ui/AppLogo';

const navLinks = [
  { label: 'Pourquoi GoConnexion', href: '#problem' },
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Comment ça marche', href: '#how-it-works' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'nav-scrolled' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-[68px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <AppLogo
              size={82}
              className="drop-shadow-md group-hover:drop-shadow-lg transition-all duration-300"
            />
          </motion.div>
          <span
            className={`font-bold text-[17px] tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-200'
            }`}
          >
            GoConnexion
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setActiveLink(link.href)}
              className={`relative px-4 py-2 text-[13px] font-medium tracking-wide rounded-lg transition-colors duration-200 group ${
                scrolled
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-white/75 hover:text-white'
              }`}
            >
              {link.label}
              <span
                className={`absolute bottom-1 left-4 right-4 h-px rounded-full transition-all duration-300 origin-left ${
                  activeLink === link.href ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                }`}
                style={{ background: scrolled ? '#3b82f6' : 'white' }}
              />
            </motion.a>
          ))}
        </nav>

        {/* CTA group */}
        <div className="flex items-center gap-2">
          <motion.a
            href="/auth/login"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
              scrolled
                ? 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Connexion
          </motion.a>

          <motion.a
            href="/auth/select-role"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.42, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(59,130,246,0.45)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
              boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
            }}
          >
            S&apos;inscrire
            <motion.svg
              width="12" height="12" viewBox="0 0 14 14" fill="none"
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </motion.a>

          {/* Mobile toggle */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
            style={{
              color: scrolled ? '#1e293b' : '#fff',
              background: scrolled ? 'transparent' : 'rgba(255,255,255,0.1)',
            }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <motion.svg
              width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              animate={{ rotate: menuOpen ? 90 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </motion.svg>
          </motion.button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden"
            style={{
              background: 'rgba(248,250,252,0.98)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid #e2e8f0',
              boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
            }}
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-150"
                  style={{ color: '#475569' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                <motion.a
                  href="/auth/login"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="px-4 py-3 rounded-xl text-[14px] font-semibold text-center transition-colors"
                  style={{ color: '#475569' }}
                >
                  Connexion
                </motion.a>
                <motion.a
                  href="/auth/select-role"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26 }}
                  className="px-4 py-3.5 rounded-2xl text-[14px] font-bold text-white text-center"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
                >
                  Commencer gratuitement →
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
