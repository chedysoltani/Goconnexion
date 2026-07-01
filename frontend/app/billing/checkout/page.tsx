'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Lock, Check, ShieldCheck, ChevronLeft,
  Globe, Loader2, CreditCard, ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';

const PLAN_INFO: Record<string, { name: string; color: string; gradient: string; features: string[] }> = {
  PRO: {
    name: 'Pro',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    features: ['Connexions illimitées', 'Analytics complets', 'Contrats électroniques', 'Appels vidéo', 'Badge Pro'],
  },
  BUSINESS: {
    name: 'Business',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
    features: ['Tout Pro inclus', 'Projets illimités', 'Page entreprise', 'Support 24h/7j', 'Accès API complet'],
  },
};

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const plan     = (searchParams.get('plan') ?? 'PRO').toUpperCase() as 'PRO' | 'BUSINESS';
  const interval = (searchParams.get('interval') ?? 'monthly') as 'monthly' | 'yearly';
  const price    = searchParams.get('price') ?? '19';

  const planInfo   = PLAN_INFO[plan] ?? PLAN_INFO.PRO;

  // `price` est le prix mensuel équivalent passé par la page pricing.
  // Pour les plans annuels, on reconstitue le vrai total depuis cette table.
  const REAL_YEARLY: Record<string, number> = { PRO: 159, BUSINESS: 399 };
  const monthlyEquiv = parseInt(price);
  const realTotal = interval === 'yearly'
    ? (REAL_YEARLY[plan] ?? monthlyEquiv * 12)
    : monthlyEquiv;

  const [provider, setProvider]   = useState<'stripe' | 'wise'>('stripe');
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState('');

  const totalLabel = interval === 'yearly'
    ? `${realTotal} € / an`
    : `${realTotal} € / mois`;

  const handlePay = async () => {
    setProcessing(true);
    setError('');
    try {
      if (provider === 'wise') {
        const data = await api.subscription.wiseInstructions(plan, interval);
        if (data.redirectUrl) window.location.href = data.redirectUrl;
        return;
      }

      // Stripe : le backend crée une Session Checkout et retourne l'URL hébergée par Stripe
      const data = await api.subscription.checkout(plan, interval, 'stripe');
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.upgraded) {
        // Mode sandbox (Stripe non configuré) — upgrade direct
        router.push(`/billing/success?plan=${plan}&interval=${interval}`);
      } else {
        setError("Impossible d'initialiser le paiement. Réessayez.");
      }
    } catch (err: any) {
      setError(err?.message ?? 'Une erreur est survenue.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4">
      <div className="w-full max-w-[860px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* ── Panneau gauche — Récapitulatif plan ─────────────────── */}
        <div
          className="md:w-[320px] flex-shrink-0 p-8 flex flex-col"
          style={{ background: 'linear-gradient(160deg,#0f1f3d 0%,#1e3a8a 100%)' }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-blue-300 hover:text-white text-sm mb-8 transition-colors w-fit"
          >
            <ChevronLeft size={16} /> Retour
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
              style={{ background: planInfo.gradient }}>G</div>
            <div>
              <p className="text-white font-bold text-sm">GoConnexions</p>
              <p className="text-blue-300 text-xs">Plateforme professionnelle</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-blue-200 text-xs uppercase tracking-widest mb-2">Plan sélectionné</p>
            <h2 className="text-white text-2xl font-black mb-1">{planInfo.name}</h2>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-black text-white">{price}€</span>
              <span className="text-blue-300 text-sm">/ mois</span>
            </div>
            {interval === 'yearly' && (
              <span className="text-xs px-2 py-1 rounded-full font-bold"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                Facturé annuellement · Économisez 30%
              </span>
            )}
          </div>

          <div className="space-y-2.5 mb-8">
            {planInfo.features.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59,130,246,0.2)' }}>
                  <Check size={11} className="text-blue-400" strokeWidth={3} />
                </div>
                <span className="text-blue-100 text-[13px]">{f}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-white/60 text-xs mb-2">
              <span>Sous-total</span><span>{price} € / mois</span>
            </div>
            <div className="flex items-center justify-between text-white font-bold text-sm">
              <span>Total aujourd'hui</span><span>{totalLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 text-blue-300/70 text-[11px]">
            <ShieldCheck size={13} />
            <span>Paiement 100% sécurisé · Annulez à tout moment</span>
          </div>
        </div>

        {/* ── Panneau droit — Choix du mode de paiement ───────────── */}
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Mode de paiement</h3>
            <p className="text-sm text-slate-500 mb-6">Choisissez votre méthode préférée</p>

            {/* Sélecteur Stripe / Wise */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {([
                { id: 'stripe', label: 'Carte bancaire', sub: 'Visa · Mastercard · Amex', icon: <CreditCard size={18} /> },
                { id: 'wise',   label: 'Wise (virement)', sub: 'Activation sous 24h',     icon: <Globe size={18} /> },
              ] as const).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className="flex flex-col items-start gap-1 p-4 rounded-2xl text-left transition-all border-2"
                  style={provider === p.id
                    ? { background: '#eff6ff', borderColor: '#3b82f6' }
                    : { background: '#f8fafc', borderColor: '#e2e8f0' }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: provider === p.id ? '#2563eb' : '#64748b' }}>{p.icon}</span>
                    <span className="font-semibold text-sm" style={{ color: provider === p.id ? '#1d4ed8' : '#334155' }}>
                      {p.label}
                    </span>
                  </div>
                  <span className="text-[11px] pl-7" style={{ color: '#94a3b8' }}>{p.sub}</span>
                </button>
              ))}
            </div>

            {/* Info bloc selon provider */}
            {provider === 'stripe' && (
              <motion.div
                key="stripe-info"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl mb-4"
                style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd' }}
              >
                <div className="flex items-start gap-3">
                  <Lock size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800 mb-1">
                      Paiement sécurisé via Stripe
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Vous serez redirigé vers la page de paiement sécurisée de Stripe.
                      Vos données bancaires ne transitent jamais par nos serveurs.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {['Visa', 'Mastercard', 'Amex', 'Interac Debit'].map((b) => (
                    <span key={b} className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                      {b}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {provider === 'wise' && (
              <motion.div
                key="wise-info"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl mb-4"
                style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}
              >
                <div className="flex items-start gap-3">
                  <Globe size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 mb-1">
                      Virement bancaire via Wise
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Une référence unique sera générée. Effectuez le virement avec cette référence
                      — votre abonnement s'active automatiquement à réception (généralement sous 24h).
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Erreur */}
            {error && (
              <div className="p-3 rounded-xl text-sm mb-4"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                {error}
              </div>
            )}
          </div>

          {/* CTA */}
          <div>
            <motion.button
              onClick={handlePay}
              disabled={processing}
              whileHover={!processing ? { scale: 1.01 } : {}}
              whileTap={!processing ? { scale: 0.98 } : {}}
              className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2.5 transition-all"
              style={{
                background: processing ? '#94a3b8' : planInfo.gradient,
                boxShadow: processing ? 'none' : '0 8px 24px rgba(59,130,246,0.30)',
              }}
            >
              {processing ? (
                <><Loader2 size={18} className="animate-spin" /> Redirection en cours...</>
              ) : provider === 'wise' ? (
                <><Globe size={15} /> Obtenir les instructions Wise — {totalLabel}</>
              ) : (
                <><Lock size={15} /> Payer {totalLabel} avec Stripe <ArrowRight size={15} /></>
              )}
            </motion.button>

            <div className="flex items-center justify-center gap-4 mt-4 text-slate-400">
              <div className="flex items-center gap-1 text-[11px]"><ShieldCheck size={12} /> SSL 256-bit</div>
              <div className="w-px h-3 bg-slate-200" />
              <div className="text-[11px]">Powered by Stripe</div>
              <div className="w-px h-3 bg-slate-200" />
              <div className="text-[11px]">Annulez à tout moment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
