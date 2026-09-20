// Attribution de campagne : capture les paramètres d'URL utiles (UTM + code de parrainage)
// à l'arrivée du visiteur et les conserve jusqu'à l'inscription.
//
// TODO(backend) : /auth/register n'accepte pas encore ces champs (ValidationPipe whitelist
// → ils seraient ignorés). Tant que ce n'est pas branché, ils servent à :
//   - alimenter l'analytics (voir analytics.ts),
//   - être re-propagés dans l'URL d'inscription (le paramètre `ref` est, lui, déjà consommé
//     par SignupForm → api.referral.registerReferral).

export const CAMPAIGN_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'ref',
] as const;

export type CampaignParam = (typeof CAMPAIGN_PARAMS)[number];

export type CampaignData = Partial<Record<CampaignParam, string>> & {
  /** Profil choisi dans le tunnel (voir lib/join/funnel.ts). */
  persona?: string;
  capturedAt?: number;
};

const STORAGE_KEY = 'gc_campaign';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
export const CAMPAIGN_CHANGE_EVENT = 'gc:campaign-change';

// Valeurs d'URL = entrée non fiable : on borne la taille et le jeu de caractères.
function sanitize(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const clean = value.trim().slice(0, 100).replace(/[^\w\-.~ +@:/]/g, '');
  return clean || undefined;
}

// Le stockage peut être indisponible (navigation privée, cookies bloqués…) : jamais bloquant.
function readStore(): CampaignData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as CampaignData;
    if (!data.capturedAt || Date.now() - data.capturedAt > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return data;
  } catch {
    return {};
  }
}

function writeStore(data: CampaignData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* stockage indisponible : on continue sans persistance */
  }
  window.dispatchEvent(new CustomEvent(CAMPAIGN_CHANGE_EVENT));
}

export function getCampaign(): CampaignData {
  if (typeof window === 'undefined') return {};
  return readStore();
}

/**
 * À appeler à l'arrivée sur une page d'entrée (/join, /auth/signup…).
 * Si l'URL porte des paramètres de campagne, ils remplacent les précédents (dernier contact) ;
 * sinon on conserve ce qui a été capturé plus tôt.
 */
export function captureCampaign(): CampaignData {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const fromUrl: CampaignData = {};
  for (const key of CAMPAIGN_PARAMS) {
    const value = sanitize(params.get(key));
    if (value) fromUrl[key] = value;
  }

  const stored = readStore();
  if (Object.keys(fromUrl).length === 0) return stored;

  const next: CampaignData = { ...fromUrl, persona: stored.persona, capturedAt: Date.now() };
  writeStore(next);
  return next;
}

export function setCampaignPersona(persona: string) {
  if (typeof window === 'undefined') return;
  writeStore({ ...readStore(), persona, capturedAt: readStore().capturedAt ?? Date.now() });
}

/** Ajoute les paramètres de campagne (et le persona) à une URLSearchParams existante. */
export function applyCampaignParams(target: URLSearchParams, data: CampaignData): URLSearchParams {
  for (const key of CAMPAIGN_PARAMS) {
    const value = data[key];
    if (value) target.set(key, value);
  }
  return target;
}
