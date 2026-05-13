'use client';

import React, { useState } from 'react';
import { User } from '@/types/auth';
import { Search, Send, Paperclip, Phone, Video, MoreHorizontal, Circle } from 'lucide-react';

interface MessagesPageProps {
  user: User | null;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  senderId: string;
  senderName: string;
  isOwn: boolean;
  read: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    company?: string;
    isOnline: boolean;
    lastSeen?: Date;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    senderId: string;
    read: boolean;
  };
  unreadCount: number;
  messages: Message[];
}

export default function MessagesPage({ user }: MessagesPageProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'archived'>('all');

  const conversations: Conversation[] = [
    {
      id: '1',
      participant: {
        id: '2',
        name: 'Sophie Martin',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
        role: 'UX Designer',
        company: 'Design Studio Pro',
        isOnline: true,
      },
      lastMessage: {
        content: 'Super ! Je vais préparer les maquettes pour demain',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        senderId: '2',
        read: false,
      },
      unreadCount: 2,
      messages: [
        {
          id: '1',
          content: 'Salut Sophie, es-tu disponible pour discuter du projet ?',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          senderId: '1',
          senderName: 'Jean Dupont',
          isOwn: true,
          read: true,
        },
        {
          id: '2',
          content: 'Oui avec plaisir ! Quel sujet veux-tu aborder ?',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          senderId: '2',
          senderName: 'Sophie Martin',
          isOwn: false,
          read: true,
        },
        {
          id: '3',
          content: 'Je pensais à l\'interface utilisateur et à l\'expérience mobile',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          senderId: '1',
          senderName: 'Jean Dupont',
          isOwn: true,
          read: true,
        },
        {
          id: '4',
          content: 'Super ! Je vais préparer les maquettes pour demain',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          senderId: '2',
          senderName: 'Sophie Martin',
          isOwn: false,
          read: false,
        },
      ],
    },
    {
      id: '2',
      participant: {
        id: '3',
        name: 'Thomas Bernard',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        role: 'Développeur Full Stack',
        company: 'Tech Innovations',
        isOnline: true,
      },
      lastMessage: {
        content: 'Le code est prêt pour la review',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        senderId: '3',
        read: true,
      },
      unreadCount: 0,
      messages: [
        {
          id: '1',
          content: 'Peux-tu regarder ma PR quand tu auras un moment ?',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          senderId: '3',
          senderName: 'Thomas Bernard',
          isOwn: false,
          read: true,
        },
        {
          id: '2',
          content: 'Le code est prêt pour la review',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          senderId: '3',
          senderName: 'Thomas Bernard',
          isOwn: false,
          read: true,
        },
      ],
    },
    {
      id: '3',
      participant: {
        id: '4',
        name: 'Marie Laurent',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
        role: 'Développeuse Frontend',
        company: 'Freelance',
        isOnline: false,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000),
      },
      lastMessage: {
        content: 'Merci pour ta recommandation !',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        senderId: '1',
        read: true,
      },
      unreadCount: 0,
      messages: [
        {
          id: '1',
          content: 'J\'ai adoré ton travail sur le dernier projet',
          timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
          senderId: '4',
          senderName: 'Marie Laurent',
          isOwn: false,
          read: true,
        },
        {
          id: '2',
          content: 'Merci beaucoup ! Ça me motive énormément',
          timestamp: new Date(Date.now() - 24.5 * 60 * 60 * 1000),
          senderId: '1',
          senderName: 'Jean Dupont',
          isOwn: true,
          read: true,
        },
        {
          id: '3',
          content: 'Merci pour ta recommandation !',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          senderId: '4',
          senderName: 'Marie Laurent',
          isOwn: false,
          read: true,
        },
      ],
    },
    {
      id: '4',
      participant: {
        id: '5',
        name: 'David Chen',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
        role: 'Expert Cybersécurité',
        company: 'SecureTech Solutions',
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      lastMessage: {
        content: 'À plus tard !',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        senderId: '1',
        read: true,
      },
      unreadCount: 0,
      messages: [
        {
          id: '1',
          content: 'La réunion est confirmée pour demain 14h',
          timestamp: new Date(Date.now() - 48.5 * 60 * 60 * 1000),
          senderId: '5',
          senderName: 'David Chen',
          isOwn: false,
          read: true,
        },
        {
          id: '2',
          content: 'Parfait, je serai là',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
          senderId: '1',
          senderName: 'Jean Dupont',
          isOwn: true,
          read: true,
        },
      ],
    },
  ];

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.participant.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.participant.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'unread') {
      return matchesSearch && conv.unreadCount > 0;
    }
    return matchesSearch;
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return date.toLocaleDateString('fr-FR');
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConv) {
      // Ici vous ajouteriez la logique d'envoi de message
      console.log('Envoi du message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} md:w-96 lg:w-112 flex-col border-r border-slate-200`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-xl font-semibold text-slate-900 mb-3">Messages</h1>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher des conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                activeFilter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Non lues ({conversations.filter(c => c.unreadCount > 0).length})
            </button>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 ${
                selectedConversation === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <img
                  src={conversation.participant.avatar}
                  alt={conversation.participant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {conversation.participant.isOnline && (
                  <Circle className="absolute bottom-0 right-0 w-2.5 h-2.5 text-green-500 fill-current" size={10} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-slate-900 truncate text-sm">
                    {conversation.participant.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {formatTimeAgo(conversation.lastMessage.timestamp)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600 truncate">
                    {conversation.lastMessage.content}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune conversation trouvée</h3>
              <p className="text-slate-600">
                Essayez de modifier votre recherche pour trouver des messages.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
                >
                  ← Retour
                </button>
                <div className="relative">
                  <img
                    src={selectedConv.participant.avatar}
                    alt={selectedConv.participant.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  {selectedConv.participant.isOnline && (
                    <Circle className="absolute bottom-0 right-0 w-2 h-2 text-green-500 fill-current" size={8} />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 text-sm">{selectedConv.participant.name}</h3>
                  <p className="text-xs text-slate-600">
                    {selectedConv.participant.role}
                    {selectedConv.participant.company && ` • ${selectedConv.participant.company}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Phone size={18} className="text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Video size={18} className="text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreHorizontal size={18} className="text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {selectedConv.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl ${
                    message.isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-900 border border-slate-200'
                  }`}
                >
                  <p className="text-xs">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.isOwn ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {formatTimeAgo(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Paperclip size={18} className="text-slate-600" />
              </button>
              <input
                type="text"
                placeholder="Écrire un message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Chat State */
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Sélectionnez une conversation</h3>
            <p className="text-slate-600">
              Choisissez une conversation dans la liste pour commencer à discuter
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
