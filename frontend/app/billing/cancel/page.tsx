'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#f8fafc' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: '#fef2f2', border: '2px solid #fecaca' }}
        >
          <XCircle size={30} style={{ color: '#ef4444' }} />
        </motion.div>

        <div className="bg-white rounded-3xl p-7 shadow-md" style={{ border: '1px solid #e2e8f0' }}>
          <h1 className="text-[20px] font-bold mb-2" style={{ color: '#0f172a' }}>
            Paiement annulé
          </h1>
          <p className="text-[13px] mb-7 leading-relaxed" style={{ color: '#64748b' }}>
            Ton abonnement n&apos;a pas été modifié.
            Tu peux réessayer à tout moment depuis la page des forfaits.
          </p>

          <div className="flex flex-col gap-3">
            <motion.button
              onClick={() => router.push('/pricing')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13.5px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
            >
              <RefreshCw size={14} />
              Réessayer
            </motion.button>
            <motion.button
              onClick={() => router.push('/dashboard')}
              whileHover={{ background: '#f8fafc' }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13.5px] font-semibold transition-colors"
              style={{ color: '#64748b', border: '1px solid #e2e8f0' }}
            >
              <ArrowLeft size={14} />
              Retour au dashboard
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
