'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email requis');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg min-h-screen flex flex-col">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute top-1/4 left-1/3 w-px opacity-10"
          style={{ height: '40vh', background: 'linear-gradient(to bottom, transparent, rgba(74,144,217,0.6), transparent)' }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-px opacity-10"
          style={{ height: '30vh', background: 'linear-gradient(to bottom, transparent, rgba(74,144,217,0.4), transparent)' }}
        />
      </div>

      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-sm">GC</span>
          </div>
          <span className="font-semibold text-white/90 text-[15px]">GoConnexions</span>
        </Link>
        <Link
          href="/auth/login"
          className="text-sm text-white/40 hover:text-white/80 transition-colors"
        >
          <span className="text-accent font-medium hover:underline">Retour à la connexion</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="text-center mb-8 slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-semibold uppercase tracking-widest text-accent/80"
              style={{ background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Réseau Professionnel
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Mot de passe oublié
            </h1>
            <p className="text-white/45 text-sm">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          <div className="auth-card p-8 slide-up slide-up-1">
            {sent ? (
              <div className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', color: '#6ee7b7' }}>
                ✓ Si ce compte existe, un email a été envoyé.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                    {error}
                  </div>
                )}

                <div className="slide-up slide-up-2">
                  <label className="label-dark">Email</label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className={`input-dark ${error ? 'error' : ''}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed slide-up slide-up-3"
                  style={{
                    background: isLoading
                      ? 'rgba(74,144,217,0.5)'
                      : 'linear-gradient(135deg, #4a90d9 0%, #2563eb 100%)',
                    boxShadow: '0 8px 24px rgba(74,144,217,0.35)',
                  }}
                >
                  {isLoading ? 'Envoi en cours...' : 'Envoyer le lien →'}
                </button>
              </form>
            )}
          </div>

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
