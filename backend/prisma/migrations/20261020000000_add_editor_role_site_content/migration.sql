-- Rôle éditeur de contenu (équipe marketing)
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'EDITOR';

-- CreateTable
CREATE TABLE "SiteContent" (
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
ALTER TABLE "SiteContent" ADD CONSTRAINT "SiteContent_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed : texte actuel de la page /a-propos (identique à ABOUT_DEFAULT dans frontend/lib/site-content/about.ts)
INSERT INTO "SiteContent" ("key", "title", "content", "updatedAt")
VALUES ('about', 'À propos de GoConnexions', '{
  "intro": "GoConnexions est une plateforme québécoise de réseautage professionnel, basée à Montréal. Elle réunit entrepreneurs, freelances, étudiants et incubateurs pour qu’ils se rencontrent, collaborent et trouvent leurs prochaines opportunités : clients, associés, stages ou partenaires.",
  "mission": "Les meilleures opportunités professionnelles ne viennent pas d’un message froid ou d’une publication virale, mais d’une vraie conversation avec quelqu’un qui vous fait confiance. GoConnexions existe pour rendre ces conversations plus faciles : trouver les bonnes personnes, garder le contact et transformer un réseau en relations qui comptent, sans spam et sans algorithme qui décide à votre place.",
  "history": "GoConnexions est née à Montréal d’un constat partagé par beaucoup d’entrepreneurs et de travailleurs autonomes : on accumule des contacts, mais on manque d’un lieu pensé pour entretenir ces relations et en créer de nouvelles avec des gens de son écosystème. Nous construisons cet endroit, avec et pour la communauté d’affaires du Québec.",
  "offer": [
    {
      "label": "Un profil professionnel",
      "text": "d’entrepreneur ou de freelance, et un réseau de connexions ;"
    },
    {
      "label": "une messagerie",
      "text": "pour échanger directement avec vos connexions ;"
    },
    {
      "label": "des événements",
      "text": "professionnels à organiser ou à rejoindre ;"
    },
    {
      "label": "des offres de stage",
      "text": "publiées par des entreprises, ouvertes aux étudiants ;"
    },
    {
      "label": "une marketplace",
      "text": "de services entre membres ;"
    },
    {
      "label": "un espace incubateur",
      "text": "pour accompagner les projets en démarrage."
    }
  ],
  "team": [
    {
      "name": "Éric Boudreault",
      "role": "Président",
      "initials": "ÉB"
    },
    {
      "name": "Chedy Soltani",
      "role": "Développeur full-stack",
      "initials": "CS"
    }
  ]
}'::jsonb, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
