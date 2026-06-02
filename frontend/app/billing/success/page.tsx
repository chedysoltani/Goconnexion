'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Building2, ArrowRight, Sparkles } from 'lucide-react';

const PLAN_CONFIG: Record<string, { name: string; color: string; gradient: string; icon: React.ReactNode; perks: string[] }> = {
  PRO: {
    name: 'Pro',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    icon: <Zap size={22} />,
    perks: ['Candidatures illimitées', 'Analytics de profil', 'Contrats électroniques', 'Appels vidéo'],
  },
  BUSINESS: {
    name: 'Business',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
    icon: <Building2 size={22} />,
    perks: ['Tout Pro inclus', 'Équipe illimitée', 'Page entreprise', 'API access'],
  },
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = (searchParams.get('plan') ?? 'PRO').toUpperCase();
  const cfg = PLAN_CONFIG[plan] ?? PLAN_CONFIG.PRO;
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#f8fafc 0%,#eff6ff 50%,#f5f3ff 100%)' }}>

      {/* Confetti circles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-3 h-3 rounded-full pointer-events-none"
          style={{
            background: ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16'][i],
            left: `${10 + i * 11}%`,
            top: '-10px',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, (i % 2 === 0 ? 40 : -40)],
            rotate: [0, 360],
            opacity: [1, 0.4],
          }}
          transition={{
            duration: 2 + i * 0.3,
            delay: i * 0.15,
            ease: 'easeIn',
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mx-auto mb-6 w-20 h-20"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: cfg.gradient, boxShadow: `0 12px 40px ${cfg.color}40` }}>
            <CheckCircle size={36} className="text-white" strokeWidth={2} />
          </div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ background: cfg.gradient }}
          />
        </motion.div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl" style={{ border: '1px solid #e2e8f0' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles size={14} style={{ color: cfg.color }} />
              <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: cfg.color }}>
                Abonnement activé
              </span>
            </div>

            <h1 className="text-[26px] font-bold mb-2" style={{ color: '#0f172a' }}>
              Bienvenue dans GoConnexion {cfg.name} !
            </h1>
            <p className="text-[14px] mb-7" style={{ color: '#64748b' }}>
              Ton compte a été mis à jour. Toutes les fonctionnalités sont maintenant disponibles.
            </p>

            {/* Perks */}
            <div className="grid grid-cols-2 gap-2.5 mb-7">
              {cfg.perks.map((perk, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-left"
                  style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}20` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                  <span className="text-[11.5px] font-medium" style={{ color: '#334155' }}>{perk}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.button
              onClick={() => router.push('/dashboard')}
              whileHover={{ scale: 1.02, boxShadow: `0 12px 32px ${cfg.color}35` }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-bold text-white"
              style={{ background: cfg.gradient }}
            >
              Accéder au tableau de bord
              <ArrowRight size={15} />
            </motion.button>

            <p className="mt-4 text-[11px]" style={{ color: '#94a3b8' }}>
              Redirection automatique dans {countdown}s...
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
