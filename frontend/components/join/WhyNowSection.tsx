import React from 'react';
import JourneyAnimation from './JourneyAnimation';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

export default function WhyNowSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--j-cream)] py-20 sm:py-28" aria-labelledby="gcj-now-title">
      <div className="gcj-dots-light pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            id="gcj-now-title"
            eyebrow="Pourquoi maintenant ?"
            title={
              <>
                Votre prochain contact peut devenir votre <span className="gcj-em">prochaine opportunité.</span>
              </>
            }
          >
            Une opportunité commence rarement par une annonce. Elle commence souvent par une simple connexion, un
            message, puis une conversation.
          </SectionHeading>
        </Reveal>
        <JourneyAnimation />
      </div>
    </section>
  );
}
