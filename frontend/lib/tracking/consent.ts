// Consentement aux cookies non essentiels (Meta Pixel). Plausible ne pose aucun cookie et n'a pas
// besoin de ce consentement — seul le Pixel est concerné.

export type ConsentValue = 'accepted' | 'rejected';
const STORAGE_KEY = 'gc_cookie_consent';
export const CONSENT_CHANGE_EVENT = 'gc:consent-change';

export function getConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'accepted' || v === 'rejected' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: ConsentValue): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Stockage indisponible : le bandeau se représentera au prochain chargement, tant pis.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT));
}
