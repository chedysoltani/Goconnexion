'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import {
  Search,
  UserPlus,
  MessageCircle,
  MoreHorizontal,
  Compass,
  Sparkles,
  Check,
  X,
  Clock,
  UserX,
} from 'lucide-react';

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
  status: 'connected' | 'pending_sent' | 'pending_received' | 'suggested';
  requestId?: string;
}

export default function ConnectionsPage({ user, setActiveTab }: ConnectionsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'friends' | 'suggested'>('all');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConnectionsData = async (searchStr?: string) => {
    setIsLoading(true);
    try {
      // 1. Get all active friends
      const friends = await api.connections.friends();
      // 2. Get sent requests
      const sentRequests = await api.connections.sent();
      // 3. Get pending received requests
      const receivedRequests = await api.connections.pending();
      setPendingRequests(receivedRequests);

      // 4. Get intelligent suggestions or search profiles
      let rawProfiles = [];
      const trimmedSearch = searchStr ? searchStr.trim() : '';
      if (trimmedSearch) {
        const res = await api.freelancers.list({ search: trimmedSearch });
        rawProfiles = res.map((p: any) => ({
          user: p.user,
          title: p.title,
        }));
      } else {
        const res = await api.users.suggestions();
        rawProfiles = res.map((u: any) => ({
          user: u,
          title: u.freelancerProfile?.title || u.entrepreneurProfile?.companyName,
        }));
      }

      // Create maps for super fast checks
      const friendsMap = new Map(friends.map((f: any) => [f.id, f]));
      const sentMap = new Map(sentRequests.map((r: any) => [r.receiverId, r]));
      const receivedMap = new Map(receivedRequests.map((r: any) => [r.senderId, r]));

      // Map profiles
      const mapped: Connection[] = rawProfiles
        .map((p: any) => {
          const profileUserId = p.user.id;
          let status: Connection['status'] = 'suggested';
          let requestId: string | undefined = undefined;

          if (friendsMap.has(profileUserId)) {
            status = 'connected';
          } else if (sentMap.has(profileUserId)) {
            status = 'pending_sent';
            requestId = (sentMap.get(profileUserId) as any).id;
          } else if (receivedMap.has(profileUserId)) {
            status = 'pending_received';
            requestId = (receivedMap.get(profileUserId) as any).id;
          }

          return {
            id: profileUserId,
            name: `${p.user.firstName} ${p.user.lastName}`,
            role: p.title || 'Professionnel GoConnexions',
            avatar: p.user.avatarUrl || '',
            company: p.user.role === 'FREELANCER' ? 'Freelancer' : 'Entrepreneur',
            location: 'France',
            status,
            requestId,
          };
        })
        .filter((c: any) => c.id !== user?.id);

      setConnections(mapped);
    } catch (error) {
      console.error('Error fetching connections data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchConnectionsData(searchTerm);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, user]);

  const handleConnect = async (receiverId: string) => {
    try {
      await api.connections.sendRequest(receiverId);
      await fetchConnectionsData();
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.connections.acceptRequest(requestId);
      await fetchConnectionsData();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await api.connections.declineRequest(requestId);
      await fetchConnectionsData();
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleRemoveConnection = async (friendId: string) => {
    if (!confirm('Voulez-vous vraiment retirer ce membre de vos connexions ?')) return;
    try {
      await api.connections.remove(friendId);
      await fetchConnectionsData();
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const handleMessage = async (targetUserId: string) => {
    try {
      await api.messaging.startConversation(targetUserId);
      if (setActiveTab) {
        setActiveTab('messages');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const filteredConnections = connections.filter(connection => {
    const matchesSearch =
      connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.company?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === 'friends') {
      return matchesSearch && connection.status === 'connected';
    }
    if (activeFilter === 'suggested') {
      return matchesSearch && connection.status === 'suggested';
    }
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Réseau GoConnexions</h1>
        <p className="text-xs text-slate-500">
          Découvrez des entrepreneurs inspirants, recrutez des freelancers qualifiés et élargissez votre cercle professionnel.
        </p>
      </div>

      {/* Pending Requests Banner */}
      {pendingRequests.length > 0 && (
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-shrink-0">
          <h2 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <Clock size={14} className="text-accent animate-pulse" />
            <span>Demandes de connexion en attente ({pendingRequests.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-[10px] font-bold">
                    {req.sender.firstName[0]}{req.sender.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-950 truncate">
                      {req.sender.firstName} {req.sender.lastName}
                    </p>
                    <p className="text-[9px] text-slate-500 capitalize truncate">
                      {req.sender.role.toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center justify-center"
                    title="Accepter"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(req.id)}
                    className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center"
                    title="Refuser"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              onClick={() => setActiveFilter('friends')}
              className={`px-3 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeFilter === 'friends'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Mes Connexions ({connections.filter(c => c.status === 'connected').length})
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
            <p className="text-xs text-muted">Mise à jour du réseau...</p>
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
              <div
                key={connection.id}
                className="bg-white rounded-2xl border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
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

                  {/* Connection badge status */}
                  {connection.status === 'connected' && (
                    <div className="mb-4 text-[9px] text-slate-400 flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100 self-start">
                      <Sparkles size={10} className="text-emerald-500" />
                      <span>Connecté</span>
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
                        <button
                          onClick={() => handleRemoveConnection(connection.id)}
                          className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-[10px] font-bold flex items-center justify-center gap-1"
                          title="Retirer la connexion"
                        >
                          <UserX size={12} />
                          <span>Retirer</span>
                        </button>
                      </>
                    ) : connection.status === 'pending_sent' ? (
                      <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[10px] font-bold">
                        <Clock size={12} />
                        <span>En attente...</span>
                      </div>
                    ) : connection.status === 'pending_received' ? (
                      <div className="flex-1 flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(connection.requestId!)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-bold text-[10px]"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(connection.requestId!)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-bold text-[10px]"
                        >
                          Refuser
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleConnect(connection.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-accent text-white rounded-lg hover:bg-indigo-600 transition-colors font-bold text-[10px]"
                        >
                          <UserPlus size={12} />
                          <span>Se Connecter</span>
                        </button>
                        <button className="px-3 py-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors text-[10px] font-semibold">
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
