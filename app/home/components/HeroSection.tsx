'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

export default function HeroSection() {
  const heroImgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax on hero image
    const handleScroll = () => {
      if (heroImgRef?.current) {
        const y = window.scrollY;
        heroImgRef.current.style.transform = `translateY(${y * 0.28}px) scale(1.08)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Entrance animations with stagger
    const elements = [titleRef?.current, subtitleRef?.current, ctaRef?.current, cardRef?.current];
    elements?.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(32px)';
      el.style.transition = `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.14}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.14}s`;
      // Trigger after mount
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (el) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }
        }, 80 + i * 140);
      });
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col justify-end overflow-hidden noise"
      style={{ background: '#0e1f36' }}>

      {/* Background image — parallax layer */}
      <div ref={heroImgRef} className="absolute inset-0 will-change-transform">
        <AppImage
          src="https://img.rocket.new/generatedImages/rocket_gen_img_1fd93838c-1767535378886.png"
          alt="Professionals connecting and collaborating in a modern workspace"
          fill
          priority
          className="object-cover opacity-40 saturate-[0.7]"
          sizes="100vw" />

      </div>
      {/* Gradient overlays — depth layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e1f36]/60 via-[#0e1f36]/30 to-[#0e1f36]/85 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0e1f36]/60 via-transparent to-transparent pointer-events-none" />
      {/* Animated blob — atmospheric depth */}
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 blob opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4a90d9 0%, transparent 70%)' }} />

      {/* Top tag */}
      <div className="absolute top-28 left-6 md:left-12 z-10">
        <span className="glass px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-accent/90">
          Réseau Centré sur l'Humain
        </span>
      </div>
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 pb-16 md:pb-24 pt-36 flex flex-col md:flex-row items-end justify-between gap-12">

        {/* Left: headline + CTA */}
        <div className="max-w-2xl">
          <h1
            ref={titleRef}
            className="hero-title text-white mb-6">

            Construisez des connexions qui{' '}
            <span className="font-serif italic font-normal" style={{ color: '#7eb8f0' }}>
              ont vraiment
            </span>{' '}
            du sens.
          </h1>
          <p
            ref={subtitleRef}
            className="text-white/60 text-base md:text-lg max-w-md leading-relaxed mb-10 font-light">

            GoConnexions va au-delà du nombre d'abonnés. Suivis intelligents, check-ins humains et vraies conversations — pour que votre réseau grandisse avec vous, pas sans vous.
          </p>
          <div ref={ctaRef} className="flex flex-wrap items-center gap-4">
            <a
              href="#cta"
              className="btn-primary px-7 py-4 rounded-full text-[14px] inline-flex items-center gap-2.5 font-semibold">

              Accès Anticipé Gratuit
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#features"
              className="text-white/60 hover:text-white text-[13px] font-medium transition-colors flex items-center gap-2 underline underline-offset-4 decoration-white/20">

              Voir comment ça marche
            </a>
          </div>
        </div>

        {/* Right: floating glass social proof card — from T1 */}
        <div
          ref={cardRef}
          className="glass rounded-[2rem] p-8 max-w-xs w-full shadow-2xl space-y-6 shrink-0">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Cette semaine</p>
              <p className="text-2xl font-bold text-foreground">+47 conversations</p>
              <p className="text-sm text-muted">significatives démarrées</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#4a90d9" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* Avatar stack */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {[
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=48&h=48&fit=crop&crop=face']?.
              map((src, i) =>
              <div key={i} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden">
                  <AppImage
                  src={src}
                  alt={`GoConnexions member ${i + 1}`}
                  width={36}
                  height={36}
                  className="object-cover w-full h-full" />

                </div>
              )}
              <div className="w-9 h-9 rounded-full border-2 border-white bg-accent-light flex items-center justify-center text-[10px] font-bold text-accent">
                +2k
              </div>
            </div>
            <p className="text-xs text-muted font-medium">Rejoints ce mois-ci</p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-muted/60">
            <span>Vraies personnes · Vrais résultats</span>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-px h-8 bg-white/20" />
        <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>);

}