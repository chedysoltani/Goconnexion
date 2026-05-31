'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LoginCredentials } from '@/types/auth';
import { api } from '@/lib/api';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<LoginCredentials>({ email: '', password: '' });

  useEffect(() => {
    if (searchParams.get('message') === 'signup-success') {
      setSuccessMessage('Compte créé ! Connectez-vous pour continuer.');
    }
  }, [searchParams]);

  const update = (field: keyof LoginCredentials, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined, general: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!formData.email) e.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Email invalide';
    if (!formData.password) e.password = 'Mot de passe requis';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await api.auth.login(formData);
      router.push('/dashboard');
    } catch (err: any) {
      setErrors({ general: err.message || 'Email ou mot de passe incorrect' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg min-h-screen flex flex-col">
      {/* Floating grid decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute top-1/4 left-1/3 w-px opacity-10"
          style={{ height: '40vh', background: 'linear-gradient(to bottom, transparent, rgba(74,144,217,0.6), transparent)' }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-px opacity-10"
          style={{ height: '30vh', background: 'linear-gradient(to bottom, transparent, rgba(74,144,217,0.4), transparent)' }}
        />
        <div
          className="absolute bottom-1/4 left-1/5 w-48 h-48 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #4a90d9, transparent)' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-sm">GC</span>
          </div>
          <span className="font-semibold text-white/90 text-[15px]">GoConnexions</span>
        </Link>
        <Link
          href="/auth/select-role"
          className="text-sm text-white/40 hover:text-white/80 transition-colors"
        >
          Pas de compte ?{' '}
          <span className="text-accent font-medium hover:underline">S'inscrire</span>
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Title block */}
          <div className="text-center mb-8 slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-semibold uppercase tracking-widest text-accent/80"
              style={{ background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Réseau Professionnel
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Bon retour 👋
            </h1>
            <p className="text-white/45 text-sm">
              Connectez-vous pour rejoindre votre réseau
            </p>
          </div>

          {/* Success */}
          {successMessage && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium slide-up"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
              ✓ {successMessage}
            </div>
          )}

          {/* Form card */}
          <div className="auth-card p-8 slide-up slide-up-1">
            {errors.general && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="slide-up slide-up-2">
                <label className="label-dark">Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={`input-dark ${errors.email ? 'error' : ''}`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs" style={{ color: '#fca5a5' }}>{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="slide-up slide-up-3">
                <label className="label-dark">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => update('password', e.target.value)}
                    className={`input-dark pr-12 ${errors.password ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs" style={{ color: '#fca5a5' }}>{errors.password}</p>
                )}
              </div>

              {/* Forgot password */}
              <div className="text-right slide-up slide-up-3">
                <Link href="/auth/forgot-password" className="text-xs font-medium hover:underline" style={{ color: 'rgba(74,144,217,0.8)' }}>
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed slide-up slide-up-4"
                style={{
                  background: isLoading
                    ? 'rgba(74,144,217,0.5)'
                    : 'linear-gradient(135deg, #4a90d9 0%, #2563eb 100%)',
                  boxShadow: '0 8px 24px rgba(74,144,217,0.35)',
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  'Se connecter →'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>ou</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Social buttons */}
            <div className="space-y-3 slide-up slide-up-5">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              >
                <svg width="18" height="18" fill="#0077B5" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                Continuer avec LinkedIn
              </button>
            </div>
          </div>

          {/* Footer link */}
          <p className="text-center mt-6 text-sm slide-up slide-up-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Pas encore de compte ?{' '}
            <Link href="/auth/select-role" className="text-accent font-medium hover:underline">
              Rejoindre GoConnexions
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
