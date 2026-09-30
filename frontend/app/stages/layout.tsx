import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offres de stage & PFE — GoConnexions',
  description:
    "Stages et projets de fin d'études proposés par les entrepreneurs et entreprises de la communauté GoConnexions. Postulez en ligne avec votre CV.",
};

export default function StagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
