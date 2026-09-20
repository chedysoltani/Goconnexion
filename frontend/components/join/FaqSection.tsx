import React from 'react';
import { FAQ } from '@/lib/join/content';
import Faq from './Faq';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

export default function FaqSection() {
  return (
    <section className="bg-[var(--j-slate-50)] py-20 sm:py-28" aria-labelledby="gcj-faq-title">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            id="gcj-faq-title"
            eyebrow="FAQ"
            title={
              <>
                Vos <span className="gcj-em">questions.</span>
              </>
            }
          />
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-10 sm:mt-14">
            <Faq items={FAQ} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
