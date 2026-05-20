'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Send,
  X,
  Sparkles,
  User as UserIcon,
  Globe,
} from 'lucide-react';

interface EnhancedActivityFeedProps {
  user: User | null;
}

interface FeedComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface FeedPost {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
  };
  likes: Array<{ userId: string }>;
  comments: FeedComment[];
}

const getRoleBadge = (role: string) => {
  const roleLower = role.toLowerCase();
  switch (roleLower) {
    case 'entrepreneur':
      return { label: '🚀 Entrepreneur', bg: 'bg-purple-50', border: 'border-purple-200/60', text: 'text-purple-700' };
    case 'freelancer':
    case 'freelance':
      return { label: '💼 Freelancer', bg: 'bg-blue-50', border: 'border-blue-200/60', text: 'text-blue-700' };
    case 'investor':
    case 'investisseur':
      return { label: '💎 Investisseur', bg: 'bg-emerald-50', border: 'border-emerald-200/60', text: 'text-emerald-700' };
    case 'mentor':
      return { label: '🎯 Mentor', bg: 'bg-amber-50', border: 'border-amber-200/60', text: 'text-amber-700' };
    case 'user':
      return { label: '✨ Membre', bg: 'bg-indigo-50', border: 'border-indigo-200/60', text: 'text-indigo-700' };
    default:
      return { label: `✨ ${role}`, bg: 'bg-slate-50', border: 'border-slate-200/60', text: 'text-slate-600' };
  }
};

export default function EnhancedActivityFeed({ user }: EnhancedActivityFeedProps) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'public' | 'profile'>('public');
  const [isLoading, setIsLoading] = useState(true);

  // States to hold typed comments per post
  const [postCommentsInputs, setPostCommentsInputs] = useState<Record<string, string>>({});
  // States to toggle comments expand per post
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const data = await api.feed.list();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [user]);

  const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await api.uploads.upload(file);
      const imageUrl = `http://localhost:3001${res.file.path}`;
      setNewImageUrl(imageUrl);
    } catch (err: any) {
      console.error("Erreur lors du téléversement de l'image de publication:", err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      await api.feed.create({
        content: newPostContent,
        imageUrl: newImageUrl.trim() ? newImageUrl.trim() : undefined,
      });
      setNewPostContent('');
      setNewImageUrl('');
      setShowImageInput(false);
      await fetchFeed();
    } catch (error) {
      console.error('Error creating feed post:', error);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      await api.feed.toggleLike(postId);
      await fetchFeed();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentText = postCommentsInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      await api.feed.addComment(postId, commentText);
      setPostCommentsInputs(prev => ({ ...prev, [postId]: '' }));
      await fetchFeed();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    if (diffInHours > 0) return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    if (diffInMinutes > 0) return `il y a ${diffInMinutes} min`;
    return 'à l\'instant';
  };

  const isLikedByCurrentUser = (post: FeedPost) => {
    if (!user) return false;
    return post.likes.some(like => like.userId === user.id);
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'profile') {
      return post.author.id === user?.id;
    }
    return true;
  });

  return (
    <div className="flex-1 bg-gradient-to-b from-gc-bg via-white/40 to-gc-bg/80 min-h-full">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Toggle Public / Profile */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveFilter('public')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 ${
              activeFilter === 'public'
                ? 'bg-gradient-to-r from-accent to-indigo-500 text-white shadow-lg shadow-accent/20'
                : 'bg-white/80 backdrop-blur-sm text-muted hover:text-foreground hover:bg-white border border-gc-border/60 hover:border-accent/30 hover:shadow-md'
            }`}
          >
            <Globe size={14} />
            <span>Fil Public</span>
          </button>
          <button
            onClick={() => setActiveFilter('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 ${
              activeFilter === 'profile'
                ? 'bg-gradient-to-r from-accent to-indigo-500 text-white shadow-lg shadow-accent/20'
                : 'bg-white/80 backdrop-blur-sm text-muted hover:text-foreground hover:bg-white border border-gc-border/60 hover:border-accent/30 hover:shadow-md'
            }`}
          >
            <UserIcon size={14} />
            <span>Mon Profil</span>
          </button>
        </div>

        {/* Create Post Card - Frosted glass with gradient border */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-gc-border/40 rounded-3xl shadow-sm mb-8 overflow-hidden group">
          {/* Gradient border bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-indigo-400 to-accent/30 opacity-60" />

          <div className="p-5 sm:p-6">
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent/20 to-indigo-400/20 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0 ring-2 ring-white shadow-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>

              <div className="flex-1 min-w-0">
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <textarea
                    placeholder="Partagez votre expertise, une réussite ou une actualité... ✨"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full px-4 py-3.5 border border-gc-border/40 rounded-2xl focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none resize-none transition-all duration-300 placeholder-muted/50 text-sm bg-gc-bg/50 shadow-inner shadow-gc-border/10 leading-relaxed"
                    rows={3}
                  />

                  {showImageInput && (
                    <div className="bg-gc-bg/60 backdrop-blur-sm p-4 rounded-2xl border border-gc-border/30 space-y-3">
                      <label className="block text-[11px] font-bold text-foreground/70">Ajouter une image à votre publication :</label>
                      <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                        <button
                          type="button"
                          onClick={() => document.getElementById('post-image-upload')?.click()}
                          className="px-3.5 py-2 bg-white border border-gc-border/50 hover:bg-accent-light/50 hover:border-accent/30 rounded-xl text-[11px] font-bold text-foreground/70 shadow-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                        >
                          <ImageIcon size={13} className="text-accent" />
                          <span>{newImageUrl ? 'Changer l\'image' : 'Importer une image'}</span>
                        </button>
                        <input
                          id="post-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePostImageUpload}
                        />
                        <span className="text-[11px] text-muted/60">ou</span>
                        <input
                          type="text"
                          placeholder="Coller l'URL d'une image..."
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="flex-1 px-3.5 py-2 border border-gc-border/40 rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-accent/20 bg-white transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewImageUrl('');
                            setShowImageInput(false);
                          }}
                          className="text-[11px] text-red-400 hover:text-red-600 font-bold transition-colors duration-200"
                        >
                          Annuler
                        </button>
                      </div>
                      {newImageUrl && (
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gc-border/30 mt-2 shadow-sm">
                          <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setNewImageUrl('')}
                            className="absolute top-1.5 right-1.5 bg-red-500/90 backdrop-blur-sm text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] hover:bg-red-600 transition-colors shadow-sm"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gc-border/20">
                    <button
                      type="button"
                      onClick={() => setShowImageInput(!showImageInput)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-muted hover:text-accent hover:bg-accent-light/50 rounded-xl transition-all duration-200 font-semibold text-[12px] group/photo"
                    >
                      <span className="p-1 rounded-lg bg-gradient-to-br from-accent/10 to-indigo-400/10 group-hover/photo:from-accent/20 group-hover/photo:to-indigo-400/20 transition-all duration-200">
                        <ImageIcon size={14} className="text-accent" />
                      </span>
                      <span>Ajouter une photo</span>
                    </button>
                    <button
                      type="submit"
                      disabled={!newPostContent.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-accent to-indigo-500 hover:from-accent/90 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 font-bold text-[12px] shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Send size={13} />
                      <span>Publier</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-[3px] border-accent/30 border-t-accent rounded-full animate-spin"></div>
            <p className="text-xs text-muted font-medium">Chargement de votre fil d&apos;activités...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-gc-border/30 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-light to-indigo-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Sparkles className="text-accent" size={24} />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-2">Aucune publication</h3>
            <p className="text-[12px] text-muted max-w-xs mx-auto leading-relaxed">
              Soyez le premier à partager une actualité ou une opportunité de collaboration !
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredPosts.map((post) => {
              const liked = isLikedByCurrentUser(post);
              const isExpanded = !!expandedComments[post.id];
              const roleBadge = getRoleBadge(post.author.role);
              
              return (
                <article
                  key={post.id}
                  className="bg-white/90 backdrop-blur-sm border border-gc-border/30 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:shadow-primary/5 transition-all duration-300 border-l-2 border-l-accent/30"
                >
                  <div className="p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent/15 to-indigo-400/15 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0 ring-2 ring-white shadow-sm">
                        {post.author.firstName[0]}{post.author.lastName[0]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-semibold text-foreground text-[13px]">
                            {post.author.firstName} {post.author.lastName}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}>
                            {roleBadge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1">
                          <Globe size={10} className="opacity-50" />
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <p className="text-foreground/90 leading-relaxed text-[13px]">
                        {post.content}
                      </p>
                    </div>

                    {/* Optional Image */}
                    {post.imageUrl && (
                      <div className="mb-4 -mx-5 sm:-mx-6 border-y border-gc-border/20 bg-gc-bg/30 max-h-96 overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt="Post attachment"
                          className="w-full h-auto object-contain max-h-96"
                        />
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[11px] text-muted pt-3 border-t border-gc-border/20">
                      <div className="flex gap-5">
                        <span className="flex items-center gap-1">
                          <Heart size={11} className={liked ? 'text-red-400 fill-red-400' : 'text-muted/50'} />
                          {post.likes.length} j&apos;aime
                        </span>
                        <span 
                          className="cursor-pointer hover:text-accent transition-colors duration-200"
                          onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !isExpanded }))}
                        >
                          {post.comments.length} commentaire{post.comments.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="px-5 sm:px-6 py-2.5 border-t border-b border-gc-border/15 bg-gc-bg/30 flex justify-between items-center gap-2">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
                        liked
                          ? 'text-red-500 bg-red-50/80 hover:bg-red-100/80'
                          : 'text-muted hover:text-red-500 hover:bg-red-50/50'
                      }`}
                    >
                      <Heart size={15} fill={liked ? 'currentColor' : 'none'} className="transition-transform duration-200" />
                      <span>J&apos;aime</span>
                    </button>
                    <button
                      onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !isExpanded }))}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-muted hover:text-accent hover:bg-accent-light/40 text-[12px] font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <MessageCircle size={15} />
                      <span>Commenter</span>
                    </button>
                  </div>

                  {/* Expanded Comments */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-gc-bg/70 backdrop-blur-sm border-t border-gc-border/10 space-y-4">
                      {/* Comments List */}
                      {post.comments.length > 0 && (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2.5 items-start group/comment">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/10 to-indigo-400/10 flex items-center justify-center text-accent text-[10px] font-bold flex-shrink-0 ring-1 ring-white">
                                {comment.author.firstName[0]}{comment.author.lastName[0]}
                              </div>
                              <div className="flex-1 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-gc-border/20 shadow-sm text-[12px] group-hover/comment:shadow-md transition-shadow duration-200">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold text-foreground">{comment.author.firstName} {comment.author.lastName}</span>
                                  <span className="text-[9px] text-muted/60">{formatTimeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="text-foreground/80 leading-relaxed">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Input Form */}
                      <div className="flex gap-2.5">
                        <input
                          type="text"
                          placeholder="Ajouter un commentaire..."
                          value={postCommentsInputs[post.id] || ''}
                          onChange={(e) => setPostCommentsInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          className="flex-1 px-4 py-2.5 border border-gc-border/30 rounded-xl text-xs focus:ring-2 focus:ring-accent/20 focus:border-accent/30 outline-none bg-white/80 backdrop-blur-sm placeholder-muted/50 transition-all duration-200"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!postCommentsInputs[post.id]?.trim()}
                          className="px-4 py-2.5 bg-gradient-to-r from-accent to-indigo-500 text-white rounded-xl hover:from-accent/90 hover:to-indigo-600 disabled:opacity-40 text-[11px] font-bold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
