import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import LegalLayout from '@/components/legal/LegalLayout';
import { COMPANY, COMPANY_ADDRESS_LINE } from '@/lib/constants/company';

// TODO(légal) — encore à confirmer avec Éric :
//   1. Âge minimum d'inscription (16 ans supposé, section 2).
//   2. Politique de remboursement (section 5).
// Ce texte décrit le fonctionnement réel du produit (rôles, abonnements, parrainage) tel qu'il existe
// dans le code au 2026-10-07 ; il n'a pas été relu par un juriste.

const TOC = [
  { id: 'service', label: 'Le service' },
  { id: 'compte', label: 'Votre compte' },
  { id: 'contenu', label: 'Contenu publié' },
  { id: 'conduite', label: 'Règles de conduite' },
  { id: 'abonnements', label: 'Abonnements et paiement' },
  { id: 'parrainage', label: 'Parrainage et ambassadeurs' },
  { id: 'resiliation', label: 'Résiliation' },
  { id: 'responsabilite', label: 'Responsabilité' },
  { id: 'modifications', label: 'Modifications' },
  { id: 'droit', label: 'Droit applicable' },
] as const;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Conditions d’utilisation — GoConnexions',
  description: 'Les conditions d’utilisation de GoConnexions : création de compte, contenu publié, abonnements et résiliation.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Conditions d’utilisation" updatedAt="10 octobre 2026" toc={TOC}>
      <p>
        Les présentes conditions régissent l’utilisation de GoConnexions (« le service »), une plateforme de
        réseautage professionnel exploitée par <strong>{COMPANY.legalName}</strong> (« nous »), société par actions
        immatriculée au Québec sous le NEQ {COMPANY.neq}, dont le siège est situé au {COMPANY_ADDRESS_LINE}. En
        créant un compte, vous acceptez ces conditions ; si vous ne les acceptez pas, n’utilisez pas le service.
      </p>

      <section>
        <h2 id="service">1. Le service</h2>
        <p>GoConnexions permet de :</p>
        <ul>
          <li>créer un profil professionnel (freelance/professionnel ou entrepreneur) ;</li>
          <li>découvrir d’autres membres et leur envoyer des demandes de connexion ;</li>
          <li>échanger par messagerie avec vos connexions ;</li>
          <li>publier et consulter du contenu (fil d’actualité, incubateur, marketplace) ;</li>
          <li>organiser ou rejoindre des événements professionnels ;</li>
          <li>publier ou postuler à des offres de stage ;</li>
          <li>souscrire, de façon optionnelle, à un abonnement payant pour des fonctionnalités supplémentaires.</li>
        </ul>
        <p>Nous pouvons ajouter, modifier ou retirer des fonctionnalités à tout moment.</p>
      </section>

      <section>
        <h2 id="compte">2. Votre compte</h2>
        <ul>
          <li>Les informations fournies à l’inscription (nom, email, profil) doivent être exactes.</li>
          <li>Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité sur votre compte.</li>
          <li>
            L’inscription est réservée aux personnes d’au moins 16 ans.
            {/* TODO(légal) : âge minimum à confirmer avec Éric */}
          </li>
          <li>Un compte est personnel et ne peut pas être partagé ou cédé à un tiers.</li>
        </ul>
      </section>

      <section>
        <h2 id="contenu">3. Contenu publié</h2>
        <p>
          Vous restez propriétaire du contenu que vous publiez (profil, posts, messages, cartes de visite). En le
          publiant sur GoConnexions, vous nous autorisez à l’héberger et à l’afficher aux autres membres concernés,
          dans la seule mesure nécessaire au fonctionnement du service.
        </p>
        <p>
          Vous garantissez détenir les droits sur ce que vous publiez (texte, image, CV) et ne pas porter atteinte
          aux droits d’un tiers.
        </p>
      </section>

      <section>
        <h2 id="conduite">4. Règles de conduite</h2>
        <p>Sur GoConnexions, il est interdit de :</p>
        <ul>
          <li>publier un contenu illégal, trompeur, diffamatoire ou harcelant ;</li>
          <li>usurper l’identité d’une personne ou d’une organisation ;</li>
          <li>envoyer des messages non sollicités en masse (spam) ;</li>
          <li>collecter les données d’autres membres à des fins étrangères au réseautage ;</li>
          <li>tenter de contourner la sécurité du service.</li>
        </ul>
        <p>Un compte qui enfreint ces règles peut être suspendu ou supprimé.</p>
      </section>

      <section>
        <h2 id="abonnements">5. Abonnements et paiement</h2>
        <p>
          Le compte gratuit donne accès aux fonctionnalités de base. Des abonnements payants (détaillés sur la page{' '}
          <a href="/pricing">Tarifs</a>) débloquent des fonctionnalités supplémentaires. Un essai gratuit est
          disponible une fois par compte, sans carte bancaire.
        </p>
        <p>
          Les paiements sont traités par nos prestataires (Stripe ou Wise selon la méthode choisie) : GoConnexions ne
          stocke pas vos coordonnées bancaires. Vous pouvez annuler votre abonnement à tout moment depuis votre
          compte ; l’accès aux fonctionnalités payantes reste actif jusqu’à la fin de la période déjà payée, sans
          remboursement au prorata, sauf disposition légale contraire.
          {/* TODO(légal) : politique de remboursement à confirmer avec Éric avant toute campagne payante */}
        </p>
      </section>

      <section>
        <h2 id="parrainage">6. Parrainage et ambassadeurs</h2>
        <p>
          Un membre peut recevoir un code ou un lien de parrainage à partager. Les conditions d’éligibilité et les
          contreparties éventuelles du programme ambassadeur sont communiquées séparément aux membres concernés et
          peuvent évoluer.
        </p>
      </section>

      <section>
        <h2 id="resiliation">7. Résiliation</h2>
        <p>
          Vous pouvez demander la suppression de votre compte à tout moment en écrivant à{' '}
          <a href={`mailto:${COMPANY.privacyOfficer.email}`}>{COMPANY.privacyOfficer.email}</a>. Nous pouvons suspendre ou résilier un
          compte qui enfreint ces conditions, avec un préavis raisonnable sauf en cas de manquement grave.
        </p>
      </section>

      <section>
        <h2 id="responsabilite">8. Responsabilité</h2>
        <p>
          GoConnexions est fourni « en l’état ». Nous mettons des moyens raisonnables en œuvre pour assurer la
          disponibilité et la sécurité du service, sans garantir une disponibilité ininterrompue. Nous ne sommes pas
          responsables du contenu publié par les membres ni des échanges entre eux ; dans la mesure permise par la
          loi, notre responsabilité est limitée aux dommages directs.
        </p>
      </section>

      <section>
        <h2 id="modifications">9. Modifications</h2>
        <p>
          Nous pouvons modifier ces conditions ; en cas de changement important, nous en informerons les membres
          (par email ou notification dans l’application) avant leur entrée en vigueur.
        </p>
      </section>

      <section>
        <h2 id="droit">10. Droit applicable</h2>
        <p>
          Ces conditions sont régies par les lois de la province de Québec et les lois fédérales du Canada qui s’y
          appliquent. Tout litige relève des tribunaux compétents du district judiciaire de Montréal, sous réserve
          des droits que la <em>Loi sur la protection du consommateur</em> accorde aux consommateurs résidant au
          Québec.
        </p>
      </section>
    </LegalLayout>
  );
}
