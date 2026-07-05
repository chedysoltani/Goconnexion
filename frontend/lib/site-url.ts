const FALLBACK_SITE_URL = 'http://localhost:3000';

// Valide que NEXT_PUBLIC_SITE_URL est une URL absolue exploitable (pas juste définie) —
// une valeur présente mais malformée (ex: sans protocole) ferait planter `new URL(...)`.
export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (!value) return FALLBACK_SITE_URL;

  try {
    new URL(value);
    return value;
  } catch {
    return FALLBACK_SITE_URL;
  }
}
