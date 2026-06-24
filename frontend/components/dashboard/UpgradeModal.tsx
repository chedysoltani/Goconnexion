'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Building2, Check, Sparkles,
  ArrowRight, Loader2, CreditCard,
} from 'lucide-react';
import { api } from '@/lib/api';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: string;
  currentPlan?: string;
  onUpgraded?: (plan: string) => void;
}

type BillingInterval = 'monthly' | 'yearly';

const PLANS = [
  {
    id: 'PRO' as const,
    name: 'Pro',
    price: { monthly: 19, yearly: 159 },
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    glow: 'rgba(59,130,246,0.25)',
    icon: <Zap size={18} />,
    popular: true,
    perks: [
      'Candidatures & connexions illimitées',
      'Analytics de profil complets',
      'Contrats électroniques',
      'Paiement sécurisé (escrow)',
      'Appels vidéo intégrés',
      'Badge Pro visible',
    ],
  },
  {
    id: 'BUSINESS' as const,
    name: 'Business',
    price: { monthly: 49, yearly: 399 },
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
    glow: 'rgba(124,58,237,0.25)',
    icon: <Building2 size={18} />,
    perks: [
      'Tout Pro inclus',
      'Projets & équipe illimités',
      'Page entreprise dédiée',
      'Recrutement IA avancé',
      'Support prioritaire 24h/7j',
      'Accès API complet',
    ],
  },
];

export default function UpgradeModal({
  isOpen,
  onClose,
  trigger,
  currentPlan = 'FREE',
  onUpgraded,
}: UpgradeModalProps) {
  const [billing, setBilling] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);

  // Check si Stripe est configuré
  useEffect(() => {
    if (!isOpen) return;
    api.subscription.plans()
      .then((data: any) => setStripeConfigured(data.stripeConfigured ?? false))
      .catch(() => setStripeConfigured(false));
  }, [isOpen]);

  const handleUpgrade = async (planId: 'PRO' | 'BUSINESS') => {
    setLoading(planId);
    try {
      if (stripeConfigured) {
        const data = await api.subscription.checkout(planId, billing);
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
      }
      // Mode sandbox — redirige vers page checkout simulée
      const plan = PLANS.find(p => p.id === planId)!;
      const price = billing === 'yearly'
        ? Math.round(plan.price.yearly / 12)
        : plan.price.monthly;
      window.location.href = `/billing/checkout?plan=${planId}&interval=${billing}&price=${price}`;
    } catch (e: any) {
      alert(e?.message ?? 'Erreur lors de la mise à niveau');
    } finally {
      setLoading(null);
    }
  };

  const yearlyMonthly = (plan: typeof PLANS[0]) =>
    Math.round(plan.price.yearly / 12);

  const yearlyDiscount = (plan: typeof PLANS[0]) => {
    const normalYear = plan.price.monthly * 12;
    return Math.round(((normalYear - plan.price.yearly) / normalYear) * 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-[640px] rounded-3xl overflow-hidden pointer-events-auto"
              style={{ background: 'white', boxShadow: '0 40px 100px rgba(15,23,42,0.25)' }}
            >
              {/* Header gradient */}
              <div
                className="relative px-8 pt-8 pb-7 text-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#0f1f3d 0%,#1e3a8a 60%,#2563eb 100%)' }}
              >
                {/* Orbs décoratifs */}
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle,#60a5fa,transparent)', transform: 'translate(30%,-30%)' }} />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle,#818cf8,transparent)', transform: 'translate(-30%,30%)' }} />

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                  style={{ color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.08)' }}
                >
                  <X size={15} />
                </button>

                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.3)' }}
                >
                  <Sparkles size={22} className="text-blue-300" />
                </motion.div>

                <h2 className="text-[21px] font-bold text-white mb-2 relative z-10">
                  Passez à la vitesse supérieure
                </h2>

                {trigger && (
                  <p className="text-[13px] text-blue-200 max-w-sm mx-auto relative z-10">
                    {trigger}
                  </p>
                )}

                {/* Billing toggle */}
                <div
                  className="inline-flex p-1 rounded-xl mt-5 relative z-10"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  {(['monthly', 'yearly'] as BillingInterval[]).map((b) => (
                    <motion.button
                      key={b}
                      onClick={() => setBilling(b)}
                      className="relative px-4 py-1.5 rounded-lg text-[12px] font-semibold"
                      style={{ color: billing === b ? '#0f172a' : 'rgba(255,255,255,0.5)' }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {billing === b && (
                        <motion.div
                          layoutId="modal-billing-pill"
                          className="absolute inset-0 rounded-lg bg-white"
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        {b === 'monthly' ? 'Mensuel' : (
                          <>
                            Annuel
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(16,185,129,0.3)', color: '#34d399' }}
                            >
                              -30%
                            </span>
                          </>
                        )}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Plans */}
              <div className="p-6 grid sm:grid-cols-2 gap-4">
                {PLANS.map((plan) => {
                  const displayPrice = billing === 'yearly'
                    ? yearlyMonthly(plan)
                    : plan.price.monthly;
                  const isLoading = loading === plan.id;
                  const isSuccess = success === plan.id;
                  const isCurrent = currentPlan === plan.id;

                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={!isCurrent ? { y: -3 } : {}}
                      className="rounded-2xl p-5 relative flex flex-col"
                      style={{
                        border: plan.popular ? `2px solid ${plan.color}40` : '1px solid #e2e8f0',
                        background: plan.popular ? `${plan.color}05` : '#fafafa',
                        boxShadow: plan.popular ? `0 4px 24px ${plan.glow}` : 'none',
                      }}
                    >
                      {plan.popular && (
                        <div
                          className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full text-white"
                          style={{ background: plan.gradient, boxShadow: `0 4px 12px ${plan.glow}` }}
                        >
                          Recommandé
                        </div>
                      )}

                      {/* Plan header */}
                      <div className="flex items-center gap-2.5 mb-3 mt-1">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: plan.gradient }}
                        >
                          {plan.icon}
                        </div>
                        <div>
                          <p className="text-[15px] font-bold leading-none mb-1" style={{ color: '#0f172a' }}>
                            {plan.name}
                          </p>
                          <p className="text-[13px] font-bold leading-none" style={{ color: plan.color }}>
                            {displayPrice}€
                            <span className="text-[11px] font-normal" style={{ color: '#94a3b8' }}> / mois</span>
                          </p>
                        </div>
                      </div>

                      {billing === 'yearly' && (
                        <p className="text-[10px] mb-3 -mt-1" style={{ color: '#94a3b8' }}>
                          Facturé {plan.price.yearly}€/an
                          <span className="ml-1 font-bold" style={{ color: '#10b981' }}>
                            (-{yearlyDiscount(plan)}%)
                          </span>
                        </p>
                      )}

                      {/* Perks */}
                      <ul className="space-y-2 mb-5 flex-1">
                        {plan.perks.map((perk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check
                              size={11}
                              className="mt-0.5 flex-shrink-0"
                              style={{ color: plan.color }}
                              strokeWidth={2.5}
                            />
                            <span className="text-[11.5px] leading-tight" style={{ color: '#475569' }}>
                              {perk}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <motion.button
                        onClick={() => !isCurrent && !isLoading && !success && handleUpgrade(plan.id)}
                        disabled={isCurrent || !!isLoading || !!success}
                        whileHover={!isCurrent && !isLoading && !success ? { scale: 1.02 } : {}}
                        whileTap={!isCurrent && !isLoading && !success ? { scale: 0.97 } : {}}
                        className="w-full py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60"
                        style={
                          isCurrent
                            ? { background: '#f1f5f9', color: '#94a3b8' }
                            : {
                                background: plan.gradient,
                                color: 'white',
                                boxShadow: `0 4px 14px ${plan.glow}`,
                              }
                        }
                      >
                        {isLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : isSuccess ? (
                          <><Check size={14} /> Activé !</>
                        ) : isCurrent ? (
                          'Plan actuel'
                        ) : (
                          <><CreditCard size={13} /> Payer {displayPrice}€/mois <ArrowRight size={13} /></>
                        )}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 text-center space-y-2">
                  <p className="text-[11px]" style={{ color: '#94a3b8' }}>
                  Annulation à tout moment · Paiement sécurisé SSL · Sans engagement
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
