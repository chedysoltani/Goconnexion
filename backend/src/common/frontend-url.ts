/**
 * Returns the primary frontend URL for redirect and link construction.
 * FRONTEND_URL may contain multiple comma-separated origins for CORS
 * (e.g. "https://goconnexion.vercel.app,https://goconnexions.com").
 * Only the first value is a valid base URL for link generation.
 */
export function getFrontendUrl(): string {
  const raw = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  return raw.split(',')[0].trim();
}
