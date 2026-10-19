import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/site-url';
import LegalLayout from '@/components/legal/LegalLayout';
import { COMPANY, COMPANY_ADDRESS_LINE, SOCIAL_LINKS } from '@/lib/constants/company';
import { ABOUT_KEY, ABOUT_TITLE, parseAboutContent, toParagraphs } from '@/lib/site-content/about';
import { SITE_CONTENT_REVALIDATE_SECONDS, fetchSiteContent } from '@/lib/site-content/server';

// Les textes (intro, mission, histoire, activités, équipe) sont éditables par ADMIN/EDITOR
// depuis /admin/presentation. Les infos légales restent dans lib/constants/company.
export const revalidate = SITE_CONTENT_REVALIDATE_SECONDS;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'À propos — GoConnexions',
  description:
    'GoConnexions est une plateforme québécoise de réseautage professionnel pour entrepreneurs, freelances et étudiants, basée à Montréal. Découvrez notre mission et l’équipe derrière le projet.',
  alternates: { canonical: '/a-propos' },
};

function organizationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: COMPANY.brand,
    legalName: COMPANY.legalName,
    url: siteUrl,
    email: COMPANY.contactEmail,
    foundingLocation: 'Montréal, Québec, Canada',
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      addressRegion: COMPANY.address.regionCode,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.countryCode,
    },
    sameAs: SOCIAL_LINKS.map((s) => s.href),
  };
}

export default async function AboutPage() {
  const data = await fetchSiteContent(ABOUT_KEY);
  const about = parseAboutContent(data?.content);
  const title = data?.title || ABOUT_TITLE;

  return (
    <LegalLayout title={title}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />

      {toParagraphs(about.intro).map((p, i) => (
        <p key={i} className="text-[17px]">{p}</p>
      ))}

      <section>
        <h2 id="mission">Notre mission</h2>
        {toParagraphs(about.mission).map((p, i) => <p key={i}>{p}</p>)}
      </section>

      <section>
        <h2 id="histoire">Notre histoire</h2>
        {toParagraphs(about.history).map((p, i) => <p key={i}>{p}</p>)}
      </section>

      <section>
        <h2 id="offre">Ce que vous trouverez sur GoConnexions</h2>
        <ul>
          {about.offer.map((o, i) => (
            <li key={i}><strong>{o.label}</strong> {o.text}</li>
          ))}
        </ul>
        <p>
          Le compte est gratuit ; des forfaits payants débloquent des fonctionnalités supplémentaires (voir les{' '}
          <Link href="/pricing">tarifs</Link>). Des questions ? Consultez notre <Link href="/faq">FAQ</Link>.
        </p>
      </section>

      <section>
        <h2 id="equipe">L’équipe</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {about.team.map((m, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border p-5" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, #2563eb, #4a90d9)' }}
                aria-hidden
              >
                {m.initials}
              </div>
              <div>
                <p className="!my-0 font-semibold" style={{ color: '#0f172a' }}>{m.name}</p>
                <p className="!my-0 text-sm" style={{ color: '#64748b' }}>{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 id="entreprise">L’entreprise</h2>
        <p>
          GoConnexions est exploitée par <strong>{COMPANY.legalName}</strong>, société par actions immatriculée au
          Québec (NEQ {COMPANY.neq}).
        </p>
        <p>
          {COMPANY_ADDRESS_LINE}<br />
          <a href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a>
        </p>
        <p>
          Suivez-nous :{' '}
          {SOCIAL_LINKS.map((s, i) => (
            <span key={s.label}>
              {i > 0 && ' · '}
              <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
            </span>
          ))}
        </p>
      </section>
    </LegalLayout>
  );
}
