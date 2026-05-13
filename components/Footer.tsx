import React from 'react';

import AppLogo from '@/components/ui/AppLogo';

// Pattern 3: Vercel Horizontal Flow — minimal, dot-separated
const footerLinks = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Comment ça marche', href: '#how-it-works' },
  { label: 'Confidentialité', href: '#' },
  { label: 'Conditions', href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gc-border py-10 bg-surface">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Single row: logo + links + social */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo + brand */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <AppLogo 
                size={100} 
                className="hover:opacity-80 transition-opacity duration-300"
              />
            </div>
            <span className="font-sans font-semibold text-sm text-foreground tracking-tight">
              GoConnexions
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {footerLinks?.map((link, i) => (
              <React.Fragment key={link?.label}>
                <a
                  href={link?.href}
                  className="text-[14px] font-medium text-muted hover:text-foreground transition-colors px-2 py-1"
                >
                  {link?.label}
                </a>
                {i < footerLinks?.length - 1 && (
                  <span className="text-gc-border text-xs select-none">·</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Social + copyright */}
          <div className="flex items-center gap-4">
            {/* Twitter/X */}
            <a
              href="#"
              aria-label="Follow GoConnexions on Twitter"
              className="text-muted hover:text-accent transition-colors"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="#"
              aria-label="Follow GoConnexions on LinkedIn"
              className="text-muted hover:text-accent transition-colors"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <span className="text-[13px] text-muted">© 2026 GoConnexions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}