import React from 'react';
import { BENEFITS } from '@/lib/join/content';
import FunnelCta from './FunnelCta';
import Icon from './Icon';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

export default function SolutionSection() {
  return (
    <section className="gcj-dark relative overflow-hidden bg-[var(--j-navy)] py-20 sm:py-28" aria-labelledby="gcj-solution-title">
      <div
        className="pointer-events-none absolute -right-40 top-0 h-[480px] w-[480px] rounded-full opacity-70 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.16), transparent 65%)' }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            id="gcj-solution-title"
            tone="dark"
            eyebrow="La solution"
            title={
              <>
                Une plateforme pensée pour créer de <span className="gcj-em">vraies connexions.</span>
              </>
            }
          />
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {BENEFITS.map((b, i) => (
            <li key={b.title} className="flex">
              <Reveal delay={i * 100} className="flex w-full">
                <article className="gcj-card group w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 hover:border-orange-400/40 hover:bg-white/[0.07] hover:shadow-[0_24px_48px_-20px_rgba(249,115,22,0.35)] sm:p-7">
                  <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400 transition-colors group-hover:bg-orange-500 group-hover:text-slate-950">
                    <Icon name={b.icon} size={24} />
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-white">{b.title}</h3>
                  <p className="mt-2.5 leading-relaxed text-[var(--j-on-dark-2)]">{b.text}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={150}>
          <div className="mt-12 flex justify-center sm:mt-14">
            <FunnelCta placement="benefits" size="lg" className="w-full sm:w-auto" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
