import React from 'react';
import { Check } from 'lucide-react';
import { CTA_LABEL_PROFILE, CTA_REASSURANCE, STEPS } from '@/lib/join/content';
import FunnelCta from './FunnelCta';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/* Trois mini-maquettes d'interface, en pur CSS (aucune image à charger). */
function MockProfile() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5" aria-hidden="true">
      <div className="flex items-center gap-2.5">
        <span className="h-9 w-9 rounded-full" style={{ background: 'linear-gradient(135deg,#fdba74,#f97316)' }} />
        <span className="flex-1 space-y-1.5">
          <span className="block h-2.5 w-2/3 rounded-full bg-slate-300" />
          <span className="block h-2 w-1/2 rounded-full bg-slate-200" />
        </span>
      </div>
      <span className="block h-2 w-full rounded-full bg-slate-200" />
      <span className="block h-2 w-4/5 rounded-full bg-slate-200" />
      <span className="flex gap-1.5">
        <span className="h-5 w-14 rounded-full bg-orange-100" />
        <span className="h-5 w-12 rounded-full bg-slate-100" />
        <span className="h-5 w-16 rounded-full bg-slate-100" />
      </span>
    </div>
  );
}

function MockDiscover() {
  return (
    <div className="flex h-full flex-col justify-center gap-2" aria-hidden="true">
      {['#3b82f6', '#f97316', '#14b8a6'].map((c, i) => (
        <div key={c} className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-2.5 py-1 shadow-sm">
          <span className="h-6 w-6 rounded-full" style={{ background: c }} />
          <span className="flex-1 space-y-1">
            <span className="block h-2 rounded-full bg-slate-300" style={{ width: `${70 - i * 12}%` }} />
            <span className="block h-1.5 w-1/3 rounded-full bg-slate-200" />
          </span>
          <span className={`h-4 w-4 rounded-full ${i === 1 ? 'bg-[var(--j-orange)]' : 'bg-slate-200'}`} />
        </div>
      ))}
    </div>
  );
}

function MockConnect() {
  return (
    <div className="flex h-full items-center justify-center gap-3" aria-hidden="true">
      <span className="h-11 w-11 rounded-full" style={{ background: 'linear-gradient(135deg,#fdba74,#f97316)' }} />
      <span className="relative flex h-8 w-16 items-center justify-center">
        <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-orange-400 to-blue-500" />
        <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white">
          <Check size={13} strokeWidth={3.5} />
        </span>
      </span>
      <span className="h-11 w-11 rounded-full" style={{ background: 'linear-gradient(135deg,#60a5fa,#1d4ed8)' }} />
    </div>
  );
}

const MOCKS = [MockProfile, MockDiscover, MockConnect];

export default function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="scroll-mt-16 bg-white py-20 sm:py-28" aria-labelledby="gcj-how-title">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            id="gcj-how-title"
            eyebrow="Comment ça fonctionne"
            title={
              <>
                Trois étapes, <span className="gcj-em">c’est tout.</span>
              </>
            }
          />
        </Reveal>

        <ol className="relative mt-12 grid gap-5 sm:mt-16 md:grid-cols-3 md:gap-6">
          {/* fil reliant les étapes (desktop) */}
          <span
            className="pointer-events-none absolute left-[16%] right-[16%] top-[3.1rem] hidden h-px border-t-2 border-dashed border-orange-200 md:block"
            aria-hidden="true"
          />
          {STEPS.map((s, i) => {
            const Mock = MOCKS[i];
            return (
              <li key={s.n} className="flex">
                <Reveal delay={i * 130} className="flex w-full">
                  <article className="gcj-card relative w-full rounded-3xl border border-slate-200 bg-[var(--j-slate-50)] p-6 hover:shadow-[0_24px_48px_-24px_rgba(15,31,61,0.25)] sm:p-7">
                    <span
                      className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-extrabold text-[var(--j-ink)] shadow-md"
                      style={{ background: 'linear-gradient(135deg,#fdba74,#f97316)' }}
                    >
                      {s.n}
                    </span>
                    <h3 className="text-xl font-bold tracking-tight text-[var(--j-navy-2)]">{s.title}</h3>
                    <p className="mt-2.5 leading-relaxed text-[var(--j-text-2)]">{s.text}</p>
                    <div className="mt-6 h-[9.5rem] rounded-2xl border border-slate-200 bg-white p-4">
                      <Mock />
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>

        <Reveal delay={150}>
          <div className="mt-12 flex flex-col items-center gap-3 sm:mt-14">
            <FunnelCta placement="steps" size="lg" label={CTA_LABEL_PROFILE} className="w-full sm:w-auto" />
            <p className="text-[13px] text-slate-500">{CTA_REASSURANCE}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
