import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not defined in environment');

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('\n GoConnexion Demo Seed — Démarrage...\n');

  // ─── CLEANUP (ordre inverse des dépendances) ──────────────────────────
  console.log('Nettoyage des données existantes...');
  await prisma.feedPostComment.deleteMany({});
  await prisma.feedPostLike.deleteMany({});
  await prisma.feedPost.deleteMany({});
  await prisma.incubatorComment.deleteMany({});
  await prisma.incubatorLike.deleteMany({});
  await prisma.incubatorPost.deleteMany({});
  await prisma.projectApplication.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversationParticipant.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.file.deleteMany({});
  await prisma.eventRegistration.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.businessCardInvitation.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.referralCode.deleteMany({});
  await prisma.advertisement.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.connectionRequest.deleteMany({});
  await prisma.userRelation.deleteMany({});
  await prisma.freelancerProfile.deleteMany({});
  await prisma.entrepreneurProfile.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('OK\n');

  const hash = await bcrypt.hash('chedy', 10);
  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
  const hours = (n: number) => new Date(now.getTime() + n * 60 * 60 * 1000);

  // ─── UTILISATEURS ─────────────────────────────────────────────────────
  console.log('Création des utilisateurs...');

  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@goconnexions.com',
      password: hash,
      firstName: 'Admin',
      lastName: 'GoConnexion',
      role: 'ADMIN',
      plan: 'FREE',
    },
  });

  // 2. Freelancer FREE
  const jeanUser = await prisma.user.create({
    data: {
      email: 'jean.dupont@goconnexions.com',
      password: hash,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'FREELANCER',
      plan: 'FREE',
      freelancerProfile: {
        create: {
          title: 'Développeur Full-Stack',
          bio: "Passionné par les technologies web modernes. Spécialisé Next.js, NestJS et PostgreSQL. 5 ans d'expérience sur des projets SaaS et fintech.",
          skills: ['React', 'TypeScript', 'Node.js', 'NestJS', 'PostgreSQL'],
          hourlyRate: 65.0,
          portfolioUrl: 'https://jeandupont.dev',
          isAvailable: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  // 3. Freelancer PREMIUM
  const sarahUser = await prisma.user.create({
    data: {
      email: 'sarah.benali@goconnexions.com',
      password: hash,
      firstName: 'Sarah',
      lastName: 'Ben Ali',
      role: 'FREELANCER',
      plan: 'PREMIUM_FREELANCER',
      freelancerProfile: {
        create: {
          title: 'UX/UI Designer & Product Strategist',
          bio: "Je conçois des interfaces intuitives centrées sur l'utilisateur. 6 ans d'expérience dans la fintech et les SaaS B2B. Design System, Figma, tests utilisateurs.",
          skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design System'],
          hourlyRate: 80.0,
          portfolioUrl: 'https://sarahbenali.design',
          isAvailable: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  // 4. Freelancer FREE #2
  const leilaUser = await prisma.user.create({
    data: {
      email: 'leila.trabelsi@goconnexions.com',
      password: hash,
      firstName: 'Leila',
      lastName: 'Trabelsi',
      role: 'FREELANCER',
      plan: 'FREE',
      freelancerProfile: {
        create: {
          title: 'Développeuse Mobile React Native',
          bio: "Junior developer passionnée par le mobile. Spécialisée React Native & Expo. En recherche active de missions sur des projets à impact.",
          skills: ['React Native', 'JavaScript', 'Firebase', 'Expo'],
          hourlyRate: 40.0,
          isAvailable: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  // 5. Entrepreneur PREMIUM
  const sophieUser = await prisma.user.create({
    data: {
      email: 'sophie.martin@goconnexions.com',
      password: hash,
      firstName: 'Sophie',
      lastName: 'Martin',
      role: 'ENTREPRENEUR',
      plan: 'PREMIUM_ENTREPRENEUR',
      entrepreneurProfile: {
        create: {
          companyName: 'InnovateTech',
          bio: "Fondatrice & CEO de InnovateTech. On construit l'avenir du SaaS B2B en Afrique du Nord. Ancienne ingénieure chez Orange, entrepreneur depuis 4 ans.",
          website: 'https://innovatetech.io',
        },
      },
    },
    include: { entrepreneurProfile: true },
  });

  // 6. Entrepreneur FREE
  const mohamedUser = await prisma.user.create({
    data: {
      email: 'mohamed.khelil@goconnexions.com',
      password: hash,
      firstName: 'Mohamed',
      lastName: 'Khelil',
      role: 'ENTREPRENEUR',
      plan: 'FREE',
      entrepreneurProfile: {
        create: {
          companyName: 'StartupDZ',
          bio: "Fondateur de StartupDZ, solution de gestion RH pour les PME algériennes. ARR 180K DT. En préparation de notre Série A.",
          website: 'https://startupdz.com',
        },
      },
    },
    include: { entrepreneurProfile: true },
  });

  // 7. Incubateur PREMIUM
  const karimUser = await prisma.user.create({
    data: {
      email: 'karim.mansour@goconnexions.com',
      password: hash,
      firstName: 'Karim',
      lastName: 'Mansour',
      role: 'ENTREPRENEUR',
      plan: 'PREMIUM_INCUBATEUR',
      entrepreneurProfile: {
        create: {
          companyName: 'TechHub Incubateur',
          bio: "Directeur de TechHub Incubateur. On accompagne les startups tech de la région MENA de l'idée au financement. 3 cohortes, 45 startups accompagnées.",
          website: 'https://techhub-incubateur.com',
        },
      },
    },
    include: { entrepreneurProfile: true },
  });

  console.log('  admin@goconnexions.com          → ADMIN');
  console.log('  jean.dupont@goconnexions.com    → FREELANCER FREE');
  console.log('  sarah.benali@goconnexions.com   → FREELANCER PREMIUM');
  console.log('  leila.trabelsi@goconnexions.com → FREELANCER FREE');
  console.log('  sophie.martin@goconnexions.com  → ENTREPRENEUR PREMIUM');
  console.log('  mohamed.khelil@goconnexions.com → ENTREPRENEUR FREE');
  console.log('  karim.mansour@goconnexions.com  → INCUBATEUR PREMIUM');
  console.log('OK\n');

  // ─── ABONNEMENTS ──────────────────────────────────────────────────────
  console.log('Création des abonnements premium...');
  await prisma.subscription.create({
    data: { userId: sarahUser.id, plan: 'PREMIUM_FREELANCER', status: 'ACTIVE', currentPeriodEnd: days(30) },
  });
  await prisma.subscription.create({
    data: { userId: sophieUser.id, plan: 'PREMIUM_ENTREPRENEUR', status: 'ACTIVE', currentPeriodEnd: days(30) },
  });
  await prisma.subscription.create({
    data: { userId: karimUser.id, plan: 'PREMIUM_INCUBATEUR', status: 'ACTIVE', currentPeriodEnd: days(30) },
  });
  console.log('OK\n');

  // ─── PARRAINAGE (REFERRAL) ────────────────────────────────────────────
  // Chaque membre a un code unique. Exemple : Jean a été parrainé par Sarah,
  // Leila a été parrainée par Sophie.
  console.log('Création des codes de parrainage...');
  await prisma.referralCode.create({ data: { userId: admin.id, code: 'GC-ADMIN-0000', totalReferrals: 0 } });
  const jeanCode   = await prisma.referralCode.create({ data: { userId: jeanUser.id,    code: 'GC-JEAN-X7K2',  totalReferrals: 1 } });
  const sarahCode  = await prisma.referralCode.create({ data: { userId: sarahUser.id,   code: 'GC-SARAH-9M3P', totalReferrals: 2 } });
  const sophieCode = await prisma.referralCode.create({ data: { userId: sophieUser.id,  code: 'GC-SOPHIE-4B8N',totalReferrals: 3 } });
  await prisma.referralCode.create({ data: { userId: mohamedUser.id, code: 'GC-MOHAM-2Z5L', totalReferrals: 0 } });
  await prisma.referralCode.create({ data: { userId: karimUser.id,   code: 'GC-KARIM-7R1Q', totalReferrals: 1 } });
  await prisma.referralCode.create({ data: { userId: leilaUser.id,   code: 'GC-LEILA-3W6T', totalReferrals: 0 } });

  // Jean a été parrainé par Sarah, Leila par Sophie
  await prisma.referral.create({ data: { referralCodeId: sarahCode.id,  referredUserId: jeanUser.id  } });
  await prisma.referral.create({ data: { referralCodeId: sophieCode.id, referredUserId: leilaUser.id } });
  console.log('OK\n');

  // ─── PROJETS & CANDIDATURES ───────────────────────────────────────────
  console.log('Création des projets et candidatures...');
  const sophieProfileId  = sophieUser.entrepreneurProfile!.id;
  const mohamedProfileId = mohamedUser.entrepreneurProfile!.id;
  const jeanProfileId    = jeanUser.freelancerProfile!.id;
  const sarahProfileId   = sarahUser.freelancerProfile!.id;
  const leilaProfileId   = leilaUser.freelancerProfile!.id;

  const projectFintech = await prisma.project.create({
    data: {
      title: 'Plateforme E-commerce Fintech',
      description: "Développement d'une marketplace fintech complète avec intégration paiements multi-devises (Stripe, D17, Wave), tableau de bord analytique temps réel et API ouverte pour partenaires.",
      budget: 45000,
      status: 'OPEN',
      skills: ['Next.js', 'NestJS', 'Stripe', 'PostgreSQL', 'TypeScript'],
      ownerId: sophieProfileId,
    },
  });

  const projectSaaS = await prisma.project.create({
    data: {
      title: 'Dashboard SaaS Analytics B2B',
      description: "Création d'un tableau de bord analytics en temps réel pour nos clients entreprise. Visualisation KPIs, exports PDF/Excel, alertes automatiques par email.",
      budget: 28000,
      status: 'IN_PROGRESS',
      skills: ['React', 'Chart.js', 'Python', 'FastAPI', 'Redis'],
      ownerId: sophieProfileId,
    },
  });

  const projectMobile = await prisma.project.create({
    data: {
      title: 'App Mobile de Suivi RH',
      description: "Application mobile iOS & Android pour la gestion des congés, pointage géolocalisé et suivi des performances employés. Intégration avec notre API existante.",
      budget: 18000,
      status: 'OPEN',
      skills: ['React Native', 'Firebase', 'Node.js'],
      ownerId: mohamedProfileId,
    },
  });

  // Candidatures
  await prisma.projectApplication.create({
    data: {
      projectId: projectFintech.id,
      freelancerId: jeanProfileId,
      status: 'PENDING',
      coverLetter: "Bonjour Sophie, je suis développeur full-stack avec 5 ans d'expérience en Next.js et NestJS. J'ai déjà livré 3 projets fintech similaires incluant une intégration Stripe en production. Je serais ravi de discuter de votre vision.",
    },
  });

  await prisma.projectApplication.create({
    data: {
      projectId: projectFintech.id,
      freelancerId: sarahProfileId,
      status: 'ACCEPTED',
      coverLetter: "Bonjour Sophie, je suis spécialisée dans les interfaces fintech. Mon portfolio inclut des projets pour des startups tunisiennes et françaises. Je peux démarrer immédiatement sur la partie UX/UI.",
    },
  });

  await prisma.projectApplication.create({
    data: {
      projectId: projectMobile.id,
      freelancerId: leilaProfileId,
      status: 'PENDING',
      coverLetter: "Bonjour Mohamed, je suis développeuse React Native disponible immédiatement. Ce projet correspond exactement à mon profil. J'ai réalisé une app similaire de gestion de présence pour une école.",
    },
  });

  console.log('  3 projets créés (Fintech OPEN, SaaS IN_PROGRESS, Mobile OPEN)');
  console.log('  3 candidatures (Jean PENDING, Sarah ACCEPTED, Leila PENDING)');
  console.log('OK\n');

  // ─── CONNEXIONS ────────────────────────────────────────────────────────
  console.log('Création des connexions...');

  // Acceptées : Jean ↔ Sophie
  await prisma.connectionRequest.create({
    data: { senderId: jeanUser.id, receiverId: sophieUser.id, status: 'ACCEPTED', message: "Bonjour Sophie, je cherche des opportunités de collaboration sur des projets tech ambitieux." },
  });
  await prisma.userRelation.createMany({ data: [{ userId: jeanUser.id, friendId: sophieUser.id }, { userId: sophieUser.id, friendId: jeanUser.id }] });

  // Acceptées : Sarah ↔ Sophie
  await prisma.connectionRequest.create({
    data: { senderId: sarahUser.id, receiverId: sophieUser.id, status: 'ACCEPTED', message: "Bonjour Sophie ! Je vous suis depuis un moment. Ravie de vous rejoindre sur GoConnexion." },
  });
  await prisma.userRelation.createMany({ data: [{ userId: sarahUser.id, friendId: sophieUser.id }, { userId: sophieUser.id, friendId: sarahUser.id }] });

  // Acceptées : Sophie ↔ Karim
  await prisma.connectionRequest.create({
    data: { senderId: sophieUser.id, receiverId: karimUser.id, status: 'ACCEPTED', message: "Bonjour Karim, InnovateTech serait très intéressée par le programme incubateur TechHub." },
  });
  await prisma.userRelation.createMany({ data: [{ userId: sophieUser.id, friendId: karimUser.id }, { userId: karimUser.id, friendId: sophieUser.id }] });

  // En attente : Jean → Mohamed (coffee chat)
  await prisma.connectionRequest.create({
    data: { senderId: jeanUser.id, receiverId: mohamedUser.id, status: 'PENDING', message: "Bonjour Mohamed, j'ai vu votre projet RH. Ce serait sympa d'échanger autour d'un café virtuel.", isCoffee: true },
  });

  // En attente : Leila → Sarah
  await prisma.connectionRequest.create({
    data: { senderId: leilaUser.id, receiverId: sarahUser.id, status: 'PENDING', message: "Bonjour Sarah, je suis admiratrice de votre travail UX. J'aimerais avoir vos conseils." },
  });

  console.log('  3 connexions acceptées, 2 en attente (dont 1 Coffee Chat)');
  console.log('OK\n');

  // ─── CONVERSATIONS & MESSAGES ─────────────────────────────────────────
  console.log('Création des conversations...');

  const conv1 = await prisma.conversation.create({
    data: { participants: { create: [{ userId: jeanUser.id }, { userId: sophieUser.id }] } },
  });
  await prisma.message.create({ data: { conversationId: conv1.id, senderId: sophieUser.id, content: "Bonjour Jean ! J'ai vu votre candidature pour le projet Fintech. Votre profil est très intéressant." } });
  await prisma.message.create({ data: { conversationId: conv1.id, senderId: jeanUser.id, content: "Bonjour Sophie ! Merci. Je suis très motivé par ce projet. Avez-vous un créneau cette semaine pour un appel de 30 min ?" } });
  await prisma.message.create({ data: { conversationId: conv1.id, senderId: sophieUser.id, content: "Parfait ! Jeudi 14h vous convient ? On peut utiliser la vidéo de la plateforme." } });
  await prisma.message.create({ data: { conversationId: conv1.id, senderId: jeanUser.id, content: "Jeudi 14h c'est parfait ! Je prépare une présentation technique de mon approche. À jeudi !" } });

  const conv2 = await prisma.conversation.create({
    data: { participants: { create: [{ userId: sarahUser.id }, { userId: mohamedUser.id }] } },
  });
  await prisma.message.create({ data: { conversationId: conv2.id, senderId: mohamedUser.id, content: "Bonjour Sarah, j'ai besoin de conseils UX pour mon app RH. Seriez-vous disponible pour une consultation ?" } });
  await prisma.message.create({ data: { conversationId: conv2.id, senderId: sarahUser.id, content: "Bonjour Mohamed ! Bien sûr. Envoyez-moi votre brief et je vous prépare une analyse UX du parcours utilisateur." } });

  const conv3 = await prisma.conversation.create({
    data: { participants: { create: [{ userId: sophieUser.id }, { userId: karimUser.id }] } },
  });
  await prisma.message.create({ data: { conversationId: conv3.id, senderId: karimUser.id, content: "Bonjour Sophie ! TechHub lance sa 4e cohorte en septembre. InnovateTech serait un excellent candidat." } });
  await prisma.message.create({ data: { conversationId: conv3.id, senderId: sophieUser.id, content: "Karim, c'est exactement ce qu'il nous faut ! Comment postuler ?" } });
  await prisma.message.create({ data: { conversationId: conv3.id, senderId: karimUser.id, content: "Je vous envoie le dossier. Le prochain event de présentation est le 28 juin au TechHub !" } });

  console.log('  3 conversations, 9 messages');
  console.log('OK\n');

  // ─── FEED ──────────────────────────────────────────────────────────────
  console.log('Création du fil d\'actualité...');

  const feed1 = await prisma.feedPost.create({
    data: { content: "GoConnexion vient de lancer ! Enfin une plateforme pensée pour les talents et entrepreneurs d'Afrique du Nord. Fier de faire partie de cette aventure. Qui d'autre est sur la plateforme ?", authorId: karimUser.id },
  });
  await prisma.feedPostLike.createMany({ data: [{ postId: feed1.id, userId: sophieUser.id }, { postId: feed1.id, userId: jeanUser.id }, { postId: feed1.id, userId: sarahUser.id }] });
  await prisma.feedPostComment.create({ data: { postId: feed1.id, authorId: sophieUser.id, content: "Tellement content d'être là Karim ! La plateforme est vraiment bien pensée." } });
  await prisma.feedPostComment.create({ data: { postId: feed1.id, authorId: jeanUser.id, content: "J'ai trouvé mon premier projet ici en moins de 48h. Impressionnant !" } });

  const feed2 = await prisma.feedPost.create({
    data: { content: "Je viens de mettre à jour mon profil avec mes projets React Native. Si vous cherchez un dev mobile disponible immédiatement pour votre MVP, contactez-moi ! Ouverte aux missions à partir de juillet.", authorId: leilaUser.id },
  });
  await prisma.feedPostLike.create({ data: { postId: feed2.id, userId: mohamedUser.id } });
  await prisma.feedPostComment.create({ data: { postId: feed2.id, authorId: mohamedUser.id, content: "Parfait timing Leila ! J'ai justement besoin d'un dev mobile pour mon app RH. Je vous contacte." } });

  const feed3 = await prisma.feedPost.create({
    data: { content: "InnovateTech recrute ! On cherche un développeur Full-Stack senior pour notre projet fintech. Budget 45 000 DT. Stack NestJS/Next.js. Remote-friendly. Le projet est publié sur la plateforme. Partagez !", authorId: sophieUser.id },
  });
  await prisma.feedPostLike.createMany({ data: [{ postId: feed3.id, userId: jeanUser.id }, { postId: feed3.id, userId: sarahUser.id }, { postId: feed3.id, userId: karimUser.id }] });
  await prisma.feedPostComment.create({ data: { postId: feed3.id, authorId: jeanUser.id, content: "Candidature déposée ! C'est exactement mon stack technique." } });
  await prisma.feedPostComment.create({ data: { postId: feed3.id, authorId: sarahUser.id, content: "Sophie, j'ai aussi postulé pour la partie design ! Votre vision UX est très alignée avec mon approche." } });

  const feed4 = await prisma.feedPost.create({
    data: { content: "Conseil du jour pour les freelancers : Fixez votre TJM en fonction de la valeur apportée, pas de vos heures travaillées. Un bon design qui double le taux de conversion vaut bien plus que 8h de travail. Votre valeur = valeur client créée.", authorId: sarahUser.id },
  });
  await prisma.feedPostLike.createMany({ data: [{ postId: feed4.id, userId: jeanUser.id }, { postId: feed4.id, userId: leilaUser.id }, { postId: feed4.id, userId: mohamedUser.id }] });

  console.log('  4 posts, 9 likes, 5 commentaires');
  console.log('OK\n');

  // ─── INCUBATEUR ────────────────────────────────────────────────────────
  console.log('Création des posts incubateur...');

  const incub1 = await prisma.incubatorPost.create({
    data: {
      title: 'SaaS de facturation automatique par IA pour Freelancers MENA',
      content: "Idée : un outil qui analyse vos emails, contrats et livrables pour générer automatiquement des factures conformes. Relance automatique client après 30 jours. Intégration D17 & Wave pour la région. Je cherche un co-fondateur tech pour le MVP.",
      category: 'Idea Validation',
      authorId: karimUser.id,
    },
  });
  await prisma.incubatorLike.createMany({ data: [{ postId: incub1.id, userId: jeanUser.id }, { postId: incub1.id, userId: sarahUser.id }, { postId: incub1.id, userId: sophieUser.id }] });
  await prisma.incubatorComment.create({ data: { postId: incub1.id, authorId: jeanUser.id, content: "Idée brillante ! Je perds au moins 4h/mois sur la facturation. Si tu cherches un dev pour le MVP, je suis disponible." } });
  await prisma.incubatorComment.create({ data: { postId: incub1.id, authorId: sarahUser.id, content: "J'adorerais créer les maquettes. L'UX de la facturation est souvent catastrophique, il y a un vrai marché ici." } });
  await prisma.incubatorComment.create({ data: { postId: incub1.id, authorId: sophieUser.id, content: "Karim, on en a parlé lors du dernier meetup ! InnovateTech pourrait être votre premier client pilote." } });

  const incub2 = await prisma.incubatorPost.create({
    data: {
      title: 'Recherche mentors expérimentés en levée de fonds Série A',
      content: "StartupDZ cherche des mentors ayant une expérience en levée de fonds Série A pour le marché MENA/EU. On a un ARR de 180K DT et on prépare notre première levée de 500K€. Besoin de guidance sur la structuration du dossier et les bonnes pratiques de pitch VC.",
      category: 'Mentorship',
      authorId: mohamedUser.id,
    },
  });
  await prisma.incubatorLike.createMany({ data: [{ postId: incub2.id, userId: karimUser.id }, { postId: incub2.id, userId: sophieUser.id }] });
  await prisma.incubatorComment.create({ data: { postId: incub2.id, authorId: karimUser.id, content: "Mohamed, TechHub a justement un programme de coaching pré-levée. Contactez-moi en privé !" } });

  const incub3 = await prisma.incubatorPost.create({
    data: {
      title: 'Collaboration : Module de paiement MENA open source',
      content: "Suite aux discussions sur les alternatives à Stripe : je propose une collaboration entre développeurs pour créer un module de paiement unifié (D17, Wave, Flouci, CIB). Qui est intéressé pour contribuer à l'open source ?",
      category: 'Collaboration',
      authorId: jeanUser.id,
    },
  });
  await prisma.incubatorLike.createMany({ data: [{ postId: incub3.id, userId: mohamedUser.id }, { postId: incub3.id, userId: leilaUser.id }] });

  console.log('  3 posts incubateur (Idea Validation, Mentorship, Collaboration)');
  console.log('OK\n');

  // ─── ÉVÉNEMENTS ────────────────────────────────────────────────────────
  console.log('Création des événements...');

  const eventNetworking = await prisma.event.create({
    data: {
      title: 'GoConnexion Networking Night — Tunis',
      description: "La première grande soirée networking GoConnexion ! Rencontrez les freelancers, entrepreneurs et investisseurs de la scène tech tunisienne. Cocktail, pitches rapides, speed networking. Places limitées à 80 personnes.",
      category: 'NETWORKING',
      type: 'PHYSICAL',
      startDate: days(7),
      endDate: new Date(days(7).getTime() + 3 * 60 * 60 * 1000),
      location: 'The Dot — 10 Rue du Lac Windermere, Berges du Lac, Tunis',
      capacity: 80,
      price: 0,
      isFree: true,
      organizerId: sophieUser.id,
    },
  });

  const eventWebinar = await prisma.event.create({
    data: {
      title: 'Webinar : Lever des fonds en Afrique du Nord — Guide 2026',
      description: "Karim Mansour (TechHub) reçoit 3 investisseurs de la région pour décrypter le paysage du financement startup en Tunisie, Algérie et Maroc. Questions live, études de cas réels.",
      category: 'INVESTISSEMENT',
      type: 'VIRTUAL',
      startDate: days(14),
      endDate: new Date(days(14).getTime() + 2 * 60 * 60 * 1000),
      virtualLink: 'https://meet.google.com/gc-webinar-2026',
      capacity: 200,
      price: 0,
      isFree: true,
      organizerId: karimUser.id,
    },
  });

  const eventWorkshop = await prisma.event.create({
    data: {
      title: 'Workshop Figma to Code : Design System pour Devs',
      description: "Sarah Ben Ali anime un workshop pratique sur la création et l'utilisation d'un Design System. Démo live, exercises pratiques, templates à télécharger. Niveau : intermédiaire.",
      category: 'FORMATION',
      type: 'VIRTUAL',
      startDate: days(10),
      endDate: new Date(days(10).getTime() + 3 * 60 * 60 * 1000),
      virtualLink: 'https://meet.google.com/gc-workshop-design',
      capacity: 30,
      price: 49,
      isFree: false,
      organizerId: sophieUser.id,
    },
  });

  // Inscriptions
  await prisma.eventRegistration.create({ data: { eventId: eventNetworking.id, userId: jeanUser.id,    status: 'REGISTERED'  } });
  await prisma.eventRegistration.create({ data: { eventId: eventNetworking.id, userId: sarahUser.id,   status: 'REGISTERED'  } });
  await prisma.eventRegistration.create({ data: { eventId: eventNetworking.id, userId: mohamedUser.id, status: 'REGISTERED'  } });
  await prisma.eventRegistration.create({ data: { eventId: eventNetworking.id, userId: leilaUser.id,   status: 'WAITLISTED'  } });
  await prisma.eventRegistration.create({ data: { eventId: eventWebinar.id,    userId: jeanUser.id,    status: 'REGISTERED'  } });
  await prisma.eventRegistration.create({ data: { eventId: eventWebinar.id,    userId: mohamedUser.id, status: 'REGISTERED'  } });
  await prisma.eventRegistration.create({ data: { eventId: eventWebinar.id,    userId: sophieUser.id,  status: 'REGISTERED'  } });
  await prisma.eventRegistration.create({ data: { eventId: eventWorkshop.id,   userId: jeanUser.id,    status: 'REGISTERED'  } });
  await prisma.eventRegistration.create({ data: { eventId: eventWorkshop.id,   userId: leilaUser.id,   status: 'REGISTERED'  } });

  console.log('  3 événements (Networking PHYSICAL, Webinar VIRTUAL, Workshop VIRTUAL)');
  console.log('  9 inscriptions (dont 1 liste d\'attente)');
  console.log('OK\n');

  // ─── CARTES DE VISITE ─────────────────────────────────────────────────
  console.log('Création des cartes de visite...');

  await prisma.businessCardInvitation.create({
    data: { senderId: sophieUser.id, name: 'Rania Gharbi',   email: 'rania.gharbi@outlook.com',  company: 'Bank of Tunisia',  position: 'Head of Digital Innovation', inviteMethod: 'EMAIL', status: 'ACCEPTED' },
  });
  await prisma.businessCardInvitation.create({
    data: { senderId: sophieUser.id, name: 'Farouk Belhaj',  email: 'f.belhaj@vc-mena.com',      company: 'MENA Ventures',    position: 'Investment Analyst',          inviteMethod: 'EMAIL', status: 'SENT'    },
  });
  await prisma.businessCardInvitation.create({
    data: { senderId: mohamedUser.id, name: 'Amira Sassi',   phone: '+213 555 0123',              company: 'GovTech Algérie',  position: 'Directrice Partenariats',    inviteMethod: 'SMS',   status: 'SENT'    },
  });
  await prisma.businessCardInvitation.create({
    data: { senderId: karimUser.id,  name: 'Thomas Mercier', email: 'thomas@startup-paris.fr',   company: 'Startup Paris',    position: 'Co-fondateur',               inviteMethod: 'EMAIL', status: 'PENDING' },
  });

  console.log('  4 invitations (1 ACCEPTED, 2 SENT, 1 PENDING)');
  console.log('OK\n');

  // ─── PUBLICITÉS ───────────────────────────────────────────────────────
  console.log('Création des publicités...');

  await prisma.advertisement.create({
    data: {
      title: 'InnovateTech recrute — Développeur Full-Stack Senior',
      description: "Rejoignez InnovateTech ! CDI, remote-friendly, stack NestJS/Next.js. Salaire compétitif + equity. Candidatez maintenant.",
      type: 'COMPANY', placement: 'FEED',
      advertiserId: sophieUser.id,
      impressions: 1240, clicks: 87,
      budget: 500, isActive: true,
      startDate: days(-5), endDate: days(25),
    },
  });

  await prisma.advertisement.create({
    data: {
      title: 'TechHub — Programme Incubateur Automne 2026',
      description: "Rejoignez la 4e cohorte TechHub. 6 mois d'accompagnement, 15K€ de financement, accès réseau investisseurs. Candidatures jusqu'au 15 juillet.",
      type: 'EVENT', placement: 'SIDEBAR',
      advertiserId: karimUser.id,
      impressions: 3560, clicks: 218,
      budget: 800, isActive: true,
      startDate: days(-10), endDate: days(20),
    },
  });

  await prisma.advertisement.create({
    data: {
      title: 'Sarah Ben Ali — Design Sprint en 5 jours',
      description: "Besoin de valider votre concept rapidement ? Design Sprint : 5 jours, de l'idée au prototype testé utilisateurs. Startups uniquement. Places limitées.",
      type: 'SERVICE', placement: 'TOP',
      advertiserId: sarahUser.id,
      impressions: 890, clicks: 45,
      budget: 200, isActive: true,
      startDate: days(-3), endDate: days(27),
    },
  });

  console.log('  3 publicités (FEED 1240 impressions, SIDEBAR 3560 impressions, TOP 890 impressions)');
  console.log('OK\n');

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────────
  console.log('Création des notifications...');

  await prisma.notification.createMany({
    data: [
      { userId: sophieUser.id, title: 'Nouvelle candidature',   content: 'Jean Dupont a postulé à votre projet "Plateforme E-commerce Fintech"',          type: 'PROJECT_APPLICATION', read: false },
      { userId: sophieUser.id, title: 'Nouvelle candidature',   content: 'Sarah Ben Ali a postulé à votre projet "Plateforme E-commerce Fintech"',         type: 'PROJECT_APPLICATION', read: false },
      { userId: jeanUser.id,   title: 'Candidature vue',        content: 'Sophie Martin a consulté votre candidature pour "Plateforme E-commerce Fintech"', type: 'PROJECT_APPLICATION', read: false },
      { userId: jeanUser.id,   title: 'Nouveau message',        content: 'Sophie Martin vous a envoyé un message',                                          type: 'MESSAGE',              read: true  },
      { userId: mohamedUser.id,title: 'Nouvelle candidature',   content: 'Leila Trabelsi a postulé à votre projet "App Mobile de Suivi RH"',               type: 'PROJECT_APPLICATION', read: false },
      { userId: sarahUser.id,  title: 'Demande de connexion',   content: 'Leila Trabelsi souhaite rejoindre votre réseau',                                  type: 'SYSTEM',              read: false },
      { userId: karimUser.id,  title: 'Nouveau message',        content: 'Sophie Martin vous a envoyé un message concernant le programme incubateur',        type: 'MESSAGE',              read: false },
      { userId: leilaUser.id,  title: 'Liste d\'attente',       content: 'Vous êtes sur liste d\'attente pour "GoConnexion Networking Night — Tunis"',       type: 'SYSTEM',              read: false },
    ],
  });

  console.log('  8 notifications');
  console.log('OK\n');

  // ─── RÉSUMÉ FINAL ─────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   GoConnexion Demo Seed — SUCCÈS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  COMPTES DE DEMO (mot de passe : chedy)');
  console.log('  ─────────────────────────────────────────────────────────');
  console.log('  admin@goconnexions.com           Admin');
  console.log('  jean.dupont@goconnexions.com     Freelancer FREE');
  console.log('  sarah.benali@goconnexions.com    Freelancer PREMIUM');
  console.log('  leila.trabelsi@goconnexions.com  Freelancer FREE #2');
  console.log('  sophie.martin@goconnexions.com   Entrepreneur PREMIUM');
  console.log('  mohamed.khelil@goconnexions.com  Entrepreneur FREE');
  console.log('  karim.mansour@goconnexions.com   Incubateur PREMIUM');
  console.log('');
  console.log('  DONNÉES CRÉÉES');
  console.log('  ─────────────────────────────────────────────────────────');
  console.log('  7 utilisateurs    | 3 abonnements premium');
  console.log('  3 projets         | 3 candidatures');
  console.log('  3 connexions OK   | 2 connexions en attente');
  console.log('  3 conversations   | 9 messages');
  console.log('  4 posts feed      | 3 posts incubateur');
  console.log('  3 événements      | 9 inscriptions');
  console.log('  4 cartes de visite| 3 publicités');
  console.log('  7 codes parrainage| 2 parrainages');
  console.log('  8 notifications');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
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
