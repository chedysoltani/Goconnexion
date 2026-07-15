/**
 * GoConnexions — Production Seed
 * Usage : npm run seed:prod (depuis backend/)
 *
 * Idempotent : si Eric Boudreault existe déjà, le script s'arrête proprement.
 * Mot de passe : GoConnexions2026!
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const avatar = (n: number) => `https://i.pravatar.cc/150?img=${n}`;
const days = (n: number) => new Date(Date.now() + n * 86_400_000);

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   GoConnexions — Production Seed                     ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // ─── Idempotency guard ───────────────────────────────────────────────
  const existing = await prisma.user.findUnique({ where: { email: 'eric@goconnexions.com' } });
  if (existing) {
    console.log('⚠️  Eric Boudreault existe déjà — seed déjà appliqué. Rien à faire.\n');
    return;
  }

  const hash = await bcrypt.hash('GoConnexions2026!', 10);

  // ─── 2 ADMINS ────────────────────────────────────────────────────────
  console.log('① Création des admins...');

  const eric = await prisma.user.create({
    data: {
      email: 'eric@goconnexions.com',
      password: hash,
      firstName: 'Eric',
      lastName: 'Boudreault',
      avatarUrl: avatar(1),
      role: 'ADMIN',
      plan: 'FREE',
      isEmailVerified: true,
    },
  });

  const marie = await prisma.user.create({
    data: {
      email: 'marie.fontaine@goconnexions.com',
      password: hash,
      firstName: 'Marie-Claude',
      lastName: 'Fontaine',
      avatarUrl: avatar(2),
      role: 'ADMIN',
      plan: 'FREE',
      isEmailVerified: true,
    },
  });

  console.log('   eric@goconnexions.com         → ADMIN (Montréal)');
  console.log('   marie.fontaine@...            → ADMIN (Québec City)\n');

  // ─── 8 FREELANCERS ───────────────────────────────────────────────────
  console.log('② Création des freelancers...');

  const jf = await prisma.user.create({
    data: {
      email: 'jf.lavoie@goconnexions.com',
      password: hash,
      firstName: 'Jean-François',
      lastName: 'Lavoie',
      avatarUrl: avatar(3),
      role: 'FREELANCER',
      plan: 'FREE',
      isEmailVerified: true,
      freelancerProfile: {
        create: {
          title: 'Développeur Full-Stack Senior',
          bio: "10 ans d'expérience sur des projets SaaS canadiens et européens. Stack principale : Next.js, NestJS, PostgreSQL, AWS. Remote depuis Montréal.",
          skills: ['Next.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
          hourlyRate: 95,
          portfolioUrl: 'https://jflavoie.dev',
          isAvailable: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  const sophie = await prisma.user.create({
    data: {
      email: 'sophie.tremblay@goconnexions.com',
      password: hash,
      firstName: 'Sophie',
      lastName: 'Tremblay',
      avatarUrl: avatar(4),
      role: 'FREELANCER',
      plan: 'FREE',
      isEmailVerified: true,
      freelancerProfile: {
        create: {
          title: 'Designer UX/UI & Brand Identity',
          bio: "Spécialisée dans les interfaces SaaS et les identités de marque pour startups tech. Basée à Toronto. Clients : Shopify, plusieurs fintech canadiennes.",
          skills: ['Figma', 'Webflow', 'UI Design', 'Branding', 'Design System', 'Prototyping'],
          hourlyRate: 85,
          portfolioUrl: 'https://sophietremblay.design',
          isAvailable: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  const camille = await prisma.user.create({
    data: {
      email: 'camille.lefebvre@goconnexions.com',
      password: hash,
      firstName: 'Camille',
      lastName: 'Lefebvre',
      avatarUrl: avatar(5),
      role: 'FREELANCER',
      plan: 'FREE',
      isEmailVerified: true,
      freelancerProfile: {
        create: {
          title: 'Stratège Marketing Digital & Growth',
          bio: "Ex-growth manager chez une scale-up parisienne (series B). Spécialiste acquisition payante (Google, Meta), email marketing et funnel B2B SaaS. Basée à Paris.",
          skills: ['Growth Hacking', 'Google Ads', 'Meta Ads', 'Email Marketing', 'HubSpot', 'Notion'],
          hourlyRate: 75,
          portfolioUrl: 'https://camillelefebvre.fr',
          isAvailable: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  const thomas = await prisma.user.create({
    data: {
      email: 'thomas.dubois@goconnexions.com',
      password: hash,
      firstName: 'Thomas',
      lastName: 'Dubois',
      avatarUrl: avatar(6),
      role: 'FREELANCER',
      plan: 'FREE',
      isEmailVerified: true,
      freelancerProfile: {
        create: {
          title: 'Rédacteur Tech & Content Strategist',
          bio: "Rédacteur spécialisé B2B SaaS, fintech et IA. Blog articles, whitepapers, landing pages, newsletters. 200+ clients satisfaits sur 5 ans. Basé à Lyon.",
          skills: ['Copywriting', 'SEO', 'Content Strategy', 'LinkedIn', 'Notion', 'WordPress'],
          hourlyRate: 60,
          isAvailable: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  const isabelle = await prisma.user.create({
    data: {
      email: 'isabelle.moreau@goconnexions.com',
      password: hash,
      firstName: 'Isabelle',
      lastName: 'Moreau',
      avatarUrl: avatar(7),
      role: 'FREELANCER',
      plan: 'FREE',
      isEmailVerified: true,
      freelancerProfile: {
        create: {
          title: 'Développeuse Frontend React & Vue.js',
          bio: "Développeuse frontend passionnée par les animations et les performances web. Spécialisée React, Vue.js et Tailwind. Bordeaux / remote.",
          skills: ['React', 'Vue.js', 'Tailwind CSS', 'Framer Motion', 'JavaScript', 'Figma'],
          hourlyRate: 65,
          portfolioUrl: 'https://isabellemoreau.dev',
          isAvailable: false,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  const pierre = await prisma.user.create({
    data: {
      email: 'pierre.bouchard@goconnexions.com',
      password: hash,
      firstName: 'Pierre-Luc',
      lastName: 'Bouchard',
      avatarUrl: avatar(8),
      role: 'FREELANCER',
      plan: 'FREE',
      isEmailVerified: true,
      freelancerProfile: {
        create: {
          title: 'Développeur Mobile iOS & React Native',
          bio: "6 ans de dev mobile natif et cross-platform. Spécialisé apps fintech et santé. App Store : 3 apps avec 100K+ téléchargements. Montréal.",
          skills: ['React Native', 'Swift', 'iOS', 'Firebase', 'Expo', 'TypeScript'],
          hourlyRate: 90,
          portfolioUrl: 'https://pierrebouchard.dev',
          isAvailable: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  const marc = await prisma.user.create({
    data: {
      email: 'marc.beauchamp@goconnexions.com',
      password: hash,
      firstName: 'Marc',
      lastName: 'Beauchamp',
      avatarUrl: avatar(9),
      role: 'FREELANCER',
      plan: 'FREE',
      isEmailVerified: true,
      freelancerProfile: {
        create: {
          title: 'Développeur Backend & DevOps',
          bio: "Architecte backend et DevOps freelance. Spécialisé microservices, CI/CD et infrastructure cloud (AWS, GCP). 8 ans d'expérience. Québec City.",
          skills: ['Node.js', 'Go', 'Kubernetes', 'AWS', 'Terraform', 'GitHub Actions'],
          hourlyRate: 100,
          isAvailable: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  const fatma = await prisma.user.create({
    data: {
      email: 'fatma.chaabani@goconnexions.com',
      password: hash,
      firstName: 'Fatma',
      lastName: 'Chaabani',
      avatarUrl: avatar(10),
      role: 'FREELANCER',
      plan: 'FREE',
      isEmailVerified: true,
      freelancerProfile: {
        create: {
          title: 'Consultante SEO & Marketing de Contenu',
          bio: "Spécialiste SEO et content marketing pour entreprises MENA et Europe. Audits techniques, stratégie de contenu multilingue (FR/AR/EN). Tunis.",
          skills: ['SEO', 'Content Marketing', 'Google Analytics', 'Semrush', 'WordPress', 'Arabic/French/English'],
          hourlyRate: 45,
          isAvailable: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  console.log('   8 freelancers créés (CA×5, FR×2, TN×1)\n');

  // ─── 5 ENTREPRENEURS ─────────────────────────────────────────────────
  console.log('③ Création des entrepreneurs...');

  const alex = await prisma.user.create({
    data: {
      email: 'alex.cote@goconnexions.com',
      password: hash,
      firstName: 'Alexandre',
      lastName: 'Côté',
      avatarUrl: avatar(11),
      role: 'ENTREPRENEUR',
      plan: 'FREE',
      isEmailVerified: true,
      entrepreneurProfile: {
        create: {
          companyName: 'Nexova SaaS',
          bio: "Fondateur de Nexova, plateforme SaaS de gestion de projets pour agences créatives. ARR 380K$. Levée pre-seed de 500K$ complétée. Montréal.",
          website: 'https://nexova.io',
        },
      },
    },
    include: { entrepreneurProfile: true },
  });

  const mehdi = await prisma.user.create({
    data: {
      email: 'mehdi.bensalah@goconnexions.com',
      password: hash,
      firstName: 'Mehdi',
      lastName: 'Ben Salah',
      avatarUrl: avatar(12),
      role: 'ENTREPRENEUR',
      plan: 'FREE',
      isEmailVerified: true,
      entrepreneurProfile: {
        create: {
          companyName: 'DigiConsult MENA',
          bio: "Fondateur de DigiConsult, cabinet de conseil en transformation digitale pour PME tunisiennes et maghrébines. 40+ clients accompagnés depuis 2019. Tunis.",
          website: 'https://digiconsult-mena.tn',
        },
      },
    },
    include: { entrepreneurProfile: true },
  });

  const amina = await prisma.user.create({
    data: {
      email: 'amina.jlassi@goconnexions.com',
      password: hash,
      firstName: 'Amina',
      lastName: 'Jlassi',
      avatarUrl: avatar(13),
      role: 'ENTREPRENEUR',
      plan: 'FREE',
      isEmailVerified: true,
      entrepreneurProfile: {
        create: {
          companyName: 'Artisana Market',
          bio: "Co-fondatrice d'Artisana Market, marketplace e-commerce pour l'artisanat tunisien à destination de la diaspora et de l'Europe. 1 200 artisans partenaires. Tunis / Paris.",
          website: 'https://artisana.tn',
        },
      },
    },
    include: { entrepreneurProfile: true },
  });

  const nadia = await prisma.user.create({
    data: {
      email: 'nadia.riahi@goconnexions.com',
      password: hash,
      firstName: 'Nadia',
      lastName: 'Riahi',
      avatarUrl: avatar(14),
      role: 'ENTREPRENEUR',
      plan: 'FREE',
      isEmailVerified: true,
      entrepreneurProfile: {
        create: {
          companyName: 'EduTech Tunisia',
          bio: "CEO d'EduTech Tunisia, plateforme d'apprentissage en ligne pour étudiants maghrébins préparant des diplômes français et canadiens. 8 000 apprenants actifs. Tunis.",
          website: 'https://edutech.tn',
        },
      },
    },
    include: { entrepreneurProfile: true },
  });

  const yassine = await prisma.user.create({
    data: {
      email: 'yassine.hamdi@goconnexions.com',
      password: hash,
      firstName: 'Yassine',
      lastName: 'Hamdi',
      avatarUrl: avatar(15),
      role: 'ENTREPRENEUR',
      plan: 'FREE',
      isEmailVerified: true,
      entrepreneurProfile: {
        create: {
          companyName: 'PayLink TN',
          bio: "Fondateur de PayLink, solution de paiement en ligne pour commerçants tunisiens. Intégration carte bancaire, Flouci et virement. 300 marchands. Sfax.",
          website: 'https://paylink.tn',
        },
      },
    },
    include: { entrepreneurProfile: true },
  });

  console.log('   5 entrepreneurs créés (CA×1, TN×4)\n');

  const allUsers = [eric, marie, jf, sophie, camille, thomas, isabelle, pierre, marc, fatma, alex, mehdi, amina, nadia, yassine];
  const freelancers = [jf, sophie, camille, thomas, isabelle, pierre, marc, fatma];
  const entrepreneurs = [alex, mehdi, amina, nadia, yassine];

  // ─── CONNEXIONS ────────────────────────────────────────────────────────
  console.log('④ Création des connexions...');

  const connections: Array<[{ id: string }, { id: string }, string]> = [
    [jf,      alex,    "Bonjour Alexandre ! Votre stack Next.js/NestJS pour Nexova correspond exactement à mon profil. Intéressé par une collaboration ?"],
    [sophie,  alex,    "Bonjour Alexandre, j'ai redesigné plusieurs interfaces SaaS dans votre secteur. Ravi de connecter !"],
    [camille, alex,    "Bonjour ! Je cherche des entrepreneurs SaaS canadiens pour des projets de growth. Nexova a l'air d'un super projet."],
    [jf,      mehdi,   "Bonjour Mehdi ! La transformation digitale des PME MENA m'intéresse beaucoup. Coffee chat possible ?"],
    [pierre,  nadia,   "Bonjour Nadia, une app mobile pour EduTech Tunisia serait un super projet. Je suis développeur mobile, discutons-en !"],
    [fatma,   amina,   "Bonjour Amina ! Je travaille le SEO pour des e-commerçants tunisiens. Artisana Market serait parfait pour notre collaboration."],
    [thomas,  yassine, "Bonjour Yassine, j'ai rédigé du contenu pour plusieurs fintechs. PayLink mériterait un beau blog. Contactez-moi !"],
    [marc,    alex,    "Bonjour Alexandre ! Architecture backend pour une scale-up SaaS, c'est exactement ce que je fais. Parlons-en."],
    [isabelle, nadia,  "Bonjour Nadia ! Je suis frontend React/Vue. Une interface moderne pour EduTech Tunisia m'intéresserait vraiment."],
  ];

  for (const [sender, receiver, message] of connections) {
    await prisma.connectionRequest.create({
      data: { senderId: sender.id, receiverId: receiver.id, status: 'ACCEPTED', message },
    });
    await prisma.userRelation.createMany({
      data: [
        { userId: sender.id, friendId: receiver.id },
        { userId: receiver.id, friendId: sender.id },
      ],
      skipDuplicates: true,
    });
  }

  // Quelques connexions en attente
  await prisma.connectionRequest.create({
    data: { senderId: fatma.id, receiverId: camille.id, status: 'PENDING', message: "Bonjour Camille ! Collaboration SEO + marketing digital ?" },
  });
  await prisma.connectionRequest.create({
    data: { senderId: pierre.id, receiverId: marc.id, status: 'PENDING', message: "Salut Marc ! Mobile front + backend solide = équipe parfaite.", isCoffee: true },
  });

  console.log('   9 connexions acceptées, 2 en attente\n');

  // ─── 3 PROJETS OUVERTS ────────────────────────────────────────────────
  console.log('⑤ Création des projets...');

  const alexProfileId   = alex.entrepreneurProfile!.id;
  const aminaProfileId  = amina.entrepreneurProfile!.id;
  const nadiaProfileId  = nadia.entrepreneurProfile!.id;

  const projectNexova = await prisma.project.create({
    data: {
      title: 'Refonte UX & Design System — Nexova SaaS',
      description: "Nexova cherche un designer senior pour refondre l'interface de notre plateforme de gestion de projets. Objectif : réduire le temps d'onboarding de 40%. Livrable : Design System Figma complet + maquettes 30 écrans. Remote, démarrage début août.",
      budget: 12000,
      status: 'OPEN',
      skills: ['Figma', 'UI Design', 'UX Research', 'Design System', 'Prototyping'],
      ownerId: alexProfileId,
    },
  });

  const projectArtisana = await prisma.project.create({
    data: {
      title: 'Développement App Mobile Artisana Market (iOS + Android)',
      description: "Création de l'application mobile de notre marketplace artisanat. Fonctionnalités : catalogue produits, paiement Stripe, messagerie vendeur-acheteur, notifications push. API REST déjà en place. React Native préféré.",
      budget: 22000,
      status: 'OPEN',
      skills: ['React Native', 'iOS', 'Android', 'Stripe', 'Firebase', 'TypeScript'],
      ownerId: aminaProfileId,
    },
  });

  const projectEduTech = await prisma.project.create({
    data: {
      title: 'Stratégie SEO & Content Marketing — EduTech Tunisia',
      description: "EduTech Tunisia cherche un expert SEO pour développer notre trafic organique. Audit technique, stratégie de contenu bilingue FR/AR, optimisation landing pages, link building. Objectif : ×3 le trafic organique en 6 mois.",
      budget: 8000,
      status: 'OPEN',
      skills: ['SEO', 'Content Marketing', 'Google Analytics', 'Semrush', 'French', 'Arabic'],
      ownerId: nadiaProfileId,
    },
  });

  // Candidatures sur les projets
  await prisma.projectApplication.create({
    data: {
      projectId: projectNexova.id,
      freelancerId: sophie.freelancerProfile!.id,
      status: 'PENDING',
      coverLetter: "Bonjour Alexandre ! J'ai redesigné 4 interfaces SaaS similaires à Nexova. Mon approche : research utilisateurs d'abord, puis Design System évolutif. Portfolio disponible. Disponible dès le 1er août.",
    },
  });

  await prisma.projectApplication.create({
    data: {
      projectId: projectArtisana.id,
      freelancerId: pierre.freelancerProfile!.id,
      status: 'PENDING',
      coverLetter: "Bonjour Amina ! Développeur React Native depuis 6 ans, j'ai livré 3 apps marketplace similaires. La stack que vous décrivez correspond parfaitement à mon expertise. Taux horaire 90$/h, disponible immédiatement.",
    },
  });

  await prisma.projectApplication.create({
    data: {
      projectId: projectEduTech.id,
      freelancerId: fatma.freelancerProfile!.id,
      status: 'PENDING',
      coverLetter: "Bonjour Nadia ! SEO bilingue FR/AR pour l'enseignement, c'est exactement mon domaine. J'ai accompagné 3 plateformes EdTech tunisiennes dont une a multiplié son trafic par 4 en 8 mois. Je serais ravie d'en discuter.",
    },
  });

  console.log('   3 projets OPEN (Design Nexova, Mobile Artisana, SEO EduTech)');
  console.log('   3 candidatures PENDING\n');

  // ─── 10 POSTS DE FEED ────────────────────────────────────────────────
  console.log('⑥ Création du fil d\'actualité...');

  const posts = await Promise.all([

    prisma.feedPost.create({ data: {
      content: "🚀 GoConnexions vient de dépasser les 2 400 membres ! Merci à chacun d'entre vous qui faites vivre cette communauté. Notre mission : vous aider à construire des connexions professionnelles qui ont vraiment du sens. La meilleure est à venir 👇",
      authorId: eric.id,
    }}),

    prisma.feedPost.create({ data: {
      content: "Conseil networking #1 : Arrêtez d'envoyer des invitations LinkedIn génériques. Un message personnalisé de 3 lignes — pourquoi vous contactez cette personne spécifiquement, ce que vous avez en commun, ce que vous proposez — multiplie votre taux de réponse par 6. Testez, vous m'en direz des nouvelles.",
      authorId: jf.id,
    }}),

    prisma.feedPost.create({ data: {
      content: "J'ai redesigné l'onboarding de Nexova SaaS ce mois-ci. Résultat : -35% d'abandon à l'étape 2 et +22% de comptes complétés. La leçon : réduire à 3 étapes max, une seule action par écran, et afficher une barre de progression. Simple mais radical. Est-ce que votre SaaS souffre du même problème ?",
      authorId: sophie.id,
    }}),

    prisma.feedPost.create({ data: {
      content: "Le mythe du freelance en pyjama ☕ — Réalité après 5 ans : je travaille plus qu'en CDI, mais sur ce que je veux, avec qui je veux, depuis où je veux. La liberté coûte de la discipline. Mais ça vaut chaque matin sans alarme obligatoire 🙏 Qui d'autre reconnaît ce tableau ?",
      authorId: camille.id,
    }}),

    prisma.feedPost.create({ data: {
      content: "Artisana Market vient de signer un partenariat avec une galerie d'art contemporain à Montréal 🎨 Les artisans tunisiens vont pouvoir exposer leurs pièces au Canada. Merci à tous ceux qui nous ont mis en relation sur GoConnexions — c'est exactement pour ça qu'on est ici !",
      authorId: amina.id,
    }}),

    prisma.feedPost.create({ data: {
      content: "Thread SEO pour les non-techniciens 🧵 :\n1. Le meilleur contenu SEO répond à une vraie question, pas juste à un mot-clé\n2. La vitesse de page compte autant que les mots\n3. Un backlink d'un partenaire local vaut plus que 10 annuaires génériques\n4. Publiez régulièrement, même court\nVous avez des questions sur votre stratégie ? Commentez ci-dessous 👇",
      authorId: fatma.id,
    }}),

    prisma.feedPost.create({ data: {
      content: "EduTech Tunisia dépasse les 8 000 apprenants actifs ! 🎓 Ce qui nous rend fiers : 67% de nos étudiants viennent de villes secondaires — Sfax, Sousse, Gafsa. L'accès à une éducation de qualité ne devrait pas dépendre du code postal. On continue. Merci à notre équipe et à nos partenaires.",
      authorId: nadia.id,
    }}),

    prisma.feedPost.create({ data: {
      content: "Réflexion du vendredi : On sous-estime toujours le pouvoir d'un café virtuel de 20 minutes. Cette semaine, un call impromptu avec un entrepreneur sur GoConnexions a débouché sur une recommandation client. Mon meilleur ROI de la semaine, sans aucun doute. Votre réseau est votre actif le plus sous-utilisé.",
      authorId: marc.id,
    }}),

    prisma.feedPost.create({ data: {
      content: "PayLink TN vient d'intégrer le paiement par QR code pour les commerçants 🤳 Un marchand au marché de Sfax peut maintenant recevoir des paiements carte sans TPE. C'est ça la fintech au service du terrain. Merci à notre développeur Pierre-Luc pour l'intégration mobile impeccable !",
      authorId: yassine.id,
    }}),

    prisma.feedPost.create({ data: {
      content: "Question à la communauté : Quel outil utilisez-vous pour gérer vos relations professionnelles ? LinkedIn ? Notion ? Un CRM ? Ou... GoConnexions 😏 Sérieusement, la gestion des connexions est le plus grand angle mort des professionnels indépendants. Curieux de savoir comment vous faites.",
      authorId: thomas.id,
    }}),

  ]);

  // Likes croisés pour animer le feed
  const likeData = [
    // Post Eric → liked by freelancers & entrepreneurs
    { postId: posts[0].id, userId: jf.id },
    { postId: posts[0].id, userId: sophie.id },
    { postId: posts[0].id, userId: alex.id },
    { postId: posts[0].id, userId: mehdi.id },
    { postId: posts[0].id, userId: nadia.id },
    // Post JF
    { postId: posts[1].id, userId: camille.id },
    { postId: posts[1].id, userId: thomas.id },
    { postId: posts[1].id, userId: marc.id },
    { postId: posts[1].id, userId: alex.id },
    // Post Sophie
    { postId: posts[2].id, userId: alex.id },
    { postId: posts[2].id, userId: nadia.id },
    { postId: posts[2].id, userId: jf.id },
    // Post Camille
    { postId: posts[3].id, userId: jf.id },
    { postId: posts[3].id, userId: isabelle.id },
    { postId: posts[3].id, userId: fatma.id },
    // Post Amina
    { postId: posts[4].id, userId: fatma.id },
    { postId: posts[4].id, userId: sophie.id },
    { postId: posts[4].id, userId: eric.id },
    { postId: posts[4].id, userId: mehdi.id },
    // Post Fatma
    { postId: posts[5].id, userId: nadia.id },
    { postId: posts[5].id, userId: amina.id },
    { postId: posts[5].id, userId: thomas.id },
    // Post Nadia
    { postId: posts[6].id, userId: eric.id },
    { postId: posts[6].id, userId: mehdi.id },
    { postId: posts[6].id, userId: amina.id },
    { postId: posts[6].id, userId: isabelle.id },
    // Post Marc
    { postId: posts[7].id, userId: jf.id },
    { postId: posts[7].id, userId: pierre.id },
    { postId: posts[7].id, userId: camille.id },
    // Post Yassine
    { postId: posts[8].id, userId: pierre.id },
    { postId: posts[8].id, userId: mehdi.id },
    { postId: posts[8].id, userId: fatma.id },
    // Post Thomas
    { postId: posts[9].id, userId: jf.id },
    { postId: posts[9].id, userId: camille.id },
    { postId: posts[9].id, userId: marie.id },
    { postId: posts[9].id, userId: alex.id },
  ];

  await prisma.feedPostLike.createMany({ data: likeData, skipDuplicates: true });

  // Commentaires
  await prisma.feedPostComment.createMany({
    data: [
      { postId: posts[0].id, authorId: jf.id,     content: "Fier d'en faire partie dès le lancement ! La plateforme est vraiment bien pensée." },
      { postId: posts[0].id, authorId: alex.id,    content: "Nexova a trouvé 2 freelancers qualifiés via GoConnexions en moins d'une semaine. Impressionnant." },
      { postId: posts[1].id, authorId: camille.id, content: "Tellement vrai. On a obtenu 3 collaborations cette année juste avec des messages bien ciblés." },
      { postId: posts[1].id, authorId: thomas.id,  content: "Je partage cette approche à tous mes clients qui veulent développer leur réseau. Merci JF !" },
      { postId: posts[2].id, authorId: alex.id,    content: "Sophie c'est exactement ce que tu as réalisé pour Nexova ! L'impact sur nos conversions a été immédiat." },
      { postId: posts[4].id, authorId: eric.id,    content: "Bravo Amina ! C'est exactement le type de collaboration que GoConnexions veut faciliter 🙌" },
      { postId: posts[6].id, authorId: eric.id,    content: "8 000 apprenants c'est énorme ! Bravo Nadia et toute l'équipe EduTech." },
      { postId: posts[8].id, authorId: pierre.id,  content: "Super projet Yassine ! L'intégration QR code React Native était un vrai plaisir. Hâte de voir la suite." },
      { postId: posts[9].id, authorId: jf.id,      content: "GoConnexions évidemment 😄 Mais sérieusement, j'ai un Notion perso pour noter mes interactions importantes." },
      { postId: posts[9].id, authorId: marc.id,    content: "Notion CRM fait maison pour moi. Mais GoConnexions commence vraiment à le remplacer." },
    ],
  });

  console.log('   10 posts, 36 likes, 10 commentaires\n');

  // ─── 3 ÉVÉNEMENTS ─────────────────────────────────────────────────────
  console.log('⑦ Création des événements...');

  const eventMeetup = await prisma.event.create({
    data: {
      title: 'GoConnexions Meetup Montréal — Networking & Pitches',
      description: "Le premier grand meetup GoConnexions à Montréal ! Freelancers, entrepreneurs et investisseurs se réunissent pour networker, pitcher et collaborer. Format : 30 min networking libre, 6 pitches de 5 min, 1h30 soirée ouverte. Entrée gratuite, places limitées à 60 personnes.",
      category: 'NETWORKING',
      type: 'PHYSICAL',
      startDate: days(18),
      endDate: new Date(days(18).getTime() + 3 * 3_600_000),
      location: 'Notman House — 51 Rue Sherbrooke O, Montréal, QC H2X 1X2',
      address: '51 Rue Sherbrooke Ouest, Montréal',
      capacity: 60,
      price: 0,
      isFree: true,
      organizerId: eric.id,
    },
  });

  const eventWebinar = await prisma.event.create({
    data: {
      title: 'Webinaire : Facturer plus cher en freelance — La méthode valeur',
      description: "Comment passer de 50$/h à 120$/h sans changer de stack ni de clients ? Jean-François Lavoie et Sophie Tremblay partagent leur méthode : se positionner sur la valeur livrée, non les heures. Inclut : template de proposition commerciale + session Q&A live.",
      category: 'FORMATION',
      type: 'VIRTUAL',
      startDate: days(14),
      endDate: new Date(days(14).getTime() + 2 * 3_600_000),
      virtualLink: 'https://meet.google.com/gc-webinar-freelance-2026',
      capacity: 150,
      price: 0,
      isFree: true,
      organizerId: jf.id,
    },
  });

  const eventSalon = await prisma.event.create({
    data: {
      title: 'Salon Startup Tunisie 2026 — Stands & Networking',
      description: "Le plus grand salon entrepreneurial de Tunisie revient ! 50 startups exposantes, panels investisseurs, zone recrutement, ateliers pratiques. GoConnexions est partenaire officiel. Accès gratuit pour les membres.",
      category: 'SALON',
      type: 'PHYSICAL',
      startDate: days(28),
      endDate: new Date(days(29).getTime() + 8 * 3_600_000),
      location: 'Palais des Congrès — Avenue Mohamed V, Tunis',
      address: 'Avenue Mohamed V, Tunis 1073',
      capacity: 500,
      price: 0,
      isFree: true,
      organizerId: mehdi.id,
    },
  });

  // Inscriptions aux événements
  const eventRegistrations = [
    { eventId: eventMeetup.id, userId: jf.id },
    { eventId: eventMeetup.id, userId: sophie.id },
    { eventId: eventMeetup.id, userId: camille.id },
    { eventId: eventMeetup.id, userId: marc.id },
    { eventId: eventMeetup.id, userId: pierre.id },
    { eventId: eventMeetup.id, userId: alex.id },
    { eventId: eventWebinar.id, userId: camille.id },
    { eventId: eventWebinar.id, userId: thomas.id },
    { eventId: eventWebinar.id, userId: isabelle.id },
    { eventId: eventWebinar.id, userId: fatma.id },
    { eventId: eventWebinar.id, userId: pierre.id },
    { eventId: eventWebinar.id, userId: alex.id },
    { eventId: eventWebinar.id, userId: nadia.id },
    { eventId: eventSalon.id, userId: fatma.id },
    { eventId: eventSalon.id, userId: amina.id },
    { eventId: eventSalon.id, userId: yassine.id },
    { eventId: eventSalon.id, userId: nadia.id },
  ];

  for (const reg of eventRegistrations) {
    await prisma.eventRegistration.create({ data: { ...reg, status: 'REGISTERED' } });
  }

  console.log('   3 événements (Meetup MTL J+18, Webinaire J+14, Salon TN J+28)');
  console.log('   17 inscriptions\n');

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────
  console.log('⑧ Création des notifications...');

  await prisma.notification.createMany({
    data: [
      { userId: alex.id,  title: 'Nouvelle candidature', content: 'Sophie Tremblay a postulé à "Refonte UX & Design System — Nexova SaaS"',    type: 'PROJECT_APPLICATION', read: false },
      { userId: amina.id, title: 'Nouvelle candidature', content: 'Pierre-Luc Bouchard a postulé à "Développement App Mobile Artisana Market"', type: 'PROJECT_APPLICATION', read: false },
      { userId: nadia.id, title: 'Nouvelle candidature', content: 'Fatma Chaabani a postulé à "Stratégie SEO & Content Marketing — EduTech"',  type: 'PROJECT_APPLICATION', read: false },
      { userId: jf.id,    title: 'Demande de connexion', content: 'Alexandre Côté a accepté votre demande de connexion',                        type: 'SYSTEM',              read: false },
      { userId: sophie.id,title: 'Demande de connexion', content: 'Alexandre Côté a accepté votre demande de connexion',                        type: 'SYSTEM',              read: true  },
      { userId: fatma.id, title: 'Demande de connexion', content: 'Amina Jlassi a accepté votre demande de connexion',                          type: 'SYSTEM',              read: false },
      { userId: pierre.id,title: 'Nouvel événement',     content: 'GoConnexions Meetup Montréal — vous êtes inscrit !',                         type: 'SYSTEM',              read: false },
      { userId: camille.id,title:'Nouvel événement',     content: 'Webinaire "Facturer plus cher" — rappel dans 14 jours',                      type: 'SYSTEM',              read: true  },
      { userId: eric.id,  title: 'Nouveau membre',       content: '15 nouveaux membres ont rejoint GoConnexions aujourd\'hui',                   type: 'SYSTEM',              read: false },
      { userId: marie.id, title: 'Statistiques',         content: '36 likes et 10 commentaires générés sur le feed cette semaine',              type: 'SYSTEM',              read: false },
    ],
  });

  console.log('   10 notifications\n');

  // ─── RÉSUMÉ ───────────────────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   GoConnexions — Production Seed TERMINÉ ✅                  ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║                                                              ║');
  console.log('║  MOT DE PASSE UNIVERSEL : GoConnexions2026!                 ║');
  console.log('║                                                              ║');
  console.log('║  ADMINS                                                      ║');
  console.log('║  eric@goconnexions.com           Eric Boudreault (MTL)       ║');
  console.log('║  marie.fontaine@goconnexions.com Marie-Claude Fontaine (QC)  ║');
  console.log('║                                                              ║');
  console.log('║  FREELANCERS (8)                                             ║');
  console.log('║  jf.lavoie@...        Dev Full-Stack Senior   95$/h  CA      ║');
  console.log('║  sophie.tremblay@...  Designer UX/UI          85$/h  CA      ║');
  console.log('║  camille.lefebvre@... Marketing Digital        75$/h  FR      ║');
  console.log('║  thomas.dubois@...    Rédacteur Tech           60$/h  FR      ║');
  console.log('║  isabelle.moreau@...  Dev Frontend React       65$/h  FR      ║');
  console.log('║  pierre.bouchard@...  Dev Mobile iOS/RN        90$/h  CA      ║');
  console.log('║  marc.beauchamp@...   Dev Backend & DevOps    100$/h  CA      ║');
  console.log('║  fatma.chaabani@...   SEO & Content            45$/h  TN      ║');
  console.log('║                                                              ║');
  console.log('║  ENTREPRENEURS (5)                                           ║');
  console.log('║  alex.cote@...        Nexova SaaS              CA            ║');
  console.log('║  mehdi.bensalah@...   DigiConsult MENA         TN            ║');
  console.log('║  amina.jlassi@...     Artisana Market          TN            ║');
  console.log('║  nadia.riahi@...      EduTech Tunisia          TN            ║');
  console.log('║  yassine.hamdi@...    PayLink TN               TN            ║');
  console.log('║                                                              ║');
  console.log('║  DONNÉES                                                     ║');
  console.log('║  15 users  •  9 connexions  •  3 projets  •  3 candidatures ║');
  console.log('║  10 posts  •  36 likes  •  10 commentaires                  ║');
  console.log('║  3 événements  •  17 inscriptions  •  10 notifications      ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
}

main()
  .catch((e) => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
