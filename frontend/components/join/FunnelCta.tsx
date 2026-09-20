'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CTA_LABEL } from '@/lib/join/content';
import { useSignupHref } from '@/lib/join/useSignupHref';
import { trackEvent, type FunnelEvent } from '@/lib/tracking/analytics';

export type CtaPlacement = 'hero' | 'benefits' | 'steps' | 'final' | 'sticky' | 'header';

const EVENT_BY_PLACEMENT: Record<CtaPlacement, FunnelEvent> = {
  hero: 'hero_cta_click',
  benefits: 'benefit_cta_click',
  steps: 'steps_cta_click',
  final: 'final_cta_click',
  sticky: 'sticky_cta_click',
  header: 'header_cta_click',
};

interface FunnelCtaProps {
  placement: CtaPlacement;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

/**
 * Le bouton d'inscription du tunnel : un vrai lien vers l'inscription EXISTANTE, avec
 * la campagne (utm_*, ref) et le profil choisi. Chaque clic est tracé avec son emplacement.
 */
export default function FunnelCta({ placement, label = CTA_LABEL, size = 'md', className = '', id }: FunnelCtaProps) {
  const href = useSignupHref();
  const sizeClass = size === 'lg' ? 'gcj-btn-lg' : size === 'sm' ? 'gcj-btn-sm' : '';

  return (
    <Link
      id={id}
      href={href}
      className={`gcj-btn gcj-btn-primary ${sizeClass} ${className}`}
      onClick={() => trackEvent(EVENT_BY_PLACEMENT[placement], { placement, cta_label: label })}
    >
      {label}
      <ArrowRight size={size === 'sm' ? 16 : 18} aria-hidden="true" strokeWidth={2.4} />
    </Link>
  );
}
