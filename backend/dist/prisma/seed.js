"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
const bcrypt = __importStar(require("bcrypt"));
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment');
}
const pool = new pg_1.default.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Starting seeding database...');
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
    await prisma.projectApplication.create({
        data: {
            projectId: project1.id,
            freelancerId: freelancerUser.id,
            status: 'PENDING',
            coverLetter: 'Bonjour Sophie, je suis très intéressé par votre projet fintech. J\'ai déjà réalisé 3 plateformes similaires.',
        },
    });
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
//# sourceMappingURL=seed.js.map