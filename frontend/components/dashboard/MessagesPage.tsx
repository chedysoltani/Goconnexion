'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { Search, Send, Phone, Video, MoreHorizontal, Circle, UserPlus, MessageSquare } from 'lucide-react';

interface MessagesPageProps {
  user: User | null;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    firstName: string;
    lastName: string;
  };
}

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  freelancerProfile?: { title?: string };
}

interface Conversation {
  id: string;
  participants: Array<{
    user: Participant;
  }>;
  messages: Message[];
  updatedAt: string;
}

const ROLE_AVATAR: Record<string, { bg: string; color: string }> = {
  FREELANCER:   { bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6' },
  ENTREPRENEUR: { bg: 'rgba(139,92,246,0.15)',  color: '#8b5cf6' },
  USER:         { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
};

function getRoleAvatar(role: string) {
  return ROLE_AVATAR[(role || 'USER').toUpperCase()] || ROLE_AVATAR.USER;
}

export default function MessagesPage({ user }: MessagesPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [availableUsers, setAvailableUsers] = useState<Participant[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchConversations = async () => {
    try {
      const data = await api.messaging.conversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.freelancers.list();
      const users = data.map((p: any) => p.user).filter((u: any) => u.id !== user?.id);
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('newMessage', (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      fetchConversations();
    });

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (!socketRef.current || !selectedConversationId) return;
    const socket = socketRef.current;
    socket.emit('joinConversation', { conversationId: selectedConversationId });

    const loadMessages = async () => {
      try {
        const data = await api.messaging.messages(selectedConversationId);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    loadMessages();

    return () => { socket.emit('leaveConversation', { conversationId: selectedConversationId }); };
  }, [selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = newMessage.trim();
    if (!content || !selectedConversationId) return;
    setNewMessage('');
    try {
      const saved = await api.messaging.sendMessage(selectedConversationId, content);
      // Affichage immédiat — le socket peut arriver après, la déduplication l'ignore
      if (saved?.id) {
        setMessages(prev => prev.some(m => m.id === saved.id) ? prev : [...prev, saved]);
      } else {
        // fallback : recharger la liste
        const data = await api.messaging.messages(selectedConversationId);
        setMessages(data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(content); // remet le texte si erreur
    }
  };

  const handleStartNewConversation = async (targetUserId: string) => {
    try {
      const conversation = await api.messaging.startConversation(targetUserId);
      await fetchConversations();
      setSelectedConversationId(conversation.id);
      setShowNewChatModal(false);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const getSelectedConv = () => conversations.find((c) => c.id === selectedConversationId);
  const getParticipantInfo = (conv: Conversation) => {
    const participant = conv.participants.find((p) => p.user.id !== user?.id);
    return participant?.user || { id: '', firstName: 'Inconnu', lastName: '', role: 'USER' };
  };

  const selectedConv = getSelectedConv();
  const activeParticipant = selectedConv ? getParticipantInfo(selectedConv) : null;

  const filteredConversations = conversations.filter((conv) => {
    const p = getParticipantInfo(conv);
    return `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-full relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #f7f9fc 100%)' }}>

      {/* Conversations Sidebar */}
      <div
        className={`${selectedConversationId ? 'hidden md:flex' : 'flex'} md:w-[340px] flex-col flex-shrink-0`}
        style={{
          background: '#fff',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '2px 0 12px rgba(26,35,50,0.04)',
        }}
      >
        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#1a2332' }}>Messages</h1>
              <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              title="Nouvelle conversation"
              style={{
                background: 'linear-gradient(135deg, #4a90d9, #2563eb)',
                boxShadow: '0 4px 12px rgba(74,144,217,0.35)',
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <UserPlus size={16} color="#fff" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Rechercher une discussion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#1a2332',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              className="w-full pl-9 pr-4 py-2.5 focus:border-accent"
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
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.15)' }}
              >
                <MessageSquare size={24} style={{ color: '#4a90d9' }} />
              </div>
              <h3 className="text-sm font-bold mb-1" style={{ color: '#1a2332' }}>Aucune discussion</h3>
              <p className="text-[11px] mb-4 leading-relaxed" style={{ color: '#64748b' }}>
                Commencez à échanger avec des professionnels de GoConnexions
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #4a90d9, #2563eb)',
                  boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
                }}
              >
                Nouvelle Discussion
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const p = getParticipantInfo(conv);
              const ra = getRoleAvatar(p.role);
              const lastMsg = conv.messages?.length > 0 ? conv.messages[conv.messages.length - 1] : null;
              const isActive = selectedConversationId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-150"
                  style={{
                    background: isActive ? 'rgba(74,144,217,0.06)' : 'transparent',
                    borderLeft: isActive ? '3px solid #4a90d9' : '3px solid transparent',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-[13px] font-bold"
                      style={{ background: ra.bg, color: ra.color }}
                    >
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                      style={{ background: '#10b981', border: '2px solid #fff' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[13px] font-semibold truncate" style={{ color: '#1a2332' }}>
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: '#94a3b8' }}>
                        {new Date(conv.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] truncate" style={{ color: '#64748b' }}>
                      {lastMsg ? lastMsg.content : 'Aucun message'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConv && activeParticipant ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div
            className="px-5 py-3.5 flex justify-between items-center flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid #e2e8f0',
              boxShadow: '0 1px 8px rgba(26,35,50,0.04)',
            }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversationId(null)}
                className="md:hidden px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                style={{ color: '#64748b', background: '#f1f5f9' }}
              >
                ← Retour
              </button>
              {(() => {
                const ra = getRoleAvatar(activeParticipant.role);
                return (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold"
                    style={{ background: ra.bg, color: ra.color }}
                  >
                    {activeParticipant.firstName[0]}{activeParticipant.lastName[0]}
                  </div>
                );
              })()}
              <div>
                <h3 className="text-[14px] font-semibold" style={{ color: '#1a2332' }}>
                  {activeParticipant.firstName} {activeParticipant.lastName}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
                  <span className="text-[10px] capitalize" style={{ color: '#64748b' }}>
                    En ligne · {(activeParticipant.role || 'USER').toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[
                { icon: <Phone size={15} />, title: 'Appel vocal' },
                { icon: <Video size={15} />, title: 'Appel vidéo' },
                { icon: <MoreHorizontal size={15} />, title: 'Plus d\'options' },
              ].map((action, i) => (
                <button
                  key={i}
                  title={action.title}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
                  style={{ color: '#64748b' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1a2332'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                >
                  {action.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-5 py-5 space-y-3"
            style={{
              background: 'linear-gradient(180deg, #f0f4f8 0%, #f7f9fc 100%)',
              backgroundImage: 'radial-gradient(circle, rgba(74,144,217,0.03) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          >
            {messages.map((message) => {
              const isOwn = message.senderId === user?.id;
              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-xs lg:max-w-md px-4 py-2.5 text-[13px] leading-relaxed"
                    style={{
                      borderRadius: isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      background: isOwn
                        ? 'linear-gradient(135deg, #4a90d9, #2563eb)'
                        : '#fff',
                      color: isOwn ? '#fff' : '#1a2332',
                      boxShadow: isOwn
                        ? '0 4px 12px rgba(74,144,217,0.3)'
                        : '0 2px 8px rgba(26,35,50,0.06), 0 0 0 1px #e2e8f0',
                    }}
                  >
                    <p>{message.content}</p>
                    <p
                      className="text-[10px] mt-1 text-right"
                      style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}
                    >
                      {new Date(message.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="px-4 py-3.5 flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px)',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200"
              style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
              onFocusCapture={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = '#4a90d9';
                el.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.1)';
              }}
              onBlurCapture={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = '#e2e8f0';
                el.style.boxShadow = 'none';
              }}
            >
              <input
                type="text"
                placeholder="Écrire un message en temps réel..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#1a2332',
                }}
                className="placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  background: newMessage.trim()
                    ? 'linear-gradient(135deg, #4a90d9, #2563eb)'
                    : '#e2e8f0',
                  boxShadow: newMessage.trim() ? '0 4px 10px rgba(74,144,217,0.35)' : 'none',
                  cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                <Send size={13} color={newMessage.trim() ? '#fff' : '#94a3b8'} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Empty Chat State */
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center p-8">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: 'rgba(74,144,217,0.08)',
                border: '1px solid rgba(74,144,217,0.15)',
                boxShadow: '0 8px 24px rgba(74,144,217,0.12)',
              }}
            >
              <MessageSquare size={32} style={{ color: '#4a90d9' }} />
            </div>
            <h3 className="text-base font-bold mb-2" style={{ color: '#1a2332' }}>
              Sélectionnez une discussion
            </h3>
            <p className="text-[13px] leading-relaxed max-w-xs mx-auto" style={{ color: '#64748b' }}>
              Choisissez une conversation dans la barre latérale ou démarrez un nouvel échange.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="mt-5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #4a90d9, #2563eb)',
                boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
              }}
            >
              Nouvelle conversation
            </button>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(8,15,26,0.6)', backdropFilter: 'blur(8px)' }}>
          <div
            className="w-full max-w-md overflow-hidden"
            style={{
              background: '#fff',
              borderRadius: '1.5rem',
              boxShadow: '0 24px 80px rgba(8,15,26,0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Modal Header */}
            <div
              className="px-5 py-4 flex justify-between items-center"
              style={{ background: 'linear-gradient(135deg, #080f1a, #0a1628)', borderBottom: '1px solid rgba(74,144,217,0.2)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(74,144,217,0.2)' }}
                >
                  <UserPlus size={15} color="#4a90d9" />
                </div>
                <h3 className="text-[14px] font-bold text-white">Démarrer une conversation</h3>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                ✕
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              {availableUsers.length === 0 ? (
                <p className="text-[13px] text-center py-8" style={{ color: '#64748b' }}>
                  Aucun autre utilisateur disponible
                </p>
              ) : (
                availableUsers.map((u) => {
                  const ra = getRoleAvatar(u.role);
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleStartNewConversation(u.id)}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150"
                      style={{ border: '1px solid #e2e8f0' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#4a90d9'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                        style={{ background: ra.bg, color: ra.color }}
                      >
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: '#1a2332' }}>
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-[11px] capitalize" style={{ color: '#64748b' }}>
                          {(u.role || 'USER').toLowerCase()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
