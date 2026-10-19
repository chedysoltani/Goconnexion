/**
 * Change le mot de passe d'un utilisateur.
 *
 * Prod (dans le conteneur backend) :
 *   docker compose exec -it backend node dist/src/cli/set-password.js eric@goconnexions.com
 * Dev :
 *   npm run set-password -- eric@goconnexions.com
 *
 * Le mot de passe est demandé au clavier (non affiché) pour ne pas finir dans l'historique du shell.
 * Non interactif : NEW_PASSWORD='...' node dist/src/cli/set-password.js <email>
 */
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';
import { createCliPrisma } from './cli-prisma';

const MIN_LENGTH = 10;

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    (rl as any)._writeToOutput = (s: string) => {
      if (!muted || s.includes('\n')) process.stdout.write(muted ? '\n' : s);
    };
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error('Usage : set-password <email>');
    process.exit(1);
  }

  let password = process.env.NEW_PASSWORD;
  if (!password) {
    password = await askHidden('Nouveau mot de passe : ');
    const confirm = await askHidden('Confirmer : ');
    if (password !== confirm) {
      console.error('❌ Les mots de passe ne correspondent pas.');
      process.exit(1);
    }
  }
  if (password.length < MIN_LENGTH) {
    console.error(`❌ Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`);
    process.exit(1);
  }

  const { prisma, close } = createCliPrisma();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`❌ Aucun utilisateur avec l'email ${email}`);
      process.exitCode = 1;
      return;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(password, 10),
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    console.log(`✅ Mot de passe mis à jour pour ${email}`);
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
