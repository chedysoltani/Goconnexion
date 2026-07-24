export interface IndustryOption {
  id: string;
  label: string;
  labelFr: string;
  icon?: string;
}

export const INDUSTRIES: IndustryOption[] = [
  { id: 'trainer_coach', label: 'Trainer / Coach', labelFr: 'Formateur / Coach', icon: '🏋️‍♂️' },
  { id: 'web_developer', label: 'Web Developer', labelFr: 'Développeur Web', icon: '💻' },
  { id: 'mobile_developer', label: 'Mobile Developer', labelFr: 'Développeur Mobile', icon: '📱' },
  { id: 'software_engineer', label: 'Software Engineer', labelFr: 'Ingénieur Logiciel', icon: '⚙️' },
  { id: 'content_creator', label: 'Content Creator', labelFr: 'Créateur de Contenu', icon: '🎥' },
  { id: 'graphic_designer', label: 'Graphic Designer', labelFr: 'Graphiste / Designer', icon: '🎨' },
  { id: 'digital_marketing', label: 'Digital Marketing', labelFr: 'Marketing Digital', icon: '📈' },
  { id: 'social_media_manager', label: 'Social Media Manager', labelFr: 'Social Media Manager', icon: '📲' },
  { id: 'photographer', label: 'Photographer', labelFr: 'Photographe', icon: '📷' },
  { id: 'videographer', label: 'Videographer', labelFr: 'Vidéaste', icon: '🎬' },
  { id: 'consultant', label: 'Consultant', labelFr: 'Consultant', icon: '💼' },
  { id: 'accountant', label: 'Accountant', labelFr: 'Comptable', icon: '📊' },
  { id: 'lawyer', label: 'Lawyer', labelFr: 'Avocat / Juriste', icon: '⚖️' },
  { id: 'real_estate', label: 'Real Estate', labelFr: 'Immobilier', icon: '🏢' },
  { id: 'health_wellness', label: 'Health & Wellness', labelFr: 'Santé & Bien-être', icon: '🧘‍♀️' },
  { id: 'education', label: 'Education', labelFr: 'Éducation', icon: '🎓' },
  { id: 'construction', label: 'Construction', labelFr: 'Bâtiment / Construction', icon: '🏗️' },
  { id: 'ecommerce', label: 'E-commerce', labelFr: 'E-commerce', icon: '🛒' },
  { id: 'retail', label: 'Retail', labelFr: 'Commerce de détail', icon: '🛍️' },
  { id: 'restaurant_food', label: 'Restaurant / Food Services', labelFr: 'Restauration / Alimentation', icon: '🍽️' },
  { id: 'beauty_cosmetics', label: 'Beauty & Cosmetics', labelFr: 'Beauté & Cosmétique', icon: '💄' },
  { id: 'cleaning_services', label: 'Cleaning Services', labelFr: 'Services de nettoyage', icon: '🧹' },
  { id: 'transportation', label: 'Transportation', labelFr: 'Transport / Logistique', icon: '🚚' },
  { id: 'event_planning', label: 'Event Planning', labelFr: 'Événementiel', icon: '🎉' },
  { id: 'other', label: 'Other', labelFr: 'Autre', icon: '🌐' },
];
