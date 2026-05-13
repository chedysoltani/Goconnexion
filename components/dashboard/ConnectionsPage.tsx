'use client';

import React, { useState } from 'react';
import { User } from '@/types/auth';
import { Search, UserPlus, MessageCircle, MoreHorizontal } from 'lucide-react';

interface ConnectionsPageProps {
  user: User | null;
}

interface Connection {
  id: string;
  name: string;
  role: string;
  avatar: string;
  company?: string;
  location?: string;
  connectedSince?: Date;
  mutualConnections: number;
  status: 'connected' | 'pending' | 'suggested';
}

export default function ConnectionsPage({ user }: ConnectionsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'suggested'>('all');

  const connections: Connection[] = [
    {
      id: '1',
      name: 'Sophie Martin',
      role: 'UX Designer',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
      company: 'Design Studio Pro',
      location: 'Paris, France',
      connectedSince: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      mutualConnections: 12,
      status: 'connected'
    },
    {
      id: '2',
      name: 'Thomas Bernard',
      role: 'Développeur Full Stack',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      company: 'Tech Innovations',
      location: 'Lyon, France',
      connectedSince: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      mutualConnections: 8,
      status: 'connected'
    },
    {
      id: '3',
      name: 'Marie Laurent',
      role: 'Développeuse Frontend',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
      company: 'Freelance',
      location: 'Marseille, France',
      connectedSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      mutualConnections: 15,
      status: 'connected'
    },
    {
      id: '4',
      name: 'David Chen',
      role: 'Expert Cybersécurité',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
      company: 'SecureTech Solutions',
      location: 'Toulouse, France',
      connectedSince: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      mutualConnections: 6,
      status: 'connected'
    },
    {
      id: '5',
      name: 'Claire Dubois',
      role: 'Product Manager',
      avatar: 'https://images.unsplash.com/photo-1494790108752-4fee59d1aefa?w=400&h=400&fit=crop&crop=face',
      company: 'StartupHub',
      location: 'Nantes, France',
      mutualConnections: 4,
      status: 'suggested'
    },
    {
      id: '6',
      name: 'Alexandre Petit',
      role: 'Data Scientist',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4?w=400&h=400&fit=crop&crop=face',
      company: 'DataLab',
      location: 'Bordeaux, France',
      mutualConnections: 7,
      status: 'suggested'
    }
  ];

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'suggested') {
      return matchesSearch && connection.status === 'suggested';
    }
    if (activeFilter === 'recent') {
      return matchesSearch && connection.status === 'connected' && 
             connection.connectedSince && connection.connectedSince > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    return matchesSearch;
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Aujourd\'hui';
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffInDays / 30)} mois`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Mes Connexions</h1>
        <p className="text-sm text-slate-600">Gérez votre réseau professionnel et découvrez de nouvelles opportunités</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher des connexions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Toutes ({connections.filter(c => c.status === 'connected').length})
            </button>
            <button
              onClick={() => setActiveFilter('recent')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'recent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Récentes
            </button>
            <button
              onClick={() => setActiveFilter('suggested')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'suggested'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Suggestions ({connections.filter(c => c.status === 'suggested').length})
            </button>
          </div>
        </div>
      </div>

      {/* Connections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConnections.map((connection) => (
          <div key={connection.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={connection.avatar}
                    alt={connection.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <h3 className="font-medium text-slate-900 text-sm">{connection.name}</h3>
                    <p className="text-xs text-slate-600">{connection.role}</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Company and Location */}
              <div className="mb-3">
                {connection.company && (
                  <p className="text-xs text-slate-700 mb-1">{connection.company}</p>
                )}
                {connection.location && (
                  <p className="text-xs text-slate-500">{connection.location}</p>
                )}
              </div>

              {/* Mutual Connections */}
              {connection.mutualConnections > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-600">
                    {connection.mutualConnections} connexion{connection.mutualConnections > 1 ? 's' : ''} en commun
                  </p>
                </div>
              )}

              {/* Status */}
              {connection.status === 'connected' && connection.connectedSince && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500">
                    Connecté {formatTimeAgo(connection.connectedSince)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {connection.status === 'connected' ? (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs">
                      <MessageCircle size={14} />
                      Message
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs">
                      Voir profil
                    </button>
                  </>
                ) : (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs">
                      <UserPlus size={14} />
                      Connecter
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs">
                      Ignorer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredConnections.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune connexion trouvée</h3>
            <p className="text-slate-600">
              Essayez de modifier votre recherche ou vos filtres pour trouver des connexions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
