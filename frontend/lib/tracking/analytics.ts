// Abstraction analytics du tunnel. Aucun outil analytics n'est installé dans le projet :
// on n'en ajoute pas. trackEvent() se contente de relayer vers ce qui existe sur la page
// (GTM/GA4, Meta Pixel, Plausible…) le jour où l'un d'eux est branché — sans changer les appelants.
//
// TODO(analytics) : choisir l'outil (GA4/GTM, Meta Pixel pour les campagnes Facebook/Instagram,
// Plausible…) et charger son script, idéalement après consentement cookies.
// TODO(backend) : option sans outil tiers → définir NEXT_PUBLIC_TRACKING_ENDPOINT et créer
// l'endpoint qui reçoit ces événements (envoyés en JSON via sendBeacon).

import { getCampaign } from './campaign';

export type FunnelEvent =
  | 'landing_page_view'
  | 'hero_cta_click'
  | 'benefit_cta_click'
  | 'steps_cta_click'
  | 'final_cta_click'
  | 'sticky_cta_click'
  | 'header_cta_click'
  | 'role_selected'
  | 'register_started'
  | 'register_completed'
  | 'profile_completed';

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    plausible?: (name: string, options?: { props?: Props }) => void;
  }
}

const ONCE_PREFIX = 'gc_evt_';

function buildPayload(name: FunnelEvent, props: Props): Props {
  const campaign = getCampaign();
  const { capturedAt: _capturedAt, ...attribution } = campaign;
  return {
    ...attribution,
    ...props,
    event: name,
    path: window.location.pathname,
  };
}

export function trackEvent(name: FunnelEvent, props: Props = {}): void {
  if (typeof window === 'undefined') return;

  try {
    const payload = buildPayload(name, props);
    const { event: _event, ...params } = payload;

    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    else if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);

    if (typeof window.fbq === 'function') window.fbq('trackCustom', name, params);
    if (typeof window.plausible === 'function') window.plausible(name, { props: params });

    // Point d'extension : n'importe quel script peut écouter `gc:track`.
    window.dispatchEvent(new CustomEvent('gc:track', { detail: payload }));

    const endpoint = process.env.NEXT_PUBLIC_TRACKING_ENDPOINT;
    if (endpoint && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(endpoint, new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    }

    if (process.env.NODE_ENV !== 'production') console.debug('[track]', name, payload);
  } catch {
    // Le tracking ne doit jamais casser le parcours utilisateur.
  }
}

/**
 * Comme trackEvent, mais une seule fois : par session (défaut) ou par navigateur (`persist`).
 * Sert aux événements de jalon (page vue, inscription démarrée, profil complété).
 */
export function trackOnce(name: FunnelEvent, props: Props = {}, options: { persist?: boolean } = {}): void {
  if (typeof window === 'undefined') return;
  const key = ONCE_PREFIX + name;
  try {
    const store = options.persist ? window.localStorage : window.sessionStorage;
    if (store.getItem(key)) return;
    store.setItem(key, '1');
  } catch {
    // Stockage indisponible : mieux vaut un doublon qu'un événement perdu.
  }
  trackEvent(name, props);
}
