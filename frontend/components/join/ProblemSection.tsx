import React from 'react';
import { ArrowDown } from 'lucide-react';
import { PROBLEMS } from '@/lib/join/content';
import Icon from './Icon';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

export default function ProblemSection() {
  return (
    <section className="relative bg-[var(--j-cream)] py-20 sm:py-28" aria-labelledby="gcj-problem-title">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            id="gcj-problem-title"
            eyebrow="Le constat"
            title={
              <>
                Créer des connexions, ce n’est pas seulement <span className="gcj-em">accumuler des contacts.</span>
              </>
            }
          />
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-3 md:gap-6">
          {PROBLEMS.map((p, i) => (
            <li key={p.title} className="flex">
              <Reveal delay={i * 110} className="flex w-full">
                <article className="w-full rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-8">
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Icon name={p.icon} size={24} />
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-[var(--j-navy-2)]">{p.title}</h3>
                  <p className="mt-2.5 leading-relaxed text-[var(--j-text-2)]">{p.text}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        {/* Transition vers la solution */}
        <Reveal delay={150}>
          <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center text-center sm:mt-16">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--j-orange-soft)] text-[var(--j-orange-deep)]" aria-hidden="true">
              <ArrowDown size={20} strokeWidth={2.4} />
            </span>
            <p className="mt-5 text-balance text-xl font-bold leading-snug tracking-tight text-[var(--j-navy-2)] sm:text-2xl">
              GoConnexions veut remettre la <span className="gcj-em !font-semibold">connexion humaine</span> au centre.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
