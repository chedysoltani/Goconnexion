'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, CreditCard, Check, Loader2, ShieldCheck, ChevronLeft } from 'lucide-react';
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

  const plan = searchParams.get('plan') ?? 'PRO';
  const interval = searchParams.get('interval') ?? 'monthly';
  const price = searchParams.get('price') ?? '19';

  const planInfo = PLAN_INFO[plan] ?? PLAN_INFO.PRO;

  const [form, setForm] = useState({ cardNumber: '', expiry: '', cvc: '', name: '', email: '' });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (stored) {
      try { setForm(p => ({ ...p, email: JSON.parse(stored).email ?? '' })); } catch { /* */ }
    }
  }, []);

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.email.trim()) e.email = 'Email requis';
    const digits = form.cardNumber.replace(/\s/g, '');
    if (digits.length < 16) e.cardNumber = 'Numéro invalide';
    if (form.expiry.length < 5) e.expiry = 'Date invalide';
    if (form.cvc.length < 3) e.cvc = 'CVC invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      await api.subscription.upgrade(plan as 'PRO' | 'BUSINESS');
      // Mettre à jour le plan dans localStorage immédiatement
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            const u = JSON.parse(stored);
            localStorage.setItem('user', JSON.stringify({ ...u, plan }));
          } catch { /* */ }
        }
      }
      router.push(`/billing/success?plan=${plan}&interval=${interval}`);
    } catch (err: any) {
      alert(err?.message ?? 'Erreur de paiement');
      setProcessing(false);
    }
  };

  const totalLabel = interval === 'yearly'
    ? `${parseInt(price) * 12} € / an`
    : `${price} € / mois`;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4">
      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left — Plan summary */}
        <div
          className="md:w-[340px] flex-shrink-0 p-8 flex flex-col"
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
              <p className="text-white font-bold text-sm">GoConnexion</p>
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
            {planInfo.features.map(f => (
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
              <span>Sous-total</span><span>{price} €</span>
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

        {/* Right — Card form */}
        <div className="flex-1 p-8 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-1">Informations de paiement</h3>
          <p className="text-sm text-slate-500 mb-6">Vos données sont chiffrées et sécurisées</p>

          {/* Test card hint */}
          <div className="mb-5 p-3 rounded-xl text-xs flex items-start gap-2.5"
            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <CreditCard size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-slate-600">
              <span className="font-semibold text-blue-600">Carte de test :</span>{' '}
              4242 4242 4242 4242 · 12/29 · 123
            </div>
          </div>

          <form onSubmit={handlePay} className="flex flex-col flex-1">
            <div className="space-y-4">

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom sur la carte</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Jean Dupont"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="jean@example.com"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.email ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Numéro de carte</label>
                <div className="relative">
                  <input
                    value={form.cardNumber}
                    onChange={e => setForm(p => ({ ...p, cardNumber: formatCard(e.target.value) }))}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.cardNumber ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  <CreditCard size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
                {errors.cardNumber && <p className="text-red-500 text-[11px] mt-1">{errors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expiration</label>
                  <input
                    value={form.expiry}
                    onChange={e => setForm(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                    placeholder="MM/AA"
                    inputMode="numeric"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.expiry ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  {errors.expiry && <p className="text-red-500 text-[11px] mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">CVC</label>
                  <input
                    value={form.cvc}
                    onChange={e => setForm(p => ({ ...p, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    placeholder="123"
                    inputMode="numeric"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.cvc ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  {errors.cvc && <p className="text-red-500 text-[11px] mt-1">{errors.cvc}</p>}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <motion.button
                type="submit"
                disabled={processing}
                whileHover={!processing ? { scale: 1.01 } : {}}
                whileTap={!processing ? { scale: 0.98 } : {}}
                className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2.5 transition-all"
                style={{
                  background: processing ? '#94a3b8' : planInfo.gradient,
                  boxShadow: processing ? 'none' : '0 8px 24px rgba(59,130,246,0.35)',
                }}
              >
                {processing ? (
                  <><Loader2 size={18} className="animate-spin" /> Traitement en cours...</>
                ) : (
                  <><Lock size={15} /> Payer {totalLabel}</>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-4 mt-4 text-slate-400">
                <div className="flex items-center gap-1 text-[11px]">
                  <ShieldCheck size={12} /> SSL 256-bit
                </div>
                <div className="w-px h-3 bg-slate-200" />
                <div className="text-[11px]">Powered by Stripe</div>
                <div className="w-px h-3 bg-slate-200" />
                <div className="text-[11px]">Sans engagement</div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>}>
      <CheckoutForm />
    </Suspense>
  );
}
