'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserRole, SignupData } from '@/types/auth';

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  // Freelancer errors
  skills?: string;
  experience?: string;
  // Entrepreneur errors
  company?: string;
  position?: string;
  industry?: string;
  // User errors
  interests?: string;
  goals?: string;
}

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
    profile: {
      bio: '',
    },
  });

  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole;
    if (roleParam && ['freelancer', 'entrepreneur', 'user'].includes(roleParam)) {
      setRole(roleParam);
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const updateFormData = (field: string, value: any) => {
    if (field.startsWith('profile.')) {
      const profileField = field.replace('profile.', '');
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Basic validation
    if (!formData.email) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';

    if (!formData.password) newErrors.password = 'Mot de passe requis';
    else if (formData.password.length < 8) newErrors.password = 'Minimum 8 caractères';

    if (!formData.firstName) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName) newErrors.lastName = 'Nom requis';

    if (!formData.profile.bio) newErrors.bio = 'Bio requise';
    else if (formData.profile.bio.length < 20) newErrors.bio = 'Minimum 20 caractères';

    // Role-specific validation
    if (role === 'freelancer') {
      if (!formData.profile.skills || formData.profile.skills.length === 0) {
        newErrors.skills = 'Au moins une compétence requise';
      }
      if (!formData.profile.experience) newErrors.experience = 'Expérience requise';
    }

    if (role === 'entrepreneur') {
      if (!formData.profile.company) newErrors.company = 'Entreprise requise';
      if (!formData.profile.position) newErrors.position = 'Poste requis';
      if (!formData.profile.industry) newErrors.industry = 'Secteur requis';
    }

    if (role === 'user') {
      if (!formData.profile.interests || formData.profile.interests.length === 0) {
        newErrors.interests = 'Au moins un intérêt requis';
      }
      if (!formData.profile.goals) newErrors.goals = 'Objectifs requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Signup data:', formData);
      // TODO: Replace with actual API call
      
      // Redirect to login or dashboard
      router.push('/auth/login?message=signup-success');
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ email: 'Une erreur est survenue' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (role) {
      case 'freelancer':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Compétences *
              </label>
              <input
                type="text"
                placeholder="Ex: Développement web, Design, Marketing..."
                value={formData.profile.skills?.join(', ') || ''}
                onChange={(e) => updateFormData('profile.skills', e.target.value.split(',').map(s => s.trim()))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                  errors.skills ? 'border-red-500' : 'border-gc-border'
                }`}
              />
              {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Expérience *
              </label>
              <textarea
                placeholder="Décrivez votre expérience professionnelle..."
                rows={4}
                value={formData.profile.experience || ''}
                onChange={(e) => updateFormData('profile.experience', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                  errors.experience ? 'border-red-500' : 'border-gc-border'
                }`}
              />
              {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Taux horaire (€)
                </label>
                <input
                  type="number"
                  placeholder="50"
                  value={formData.profile.hourlyRate || ''}
                  onChange={(e) => updateFormData('profile.hourlyRate', parseInt(e.target.value) || undefined)}
                  className="w-full px-4 py-3 border border-gc-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Portfolio
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.profile.portfolio || ''}
                  onChange={(e) => updateFormData('profile.portfolio', e.target.value)}
                  className="w-full px-4 py-3 border border-gc-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'entrepreneur':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Entreprise *
                </label>
                <input
                  type="text"
                  placeholder="Nom de votre entreprise"
                  value={formData.profile.company || ''}
                  onChange={(e) => updateFormData('profile.company', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                    errors.company ? 'border-red-500' : 'border-gc-border'
                  }`}
                />
                {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Poste *
                </label>
                <input
                  type="text"
                  placeholder="Votre poste"
                  value={formData.profile.position || ''}
                  onChange={(e) => updateFormData('profile.position', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                    errors.position ? 'border-red-500' : 'border-gc-border'
                  }`}
                />
                {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Secteur d'activité *
              </label>
              <select
                value={formData.profile.industry || ''}
                onChange={(e) => updateFormData('profile.industry', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                  errors.industry ? 'border-red-500' : 'border-gc-border'
                }`}
              >
                <option value="">Sélectionnez un secteur</option>
                <option value="tech">Technologie</option>
                <option value="finance">Finance</option>
                <option value="health">Santé</option>
                <option value="education">Éducation</option>
                <option value="retail">Commerce</option>
                <option value="other">Autre</option>
              </select>
              {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Taille de l'entreprise
                </label>
                <select
                  value={formData.profile.companySize || ''}
                  onChange={(e) => updateFormData('profile.companySize', e.target.value)}
                  className="w-full px-4 py-3 border border-gc-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Sélectionnez</option>
                  <option value="1-10">1-10 employés</option>
                  <option value="11-50">11-50 employés</option>
                  <option value="51-200">51-200 employés</option>
                  <option value="200+">200+ employés</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.profile.website || ''}
                  onChange={(e) => updateFormData('profile.website', e.target.value)}
                  className="w-full px-4 py-3 border border-gc-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'user':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Centres d'intérêt *
              </label>
              <input
                type="text"
                placeholder="Ex: Tech, Marketing, Design..."
                value={formData.profile.interests?.join(', ') || ''}
                onChange={(e) => updateFormData('profile.interests', e.target.value.split(',').map(s => s.trim()))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                  errors.interests ? 'border-red-500' : 'border-gc-border'
                }`}
              />
              {errors.interests && <p className="text-red-500 text-sm mt-1">{errors.interests}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Objectifs professionnels *
              </label>
              <textarea
                placeholder="Que cherchez-vous à accomplir ?"
                rows={4}
                value={formData.profile.goals || ''}
                onChange={(e) => updateFormData('profile.goals', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                  errors.goals ? 'border-red-500' : 'border-gc-border'
                }`}
              />
              {errors.goals && <p className="text-red-500 text-sm mt-1">{errors.goals}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'freelancer': return 'Freelancer';
      case 'entrepreneur': return 'Entrepreneur';
      case 'user': return 'Utilisateur';
      default: return 'Utilisateur';
    }
  };

  return (
    <div className="min-h-screen bg-gc-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gc-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">GC</span>
            </div>
            <span className="font-sans font-semibold text-foreground">GoConnexions</span>
          </Link>
          <Link href="/auth/login" className="text-sm text-muted hover:text-foreground transition-colors">
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Créer un compte {getRoleTitle()}
            </h1>
            <p className="text-muted">
              Rejoignez la communauté et développez votre réseau professionnel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm">
            {/* Basic Information */}
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    placeholder="Jean"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.firstName ? 'border-red-500' : 'border-gc-border'
                    }`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                      errors.lastName ? 'border-red-500' : 'border-gc-border'
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="jean.dupont@example.com"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gc-border'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 caractères"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gc-border'
                  }`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bio *
                </label>
                <textarea
                  placeholder="Présentez-vous en quelques mots..."
                  rows={3}
                  value={formData.profile.bio}
                  onChange={(e) => updateFormData('profile.bio', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                    errors.bio ? 'border-red-500' : 'border-gc-border'
                  }`}
                />
                {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.profile.linkedin || ''}
                  onChange={(e) => updateFormData('profile.linkedin', e.target.value)}
                  className="w-full px-4 py-3 border border-gc-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* Role-specific fields */}
            <div className="border-t border-gc-border pt-8 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Informations {getRoleTitle()}
              </h3>
              {renderRoleSpecificFields()}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Création du compte...' : 'Créer mon compte'}
              </button>

              <p className="text-center text-sm text-muted">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/terms" className="text-accent hover:underline">
                  conditions d'utilisation
                </Link>{' '}
                et notre{' '}
                <Link href="/privacy" className="text-accent hover:underline">
                  politique de confidentialité
                </Link>
              </p>
            </div>
          </form>

          {/* Back to role selection */}
          <div className="text-center mt-8">
            <Link
              href="/auth/select-role"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              ← Changer de type de compte
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
