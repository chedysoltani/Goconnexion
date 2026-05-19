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

  return (
    <div className="max-w-6xl mx-auto p-6 h-full flex flex-col">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-accent via-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden shadow-lg flex-shrink-0">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 opacity-10">
          <Lightbulb size={240} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} className="text-amber-300" />
            <span>Incubateur Virtuel GoConnexions</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Partagez vos Idées & Propulsez votre Startup</h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Un espace interactif plus humain pour pitcher vos concepts innovants, recruter des associés talentueux, solliciter du mentorat et co-créer les entreprises de demain.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-gc-border shadow-sm flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Rechercher des projets ou mentors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gc-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-sm"
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
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-accent border-accent text-white shadow-sm'
                : 'bg-white border-gc-border text-muted hover:text-foreground hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted">Chargement des projets...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gc-border shadow-sm">
            <div className="w-16 h-16 bg-accent/5 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Compass size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Aucune idée dans cette catégorie</h3>
            <p className="text-muted text-sm max-w-md mx-auto mb-6">
              Soyez le premier à soumettre un concept de startup dans la catégorie {categoryFilter} pour inspirer les autres !
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors"
            >
              Proposer une Idée
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => {
              const hasLiked = post.likes?.some(like => like.userId === user?.id);
              return (
                <div key={post.id} className="bg-white rounded-2xl border border-gc-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeColor(post.category)}`}>
                        {post.category}
                      </span>
                      <span className="text-[10px] text-muted">
                        {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-foreground mb-2 line-clamp-1">
                      {post.title}
                    </h2>

                    <p className="text-muted text-xs leading-relaxed line-clamp-4 mb-4">
                      {post.content}
                    </p>

                    {/* Author Widget */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold">
                        {post.author.firstName[0]}{post.author.lastName[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {post.author.firstName} {post.author.lastName}
                        </p>
                        <p className="text-[10px] text-muted capitalize">
                          {post.author.role === 'freelancer' ? 'Freelancer' : 'Entrepreneur'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comments and Likes Container */}
                  <div className="bg-slate-50 rounded-b-2xl border-t border-gc-border p-4 space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 font-semibold transition-colors ${
                          hasLiked ? 'text-accent' : 'hover:text-foreground'
                        }`}
                      >
                        <ThumbsUp size={14} className={hasLiked ? 'fill-accent' : ''} />
                        <span>{post.likes?.length || 0} Likes</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span>{post.comments?.length || 0} Commentaires</span>
                      </div>
                    </div>

                    {/* Comments Stack */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-3 pt-2 max-h-36 overflow-y-auto scrollbar-thin">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="bg-white p-2.5 rounded-lg border border-gc-border text-[11px] leading-relaxed">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-foreground">
                                {comment.author.firstName} {comment.author.lastName}
                              </span>
                              <span className="text-[9px] text-muted">
                                {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                            </div>
                            <p className="text-slate-700">{comment.content}</p>
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
                        className="flex-1 px-3 py-1.5 border border-gc-border rounded-lg text-xs bg-white focus:ring-1 focus:ring-accent focus:border-transparent outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!commentInputs[post.id]?.trim()}
                        className="p-2 bg-accent text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
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

      {/* Idea Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gc-border animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-accent to-indigo-600 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-300" />
                <h3 className="font-bold text-base">Soumettre un concept innovant</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Catégorie
                </label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gc-border rounded-lg text-xs focus:ring-2 focus:ring-accent focus:border-transparent outline-none bg-slate-50"
                >
                  {categories.filter(c => c !== 'Tous').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Titre du Concept *
                </label>
                <input
                  type="text"
                  placeholder="Ex: SaaS de facturation assisté par IA pour Freelancers"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gc-border rounded-lg text-xs focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Description du Concept *
                </label>
                <textarea
                  placeholder="Présentez la problématique que vous adressez, votre idée de solution, vos objectifs, et les profils (freelancers, mentors ou co-fondateurs) que vous recherchez pour concrétiser ce projet..."
                  rows={6}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gc-border rounded-lg text-xs focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                />
              </div>

              {/* Submit Controls */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gc-border text-muted hover:text-foreground text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newPostTitle.trim() || !newPostContent.trim()}
                  className="px-5 py-2 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <span>Publier mon concept</span>
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
