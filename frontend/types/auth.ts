export type UserRole = 'freelancer' | 'entrepreneur' | 'user';
export type PlanType = 'FREE' | 'PRO' | 'BUSINESS';

export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  plan?: PlanType;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FreelancerProfile extends BaseUser {
  role: 'freelancer';
  profile: {
    skills: string[];
    experience: string;
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
    industry: string;
    companySize: '1-10' | '11-50' | '51-200' | '200+';
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
  profile: {
    bio: string;
    linkedin?: string;
    // Freelancer specific
    skills?: string[];
    experience?: string;
    hourlyRate?: number;
    portfolio?: string;
    // Entrepreneur specific
    company?: string;
    position?: string;
    industry?: string;
    companySize?: '1-10' | '11-50' | '51-200' | '200+';
    website?: string;
    // User specific
    interests?: string[];
    goals?: string;
  };
}
