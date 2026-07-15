'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserRole, SignupData } from '@/types/auth';
import { api } from '@/lib/api';

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { n: 1, label: 'Compte' },
  { n: 2, label: 'Identité' },
  { n: 3, label: 'Profil' },
  { n: 4, label: 'Recap' },
];

const ROLE_META: Record<string, { emoji: string; label: string; color: string }> = {
  freelancer: { emoji: '💻', label: 'Freelancer', color: '#3b82f6' },
  entrepreneur: { emoji: '🚀', label: 'Entrepreneur', color: '#8b5cf6' },
};

interface Errs {
  email?: string; password?: string; firstName?: string; lastName?: string;
  bio?: string; skills?: string; experience?: string;
  company?: string; position?: string; industry?: string; interests?: string;
}

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<UserRole>('freelancer');
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Errs>({});
  const [globalError, setGlobalError] = useState('');

  const [form, setForm] = useState<SignupData>({
    email: '', password: '', firstName: '', lastName: '',
    role: 'freelancer', profile: { bio: '' },
  });
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const r = searchParams.get('role') as UserRole;
    if (r && ['freelancer', 'entrepreneur'].includes(r)) {
      setRole(r);
      setForm((p) => ({ ...p, role: r }));
    }
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const upd = (field: string, value: any) => {
    if (field.startsWith('profile.')) {
      const k = field.slice(8);
      setForm((p) => ({ ...p, profile: { ...p.profile, [k]: value } }));
    } else {
      setForm((p) => ({ ...p, [field]: value }));
    }
    const key = field.replace('profile.', '') as keyof Errs;
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Errs = {};
    if (step === 1) {
      if (!form.email) e.email = 'Email requis';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
      if (!form.password) e.password = 'Mot de passe requis';
      else if (form.password.length < 8) e.password = 'Minimum 8 caractères';
    }
    if (step === 2) {
      if (!form.firstName) e.firstName = 'Prénom requis';
      if (!form.lastName) e.lastName = 'Nom requis';
      if (!form.profile.bio || form.profile.bio.length < 10) e.bio = 'Bio requise (min. 10 car.)';
    }
    if (step === 3) {
      if (role === 'freelancer') {
        if (!form.profile.skills?.length) e.skills = 'Au moins une compétence';
        if (!form.profile.experience) e.experience = 'Expérience requise';
      }
      if (role === 'entrepreneur') {
        if (!form.profile.company) e.company = 'Entreprise requise';
        if (!form.profile.position) e.position = 'Poste requis';
        if (!form.profile.industry) e.industry = 'Secteur requis';
      }
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(s + 1, 4) as Step); };
  const prev = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const submit = async () => {
    setIsLoading(true);
    setGlobalError('');
    try {
      await api.auth.register(form);
      if (referralCode.trim()) {
        // Best-effort : un code invalide/expiré ne doit pas bloquer la création du compte.
        await api.referral.registerReferral(referralCode.trim()).catch(() => {});
      }
      router.push('/dashboard');
    } catch (err: any) {
      setGlobalError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const meta = ROLE_META[role] ?? ROLE_META.user;
  const progress = ((step - 1) / 3) * 100;

  return (
    <div className="auth-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-sm">GC</span>
          </div>
          <span className="font-semibold text-white/90 text-[15px]">GoConnexions</span>
        </Link>
        <Link href="/auth/login" className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Déjà un compte ?{' '}
          <span className="text-accent font-medium hover:underline">Se connecter</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-start justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-[480px]">
          {/* Role badge */}
          <div className="flex justify-center mb-6 slide-up">
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: `${meta.color}18`,
                border: `1px solid ${meta.color}40`,
                color: meta.color,
              }}
            >
              {meta.emoji} {meta.label}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-7 slide-up slide-up-1">
            {/* Steps labels */}
            <div className="flex items-center mb-3">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.n}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`step-dot ${step > s.n ? 'done' : step === s.n ? 'active' : 'pending'}`}>
                      {step > s.n ? '✓' : s.n}
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: step >= s.n ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px mx-2 mb-5 transition-all duration-500"
                      style={{ background: step > s.n ? '#4a90d9' : 'rgba(255,255,255,0.1)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* Progress bar */}
            <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #4a90d9, #2563eb)' }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="auth-card p-8 slide-up slide-up-2">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-white mb-1">Créez votre compte</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Vos informations de connexion sécurisées.</p>
                </div>
                <DarkField label="Email" error={errors.email}>
                  <input type="email" placeholder="votre@email.com" value={form.email}
                    onChange={(e) => upd('email', e.target.value)}
                    className={`input-dark ${errors.email ? 'error' : ''}`} />
                </DarkField>
                <DarkField label="Mot de passe" error={errors.password}>
                  <input type="password" placeholder="Minimum 8 caractères" value={form.password}
                    onChange={(e) => upd('password', e.target.value)}
                    className={`input-dark ${errors.password ? 'error' : ''}`} />
                </DarkField>
                <DarkField label="Code de parrainage (optionnel)">
                  <input type="text" placeholder="Ex : JEAN-A1B2C3" value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="input-dark" />
                </DarkField>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-white mb-1">Qui êtes-vous ?</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Votre identité visible par la communauté.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DarkField label="Prénom" error={errors.firstName}>
                    <input type="text" placeholder="Jean" value={form.firstName}
                      onChange={(e) => upd('firstName', e.target.value)}
                      className={`input-dark ${errors.firstName ? 'error' : ''}`} />
                  </DarkField>
                  <DarkField label="Nom" error={errors.lastName}>
                    <input type="text" placeholder="Dupont" value={form.lastName}
                      onChange={(e) => upd('lastName', e.target.value)}
                      className={`input-dark ${errors.lastName ? 'error' : ''}`} />
                  </DarkField>
                </div>
                <DarkField label="Bio" error={errors.bio}>
                  <textarea placeholder="Présentez-vous en quelques mots..." rows={3}
                    value={form.profile.bio}
                    onChange={(e) => upd('profile.bio', e.target.value)}
                    className={`input-dark resize-none ${errors.bio ? 'error' : ''}`} />
                </DarkField>
                <DarkField label="LinkedIn (optionnel)">
                  <input type="url" placeholder="https://linkedin.com/in/..."
                    value={form.profile.linkedin || ''}
                    onChange={(e) => upd('profile.linkedin', e.target.value)}
                    className="input-dark" />
                </DarkField>
              </div>
            )}

            {/* Step 3 — role specific */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-white mb-1">Votre profil {meta.emoji}</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Personnalisez votre expérience GoConnexions.</p>
                </div>

                {role === 'freelancer' && (
                  <>
                    <DarkField label="Compétences *" error={errors.skills}>
                      <input type="text" placeholder="React, Node.js, Design..." value={form.profile.skills?.join(', ') || ''}
                        onChange={(e) => upd('profile.skills', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                        className={`input-dark ${errors.skills ? 'error' : ''}`} />
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Séparez par des virgules</p>
                    </DarkField>
                    <DarkField label="Expérience *" error={errors.experience}>
                      <textarea rows={3} placeholder="Décrivez votre parcours..."
                        value={form.profile.experience || ''}
                        onChange={(e) => upd('profile.experience', e.target.value)}
                        className={`input-dark resize-none ${errors.experience ? 'error' : ''}`} />
                    </DarkField>
                    <div className="grid grid-cols-2 gap-4">
                      <DarkField label="Taux horaire (€)">
                        <input type="number" placeholder="50" value={form.profile.hourlyRate || ''}
                          onChange={(e) => upd('profile.hourlyRate', parseInt(e.target.value) || undefined)}
                          className="input-dark" />
                      </DarkField>
                      <DarkField label="Portfolio">
                        <input type="url" placeholder="https://..." value={form.profile.portfolio || ''}
                          onChange={(e) => upd('profile.portfolio', e.target.value)}
                          className="input-dark" />
                      </DarkField>
                    </div>
                  </>
                )}

                {role === 'entrepreneur' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <DarkField label="Entreprise *" error={errors.company}>
                        <input type="text" placeholder="Nom de l'entreprise" value={form.profile.company || ''}
                          onChange={(e) => upd('profile.company', e.target.value)}
                          className={`input-dark ${errors.company ? 'error' : ''}`} />
                      </DarkField>
                      <DarkField label="Poste *" error={errors.position}>
                        <input type="text" placeholder="CEO, Fondateur..." value={form.profile.position || ''}
                          onChange={(e) => upd('profile.position', e.target.value)}
                          className={`input-dark ${errors.position ? 'error' : ''}`} />
                      </DarkField>
                    </div>
                    <DarkField label="Secteur *" error={errors.industry}>
                      <select value={form.profile.industry || ''}
                        onChange={(e) => upd('profile.industry', e.target.value)}
                        className={`input-dark ${errors.industry ? 'error' : ''}`}>
                        <option value="">Sélectionnez un secteur</option>
                        {['Technologie','Finance','Santé','Éducation','Commerce','Autre'].map((s) => (
                          <option key={s} value={s.toLowerCase()}>{s}</option>
                        ))}
                      </select>
                    </DarkField>
                    <div className="grid grid-cols-2 gap-4">
                      <DarkField label="Taille">
                        <select value={form.profile.companySize || ''}
                          onChange={(e) => upd('profile.companySize', e.target.value)}
                          className="input-dark">
                          <option value="">Sélectionnez</option>
                          {['1-10','11-50','51-200','200+'].map((s) => (
                            <option key={s} value={s}>{s} employés</option>
                          ))}
                        </select>
                      </DarkField>
                      <DarkField label="Site web">
                        <input type="url" placeholder="https://..." value={form.profile.website || ''}
                          onChange={(e) => upd('profile.website', e.target.value)}
                          className="input-dark" />
                      </DarkField>
                    </div>
                  </>
                )}

              </div>
            )}

            {/* Step 4 — Summary */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-white mb-1">Tout est prêt ! 🎉</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Vérifiez vos informations avant de valider.</p>
                </div>
                <div className="space-y-3 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <SumRow label="Email" value={form.email} />
                  <SumRow label="Nom" value={`${form.firstName} ${form.lastName}`} />
                  <SumRow label="Profil" value={`${meta.emoji} ${meta.label}`} color={meta.color} />
                  {role === 'freelancer' && form.profile.skills?.length && (
                    <SumRow label="Compétences" value={form.profile.skills.slice(0, 4).join(', ')} />
                  )}
                  {role === 'entrepreneur' && form.profile.company && (
                    <SumRow label="Entreprise" value={form.profile.company} />
                  )}
                </div>
                {globalError && (
                  <div className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                    {globalError}
                  </div>
                )}
                <button
                  onClick={submit}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #4a90d9 0%, #2563eb 100%)',
                    boxShadow: '0 8px 24px rgba(74,144,217,0.35)',
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Création du compte...
                    </span>
                  ) : 'Créer mon compte →'}
                </button>
                <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  En créant un compte vous acceptez nos{' '}
                  <Link href="/terms" className="text-accent hover:underline">conditions</Link>
                  {' '}et notre{' '}
                  <Link href="/privacy" className="text-accent hover:underline">politique de confidentialité</Link>.
                </p>
              </div>
            )}

            {/* Nav buttons */}
            {step < 4 && (
              <div className={`flex gap-3 mt-8 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
                {step > 1 && (
                  <button onClick={prev}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                    ← Retour
                  </button>
                )}
                <button onClick={next}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #4a90d9, #2563eb)', boxShadow: '0 4px 16px rgba(74,144,217,0.3)' }}>
                  Continuer →
                </button>
              </div>
            )}
          </div>

          <div className="text-center mt-5 slide-up slide-up-3">
            <Link href="/auth/select-role" className="text-xs hover:underline"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              ← Changer de type de compte
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function DarkField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-dark">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs" style={{ color: '#fca5a5' }}>{error}</p>}
    </div>
  );
}

function SumRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: color ?? 'rgba(255,255,255,0.85)' }}>{value}</span>
    </div>
  );
}
