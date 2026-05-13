'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';

const testimonial = {
  quote:
  "J\'avais 1 400 connexions LinkedIn et je me sentais complètement seule professionnellement. GoConnexions m\'a aidée à vraiment parler à 12 d\'entre elles en un mois. Deux sont devenues clientes. Une est devenue co-fondatrice.",
  name: 'Camille Okafor',
  role: 'Fondatrice, Verdant Studio — Lagos / Londres',
  avatar:
  "https://img.rocket.new/generatedImages/rocket_gen_img_10971a33f-1772100600272.png",
  metric: { value: '2', label: 'clientes issues de 12 conversations significatives' }
};

export default function HumanAspectSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
      { threshold: 0.12 }
    );

    [quoteRef.current, ctaRef.current].forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.18}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.18}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <>
      {/* Human Aspect — emotional section */}
      <section
        ref={sectionRef}
        className="py-28 md:py-36 px-6 md:px-12 bg-surface">

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: testimonial */}
            <div ref={quoteRef}>
              <div className="relative">
                <div
                  className="absolute -top-8 -left-4 text-9xl font-serif leading-none text-accent/8 select-none pointer-events-none"
                  aria-hidden="true">

                  "
                </div>

                <div className="relative z-10 space-y-8">
                  <span className="tag-pill">Témoignage Réel</span>

                  <blockquote className="text-2xl md:text-3xl font-medium text-foreground leading-[1.4] tracking-tight">
                    <span className="font-serif italic font-normal text-muted">"</span>
                    {testimonial.quote}
                    <span className="font-serif italic font-normal text-muted">"</span>
                  </blockquote>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-accent-light shrink-0">
                      <AppImage
                        src={testimonial.avatar}
                        alt={`Portrait de ${testimonial.name}, utilisatrice de GoConnexions`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover" />

                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted">{testimonial.role}</p>
                    </div>
                  </div>

                  {/* Metric */}
                  <div className="flex items-baseline gap-3 pt-2 border-t border-gc-border">
                    <span className="text-4xl font-bold text-accent tracking-tight">{testimonial.metric.value}</span>
                    <span className="text-sm text-muted max-w-[200px] leading-snug">{testimonial.metric.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: image + emotional copy */}
            <div className="space-y-8">
              <div className="rounded-[2.5rem] overflow-hidden h-72 md:h-96 hover-lift clip-reveal active">
                <AppImage
                  src="https://img.rocket.new/generatedImages/rocket_gen_img_1f98688df-1772187687313.png"
                  alt="Deux professionnels ayant une vraie conversation autour d'un café dans un espace de travail ensoleillé"
                  fill={false}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover" />

              </div>

              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Le réseautage est une{' '}
                  <span className="font-serif italic font-normal text-accent">
                    compétence humaine.
                  </span>
                </h3>
                <p className="text-sm text-muted leading-relaxed max-w-md">
                  Les meilleures opportunités de votre carrière ne viendront pas d'un message froid ou d'une publication virale. Elles viendront d'une vraie conversation avec quelqu'un qui vous fait confiance. Nous vous aidons à en avoir davantage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        id="cta"
        className="py-24 md:py-32 px-6 md:px-12 bg-gc-bg relative overflow-hidden">

        <div className="absolute inset-0 animated-gradient opacity-[0.97]" aria-hidden="true" />

        <div
          className="absolute top-0 right-0 w-80 h-80 blob opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }}
          aria-hidden="true" />

        <div
          className="absolute bottom-0 left-0 w-64 h-64 blob opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(126,184,240,0.5) 0%, transparent 70%)' }}
          aria-hidden="true" />


        <div ref={ctaRef} className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <span className="inline-block border border-white/20 text-white/70 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
            Accès Anticipé Ouvert
          </span>

          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05]">
            Votre prochaine grande opportunité est à{' '}
            <span className="font-serif italic font-normal" style={{ color: '#a8d4f5' }}>
              une vraie conversation de distance.
            </span>
          </h2>

          <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Rejoignez plus de 2 400 entrepreneurs et freelances qui construisent des relations professionnelles significatives sur GoConnexions. Gratuit pour commencer, sans carte bancaire.
          </p>

          {!submitted ?
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">

              <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-all" />

              <button
              type="submit"
              className="bg-white text-primary font-bold px-7 py-4 rounded-full text-sm hover:bg-accent-light transition-colors whitespace-nowrap">

                Obtenir l'Accès Anticipé
              </button>
            </form> :

          <div className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 rounded-full px-8 py-4 max-w-sm mx-auto">
              <svg width="18" height="18" fill="none" stroke="#7eb8f0" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-semibold text-sm">Vous êtes sur la liste — nous vous contacterons !</span>
            </div>
          }

          <p className="text-white/30 text-xs">
            Pas de spam. Pas d'algorithme. Juste une plateforme qui vous aide à mieux vous connecter.
          </p>
        </div>
      </section>
    </>);

}