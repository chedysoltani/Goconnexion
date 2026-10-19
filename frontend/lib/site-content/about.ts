// Contenu de la page /a-propos, éditable depuis /admin/presentation (clé SiteContent "about").
// ABOUT_DEFAULT sert de secours si l'API est indisponible ; il est identique au contenu
// inséré par la migration backend 20261020000000_add_editor_role_site_content.

export interface AboutOfferItem {
  label: string;
  text: string;
}

export interface AboutTeamMember {
  name: string;
  role: string;
  initials: string;
}

export interface AboutContent {
  intro: string;
  mission: string;
  history: string;
  offer: AboutOfferItem[];
  team: AboutTeamMember[];
}

export const ABOUT_KEY = 'about';
export const ABOUT_TITLE = 'À propos de GoConnexions';

export const ABOUT_DEFAULT: AboutContent = {
  intro:
    'GoConnexions est une plateforme québécoise de réseautage professionnel, basée à Montréal. Elle réunit entrepreneurs, freelances, étudiants et incubateurs pour qu’ils se rencontrent, collaborent et trouvent leurs prochaines opportunités : clients, associés, stages ou partenaires.',
  mission:
    'Les meilleures opportunités professionnelles ne viennent pas d’un message froid ou d’une publication virale, mais d’une vraie conversation avec quelqu’un qui vous fait confiance. GoConnexions existe pour rendre ces conversations plus faciles : trouver les bonnes personnes, garder le contact et transformer un réseau en relations qui comptent, sans spam et sans algorithme qui décide à votre place.',
  history:
    'GoConnexions est née à Montréal d’un constat partagé par beaucoup d’entrepreneurs et de travailleurs autonomes : on accumule des contacts, mais on manque d’un lieu pensé pour entretenir ces relations et en créer de nouvelles avec des gens de son écosystème. Nous construisons cet endroit, avec et pour la communauté d’affaires du Québec.',
  offer: [
    { label: 'Un profil professionnel', text: 'd’entrepreneur ou de freelance, et un réseau de connexions ;' },
    { label: 'une messagerie', text: 'pour échanger directement avec vos connexions ;' },
    { label: 'des événements', text: 'professionnels à organiser ou à rejoindre ;' },
    { label: 'des offres de stage', text: 'publiées par des entreprises, ouvertes aux étudiants ;' },
    { label: 'une marketplace', text: 'de services entre membres ;' },
    { label: 'un espace incubateur', text: 'pour accompagner les projets en démarrage.' },
  ],
  team: [
    { name: 'Éric Boudreault', role: 'Président', initials: 'ÉB' },
    { name: 'Chedy Soltani', role: 'Développeur full-stack', initials: 'CS' },
  ],
};

// Normalise une réponse de l'API : tout champ manquant ou mal formé retombe sur la valeur par défaut.
export function parseAboutContent(raw: unknown): AboutContent {
  const c = (raw && typeof raw === 'object' ? raw : {}) as Partial<AboutContent>;
  const str = (v: unknown, d: string) => (typeof v === 'string' && v.trim() ? v : d);
  return {
    intro: str(c.intro, ABOUT_DEFAULT.intro),
    mission: str(c.mission, ABOUT_DEFAULT.mission),
    history: str(c.history, ABOUT_DEFAULT.history),
    offer: Array.isArray(c.offer) ? c.offer : ABOUT_DEFAULT.offer,
    team: Array.isArray(c.team) ? c.team : ABOUT_DEFAULT.team,
  };
}

// Paragraphes séparés par une ligne vide
export function toParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
