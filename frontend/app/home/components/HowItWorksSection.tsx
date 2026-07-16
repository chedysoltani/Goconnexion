'use client';

import React, { useEffect, useRef } from 'react';

const steps = [
  {
    number: '01',
    title: 'Construisez votre carte relationnelle',
    description: "Importez vos contacts ou repartez de zéro. Taguez les personnes selon comment vous les connaissez, ce que vous souhaitez accomplir ensemble, et votre dernière interaction.",
    detail: 'Configuration en 5 minutes',
    color: '#4a90d9',
    bg: 'rgba(74,144,217,0.12)',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Recevez des rappels humains',
    description: "GoConnexions met en avant les bonnes personnes au bon moment — avant qu'une relation ne se refroidisse. Pas de spam, pas d'algorithme. Juste des rappels opportuns.",
    detail: 'Cadence personnalisable',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Regardez vos relations se multiplier',
    description: "Introductions chaleureuses, suivis qui portent leurs fruits, réunions qui mènent quelque part. Votre réseau devient un véritable atout — pas une métrique de vanité.",
    detail: 'Résultats réels, mesurables',
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.12)',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseInt(el.dataset.delay || '0');
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (headerRef.current) {
      const el = headerRef.current;
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)';
      observer.observe(el);
    }

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(36px)';
      el.style.transition = `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`;
      el.dataset.delay = String(i * 100);
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="relative py-28 md:py-36 px-6 md:px-12 overflow-hidden"
      style={{ background: '#f7f9fc' }}>

      {/* Connection lines decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {[20, 40, 60, 80].map((left, i) => (
          <div key={i} className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${left}%`,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(74,144,217,0.05) 40%, rgba(74,144,217,0.05) 60%, transparent 100%)',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div ref={headerRef} className="grid lg:grid-cols-2 gap-12 items-end mb-20">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', color: '#4a90d9' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Comment ça marche
            </div>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-foreground">
              Trois étapes vers un{' '}
              <span className="font-serif italic font-normal text-accent">réseau qui fonctionne.</span>
            </h2>
          </div>
          <p className="text-base text-muted leading-relaxed max-w-md lg:pl-8">
            Pas d'intégration complexe. Pas de configuration en 47 étapes. GoConnexions s'efface pour que vous puissiez vous concentrer sur les conversations qui comptent.
          </p>
        </div>

        {/* Steps — connected layout */}
        <div className="relative">
          {/* Connector line between cards */}
          <div className="hidden md:block absolute top-16 left-[calc(33%-24px)] right-[calc(33%-24px)] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(74,144,217,0.3), rgba(74,144,217,0.3), transparent)' }} />

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
            {steps.map((step, i) => (
              <div
                key={step.number}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`group relative rounded-[2rem] p-8 md:p-10 border border-gc-border transition-all duration-500 overflow-hidden ${
                  i === 1 ? 'step-card-mid' : ''
                }`}
                style={{ background: '#fff', boxShadow: '0 4px 24px rgba(26,35,50,0.04)' }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = `0 24px 60px rgba(26,35,50,0.1), 0 0 0 1px ${step.color}20`;
                  el.style.transform = i === 1 ? 'translateY(2.5rem) scale(1.02)' : 'translateY(-4px) scale(1.02)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = '0 4px 24px rgba(26,35,50,0.04)';
                  el.style.transform = i === 1 ? 'translateY(2.5rem)' : 'translateY(0)';
                }}
              >
                {/* Decorative background number */}
                <div className="absolute -top-4 -right-2 text-8xl font-black leading-none select-none pointer-events-none"
                  style={{ color: `${step.color}06`, fontFamily: 'monospace' }}>
                  {step.number}
                </div>

                <div className="relative z-10 space-y-6">
                  {/* Step badge */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}99)`, boxShadow: `0 4px 12px ${step.color}40` }}>
                      {step.icon}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.15em]"
                      style={{ color: step.color }}>
                      Étape {step.number}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">{step.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: step.color }} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: step.color }}>
                      {step.detail}
                    </span>
                  </div>
                </div>

                {/* Hover bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-[2rem]"
                  style={{ background: `linear-gradient(90deg, ${step.color}, transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
