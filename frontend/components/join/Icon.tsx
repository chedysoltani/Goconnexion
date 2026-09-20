import React from 'react';
import {
  BadgeCheck,
  Briefcase,
  Compass,
  CreditCard,
  Globe,
  Handshake,
  Layers,
  Lightbulb,
  Rocket,
  Search,
  SearchX,
  UserCheck,
  UserX,
} from 'lucide-react';

const ICONS = {
  'badge-check': BadgeCheck,
  briefcase: Briefcase,
  compass: Compass,
  'credit-card': CreditCard,
  globe: Globe,
  handshake: Handshake,
  layers: Layers,
  lightbulb: Lightbulb,
  rocket: Rocket,
  search: Search,
  'search-x': SearchX,
  'user-check': UserCheck,
  'user-x': UserX,
} as const;

export type IconName = keyof typeof ICONS;

export default function Icon({ name, size = 22, className }: { name: IconName; size?: number; className?: string }) {
  const Component = ICONS[name];
  return <Component size={size} strokeWidth={1.8} className={className} aria-hidden="true" />;
}
