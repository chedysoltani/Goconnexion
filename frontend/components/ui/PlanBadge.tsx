'use client';

import React from 'react';
import { Zap, Building2, Sparkles } from 'lucide-react';

type Plan = 'FREE' | 'PRO' | 'BUSINESS';

const PLAN_CONFIG: Record<Plan, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}> = {
  FREE: {
    label: 'Gratuit',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.2)',
    icon: <Sparkles size={9} />,
  },
  PRO: {
    label: 'Pro',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.25)',
    icon: <Zap size={9} />,
  },
  BUSINESS: {
    label: 'Business',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.1)',
    border: 'rgba(124,58,237,0.25)',
    icon: <Building2 size={9} />,
  },
};

interface PlanBadgeProps {
  plan: Plan;
  size?: 'sm' | 'md';
  className?: string;
}

export default function PlanBadge({ plan, size = 'sm', className = '' }: PlanBadgeProps) {
  if (plan === 'FREE') return null;

  const cfg = PLAN_CONFIG[plan];
  const pad = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const text = size === 'sm' ? 'text-[9px]' : 'text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide ${pad} ${text} ${className}`}
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
