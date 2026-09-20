'use client';

import React, { useEffect, useState } from 'react';
import FunnelCta from './FunnelCta';

/**
 * Barre CTA collante, mobile uniquement. Apparaît quand le CTA du hero est sorti de l'écran
 * et se retire devant le CTA final, pour ne jamais doubler un bouton déjà visible.
 */
export default function StickyCta() {
  const [heroVisible, setHeroVisible] = useState(true);
  const [finalVisible, setFinalVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const watch = (id: string, set: (v: boolean) => void) => {
      const el = document.getElementById(id);
      if (!el) return () => {};
      const io = new IntersectionObserver(([e]) => set(e.isIntersecting), { threshold: 0.1 });
      io.observe(el);
      return () => io.disconnect();
    };
    const stopHero = watch('gcj-hero-cta', setHeroVisible);
    const stopFinal = watch('gcj-final', setFinalVisible);
    return () => {
      stopHero();
      stopFinal();
    };
  }, []);

  const visible = !heroVisible && !finalVisible;

  return (
    <div
      className="gcj-sticky gcj-dark fixed inset-x-0 bottom-0 z-40 md:hidden"
      data-visible={visible}
      aria-hidden={!visible}
      // Le widget de chat occupe le coin bas-droit (56px + marge) : on lui laisse la place.
      style={{
        padding: '12px 88px calc(12px + env(safe-area-inset-bottom)) 16px',
        background: 'linear-gradient(180deg, rgba(5,14,31,0) 0%, rgba(5,14,31,0.92) 40%)',
      }}
    >
      <FunnelCta placement="sticky" className="w-full" />
    </div>
  );
}
