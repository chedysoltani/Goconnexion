import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/index.css';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/I18nContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'GoConnexions — Networking That Actually Works',
  description:
    'GoConnexions helps entrepreneurs and freelancers build real professional relationships through smart check-ins, follow-ups, and human-centered networking tools.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fgoconnexio3655back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.17" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}