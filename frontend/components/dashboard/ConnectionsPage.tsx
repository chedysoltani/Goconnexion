'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import { Search, UserPlus, MessageCircle, MoreHorizontal, Compass, Sparkles } from 'lucide-react';

interface ConnectionsPageProps {
  user: User | null;
  setActiveTab?: (tab: 'feed' | 'connections' | 'messages' | 'projects' | 'earnings' | 'analytics' | 'incubator') => void;
}

interface Connection {
  id: string;
  name: string;
  role: string;
  avatar: string;
  company?: string;
  location?: string;
  connectedSince?: Date;
  status: 'connected' | 'suggested';
}

export default function ConnectionsPage({ user, setActiveTab }: ConnectionsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'suggested'>('all');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      // Load actual profiles list
      const profiles = await api.freelancers.list();
      
      // Map profiles to our Connection interface
      const mapped: Connection[] = profiles
        .map((p: any) => ({
          id: p.user.id,
          name: `${p.user.firstName} ${p.user.lastName}`,
          role: p.title || 'Professionnel',
          avatar: p.user.avatarUrl || '',
          bio: p.bio,
          company: p.user.role === 'FREELANCER' ? 'Freelancer' : 'Entrepreneur',
          location: 'France',
          // Randomize status for UI testing variety
          status: p.user.id === '1' ? 'connected' : 'suggested',
        }))
        .filter((c: any) => c.id !== user?.id);

      setConnections(mapped);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  const handleConnect = (id: string) => {
    // Optimistic status change
    setConnections(prev =>
      prev.map(c => c.id === id ? { ...c, status: 'connected', connectedSince: new Date() } : c)
    );
  };

  const handleMessage = async (targetUserId: string) => {
    try {
      // Start or retrieve conversation
      await api.messaging.startConversation(targetUserId);
      if (setActiveTab) {
        setActiveTab('messages');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          connection.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          connection.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'suggested') {
      return matchesSearch && connection.status === 'suggested';
    }
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col h-full">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Réseau GoConnexions</h1>
        <p className="text-xs text-slate-500">Découvrez des entrepreneurs inspirants, recrutez des freelancers qualifiés et élargissez votre cercle humain.</p>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher des profils (ex: React, designer...)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-colors text-xs bg-slate-50"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeFilter === 'all'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tous ({connections.length})
            </button>
            <button
              onClick={() => setActiveFilter('suggested')}
              className={`px-3 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeFilter === 'suggested'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Suggestions ({connections.filter(c => c.status === 'suggested').length})
            </button>
          </div>
        </div>
      </div>

      {/* Connections Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted">Chargement du réseau...</p>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Compass className="text-slate-400" size={32} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Aucun profil trouvé</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Essayez de modifier votre recherche ou vos filtres pour explorer d'autres connexions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {filteredConnections.map((connection) => (
              <div key={connection.id} className="bg-white rounded-2xl border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold ring-2 ring-slate-100 flex-shrink-0">
                        {connection.name[0]}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-xs truncate">{connection.name}</h3>
                        <p className="text-[10px] text-slate-500 truncate">{connection.role}</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>

                  {/* Company and Location */}
                  <div className="mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] leading-relaxed text-slate-600">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-slate-800">Rôle :</span>
                      <span className="capitalize">{connection.company}</span>
                    </div>
                    {connection.location && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">Localisation :</span>
                        <span>{connection.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Connected Date Info */}
                  {connection.status === 'connected' && connection.connectedSince && (
                    <div className="mb-4 text-[9px] text-slate-400 flex items-center gap-1">
                      <Sparkles size={10} className="text-amber-400" />
                      <span>Connecté le {new Date(connection.connectedSince).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                    {connection.status === 'connected' ? (
                      <>
                        <button
                          onClick={() => handleMessage(connection.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-accent text-white rounded-lg hover:bg-indigo-600 transition-colors font-bold text-[10px]"
                        >
                          <MessageCircle size={12} />
                          <span>Message</span>
                        </button>
                        <button className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-[10px] font-semibold">
                          Profil
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleConnect(connection.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-accent text-white rounded-lg hover:bg-indigo-600 transition-colors font-bold text-[10px]"
                        >
                          <UserPlus size={12} />
                          <span>Se Connecter</span>
                        </button>
                        <button className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-[10px] font-semibold">
                          Ignorer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
