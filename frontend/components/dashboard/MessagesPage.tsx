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

  // 1. Fetch Conversations from backend
  const fetchConversations = async () => {
    try {
      const data = await api.messaging.conversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // 2. Fetch Users available to start conversation
  const fetchUsers = async () => {
    try {
      // Fetch users list from backend
      const data = await api.freelancers.list(); // Can list profiles
      // Map and filter out the current user
      const users = data
        .map((p: any) => p.user)
        .filter((u: any) => u.id !== user?.id);
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, [user]);

  // 3. Connect to WebSocket Gateway
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to NestJS WebSocket Gateway (runs on port 3001 by default)
    const socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to real-time messaging WebSocket gateway');
    });

    // Listen to incoming messages in real-time
    socket.on('newMessage', (msg: Message) => {
      // Append message if it belongs to selected conversation
      setMessages((prev) => {
        // Avoid duplicate messages
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // Refetch conversations list to update previews
      fetchConversations();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 4. Handle Joining Room on conversation select
  useEffect(() => {
    if (!socketRef.current || !selectedConversationId) return;

    const socket = socketRef.current;
    
    // Join conversation room
    socket.emit('joinConversation', { conversationId: selectedConversationId });

    // Load active conversation messages from database
    const loadMessages = async () => {
      try {
        const data = await api.messaging.messages(selectedConversationId);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    return () => {
      socket.emit('leaveConversation', { conversationId: selectedConversationId });
    };
  }, [selectedConversationId]);

  // 5. Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 6. Send Message logic
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;

    try {
      // Post to REST API (this registers in DB and triggers socket broadcast on server)
      await api.messaging.sendMessage(selectedConversationId, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // 7. Start conversation with a new user
  const handleStartNewConversation = async (targetUserId: string) => {
    try {
      // Initiate a conversation between current user and target user
      const conversation = await api.messaging.startConversation(targetUserId);
      await fetchConversations();
      setSelectedConversationId(conversation.id);
      setShowNewChatModal(false);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Helpers
  const getSelectedConv = () => {
    return conversations.find((c) => c.id === selectedConversationId);
  };

  const getParticipantInfo = (conv: Conversation) => {
    // Find the participant who is not the current user
    const participant = conv.participants.find((p) => p.user.id !== user?.id);
    return participant?.user || { id: '', firstName: 'Inconnu', lastName: '', role: 'FREELANCER' };
  };

  const selectedConv = getSelectedConv();
  const activeParticipant = selectedConv ? getParticipantInfo(selectedConv) : null;

  const filteredConversations = conversations.filter((conv) => {
    const p = getParticipantInfo(conv);
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-full bg-white relative">
      {/* Conversations List */}
      <div className={`${selectedConversationId ? 'hidden md:flex' : 'flex'} md:w-96 flex-col border-r border-slate-200`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold text-slate-900">Messages</h1>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors"
              title="Nouvelle conversation"
            >
              <UserPlus size={18} />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher une discussion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-colors text-xs"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="text-slate-400" size={24} />
              </div>
              <h3 className="text-xs font-semibold text-slate-900 mb-1">Aucune discussion</h3>
              <p className="text-[10px] text-muted mb-4">Commencez à échanger avec des professionnels de GoConnexions !</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-3 py-1.5 bg-accent text-white rounded-lg text-[10px] font-semibold hover:bg-indigo-600 transition-colors"
              >
                Nouvelle Discussion
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const p = getParticipantInfo(conv);
              const lastMsg = conv.messages && conv.messages.length > 0 
                ? conv.messages[conv.messages.length - 1] 
                : null;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`flex items-center gap-3 p-3.5 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 ${
                    selectedConversationId === conv.id ? 'bg-indigo-50/50 border-l-4 border-l-accent' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold relative flex-shrink-0">
                    {p.firstName[0]}{p.lastName[0]}
                    <Circle className="absolute bottom-0 right-0 w-2.5 h-2.5 text-green-500 fill-current" size={10} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-semibold text-slate-900 truncate text-xs">
                        {p.firstName} {p.lastName}
                      </h3>
                      <span className="text-[9px] text-muted">
                        {new Date(conv.updatedAt).toLocaleDateString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
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
        <div className="flex-1 flex flex-col bg-slate-50">
          {/* Chat Header */}
          <div className="p-3 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversationId(null)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-xs"
              >
                ← Retour
              </button>
              <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold">
                {activeParticipant.firstName[0]}{activeParticipant.lastName[0]}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-xs">{activeParticipant.firstName} {activeParticipant.lastName}</h3>
                <p className="text-[10px] text-slate-500 capitalize">{(activeParticipant.role || 'FREELANCER').toLowerCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Phone size={16} className="text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Video size={16} className="text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreHorizontal size={16} className="text-slate-600" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-3.5 py-2 rounded-2xl shadow-sm text-xs leading-relaxed ${
                      isOwn
                        ? 'bg-accent text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-[8px] mt-1 text-right ${
                      isOwn ? 'text-white/80' : 'text-slate-400'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Écrire un message en temps réel..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-xs bg-slate-50"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2.5 bg-accent text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Empty Chat State */
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-accent" size={32} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Sélectionnez une discussion</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Choisissez un professionnel dans la barre latérale ou démarrez une nouvelle conversation pour collaborer instantanément.
            </p>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gc-border">
            <div className="bg-gradient-to-r from-accent to-indigo-600 px-4 py-3 text-white flex justify-between items-center">
              <h3 className="font-bold text-xs">Démarrer une conversation</h3>
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="text-white/80 hover:text-white text-xs font-semibold"
              >
                Fermer
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              {availableUsers.length === 0 ? (
                <p className="text-xs text-muted text-center py-8">Aucun autre utilisateur disponible</p>
              ) : (
                availableUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleStartNewConversation(u.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{u.firstName} {u.lastName}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{(u.role || 'FREELANCER').toLowerCase()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
