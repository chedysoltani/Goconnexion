import React from 'react';
import { Bell, Briefcase, Check, MessageCircle, Rocket, Search, Users } from 'lucide-react';

// Composition purement graphique (aucune photo, aucun faux utilisateur) : un profil au centre,
// des profils qui s'y relient, une notification et un message. Illustrative — d'où role="img".

const LINES: Array<{ x: number; y: number; delay: string }> = [
  { x: 15, y: 21, delay: '0.5s' },
  { x: 87, y: 27, delay: '0.65s' },
  { x: 11, y: 77, delay: '0.8s' },
  { x: 89, y: 79, delay: '0.95s' },
];

const SATELLITES = [
  { left: '15%', top: '21%', Icon: Briefcase, grad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', delay: '0.7s', fd: '0s' },
  { left: '87%', top: '27%', Icon: Rocket, grad: 'linear-gradient(135deg,#fb923c,#ea580c)', delay: '0.85s', fd: '-2s' },
  { left: '11%', top: '77%', Icon: Search, grad: 'linear-gradient(135deg,#14b8a6,#0f766e)', delay: '1s', fd: '-4s' },
  { left: '89%', top: '79%', Icon: Users, grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', delay: '1.15s', fd: '-1s' },
];

export default function HeroVisual() {
  return (
    <div
      role="img"
      aria-label="Illustration : des profils professionnels reliés entre eux, avec une notification de connexion et un message."
      className="relative mx-auto aspect-square w-full max-w-[300px] min-[400px]:max-w-[360px] sm:max-w-[480px] lg:mr-0 lg:max-w-[520px]"
    >
      {/* halo */}
      <div
        className="absolute inset-[8%] rounded-full opacity-80 blur-2xl"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.28), transparent 65%)' }}
      />

      {/* liens */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        <circle cx="50" cy="52" r="30" stroke="rgba(255,255,255,0.08)" strokeWidth="0.35" strokeDasharray="1.2 1.8" />
        <circle cx="50" cy="52" r="44" stroke="rgba(255,255,255,0.05)" strokeWidth="0.35" strokeDasharray="1.2 1.8" />
        {LINES.map((l) => (
          <line
            key={`${l.x}-${l.y}`}
            x1={l.x}
            y1={l.y}
            x2="50"
            y2="52"
            pathLength={1}
            stroke="rgba(251,146,60,0.55)"
            strokeWidth="0.45"
            strokeLinecap="round"
            className="gcj-line"
            style={{ ['--d' as string]: l.delay } as React.CSSProperties}
          />
        ))}
      </svg>

      {/* profils satellites */}
      {SATELLITES.map(({ left, top, Icon, grad, delay, fd }) => (
        // Le conteneur porte le positionnement (translate) ; l'animation vit sur un enfant :
        // un @keyframes qui touche `transform` écraserait sinon le translate de centrage.
        <div key={`${left}-${top}`} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left, top }}>
          <div className="gcj-pop" style={{ ['--d' as string]: delay } as React.CSSProperties}>
            <div
              className="gcj-float flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white shadow-lg sm:h-14 sm:w-14"
              style={{ background: grad, ['--fd' as string]: fd } as React.CSSProperties}
            >
              <Icon className="h-[18px] w-[18px] sm:h-6 sm:w-6" strokeWidth={1.9} />
            </div>
          </div>
        </div>
      ))}

      {/* carte profil centrale */}
      <div className="absolute left-1/2 top-[52%] w-[62%] -translate-x-1/2 -translate-y-1/2">
        <div className="gcj-pop" style={{ ['--d' as string]: '0.3s' } as React.CSSProperties}>
          <div
            className="rounded-2xl border border-white/15 p-3 shadow-2xl sm:rounded-3xl sm:p-5"
            style={{ background: 'linear-gradient(160deg, #1f3f66 0%, #10244a 100%)' }}
          >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-[var(--j-ink)] sm:h-12 sm:w-12 sm:text-base"
              style={{ background: 'linear-gradient(135deg,#fdba74,#f97316)' }}
            >
              Vous
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold text-white sm:text-[15px]">Votre profil</p>
              <p className="truncate text-[10px] text-slate-300 sm:text-xs">Ce que vous faites, ce que vous cherchez</p>
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-4">
            {['Partenaires', 'Talents', 'Opportunités'].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-slate-100 sm:px-2.5 sm:py-1 sm:text-[11px]"
              >
                {t}
              </span>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* notification */}
      <div
        className="gcj-pop absolute left-[30%] top-[2%] w-[52%] sm:left-[32%]"
        style={{ ['--d' as string]: '1.25s' } as React.CSSProperties}
      >
        <div className="gcj-float flex items-center gap-2 rounded-xl bg-white p-2 shadow-xl sm:gap-3 sm:rounded-2xl sm:p-3" style={{ ['--fd' as string]: '-3s' } as React.CSSProperties}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 sm:h-9 sm:w-9 sm:rounded-xl">
            <Bell className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold leading-tight text-slate-900 sm:text-xs">Nouvelle connexion</p>
            <p className="text-[9px] leading-tight text-slate-500 sm:text-[11px]">Un profil souhaite échanger avec vous</p>
          </div>
        </div>
      </div>

      {/* message */}
      <div
        className="gcj-pop absolute bottom-[1%] left-[24%] w-[54%]"
        style={{ ['--d' as string]: '1.4s' } as React.CSSProperties}
      >
        <div className="gcj-float flex items-center gap-2 rounded-xl bg-[var(--j-navy-3)] p-2 shadow-xl ring-1 ring-white/15 sm:gap-3 sm:rounded-2xl sm:p-3" style={{ ['--fd' as string]: '-5s' } as React.CSSProperties}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-orange-300 sm:h-9 sm:w-9 sm:rounded-xl">
            <MessageCircle className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" strokeWidth={2.2} />
          </span>
          <p className="text-[10px] font-medium leading-tight text-slate-100 sm:text-xs">
            «&nbsp;Et si on collaborait&nbsp;?&nbsp;»
          </p>
          <span className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white sm:h-5 sm:w-5">
            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3.5} />
          </span>
        </div>
      </div>
    </div>
  );
}
