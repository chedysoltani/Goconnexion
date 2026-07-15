'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Globe, Copy, Check, Clock, ArrowRight,
  AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { api } from '@/lib/api';

function WisePaymentContent() {
  const params = useSearchParams();
  const router = useRouter();

  const ref = params.get('ref') ?? '';
  const plan = params.get('plan') ?? 'PRO';
  const interval = params.get('interval') ?? 'monthly';
  const amount = params.get('amount') ?? '0';
  const currency = params.get('currency') ?? 'CAD';
  const wiseEmail = params.get('email') ?? '';

  const [copied, setCopied] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(true);

  // Poll subscription status every 15s to detect when payment is confirmed
  useEffect(() => {
    if (!ref) return;
    const check = async () => {
      try {
        // Les cookies httpOnly sont envoyés automatiquement par le navigateur
        const data = await api.subscription.get();
        if (data.status === 'ACTIVE' && data.plan !== 'FREE') {
          router.push(`/billing/success?plan=${plan}`);
        }
      } catch {
        // ignore — le polling continue
      }
    };
    const interval_id = setInterval(check, 15_000);
    return () => clearInterval(interval_id);
  }, [ref, plan, router]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    {
      n: 1,
      title: 'Ouvrez votre application Wise',
      desc: 'Connectez-vous à votre compte Wise Business ou personnel.',
    },
    {
      n: 2,
      title: 'Envoyez un virement',
      desc: `Montant exact : ${amount} ${currency} — vers le compte ci-dessus.`,
    },
    {
      n: 3,
      title: 'Ajoutez la référence obligatoire',
      desc: 'Dans le champ "Référence" ou "Message au destinataire", collez exactement la référence ci-dessous.',
    },
    {
      n: 4,
      title: 'Confirmez et attendez',
      desc: 'Votre abonnement sera activé automatiquement dès réception (généralement quelques heures).',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 50%,#f0fdf4 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div
          className="rounded-3xl overflow-hidden mb-4"
          style={{ boxShadow: '0 20px 60px rgba(15,23,42,0.12)' }}
        >
          <div
            className="px-8 pt-8 pb-7 text-center"
            style={{ background: 'linear-gradient(135deg,#0d9488 0%,#0891b2 100%)' }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-white/10"
            >
              <Globe size={28} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-1">Paiement Wise</h1>
            <p className="text-teal-100 text-sm">
              Plan <strong>{plan}</strong> · {interval === 'yearly' ? 'Annuel' : 'Mensuel'}
            </p>
          </div>

          {/* Status banner */}
          <div className="px-6 py-3 flex items-center gap-2"
            style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
            <Clock size={14} style={{ color: '#d97706' }} />
            <p className="text-xs font-medium" style={{ color: '#92400e' }}>
              En attente de votre virement — activation automatique à réception
            </p>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 space-y-4">

            {/* Amount */}
            <div className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: '#16a34a' }}>Montant à envoyer</p>
                <p className="text-3xl font-bold" style={{ color: '#15803d' }}>
                  {amount} <span className="text-lg">{currency}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: '#94a3b8' }}>Exactement ce montant</p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Pas de frais supplémentaires</p>
              </div>
            </div>

            {/* Wise account destination */}
            {wiseEmail && (
              <div className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-0.5" style={{ color: '#0369a1' }}>
                    Envoyez vers le compte Wise
                  </p>
                  <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>
                    {wiseEmail}
                  </p>
                </div>
                <button
                  onClick={() => copy(wiseEmail, 'email')}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold ml-3 transition-all"
                  style={{
                    background: copied === 'email' ? '#dcfce7' : '#e0f2fe',
                    color: copied === 'email' ? '#16a34a' : '#0369a1',
                  }}
                >
                  {copied === 'email' ? <Check size={12} /> : <Copy size={12} />}
                  {copied === 'email' ? 'Copié' : 'Copier'}
                </button>
              </div>
            )}

            {/* Reference — most important */}
            <div className="p-4 rounded-2xl" style={{ background: '#fef2f2', border: '2px solid #fca5a5' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertCircle size={13} style={{ color: '#dc2626' }} />
                    <p className="text-xs font-bold" style={{ color: '#dc2626' }}>
                      Référence OBLIGATOIRE
                    </p>
                  </div>
                  <p className="text-sm font-mono font-bold tracking-wider" style={{ color: '#0f172a' }}>
                    {ref}
                  </p>
                  <p className="text-[10.5px] mt-1" style={{ color: '#64748b' }}>
                    Sans cette référence, votre paiement ne pourra pas être associé à votre compte.
                  </p>
                </div>
                <button
                  onClick={() => copy(ref, 'ref')}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: copied === 'ref' ? '#dcfce7' : '#fee2e2',
                    color: copied === 'ref' ? '#16a34a' : '#dc2626',
                  }}
                >
                  {copied === 'ref' ? <Check size={12} /> : <Copy size={12} />}
                  {copied === 'ref' ? 'Copié' : 'Copier'}
                </button>
              </div>
            </div>

            {/* Steps toggle */}
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-colors"
              style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }}
            >
              <span>Comment effectuer le virement ?</span>
              {showSteps ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {showSteps && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {steps.map((s) => (
                  <div key={s.n} className="flex gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                      style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)' }}
                    >
                      {s.n}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{s.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
            style={{ background: 'white', color: '#64748b', border: '1.5px solid #e2e8f0' }}
          >
            Retour au dashboard
          </button>
          <button
            onClick={() => router.push('/pricing')}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all text-white"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)' }}
          >
            Voir mes plans <ArrowRight size={13} />
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#94a3b8' }}>
          Une question ? Contactez le support · Activation sous 24h ouvrées
        </p>
      </motion.div>
    </div>
  );
}

export default function WisePage() {
  return (
    <Suspense>
      <WisePaymentContent />
    </Suspense>
  );
}
