import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import LegalLayout from '@/components/legal/LegalLayout';
import { COMPANY, COMPANY_ADDRESS_LINE } from '@/lib/constants/company';

// TODO(légal) — encore à confirmer :
//   1. Durée de conservation exacte après une demande de suppression (section 5 : 30 jours de
//      sauvegardes, valeur provisoire).
//   2. Lieu d'hébergement de la base de données (section 4 reste générique : « hors du Québec »).
// Le responsable de la protection des renseignements personnels est, par défaut (Loi 25, art. 3.1),
// la personne ayant la plus haute autorité dans l'entreprise : Éric Boudreault, président.
// Contenu grounded dans le code au 2026-10-07 : modèle Prisma User/FreelancerProfile/EntrepreneurProfile,
// cookies gc_access/gc_refresh (backend/src/auth/auth.controller.ts), paiement Stripe/Wise
// (backend/src/subscription), emails via Resend (backend/src/mail/mail.service.ts), chatbot marketing
// et campagne du tunnel /join (localStorage, 30 jours, voir frontend/lib/tracking/campaign.ts).

const TOC = [
  { id: 'collecte', label: 'Données collectées' },
  { id: 'usage', label: 'Utilisation des données' },
  { id: 'cookies', label: 'Cookies et traceurs' },
  { id: 'partage', label: 'Partage avec des tiers' },
  { id: 'conservation', label: 'Conservation' },
  { id: 'droits', label: 'Vos droits' },
  { id: 'responsable', label: 'Responsable de la protection' },
  { id: 'securite', label: 'Sécurité' },
  { id: 'mineurs', label: 'Mineurs' },
  { id: 'modifications', label: 'Modifications' },
] as const;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Politique de confidentialité — GoConnexions',
  description: 'Quelles données GoConnexions collecte, pourquoi, avec qui elles sont partagées, et comment les gérer.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Politique de confidentialité" updatedAt="10 octobre 2026" toc={TOC}>
      <p>
        Cette politique explique quels renseignements personnels GoConnexions collecte lorsque vous utilisez le
        service, pourquoi, et quels contrôles vous avez sur eux. GoConnexions est exploitée par{' '}
        <strong>{COMPANY.legalName}</strong> (NEQ {COMPANY.neq}), dont le siège est situé au {COMPANY_ADDRESS_LINE}.
        Elle est rédigée conformément à la <em>Loi sur la protection des renseignements personnels dans le secteur
        privé</em> du Québec (telle que modifiée par la Loi 25).
      </p>

      <section>
        <h2 id="collecte">1. Données collectées</h2>
        <p><strong>À l’inscription et sur votre profil :</strong></p>
        <ul>
          <li>email, mot de passe (stocké sous forme chiffrée, jamais en clair), prénom, nom, pays, date de naissance ;</li>
          <li>selon votre profil : compétences et expérience (freelance/professionnel) ou entreprise et poste (entrepreneur) ;</li>
          <li>photo de profil, bio, liens (portfolio, LinkedIn, site web) que vous choisissez de renseigner.</li>
        </ul>
        <p><strong>Ce que vous publiez :</strong> posts, commentaires, messages envoyés à vos connexions, cartes de visite, CV joint à une candidature de stage.</p>
        <p><strong>Paiement :</strong> si vous souscrivez un abonnement, vos coordonnées bancaires sont saisies directement chez notre prestataire de paiement (Stripe ou Wise) — GoConnexions ne les reçoit ni ne les stocke.</p>
        <p><strong>Usage technique :</strong> adresse IP, type d’appareil et pages visitées, dans la mesure nécessaire au fonctionnement et à la sécurité du service.</p>
      </section>

      <section>
        <h2 id="usage">2. Utilisation des données</h2>
        <p>Nous utilisons vos données pour :</p>
        <ul>
          <li>faire fonctionner votre compte, votre profil et vos connexions ;</li>
          <li>vous envoyer les emails nécessaires au service (vérification d’adresse, réinitialisation de mot de passe, confirmations) ;</li>
          <li>traiter les paiements et abonnements ;</li>
          <li>assurer la sécurité du service et prévenir la fraude ;</li>
          <li>répondre à vos demandes auprès du support.</li>
        </ul>
        <p>Nous n’utilisons pas vos données pour de la publicité ciblée.</p>
      </section>

      <section>
        <h2 id="cookies">3. Cookies et traceurs</h2>
        <p>
          GoConnexions utilise des cookies <strong>nécessaires au fonctionnement</strong> du service : un cookie de
          session (<code>gc_access</code> / <code>gc_refresh</code>) qui vous garde connecté, posé en httpOnly (il
          n’est pas lisible par un script). Ces cookies ne servent pas à la publicité et ne sont pas partagés avec
          des tiers.
        </p>
        <p>
          Si vous arrivez sur GoConnexions via un lien de campagne ou de parrainage (par exemple{' '}
          <code>?ref=…</code> ou <code>?utm_source=…</code>), nous gardons cette information 30 jours dans le
          stockage local de votre navigateur, pour savoir d’où vous venez si vous vous inscrivez. Cette information
          reste sur votre appareil ; vous pouvez l’effacer à tout moment via les réglages de votre navigateur.
        </p>
        <p>
          GoConnexions n’utilise aujourd’hui aucun cookie publicitaire ni outil de mesure d’audience tiers (Google
          Analytics, Meta Pixel…). Si cela change, cette section sera mise à jour avant l’activation de ces outils.
        </p>
      </section>

      <section>
        <h2 id="partage">4. Partage avec des tiers</h2>
        <p>Nous partageons certaines données, dans la stricte mesure nécessaire, avec :</p>
        <ul>
          <li><strong>Stripe et Wise</strong> — traitement des paiements et abonnements ;</li>
          <li><strong>Resend</strong> — envoi des emails transactionnels (vérification, réinitialisation de mot de passe, notifications) ;</li>
          <li>les autres membres, dans la mesure prévue par le service (profil visible, messages à vos connexions, candidature visible par l’auteur d’une offre de stage).</li>
        </ul>
        <p>Nous ne vendons pas vos données personnelles.</p>
        <p>
          <strong>Communication à l’extérieur du Québec :</strong> certains de ces prestataires (notamment Stripe,
          Wise et Resend) traitent les données sur des serveurs situés hors du Québec, principalement aux
          États-Unis, et une partie de notre équipe technique travaille à distance depuis l’extérieur du Canada.
          Avant toute communication de ce type, nous évaluons que les renseignements bénéficieront d’une protection
          adéquate, et l’accès est limité à ce qui est nécessaire au fonctionnement du service.
        </p>
      </section>

      <section>
        <h2 id="conservation">5. Conservation</h2>
        <p>
          Vos données sont conservées tant que votre compte existe. Si vous demandez sa suppression, vos
          informations de profil sont retirées ; certaines données peuvent être conservées plus longtemps lorsque la loi l’exige (par
          exemple des données de facturation), ou subsister jusqu’à 30 jours dans nos sauvegardes techniques avant
          suppression définitive.{' '}
          {/* TODO(légal) : durée exacte des sauvegardes à confirmer */}
        </p>
      </section>

      <section>
        <h2 id="droits">6. Vos droits</h2>
        <p>Vous pouvez, à tout moment et sans frais :</p>
        <ul>
          <li><strong>accéder</strong> aux renseignements personnels que nous détenons sur vous et en obtenir une copie ;</li>
          <li>les faire <strong>rectifier</strong> s’ils sont inexacts, incomplets ou équivoques ;</li>
          <li>demander la <strong>suppression</strong> de votre compte et de vos renseignements ;</li>
          <li><strong>retirer votre consentement</strong> à un usage particulier de vos renseignements ;</li>
          <li>obtenir vos renseignements dans un <strong>format technologique structuré</strong> et couramment utilisé (portabilité) ;</li>
          <li>demander que cesse la <strong>diffusion</strong> d’un renseignement vous concernant ou la désindexation d’un lien.</li>
        </ul>
        <p>
          Vous pouvez modifier la plupart des informations de votre profil directement dans l’application. Pour toute
          autre demande, écrivez au responsable de la protection des renseignements personnels (section suivante).
          Nous répondons par écrit dans un délai de 30 jours. Si vous résidez dans l’Union européenne, vous
          bénéficiez en outre des droits prévus par le RGPD.
        </p>
      </section>

      <section>
        <h2 id="responsable">7. Responsable de la protection des renseignements personnels</h2>
        <p>
          La personne responsable de la protection des renseignements personnels chez GoConnexions est :
        </p>
        <p>
          <strong>{COMPANY.privacyOfficer.name}</strong>, {COMPANY.privacyOfficer.title.toLowerCase()}<br />
          {COMPANY.legalName} (GoConnexions)<br />
          {COMPANY_ADDRESS_LINE}<br />
          <a href={`mailto:${COMPANY.privacyOfficer.email}`}>{COMPANY.privacyOfficer.email}</a>
        </p>
        <p>
          C’est à cette personne qu’il faut adresser toute demande d’accès, de rectification ou de suppression, ainsi
          que toute plainte concernant le traitement de vos renseignements. Si vous n’êtes pas satisfait de notre
          réponse, vous pouvez vous adresser à la{' '}
          <a href="https://www.cai.gouv.qc.ca/" target="_blank" rel="noopener noreferrer">Commission d’accès à l’information du Québec</a>.
        </p>
        <p>
          En cas d’incident de confidentialité présentant un risque de préjudice sérieux, nous en avisons les
          personnes concernées et la Commission d’accès à l’information, comme l’exige la loi.
        </p>
      </section>

      <section>
        <h2 id="securite">8. Sécurité</h2>
        <p>
          Les mots de passe sont stockés sous forme chiffrée (jamais en texte brut), les échanges avec GoConnexions
          passent par une connexion sécurisée (HTTPS), et les jetons de connexion sont posés en cookies httpOnly,
          inaccessibles à un script. Aucun système n’est infaillible : si vous repérez une faille, écrivez-nous à{' '}
          <a href={`mailto:${COMPANY.privacyOfficer.email}`}>{COMPANY.privacyOfficer.email}</a>.
        </p>
      </section>

      <section>
        <h2 id="mineurs">9. Mineurs</h2>
        <p>
          GoConnexions est destiné aux personnes d’au moins 16 ans (voir nos{' '}
          <a href="/terms">conditions d’utilisation</a>) et n’est pas conçu pour les enfants plus jeunes.
        </p>
      </section>

      <section>
        <h2 id="modifications">10. Modifications</h2>
        <p>
          Nous pouvons mettre à jour cette politique ; en cas de changement important (par exemple l’ajout d’un
          outil de mesure d’audience), nous en informerons les membres avant son entrée en vigueur.
        </p>
      </section>
    </LegalLayout>
  );
}
