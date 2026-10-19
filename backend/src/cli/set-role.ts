/**
 * Change le rôle d'un utilisateur existant.
 *
 * Prod (dans le conteneur backend) :
 *   docker compose exec backend node dist/src/cli/set-role.js marketing@goconnexions.com EDITOR
 * Dev :
 *   npm run set-role -- marketing@goconnexions.com EDITOR
 *
 * Rôles acceptés : toutes les valeurs de UserRole (ADMIN inclus : ce script nécessite un accès
 * au serveur, c'est le seul moyen de créer un admin). L'interface /admin, elle, ne gère que EDITOR.
 */
import 'dotenv/config';
import { UserRole } from '@prisma/client';
import { createCliPrisma } from './cli-prisma';

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const role = process.argv[3]?.trim().toUpperCase() as UserRole | undefined;
  const roles = Object.values(UserRole);
  if (!email || !role || !roles.includes(role)) {
    console.error(`Usage : set-role <email> <${roles.join('|')}>`);
    process.exit(1);
  }

  const { prisma, close } = createCliPrisma();
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (!user) {
      console.error(`❌ Aucun utilisateur avec l'email ${email}`);
      process.exitCode = 1;
      return;
    }
    if (user.role === role) {
      console.log(`ℹ️  ${email} a déjà le rôle ${role}`);
      return;
    }
    await prisma.user.update({ where: { id: user.id }, data: { role } });
    console.log(`✅ ${email} : ${user.role} → ${role}`);
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
