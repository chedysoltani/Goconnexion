'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@/types/auth';

const roles = [
  {
    id: 'freelancer' as UserRole,
    emoji: '💻',
    title: 'Freelancer',
    subtitle: 'Je propose mes compétences',
    description: 'Trouvez des projets correspondant à vos skills, gérez votre portfolio et construisez une clientèle solide.',
    benefits: ['Accès aux projets ouverts', 'Portfolio visible', 'Mise en relation directe'],
    gradient: 'from-blue-500/20 to-cyan-500/10',
    border: 'rgba(59,130,246,0.5)',
    glow: 'rgba(59,130,246,0.15)',
    dot: '#3b82f6',
  },
  {
    id: 'entrepreneur' as UserRole,
    emoji: '🚀',
    title: 'Entrepreneur',
    subtitle: 'Je cherche des talents',
    description: 'Publiez vos projets, recrutez les meilleurs freelancers et développez votre réseau professionnel.',
    benefits: ['Publiez vos projets', 'Accès aux freelancers', 'Réseau B2B'],
    gradient: 'from-violet-500/20 to-purple-500/10',
    border: 'rgba(139,92,246,0.5)',
    glow: 'rgba(139,92,246,0.15)',
    dot: '#8b5cf6',
  },
];

export default function SelectRolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [hovered, setHovered] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (selected) router.push(`/auth/signup?role=${selected}`);
  };

  return (
    <div className="auth-bg min-h-screen flex flex-col">
      {/* Decorative lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {[15, 35, 55, 75, 92].map((left, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${left}%`,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(74,144,217,0.07) 40%, rgba(74,144,217,0.07) 60%, transparent 100%)',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-sm">GC</span>
          </div>
          <span className="font-semibold text-white/90 text-[15px]">GoConnexions</span>
        </Link>
        <Link href="/auth/login" className="text-sm whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span className="hidden sm:inline">Déjà un compte ?{' '}</span>
          <span className="text-accent font-medium hover:underline">Se connecter</span>
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          {/* Heading */}
          <div className="text-center mb-12 slide-up">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-semibold uppercase tracking-widest"
              style={{
                background: 'rgba(74,144,217,0.1)',
                border: '1px solid rgba(74,144,217,0.2)',
                color: 'rgba(74,144,217,0.9)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Étape 1 sur 4
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Qui êtes-vous ?
            </h1>
            <p className="text-base max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Choisissez le profil qui vous correspond. Vous pourrez le modifier à tout moment.
            </p>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10 max-w-2xl mx-auto w-full">
            {roles.map((role, i) => {
              const isSelected = selected === role.id;
              const isHov = hovered === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  onMouseEnter={() => setHovered(role.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`role-card text-left slide-up slide-up-${i + 2} ${isSelected ? 'selected' : ''}`}
                  style={isSelected ? {
                    boxShadow: `0 0 0 1.5px ${role.border}, 0 24px 48px ${role.glow}`,
                    borderColor: role.border,
                  } : isHov ? {
                    borderColor: role.border,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.25)`,
                  } : {}}
                >
                  {/* Top */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300"
                      style={{
                        background: isSelected || isHov ? `linear-gradient(135deg, ${role.glow.replace('0.15', '0.3')}, transparent)` : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isSelected ? role.border : 'rgba(255,255,255,0.1)'}`,
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      {role.emoji}
                    </div>
                    {isSelected && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: role.dot }}
                      >
                        ✓
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{role.title}</h3>
                  <p className="text-xs font-medium mb-3" style={{ color: role.dot }}>{role.subtitle}</p>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {role.description}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-2">
                    {role.benefits.map((b, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: role.dot }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 slide-up slide-up-5">
            <button
              onClick={handleContinue}
              disabled={!selected}
              className="px-10 py-4 rounded-2xl font-semibold text-sm text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={selected ? {
                background: 'linear-gradient(135deg, #4a90d9 0%, #2563eb 100%)',
                boxShadow: '0 8px 24px rgba(74,144,217,0.4)',
              } : {
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {selected
                ? `Continuer en tant que ${roles.find((r) => r.id === selected)?.title} →`
                : 'Sélectionnez un profil pour continuer'}
            </button>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Modifiable à tout moment dans les paramètres
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
