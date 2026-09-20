import React from 'react';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import { FAQ, SEO } from '@/lib/join/content';
import './join.css';

import JoinHeader from '@/components/join/JoinHeader';
import HeroSection from '@/components/join/HeroSection';
import ProblemSection from '@/components/join/ProblemSection';
import SolutionSection from '@/components/join/SolutionSection';
import HowItWorksSection from '@/components/join/HowItWorksSection';
import WhoSection from '@/components/join/WhoSection';
import WhyNowSection from '@/components/join/WhyNowSection';
import TrustSection from '@/components/join/TrustSection';
import FinalCtaSection from '@/components/join/FinalCtaSection';
import FaqSection from '@/components/join/FaqSection';
import JoinFooter from '@/components/join/JoinFooter';
import StickyCta from '@/components/join/StickyCta';
import JoinTracker from '@/components/join/JoinTracker';

// L'URL canonique exclut volontairement les paramètres de campagne (utm_*, ref) :
// toutes les variantes de lien de campagne consolident sur /join.
export const metadata: Metadata = {
  title: { absolute: SEO.title },
  description: SEO.description,
  alternates: { canonical: SEO.path },
  openGraph: {
    type: 'website',
    siteName: 'GoConnexions',
    locale: 'fr_FR',
    url: SEO.path,
    title: SEO.title,
    description: SEO.description,
    images: [{ url: SEO.ogImage, width: 1200, height: 630, alt: SEO.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.title,
    description: SEO.description,
    images: [SEO.ogImage],
  },
};

function JsonLd() {
  const site = getSiteUrl();
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${site}/#organization`,
        name: 'GoConnexions',
        url: site,
        logo: `${site}/assets/images/GoConnexionLogo.png`,
        // TODO(social) : ajouter `sameAs` avec les URLs officielles des réseaux sociaux.
      },
      {
        '@type': 'WebPage',
        '@id': `${site}${SEO.path}#webpage`,
        url: `${site}${SEO.path}`,
        name: SEO.title,
        description: SEO.description,
        inLanguage: 'fr',
        isPartOf: { '@id': `${site}/#organization` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
  // `<` échappé : impossible de fermer la balise <script> depuis le contenu.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }}
    />
  );
}

export default function JoinPage() {
  return (
    <div className="gcj">
      {/* Sans JS, rien ne doit rester masqué en attente d'une animation d'apparition. */}
      <noscript>
        <style>{`.gcj-reveal,.gcj-journey-node{opacity:1!important;transform:none!important}.gcj-journey-track{transform:none!important}.gcj-line{stroke-dashoffset:0!important}`}</style>
      </noscript>
      <JsonLd />
      <JoinTracker />
      <a href="#contenu" className="gcj-skip">Aller au contenu</a>
      <JoinHeader />
      <main id="contenu">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <WhoSection />
        <WhyNowSection />
        <TrustSection />
        <FinalCtaSection />
        <FaqSection />
      </main>
      <JoinFooter />
      <StickyCta />
    </div>
  );
}
