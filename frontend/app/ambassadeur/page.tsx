'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

interface AmbassadorStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  referrals: Array<{
    id: string;
    createdAt: string;
    referredUser: { id: string; firstName: string; lastName: string; avatarUrl?: string; role: string };
    isPaidSubscriber: boolean;
  }>;
}

const ROLE_LABELS: Record<string, string> = {
  FREELANCER: 'Freelancer', ENTREPRENEUR: 'Entrepreneur',
  COLLABORATOR: 'Collaborateur', ADMIN: 'Admin',
};

export default function AmbassadeurPage() {
  const router = useRouter();
  const [data, setData] = useState<AmbassadorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const stats = await api.referral.ambassadorStats();
      setData(stats);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!user.isAmbassador) {
      router.push('/dashboard');
      return;
    }
    setAuthorized(true);
    load();
  }, [router, load]);

  const copyLink = () => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!authorized || loading) {
    return (
      <div className="min-h-screen p-8" style={{ background: 'var(--bg, #f8fafc)' }}>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-8 bg-slate-100 rounded-full w-48 animate-pulse" />
          <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const paidCount = data?.referrals.filter((r) => r.isPaidSubscriber).length ?? 0;

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--bg, #f8fafc)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Espace Ambassadeur</h1>
            <p className="text-sm text-slate-500">Votre lien, vos inscriptions, votre impact</p>
          </div>
        </motion.div>

        {/* Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 text-white relative overflow-hidden mb-6"
          style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 60%, #8b5cf6 100%)' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(30%,-30%)' }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🌟</div>
              <div>
                <p className="font-bold text-lg">Votre lien ambassadeur</p>
                <p className="text-blue-200 text-sm">Partagez-le pour développer la communauté</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 mb-4">
              <span className="text-sm text-blue-100 flex-1 truncate font-mono">{data?.referralLink || 'Chargement...'}</span>
              <motion.button
                onClick={copyLink}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-white text-blue-600 text-xs font-bold transition-all"
              >
                {copied ? '✓ Copié !' : 'Copier'}
              </motion.button>
            </div>

            <div className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold inline-block">
              Code : <span className="font-mono">{data?.referralCode}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Inscriptions', value: data?.totalReferrals ?? 0, icon: '👥', color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Abonnés payants', value: paidCount, icon: '💳', color: '#22c55e', bg: '#dcfce7' },
            { label: 'Comptes gratuits', value: (data?.totalReferrals ?? 0) - paidCount, icon: '🌱', color: '#8b5cf6', bg: '#ede9fe' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-100 p-4 text-center"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mx-auto mb-2"
                style={{ background: stat.bg }}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Registrations table */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Inscriptions récentes ({data?.referrals.length ?? 0})
            </h2>
          </div>
          {(data?.referrals.length ?? 0) === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">🌱</p>
              <p className="text-slate-400 text-sm">Aucune inscription encore.</p>
              <p className="text-slate-400 text-xs mt-1">Partagez votre lien pour commencer !</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Utilisateur', 'Rôle', 'Date', 'Statut'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.referrals.map((ref, idx) => (
                    <motion.tr
                      key={ref.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {ref.referredUser.firstName[0]}{ref.referredUser.lastName[0]}
                          </div>
                          <p className="text-[13px] font-semibold text-slate-800">
                            {ref.referredUser.firstName} {ref.referredUser.lastName}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-slate-500">
                        {ROLE_LABELS[ref.referredUser.role] || ref.referredUser.role}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-slate-500">
                        {new Date(ref.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={ref.isPaidSubscriber
                            ? { background: 'rgba(34,197,94,0.1)', color: '#16a34a' }
                            : { background: 'rgba(148,163,184,0.15)', color: '#64748b' }}
                        >
                          {ref.isPaidSubscriber ? 'Abonné payant' : 'Compte gratuit'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
