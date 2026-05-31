'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import { TrendingUp, Users, Eye, MousePointer, Activity, Briefcase, Award, CheckCircle, Globe, MessageCircle, BarChart3 } from 'lucide-react';

interface AnalyticsPageProps {
  user: User | null;
}

interface AnalyticsData {
  visitors:       { total: number; growth: number; trend: 'up' | 'down' };
  pageViews:      { total: number; growth: number; trend: 'up' | 'down' };
  engagement:     { rate: number;  growth: number; trend: 'up' | 'down' };
  conversionRate: { rate: number;  growth: number; trend: 'up' | 'down' };
  topPages: Array<{ url: string; title: string; views: number; percentage: number }>;
  trafficSources: Array<{ source: string; visitors: number; percentage: number }>;
  devices: Array<{ type: string; visitors: number; percentage: number }>;
}

const METRIC_TABS = [
  { key: 'overview',   label: 'Vue d\'ensemble' },
  { key: 'traffic',    label: 'Trafic' },
  { key: 'engagement', label: 'Engagement' },
] as const;

const PERIOD_TABS = [
  { key: 'week',    label: 'Semaine' },
  { key: 'month',   label: 'Mois' },
  { key: 'year',    label: 'Année' },
] as const;

type MetricKey = (typeof METRIC_TABS)[number]['key'];
type PeriodKey = (typeof PERIOD_TABS)[number]['key'];

const SOURCE_COLORS = ['#4a90d9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

function BarRow({ label, sub, value, max, color }: { label: string; sub: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold" style={{ color: '#1a2332' }}>{label}</p>
          <p className="text-[11px]" style={{ color: '#94a3b8' }}>{sub}</p>
        </div>
        <span className="text-[13px] font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ background: '#f1f5f9' }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}80)` }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage({ user }: AnalyticsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('month');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('overview');
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

  const analyticsData: AnalyticsData = {
    visitors:       { total: 45234, growth: 12.5, trend: 'up' },
    pageViews:      { total: 128456, growth: 8.3,  trend: 'up' },
    engagement:     { rate: 3.24, growth: -2.1,    trend: 'down' },
    conversionRate: { rate: 2.8,  growth: 5.7,     trend: 'up' },
    topPages: [
      { url: '/projects/e-commerce',  title: 'Projet E-commerce',      views: 8542, percentage: 28.5 },
      { url: '/projects/mobile-app',  title: 'Application Mobile',     views: 6234, percentage: 20.8 },
      { url: '/projects/corporate',   title: 'Refonte Site Corporate', views: 4892, percentage: 16.3 },
      { url: '/projects/analytics',   title: 'Dashboard Analytics IA', views: 3456, percentage: 11.5 },
      { url: '/dashboard',            title: 'Tableau de bord',        views: 2890, percentage: 8.9 },
    ],
    trafficSources: [
      { source: 'Recherche Organique', visitors: 18234, percentage: 40.3 },
      { source: 'Direct',              visitors: 12456, percentage: 27.5 },
      { source: 'Réseaux Sociaux',     visitors: 8923,  percentage: 19.7 },
      { source: 'Références',          visitors: 4567,  percentage: 10.1 },
      { source: 'Email',               visitors: 1054,  percentage: 2.3  },
    ],
    devices: [
      { type: 'Desktop',  visitors: 28934, percentage: 64.0 },
      { type: 'Mobile',   visitors: 14256, percentage: 31.5 },
      { type: 'Tablette', visitors: 2044,  percentage: 4.5  },
    ],
  };

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);
  const fmtPct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;

  const OVERVIEW_CARDS = [
    {
      label: 'Visiteurs uniques', value: fmt(analyticsData.visitors.total),
      growth: fmtPct(analyticsData.visitors.growth), up: analyticsData.visitors.trend === 'up',
      icon: <Users size={18} color="#4a90d9" />, iconBg: 'rgba(74,144,217,0.12)', accent: '#4a90d9',
    },
    {
      label: 'Pages vues', value: fmt(analyticsData.pageViews.total),
      growth: fmtPct(analyticsData.pageViews.growth), up: analyticsData.pageViews.trend === 'up',
      icon: <Eye size={18} color="#10b981" />, iconBg: 'rgba(16,185,129,0.12)', accent: '#10b981',
    },
    {
      label: 'Taux d\'engagement', value: `${analyticsData.engagement.rate}%`,
      growth: fmtPct(analyticsData.engagement.growth), up: analyticsData.engagement.trend === 'up',
      icon: <Activity size={18} color="#8b5cf6" />, iconBg: 'rgba(139,92,246,0.12)', accent: '#8b5cf6',
    },
    {
      label: 'Taux de conversion', value: `${analyticsData.conversionRate.rate}%`,
      growth: fmtPct(analyticsData.conversionRate.growth), up: analyticsData.conversionRate.trend === 'up',
      icon: <MousePointer size={18} color="#f59e0b" />, iconBg: 'rgba(245,158,11,0.12)', accent: '#f59e0b',
    },
  ];

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
          <CheckCircle size={18} color="#10b981" />, 'rgba(16,185,129,0.12)', '#10b981'),
        makeStatCard('Compétences déclarées', stats.stats.skillsCount, 'Ajoutées au profil', <Award size={18} color="#8b5cf6" />, 'rgba(139,92,246,0.12)', '#8b5cf6'),
        makeStatCard('Tarif journalier', `${stats.stats.hourlyRate} €`,
          stats.stats.isAvailable ? 'Disponible pour missions' : 'Indisponible',
          <TrendingUp size={18} color="#f59e0b" />, 'rgba(245,158,11,0.12)', '#f59e0b'),
      );
    } else if (stats.role === 'ENTREPRENEUR') {
      cards.push(
        makeStatCard('Projets publiés', stats.stats.totalProjects, 'Total sur votre entreprise', <Briefcase size={18} color="#4a90d9" />, 'rgba(74,144,217,0.12)', '#4a90d9'),
        makeStatCard('Candidatures reçues', stats.stats.totalApplicationsReceived, 'Postulations freelancers', <Users size={18} color="#10b981" />, 'rgba(16,185,129,0.12)', '#10b981'),
        makeStatCard('Entreprise', stats.stats.companyName || 'Non renseigné', 'Active sur GoConnexions', <CheckCircle size={18} color="#8b5cf6" />, 'rgba(139,92,246,0.12)', '#8b5cf6'),
        makeStatCard('Site internet', stats.stats.website ? 'Configuré' : 'Non configuré', 'Lien public', <Globe size={18} color="#f59e0b" />, 'rgba(245,158,11,0.12)', '#f59e0b'),
      );
    } else if (stats.role === 'ADMIN') {
      cards.push(
        makeStatCard('Membres inscrits', stats.stats.totalUsers, 'Total plateforme', <Users size={18} color="#4a90d9" />, 'rgba(74,144,217,0.12)', '#4a90d9'),
        makeStatCard('Projets publiés', stats.stats.totalProjects, 'Missions de recrutement', <Briefcase size={18} color="#10b981" />, 'rgba(16,185,129,0.12)', '#10b981'),
        makeStatCard('Conversations actives', stats.stats.totalConversations, 'Messages échangés', <MessageCircle size={18} color="#8b5cf6" />, 'rgba(139,92,246,0.12)', '#8b5cf6'),
        makeStatCard('Statut plateforme', 'En ligne', 'Serveur opérationnel', <Activity size={18} color="#10b981" />, 'rgba(16,185,129,0.12)', '#10b981'),
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

        {/* Period + Metric selectors */}
        <div
          className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
          style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(26,35,50,0.03)' }}
        >
          <div className="flex gap-2">
            {PERIOD_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key)}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150"
                style={selectedPeriod === key
                  ? { background: 'linear-gradient(135deg, #4a90d9, #2563eb)', color: '#fff', boxShadow: '0 4px 10px rgba(74,144,217,0.3)' }
                  : { background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0' }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {METRIC_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150"
                style={selectedMetric === key
                  ? { background: '#080f1a', color: '#fff' }
                  : { background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview */}
        {selectedMetric === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OVERVIEW_CARDS.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl p-5 transition-all duration-200"
                style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(26,35,50,0.04)' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 8px 28px rgba(26,35,50,0.08), 0 0 0 1px ${card.accent}20`; el.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 2px 12px rgba(26,35,50,0.04)'; el.style.transform = 'translateY(0)'; }}
              >
                <div className="h-0.5 rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${card.accent}, transparent)` }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>{card.label}</p>
                    <p className="text-2xl font-bold" style={{ color: '#1a2332' }}>{card.value}</p>
                    <p className="text-[12px] font-semibold mt-1" style={{ color: card.up ? '#10b981' : '#ef4444' }}>
                      {card.up ? '↑' : '↓'} {card.growth}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: card.iconBg }}>
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Traffic */}
        {selectedMetric === 'traffic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(26,35,50,0.04)' }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(74,144,217,0.1)' }}>
                  <BarChart3 size={15} color="#4a90d9" />
                </div>
                <h3 className="text-[14px] font-bold" style={{ color: '#1a2332' }}>Sources de trafic</h3>
              </div>
              <div className="space-y-4">
                {analyticsData.trafficSources.map((source, i) => (
                  <BarRow
                    key={i}
                    label={source.source}
                    sub={`${fmt(source.visitors)} visiteurs`}
                    value={source.visitors}
                    max={analyticsData.trafficSources[0].visitors}
                    color={SOURCE_COLORS[i % SOURCE_COLORS.length]}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(26,35,50,0.04)' }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}>
                  <Users size={15} color="#8b5cf6" />
                </div>
                <h3 className="text-[14px] font-bold" style={{ color: '#1a2332' }}>Appareils</h3>
              </div>
              <div className="space-y-4">
                {analyticsData.devices.map((device, i) => (
                  <BarRow
                    key={i}
                    label={device.type}
                    sub={`${fmt(device.visitors)} visiteurs`}
                    value={device.visitors}
                    max={analyticsData.devices[0].visitors}
                    color={['#4a90d9', '#8b5cf6', '#10b981'][i] || '#4a90d9'}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Engagement */}
        {selectedMetric === 'engagement' && (
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(26,35,50,0.04)' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(74,144,217,0.1)' }}>
                <Eye size={15} color="#4a90d9" />
              </div>
              <h3 className="text-[14px] font-bold" style={{ color: '#1a2332' }}>Pages les plus populaires</h3>
            </div>
            <div className="space-y-3">
              {analyticsData.topPages.map((page, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0f4f8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                      style={{ background: i === 0 ? 'rgba(74,144,217,0.15)' : '#f1f5f9', color: i === 0 ? '#4a90d9' : '#94a3b8' }}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: '#1a2332' }}>{page.title}</p>
                      <p className="text-[11px] truncate" style={{ color: '#94a3b8' }}>{page.url}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-[13px] font-bold" style={{ color: '#1a2332' }}>{fmt(page.views)}</p>
                    <p className="text-[11px]" style={{ color: '#94a3b8' }}>{page.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
