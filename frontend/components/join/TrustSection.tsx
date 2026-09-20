import React from 'react';
import { TRUST_ASSURANCES, TRUST_CONFIG } from '@/lib/join/content';
import Icon from './Icon';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

// Section pilotée par lib/join/content.ts → TRUST_CONFIG. Aucun chiffre, témoignage ni logo
// n'est écrit ici : chaque bloc n'apparaît que si de VRAIES données sont fournies.
// Sans données, seuls les engagements vérifiables (TRUST_ASSURANCES) sont affichés.

export default function TrustSection() {
  const { stats, testimonials, logos, partners } = TRUST_CONFIG;

  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="gcj-trust-title">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            id="gcj-trust-title"
            eyebrow="Confiance"
            title={
              <>
                Vous gardez <span className="gcj-em">la main.</span>
              </>
            }
          >
            Des principes simples, dès votre inscription.
          </SectionHeading>
        </Reveal>

        {stats.length > 0 && (
          <Reveal>
            <dl className="mt-12 grid grid-cols-2 gap-4 sm:mt-16 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col rounded-3xl border border-slate-200 bg-[var(--j-slate-50)] p-6 text-center">
                  <dt className="order-2 mt-1 text-sm text-slate-500">{s.label}</dt>
                  <dd className="text-3xl font-extrabold tracking-tight text-[var(--j-navy-2)] sm:text-4xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        {testimonials.length > 0 && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.author} delay={i * 100} className="flex">
                <figure className="flex w-full flex-col rounded-3xl border border-slate-200 bg-[var(--j-cream)] p-7">
                  <blockquote className="flex-1 text-[15px] leading-relaxed text-slate-700">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="font-bold text-[var(--j-navy-2)]">{t.author}</span>
                    {t.role && <span className="text-slate-500"> · {t.role}</span>}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}

        <ul className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-3 md:gap-6">
          {TRUST_ASSURANCES.map((a, i) => (
            <li key={a.title} className="flex">
              <Reveal delay={i * 110} className="flex w-full">
                <article className="w-full rounded-3xl border border-slate-200 bg-[var(--j-slate-50)] p-6 sm:p-7">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--j-orange-soft)] text-[var(--j-orange-deep)]">
                    <Icon name={a.icon} size={22} />
                  </span>
                  <h3 className="text-[17px] font-bold tracking-tight text-[var(--j-navy-2)]">{a.title}</h3>
                  <p className="mt-2 leading-relaxed text-[var(--j-text-2)]">{a.text}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        {(logos.length > 0 || partners.length > 0) && (
          <Reveal>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {[...logos, ...partners].map((l) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={l.name} src={l.src} alt={l.name} loading="lazy" className="h-8 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
