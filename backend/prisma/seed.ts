import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seeding database...');

  // Clean old data first
  await prisma.feedPostComment.deleteMany({});
  await prisma.feedPostLike.deleteMany({});
  await prisma.feedPost.deleteMany({});
  await prisma.incubatorComment.deleteMany({});
  await prisma.incubatorLike.deleteMany({});
  await prisma.incubatorPost.deleteMany({});
  await prisma.projectApplication.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.freelancerProfile.deleteMany({});
  await prisma.entrepreneurProfile.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversationParticipant.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('chedy', 10);

  // 1. Create a Freelancer User
  const freelancerUser = await prisma.user.create({
    data: {
      email: 'freelancer@goconnexions.com',
      password: passwordHash,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'FREELANCER',
      freelancerProfile: {
        create: {
          title: 'Développeur Full-Stack',
          bio: 'Développeur Full-Stack passionné spécialisé dans Next.js, React et NestJS. Plus de 5 ans d\'expérience.',
          skills: ['React', 'TypeScript', 'Node.js', 'NestJS', 'PostgreSQL'],
          hourlyRate: 65.0,
          portfolioUrl: 'https://jeandupont.dev',
          isAvailable: true,
        },
      },
    },
    include: {
      freelancerProfile: true,
    }
  });

  // 2. Create another Freelancer User
  const freelancerUser2 = await prisma.user.create({
    data: {
      email: 'marie.laurent@goconnexions.com',
      password: passwordHash,
      firstName: 'Marie',
      lastName: 'Laurent',
      role: 'FREELANCER',
      freelancerProfile: {
        create: {
          title: 'UX/UI Designer',
          bio: 'UX/UI Designer créant des interfaces intuitives, esthétiques et axées sur l\'utilisateur. Plus de 3 ans d\'expérience.',
          skills: ['Figma', 'UI Design', 'UX Research', 'Tailwind CSS', 'Wireframing'],
          hourlyRate: 55.0,
          portfolioUrl: 'https://marielaurent.design',
          isAvailable: true,
        },
      },
    },
    include: {
      freelancerProfile: true,
    }
  });

  // 3. Create an Entrepreneur User
  const entrepreneurUser = await prisma.user.create({
    data: {
      email: 'entrepreneur@goconnexions.com',
      password: passwordHash,
      firstName: 'Sophie',
      lastName: 'Martin',
      role: 'ENTREPRENEUR',
      entrepreneurProfile: {
        create: {
          companyName: 'InnovateTech',
          bio: 'Fondatrice de InnovateTech, startup axée sur l\'intelligence artificielle pour la productivité.',
          website: 'https://innovatetech.io',
        },
      },
    },
    include: {
      entrepreneurProfile: true,
    }
  });

  console.log('Seeded Users:');
  console.log(`- Freelancer: ${freelancerUser.email} (password: chedy)`);
  console.log(`- Freelancer 2: ${freelancerUser2.email} (password: chedy)`);
  console.log(`- Entrepreneur: ${entrepreneurUser.email} (password: chedy)`);

  const entProfileId = entrepreneurUser.entrepreneurProfile?.id;
  if (!entProfileId) {
    throw new Error('Entrepreneur profile creation failed');
  }

  // 4. Create some Projects for the Entrepreneur
  const project1 = await prisma.project.create({
    data: {
      title: 'Plateforme E-commerce Fintech',
      description: 'Développement d\'une plateforme de commerce en ligne complète avec intégration de paiements sécurisés et tableau de bord de statistiques.',
      budget: 45000,
      status: 'OPEN',
      skills: ['Next.js', 'NestJS', 'Stripe', 'PostgreSQL'],
      ownerId: entProfileId,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Application Mobile de Suivi de Santé',
      description: 'Conception et développement d\'une application mobile iOS & Android pour le suivi quotidien de patients atteints de maladies chroniques.',
      budget: 32000,
      status: 'OPEN',
      skills: ['React Native', 'Firebase', 'Healthcare'],
      ownerId: entProfileId,
    },
  });

  console.log('Seeded Projects:');
  console.log(`- Project 1: ${project1.title}`);
  console.log(`- Project 2: ${project2.title}`);

  // 5. Create some applications
  await prisma.projectApplication.create({
    data: {
      projectId: project1.id,
      freelancerId: freelancerUser.id,
      status: 'PENDING',
      coverLetter: 'Bonjour Sophie, je suis très intéressé par votre projet fintech. J\'ai déjà réalisé 3 plateformes similaires.',
    },
  });

  // 6. Create some Incubator Posts (ideas)
  const incubator1 = await prisma.incubatorPost.create({
    data: {
      title: 'SaaS d\'automatisation de factures IA pour Freelancers',
      content: 'L\'idée est de créer un outil qui scanne vos conversations e-mails et contrats et génère automatiquement des factures conformes à envoyer aux clients en un clic, avec relance automatique en cas de retard.',
      category: 'Tech',
      authorId: entrepreneurUser.id,
    },
  });

  const incubator2 = await prisma.incubatorPost.create({
    data: {
      title: 'Réseau social d\'apprentissage solidaire en Afrique',
      content: 'Une plateforme communautaire qui connecte les étudiants africains avec des mentors universitaires internationaux pour du tutorat gratuit financé par le micro-mécénat.',
      category: 'Social',
      authorId: freelancerUser.id,
    },
  });

  // Add likes and comments to incubator posts
  await prisma.incubatorLike.create({
    data: {
      postId: incubator1.id,
      userId: freelancerUser.id,
    },
  });

  await prisma.incubatorComment.create({
    data: {
      postId: incubator1.id,
      authorId: freelancerUser.id,
      content: 'C\'est une excellente idée ! Je perds un temps fou sur la facturation chaque fin de mois. Si tu cherches un développeur pour le MVP, je suis disponible !',
    },
  });

  await prisma.incubatorComment.create({
    data: {
      postId: incubator1.id,
      authorId: freelancerUser2.id,
      content: 'Très bonne idée, je serais ravie de faire des maquettes Figma pour tester l\'expérience utilisateur !',
    },
  });

  // 7. Seed FeedPosts
  const feedPost1 = await prisma.feedPost.create({
    data: {
      content: 'Bienvenue sur GoConnexions ! Je suis ravie de lancer ce réseau pour connecter les meilleurs talents. Partagez vos idées et vos projets ! 🚀',
      authorId: entrepreneurUser.id,
    },
  });

  const feedPost2 = await prisma.feedPost.create({
    data: {
      content: 'Je viens de mettre à jour mon profil avec mes projets récents en Next.js 14 et NestJS. N\'hésitez pas à me contacter pour toute collaboration sur vos MVP ! 💻',
      authorId: freelancerUser.id,
    },
  });

  // Add likes/comments on feed posts
  await prisma.feedPostLike.create({
    data: {
      postId: feedPost2.id,
      userId: entrepreneurUser.id,
    },
  });

  await prisma.feedPostComment.create({
    data: {
      postId: feedPost2.id,
      authorId: entrepreneurUser.id,
      content: 'Superbe portfolio Jean ! Je t\'envoie un message privé pour en discuter plus en détail.',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
