import { applyCampaignParams, type CampaignData } from '@/lib/tracking/campaign';

// Profils proposés par le tunnel. Le backend ne connaît que FREELANCER / ENTREPRENEUR
// (+ COLLABORATOR, non proposé à l'inscription) : chaque profil est donc rattaché au rôle
// d'inscription réellement supporté le plus proche, et le profil d'origine est conservé
// dans `persona` pour le suivi et une future personnalisation.
//
// TODO(produit) : « recruiter » et « opportunity » n'ont pas de rôle dédié aujourd'hui.
// Quand ils existeront, il suffit de changer `signupRole` ici.

export type Persona = 'entrepreneur' | 'professional' | 'recruiter' | 'opportunity';
export type SignupRole = 'entrepreneur' | 'freelancer';

export const PERSONA_SIGNUP_ROLE: Record<Persona, SignupRole> = {
  entrepreneur: 'entrepreneur',
  professional: 'freelancer',
  recruiter: 'entrepreneur',
  opportunity: 'freelancer',
};

// Route d'inscription EXISTANTE — ne pas la recréer.
export const SIGNUP_PATH = '/auth/signup';
export const SELECT_ROLE_PATH = '/auth/select-role';

export function isPersona(value: string | undefined): value is Persona {
  return !!value && value in PERSONA_SIGNUP_ROLE;
}

/**
 * URL d'inscription du tunnel.
 * - profil connu  → directement le formulaire, rôle pré-rempli (`role`) + `persona`
 * - profil inconnu → l'étape « Qui êtes-vous ? » existante
 * Les paramètres de campagne (utm_*, ref) sont ajoutés dans les deux cas.
 */
export function buildSignupHref(campaign: CampaignData = {}): string {
  const params = new URLSearchParams();
  const persona = isPersona(campaign.persona) ? campaign.persona : undefined;

  if (persona) {
    params.set('role', PERSONA_SIGNUP_ROLE[persona]);
    params.set('persona', persona);
  }
  applyCampaignParams(params, campaign);

  const path = persona ? SIGNUP_PATH : SELECT_ROLE_PATH;
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
