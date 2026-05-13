'use client';

import React, { useState } from 'react';
import { User } from '@/types/auth';
import { Search, TrendingUp, DollarSign, Calendar, Download, MoreHorizontal } from 'lucide-react';

interface EarningsPageProps {
  user: User | null;
}

interface Earning {
  id: string;
  source: string;
  amount: number;
  date: Date;
  status: 'paid' | 'pending' | 'overdue';
  client: {
    name: string;
    company: string;
  };
  project?: string;
  invoice?: string;
}

export default function EarningsPage({ user }: EarningsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const earnings: Earning[] = [
    {
      id: '1',
      source: 'Projet E-commerce',
      amount: 8500,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'paid',
      client: {
        name: 'Marie Laurent',
        company: 'FinTech Solutions'
      },
      project: 'Plateforme E-commerce Fintech',
      invoice: 'INV-2024-001'
    },
    {
      id: '2',
      source: 'Application Mobile',
      amount: 6200,
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      status: 'paid',
      client: {
        name: 'David Chen',
        company: 'HealthTech Inc'
      },
      project: 'Application Mobile Santé',
      invoice: 'INV-2024-002'
    },
    {
      id: '3',
      source: 'Refonte Site Corporate',
      amount: 4500,
      date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      status: 'pending',
      client: {
        name: 'Sophie Martin',
        company: 'Design Studio Pro'
      },
      project: 'Refonte Site Corporate',
      invoice: 'INV-2024-003'
    },
    {
      id: '4',
      source: 'Consulting SEO',
      amount: 2800,
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      status: 'paid',
      client: {
        name: 'Thomas Bernard',
        company: 'Tech Innovations'
      },
      project: 'Dashboard Analytics IA',
      invoice: 'INV-2024-004'
    },
    {
      id: '5',
      source: 'Maintenance Web',
      amount: 1500,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'overdue',
      client: {
        name: 'Alexandre Petit',
        company: 'Marketing Agency'
      },
      project: 'Campagne Marketing Digital',
      invoice: 'INV-2024-005'
    }
  ];

  const filteredEarnings = earnings.filter(earning => {
    const matchesSearch = earning.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         earning.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         earning.project?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'paid') {
      return matchesSearch && earning.status === 'paid';
    }
    if (activeFilter === 'pending') {
      return matchesSearch && (earning.status === 'pending' || earning.status === 'overdue');
    }
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const totalEarnings = earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  const pendingEarnings = earnings.filter(e => e.status === 'pending' || e.status === 'overdue').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Revenus</h1>
        <p className="text-sm text-slate-600">Suivez vos revenus, factures et paiements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Revenus</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(totalEarnings)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Calendar size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">En Attente</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(pendingEarnings)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Croissance Mois</p>
              <p className="text-lg font-bold text-green-600">+12.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher des revenus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveFilter('paid')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                activeFilter === 'paid'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Payés
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                activeFilter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              En attente
            </button>
          </div>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-3 font-medium text-slate-700 text-xs">Source</th>
                <th className="text-left p-3 font-medium text-slate-700 text-xs">Client</th>
                <th className="text-left p-3 font-medium text-slate-700 text-xs">Montant</th>
                <th className="text-left p-3 font-medium text-slate-700 text-xs">Date</th>
                <th className="text-left p-3 font-medium text-slate-700 text-xs">Statut</th>
                <th className="text-left p-3 font-medium text-slate-700 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEarnings.map((earning) => (
                <tr key={earning.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{earning.source}</p>
                      {earning.project && (
                        <p className="text-xs text-slate-500">{earning.project}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{earning.client.name}</p>
                      <p className="text-xs text-slate-500">{earning.client.company}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold text-slate-900 text-sm">{formatCurrency(earning.amount)}</p>
                  </td>
                  <td className="p-3">
                    <p className="text-sm text-slate-600">{formatDate(earning.date)}</p>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(earning.status)}`}>
                      {earning.status === 'paid' ? 'Payé' :
                       earning.status === 'pending' ? 'En attente' : 'En retard'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {earning.invoice && (
                        <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                          {earning.invoice}
                        </button>
                      )}
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEarnings.length === 0 && (
          <div className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun revenu trouvé</h3>
              <p className="text-slate-600">
                Essayez de modifier votre recherche pour trouver des revenus.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
