'use client';

import React, { useEffect, useRef } from 'react';

const painPoints = [
  {
    stat: '91%',
    label: 'des connexions LinkedIn restent silencieuses',
    description: "Vous vous connectez, échangez peut-être un message, puis — rien. L'algorithme les enterre et vous oubliez qu'ils existent.",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
  },
  {
    stat: '3min',
    label: "temps moyen passé sur une \"connexion\"",
    description: "Les plateformes sont optimisées pour les métriques d'engagement, pas pour votre carrière. Défilement sans fin, likes superficiels — zéro résultat.",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
  },
  {
    stat: '0',
    label: 'rappels pour entretenir votre réseau',
    description: "Les relations s'estompent sans suivi. Aucune plateforme ne vous dit : « Hé, vous n'avez pas parlé à Marcus depuis 3 mois. »",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
  },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) scale(1)';
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );

    itemRefs.current.forEach((el, i) => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(36px) scale(0.97)';
        el.style.transition = `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative py-28 md:py-36 px-6 md:px-12 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080f1a 0%, #0a1628 100%)' }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      {/* Ambient glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(74,144,217,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div ref={(el) => { itemRefs.current[0] = el; }} className="grid lg:grid-cols-2 gap-12 mb-20 items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              Le Problème
            </div>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-white">
              Votre réseau est{' '}
              <span className="font-serif italic font-normal" style={{ color: '#7eb8f0' }}>plus grand que jamais.</span>
              <br />
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Vos relations, non.</span>
            </h2>
          </div>
          <div className="lg:pl-8">
            <p className="text-base leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Les plateformes actuelles sont conçues pour maximiser le temps passé sur l'application, pas pour vous aider à construire les relations qui font avancer votre carrière.
            </p>
          </div>
        </div>

        {/* Pain point cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {painPoints.map((point, i) => (
            <div
              key={i}
              ref={(el) => { itemRefs.current[i + 1] = el; }}
              className="group relative rounded-2xl p-7 cursor-default overflow-hidden transition-all duration-500"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.border = `1px solid ${point.color}30`;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Background glow on hover */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${point.color}, transparent)` }} />

              {/* Decorative stat */}
              <div className="absolute -top-2 -right-2 text-7xl font-black leading-none select-none pointer-events-none"
                style={{ color: `${point.color}08`, fontFamily: 'monospace' }}>
                {point.stat}
              </div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: point.bg, color: point.color }}>
                  {point.icon}
                </div>

                {/* Stat */}
                <div className="mb-3">
                  <p className="text-4xl font-black tracking-tight text-white mb-1">{point.stat}</p>
                  <p className="text-sm font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {point.label}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {point.description}
                </p>

                {/* Bottom accent line */}
                <div className="mt-5 h-0.5 rounded-full w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: `linear-gradient(90deg, ${point.color}, transparent)` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Call-out quote */}
        <div ref={(el) => { itemRefs.current[4] = el; }} className="mt-16 text-center">
          <div className="inline-block max-w-2xl px-8 py-5 rounded-2xl"
            style={{ background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.15)' }}>
            <p className="text-base md:text-lg font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              GoConnexions est construit différemment —{' '}
              <span className="font-bold" style={{ color: '#7eb8f0' }}>
                conçu autour des relations, pas des métriques de rétention.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
