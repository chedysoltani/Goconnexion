// Périmètre de l'administration par rôle — partagé par middleware.ts (redirections) et
// app/admin/layout.tsx (menu + vérification via /auth/me). La vraie barrière reste le backend
// (RolesGuard → 403) : ceci ne fait que garder l'éditeur dans son périmètre côté interface.

export type AdminRole = 'ADMIN' | 'EDITOR';

export interface AdminNavItem {
  href: string;
  label: string;
  roles: AdminRole[];
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: '/admin', label: 'Vue d’ensemble', roles: ['ADMIN'] },
  { href: '/admin/presentation', label: 'Présentation', roles: ['ADMIN', 'EDITOR'] },
  { href: '/admin/content', label: 'Contenus', roles: ['ADMIN', 'EDITOR'] },
];

// Page d'arrivée de chaque rôle dans l'administration
export const ADMIN_HOME: Record<AdminRole, string> = {
  ADMIN: '/admin',
  EDITOR: '/admin/content',
};

// Cookie non-httpOnly posé par lib/api.ts à la connexion : simple indice de routage,
// jamais une preuve d'autorisation (le rôle réel est relu par le backend à chaque requête).
export const ROLE_MARKER_COOKIE = 'gc_role';

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return role === 'ADMIN' || role === 'EDITOR';
}

const EDITOR_PATHS = ADMIN_NAV.filter((i) => i.roles.includes('EDITOR')).map((i) => i.href);

export function canAccessAdminPath(role: AdminRole, pathname: string): boolean {
  if (role === 'ADMIN') return true;
  return EDITOR_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
