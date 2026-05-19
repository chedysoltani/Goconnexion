'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import { Search, TrendingUp, Users, Eye, MousePointer, Calendar, BarChart3, PieChart, Activity, Briefcase, Award, CheckCircle, Globe, MessageCircle } from 'lucide-react';

interface AnalyticsPageProps {
  user: User | null;
}

interface AnalyticsData {
  visitors: {
    total: number;
    growth: number;
    trend: 'up' | 'down';
  };
  pageViews: {
    total: number;
    growth: number;
    trend: 'up' | 'down';
  };
  engagement: {
    rate: number;
    growth: number;
    trend: 'up' | 'down';
  };
  conversionRate: {
    rate: number;
    growth: number;
    trend: 'up' | 'down';
  };
  topPages: Array<{
    url: string;
    title: string;
    views: number;
    percentage: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  devices: Array<{
    type: string;
    visitors: number;
    percentage: number;
  }>;
}

export default function AnalyticsPage({ user }: AnalyticsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'traffic' | 'engagement'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const data = await api.analytics.dashboard();
        setStats(data);
      } catch (err) {
        console.error("Error fetching dashboard analytics:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user]);

  const analyticsData: AnalyticsData = {
    visitors: {
      total: 45234,
      growth: 12.5,
      trend: 'up'
    },
    pageViews: {
      total: 128456,
      growth: 8.3,
      trend: 'up'
    },
    engagement: {
      rate: 3.24,
      growth: -2.1,
      trend: 'down'
    },
    conversionRate: {
      rate: 2.8,
      growth: 5.7,
      trend: 'up'
    },
    topPages: [
      { url: '/projects/e-commerce', title: 'Projet E-commerce', views: 8542, percentage: 28.5 },
      { url: '/projects/mobile-app', title: 'Application Mobile', views: 6234, percentage: 20.8 },
      { url: '/projects/corporate', title: 'Refonte Site Corporate', views: 4892, percentage: 16.3 },
      { url: '/projects/analytics', title: 'Dashboard Analytics IA', views: 3456, percentage: 11.5 },
      { url: '/dashboard', title: 'Tableau de bord', views: 2890, percentage: 8.9 },
    ],
    trafficSources: [
      { source: 'Recherche Organique', visitors: 18234, percentage: 40.3 },
      { source: 'Direct', visitors: 12456, percentage: 27.5 },
      { source: 'Réseaux Sociaux', visitors: 8923, percentage: 19.7 },
      { source: 'Références', visitors: 4567, percentage: 10.1 },
      { source: 'Email', visitors: 1054, percentage: 2.3 },
    ],
    devices: [
      { type: 'Desktop', visitors: 28934, percentage: 64.0 },
      { type: 'Mobile', visitors: 14256, percentage: 31.5 },
      { type: 'Tablette', visitors: 2044, percentage: 4.5 },
    ]
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Analytiques</h1>
        <p className="text-sm text-slate-600">Suivez les performances de votre profil et projets</p>
      </div>

      {/* Real-time Business Metrics Dashboard */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
          <Activity size={14} className="text-accent animate-pulse" />
          <span>Tableau de bord d'activité réelle</span>
        </h2>
        {loadingStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-6 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.role === 'FREELANCER' && (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-light text-accent rounded-full flex items-center justify-center">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Candidatures Soumises</p>
                      <p className="text-xl font-black text-slate-900">{stats.stats.totalApplications}</p>
                      <p className="text-[10px] text-slate-400">Total sur la plateforme</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Candidatures Acceptées</p>
                      <p className="text-xl font-black text-slate-900">{stats.stats.acceptedApplications}</p>
                      <p className="text-[10px] text-slate-400">Taux : {stats.stats.totalApplications ? Math.round((stats.stats.acceptedApplications / stats.stats.totalApplications) * 100) : 0}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                      <Award size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Compétences Déclarées</p>
                      <p className="text-xl font-black text-slate-900">{stats.stats.skillsCount}</p>
                      <p className="text-[10px] text-slate-400">Ajoutées au profil</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tarif Journalier Moyen</p>
                      <p className="text-xl font-black text-slate-900">{stats.stats.hourlyRate} €</p>
                      <p className="text-[10px] text-slate-400">{stats.stats.isAvailable ? 'Disponible pour missions' : 'Indisponible'}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {stats.role === 'ENTREPRENEUR' && (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-light text-accent rounded-full flex items-center justify-center">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Projets Publiés</p>
                      <p className="text-xl font-black text-slate-900">{stats.stats.totalProjects}</p>
                      <p className="text-[10px] text-slate-400">Total sur votre entreprise</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Candidatures Reçues</p>
                      <p className="text-xl font-black text-slate-900">{stats.stats.totalApplicationsReceived}</p>
                      <p className="text-[10px] text-slate-400">Postulations de Freelancers</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entreprise</p>
                      <p className="text-sm font-black text-slate-900 truncate">{stats.stats.companyName || 'Non renseigné'}</p>
                      <p className="text-[10px] text-slate-400">Active sur GoConnexions</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                      <Globe size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Site Internet</p>
                      <p className="text-xs font-bold text-accent truncate hover:underline">
                        {stats.stats.website ? (
                          <a href={stats.stats.website} target="_blank" rel="noopener noreferrer">{stats.stats.website}</a>
                        ) : (
                          'Non configuré'
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400">Lien public</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {stats.role === 'ADMIN' && (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-light text-accent rounded-full flex items-center justify-center">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Membres Inscrits</p>
                      <p className="text-xl font-black text-slate-900">{stats.stats.totalUsers}</p>
                      <p className="text-[10px] text-slate-400">Total plateforme</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Projets Publiés</p>
                      <p className="text-xl font-black text-slate-900">{stats.stats.totalProjects}</p>
                      <p className="text-[10px] text-slate-400">Missions de recrutement</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conversations Actives</p>
                      <p className="text-xl font-black text-slate-900">{stats.stats.totalConversations}</p>
                      <p className="text-[10px] text-slate-400">Messages échangés</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Statut Plateforme</p>
                      <p className="text-xl font-black text-emerald-600">En Ligne</p>
                      <p className="text-[10px] text-slate-400">Serveur opérationnel</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-slate-400 text-xs italic bg-white p-4 border rounded-2xl border-slate-200">
            Impossible de charger les statistiques d'activité.
          </div>
        )}
      </div>

      {/* Period and Metric Selectors */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Period Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                selectedPeriod === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                selectedPeriod === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Année
            </button>
          </div>

          {/* Metric Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMetric('overview')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                selectedMetric === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Aperçu
            </button>
            <button
              onClick={() => setSelectedMetric('traffic')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                selectedMetric === 'traffic'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Trafic
            </button>
            <button
              onClick={() => setSelectedMetric('engagement')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                selectedMetric === 'engagement'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Engagement
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      {selectedMetric === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Visiteurs</p>
                <p className="text-lg font-bold text-slate-900">{formatNumber(analyticsData.visitors.total)}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className={`text-green-500 ${analyticsData.visitors.trend === 'up' ? '' : 'rotate-180'}`} />
                  <span className={`text-xs font-medium ${analyticsData.visitors.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(analyticsData.visitors.growth)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Eye size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pages Vues</p>
                <p className="text-lg font-bold text-slate-900">{formatNumber(analyticsData.pageViews.total)}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className={`text-green-500 ${analyticsData.pageViews.trend === 'up' ? '' : 'rotate-180'}`} />
                  <span className={`text-xs font-medium ${analyticsData.pageViews.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(analyticsData.pageViews.growth)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Engagement</p>
                <p className="text-lg font-bold text-slate-900">{analyticsData.engagement.rate}%</p>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className={`text-green-500 ${analyticsData.engagement.trend === 'up' ? '' : 'rotate-180'}`} />
                  <span className={`text-xs font-medium ${analyticsData.engagement.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(analyticsData.engagement.growth)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <MousePointer size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Taux Conversion</p>
                <p className="text-lg font-bold text-slate-900">{analyticsData.conversionRate.rate}%</p>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className={`text-green-500 ${analyticsData.conversionRate.trend === 'up' ? '' : 'rotate-180'}`} />
                  <span className={`text-xs font-medium ${analyticsData.conversionRate.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(analyticsData.conversionRate.growth)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Traffic Sources */}
      {selectedMetric === 'traffic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 text-base mb-4">Sources de Trafic</h3>
            <div className="space-y-3">
              {analyticsData.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <BarChart3 size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{source.source}</p>
                      <p className="text-xs text-slate-500">{formatNumber(source.visitors)} visiteurs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{source.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 text-base mb-4">Appareils</h3>
            <div className="space-y-3">
              {analyticsData.devices.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{device.type}</p>
                      <p className="text-xs text-slate-500">{formatNumber(device.visitors)} visiteurs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{device.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Engagement Details */}
      {selectedMetric === 'engagement' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <h3 className="font-semibold text-slate-900 text-base mb-4">Pages les Plus Populaires</h3>
          <div className="space-y-3">
            {analyticsData.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{page.title}</p>
                  <p className="text-xs text-slate-500">{page.url}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 text-sm">{formatNumber(page.views)}</p>
                  <p className="text-xs text-slate-500">{page.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
