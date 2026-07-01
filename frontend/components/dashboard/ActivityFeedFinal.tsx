'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api';

interface ActivityFeedProps {
  user: User | null;
}

export default function ActivityFeed({ user }: ActivityFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const data = await api.feed.list();
      setPosts(data);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffD = Math.floor(diffH / 24);
    if (diffD > 0) return `il y a ${diffD} jour${diffD > 1 ? 's' : ''}`;
    if (diffH > 0) return `il y a ${diffH} heure${diffH > 1 ? 's' : ''}`;
    return 'à l'instant';
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.feed.create({ content: newPost.trim() });
      setNewPost('');
      await fetchPosts();
    } catch {
      // silencieux
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.feed.toggleLike(postId);
      await fetchPosts();
    } catch {
      // silencieux
    }
  };

  return (
    <div className="flex-1 bg-gc-bg">
      {/* Zone de publication */}
      <div className="bg-white border-b border-gc-border p-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
            <span className="text-accent font-semibold text-sm">
              {user?.firstName ? user.firstName[0] : 'U'}
              {user?.lastName ? user.lastName[0] : 'U'}
            </span>
          </div>
          <form onSubmit={handlePostSubmit} className="flex-1 flex gap-3">
            <input
              type="text"
              placeholder="Partagez une actualité..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="flex-1 px-4 py-2 border border-gc-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newPost.trim() || submitting}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '...' : 'Publier'}
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-32" />
                      <div className="h-2 bg-gray-100 rounded w-20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl p-10 shadow-sm text-center">
              <p className="text-muted text-sm">Aucune publication pour l'instant.</p>
              <p className="text-muted text-xs mt-1">Soyez le premier à partager une actualité !</p>
            </div>
          ) : (
            posts.map((post) => {
              const author = post.author;
              const initials = author
                ? `${author.firstName?.[0] ?? ''}${author.lastName?.[0] ?? ''}`
                : 'U';
              const likesCount = post.likes?.length ?? 0;
              const commentsCount = post.comments?.length ?? 0;

              return (
                <div key={post.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {author?.avatarUrl ? (
                          <img
                            src={author.avatarUrl}
                            alt={author.firstName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center">
                            <span className="text-accent font-semibold text-sm">{initials}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {author ? `${author.firstName} ${author.lastName}` : 'Utilisateur'}
                          </p>
                          <p className="text-xs text-muted capitalize">
                            {author?.role?.toLowerCase() ?? ''}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-foreground leading-relaxed">{post.content}</p>
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="post"
                        className="mt-3 rounded-lg max-h-64 object-cover w-full"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 hover:text-accent transition-colors"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894L17 22H7l-3-10h2.236a2 2 0 001.789-1.106L10 6a2 2 0 012-2h0a2 2 0 012 2v4z" />
                      </svg>
                      <span>{likesCount}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-accent transition-colors">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{commentsCount}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
