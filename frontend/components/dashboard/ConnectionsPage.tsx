'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import { ConnectionCardSkeleton } from '@/components/ui/skeleton';
import { Search, UserPlus, MessageCircle, Compass, Sparkles, Check, X, Clock, UserX } from 'lucide-react';

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

const ROLE_AVATAR: Record<string, { bg: string; color: string }> = {
  freelancer: { bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6' },
  entrepreneur: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  user: { bg: 'rgba(37,99,235,0.15)',         color: '#2563eb' },
};
const getRoleAvatar = (role: string) => ROLE_AVATAR[role?.toLowerCase()] ?? { bg: 'rgba(74,144,217,0.15)', color: '#4a90d9' };

const FilterBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200"
    style={active
      ? { background: 'linear-gradient(135deg, #4a90d9, #2563eb)', color: '#fff', boxShadow: '0 4px 12px rgba(74,144,217,0.3)' }
      : { background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0' }}
  >
    {children}
  </button>
);

export default function ConnectionsPage({ user, setActiveTab }: ConnectionsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'friends' | 'suggested'>('all');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [limitError, setLimitError] = useState<string | null>(null);

  const fetchConnectionsData = async (searchStr?: string) => {
    setIsLoading(true);
    try {
      const friends = await api.connections.friends();
      const sentRequests = await api.connections.sent();
      const receivedRequests = await api.connections.pending();
      setPendingRequests(receivedRequests);

      let rawProfiles = [];
      const trimmedSearch = searchStr ? searchStr.trim() : '';
      if (trimmedSearch) {
        const res = await api.freelancers.list({ search: trimmedSearch });
        rawProfiles = res.map((p: any) => ({ user: p.user, title: p.title }));
      } else {
        const res = await api.users.suggestions();
        rawProfiles = res.map((u: any) => ({ user: u, title: u.freelancerProfile?.title || u.entrepreneurProfile?.companyName }));
      }

      const friendsMap = new Map(friends.map((f: any) => [f.id, f]));
      const sentMap = new Map(sentRequests.map((r: any) => [r.receiverId, r]));
      const receivedMap = new Map(receivedRequests.map((r: any) => [r.senderId, r]));

      const mapped: Connection[] = rawProfiles
        .map((p: any) => {
          const profileUserId = p.user.id;
          let status: Connection['status'] = 'suggested';
          let requestId: string | undefined;
          if (friendsMap.has(profileUserId)) { status = 'connected'; }
          else if (sentMap.has(profileUserId)) { status = 'pending_sent'; requestId = (sentMap.get(profileUserId) as any).id; }
          else if (receivedMap.has(profileUserId)) { status = 'pending_received'; requestId = (receivedMap.get(profileUserId) as any).id; }
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
    const handler = setTimeout(() => { fetchConnectionsData(searchTerm); }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, user]);

  const handleConnect = async (receiverId: string) => {
    try {
      setLimitError(null);
      await api.connections.sendRequest(receiverId);
      await fetchConnectionsData();
    } catch (err: any) {
      if (err.message?.includes('Limite atteinte')) setLimitError(err.message);
    }
  };
  const handleCoffeeChat = async (receiverId: string) => {
    try {
      setLimitError(null);
      await api.connections.sendRequest(receiverId, { isCoffee: true, message: "Bonjour ! J'aimerais échanger autour d'un café virtuel ☕" });
      await fetchConnectionsData();
    } catch (err: any) {
      if (err.message?.includes('Limite atteinte')) setLimitError(err.message);
    }
  };
  const handleAcceptRequest = async (requestId: string) => {
    try { await api.connections.acceptRequest(requestId); await fetchConnectionsData(); } catch {}
  };
  const handleDeclineRequest = async (requestId: string) => {
    try { await api.connections.declineRequest(requestId); await fetchConnectionsData(); } catch {}
  };
  const handleRemoveConnection = async (friendId: string) => {
    if (!confirm('Retirer ce membre de vos connexions ?')) return;
    try { await api.connections.remove(friendId); await fetchConnectionsData(); } catch {}
  };
  const handleMessage = async (targetUserId: string) => {
    try { await api.messaging.startConversation(targetUserId); setActiveTab?.('messages'); } catch {}
  };

  const filteredConnections = connections.filter(c => {
    const q = searchTerm.toLowerCase();
    const match = c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
    if (activeFilter === 'friends') return match && c.status === 'connected';
    if (activeFilter === 'suggested') return match && c.status === 'suggested';
    return match;
  });

  const connectedCount = connections.filter(c => c.status === 'connected').length;
  const suggestedCount = connections.filter(c => c.status === 'suggested').length;

  return (
    <div className="min-h-full p-6" style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #f7f9fc 100%)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-foreground mb-1">Réseau GoConnexions</h1>
            <p className="text-[13px]" style={{ color: '#64748b' }}>
              Découvrez des professionnels, élargissez votre cercle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: 'Connexions', value: connectedCount, color: '#2563eb' },
              { label: 'Suggestions', value: suggestedCount, color: '#4a90d9' },
            ].map(s => (
              <div key={s.label} className="text-center px-4 py-2.5 rounded-xl"
                style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(26,35,50,0.05)' }}>
                <p className="text-[18px] font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Limite connexions atteinte */}
        {limitError && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.3)' }}>
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold" style={{ color: '#92400e' }}>{limitError}</p>
              <a href="/pricing"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                Voir les offres →
              </a>
            </div>
            <button onClick={() => setLimitError(null)} className="flex-shrink-0 text-amber-400 hover:text-amber-600 text-lg leading-none">✕</button>
          </div>
        )}

        {/* Pending requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-6 rounded-2xl overflow-hidden"
            style={{ background: '#fff', border: '1px solid rgba(74,144,217,0.2)', boxShadow: '0 4px 20px rgba(74,144,217,0.08)' }}>
            <div className="px-5 py-3.5 flex items-center gap-2.5"
              style={{ background: 'rgba(74,144,217,0.06)', borderBottom: '1px solid rgba(74,144,217,0.12)' }}>
              <div className="relative flex-shrink-0">
                <Clock size={15} style={{ color: '#4a90d9' }} />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              </div>
              <h2 className="text-[13px] font-bold text-foreground">
                Demandes de connexion en attente
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingRequests.map((req) => {
                const ra = getRoleAvatar(req.sender.role);
                return (
                  <div key={req.id} className="flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 hover:shadow-sm"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
                        style={{ background: ra.bg, color: ra.color }}>
                        {req.sender.firstName[0]}{req.sender.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-foreground truncate">
                          {req.sender.firstName} {req.sender.lastName}
                        </p>
                        <p className="text-[11px] capitalize" style={{ color: '#94a3b8' }}>
                          {req.sender.role?.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <button onClick={() => handleAcceptRequest(req.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                        style={{ background: 'rgba(37,99,235,0.15)', color: '#2563eb' }}>
                        <Check size={14} />
                      </button>
                      <button onClick={() => handleDeclineRequest(req.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search + Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
              <Search size={15} />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, compétence, rôle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] font-medium outline-none transition-all duration-200"
              style={{ background: '#fff', border: '1.5px solid #e2e8f0', color: '#1a2332' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#4a90d9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
          <div className="flex gap-2">
            <FilterBtn active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
              Tous ({connections.length})
            </FilterBtn>
            <FilterBtn active={activeFilter === 'friends'} onClick={() => setActiveFilter('friends')}>
              Mes connexions ({connectedCount})
            </FilterBtn>
            <FilterBtn active={activeFilter === 'suggested'} onClick={() => setActiveFilter('suggested')}>
              Suggestions ({suggestedCount})
            </FilterBtn>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <ConnectionCardSkeleton key={i} />)}
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
            style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
              style={{ background: 'rgba(74,144,217,0.08)' }}>
              <Compass size={24} style={{ color: '#4a90d9' }} />
            </div>
            <p className="text-[14px] font-bold text-foreground mb-1">Aucun profil trouvé</p>
            <p className="text-[12px] text-center max-w-xs" style={{ color: '#94a3b8' }}>
              Modifiez votre recherche ou vos filtres.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredConnections.map((conn, idx) => {
              const ra = getRoleAvatar(conn.company ?? '');
              return (
                <div key={conn.id}
                  className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group"
                  style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(26,35,50,0.05)',
                    animationDelay: `${idx * 0.05}s` }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px rgba(26,35,50,0.1)`;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(26,35,50,0.05)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Card top banner */}
                  <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${ra.color}, ${ra.color}66)` }} />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                          style={{ background: ra.bg, color: ra.color }}>
                          {conn.name[0]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[13px] font-semibold text-foreground truncate">{conn.name}</h3>
                          <p className="text-[11px] truncate mt-0.5" style={{ color: '#94a3b8' }}>{conn.role}</p>
                        </div>
                      </div>
                      {conn.status === 'connected' && (
                        <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: 'rgba(37,99,235,0.12)', color: '#2563eb' }}>
                          <Sparkles size={9} /> Connecté
                        </span>
                      )}
                    </div>

                    {/* Info row */}
                    <div className="flex items-center gap-4 mb-4 py-3 rounded-xl px-3"
                      style={{ background: '#f8fafc' }}>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Rôle</p>
                        <p className="text-[12px] font-semibold text-foreground capitalize">{conn.company}</p>
                      </div>
                      {conn.location && (
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Lieu</p>
                          <p className="text-[12px] font-semibold text-foreground">{conn.location}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                      {conn.status === 'connected' ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleMessage(conn.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #4a90d9, #2563eb)', boxShadow: '0 3px 10px rgba(74,144,217,0.25)' }}>
                            <MessageCircle size={13} /> Message
                          </button>
                          <button onClick={() => handleRemoveConnection(conn.id)}
                            className="px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 hover:scale-105"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                            <UserX size={13} />
                          </button>
                        </div>
                      ) : conn.status === 'pending_sent' ? (
                        <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold"
                          style={{ background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                          <Clock size={13} /> En attente...
                        </div>
                      ) : conn.status === 'pending_received' ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleAcceptRequest(conn.requestId!)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all duration-200 hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                            <Check size={13} /> Accepter
                          </button>
                          <button onClick={() => handleDeclineRequest(conn.requestId!)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all duration-200 hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                            <X size={13} /> Refuser
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => handleConnect(conn.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #4a90d9, #2563eb)', boxShadow: '0 3px 10px rgba(74,144,217,0.25)' }}>
                            <UserPlus size={13} /> Se connecter
                          </button>
                          <button onClick={() => handleCoffeeChat(conn.id)}
                            title="Proposer un café virtuel"
                            className="px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 hover:scale-105"
                            style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)' }}>
                            ☕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
