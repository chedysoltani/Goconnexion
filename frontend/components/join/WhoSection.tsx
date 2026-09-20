import React from 'react';
import Reveal from './Reveal';
import RolePicker from './RolePicker';
import SectionHeading from './SectionHeading';

export default function WhoSection() {
  return (
    <section id="pour-qui" className="gcj-dark relative overflow-hidden bg-[var(--j-ink)] py-20 sm:py-28" aria-labelledby="gcj-who-title">
      <div
        className="pointer-events-none absolute -left-40 bottom-0 h-[460px] w-[460px] rounded-full opacity-70 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.16), transparent 65%)' }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            id="gcj-who-title"
            tone="dark"
            eyebrow="Pour qui ?"
            title={
              <>
                Quel que soit votre profil, <span className="gcj-em">commencez ici.</span>
              </>
            }
          >
            Choisissez celui qui vous ressemble : vous arrivez directement sur votre inscription.
          </SectionHeading>
        </Reveal>
        <RolePicker />
      </div>
    </section>
  );
}
