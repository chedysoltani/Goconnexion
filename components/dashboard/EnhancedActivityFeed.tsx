'use client';

import React, { useState } from 'react';
import { User } from '@/types/auth';
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Send,
  X,
} from 'lucide-react';

interface EnhancedActivityFeedProps {
  user: User | null;
}

interface ActivityItem {
  id: string;
  type: 'post' | 'connection' | 'project' | 'achievement' | 'story';
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: Date;
  likes?: number;
  comments?: number;
  image?: string;
  tags?: string[];
  mentions?: string[];
  liked?: boolean;
}

export default function EnhancedActivityFeed({ user }: EnhancedActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'story',
      author: {
        name: 'Marie Laurent',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
        role: 'Freelancer | Développeuse',
      },
      content: 'Aujourd\'hui, j\'ai signé mon plus grand contrat ! Une mission de 6 mois pour une entreprise fintech. Merci GoConnexions pour m\'avoir connectée avec le client parfait. 🚀',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=400&fit=crop',
      likes: 156,
      comments: 23,
      liked: false,
    },
    {
      id: '2',
      type: 'post',
      author: {
        name: 'Thomas Bernard',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        role: 'Fondateur & CEO',
      },
      content: 'Super excité de lancer notre nouvelle plateforme de recrutement IA ! Après 6 mois de développement, nous sommes prêts à révolutionner le marché. Merci à toute l\'équipe pour leur dévouement. 🚀',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
      likes: 89,
      comments: 34,
      tags: ['startup', 'IA', 'recrutement'],
      liked: false,
    },
    {
      id: '3',
      type: 'connection',
      author: {
        name: 'Sophie Martin',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
        role: 'Experte en Cybersécurité',
      },
      content: 'Nouvelle collaboration avec David Chen - Expert en cybersécurité. Nous travaillons sur un projet de blockchain pour la banque. 🔐',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=800&h=400&fit=crop',
      likes: 45,
      comments: 12,
      liked: false,
    },
  ]);

  const [newPost, setNewPost] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInMinutes > 0) {
      return `il y a ${diffInMinutes} min`;
    } else {
      return 'à l\'instant';
    }
  };

  const getActivityBadge = (type: string) => {
    const badges = {
      story: { label: 'Story', color: 'bg-amber-100 text-amber-700' },
      post: { label: 'Post', color: 'bg-blue-100 text-blue-700' },
      connection: { label: 'Connexion', color: 'bg-emerald-100 text-emerald-700' },
      project: { label: 'Projet', color: 'bg-purple-100 text-purple-700' },
      achievement: { label: 'Succès', color: 'bg-orange-100 text-orange-700' },
    };
    const badge = badges[type as keyof typeof badges] || badges.post;
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedPosts(newLiked);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.trim()) {
      const post: ActivityItem = {
        id: Date.now().toString(),
        type: 'post',
        author: {
          name: `${user?.firstName || 'Utilisateur'} ${user?.lastName || ''}`,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4?w=400&h=400&fit=crop&crop=face',
          role: user?.role || 'Professionnel',
        },
        content: newPost,
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        liked: false,
      };
      setActivities([post, ...activities]);
      setNewPost('');
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto py-6">
        {/* Create Post Card */}
        <div className="bg-white shadow-sm border-b border-slate-100 rounded-xl mb-4">
          <div className="p-4 sm:p-5">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>

              {/* Form */}
              <div className="flex-1">
                <form onSubmit={handlePostSubmit} className="space-y-3">
                  <textarea
                    placeholder="Partagez votre expertise, une réussite ou une actualité..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none transition-colors placeholder-slate-400 text-sm"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowImageUpload(!showImageUpload)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium text-xs"
                    >
                      <ImageIcon size={16} />
                      <span>Photo</span>
                    </button>
                    <button
                      type="submit"
                      disabled={!newPost.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg transition-colors font-medium text-xs shadow-md"
                    >
                      <Send size={16} />
                      <span>Publier</span>
                    </button>
                  </div>
                </form>

                {/* Image Upload Modal */}
                {showImageUpload && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Ajouter une photo</h3>
                        <button
                          onClick={() => setShowImageUpload(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                        <ImageIcon size={32} className="mx-auto text-slate-400 mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full text-sm text-slate-500"
                        />
                        <p className="text-xs text-slate-500 mt-2">PNG, JPG jusqu'à 5MB</p>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button
                          type="button"
                          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                          onClick={() => setShowImageUpload(false)}
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feed Items */}
        <div className="space-y-3 p-3 sm:p-4">
          {activities.map((activity) => (
            <article
              key={activity.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-100"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={activity.author.avatar}
                      alt={activity.author.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  </div>

                  {/* Author Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-slate-900 text-sm">
                        {activity.author.name}
                      </h3>
                      {getActivityBadge(activity.type)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {activity.author.role}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>

                  {/* Menu Button */}
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 12a2 2 0 11-4 0 2 2 0 014 0zM12 12a2 2 0 11-4 0 2 2 0 014 0zM16 14a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="mb-3">
                  <p className="text-slate-800 leading-relaxed text-sm">
                    {activity.content}
                  </p>
                </div>

                {/* Tags */}
                {activity.tags && activity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {activity.tags.map((tag, index) => (
                      <a
                        key={index}
                        href="#"
                        className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium rounded-full transition-colors"
                      >
                        #{tag}
                      </a>
                    ))}
                  </div>
                )}

                {/* Image */}
                {activity.image && (
                  <div className="mb-3 -mx-4 sm:-mx-5">
                    <img
                      src={activity.image}
                      alt="Activity"
                      className="w-full h-auto object-cover hover:brightness-95 transition-all cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              <div className="px-4 sm:px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="hover:text-blue-600 cursor-pointer transition-colors">
                    {activity.likes} mentions j&apos;aime
                  </span>
                  <span className="hover:text-blue-600 cursor-pointer transition-colors">
                    {activity.comments} commentaires
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 sm:px-5 py-2 flex items-center justify-between">
                <button
                  onClick={() => toggleLike(activity.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg transition-colors font-medium text-xs ${
                    likedPosts.has(activity.id)
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Heart
                    size={16}
                    fill={likedPosts.has(activity.id) ? 'currentColor' : 'none'}
                  />
                  <span>Aimer</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 font-medium text-xs">
                  <MessageCircle size={16} />
                  <span>Commenter</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 font-medium text-xs">
                  <Share2 size={16} />
                  <span>Partager</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
