'use client';

import React, { useEffect, useRef } from 'react';

interface PainPoint {
  stat: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const painPoints: PainPoint[] = [
  {
    stat: '91%',
    label: 'des connexions LinkedIn restent silencieuses',
    description:
      "Vous vous connectez, échangez peut-être un message, puis — rien. L'algorithme les enterre et vous oubliez qu'ils existent.",
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
      </svg>
    ),
  },
  {
    stat: '3min',
    label: 'temps moyen passé sur une "connexion"',
    description:
      "Les plateformes sont optimisées pour les métriques d'engagement, pas pour votre carrière. Défilement sans fin, likes superficiels — zéro résultat concret.",
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    stat: '0',
    label: 'rappels pour entretenir votre réseau',
    description:
      "Les relations s'estompent sans suivi. Aucune plateforme aujourd'hui ne vous dit : « Hé, vous n'avez pas parlé à Marcus depuis 3 mois. »",
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
      </svg>
    ),
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
            el.style.transform = 'translateY(0)';
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );

    itemRefs.current.forEach((el) => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(32px)';
        el.style.transition = 'opacity 0.85s cubic-bezier(0.16,1,0.3,1), transform 0.85s cubic-bezier(0.16,1,0.3,1)';
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="py-28 md:py-36 px-6 md:px-12 bg-gc-bg"
    >
      <div className="max-w-7xl mx-auto">
        <div
          ref={(el) => { itemRefs.current[0] = el; }}
          className="grid lg:grid-cols-2 gap-12 mb-20 items-end"
        >
          <div className="space-y-5">
            <span className="tag-pill">Le Problème</span>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-foreground">
              Votre réseau est{' '}
              <span className="font-serif italic font-normal text-muted">
                plus grand que jamais.
              </span>
              <br />
              Vos relations, non.
            </h2>
          </div>
          <div className="lg:pl-8">
            <p className="text-base text-muted leading-relaxed max-w-md">
              Les plateformes actuelles sont conçues pour maximiser le temps passé sur l'application, pas pour vous aider à construire les relations qui font avancer votre carrière et votre business. Les chiffres parlent d'eux-mêmes.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {painPoints.map((point, i) => (
            <div
              key={i}
              ref={(el) => { itemRefs.current[i + 1] = el; }}
              style={{ transitionDelay: `${i * 0.12}s` }}
              className="bg-surface rounded-[2rem] p-8 md:p-10 border border-gc-border hover:border-accent/30 hover:shadow-card-hover transition-all duration-500 group relative overflow-hidden"
            >
              <div
                className="absolute -top-4 -right-2 text-8xl font-black text-accent/5 leading-none select-none pointer-events-none font-sans"
                aria-hidden="true"
              >
                {point.stat}
              </div>

              <div className="relative z-10 space-y-5">
                <div className="w-11 h-11 rounded-xl bg-accent-light text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  {point.icon}
                </div>
                <div>
                  <p className="text-4xl font-bold text-foreground tracking-tight mb-1">{point.stat}</p>
                  <p className="text-sm font-semibold text-foreground/70 leading-snug">{point.label}</p>
                </div>
                <p className="text-sm text-muted leading-relaxed">{point.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          ref={(el) => { itemRefs.current[4] = el; }}
          className="mt-16 text-center"
        >
          <p className="text-lg md:text-xl font-medium text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            GoConnexions est construit différemment —{' '}
            <span className="text-accent font-semibold">
              conçu autour des relations, pas des métriques de rétention.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}