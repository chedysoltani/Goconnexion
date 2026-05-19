'use client';

import React, { useEffect, useRef } from 'react';

interface Step {
  number: string;
  title: string;
  description: string;
  detail: string;
  accentColor: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Construisez votre carte relationnelle',
    description:
      'Importez vos contacts existants ou repartez de zéro. Taguez les personnes selon comment vous les connaissez, ce que vous souhaitez accomplir ensemble, et votre dernière interaction.',
    detail: 'Configuration en 5 minutes',
    accentColor: '#4a90d9',
  },
  {
    number: '02',
    title: 'Recevez des rappels humains',
    description:
      'GoConnexions met en avant les bonnes personnes au bon moment — avant qu\'une relation ne se refroidisse. Pas de spam, pas d\'algorithme. Juste des rappels opportuns.',
    detail: 'Cadence personnalisable',
    accentColor: '#1a3a5c',
  },
  {
    number: '03',
    title: 'Regardez vos relations se multiplier',
    description:
      'Introductions chaleureuses, suivis qui portent leurs fruits, réunions qui mènent quelque part. Votre réseau devient un véritable atout — pas une métrique de vanité.',
    detail: 'Résultats réels, mesurables',
    accentColor: '#2a5298',
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
              el.style.transform = el.dataset.transform === 'mid' ?'translateY(2.5rem)' :'translateY(0)';
              if (window.innerWidth < 768) {
                el.style.transform = 'translateY(0)';
              }
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
      el.style.transition = `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`;
      if (i === 1) el.dataset.transform = 'mid';
      el.dataset.delay = String(i * 100);
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      className="py-28 md:py-36 px-6 md:px-12 bg-gc-bg relative overflow-hidden"
    >
      {/* Background blob */}
      <div
        className="absolute -bottom-32 -left-32 w-96 h-96 blob opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4a90d9 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="grid lg:grid-cols-2 gap-12 items-end mb-20">
          <div className="space-y-5">
            <span className="tag-pill">Comment ça marche</span>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-foreground">
              Trois étapes vers un{' '}
              <span className="font-serif italic font-normal text-accent">
                réseau qui fonctionne.
              </span>
            </h2>
          </div>
          <p className="text-base text-muted leading-relaxed max-w-md lg:pl-8">
            Pas d'intégration complexe. Pas d'assistant de configuration en 47 étapes. GoConnexions s'efface pour que vous puissiez vous concentrer sur les conversations qui comptent.
          </p>
        </div>

        {/* Staggered offset cards — T2 methodology style */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`bg-surface rounded-[2rem] p-8 md:p-10 border border-gc-border hover:shadow-card-hover hover:border-accent/20 transition-all duration-500 group relative overflow-hidden ${
                i === 1 ? 'step-card-mid' : ''
              }`}
            >
              {/* Decorative number */}
              <div
                className="absolute -top-3 -right-1 text-8xl font-black leading-none select-none pointer-events-none opacity-[0.04]"
                style={{ color: step.accentColor }}
                aria-hidden="true"
              >
                {step.number}
              </div>

              {/* Step number badge */}
              <div className="relative z-10 space-y-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: step.accentColor }}
                >
                  {step.number}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">{step.description}</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.12em]">
                    {step.detail}
                  </span>
                </div>
              </div>

              {/* Hover accent line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${step.accentColor}, transparent)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}