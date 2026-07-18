import React from 'react';
import type { Metadata, Viewport } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import '../styles/index.css';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/I18nContext';
import GlobalProvider from '@/components/global/GlobalProvider';
import { getSiteUrl } from '@/lib/site-url';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
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
    <html lang="fr" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body>
        <I18nProvider>
          <GlobalProvider>
            {children}
          </GlobalProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
