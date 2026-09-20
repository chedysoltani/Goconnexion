import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  tone?: 'light' | 'dark';
  align?: 'center' | 'left';
  id?: string;
}

export default function SectionHeading({ eyebrow, title, children, tone = 'light', align = 'center', id }: SectionHeadingProps) {
  const dark = tone === 'dark';
  return (
    <div className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl`}>
      {eyebrow && (
        <p
          className={`mb-4 text-[12px] font-bold uppercase tracking-[0.14em] ${
            dark ? 'text-[var(--j-orange)]' : 'text-[var(--j-orange-deep)]'
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={`text-balance text-[1.9rem] font-extrabold leading-[1.15] tracking-[-0.025em] sm:text-4xl lg:text-[2.85rem] ${
          dark ? 'text-white' : 'text-[var(--j-navy-2)]'
        }`}
      >
        {title}
      </h2>
      {children && (
        <p className={`mt-5 text-base leading-relaxed sm:text-lg ${dark ? 'text-[var(--j-on-dark-2)]' : 'text-[var(--j-text-2)]'}`}>
          {children}
        </p>
      )}
    </div>
  );
}
