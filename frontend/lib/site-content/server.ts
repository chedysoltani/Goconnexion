// Lecture côté serveur (Server Components) d'un contenu SiteContent, mise en cache ISR.
// En cas d'erreur (API indisponible, contenu absent), retourne null : l'appelant affiche son texte par défaut.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Délai de prise en compte d'une modification faite dans /admin/presentation
export const SITE_CONTENT_REVALIDATE_SECONDS = 300;

export async function fetchSiteContent(key: string): Promise<{ title: string; content: unknown } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/site-content/${encodeURIComponent(key)}`, {
      next: { revalidate: SITE_CONTENT_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
