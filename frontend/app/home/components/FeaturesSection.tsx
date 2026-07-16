'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

interface Feature {
  id: string;
  title: string;
  description: string;
  tag: string;
  span: string;
  dark?: boolean;
  icon: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  metric?: { value: string; label: string };
  accentColor: string;
}

const features: Feature[] = [
  {
    id: 'networking',
    title: 'Réseautage Intelligent',
    description: "Connectez-vous avec des professionnels qui partagent vos véritables objectifs — pas seulement votre secteur. Notre matching prend en compte le contexte, l'intention et la valeur mutuelle.",
    tag: 'Découverte',
    span: 'col-span-12 md:col-span-7',
    accentColor: '#4a90d9',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    imageSrc: 'https://img.rocket.new/generatedImages/rocket_gen_img_1fd26b8eb-1771906716835.png',
    imageAlt: "Équipe collaborant dans un bureau moderne",
    metric: { value: '3.2x', label: 'plus de taux de réponse vs démarchage à froid' },
  },
  {
    id: 'reminders',
    title: 'Rappels Relationnels',
    description: "Ne laissez jamais une connexion précieuse se refroidir. GoConnexions vous relance au bon moment — « Vous n'avez pas parlé à Priya depuis 6 semaines. »",
    tag: 'Restez Proche',
    span: 'col-span-12 md:col-span-5',
    dark: true,
    accentColor: '#7eb8f0',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    id: 'messaging',
    title: 'Messagerie Contextuelle',
    description: "Chaque fil de conversation affiche le contexte partagé — réunions passées, notes et historique — pour que vous sachiez toujours où vous en étiez.",
    tag: 'Conversations',
    span: 'col-span-12 md:col-span-5',
    accentColor: '#8b5cf6',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 'meetings',
    title: 'Suivi des Rencontres',
    description: "Enregistrez vos cafés, appels et présentations. Suivez qui vous a présenté à qui. Visualisez la carte complète de vos relations — pas juste une liste de noms.",
    tag: 'Suivre les Progrès',
    span: 'col-span-12 md:col-span-7',
    accentColor: '#2563eb',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    imageSrc: 'https://images.unsplash.com/photo-1598929440176-7eeb8b1a6cc5',
    imageAlt: 'Personne consultant son calendrier',
    metric: { value: '68%', label: 'des utilisateurs trouvent des opportunités grâce aux suivis tracés' },
  },
];

export default function FeaturesSection() {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseInt(el.dataset.delay || '0');
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0) scale(1)';
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.08 }
    );

    itemRefs.current.forEach((el, i) => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(32px) scale(0.97)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)';
        el.dataset.delay = String(i * 80);
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="relative py-28 md:py-36 px-6 md:px-12 overflow-hidden"
      style={{ background: '#f7f9fc' }}>

      {/* Subtle top gradient transition from dark section */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(8,15,26,0.04) 0%, transparent 100%)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div ref={(el) => { itemRefs.current[0] = el; }}
          className="flex flex-col md:flex-row justify-between items-end mb-14 gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', color: '#4a90d9' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Fonctionnalités
            </div>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-foreground">
              Des outils conçus pour les{' '}
              <span className="font-serif italic font-normal text-accent">humains,</span>{' '}
              pas les algorithmes.
            </h2>
          </div>
          <p className="text-sm text-muted max-w-xs leading-relaxed md:text-right">
            Chaque fonctionnalité existe pour vous aider à avoir de meilleures conversations et construire des relations plus solides.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {features.map((feature, i) => (
            <div
              key={feature.id}
              ref={(el) => { itemRefs.current[i + 1] = el; }}
              className={`${feature.span} group relative rounded-[2rem] p-8 md:p-10 overflow-hidden cursor-default transition-all duration-500`}
              style={feature.dark ? {
                background: 'linear-gradient(135deg, #080f1a 0%, #0e1f36 100%)',
                border: '1px solid rgba(74,144,217,0.2)',
              } : {
                background: '#fff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 24px rgba(26,35,50,0.04)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                if (!feature.dark) {
                  el.style.boxShadow = `0 20px 60px rgba(26,35,50,0.1), 0 0 0 1px ${feature.accentColor}20`;
                  el.style.transform = 'translateY(-4px)';
                } else {
                  el.style.boxShadow = `0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px ${feature.accentColor}30`;
                  el.style.transform = 'translateY(-4px)';
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = feature.dark ? 'none' : '0 4px 24px rgba(26,35,50,0.04)';
                el.style.transform = 'translateY(0)';
              }}
            >
              {/* Top accent line on hover */}
              {!feature.dark && (
                <div className="absolute top-0 left-0 right-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                  style={{ background: `linear-gradient(90deg, ${feature.accentColor}, transparent)` }} />
              )}

              {/* Background glow for dark card */}
              {feature.dark && (
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-10"
                  style={{ background: `radial-gradient(circle, ${feature.accentColor}, transparent)` }} />
              )}

              {/* Icon + tag */}
              <div className="flex items-start justify-between mb-6">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                  feature.dark ? 'bg-white/10 text-white' : ''
                }`}
                  style={!feature.dark ? { background: `${feature.accentColor}15`, color: feature.accentColor } : {}}>
                  {feature.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                  feature.dark ? 'text-white/30' : 'text-muted/50'
                }`}>
                  {feature.tag}
                </span>
              </div>

              {/* Content */}
              <h3 className={`text-xl md:text-2xl font-bold tracking-tight mb-3 ${feature.dark ? 'text-white' : 'text-foreground'}`}>
                {feature.title}
              </h3>
              <p className={`text-sm leading-relaxed max-w-sm ${feature.dark ? 'text-white/50' : 'text-muted'}`}>
                {feature.description}
              </p>

              {/* Image + metric */}
              {feature.imageSrc && (
                <div className="mt-8 space-y-4">
                  <div className="rounded-xl overflow-hidden h-44 hover-lift">
                    <AppImage
                      src={feature.imageSrc}
                      alt={feature.imageAlt || feature.title}
                      width={600}
                      height={176}
                      className="w-full h-full object-cover saturate-[0.85] group-hover:saturate-100 transition-all duration-700 group-hover:scale-105"
                    />
                  </div>
                  {feature.metric && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-tight" style={{ color: feature.accentColor }}>
                        {feature.metric.value}
                      </span>
                      <span className="text-xs text-muted leading-tight max-w-[140px]">{feature.metric.label}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Dark card reminder illustration */}
              {feature.dark && (
                <div className="mt-8 space-y-2">
                  {[
                    { name: 'Jordan Lee',    time: 'il y a 6 semaines', opacity: '0.9' },
                    { name: 'Priya Nair',   time: 'il y a 3 semaines', opacity: '0.7' },
                    { name: 'Marcus Webb',  time: 'il y a 2 semaines', opacity: '0.5' },
                  ].map((item) => (
                    <div key={item.name}
                      className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors duration-200 hover:bg-white/10"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: `${feature.accentColor}50` }}>
                          {item.name[0]}
                        </div>
                        <span className="text-sm font-medium text-white/80">{item.name}</span>
                      </div>
                      <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {item.time}
                      </span>
                    </div>
                  ))}
                  <p className="text-[11px] pt-1 font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Rappel : Il est temps de se reconnecter →
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
