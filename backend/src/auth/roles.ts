import { UserRole } from '@prisma/client';

// Comptes internes à l'équipe GoConnexions : jamais proposés comme membres du réseau
// (messagerie, suggestions…).
export const STAFF_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.EDITOR];
