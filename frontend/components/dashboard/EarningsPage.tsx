'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import { Search, TrendingUp, DollarSign, Calendar, MoreHorizontal, ArrowUpRight } from 'lucide-react';

interface EarningsPageProps {
  user: User | null;
}

interface Earning {
  id: string;
  source: string;
  amount: number;
  date: Date;
  status: 'paid' | 'pending' | 'overdue';
  client: { name: string; company: string };
  project?: string;
  invoice?: string;
}

const STATUS_CONFIG = {
  paid:    { label: 'Payé',       color: '#10b981', bg: 'rgba(16,185,129,0.1)',  dot: '#10b981' },
  pending: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  dot: '#f59e0b' },
  overdue: { label: 'En retard',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   dot: '#ef4444' },
};

const STAT_CARDS = (total: number, pending: number, fmt: (n: number) => string) => [
  {
    label: 'Revenus encaissés',
    value: fmt(total),
    sub: '+12.5% ce mois',
    subPositive: true,
    icon: <DollarSign size={20} color="#10b981" />,
    iconBg: 'rgba(16,185,129,0.12)',
    accent: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))',
  },
  {
    label: 'En attente de paiement',
    value: fmt(pending),
    sub: '2 factures actives',
    subPositive: false,
    icon: <Calendar size={20} color="#f59e0b" />,
    iconBg: 'rgba(245,158,11,0.12)',
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))',
  },
  {
    label: 'Croissance mensuelle',
    value: '+12.5%',
    sub: 'vs mois dernier',
    subPositive: true,
    icon: <TrendingUp size={20} color="#4a90d9" />,
    iconBg: 'rgba(74,144,217,0.12)',
    accent: '#4a90d9',
    gradient: 'linear-gradient(135deg, rgba(74,144,217,0.08), rgba(74,144,217,0.02))',
  },
];

export default function EarningsPage({ user }: EarningsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.analytics.earnings();
        setEarnings(
          (data.earnings ?? []).map((e: any) => ({
            ...e,
            date: new Date(e.date),
          })),
        );
        setTotalPaid(data.totalPaid ?? 0);
        setTotalPending(data.totalPending ?? 0);
      } catch {
        // silencieux
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filteredEarnings = earnings.filter((e) => {
    const q = searchTerm.toLowerCase();
    const match =
      e.source.toLowerCase().includes(q) ||
      e.client.name.toLowerCase().includes(q) ||
      (e.project?.toLowerCase().includes(q) ?? false);
    if (activeFilter === 'paid') return match && e.status === 'paid';
    if (activeFilter === 'pending') return match && (e.status === 'pending' || e.status === 'overdue');
    return match;
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);

  const FILTERS: { key: 'all' | 'paid' | 'pending'; label: string; accent: string }[] = [
    { key: 'all',     label: 'Tous',       accent: '#4a90d9' },
    { key: 'paid',    label: 'Payés',      accent: '#10b981' },
    { key: 'pending', label: 'En attente', accent: '#f59e0b' },
  ];

  return (
    <div
      className="min-h-full p-6 md:p-8"
      style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #f7f9fc 100%)' }}
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1a2332' }}>Revenus</h1>
            <p className="text-[13px] mt-1" style={{ color: '#64748b' }}>
              Suivez vos revenus, factures et paiements en temps réel
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4a90d9, #2563eb)',
              boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
            }}
          >
            <ArrowUpRight size={14} />
            Exporter
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STAT_CARDS(totalPaid, totalPending, formatCurrency).map((card, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 transition-all duration-200"
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(26,35,50,0.04)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = `0 8px 28px rgba(26,35,50,0.08), 0 0 0 1px ${card.accent}20`;
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = '0 2px 12px rgba(26,35,50,0.04)';
                el.style.transform = 'translateY(0)';
              }}
            >
              {/* Top accent line */}
              <div
                className="h-0.5 rounded-full mb-4"
                style={{ background: `linear-gradient(90deg, ${card.accent}, transparent)` }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#1a2332' }}>{card.value}</p>
                  <p
                    className="text-[11px] font-medium mt-1"
                    style={{ color: card.subPositive ? '#10b981' : '#94a3b8' }}
                  >
                    {card.subPositive ? '↑ ' : ''}{card.sub}
                  </p>
                </div>
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: card.iconBg }}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div
          className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3"
          style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(26,35,50,0.03)' }}
        >
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Rechercher par source, client, projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '13px',
                color: '#1a2332',
                outline: 'none',
              }}
              className="w-full pl-9 pr-4 py-2.5 transition-all duration-200"
              onFocus={e => {
                e.currentTarget.style.borderColor = '#4a90d9';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className="px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-200"
                style={
                  activeFilter === f.key
                    ? {
                        background: f.accent,
                        color: '#fff',
                        boxShadow: `0 4px 10px ${f.accent}40`,
                      }
                    : {
                        background: '#f8fafc',
                        color: '#64748b',
                        border: '1.5px solid #e2e8f0',
                      }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Earnings Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(26,35,50,0.04)' }}
        >
          {/* Table Header */}
          <div
            className="grid grid-cols-[2fr_2fr_1.2fr_1.2fr_1fr_auto] gap-4 px-5 py-3.5"
            style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
          >
            {['Source / Projet', 'Client', 'Montant', 'Date', 'Statut', 'Facture'].map((h) => (
              <span key={h} className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredEarnings.length === 0 ? (
              <div className="p-12 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(74,144,217,0.08)' }}
                >
                  <Search size={22} style={{ color: '#4a90d9' }} />
                </div>
                <p className="text-[14px] font-semibold mb-1" style={{ color: '#1a2332' }}>
                  Aucun revenu pour l'instant
                </p>
                <p className="text-[12px]" style={{ color: '#94a3b8' }}>
                  Vos candidatures acceptées apparaîtront ici.
                </p>
              </div>
            ) : (
              filteredEarnings.map((earning) => {
                const st = STATUS_CONFIG[earning.status];
                return (
                  <div
                    key={earning.id}
                    className="grid grid-cols-[2fr_2fr_1.2fr_1.2fr_1fr_auto] gap-4 items-center px-5 py-4 transition-colors"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {/* Source */}
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: '#1a2332' }}>
                        {earning.source}
                      </p>
                      {earning.project && (
                        <p className="text-[11px] mt-0.5" style={{ color: '#94a3b8' }}>
                          {earning.project}
                        </p>
                      )}
                    </div>

                    {/* Client */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: 'rgba(74,144,217,0.1)', color: '#4a90d9' }}
                      >
                        {earning.client.name[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: '#1a2332' }}>
                          {earning.client.name}
                        </p>
                        <p className="text-[11px]" style={{ color: '#94a3b8' }}>
                          {earning.client.company}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <p className="text-[14px] font-bold" style={{ color: '#1a2332' }}>
                      {formatCurrency(earning.amount)}
                    </p>

                    {/* Date */}
                    <p className="text-[12px]" style={{ color: '#64748b' }}>
                      {formatDate(earning.date)}
                    </p>

                    {/* Status */}
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold w-fit"
                      style={{ background: st.bg, color: st.color }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.dot }} />
                      {st.label}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {earning.invoice && (
                        <button
                          className="text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors"
                          style={{ color: '#4a90d9', background: 'rgba(74,144,217,0.08)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(74,144,217,0.15)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(74,144,217,0.08)'; }}
                        >
                          {earning.invoice}
                        </button>
                      )}
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: '#94a3b8' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#1a2332'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
                      >
                        <MoreHorizontal size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
