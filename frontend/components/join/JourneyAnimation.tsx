'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Handshake, Lightbulb, MessageCircle, Sparkles, UserRound } from 'lucide-react';
import { JOURNEY } from '@/lib/join/content';

const NODE_ICONS = [UserRound, Handshake, MessageCircle, Lightbulb, Sparkles];

/**
 * Personne A → connexion → conversation → collaboration → opportunité.
 * Se déroule une seule fois quand la section entre à l'écran (pas de boucle infinie).
 * Horizontal sur desktop, vertical sur mobile ; instantané si mouvement réduit.
 */
export default function JourneyAnimation() {
  const ref = useRef<HTMLOListElement>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setPlayed(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlayed(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <ol
      ref={ref}
      className={`gcj-journey relative mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-5 md:gap-2 ${played ? 'is-in' : ''}`}
    >
      {/* fil (horizontal desktop / vertical mobile) */}
      <span
        className="absolute bottom-6 left-[27px] top-6 w-0.5 rounded-full bg-slate-200 md:bottom-auto md:left-[10%] md:right-[10%] md:top-[27px] md:h-0.5 md:w-auto"
        aria-hidden="true"
      />
      <span
        className="gcj-journey-track absolute bottom-6 left-[27px] top-6 w-0.5 rounded-full md:bottom-auto md:left-[10%] md:right-[10%] md:top-[27px] md:h-0.5 md:w-auto"
        aria-hidden="true"
      />

      {JOURNEY.map((step, i) => {
        const Icon = NODE_ICONS[i];
        const last = i === JOURNEY.length - 1;
        return (
          <li
            key={step.label}
            className="gcj-journey-node relative flex items-center gap-5 md:flex-col md:gap-4 md:text-center"
            style={{ ['--i' as string]: i } as React.CSSProperties}
          >
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-[var(--j-cream)] shadow-lg ${
                last ? 'gcj-journey-last bg-[var(--j-orange)] text-[var(--j-ink)]' : 'bg-[var(--j-navy-2)] text-white'
              }`}
            >
              <Icon size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[15px] font-bold text-[var(--j-navy-2)]">{step.label}</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-slate-500">{step.hint}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
