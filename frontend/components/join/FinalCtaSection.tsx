import React from 'react';
import { CTA_REASSURANCE } from '@/lib/join/content';
import FunnelCta from './FunnelCta';
import Reveal from './Reveal';

// Réseau décoratif : mêmes profils reliés que dans le hero, en fond du CTA final.
// Les points sont placés en périphérie pour ne jamais passer sous le texte ; ceux du milieu
// (`center`) sont masqués sur mobile où le texte occupe toute la largeur.
const NODES = [
  { x: 6, y: 26 }, { x: 15, y: 74, center: true }, { x: 30, y: 9 }, { x: 70, y: 9 },
  { x: 85, y: 72, center: true }, { x: 94, y: 30 }, { x: 50, y: 94 }, { x: 10, y: 90 }, { x: 90, y: 88 },
] as const;
const EDGES = [[0, 2], [2, 3], [3, 5], [1, 0], [1, 6], [4, 5], [4, 6], [7, 1], [8, 4]] as const;

export default function FinalCtaSection() {
  return (
    <section id="gcj-final" className="gcj-dark bg-[var(--j-cream)] px-4 py-16 sm:px-8 sm:py-24" aria-labelledby="gcj-final-title">
      <Reveal className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:rounded-[2.5rem] sm:px-16 sm:py-24"
          style={{
            background:
              'radial-gradient(70% 80% at 50% 0%, rgba(249,115,22,0.32), transparent 65%), linear-gradient(160deg, #0f1f3d 0%, #050e1f 100%)',
          }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {EDGES.map(([a, b]) => (
              <line key={`${a}-${b}`} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke="rgba(251,146,60,0.28)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
          {NODES.map((n, i) => (
            <span
              key={i}
              className={`pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--j-orange)] ${'center' in n ? 'max-sm:hidden' : ''}`}
              style={{ left: `${n.x}%`, top: `${n.y}%`, opacity: i % 2 ? 0.45 : 0.8 }}
              aria-hidden="true"
            />
          ))}

          <div className="relative mx-auto max-w-2xl">
            <h2
              id="gcj-final-title"
              className="text-balance text-[2rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl"
            >
              Prêt à développer votre réseau <span className="gcj-em">autrement ?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--j-on-dark-2)] sm:text-lg">
              Rejoignez GoConnexions et commencez à créer des connexions qui peuvent ouvrir de nouvelles opportunités.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3">
              <FunnelCta placement="final" size="lg" className="w-full sm:w-auto" />
              <p className="text-[13px] text-slate-400">{CTA_REASSURANCE}</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
