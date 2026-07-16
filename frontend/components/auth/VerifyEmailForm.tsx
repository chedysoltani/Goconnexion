'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Lien de vérification invalide : aucun token fourni.');
      return;
    }

    api.auth.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => router.push('/dashboard'), 2000);
      })
      .catch((err: any) => {
        setStatus('error');
        setError(err.message || 'Lien de vérification invalide ou expiré.');
      });
  }, [token, router]);

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
        <Link href="/auth/login" className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
              Vérification de l'email
            </h1>
          </div>

          <div className="auth-card p-8 slide-up slide-up-1 text-center">
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4 py-4">
                <svg className="animate-spin" width="28" height="28" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#4a90d9" strokeWidth="4" />
                  <path className="opacity-75" fill="#4a90d9" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Vérification de votre adresse email en cours...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', color: '#6ee7b7' }}>
                ✓ Email vérifié avec succès. Redirection vers votre tableau de bord...
              </div>
            )}

            {status === 'error' && (
              <>
                <div className="px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                  {error}
                </div>
                <Link
                  href="/auth/login"
                  className="inline-block mt-5 text-sm font-medium hover:underline"
                  style={{ color: 'rgba(74,144,217,0.9)' }}
                >
                  Retourner à la connexion →
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
