// Identifiants des outils de mesure branchés sur le site. Ce ne sont pas des secrets : un ID de
// pixel Meta ou un nom de domaine Plausible apparaissent en clair dans le code source de n'importe
// quel site qui les utilise (comme ceux-ci le feront). Rien à mettre en variable d'environnement.

// Plausible (plausible.io) : aucun cookie, aucune donnée personnelle — pas de consentement requis.
export const PLAUSIBLE_DOMAIN = 'goconnexions.com';

// Meta Pixel (Facebook/Instagram Ads) : pose un cookie de suivi publicitaire (_fbp) —
// chargé uniquement après consentement, voir components/global/CookieConsentBanner.tsx.
// Portefeuille business Meta "GoConnexions", ensemble de données "GoConnexions Pixel".
export const META_PIXEL_ID = '1878119756965716';
