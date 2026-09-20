import React from 'react';
import { Check } from 'lucide-react';
import FunnelCta from './FunnelCta';
import HeroVisual from './HeroVisual';

// « Inscription en 4 étapes » : confirmé par SignupForm (Compte, Identité, Profil, Récap).
const REASSURANCE = ['Inscription gratuite', 'Sans carte bancaire', 'En 4 étapes'];

export default function HeroSection() {
  return (
    <section className="gcj-dark gcj-hero-bg relative overflow-hidden" aria-labelledby="gcj-hero-title">
      <div className="gcj-dots pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-28 lg:pt-36">
        <div className="text-center lg:text-left">
          <p
            className="gcj-rise mb-5 flex items-start justify-center gap-2.5 text-[11px] font-bold uppercase leading-relaxed tracking-[0.14em] text-orange-300 sm:text-xs lg:justify-start"
            style={{ ['--d' as string]: '0ms' } as React.CSSProperties}
          >
            <span className="gcj-pulse mt-[5px] h-2 w-2 shrink-0 rounded-full bg-[var(--j-orange)]" aria-hidden="true" />
            <span className="text-center lg:text-left">Se connecter. Se faire connaître. Créer des opportunités.</span>
          </p>

          <h1
            id="gcj-hero-title"
            className="gcj-slide text-balance text-[2.15rem] font-extrabold leading-[1.06] tracking-[-0.03em] text-white min-[400px]:text-[2.4rem] sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]"
            style={{ ['--d' as string]: '80ms' } as React.CSSProperties}
          >
            Les bonnes connexions peuvent changer <span className="gcj-em">vos opportunités.</span>
          </h1>

          <p
            className="gcj-slide mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--j-on-dark-2)] sm:text-lg lg:mx-0"
            style={{ ['--d' as string]: '180ms' } as React.CSSProperties}
          >
            GoConnexions vous aide à rencontrer les bonnes personnes, développer votre réseau et créer de nouvelles
            opportunités professionnelles.
          </p>

          <div
            className="gcj-rise mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start"
            style={{ ['--d' as string]: '280ms' } as React.CSSProperties}
          >
            <FunnelCta placement="hero" size="lg" id="gcj-hero-cta" />
            <a href="#comment-ca-marche" className="gcj-btn gcj-btn-ghost-dark gcj-btn-lg !text-[15px]">
              Découvrir comment ça fonctionne
            </a>
          </div>

          <ul
            className="gcj-rise mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-slate-300 lg:justify-start"
            style={{ ['--d' as string]: '380ms' } as React.CSSProperties}
          >
            {REASSURANCE.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check size={15} strokeWidth={3} className="text-[var(--j-orange)]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* w-full : sans largeur explicite, le carré (aspect-ratio) se réduirait à son contenu. */}
        <div className="w-full">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
