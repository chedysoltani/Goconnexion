'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import { Activity, Briefcase, Award, CheckCircle, Globe, MessageCircle, Users, TrendingUp } from 'lucide-react';

interface AnalyticsPageProps {
  user: User | null;
}

export default function AnalyticsPage({ user }: AnalyticsPageProps) {
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const data = await api.analytics.dashboard();
        setStats(data);
      } catch {
        // silent
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user]);

  const makeStatCard = (label: string, value: string | number, sub: string, iconEl: React.ReactNode, iconBg: string, accent: string) => (
    <div
      key={label}
      className="rounded-2xl p-5 transition-all duration-200"
      style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(26,35,50,0.04)' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 8px 28px rgba(26,35,50,0.08), 0 0 0 1px ${accent}20`; el.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 2px 12px rgba(26,35,50,0.04)'; el.style.transform = 'translateY(0)'; }}
    >
      <div className="h-0.5 rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>{label}</p>
          <p className="text-2xl font-bold" style={{ color: '#1a2332' }}>{value}</p>
          <p className="text-[11px] mt-1" style={{ color: '#64748b' }}>{sub}</p>
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
          {iconEl}
        </div>
      </div>
    </div>
  );

  const renderRealStats = () => {
    if (loadingStats) return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="rounded-2xl p-5 animate-pulse" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <div className="h-0.5 rounded-full mb-4" style={{ background: '#e2e8f0' }} />
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-2.5 rounded-full" style={{ background: '#f1f5f9', width: '60%' }} />
                <div className="h-7 rounded-xl" style={{ background: '#f1f5f9', width: '40%' }} />
              </div>
              <div className="w-11 h-11 rounded-2xl" style={{ background: '#f1f5f9' }} />
            </div>
          </div>
        ))}
      </div>
    );

    if (!stats) return (
      <div className="rounded-2xl p-4 text-[13px]" style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
        Impossible de charger les statistiques d&apos;activité.
      </div>
    );

    const cards: React.ReactNode[] = [];

    if (stats.role === 'FREELANCER') {
      cards.push(
        makeStatCard('Candidatures soumises', stats.stats.totalApplications, 'Total plateforme', <Briefcase size={18} color="#4a90d9" />, 'rgba(74,144,217,0.12)', '#4a90d9'),
        makeStatCard('Candidatures acceptées', stats.stats.acceptedApplications,
          `Taux: ${stats.stats.totalApplications ? Math.round((stats.stats.acceptedApplications / stats.stats.totalApplications) * 100) : 0}%`,
          <CheckCircle size={18} color="#2563eb" />, 'rgba(37,99,235,0.12)', '#2563eb'),
        makeStatCard('Compétences déclarées', stats.stats.skillsCount, 'Ajoutées au profil', <Award size={18} color="#8b5cf6" />, 'rgba(139,92,246,0.12)', '#8b5cf6'),
        makeStatCard('Tarif journalier', `${stats.stats.hourlyRate} €`,
          stats.stats.isAvailable ? 'Disponible pour missions' : 'Indisponible',
          <TrendingUp size={18} color="#f59e0b" />, 'rgba(245,158,11,0.12)', '#f59e0b'),
      );
    } else if (stats.role === 'ENTREPRENEUR') {
      cards.push(
        makeStatCard('Projets publiés', stats.stats.totalProjects, 'Total sur votre entreprise', <Briefcase size={18} color="#4a90d9" />, 'rgba(74,144,217,0.12)', '#4a90d9'),
        makeStatCard('Candidatures reçues', stats.stats.totalApplicationsReceived, 'Postulations freelancers', <Users size={18} color="#2563eb" />, 'rgba(37,99,235,0.12)', '#2563eb'),
        makeStatCard('Entreprise', stats.stats.companyName || 'Non renseigné', 'Active sur GoConnexions', <CheckCircle size={18} color="#8b5cf6" />, 'rgba(139,92,246,0.12)', '#8b5cf6'),
        makeStatCard('Site internet', stats.stats.website ? 'Configuré' : 'Non configuré', 'Lien public', <Globe size={18} color="#f59e0b" />, 'rgba(245,158,11,0.12)', '#f59e0b'),
      );
    } else if (stats.role === 'ADMIN') {
      cards.push(
        makeStatCard('Membres inscrits', stats.stats.totalUsers, 'Total plateforme', <Users size={18} color="#4a90d9" />, 'rgba(74,144,217,0.12)', '#4a90d9'),
        makeStatCard('Projets publiés', stats.stats.totalProjects, 'Missions de recrutement', <Briefcase size={18} color="#2563eb" />, 'rgba(37,99,235,0.12)', '#2563eb'),
        makeStatCard('Conversations actives', stats.stats.totalConversations, 'Messages échangés', <MessageCircle size={18} color="#8b5cf6" />, 'rgba(139,92,246,0.12)', '#8b5cf6'),
        makeStatCard('Statut plateforme', 'En ligne', 'Serveur opérationnel', <Activity size={18} color="#2563eb" />, 'rgba(37,99,235,0.12)', '#2563eb'),
      );
    }

    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{cards}</div>;
  };

  return (
    <div className="min-h-full p-6 md:p-8" style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #f7f9fc 100%)' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1a2332' }}>Analytiques</h1>
          <p className="text-[13px] mt-1" style={{ color: '#64748b' }}>Suivez les performances de votre profil et de vos projets</p>
        </div>

        {/* Real-time business stats */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={13} style={{ color: '#4a90d9' }} className="animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
              Statistiques d&apos;activité réelle
            </span>
          </div>
          {renderRealStats()}
        </div>

      </div>
    </div>
  );
}
