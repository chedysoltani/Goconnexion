// Identité légale et présence publique de GoConnexions — source unique pour le pied de page,
// les pages légales (/privacy, /terms), /a-propos et /faq.

export const COMPANY = {
  brand: 'GoConnexions',
  legalName: '12003961 Canada Inc.',
  neq: '1175357038',
  address: {
    street: '5685 rue Drake',
    city: 'Montréal',
    region: 'Québec',
    regionCode: 'QC',
    postalCode: 'H4E 4G4',
    country: 'Canada',
    countryCode: 'CA',
  },
  contactEmail: 'bonjour@goconnexions.com',
  // Responsable de la protection des renseignements personnels (Loi 25, art. 3.1 : par défaut,
  // la personne ayant la plus haute autorité au sein de l'entreprise).
  privacyOfficer: {
    name: 'Éric Boudreault',
    title: 'Président',
    email: 'eric@goconnexions.com',
  },
} as const;

export const COMPANY_ADDRESS_LINE =
  `${COMPANY.address.street}, ${COMPANY.address.city} (${COMPANY.address.region}) ${COMPANY.address.postalCode}, ${COMPANY.address.country}`;

// Seuls les réseaux réellement actifs : un lien mort fait plus de tort qu'une icône absente.
export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/goconnexions/' },
  { label: 'Facebook', href: 'https://www.facebook.com/eric.boudreault.18' },
] as const;
