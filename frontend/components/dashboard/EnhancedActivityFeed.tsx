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
    <div className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100 min-h-full">
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Toggle Public / Profile */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveFilter('public')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeFilter === 'public'
                ? 'bg-accent text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Globe size={14} />
            <span>Fil Public</span>
          </button>
          <button
            onClick={() => setActiveFilter('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeFilter === 'profile'
                ? 'bg-accent text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <UserIcon size={14} />
            <span>Mon Profil</span>
          </button>
        </div>

        {/* Create Post Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 p-4 sm:p-5">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>

            <div className="flex-1 min-w-0">
              <form onSubmit={handleCreatePost} className="space-y-3">
                <textarea
                  placeholder="Partagez votre expertise, une réussite ou une actualité..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none transition-all placeholder-slate-400 text-xs bg-slate-50"
                  rows={3}
                />

                {showImageInput && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <label className="block text-[10px] font-bold text-slate-700">Lien URL de l'image (ex: Unsplash) :</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setNewImageUrl('');
                          setShowImageInput(false);
                        }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-semibold text-[11px]"
                  >
                    <ImageIcon size={14} className="text-accent" />
                    <span>Ajouter une photo</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!newPostContent.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-accent hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-bold text-[11px] shadow-sm"
                  >
                    <Send size={12} />
                    <span>Publier</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-muted">Chargement de votre fil d'activités...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <Sparkles className="text-accent mx-auto mb-3" size={28} />
            <h3 className="text-xs font-bold text-slate-900 mb-1">Aucune publication</h3>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Soyez le premier à partager une actualité ou une opportunité de collaboration !
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const liked = isLikedByCurrentUser(post);
              const isExpanded = !!expandedComments[post.id];
              
              return (
                <article
                  key={post.id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">
                        {post.author.firstName[0]}{post.author.lastName[0]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900 text-xs">
                            {post.author.firstName} {post.author.lastName}
                          </h3>
                          <span className="px-2 py-0.5 text-[8px] font-bold rounded-full bg-slate-100 text-slate-600 capitalize">
                            {post.author.role.toLowerCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <p className="text-slate-800 leading-relaxed text-xs">
                        {post.content}
                      </p>
                    </div>

                    {/* Optional Image */}
                    {post.imageUrl && (
                      <div className="mb-4 -mx-4 sm:-mx-5 border-y border-slate-100 bg-slate-50 max-h-96 overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt="Post attachment"
                          className="w-full h-auto object-contain max-h-96"
                        />
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex gap-4">
                        <span>{post.likes.length} j'aime</span>
                        <span 
                          className="cursor-pointer hover:underline"
                          onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !isExpanded }))}
                        >
                          {post.comments.length} commentaire{post.comments.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="px-4 py-2 border-t border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        liked
                          ? 'text-red-500 bg-red-50 hover:bg-red-100'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                      <span>J'aime</span>
                    </button>
                    <button
                      onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !isExpanded }))}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-[11px] font-bold transition-all"
                    >
                      <MessageCircle size={14} />
                      <span>Commenter</span>
                    </button>
                  </div>

                  {/* Expanded Comments */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
                      {/* Comments List */}
                      {post.comments.length > 0 && (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2.5 items-start">
                              <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center text-accent text-[10px] font-bold flex-shrink-0">
                                {comment.author.firstName[0]}{comment.author.lastName[0]}
                              </div>
                              <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm text-[11px]">
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="font-semibold text-slate-900">{comment.author.firstName} {comment.author.lastName}</span>
                                  <span className="text-[8px] text-slate-400">{formatTimeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="text-slate-700 leading-normal">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Input Form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ajouter un commentaire..."
                          value={postCommentsInputs[post.id] || ''}
                          onChange={(e) => setPostCommentsInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-accent focus:border-transparent outline-none bg-white"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!postCommentsInputs[post.id]?.trim()}
                          className="px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 text-[10px] font-bold shadow-sm"
                        >
                          <Send size={10} />
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
