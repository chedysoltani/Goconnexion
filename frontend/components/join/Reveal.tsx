'use client';

import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  /** Décalage en ms, pour échelonner les éléments d'une même grille. */
  delay?: number;
  className?: string;
}

/** Apparition douce au scroll (IntersectionObserver, une seule fois). Sans mouvement si réduit. */
export default function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`gcj-reveal ${shown ? 'is-in' : ''} ${className}`}
      style={{ ['--d' as string]: `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
