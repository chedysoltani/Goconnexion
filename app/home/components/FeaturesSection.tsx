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
  metric?: {value: string;label: string;};
}

const features: Feature[] = [
{
  id: 'networking',
  title: 'Réseautage Intelligent',
  description:
  'Connectez-vous avec des professionnels qui partagent vos véritables objectifs — pas seulement votre secteur. Notre matching prend en compte le contexte, l\'intention et la valeur mutuelle.',
  tag: 'Découverte',
  span: 'col-span-12 md:col-span-7',
  icon:
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,

  imageSrc: "https://img.rocket.new/generatedImages/rocket_gen_img_1fd26b8eb-1771906716835.png",
  imageAlt: 'Équipe collaborant autour d\'une table dans un bureau moderne et lumineux',
  metric: { value: '3.2x', label: 'plus de taux de réponse vs démarchage à froid' }
},
{
  id: 'reminders',
  title: 'Rappels Relationnels',
  description:
  "Ne laissez jamais une connexion précieuse se refroidir. GoConnexions vous relance au bon moment — \"Vous n'avez pas parlé à Priya depuis 6 semaines.\"",
  tag: 'Restez Proche',
  span: 'col-span-12 md:col-span-5',
  dark: true,
  icon:
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>

},
{
  id: 'messaging',
  title: 'Messagerie Contextuelle',
  description:
  'Chaque fil de conversation affiche le contexte partagé — réunions passées, notes ajoutées et historique des échanges — pour que vous sachiez toujours où vous en étiez.',
  tag: 'Conversations',
  span: 'col-span-12 md:col-span-5',
  icon:
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>

},
{
  id: 'meetings',
  title: 'Suivi des Rencontres',
  description:
  'Enregistrez vos cafés, appels et présentations. Suivez qui vous a présenté à qui. Visualisez la carte complète de vos relations — pas seulement une liste de noms.',
  tag: 'Suivre les Progrès',
  span: 'col-span-12 md:col-span-7',
  icon:
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,

  imageSrc: "https://images.unsplash.com/photo-1598929440176-7eeb8b1a6cc5",
  imageAlt: 'Personne consultant son calendrier et ses notes sur un ordinateur portable dans un café',
  metric: { value: '68%', label: 'des utilisateurs trouvent des opportunités grâce aux suivis tracés' }
}];


export default function FeaturesSection() {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.delay || '0';
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, parseInt(delay));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    itemRefs.current.forEach((el, i) => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)';
        el.dataset.delay = String(i * 80);
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-28 md:py-36 px-6 md:px-12 bg-surface">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          ref={(el) => {itemRefs.current[0] = el;}}
          className="flex flex-col md:flex-row justify-between items-end mb-14 gap-8">

          <div className="space-y-4">
            <span className="tag-pill">Fonctionnalités</span>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-foreground">
              Des outils conçus pour les{' '}
              <span className="font-serif italic font-normal text-accent">
                humains,
              </span>{' '}
              pas les algorithmes.
            </h2>
          </div>
          <p className="text-sm text-muted max-w-xs leading-relaxed md:text-right">
            Chaque fonctionnalité existe pour vous aider à avoir de meilleures conversations et à construire des relations plus solides — point final.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {features.map((feature, i) =>
          <div
            key={feature.id}
            ref={(el) => {itemRefs.current[i + 1] = el;}}
            className={`${feature.span} feature-card rounded-[2rem] p-8 md:p-10 border border-gc-border relative overflow-hidden group cursor-default ${
            feature.dark ?
            'bg-primary text-white border-primary' : 'bg-gc-bg'}`
            }
            style={feature.dark ? { borderColor: '#1a3a5c' } : {}}>

              {/* Icon + tag */}
              <div className="flex items-start justify-between mb-6">
                <div
                className={`feature-icon w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                feature.dark ?
                'bg-white/10 text-white' : 'bg-accent-light text-accent'}`
                }>

                  {feature.icon}
                </div>
                <span
                className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                feature.dark ? 'text-white/40' : 'text-muted/60'}`
                }>

                  {feature.tag}
                </span>
              </div>

              {/* Content */}
              <h3 className={`text-xl md:text-2xl font-bold tracking-tight mb-3 ${feature.dark ? 'text-white' : 'text-foreground'}`}>
                {feature.title}
              </h3>
              <p className={`text-sm leading-relaxed max-w-sm ${feature.dark ? 'text-white/60' : 'text-muted'}`}>
                {feature.description}
              </p>

              {/* Optional image + metric */}
              {feature.imageSrc &&
            <div className="mt-8 space-y-4">
                  <div className="rounded-xl overflow-hidden h-44 hover-lift">
                    <AppImage
                  src={feature.imageSrc}
                  alt={feature.imageAlt || feature.title}
                  width={600}
                  height={176}
                  className="w-full h-full object-cover saturate-[0.85] group-hover:saturate-100 transition-all duration-700" />

                  </div>
                  {feature.metric &&
              <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-accent tracking-tight">{feature.metric.value}</span>
                      <span className="text-xs text-muted leading-tight max-w-[140px]">{feature.metric.label}</span>
                    </div>
              }
                </div>
            }

              {/* Dark card reminder illustration */}
              {feature.dark &&
            <div className="mt-8 space-y-2">
                  {[
              { name: 'Jordan Lee', time: 'il y a 6 semaines', color: '#7eb8f0' },
              { name: 'Priya Nair', time: 'il y a 3 semaines', color: '#a8d4f5' },
              { name: 'Marcus Webb', time: 'il y a 2 semaines', color: '#c8e4fa' }].
              map((item) =>
              <div
                key={item.name}
                className="flex items-center justify-between bg-white/8 rounded-xl px-4 py-3 border border-white/10">

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <span className="text-sm font-medium text-white/80">{item.name}</span>
                      </div>
                      <span className="text-[11px] text-white/40 font-medium">{item.time}</span>
                    </div>
              )}
                  <p className="text-[11px] text-white/30 pt-1 font-medium">Rappel : Il est temps de se reconnecter →</p>
                </div>
            }
            </div>
          )}
        </div>
      </div>
    </section>);

}