'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import { 
  Lightbulb, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Send, 
  Plus, 
  Filter, 
  Compass, 
  Users, 
  BookOpen, 
  Sparkles,
  Search,
  X
} from 'lucide-react';

interface IncubatorPageProps {
  user: User | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  comments: Comment[];
  likes: Array<{ userId: string }>;
  _count?: {
    likes: number;
    comments: number;
  };
}

export default function IncubatorPage({ user }: IncubatorPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create post modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Tech');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active comments input state (keyed by postId)
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  const categories = ['Tous', 'Tech', 'Finance', 'Santé', 'Social', 'Éducation', 'Environnement', 'Autre'];

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const data = await api.incubator.posts(categoryFilter === 'Tous' ? undefined : categoryFilter);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching incubator posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter]);

  const handleLike = async (postId: string) => {
    try {
      await api.incubator.toggleLike(postId);
      // Optimistically or refetch to update UI
      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      await api.incubator.addComment(postId, content);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    setIsSubmitting(true);
    try {
      await api.incubator.createPost({
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory,
      });
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreateModal(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating incubator post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.author.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.author.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'tech': return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'finance': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'santé': return 'bg-rose-50 text-rose-700 border-rose-150';
      case 'social': return 'bg-purple-50 text-purple-700 border-purple-150';
      case 'éducation': return 'bg-amber-50 text-amber-700 border-amber-150';
      case 'environnement': return 'bg-teal-50 text-teal-700 border-teal-150';
      default: return 'bg-slate-50 text-slate-700 border-slate-150';
    }
  };

  const getCategoryGradientStrip = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'tech': return 'from-blue-400 to-blue-600';
      case 'finance': return 'from-emerald-400 to-emerald-600';
      case 'santé': return 'from-rose-400 to-rose-600';
      case 'social': return 'from-purple-400 to-purple-600';
      case 'éducation': return 'from-amber-400 to-amber-600';
      case 'environnement': return 'from-teal-400 to-teal-600';
      default: return 'from-slate-400 to-slate-600';
    }
  };

  const getCategoryBadgeGradient = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'tech': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'finance': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
      case 'santé': return 'bg-gradient-to-r from-rose-500 to-rose-600 text-white';
      case 'social': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'éducation': return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
      case 'environnement': return 'bg-gradient-to-r from-teal-500 to-teal-600 text-white';
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Tous': return '✨';
      case 'Tech': return '💻';
      case 'Finance': return '💰';
      case 'Santé': return '🏥';
      case 'Social': return '👥';
      case 'Éducation': return '📚';
      case 'Environnement': return '🌿';
      case 'Autre': return '🔮';
      default: return '📌';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'freelancer': return '💼 Freelancer créatif';
      case 'entrepreneur': return '🚀 Entrepreneur inspiré';
      case 'mentor': return '🎯 Mentor expert';
      default: return '🚀 Entrepreneur inspiré';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 h-full flex flex-col">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-accent via-indigo-600 to-purple-600 rounded-3xl p-8 text-white mb-6 overflow-hidden shadow-xl flex-shrink-0">
        {/* Noise overlay */}
        <div className="noise absolute inset-0 opacity-[0.03] pointer-events-none" />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-400/10 animated-gradient pointer-events-none" />
        {/* Sparkle/glow effects */}
        <div className="absolute top-4 right-24 w-2 h-2 bg-amber-300 rounded-full animate-pulse opacity-80" />
        <div className="absolute top-12 right-40 w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-6 right-32 w-1 h-1 bg-amber-200 rounded-full animate-pulse opacity-70" style={{ animationDelay: '1s' }} />
        {/* Floating lightbulb with bob animation */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-15 animate-bounce" style={{ animationDuration: '3s' }}>
          <Lightbulb size={200} />
        </div>
        {/* Glow circle behind lightbulb */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 w-40 h-40 bg-amber-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3 bg-white/15 w-fit px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10">
            <Sparkles size={14} className="text-amber-300" />
            <span>Incubateur Virtuel GoConnexions</span>
          </div>
          <h1 className="font-serif text-3xl font-bold mb-3 tracking-tight">
            Partagez vos Idées & Propulsez votre Startup
          </h1>
          <p className="text-white/75 text-sm leading-relaxed max-w-xl">
            Un espace interactif plus humain pour pitcher vos concepts innovants, recruter des associés talentueux, solliciter du mentorat et co-créer les entreprises de demain.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6 glass rounded-2xl p-4 border border-white/60 shadow-sm flex-shrink-0">
        {/* Search – frosted glass with inner shadow */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/60" />
          <input
            type="text"
            placeholder="Rechercher des projets ou mentors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-sm border border-gc-border/50 rounded-xl text-sm shadow-inner focus:ring-2 focus:ring-accent/40 focus:border-accent/30 outline-none transition-all placeholder:text-muted/50"
          />
        </div>

        {/* Proposer une Idée button – gradient with hover glow */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Plus size={16} />
            <span>Proposer une Idée</span>
          </button>
        </div>
      </div>

      {/* Category Pills Selector */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 flex-shrink-0 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold border transition-all duration-200 whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-gradient-to-r from-accent to-indigo-600 border-accent/50 text-white shadow-md shadow-accent/20 scale-[1.05]'
                : 'bg-white/80 backdrop-blur-sm border-gc-border/60 text-muted hover:text-foreground hover:bg-white hover:border-accent/30 hover:shadow-sm'
            }`}
          >
            <span>{getCategoryIcon(cat)}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-accent/20 rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-muted font-medium">Chargement des projets...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          /* Empty state – warm, with lightbulb composition */
          <div className="glass rounded-3xl p-16 text-center border border-white/60 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-5xl opacity-30 -rotate-12">💡</span>
              <span className="text-6xl">💡</span>
              <span className="text-5xl opacity-30 rotate-12">💡</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 font-serif">Aucune idée dans cette catégorie</h3>
            <p className="text-muted text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Soyez le premier à soumettre un concept de startup dans la catégorie <span className="font-semibold text-foreground">{categoryFilter}</span> pour inspirer les autres ! Chaque grande entreprise a commencé par une simple idée ✨
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-accent to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Proposer une Idée
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => {
              const hasLiked = post.likes?.some(like => like.userId === user?.id);
              return (
                <div key={post.id} className="group bg-white rounded-2xl border border-gc-border/60 shadow-sm flex flex-col justify-between hover-lift hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                  {/* Category Gradient Strip (4px) */}
                  <div className={`h-1 w-full bg-gradient-to-r ${getCategoryGradientStrip(post.category)}`} />

                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${getCategoryBadgeGradient(post.category)}`}>
                        {getCategoryIcon(post.category)} {post.category}
                      </span>
                      <span className="text-[10px] text-muted/70 bg-slate-50 px-2 py-0.5 rounded-full">
                        {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-foreground mb-2 line-clamp-1 group-hover:text-accent transition-colors duration-200">
                      {post.title}
                    </h2>

                    <p className="text-muted text-xs leading-relaxed line-clamp-4 mb-4">
                      {post.content}
                    </p>

                    {/* Author Widget */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100/80">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
                        {post.author.firstName[0]}{post.author.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {post.author.firstName} {post.author.lastName}
                        </p>
                        {/* Role badge – warm pill */}
                        <span className="inline-block mt-0.5 text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-full">
                          {getRoleBadge(post.author.role)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comments and Likes Container – glass effect */}
                  <div className="bg-gradient-to-b from-slate-50/80 to-slate-100/60 backdrop-blur-sm rounded-b-2xl border-t border-gc-border/40 p-4 space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted">
                      {/* Like button – animated with scale and fill */}
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 font-semibold transition-all duration-200 group/like ${
                          hasLiked ? 'text-accent' : 'hover:text-accent'
                        }`}
                      >
                        <span className={`inline-flex transition-transform duration-200 group-hover/like:scale-125 ${hasLiked ? 'scale-110' : ''}`}>
                          <ThumbsUp size={14} className={hasLiked ? 'fill-accent text-accent' : ''} />
                        </span>
                        <span>{post.likes?.length || 0} Likes</span>
                      </button>

                      <div className="flex items-center gap-1.5 text-muted/70">
                        <MessageSquare size={14} />
                        <span>{post.comments?.length || 0} Commentaires</span>
                      </div>
                    </div>

                    {/* Comments Stack – indented thread style */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-2 pt-2 max-h-36 overflow-y-auto scrollbar-thin">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="ml-2 pl-3 border-l-2 border-accent/20 bg-white/70 backdrop-blur-sm p-2.5 rounded-r-xl text-[11px] leading-relaxed shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-foreground">
                                {comment.author.firstName} {comment.author.lastName}
                              </span>
                              <span className="text-[9px] text-muted/60">
                                {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                            </div>
                            <p className="text-slate-600">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Input form */}
                    <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Donnez votre feedback constructif..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gc-border/40 rounded-xl text-xs bg-white/80 backdrop-blur-sm shadow-inner focus:ring-2 focus:ring-accent/30 focus:border-accent/30 outline-none transition-all placeholder:text-muted/40"
                      />
                      <button
                        type="submit"
                        disabled={!commentInputs[post.id]?.trim()}
                        className="p-2.5 bg-gradient-to-r from-accent to-indigo-600 text-white rounded-xl hover:shadow-md hover:shadow-accent/20 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                      >
                        <Send size={12} />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Idea Creation Modal – premium frosted glass */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-white/30 animate-in fade-in zoom-in duration-200">
            {/* Modal Header – rich gradient */}
            <div className="relative bg-gradient-to-r from-accent via-indigo-600 to-purple-600 px-6 py-5 text-white flex justify-between items-center overflow-hidden">
              {/* Noise overlay in header */}
              <div className="noise absolute inset-0 opacity-[0.04] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-400/10 pointer-events-none" />
              <div className="relative flex items-center gap-3">
                <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                  <Lightbulb size={18} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Soumettre un concept innovant</h3>
                  <p className="text-[10px] text-white/60">Partagez votre vision avec la communauté</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="relative text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form – polished fields */}
            <form onSubmit={handleCreatePost} className="p-6 space-y-5 bg-white/80 backdrop-blur-sm">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Catégorie
                </label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gc-border/50 rounded-xl text-sm bg-white/90 focus:ring-2 focus:ring-accent/30 focus:border-accent/30 outline-none transition-all"
                >
                  {categories.filter(c => c !== 'Tous').map((cat) => (
                    <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Titre du Concept *
                </label>
                <input
                  type="text"
                  placeholder="Ex: SaaS de facturation assisté par IA pour Freelancers"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gc-border/50 rounded-xl text-sm bg-white/90 focus:ring-2 focus:ring-accent/30 focus:border-accent/30 outline-none transition-all placeholder:text-muted/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Description du Concept *
                </label>
                <textarea
                  placeholder="Présentez la problématique que vous adressez, votre idée de solution, vos objectifs, et les profils (freelancers, mentors ou co-fondateurs) que vous recherchez pour concrétiser ce projet..."
                  rows={6}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gc-border/50 rounded-xl text-sm bg-white/90 focus:ring-2 focus:ring-accent/30 focus:border-accent/30 outline-none transition-all resize-none placeholder:text-muted/40"
                />
              </div>

              {/* Submit Controls */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gc-border/30">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 border border-gc-border/50 text-muted hover:text-foreground text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newPostTitle.trim() || !newPostContent.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-accent to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Publier mon concept</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
