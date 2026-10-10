import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/site-url';
import LegalLayout from '@/components/legal/LegalLayout';
import { COMPANY, COMPANY_ADDRESS_LINE, SOCIAL_LINKS } from '@/lib/constants/company';

// TODO(contenu) — à remplacer par le texte d'Éric :
//   1. Section « Notre histoire » : le déclic, la date de lancement, pourquoi Montréal.
//   2. Équipe : courte bio + photo de chaque personne (et ajouter les autres membres s'il y en a).

const TEAM = [
  { name: COMPANY.privacyOfficer.name, role: 'Président', initials: 'ÉB' },
  { name: 'Chedy Soltani', role: 'Développeur full-stack', initials: 'CS' },
] as const;

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

export default function AboutPage() {
  return (
    <LegalLayout title="À propos de GoConnexions">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />

      <p className="text-[17px]">
        GoConnexions est une plateforme québécoise de réseautage professionnel, basée à Montréal. Elle réunit
        entrepreneurs, freelances, étudiants et incubateurs pour qu’ils se rencontrent, collaborent et trouvent
        leurs prochaines opportunités : clients, associés, stages ou partenaires.
      </p>

      <section>
        <h2 id="mission">Notre mission</h2>
        <p>
          Les meilleures opportunités professionnelles ne viennent pas d’un message froid ou d’une publication
          virale, mais d’une vraie conversation avec quelqu’un qui vous fait confiance. GoConnexions existe pour
          rendre ces conversations plus faciles : trouver les bonnes personnes, garder le contact et transformer un
          réseau en relations qui comptent, sans spam et sans algorithme qui décide à votre place.
        </p>
      </section>

      <section>
        <h2 id="histoire">Notre histoire</h2>
        <p>
          GoConnexions est née à Montréal d’un constat partagé par beaucoup d’entrepreneurs et de travailleurs
          autonomes : on accumule des contacts, mais on manque d’un lieu pensé pour entretenir ces relations et en
          créer de nouvelles avec des gens de son écosystème. Nous construisons cet endroit, avec et pour la
          communauté d’affaires du Québec.
        </p>
      </section>

      <section>
        <h2 id="offre">Ce que vous trouverez sur GoConnexions</h2>
        <ul>
          <li><strong>Un profil professionnel</strong> d’entrepreneur ou de freelance, et un réseau de connexions ;</li>
          <li><strong>une messagerie</strong> pour échanger directement avec vos connexions ;</li>
          <li><strong>des événements</strong> professionnels à organiser ou à rejoindre ;</li>
          <li><strong>des offres de stage</strong> publiées par des entreprises, ouvertes aux étudiants ;</li>
          <li><strong>une marketplace</strong> de services entre membres ;</li>
          <li><strong>un espace incubateur</strong> pour accompagner les projets en démarrage.</li>
        </ul>
        <p>
          Le compte est gratuit ; des forfaits payants débloquent des fonctionnalités supplémentaires (voir les{' '}
          <Link href="/pricing">tarifs</Link>). Des questions ? Consultez notre <Link href="/faq">FAQ</Link>.
        </p>
      </section>

      <section>
        <h2 id="equipe">L’équipe</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {TEAM.map((m) => (
            <div key={m.name} className="flex items-center gap-4 rounded-2xl border p-5" style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
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
