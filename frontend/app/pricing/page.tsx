'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Zap, Building2, Sparkles, ArrowLeft, Clock, Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { PlanInfo, PlanType, PlansResponse } from '@/types/auth';

type Billing = 'monthly' | 'yearly';

// Apparence uniquement : prix et avantages viennent de GET /subscription/plans.
const VISUALS: Record<PlanType, {
  color: string;
  gradient: string;
  glow: string;
  icon: React.ReactNode;
  badge?: string;
}> = {
  FREE: {
    color: '#64748b',
    gradient: 'linear-gradient(135deg,#f8fafc,#f1f5f9)',
    glow: 'rgba(100,116,139,0.15)',
    icon: <Sparkles size={20} />,
  },
  PRO: {
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
    glow: 'rgba(59,130,246,0.18)',
    icon: <Zap size={20} />,
    badge: 'Populaire',
  },
  BUSINESS: {
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg,#f5f3ff,#ede9fe)',
    glow: 'rgba(124,58,237,0.18)',
    icon: <Building2 size={20} />,
  },
  PREMIUM_INCUBATEUR: {
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    glow: 'rgba(139,92,246,0.4)',
    icon: <Sparkles size={22} color="#a78bfa" />,
  },
};

function SoonBadge({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide align-middle"
      style={dark
        ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }
        : { background: '#f1f5f9', color: '#94a3b8' }}
    >
      <Clock size={8} /> Bientôt
    </span>
  );
}

const FAQ = [
  {
    q: 'Puis-je changer de forfait à tout moment ?',
    a: 'Oui, tu peux upgrader ou downgrader ton forfait à tout moment depuis ton tableau de bord. Le changement prend effet immédiatement.',
  },
  {
    q: 'Comment fonctionne la commission sur les projets ?',
    a: 'GoConnexions prend une commission de 8% sur chaque transaction réalisée via la plateforme. Cette commission finance la sécurité des paiements et le service d\'escrow.',
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: 'Oui. Tous les paiements sont traités via Stripe (certifié PCI-DSS). Vos renseignements personnels sont traités conformément à la Loi 25 du Québec ; les détails sont dans notre politique de confidentialité.',
  },
  {
    q: 'Y a-t-il un essai gratuit pour les forfaits payants ?',
    a: 'Oui : chaque compte peut essayer le forfait Pro gratuitement pendant 14 jours, sans carte bancaire. À la fin de l\'essai, le compte repasse automatiquement en Gratuit, sans aucun prélèvement.',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<Billing>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<PlanType | null>(null);
  const [catalog, setCatalog] = useState<PlansResponse | null>(null);
  const [catalogError, setCatalogError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialError, setTrialError] = useState('');

  useEffect(() => {
    api.subscription.plans().then(setCatalog).catch(() => setCatalogError(true));
    try { setIsLoggedIn(!!localStorage.getItem('user')); } catch { /* stockage indisponible */ }
  }, []);

  const mainPlans = catalog?.plans.filter((p) => p.id !== 'PREMIUM_INCUBATEUR') ?? [];
  const incubateur = catalog?.plans.find((p) => p.id === 'PREMIUM_INCUBATEUR');

  const startTrial = async () => {
    if (!isLoggedIn) {
      router.push(`/auth/signup?redirect=${encodeURIComponent('/pricing')}`);
      return;
    }
    setTrialLoading(true);
    setTrialError('');
    try {
      await api.subscription.startTrial();
      router.push('/dashboard');
    } catch (err: any) {
      setTrialError(err?.message ?? 'Impossible de démarrer l\'essai.');
    } finally {
      setTrialLoading(false);
    }
  };

  const yearlyDiscount = (plan: PlanInfo) => {
    if (plan.price.monthly === 0) return 0;
    const yearlyVsMonthly = plan.price.monthly * 12;
    return Math.round(((yearlyVsMonthly - plan.price.yearly) / yearlyVsMonthly) * 100);
  };

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 topbar-glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] font-semibold transition-colors"
            style={{ color: '#64748b' }}
          >
            <ArrowLeft size={15} />
            GoConnexions
          </Link>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:inline-block px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors"
              style={{ color: '#64748b' }}
            >
              Connexion
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-[13px] font-bold text-white whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
            >
              Tableau de bord
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-24 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold mb-6"
              style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.15)' }}
            >
              <Sparkles size={13} />
              Simple, transparent, sans surprise
            </motion.div>

            <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-bold leading-tight tracking-tight mb-5" style={{ color: '#0f172a' }}>
              Le bon forfait pour{' '}
              <span className="text-gradient">votre ambition</span>
            </h1>

            <p className="text-[16px] max-w-xl mx-auto leading-relaxed mb-8" style={{ color: '#64748b' }}>
              Démarrez gratuitement. Upgradez quand vous êtes prêt.
              Pas d'engagement, annulation en un clic.
            </p>

            {/* Billing toggle */}
            <div
              className="inline-flex p-1.5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}
            >
              {(['monthly', 'yearly'] as Billing[]).map((b) => (
                <motion.button
                  key={b}
                  onClick={() => setBilling(b)}
                  className="relative px-5 py-2 rounded-xl text-[13px] font-semibold transition-colors duration-150"
                  style={{ color: billing === b ? 'white' : '#64748b' }}
                  whileTap={{ scale: 0.97 }}
                >
                  {billing === b && (
                    <motion.div
                      layoutId="billing-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <span className="relative z-10">
                    {b === 'monthly' ? 'Mensuel' : (
                      <span className="flex items-center gap-2">
                        Annuel
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: billing === 'yearly' ? 'rgba(255,255,255,0.25)' : 'rgba(59,130,246,0.1)',
                            color: billing === 'yearly' ? 'white' : '#3b82f6',
                          }}
                        >
                          Économisez
                        </span>
                      </span>
                    )}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Plans grid */}
          {!catalog && (
            <div className="flex items-center justify-center gap-2 py-24 mb-20 text-[13px]" style={{ color: '#94a3b8' }}>
              {catalogError
                ? 'Impossible de charger les forfaits. Réessayez dans un instant.'
                : <><Loader2 size={16} className="animate-spin" /> Chargement des forfaits…</>}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {mainPlans.map((info, i) => {
              const plan = { ...info, ...VISUALS[info.id] };
              const displayPrice = billing === 'yearly' ? Math.round(plan.price.yearly / 12) : plan.price.monthly;
              const discount = yearlyDiscount(plan);
              const isHovered = hoveredPlan === plan.id;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onHoverStart={() => setHoveredPlan(plan.id)}
                  onHoverEnd={() => setHoveredPlan(null)}
                  className="relative flex flex-col rounded-3xl overflow-hidden"
                  style={{
                    background: plan.popular ? 'white' : 'white',
                    border: plan.popular ? `2px solid ${plan.color}` : '1px solid #e2e8f0',
                    boxShadow: plan.popular
                      ? `0 0 0 4px ${plan.glow}, 0 24px 48px ${plan.glow}`
                      : isHovered ? '0 12px 32px rgba(15,23,42,0.1)' : '0 1px 4px rgba(15,23,42,0.05)',
                    transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
                    transition: 'box-shadow 0.3s, transform 0.3s',
                  }}
                >
                  {/* Popular badge */}
                  {plan.badge && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold text-white"
                      style={{ background: `linear-gradient(135deg,${plan.color},${plan.id === 'PRO' ? '#2563eb' : '#5b21b6'})` }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Header */}
                  <div className="p-7 pb-5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: plan.gradient, color: plan.color }}
                    >
                      {plan.icon}
                    </div>

                    <h2 className="text-[18px] font-bold mb-1" style={{ color: '#0f172a' }}>
                      {plan.name}
                    </h2>
                    <p className="text-[12.5px] mb-5" style={{ color: '#94a3b8' }}>
                      {plan.tagline}
                    </p>

                    {/* Price */}
                    <div className="flex items-end gap-1.5 mb-1">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${plan.id}-${billing}`}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="text-[38px] font-bold leading-none tracking-tight"
                          style={{ color: plan.id === 'FREE' ? '#64748b' : plan.color }}
                        >
                          {displayPrice === 0 ? '0' : `${displayPrice}`}
                        </motion.span>
                      </AnimatePresence>
                      {displayPrice > 0 && (
                        <div className="pb-1.5">
                          <span className="text-[15px] font-semibold" style={{ color: '#94a3b8' }}>CAD</span>
                          <span className="text-[12px] ml-0.5 block leading-none" style={{ color: '#cbd5e1' }}>/ mois</span>
                        </div>
                      )}
                      {displayPrice === 0 && (
                        <span className="pb-2 text-[15px]" style={{ color: '#94a3b8' }}>CAD / mois</span>
                      )}
                    </div>

                    {billing === 'yearly' && plan.price.yearly > 0 && (
                      <p className="text-[11px] mb-4" style={{ color: '#94a3b8' }}>
                        Facturé {plan.price.yearly} CAD/an
                        <span className="ml-1.5 font-bold" style={{ color: '#2563eb' }}>
                          (-{discount}%)
                        </span>
                      </p>
                    )}
                    {(billing === 'monthly' || plan.price.yearly === 0) && <div className="mb-4" />}

                    {/* CTA */}
                    <motion.a
                      href={
                        plan.id === 'FREE'
                          ? '/auth/signup'
                          : `/billing/checkout?plan=${plan.id}&interval=${billing}`
                      }
                      whileHover={{ scale: 1.02, boxShadow: plan.popular ? `0 12px 32px ${plan.glow}` : undefined }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center py-3 rounded-2xl text-[14px] font-bold transition-all duration-200"
                      style={
                        plan.popular
                          ? {
                              background: `linear-gradient(135deg,${plan.color},${plan.id === 'PRO' ? '#2563eb' : '#5b21b6'})`,
                              color: 'white',
                              boxShadow: `0 6px 20px ${plan.glow}`,
                            }
                          : plan.id === 'FREE'
                          ? { background: '#f1f5f9', color: '#475569' }
                          : { background: plan.gradient, color: plan.color, border: `1.5px solid ${plan.color}40` }
                      }
                    >
                      {plan.id === 'FREE' ? 'Commencer gratuitement' : `Passer à ${plan.name}`}
                    </motion.a>

                    {catalog?.trial.plan === plan.id && (
                      <>
                        <button
                          type="button"
                          onClick={startTrial}
                          disabled={trialLoading}
                          className="w-full flex items-center justify-center gap-1.5 mt-2.5 py-2 text-[12.5px] font-semibold transition-opacity hover:opacity-75 disabled:opacity-50"
                          style={{ color: plan.color }}
                        >
                          {trialLoading && <Loader2 size={13} className="animate-spin" />}
                          Essayer {catalog.trial.days} jours gratuitement
                        </button>
                        <p className="text-center text-[10.5px]" style={{ color: '#94a3b8' }}>
                          Sans carte bancaire · une fois par compte
                        </p>
                        {trialError && (
                          <p className="text-center text-[11px] mt-1.5" style={{ color: '#dc2626' }}>{trialError}</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: '1px solid #f1f5f9', margin: '0 28px' }} />

                  {/* Features */}
                  <div className="px-7 py-5 flex-1">
                    <p className="text-[10.5px] font-bold uppercase tracking-widest mb-4" style={{ color: '#cbd5e1' }}>
                      Inclus
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feat, fi) => (
                        <motion.li
                          key={fi}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 + fi * 0.04 + 0.4 }}
                          className="flex items-center gap-2.5"
                        >
                          <div
                            className="w-4.5 h-4.5 flex-shrink-0 rounded-full flex items-center justify-center"
                            style={{
                              background: feat.soon ? '#f8fafc' : feat.highlight ? `${plan.color}18` : '#f0fdf4',
                              color: feat.soon ? '#cbd5e1' : feat.highlight ? plan.color : '#22c55e',
                              minWidth: 18,
                              width: 18,
                              height: 18,
                            }}
                          >
                            {feat.soon ? <Clock size={9} /> : <Check size={10} strokeWidth={2.5} />}
                          </div>
                          <span
                            className="text-[12.5px]"
                            style={{
                              color: feat.soon ? '#94a3b8' : feat.highlight ? '#0f172a' : '#475569',
                              fontWeight: feat.highlight && !feat.soon ? 600 : 400,
                            }}
                          >
                            {feat.text}
                            {feat.soon && <SoonBadge />}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* PREMIUM Incubateur — plan spécialisé */}
          {incubateur && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-20"
          >
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6' }}>
                <Sparkles size={11} />
                Espace Exclusif
              </span>
            </div>

            <div
              className="relative rounded-3xl overflow-hidden p-8 md:p-12"
              style={{
                background: 'linear-gradient(135deg, #080f1a 0%, #0a1628 50%, #0d1f38 100%)',
                border: '1px solid rgba(139,92,246,0.25)',
                boxShadow: '0 0 0 1px rgba(139,92,246,0.1), 0 24px 64px rgba(0,0,0,0.3)',
              }}
            >
              {/* Dot grid */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.1) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
              {/* Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                {/* Left */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                      <Sparkles size={22} color="#a78bfa" />
                    </div>
                    <div>
                      <h3 className="text-[20px] font-bold text-white">{incubateur.name}</h3>
                      <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{incubateur.tagline}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mt-6">
                    {incubateur.features.map((feat) => (
                      <div key={feat.text} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: feat.soon ? 'rgba(255,255,255,0.06)' : 'rgba(139,92,246,0.2)' }}>
                          {feat.soon
                            ? <Clock size={8} color="rgba(255,255,255,0.4)" />
                            : <Check size={9} color="#a78bfa" strokeWidth={2.5} />}
                        </div>
                        <span className="text-[12.5px]" style={{ color: feat.soon ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.7)' }}>
                          {feat.text}
                          {feat.soon && <SoonBadge dark />}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — pricing */}
                <div className="shrink-0 text-center md:text-right">
                  <div className="inline-flex flex-col items-center md:items-end p-6 rounded-2xl"
                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>

                    <div className="flex items-end gap-1.5 mb-1">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`incubateur-${billing}`}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="text-[42px] font-bold leading-none tracking-tight text-white"
                        >
                          {billing === 'yearly' ? Math.round(incubateur.price.yearly / 12) : incubateur.price.monthly}
                        </motion.span>
                      </AnimatePresence>
                      <div className="pb-2">
                        <span className="text-[15px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>CAD</span>
                        <span className="text-[12px] ml-0.5 block leading-none" style={{ color: 'rgba(255,255,255,0.3)' }}>/ mois</span>
                      </div>
                    </div>

                    {billing === 'yearly' && (
                      <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Facturé {incubateur.price.yearly} CAD/an
                        <span className="ml-1.5 font-bold" style={{ color: '#2563eb' }}>(-{yearlyDiscount(incubateur)}%)</span>
                      </p>
                    )}
                    {billing === 'monthly' && <div className="mb-4" />}

                    <motion.a
                      href={`/billing/checkout?plan=PREMIUM_INCUBATEUR&interval=${billing}`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-8 py-3 rounded-2xl text-[14px] font-bold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', boxShadow: '0 6px 24px rgba(139,92,246,0.4)' }}
                    >
                      Rejoindre l'Incubateur
                    </motion.a>

                    <p className="text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Annulation à tout moment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          )}

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                { value: '8%', label: 'Commission marketplace' },
                { value: '14j', label: 'Essai Pro gratuit, sans carte' },
                { value: '∞', label: 'Annulation à tout moment' },
                { value: 'Loi 25', label: 'Données protégées (Québec)' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.08 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-[22px] font-bold" style={{ color: '#0f172a' }}>{stat.value}</span>
                  <span className="text-[11px]" style={{ color: '#94a3b8' }}>{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-[24px] font-bold text-center mb-8" style={{ color: '#0f172a' }}>
              Questions fréquentes
            </h2>
            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid #e2e8f0', background: 'white' }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <span className="text-[13.5px] font-semibold pr-4" style={{ color: '#0f172a' }}>
                      {item.q}
                    </span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: openFaq === i ? '#3b82f6' : '#f1f5f9', color: openFaq === i ? 'white' : '#94a3b8' }}
                    >
                      <span className="text-[16px] leading-none font-light">+</span>
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className="px-6 pb-5 text-[13px] leading-relaxed" style={{ color: '#64748b' }}>
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-20 text-center p-12 rounded-3xl relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#0f1f3d,#1e3a8a,#3b82f6)' }}
          >
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 70% 50%,rgba(255,255,255,0.15) 0%,transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-[28px] font-bold text-white mb-3">
                Prêt à accélérer votre carrière ?
              </h2>
              <p className="text-[14px] text-blue-200 mb-8 max-w-md mx-auto">
                Rejoignez des centaines de freelancers et entrepreneurs qui ont déjà fait confiance à GoConnexions.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <motion.a
                  href="/auth/select-role"
                  whileHover={{ scale: 1.04, boxShadow: '0 16px 40px rgba(0,0,0,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 rounded-2xl font-bold text-blue-900 text-[14px] bg-white"
                >
                  Commencer gratuitement
                </motion.a>
                <motion.a
                  href="/dashboard"
                  whileHover={{ background: 'rgba(255,255,255,0.15)' }}
                  className="px-8 py-3.5 rounded-2xl font-semibold text-white text-[14px] transition-colors"
                  style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
                >
                  Voir le dashboard
                </motion.a>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
