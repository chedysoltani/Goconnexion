// Contenu de la landing /join. Tout le texte est ici pour pouvoir itérer (A/B, i18n, campagnes)
// sans toucher aux composants.

import type { Persona } from './funnel';

// Un seul libellé principal, réutilisé partout (hero, header, bénéfices, CTA final).
export const CTA_LABEL = 'Rejoindre GoConnexions';
// Libellé demandé après « Comment ça fonctionne ».
export const CTA_LABEL_PROFILE = 'Créer mon profil gratuitement';

// « Gratuit » : le plan FREE existe (voir app/pricing). L'inscription (4 étapes) ne demande pas de paiement.
export const CTA_REASSURANCE = 'Inscription gratuite · Sans carte bancaire';

export const PROBLEMS = [
  {
    icon: 'layers',
    title: 'Trop de bruit',
    text: 'Beaucoup de contenu, beaucoup de profils, mais peu de connexions réellement pertinentes.',
  },
  {
    icon: 'user-x',
    title: 'Peu d’humain',
    text: 'Les interactions professionnelles deviennent parfois froides et impersonnelles.',
  },
  {
    icon: 'search-x',
    title: 'Des opportunités difficiles à trouver',
    text: 'Les bonnes personnes peuvent être difficiles à identifier au bon moment.',
  },
] as const;

export const BENEFITS = [
  {
    icon: 'handshake',
    title: 'Rencontrez',
    text: 'Découvrez des personnes et des profils qui peuvent réellement vous intéresser.',
  },
  {
    icon: 'rocket',
    title: 'Développez',
    text: 'Développez votre réseau professionnel et votre visibilité.',
  },
  {
    icon: 'lightbulb',
    title: 'Collaborez',
    text: 'Trouvez des personnes avec lesquelles créer des projets et des opportunités.',
  },
  {
    icon: 'globe',
    title: 'Élargissez votre réseau',
    text: 'Ne limitez plus vos connexions à votre environnement immédiat.',
  },
] as const;

export const STEPS = [
  {
    n: '01',
    title: 'Créez votre profil',
    text: 'Présentez qui vous êtes, ce que vous faites et ce que vous recherchez.',
  },
  {
    n: '02',
    title: 'Découvrez',
    text: 'Explorez les personnes, entreprises et opportunités qui correspondent à vos objectifs.',
  },
  {
    n: '03',
    title: 'Connectez-vous',
    text: 'Créez des connexions et transformez-les en opportunités.',
  },
] as const;

export const PERSONAS: ReadonlyArray<{
  id: Persona;
  icon: 'rocket' | 'briefcase' | 'search' | 'compass';
  title: string;
  text: string;
  cta: string;
}> = [
  {
    id: 'entrepreneur',
    icon: 'rocket',
    title: 'Entrepreneur',
    text: 'Développez votre réseau et trouvez de nouvelles collaborations.',
    cta: 'Je suis entrepreneur',
  },
  {
    id: 'professional',
    icon: 'briefcase',
    title: 'Professionnel',
    text: 'Faites connaître votre expertise et développez vos opportunités.',
    cta: 'Je suis professionnel',
  },
  {
    id: 'recruiter',
    icon: 'search',
    title: 'Recruteur',
    text: 'Découvrez des profils et créez des connexions avec les bons talents.',
    cta: 'Je suis recruteur',
  },
  {
    id: 'opportunity',
    icon: 'compass',
    title: 'Chercheur d’opportunités',
    text: 'Découvrez des personnes, entreprises et opportunités.',
    cta: 'Je recherche des opportunités',
  },
];

export const JOURNEY = [
  { label: 'Personne A', hint: 'Un profil croise votre route' },
  { label: 'Connexion', hint: 'Vous vous connectez' },
  { label: 'Conversation', hint: 'Vous échangez' },
  { label: 'Collaboration', hint: 'Vous construisez ensemble' },
  { label: 'Opportunité', hint: 'Quelque chose de nouveau commence' },
] as const;

/* ─── Section Confiance ─────────────────────────────────────────────────────────────────
 * RÈGLE : aucune donnée inventée. Tant que ces listes sont vides, la section n'affiche que
 * des engagements vérifiables dans le produit (voir TRUST_ASSURANCES). Dès qu'une liste est
 * renseignée avec de VRAIES données, le bloc correspondant apparaît automatiquement.
 * ─────────────────────────────────────────────────────────────────────────────────────── */

export interface TrustStat {
  value: string; // ex. valeur réelle issue de la base de données
  label: string;
}
export interface TrustTestimonial {
  quote: string;
  author: string;
  role?: string;
  /** Preuve d'accord de la personne à conserver hors du code. */
  consent: true;
}
export interface TrustLogo {
  name: string;
  src: string; // /assets/... — uniquement des logos dont on a l'autorisation d'usage
  href?: string;
}

export const TRUST_CONFIG: {
  stats: TrustStat[];
  testimonials: TrustTestimonial[];
  logos: TrustLogo[];
  partners: TrustLogo[];
} = {
  // TODO(données) : brancher de vrais chiffres — membres, connexions, entreprises, opportunités.
  //   Source suggérée : un endpoint public agrégé côté backend (ex. GET /public/stats), ISR 1 h.
  stats: [],
  // TODO(contenu) : témoignages réels et consentis (nom, rôle, citation).
  testimonials: [],
  // TODO(contenu) : logos d'organisations qui utilisent réellement GoConnexions (avec autorisation).
  logos: [],
  // TODO(contenu) : partenaires officiels.
  partners: [],
};

// Chaque point ci-dessous est confirmé par le code existant :
export const TRUST_ASSURANCES = [
  {
    icon: 'credit-card',
    title: 'Inscription gratuite',
    text: 'Créer votre compte ne demande aucun paiement ni carte bancaire.',
  },
  {
    icon: 'user-check',
    title: 'Vous décidez de vos connexions',
    text: 'Une connexion passe par une demande que l’autre personne peut accepter.',
  },
  {
    icon: 'badge-check',
    title: 'Votre profil, votre manière',
    text: 'Vous choisissez votre profil à l’inscription et pouvez le modifier ensuite.',
  },
] as const;

export const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Qu’est-ce que GoConnexions ?',
    a: 'GoConnexions est une plateforme de réseautage professionnel : vous créez votre profil, découvrez d’autres membres et vous connectez avec eux pour développer votre réseau et vos opportunités.',
  },
  {
    q: 'Est-ce gratuit ?',
    // TODO(produit) : confirmer avec Éric le périmètre exact du plan gratuit avant toute promesse détaillée.
    a: 'Oui, la création de compte est gratuite et ne demande pas de carte bancaire. Des abonnements payants optionnels existent pour des fonctionnalités avancées ; ils sont détaillés sur la page Tarifs.',
  },
  {
    q: 'À qui s’adresse GoConnexions ?',
    // TODO(produit) : les profils « recruteur » et « chercheur d'opportunités » n'ont pas encore de
    // parcours dédié (à l'inscription : freelance ou entrepreneur). À préciser quand ils existeront.
    a: 'Aux entrepreneurs, aux professionnels et travailleurs autonomes, ainsi qu’à toute personne qui souhaite développer son réseau ou découvrir de nouvelles opportunités.',
  },
  {
    q: 'Puis-je créer un profil professionnel ?',
    a: 'Oui. À l’inscription, vous présentez qui vous êtes et ce que vous faites (compétences et expérience, ou entreprise et poste selon votre profil). Vous pouvez ensuite compléter et modifier votre profil depuis votre espace.',
  },
  {
    q: 'Puis-je rechercher des opportunités ?',
    // TODO(produit) : valider la formulation avec Éric (projets, événements, marketplace).
    a: 'Oui. Depuis votre espace, vous pouvez découvrir d’autres membres et explorer les projets, les événements et la marketplace disponibles.',
  },
  {
    q: 'Comment fonctionne la connexion entre utilisateurs ?',
    a: 'Vous envoyez une demande de connexion à un autre membre. S’il l’accepte, vous êtes connectés et pouvez commencer à échanger.',
  },
  {
    q: 'Puis-je utiliser GoConnexions comme entrepreneur ?',
    a: 'Oui. Le profil « Entrepreneur » est disponible à l’inscription : vous présentez votre entreprise, publiez vos projets et développez votre réseau.',
  },
];

// TODO(légal) : /terms et /privacy sont déjà liés par le formulaire d'inscription mais les pages
// n'existent pas encore (404). Indispensable avant toute campagne payante (Meta Ads exige une
// politique de confidentialité).
// TODO(contact) : adresse reprise de la landing existante — à confirmer.
export const FOOTER_LINKS = [
  { label: 'Se connecter', href: '/auth/login' },
  { label: 'Conditions', href: '/terms' },
  { label: 'Confidentialité', href: '/privacy' },
  { label: 'Contact', href: 'mailto:bonjour@goconnexions.com' },
] as const;

// TODO(social) : aucun compte social confirmé dans le projet (les liens du footer existant sont des « # »).
// Renseigner ici quand les URLs officielles existent ; le footer les affichera automatiquement.
export const SOCIAL_LINKS: ReadonlyArray<{ label: string; href: string }> = [];

export const SEO = {
  title: 'GoConnexions — Créez des connexions qui ouvrent des opportunités',
  description:
    'Découvrez GoConnexions, une plateforme pensée pour développer votre réseau professionnel, rencontrer les bonnes personnes et créer de nouvelles opportunités.',
  path: '/join',
  // 1200×630, servie depuis /public (relative à metadataBase).
  ogImage: '/assets/images/og-join.png',
} as const;
