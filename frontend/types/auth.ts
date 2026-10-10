export type UserRole = 'freelancer' | 'entrepreneur' | 'user';
export type PlanType = 'FREE' | 'PRO' | 'BUSINESS' | 'PREMIUM_INCUBATEUR';

export type PaidPlan = Exclude<PlanType, 'FREE'>;

// Réponse de GET /subscription/plans (catalogue défini dans backend/src/subscription/plans.ts)
export interface PlanFeature {
  text: string;
  highlight?: boolean;
  soon?: boolean;
}

export interface PlanInfo {
  id: PlanType;
  name: string;
  tagline: string;
  popular?: boolean;
  price: { monthly: number; yearly: number };
  features: PlanFeature[];
}

export interface PlansResponse {
  stripeConfigured: boolean;
  trial: { plan: PaidPlan; days: number };
  plans: PlanInfo[];
}

// Miroir de PLAN_LIMITS (backend/src/subscription/plans.ts), renvoyé par /auth/me. -1 = illimité.
export interface PlanLimits {
  maxProjects: number;
  maxApplications: number;
  maxConnections: number;
  maxMessagesPerMonth: number;
  canAccessAnalytics: boolean;
  canAccessVideoCall: boolean;
  canCreateAds: boolean;
  canReadIncubator: boolean;
  canWriteIncubator: boolean;
  badge: string | null;
}

export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  plan?: PlanType;
  limits?: PlanLimits;
  isAmbassador?: boolean;
  avatarUrl?: string;
  country?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FreelancerProfile extends BaseUser {
  role: 'freelancer';
  profile: {
    skills: string[];
    experience: string;
    industry?: string;
    hourlyRate?: number;
    portfolio?: string;
    linkedin?: string;
    bio: string;
  };
}

export interface EntrepreneurProfile extends BaseUser {
  role: 'entrepreneur';
  profile: {
    company: string;
    position: string;
    industry?: string;
    companySize?: '1-10' | '11-50' | '51-200' | '200+';
    website?: string;
    linkedin?: string;
    bio: string;
  };
}

export interface UserProfile extends BaseUser {
  role: 'user';
  profile: {
    interests: string[];
    goals: string;
    linkedin?: string;
    bio: string;
  };
}

export type User = FreelancerProfile | EntrepreneurProfile | UserProfile;

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  country?: string;
  profile: {
    bio: string;
    linkedin?: string;
    industry?: string;
    // Freelancer specific
    skills?: string[];
    experience?: string;
    hourlyRate?: number;
    portfolio?: string;
    // Entrepreneur specific
    company?: string;
    position?: string;
    companySize?: '1-10' | '11-50' | '51-200' | '200+';
    website?: string;
    // User specific
    interests?: string[];
    goals?: string;
  };
}
