'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/* ─── Design tokens ─────────────────────────────────────────── */
const G = {
  bg: '#09090B',
  surface: '#0F172A',
  surfaceAlt: '#0B1526',
  accent: '#2563EB',
  accentHover: '#1D4ED8',
  accentMuted: 'rgba(37,99,235,0.12)',
  accentBorder: 'rgba(37,99,235,0.25)',
  text: '#F0F6FF',
  muted: 'rgba(219,234,254,0.5)',
  mutedMed: 'rgba(219,234,254,0.75)',
  border: 'rgba(147,197,253,0.1)',
};

/* ─── RevealBox — scroll-triggered fade-up ───────────────────── */
function RevealBox({ delay = 0, children, style, className }: { delay?: number; children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms`;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        obs.disconnect();
      }
    }, { threshold: 0.06 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return <div ref={ref} style={style} className={className}>{children}</div>;
}

/* ─── Navbar ─────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Comment ça marche', href: '#how-it-works' },
    { label: 'Prix', href: '#pricing' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'background 0.4s, border-color 0.4s, backdrop-filter 0.4s',
      background: scrolled ? 'rgba(9,9,11,0.88)' : 'transparent',
      borderBottom: scrolled ? `1px solid ${G.border}` : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: G.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '-0.5px' }}>GC</span>
          </div>
          <span style={{ color: G.text, fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>GoConnexions</span>
        </Link>

        <div className="gc-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {navLinks.map(l => (
            <a key={l.label} href={l.href} style={{ color: G.muted, fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = G.text)}
              onMouseLeave={e => (e.currentTarget.style.color = G.muted)}>
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/auth/login" className="gc-desktop-nav" style={{ color: G.mutedMed, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            Connexion
          </Link>
          <Link href="/auth/select-role" className="gc-desktop-nav" style={{
            padding: '9px 20px', borderRadius: 24, background: G.accent, color: '#fff',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 0 0 0 rgba(37,99,235,0)', transition: 'background 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = G.accentHover; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = G.accent; e.currentTarget.style.boxShadow = '0 0 0 0 rgba(37,99,235,0)'; }}>
            Commencer gratuitement
          </Link>
          <button className="gc-hamburger" onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: G.text, padding: 6 }} aria-label="Menu">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: 'rgba(9,9,11,0.98)', borderTop: `1px solid ${G.border}`, padding: '16px 24px 24px' }}>
          {navLinks.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', color: G.text, fontSize: 16, fontWeight: 500, padding: '12px 0', textDecoration: 'none', borderBottom: `1px solid ${G.border}` }}>
              {l.label}
            </a>
          ))}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/auth/login" onClick={() => setMenuOpen(false)}
              style={{ textAlign: 'center', padding: '12px', borderRadius: 12, border: `1px solid ${G.border}`, color: G.text, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Connexion
            </Link>
            <Link href="/auth/select-role" onClick={() => setMenuOpen(false)}
              style={{ textAlign: 'center', padding: '12px', borderRadius: 12, background: G.accent, color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Commencer gratuitement
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */
function Hero() {
  const avatarColors = ['#4a90d9', '#e67e22', '#9b59b6', '#0ea5e9', '#e74c3c'];
  return (
    <section style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${G.border} 1px, transparent 1px), linear-gradient(90deg, ${G.border} 1px, transparent 1px)`, backgroundSize: '60px 60px', opacity: 0.35, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 100px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <RevealBox delay={0}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 100, background: G.accentMuted, border: `1px solid ${G.accentBorder}`, marginBottom: 32 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: G.accent, display: 'inline-block', animation: 'gc-pulse 2s ease-in-out infinite' }} />
            <span style={{ color: G.accent, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Accès Anticipé Ouvert · 2 400+ membres</span>
          </div>
        </RevealBox>

        <RevealBox delay={80}>
          <h1 style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', color: G.text, margin: '0 0 24px' }}>
            Construisez des connexions{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 400, color: G.accent, fontFamily: 'Georgia, serif' }}>
              qui ont vraiment du sens
            </em>
          </h1>
        </RevealBox>

        <RevealBox delay={160}>
          <p style={{ fontSize: 18, color: G.muted, lineHeight: 1.65, maxWidth: 580, margin: '0 auto 44px' }}>
            GoConnexions vous aide à entretenir vos relations professionnelles clés, au bon moment — sans effort, sans spam, sans algorithme.
          </p>
        </RevealBox>

        <RevealBox delay={240}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <Link href="/auth/select-role" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '15px 32px', borderRadius: 100, background: G.accent,
              color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(37,99,235,0.35)', transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(37,99,235,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(37,99,235,0.35)'; }}>
              Commencer gratuitement
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <a href="#how-it-works" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '15px 32px', borderRadius: 100, background: 'transparent',
              color: G.mutedMed, fontSize: 15, fontWeight: 600, textDecoration: 'none',
              border: `1px solid ${G.border}`, transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G.accentBorder; e.currentTarget.style.color = G.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.mutedMed; }}>
              Voir comment ça marche
            </a>
          </div>
        </RevealBox>

        <RevealBox delay={320}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ display: 'flex' }}>
              {avatarColors.map((color, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}99)`, border: `2px solid ${G.bg}`, marginLeft: i > 0 ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} width="13" height="13" fill={G.accent} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <span style={{ fontSize: 12, color: G.muted }}>+2 400 professionnels qui construisent mieux</span>
            </div>
          </div>
        </RevealBox>
      </div>

      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: G.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Défiler</span>
        <div style={{ width: 1, height: 36, background: `linear-gradient(to bottom, ${G.accent}, transparent)` }} />
      </div>
    </section>
  );
}

/* ─── Logos ──────────────────────────────────────────────────── */
function LogosSection() {
  const logos = ['Shopify', 'HEC Montréal', 'Desjardins', 'Ubisoft', 'La Ruche', 'Notman House'];
  return (
    <section style={{ background: G.surface, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}`, padding: '32px 24px' }}>
      <RevealBox>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: G.muted, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginBottom: 24 }}>Utilisé par des professionnels de</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '10px 40px' }}>
            {logos.map(name => (
              <span key={name} style={{ color: 'rgba(219,234,254,0.22)', fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>{name}</span>
            ))}
          </div>
        </div>
      </RevealBox>
    </section>
  );
}

/* ─── Problem ─────────────────────────────────────────────────── */
const PROBLEM_STATS = [
  { value: '91%', label: 'des professionnels admettent ne pas entretenir régulièrement leurs relations clés.', color: G.accent },
  { value: '3 min', label: 'c\'est la durée de vie effective d\'un message LinkedIn avant d\'être noyé dans le fil.', color: '#e2b04a' },
  { value: '0', label: 'rappel automatique dans la plupart des outils de réseautage pour reprendre contact.', color: '#e25a4a' },
] as const;

function StatCard({ stat, delay }: { stat: typeof PROBLEM_STATS[number]; delay: number }) {
  return (
    <RevealBox delay={delay} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 24, padding: '40px 36px' }}>
      <div style={{ fontSize: 'clamp(2.8rem, 6vw, 4.2rem)', fontWeight: 900, color: stat.color, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16 }}>{stat.value}</div>
      <p style={{ fontSize: 15, color: G.muted, lineHeight: 1.6, margin: 0 }}>{stat.label}</p>
    </RevealBox>
  );
}

function ProblemSection() {
  return (
    <section id="problem" style={{ background: G.bg, padding: '96px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <RevealBox style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 100, background: G.accentMuted, border: `1px solid ${G.accentBorder}`, color: G.accent, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Le problème</span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, color: G.text, margin: '0 auto', maxWidth: 640, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Votre réseau est <em style={{ fontStyle: 'italic', fontWeight: 400, color: G.accent, fontFamily: 'Georgia, serif' }}>une mine d'or</em> que vous n'exploitez pas.
          </h2>
        </RevealBox>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="gc-3col">
          {PROBLEM_STATS.map((s, i) => <StatCard key={i} stat={s} delay={i * 120} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────────────────── */
const FEATURES = [
  { icon: '🧠', title: 'Réseautage Intelligent', desc: 'Un espace unique pour visualiser vos connexions, leurs contextes, et les opportunités de collaboration — sans jamais perdre le fil.', span: 7 },
  { icon: '🔔', title: 'Rappels Relationnels', desc: 'GoConnexions vous dit exactement quand reprendre contact, avant que la relation ne se refroidisse.', span: 5 },
  { icon: '💬', title: 'Messagerie Contextuelle', desc: 'Chaque message enrichi du contexte de votre relation : dernier échange, projets communs, intérêts partagés.', span: 4 },
  { icon: '📊', title: 'Suivi des Rencontres', desc: 'Enregistrez chaque interaction, notez vos impressions, suivez l\'évolution de vos connexions clés dans le temps.', span: 4 },
  { icon: '🎪', title: 'Événements & Salons', desc: 'Organisez ou participez à des événements professionnels, avec billets, stands et check-in intégrés.', span: 4 },
] as const;

function FeatureCard({ f, delay }: { f: typeof FEATURES[number]; delay: number }) {
  const [hov, setHov] = useState(false);
  return (
    <RevealBox delay={delay} style={{ gridColumn: `span ${f.span}` }}>
      <div style={{
        background: G.surface, border: `1px solid ${hov ? G.accentBorder : G.border}`,
        borderRadius: 24, padding: '36px 32px', height: '100%',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'border-color 0.3s, transform 0.3s',
      }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}>
        <div style={{ fontSize: 32, marginBottom: 20 }}>{f.icon}</div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: G.text, margin: '0 0 12px', letterSpacing: '-0.02em' }}>{f.title}</h3>
        <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
      </div>
    </RevealBox>
  );
}

function FeaturesSection() {
  return (
    <section id="features" style={{ background: G.surfaceAlt, padding: '96px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <RevealBox style={{ marginBottom: 56 }}>
          <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 100, background: G.accentMuted, border: `1px solid ${G.accentBorder}`, color: G.accent, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Fonctionnalités</span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: G.text, maxWidth: 540, lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0 }}>
            Tout ce dont vous avez besoin pour <em style={{ fontStyle: 'italic', fontWeight: 400, color: G.accent, fontFamily: 'Georgia, serif' }}>réseauter mieux.</em>
          </h2>
        </RevealBox>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16 }} className="gc-bento">
          {FEATURES.map((f, i) => <FeatureCard key={i} f={f} delay={i * 80} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── Video ──────────────────────────────────────────────────── */
const VIDEO_ID = 'vs-I-ZNV5ys';
const THUMBNAIL = `https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`;
const EMBED_URL = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`;

function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section style={{ position: 'relative', padding: '96px 24px', overflow: 'hidden', background: '#080f1a' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(74,144,217,0.10) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 240, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(74,144,217,0.12) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
        <RevealBox style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.25)', color: '#7eb8f0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7eb8f0', display: 'inline-block' }} />
            Voir en action
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Découvrez GoConnexions{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#7eb8f0', fontFamily: 'Georgia, serif' }}>en 2 minutes.</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
            Regardez comment GoConnexions transforme votre façon de gérer et développer votre réseau professionnel.
          </p>
        </RevealBox>

        <RevealBox delay={120}>
          <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(74,144,217,0.2)', boxShadow: '0 0 0 1px rgba(74,144,217,0.1), 0 32px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
              {playing ? (
                <iframe
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                  src={EMBED_URL}
                  title="GoConnexions — Présentation officielle"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button onClick={() => setPlaying(true)} aria-label="Lancer la vidéo GoConnexions"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', padding: 0, cursor: 'pointer', background: 'none' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={THUMBNAIL} alt="Aperçu vidéo GoConnexions" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="#0f1f3d" style={{ marginLeft: 4 }}><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                    <svg width="14" height="10" viewBox="0 0 24 17" fill="red"><path d="M23.5 2.6s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.6-.1 12 0 12 0S7.4-.1 4.7.5c-.6.1-1.9.1-3 1.3C.8.6.5 2.6.5 2.6S.2 4.9.2 7.2v2.2c0 2.3.3 4.6.3 4.6s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 18.2 12 18.2 12 18.2s4.6 0 7.3-.6c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.3.3-4.6V7.2c0-2.3-.3-4.6-.3-4.6zM9.7 12.1V4.9l8.1 3.7-8.1 3.5z" /></svg>
                    YouTube
                  </div>
                </button>
              )}
            </div>
          </div>
        </RevealBox>

        <RevealBox delay={200} style={{ textAlign: 'center', marginTop: 40 }}>
          <a href="/auth/select-role" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 28px', borderRadius: 100, color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            boxShadow: '0 4px 20px rgba(59,130,246,0.35)', transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.35)'; }}>
            Commencer gratuitement
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 12 }}>Sans carte bancaire · Gratuit pour commencer</p>
        </RevealBox>
      </div>
    </section>
  );
}

/* ─── How it works ───────────────────────────────────────────── */
const STEPS = [
  { n: '01', title: 'Construisez votre carte relationnelle', desc: 'Importez vos contacts ou repartez de zéro. Taguez les personnes selon comment vous les connaissez et ce que vous souhaitez accomplir ensemble.', detail: 'Configuration en 5 minutes', color: G.accent },
  { n: '02', title: 'Recevez des rappels humains', desc: 'GoConnexions met en avant les bonnes personnes au bon moment — avant qu\'une relation ne se refroidisse. Pas de spam, pas d\'algorithme.', detail: 'Cadence personnalisable', color: '#4a90d9' },
  { n: '03', title: 'Regardez vos relations se multiplier', desc: 'Introductions chaleureuses, suivis qui portent leurs fruits. Votre réseau devient un véritable atout — pas une métrique de vanité.', detail: 'Résultats réels, mesurables', color: '#8b5cf6' },
] as const;

function StepCard({ s, delay }: { s: typeof STEPS[number]; delay: number }) {
  const [hov, setHov] = useState(false);
  return (
    <RevealBox delay={delay}>
      <div style={{ background: G.surface, border: `1px solid ${hov ? `${s.color}50` : G.border}`, borderRadius: 24, padding: '36px 32px', position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s', height: '100%' }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}>
        <div style={{ position: 'absolute', top: -8, right: 12, fontSize: 80, fontWeight: 900, color: `${s.color}08`, fontFamily: 'monospace', lineHeight: 1, userSelect: 'none' }}>{s.n}</div>
        <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 100, background: `${s.color}15`, border: `1px solid ${s.color}30`, color: s.color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Étape {s.n}</span>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: G.text, margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.25 }}>{s.title}</h3>
        <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.65, margin: '0 0 24px' }}>{s.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.detail}</span>
        </div>
      </div>
    </RevealBox>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ background: G.bg, padding: '96px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <RevealBox style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'end', marginBottom: 64 }} className="gc-2col">
          <div>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 100, background: G.accentMuted, border: `1px solid ${G.accentBorder}`, color: G.accent, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Comment ça marche</span>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: G.text, margin: 0, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Trois étapes vers un{' '}
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: G.accent, fontFamily: 'Georgia, serif' }}>réseau qui fonctionne.</em>
            </h2>
          </div>
          <p style={{ fontSize: 15, color: G.muted, lineHeight: 1.7, margin: 0 }}>
            Pas d'intégration complexe. Pas de configuration en 47 étapes. GoConnexions s'efface pour que vous puissiez vous concentrer sur les conversations qui comptent.
          </p>
        </RevealBox>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="gc-3col">
          {STEPS.map((s, i) => <StepCard key={i} s={s} delay={i * 120} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonial ─────────────────────────────────────────────── */
function TestimonialSection() {
  const miniStats = [
    { v: '2 400+', l: 'professionnels actifs' },
    { v: '87%', l: 'taux de satisfaction' },
    { v: '3×', l: 'plus d\'opportunités' },
    { v: '< 5 min', l: 'pour commencer' },
  ] as const;

  return (
    <section style={{ background: G.surface, padding: '96px 24px', borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}` }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <RevealBox>
          <div style={{ position: 'relative', padding: '56px 48px', background: G.bg, borderRadius: 32, border: `1px solid ${G.border}` }}>
            <div style={{ position: 'absolute', top: 28, left: 36, fontSize: 120, lineHeight: 1, color: `${G.accent}10`, fontFamily: 'Georgia, serif', userSelect: 'none' }}>"</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 100, background: G.accentMuted, border: `1px solid ${G.accentBorder}`, color: G.accent, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 32 }}>Témoignage réel</span>
              <blockquote style={{ fontSize: 'clamp(1.2rem, 3vw, 1.55rem)', fontWeight: 500, color: G.text, lineHeight: 1.5, margin: '0 0 36px', letterSpacing: '-0.01em' }}>
                "J'avais 1 400 connexions LinkedIn et je me sentais complètement seule professionnellement. GoConnexions m'a aidée à vraiment parler à 12 d'entre elles en un mois. Deux sont devenues clientes. Une est devenue co-fondatrice."
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${G.accent}, #4a90d9)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 16, flexShrink: 0 }}>C</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: G.text, margin: '0 0 2px' }}>Camille Okafor</p>
                    <p style={{ fontSize: 12, color: G.muted, margin: 0 }}>Fondatrice, Verdant Studio — Lagos / Londres</p>
                  </div>
                </div>
                <div style={{ borderLeft: `1px solid ${G.border}`, paddingLeft: 24 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: G.accent, letterSpacing: '-0.04em' }}>2</span>
                  <p style={{ fontSize: 12, color: G.muted, margin: '4px 0 0', maxWidth: 180, lineHeight: 1.4 }}>clientes issues de 12 conversations significatives</p>
                </div>
              </div>
            </div>
          </div>
        </RevealBox>

        <RevealBox delay={160} style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }} className="gc-2col">
          <div>
            <h3 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: G.text, margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Le réseautage est une{' '}
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: G.accent, fontFamily: 'Georgia, serif' }}>compétence humaine.</em>
            </h3>
            <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.7, margin: 0 }}>
              Les meilleures opportunités de votre carrière ne viendront pas d'un message froid ou d'une publication virale. Elles viendront d'une vraie conversation avec quelqu'un qui vous fait confiance.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {miniStats.map((stat, i) => (
              <div key={i} style={{ background: G.bg, border: `1px solid ${G.border}`, borderRadius: 16, padding: '20px 20px' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: G.accent, letterSpacing: '-0.03em', marginBottom: 4 }}>{stat.v}</div>
                <div style={{ fontSize: 12, color: G.muted, lineHeight: 1.4 }}>{stat.l}</div>
              </div>
            ))}
          </div>
        </RevealBox>
      </div>
    </section>
  );
}

/* ─── Pricing ────────────────────────────────────────────────── */
type Plan = {
  name: string;
  price: { monthly: number; yearly: number };
  desc: string;
  features: string[];
  cta: string;
  href: string;
  highlight: boolean;
  badge?: string;
};

const PLANS: Plan[] = [
  {
    name: 'Gratuit',
    price: { monthly: 0, yearly: 0 },
    desc: 'Pour découvrir GoConnexions',
    features: ['5 connexions actives', 'Messagerie de base', 'Profil public', 'Rappels basiques'],
    cta: 'Commencer gratuitement',
    href: '/auth/select-role',
    highlight: false,
  },
  {
    name: 'Freelancer',
    price: { monthly: 29, yearly: 24 },
    desc: 'Pour les indépendants ambitieux',
    features: ['Connexions illimitées', 'Rappels intelligents', 'Carte relationnelle avancée', 'Messagerie contextuelle', 'Statistiques de réseau', 'Support prioritaire'],
    cta: 'Essai gratuit 14 jours',
    href: '/auth/select-role',
    highlight: true,
    badge: 'Populaire',
  },
  {
    name: 'Entrepreneur',
    price: { monthly: 49, yearly: 40 },
    desc: 'Pour les équipes en croissance',
    features: ['Tout Freelancer inclus', "Équipe jusqu'à 5 membres", 'CRM avancé', 'Intégrations tiers', 'Événements illimités', 'Onboarding dédié'],
    cta: 'Essai gratuit 14 jours',
    href: '/auth/select-role',
    highlight: false,
  },
];

function PlanCard({ plan, yearly, delay }: { plan: Plan; yearly: boolean; delay: number }) {
  const [hov, setHov] = useState(false);
  const price = yearly ? plan.price.yearly : plan.price.monthly;
  return (
    <RevealBox delay={delay}>
      <div style={{
        background: plan.highlight ? `linear-gradient(160deg, ${G.surface} 0%, rgba(37,99,235,0.06) 100%)` : G.surface,
        border: `${plan.highlight ? '1.5px' : '1px'} solid ${plan.highlight || hov ? G.accentBorder : G.border}`,
        borderRadius: 24, padding: '36px 32px', position: 'relative',
        boxShadow: plan.highlight ? '0 0 40px rgba(37,99,235,0.1)' : 'none',
        transition: 'border-color 0.3s',
        height: '100%',
      }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}>
        {plan.badge && (
          <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: G.accent, color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
            {plan.badge}
          </div>
        )}
        <p style={{ fontSize: 13, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>{plan.name}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '12px 0' }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: G.text, letterSpacing: '-0.04em', lineHeight: 1 }}>{price}</span>
          {price > 0
            ? <span style={{ fontSize: 14, color: G.muted, fontWeight: 600 }}>$ CAD/mois</span>
            : <span style={{ fontSize: 16, color: G.muted }}>$</span>}
        </div>
        <p style={{ fontSize: 13, color: G.muted, margin: '0 0 28px', lineHeight: 1.5 }}>{plan.desc}</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {plan.features.map((f, j) => (
            <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: G.mutedMed, lineHeight: 1.4 }}>
              <svg style={{ flexShrink: 0, marginTop: 1 }} width="15" height="15" fill="none" stroke={G.accent} strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {f}
            </li>
          ))}
        </ul>
        <Link href={plan.href} style={{
          display: 'block', textAlign: 'center', padding: '13px 24px', borderRadius: 100,
          background: plan.highlight ? G.accent : 'transparent',
          border: plan.highlight ? 'none' : `1px solid ${G.border}`,
          color: plan.highlight ? '#fff' : G.mutedMed,
          fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s',
          boxShadow: plan.highlight ? '0 4px 20px rgba(37,99,235,0.3)' : 'none',
        }}>
          {plan.cta}
        </Link>
      </div>
    </RevealBox>
  );
}

function PricingSection() {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="pricing" style={{ background: G.bg, padding: '96px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <RevealBox style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 100, background: G.accentMuted, border: `1px solid ${G.accentBorder}`, color: G.accent, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Tarifs</span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: G.text, margin: '0 auto 16px', maxWidth: 540, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Commencez gratuitement,{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 400, color: G.accent, fontFamily: 'Georgia, serif' }}>évoluez à votre rythme.</em>
          </h2>
          <p style={{ fontSize: 15, color: G.muted, marginBottom: 32 }}>Aucune carte bancaire requise pour démarrer.</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: G.surface, border: `1px solid ${G.border}`, borderRadius: 100, padding: '4px 6px' }}>
            <button onClick={() => setYearly(false)} style={{ padding: '7px 18px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.25s', background: !yearly ? G.accent : 'transparent', color: !yearly ? '#fff' : G.muted }}>Mensuel</button>
            <button onClick={() => setYearly(true)} style={{ padding: '7px 18px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.25s', background: yearly ? G.accent : 'transparent', color: yearly ? '#fff' : G.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
              Annuel
              <span style={{ background: 'rgba(37,99,235,0.2)', color: G.accent, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>-17%</span>
            </button>
          </div>
        </RevealBox>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }} className="gc-3col">
          {PLANS.map((p, i) => <PlanCard key={i} plan={p} yearly={yearly} delay={i * 100} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────────── */
function CtaSection() {
  return (
    <section style={{ background: G.surface, padding: '96px 24px', position: 'relative', overflow: 'hidden', borderTop: `1px solid ${G.border}` }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <RevealBox style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 100, border: `1px solid ${G.accentBorder}`, color: G.accent, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 28 }}>Accès Anticipé Ouvert</span>
        <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3.6rem)', fontWeight: 800, color: G.text, margin: '0 0 20px', lineHeight: 1.06, letterSpacing: '-0.03em' }}>
          Votre prochaine grande opportunité est à{' '}
          <em style={{ fontStyle: 'italic', fontWeight: 400, color: G.accent, fontFamily: 'Georgia, serif' }}>une vraie conversation de distance.</em>
        </h2>
        <p style={{ fontSize: 15, color: G.muted, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
          Rejoignez plus de 2 400 entrepreneurs et freelances qui construisent des relations professionnelles significatives. Gratuit pour commencer, sans carte bancaire.
        </p>
        <Link href="/auth/select-role" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '16px 36px', borderRadius: 100, background: G.accent,
          color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 8px 30px rgba(37,99,235,0.35)', transition: 'transform 0.2s, box-shadow 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(37,99,235,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(37,99,235,0.35)'; }}>
          Commencer gratuitement
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
        <p style={{ fontSize: 12, color: G.muted, marginTop: 20 }}>Sans carte bancaire · Gratuit pour commencer</p>
      </RevealBox>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */
const FOOTER_COLS = [
  { title: 'Produit', links: [{ label: 'Fonctionnalités', href: '#features' }, { label: 'Comment ça marche', href: '#how-it-works' }, { label: 'Tarifs', href: '#pricing' }, { label: 'Changelog', href: '#' }] },
  { title: 'Entreprise', links: [{ label: 'À propos', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Carrières', href: '#' }, { label: 'Contact', href: 'mailto:bonjour@goconnexions.com' }] },
  { title: 'Légal', links: [{ label: 'Confidentialité', href: '#' }, { label: "Conditions d'utilisation", href: '#' }, { label: 'Cookies', href: '#' }] },
] as const;

function Footer() {
  return (
    <footer style={{ background: G.bg, borderTop: `1px solid ${G.border}`, padding: '56px 24px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }} className="gc-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: G.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 12 }}>GC</span>
              </div>
              <span style={{ color: G.text, fontWeight: 700, fontSize: 14 }}>GoConnexions</span>
            </div>
            <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.65, maxWidth: 260, margin: 0 }}>La plateforme de réseautage professionnel qui vous aide à construire des connexions significatives.</p>
          </div>
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <p style={{ fontSize: 12, fontWeight: 700, color: G.mutedMed, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>{col.title}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(l => (
                  <li key={l.label}>
                    <a href={l.href} style={{ fontSize: 13, color: G.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = G.text)}
                      onMouseLeave={e => (e.currentTarget.style.color = G.muted)}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: G.muted, margin: 0 }}>© 2026 GoConnexions. Tous droits réservés. Fait avec ♥ à Montréal.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Twitter', 'LinkedIn', 'Instagram'].map(s => (
              <a key={s} href="#" style={{ fontSize: 12, color: G.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = G.accent)}
                onMouseLeave={e => (e.currentTarget.style.color = G.muted)}>{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Global styles ──────────────────────────────────────────── */
function GlobalStyles() {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { background: #09090B; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
      input, button { font-family: inherit; }
      input::placeholder { color: rgba(219,234,254,0.35); }

      @keyframes gc-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.45; transform: scale(0.8); }
      }

      /* Desktop nav visibility */
      .gc-desktop-nav { display: flex !important; }
      .gc-hamburger { display: none !important; }

      @media (max-width: 900px) {
        .gc-desktop-nav { display: none !important; }
        .gc-hamburger { display: flex !important; }
      }

      /* Responsive grid helpers */
      @media (max-width: 768px) {
        .gc-3col { grid-template-columns: 1fr !important; }
        .gc-2col { grid-template-columns: 1fr !important; }
        .gc-footer-grid { grid-template-columns: 1fr 1fr !important; }
        .gc-bento { grid-template-columns: 1fr !important; }
        .gc-bento > * { grid-column: span 1 !important; }
      }
    `}</style>
  );
}

/* ─── Page export ────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <GlobalStyles />
      <Navbar />
      <main>
        <Hero />
        <LogosSection />
        <ProblemSection />
        <FeaturesSection />
        <VideoSection />
        <HowItWorksSection />
        <TestimonialSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
