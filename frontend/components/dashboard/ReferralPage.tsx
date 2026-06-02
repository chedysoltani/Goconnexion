'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { User } from '@/types/auth';

interface ReferralData {
  code: string;
  totalReferrals: number;
  referrals: Array<{
    id: string;
    createdAt: string;
    referredUser: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      role: string;
      createdAt: string;
    };
  }>;
}

interface LeaderboardEntry {
  id: string;
  code: string;
  totalReferrals: number;
  user: { id: string; firstName: string; lastName: string; avatarUrl?: string };
}

const ROLE_LABELS: Record<string, string> = {
  FREELANCER: 'Freelancer', ENTREPRENEUR: 'Entrepreneur',
  COLLABORATOR: 'Collaborateur', ADMIN: 'Admin',
};

interface Props { user: User | null }

export default function ReferralPage({ user }: Props) {
  const [data, setData] = useState<ReferralData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, lb] = await Promise.all([
        api.referral.dashboard(),
        api.referral.leaderboard(),
      ]);
      setData(dash);
      setLeaderboard(lb);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const referralLink = data?.code
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://goconnexion.com'}/auth/signup?ref=${data.code}`
    : '';

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-slate-100 rounded-full w-48 animate-pulse" />
        <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-800">Parrainage</h2>
          <p className="text-sm text-slate-500 mt-0.5">Invitez vos contacts et développez la communauté</p>
        </div>

        {/* Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 60%, #8b5cf6 100%)' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(30%,-30%)' }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🔗</div>
              <div>
                <p className="font-bold text-lg">Votre lien de parrainage</p>
                <p className="text-blue-200 text-sm">Partagez et gagnez des avantages</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 mb-4">
              <span className="text-sm text-blue-100 flex-1 truncate font-mono">{referralLink || 'Chargement...'}</span>
              <motion.button
                onClick={copyLink}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-white text-blue-600 text-xs font-bold transition-all"
              >
                {copied ? '✓ Copié !' : 'Copier'}
              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                Code : <span className="font-mono">{data?.code}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Filleuls', value: data?.totalReferrals ?? 0, icon: '👥', color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Ce mois', value: data?.referrals.filter(r => {
              const d = new Date(r.createdAt);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length ?? 0, icon: '📅', color: '#8b5cf6', bg: '#ede9fe' },
            { label: 'Cette semaine', value: data?.referrals.filter(r => {
              const d = new Date(r.createdAt);
              const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
              return d >= weekAgo;
            }).length ?? 0, icon: '⚡', color: '#10b981', bg: '#d1fae5' },
          ].map(stat => (
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

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referrals list */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
              <span>Mes filleuls</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                {data?.totalReferrals ?? 0}
              </span>
            </h3>
            {(data?.referrals.length ?? 0) === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🌱</p>
                <p className="text-slate-400 text-sm">Aucun filleul encore.</p>
                <p className="text-slate-400 text-xs mt-1">Partagez votre lien pour commencer !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.referrals.map((ref, idx) => (
                  <motion.div
                    key={ref.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {ref.referredUser.firstName[0]}{ref.referredUser.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 text-sm truncate">
                        {ref.referredUser.firstName} {ref.referredUser.lastName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {ROLE_LABELS[ref.referredUser.role] || ref.referredUser.role} ·{' '}
                        {new Date(ref.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                      +1
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
              <span>🏆 Classement</span>
            </h3>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🏆</p>
                <p className="text-slate-400 text-sm">Le classement sera bientôt disponible.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, idx) => {
                  const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
                  const isMe = entry.user.id === user?.id;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${isMe ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <span className="w-6 text-sm text-center flex-shrink-0">{medal}</span>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {entry.user.firstName[0]}{entry.user.lastName[0]}
                      </div>
                      <p className={`flex-1 text-sm font-medium truncate ${isMe ? 'text-blue-700' : 'text-slate-700'}`}>
                        {entry.user.firstName} {entry.user.lastName} {isMe && '(vous)'}
                      </p>
                      <span className="text-sm font-bold text-slate-600 flex-shrink-0">
                        {entry.totalReferrals} filleuls
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Share options */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Partager votre lien</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'WhatsApp', color: '#25D366', icon: '💬', action: () => window.open(`https://wa.me/?text=Rejoignez-moi sur GoConnexion, la plateforme professionnelle ! ${encodeURIComponent(referralLink)}`) },
              { label: 'LinkedIn', color: '#0A66C2', icon: '💼', action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`) },
              { label: 'Email', color: '#3b82f6', icon: '📧', action: () => window.open(`mailto:?subject=Rejoignez GoConnexion&body=Rejoignez-moi sur GoConnexion ! ${referralLink}`) },
            ].map(btn => (
              <motion.button
                key={btn.label}
                onClick={btn.action}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: btn.color }}
              >
                <span>{btn.icon}</span>
                {btn.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
