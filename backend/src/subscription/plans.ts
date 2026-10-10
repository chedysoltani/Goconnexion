import { PlanStatus, PlanType } from '@prisma/client';

// Source unique des offres : limites appliquées par le backend, prix, et
// avantages affichés par le frontend (/pricing, UpgradeModal).
// -1 = illimité.

export const PLAN_LIMITS = {
  FREE: {
    maxProjects: 1,
    maxApplications: 3,
    maxConnections: 10,
    maxMessagesPerMonth: 50,
    canAccessAnalytics: false,
    canAccessVideoCall: false,
    canCreateAds: false,
    canReadIncubator: false,
    canWriteIncubator: false,
    badge: null,
  },
  PRO: {
    maxProjects: 5,
    maxApplications: -1,
    maxConnections: -1,
    maxMessagesPerMonth: -1,
    canAccessAnalytics: true,
    canAccessVideoCall: true,
    canCreateAds: true,
    canReadIncubator: false,
    canWriteIncubator: false,
    badge: 'PRO',
  },
  BUSINESS: {
    maxProjects: -1,
    maxApplications: -1,
    maxConnections: -1,
    maxMessagesPerMonth: -1,
    canAccessAnalytics: true,
    canAccessVideoCall: true,
    canCreateAds: true,
    canReadIncubator: true,
    canWriteIncubator: false,
    badge: 'BUSINESS',
  },
  PREMIUM_INCUBATEUR: {
    maxProjects: -1,
    maxApplications: -1,
    maxConnections: -1,
    maxMessagesPerMonth: -1,
    canAccessAnalytics: true,
    canAccessVideoCall: true,
    canCreateAds: true,
    canReadIncubator: true,
    canWriteIncubator: true,
    badge: 'INCUBATEUR',
  },
} as const satisfies Record<PlanType, unknown>;

export type PlanLimits = (typeof PLAN_LIMITS)[PlanType];
export type PlanFeatureFlag = {
  [K in keyof PlanLimits]: PlanLimits[K] extends boolean ? K : never;
}[keyof PlanLimits];

export const PLAN_PRICES = {
  FREE:               { monthly: 0,  yearly: 0   },
  PRO:                { monthly: 19, yearly: 159 },
  BUSINESS:           { monthly: 49, yearly: 399 },
  PREMIUM_INCUBATEUR: { monthly: 99, yearly: 890 },
} as const satisfies Record<PlanType, { monthly: number; yearly: number }>;

export const TRIAL_PLAN = PlanType.PRO;
export const TRIAL_DAYS = 14;

// `soon` = promis mais pas encore livré : affiché avec un badge « Bientôt ».
export interface PlanFeature {
  text: string;
  highlight?: boolean;
  soon?: boolean;
}

export const PLAN_CATALOG: {
  id: PlanType;
  name: string;
  tagline: string;
  popular?: boolean;
  features: PlanFeature[];
}[] = [
  {
    id: PlanType.FREE,
    name: 'Gratuit',
    tagline: 'Pour démarrer',
    features: [
      { text: '3 candidatures' },
      { text: '1 projet actif' },
      { text: '10 connexions' },
      { text: '50 messages / mois' },
      { text: 'Profil de base' },
    ],
  },
  {
    id: PlanType.PRO,
    name: 'Pro',
    tagline: 'Pour les professionnels',
    popular: true,
    features: [
      { text: 'Candidatures illimitées', highlight: true },
      { text: '5 projets actifs' },
      { text: 'Connexions illimitées', highlight: true },
      { text: 'Messagerie illimitée', highlight: true },
      { text: 'Analytics de profil', highlight: true },
      { text: 'Appels audio & vidéo' },
      { text: 'Annonces sponsorisées' },
      { text: 'Badge Pro visible' },
      { text: 'Contrats & signatures', soon: true },
      { text: 'Paiement sécurisé (escrow)', soon: true },
    ],
  },
  {
    id: PlanType.BUSINESS,
    name: 'Business',
    tagline: 'Pour les équipes',
    features: [
      { text: 'Tout Pro inclus', highlight: true },
      { text: 'Projets illimités', highlight: true },
      { text: 'Espace Incubateur (lecture)' },
      { text: 'Badge Business visible' },
      { text: 'Page entreprise dédiée', soon: true },
      { text: "Équipe jusqu'à 5 membres", soon: true },
      { text: 'Recrutement IA', soon: true },
      { text: 'Rapports & exports PDF', soon: true },
      { text: 'Support prioritaire 24h/7j', soon: true },
      { text: 'Accès API', soon: true },
    ],
  },
  {
    id: PlanType.PREMIUM_INCUBATEUR,
    name: 'Premium Incubateur',
    tagline: "Accès à l'espace communautaire exclusif",
    features: [
      { text: 'Tout Business inclus', highlight: true },
      { text: 'Espace Incubateur complet', highlight: true },
      { text: 'Publier, commenter, réagir' },
      { text: 'Communauté de membres' },
      { text: 'Badge Incubateur visible' },
      { text: 'Événements exclusifs', soon: true },
      { text: 'Accès API', soon: true },
    ],
  },
];

type SubscriptionLike = {
  plan: PlanType;
  status: PlanStatus;
  trialEndsAt?: Date | string | null;
} | null | undefined;

// Plan dont l'utilisateur doit réellement bénéficier. Un essai expiré redonne
// FREE même si le cron d'expiration n'est pas encore passé.
export function effectivePlan(sub: SubscriptionLike): PlanType {
  if (!sub) return PlanType.FREE;
  if (sub.status === PlanStatus.TRIAL) {
    if (!sub.trialEndsAt || new Date(sub.trialEndsAt) <= new Date()) return PlanType.FREE;
  }
  return sub.plan;
}

export function planLimitsFor(sub: SubscriptionLike): PlanLimits {
  return PLAN_LIMITS[effectivePlan(sub)];
}
