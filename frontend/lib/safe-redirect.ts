/**
 * Valide un paramètre ?redirect= : uniquement un chemin interne (« /… »),
 * jamais « // » ni « /\ » (sinon redirection ouverte vers un autre domaine).
 */
export function getSafeRedirect(value: string | null | undefined): string | null {
  return value && /^\/(?![/\\])/.test(value) ? value : null;
}
