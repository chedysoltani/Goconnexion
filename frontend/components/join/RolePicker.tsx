'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PERSONAS } from '@/lib/join/content';
import { buildSignupHref, PERSONA_SIGNUP_ROLE, type Persona } from '@/lib/join/funnel';
import { useCampaign } from '@/lib/join/useSignupHref';
import { setCampaignPersona } from '@/lib/tracking/campaign';
import { trackEvent } from '@/lib/tracking/analytics';
import Icon from './Icon';
import Reveal from './Reveal';

/**
 * Quatre profils = quatre vrais liens vers l'inscription existante, rôle pré-rempli.
 * Le choix est mémorisé : tous les autres CTA de la page suivent ensuite ce profil.
 */
export default function RolePicker() {
  const campaign = useCampaign();

  const hrefFor = (persona: Persona) => buildSignupHref({ ...campaign, persona });

  const handleSelect = (persona: Persona) => {
    trackEvent('role_selected', { persona, signup_role: PERSONA_SIGNUP_ROLE[persona] });
    setCampaignPersona(persona);
  };

  return (
    <ul className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {PERSONAS.map((p, i) => (
        <li key={p.id} className="flex">
          <Reveal delay={i * 100} className="flex w-full">
            <Link
              href={hrefFor(p.id)}
              onClick={() => handleSelect(p.id)}
              className="gcj-card gcj-persona group flex w-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6 hover:border-orange-400/50 hover:shadow-[0_24px_48px_-20px_rgba(249,115,22,0.4)] sm:p-7"
            >
              <span className="gcj-persona-icon mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-300">
                <Icon name={p.icon} size={26} />
              </span>
              <h3 className="text-xl font-bold tracking-tight text-white">{p.title}</h3>
              <p className="mt-2.5 flex-1 leading-relaxed text-[var(--j-on-dark-2)]">{p.text}</p>
              <span className="gcj-persona-cta mt-6 inline-flex items-center gap-2 text-[15px] font-bold text-[var(--j-orange)]">
                {p.cta}
                <ArrowRight size={17} strokeWidth={2.4} aria-hidden="true" />
              </span>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
