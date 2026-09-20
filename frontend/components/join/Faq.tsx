'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqProps {
  items: ReadonlyArray<{ q: string; a: string }>;
}

/** Accordéon accessible (boutons + aria-expanded). Les réponses restent dans le DOM (SEO). */
export default function Faq({ items }: FaqProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                id={`gcj-faq-btn-${i}`}
                aria-expanded={isOpen}
                aria-controls={`gcj-faq-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-[16px] font-bold tracking-tight text-[var(--j-navy-2)] transition-colors hover:bg-slate-50 sm:px-7 sm:text-[17px]"
              >
                {item.q}
                <ChevronDown
                  size={20}
                  aria-hidden="true"
                  className={`shrink-0 text-[var(--j-orange-deep)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </h3>
            <div
              id={`gcj-faq-panel-${i}`}
              role="region"
              aria-labelledby={`gcj-faq-btn-${i}`}
              className="gcj-faq-panel"
              data-open={isOpen}
            >
              <div>
                <p className="px-5 pb-6 pr-10 leading-relaxed text-[var(--j-text-2)] sm:px-7">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
