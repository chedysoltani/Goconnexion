import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import LegalLayout from '@/components/legal/LegalLayout';
import { COMPANY } from '@/lib/constants/company';

// Réponses grounded dans le produit au 2026-10-10 (backend/src/subscription/plans.ts pour l'essai,
// /terms et /privacy pour paiement, annulation et données). Pas de prix en dur : ils vivent sur /pricing.
// Texte brut uniquement : chaque réponse alimente aussi les données structurées FAQPage.

const FAQ = [
  {
    q: 'Qu’est-ce que GoConnexions ?',
    a: 'GoConnexions est une plateforme québécoise de réseautage professionnel basée à Montréal. Elle permet de créer un profil, de bâtir son réseau, d’échanger par messagerie, de participer à des événements, de trouver ou publier des offres de stage et de proposer ses services sur une marketplace.',
  },
  {
    q: 'À qui s’adresse GoConnexions ?',
    a: 'Aux entrepreneurs, aux freelances et travailleurs autonomes, aux étudiants à la recherche d’un stage et aux incubateurs qui accompagnent des projets en démarrage, principalement au Québec.',
  },
  {
    q: 'Est-ce que GoConnexions est gratuit ?',
    a: 'Oui. La création d’un compte et les fonctionnalités de base sont gratuites, sans carte bancaire. Des forfaits payants débloquent des fonctionnalités supplémentaires ; leur contenu et leurs prix sont détaillés sur la page Tarifs.',
  },
  {
    q: 'Y a-t-il un essai gratuit des forfaits payants ?',
    a: 'Oui, un essai gratuit du forfait Pro est offert une fois par compte, sans carte bancaire. À la fin de l’essai, le compte revient au forfait gratuit si vous ne vous abonnez pas.',
  },
  {
    q: 'Comment se fait le paiement, et puis-je annuler ?',
    a: 'Les paiements sont traités par Stripe ou Wise : GoConnexions ne stocke jamais vos coordonnées bancaires. Vous pouvez annuler à tout moment ; l’accès aux fonctionnalités payantes reste actif jusqu’à la fin de la période déjà payée.',
  },
  {
    q: 'Comment trouver un stage sur GoConnexions ?',
    a: 'Les offres de stage sont consultables sur la page Stages. Vous pouvez postuler en joignant votre CV, qui n’est visible que par l’entreprise qui a publié l’offre, puis suivre vos candidatures depuis votre compte.',
  },
  {
    q: 'Qui est derrière GoConnexions ?',
    a: `GoConnexions est exploitée par ${COMPANY.legalName}, une société par actions immatriculée au Québec (NEQ ${COMPANY.neq}) et établie à Montréal, présidée par ${COMPANY.privacyOfficer.name}.`,
  },
  {
    q: 'Que faites-vous de mes données personnelles ?',
    a: `Nous utilisons vos renseignements uniquement pour faire fonctionner le service, nous ne les vendons pas et ne faisons pas de publicité ciblée. Le traitement respecte la loi québécoise sur la protection des renseignements personnels (Loi 25). Le responsable de la protection des renseignements personnels est ${COMPANY.privacyOfficer.name} (${COMPANY.privacyOfficer.email}). Tous les détails sont dans notre politique de confidentialité.`,
  },
  {
    q: 'Comment supprimer mon compte ?',
    a: `Écrivez à ${COMPANY.privacyOfficer.email} depuis l’adresse associée à votre compte. Nous traitons la demande et vous répondons par écrit dans un délai de 30 jours.`,
  },
  {
    q: 'Comment contacter l’équipe GoConnexions ?',
    a: `Par courriel à ${COMPANY.contactEmail}. Vous pouvez aussi nous suivre sur Instagram et Facebook.`,
  },
] as const;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Questions fréquentes — GoConnexions',
  description:
    'Tout savoir sur GoConnexions : à qui s’adresse la plateforme, ce qui est gratuit, l’essai, le paiement, les stages, la protection de vos données et qui est derrière le projet.',
  alternates: { canonical: '/faq' },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function FaqPage() {
  return (
    <LegalLayout title="Questions fréquentes">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="space-y-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
            style={{ borderColor: '#e2e8f0', background: '#ffffff' }}
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold list-none" style={{ color: '#0f172a' }}>
              <h2 className="!text-[16px] !font-semibold !tracking-normal">{item.q}</h2>
              <span className="shrink-0 text-xl leading-none transition-transform group-open:rotate-45" style={{ color: '#3b82f6' }} aria-hidden>+</span>
            </summary>
            <p className="!mb-0">{item.a}</p>
          </details>
        ))}
      </div>
    </LegalLayout>
  );
}
