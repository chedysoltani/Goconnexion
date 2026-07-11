'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { io } from 'socket.io-client';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import { FeedSkeleton } from '@/components/ui/skeleton';
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Send,
  Globe,
  Sparkles,
  MoreHorizontal,
  Bookmark,
  Link,
  Hash,
  TrendingUp,
  UserPlus,
  BarChart2,
  ChevronDown,
} from 'lucide-react';

interface EnhancedActivityFeedProps {
  user: User | null;
}

interface FeedComment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; avatarUrl?: string };
}

interface FeedPost {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; avatarUrl?: string; role: string };
  likes: Array<{ userId: string }>;
  comments: FeedComment[];
}

// ── Role badge config ──────────────────────────────────────────
const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  entrepreneur: { label: 'Entrepreneur', color: '#6d28d9', bg: 'rgba(139,92,246,0.1)' },
  freelancer: { label: 'Freelancer', color: '#1d4ed8', bg: 'rgba(59,130,246,0.1)' },
  freelance: { label: 'Freelancer', color: '#1d4ed8', bg: 'rgba(59,130,246,0.1)' },
  investor: { label: 'Investisseur', color: '#065f46', bg: 'rgba(16,185,129,0.1)' },
  investisseur: { label: 'Investisseur', color: '#065f46', bg: 'rgba(16,185,129,0.1)' },
  mentor: { label: 'Mentor', color: '#92400e', bg: 'rgba(245,158,11,0.1)' },
  user: { label: 'Membre', color: '#3730a3', bg: 'rgba(99,102,241,0.1)' },
};

const getRoleBadge = (role: string) =>
  ROLE_BADGE[role?.toLowerCase()] ?? { label: role, color: '#475569', bg: 'rgba(100,116,139,0.1)' };

const getInitials = (first: string, last: string) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();

const getAvatarGradient = (role: string) => {
  const r = role?.toLowerCase();
  if (r === 'entrepreneur') return 'linear-gradient(135deg,#8b5cf6,#6d28d9)';
  if (r === 'freelancer' || r === 'freelance') return 'linear-gradient(135deg,#60a5fa,#1d4ed8)';
  if (r === 'mentor') return 'linear-gradient(135deg,#fbbf24,#92400e)';
  if (r === 'investor' || r === 'investisseur') return 'linear-gradient(135deg,#34d399,#065f46)';
  return 'linear-gradient(135deg,#818cf8,#3730a3)';
};

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}j`;
  if (hours > 0) return `${hours}h`;
  if (mins > 0) return `${mins}min`;
  return 'maintenant';
}

// ── Avatar ─────────────────────────────────────────────────────
function Avatar({
  firstName,
  lastName,
  role,
  size = 40,
}: {
  firstName: string;
  lastName: string;
  role: string;
  size?: number;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.06 }}
      className="flex-shrink-0 flex items-center justify-center text-white font-bold rounded-full ring-2 ring-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.28,
        background: getAvatarGradient(role),
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      {getInitials(firstName, lastName)}
    </motion.div>
  );
}

// ── PostCard ───────────────────────────────────────────────────
function PostCard({
  post,
  currentUserId,
  onToggleLike,
  onAddComment,
  index,
}: {
  post: FeedPost;
  currentUserId?: string;
  onToggleLike: (id: string) => void;
  onAddComment: (id: string, text: string) => void;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localLiked, setLocalLiked] = useState(post.likes.some(l => l.userId === currentUserId));
  const [localLikeCount, setLocalLikeCount] = useState(post.likes.length);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Resynchronise l'état local quand les likes du post changent (ex: mise à jour reçue
  // en temps réel via socket pour un like posé par un autre utilisateur).
  useEffect(() => {
    setLocalLiked(post.likes.some(l => l.userId === currentUserId));
    setLocalLikeCount(post.likes.length);
  }, [post.likes, currentUserId]);

  const roleBadge = getRoleBadge(post.author.role);

  const handleLike = () => {
    const next = !localLiked;
    setLocalLiked(next);
    setLocalLikeCount(c => c + (next ? 1 : -1));
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 600);
    onToggleLike(post.id);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText('');
  };

  const handleShare = async () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post de ${post.author.firstName} ${post.author.lastName}`,
          text: post.content.slice(0, 100),
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      }
    } catch { }
  };

  const handleSave = async () => {
    const next = !saved;
    setSaved(next);
    try {
      const { api } = await import('@/lib/api');
      await api.feed.toggleSave(post.id);
    } catch {
      setSaved(!next);
    }
  };

  const actions = [
    {
      label: "J'aime",
      active: localLiked,
      activeColor: '#ef4444',
      icon: (
        <motion.div animate={likeAnimating ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.4 }}>
          <Heart
            size={15}
            className={localLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}
          />
        </motion.div>
      ),
      onClick: handleLike,
    },
    {
      label: 'Commenter',
      active: showComments,
      activeColor: '#3b82f6',
      icon: <MessageCircle size={15} className={showComments ? 'text-blue-500' : 'text-slate-400'} />,
      onClick: () => setShowComments(v => !v),
    },
    {
      label: shareToast ? 'Lien copié !' : 'Partager',
      active: shareToast,
      activeColor: '#10b981',
      icon: <Share2 size={15} className={shareToast ? 'text-emerald-500' : 'text-slate-400'} />,
      onClick: handleShare,
    },
    {
      label: 'Sauvegarder',
      active: saved,
      activeColor: '#f59e0b',
      icon: <Bookmark size={15} className={saved ? 'fill-amber-500 text-amber-500' : 'text-slate-400'} />,
      onClick: handleSave,
    },
  ];

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group"
      style={{
        background: 'white',
        border: '1px solid #e8edf3',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
      whileHover={{
        boxShadow: '0 4px 16px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.04)',
        borderColor: '#d1dae6',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <Avatar
              firstName={post.author.firstName}
              lastName={post.author.lastName}
              role={post.author.role}
              size={42}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13.5px] font-semibold text-slate-800">
                  {post.author.firstName} {post.author.lastName}
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: roleBadge.color, background: roleBadge.bg }}
                >
                  {roleBadge.label}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                <Globe size={10} />
                <span className="text-[11px]">
                  {formatTimeAgo(post.createdAt)} · Public
                </span>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ background: '#f1f5f9' }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-400"
          >
            <MoreHorizontal size={16} />
          </motion.button>
        </div>

        {/* Content */}
        <p className="text-[13.5px] leading-[1.7] text-slate-700 whitespace-pre-wrap mb-4">
          {post.content}
        </p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="overflow-hidden" style={{ borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <img
            src={post.imageUrl}
            alt=""
            className="w-full object-contain max-h-96"
            loading="lazy"
          />
        </div>
      )}

      {/* Stats row */}
      {(localLikeCount > 0 || post.comments.length > 0) && (
        <div
          className="mx-5 py-2.5 flex items-center justify-between"
          style={{ borderBottom: '1px solid #f1f5f9' }}
        >
          {localLikeCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <span
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}
              >
                <Heart size={9} className="fill-white text-white" />
              </span>
              <span className="text-[11.5px] text-slate-400">{localLikeCount}</span>
            </div>
          ) : <div />}
          {post.comments.length > 0 && (
            <button
              onClick={() => setShowComments(v => !v)}
              className="text-[11.5px] text-slate-400 hover:text-blue-500 transition-colors"
            >
              {post.comments.length} commentaire{post.comments.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex px-2 py-1" style={{ borderBottom: showComments ? '1px solid #f1f5f9' : 'none' }}>
        {actions.map(action => (
          <motion.button
            key={action.label}
            onClick={action.onClick}
            whileHover={{ background: `${action.activeColor}0d` }}
            whileTap={{ scale: 0.93 }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
          >
            {action.icon}
            <span
              className="text-[11.5px] font-semibold hidden sm:inline"
              style={{ color: action.active ? action.activeColor : '#94a3b8' }}
            >
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 py-4 space-y-3">
              {post.comments.map((comment, i) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  className="flex gap-2.5"
                >
                  <Avatar
                    firstName={comment.author.firstName}
                    lastName={comment.author.lastName}
                    role="user"
                    size={30}
                  />
                  <div
                    className="flex-1 rounded-2xl px-3.5 py-2.5"
                    style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[12px] font-semibold text-slate-800">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <span className="text-[10px] text-slate-300">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-slate-600">
                      {comment.content}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Comment input */}
              <div className="flex gap-2 items-center pt-1">
                <input
                  type="text"
                  placeholder="Écrire un commentaire..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleComment()}
                  className="flex-1 px-3.5 py-2 rounded-xl text-[12.5px] outline-none transition-all"
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    color: '#0f172a',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#93c5fd')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
                <motion.button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  whileHover={commentText.trim() ? { scale: 1.05 } : {}}
                  whileTap={commentText.trim() ? { scale: 0.95 } : {}}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-30 transition-all"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}
                >
                  <Send size={13} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ── CreatePostCard ─────────────────────────────────────────────
function CreatePostCard({ user, onCreated }: { user: User | null; onCreated: () => void }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleAddLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    setContent((c) => (c ? `${c}\n${url}` : url));
    setLinkUrl('');
    setShowLink(false);
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploads.upload(file);
      setImageUrl(`${process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001'}${res.file.path}`);
    } catch { }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      await api.feed.create({ content, imageUrl: imageUrl || undefined });
      setContent('');
      setImageUrl('');
      setShowImage(false);
      setLinkUrl('');
      setShowLink(false);
      onCreated();
    } finally {
      setPosting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'white',
        border: '1px solid #e8edf3',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        marginBottom: 14,
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="px-5 pt-4 pb-3">
          <div className="flex gap-3">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-white"
              style={{
                background: getAvatarGradient(user?.role ?? 'user'),
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              {initials}
            </div>

            {/* Textarea */}
            <div className="flex-1">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Partagez une actualité, une réussite ou une idée..."
                rows={focused || content ? 3 : 1}
                className="w-full resize-none outline-none text-[13.5px] leading-relaxed bg-transparent placeholder:text-slate-400 transition-all duration-300"
                style={{ color: '#1e293b' }}
              />
            </div>
          </div>

          {/* Image section */}
          <AnimatePresence>
            {showImage && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden', marginTop: 10 }}
              >
                <div
                  className="rounded-xl p-3 flex items-center gap-2"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => document.getElementById('post-img-input')?.click()}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-blue-600 flex items-center gap-1.5 flex-shrink-0"
                    style={{ background: 'white', border: '1px solid #e2e8f0' }}
                  >
                    <ImageIcon size={12} />
                    {imageUrl ? 'Changer' : 'Importer'}
                  </motion.button>
                  <input id="post-img-input" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  <input
                    type="text"
                    placeholder="ou coller une URL..."
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-[11.5px] outline-none min-w-0"
                    style={{ background: 'white', border: '1px solid #e2e8f0', color: '#0f172a' }}
                  />
                  <button
                    type="button"
                    onClick={() => { setImageUrl(''); setShowImage(false); }}
                    className="text-[11px] font-medium text-red-400 hover:text-red-500 flex-shrink-0"
                  >
                    Annuler
                  </button>
                </div>
                {imageUrl && (
                  <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Link section */}
          <AnimatePresence>
            {showLink && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden', marginTop: 10 }}
              >
                <div
                  className="rounded-xl p-3 flex items-center gap-2"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <input
                    type="url"
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-[11.5px] outline-none min-w-0"
                    style={{ background: 'white', border: '1px solid #e2e8f0', color: '#0f172a' }}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddLink}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-blue-600 flex-shrink-0"
                    style={{ background: 'white', border: '1px solid #e2e8f0' }}
                  >
                    Ajouter
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => { setLinkUrl(''); setShowLink(false); }}
                    className="text-[11px] font-medium text-red-400 hover:text-red-500 flex-shrink-0"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid #f1f5f9' }}
        >
          <div className="flex gap-1">
            <motion.button
              type="button"
              onClick={() => setShowImage(v => !v)}
              whileHover={{ background: 'rgba(59,130,246,0.06)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-slate-500"
            >
              <ImageIcon size={14} className="text-blue-500" />
              Photo
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setShowLink(v => !v)}
              whileHover={{ background: 'rgba(59,130,246,0.06)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-slate-500"
            >
              <Link size={14} className="text-blue-500" />
              Lien
            </motion.button>
          </div>

          <motion.button
            type="submit"
            disabled={!content.trim() || posting}
            animate={content.trim() ? { scale: 1, opacity: 1 } : { scale: 0.97, opacity: 0.5 }}
            whileHover={content.trim() ? { scale: 1.03 } : {}}
            whileTap={content.trim() ? { scale: 0.97 } : {}}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[12.5px] font-bold text-white disabled:cursor-not-allowed transition-all"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}
          >
            {posting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : <Send size={13} />}
            Publier
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

// ── FilterTabs ─────────────────────────────────────────────────
function FilterTabs({
  active,
  onChange,
}: {
  active: 'public' | 'profile';
  onChange: (v: 'public' | 'profile') => void;
}) {
  const tabs = [
    {
      id: 'public' as const,
      label: 'Fil public',
      icon: <Globe size={13} />,
    },
    {
      id: 'profile' as const,
      label: 'Mes posts',
      icon: (
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="inline-flex p-1 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid #e8edf3',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
      }}
    >
      {tabs.map(tab => (
        <motion.button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="relative flex items-center gap-1.5 px-5 py-2 rounded-xl text-[12.5px] font-semibold z-10"
          style={{ color: active === tab.id ? 'white' : '#64748b' }}
          whileTap={{ scale: 0.97 }}
        >
          {active === tab.id && (
            <motion.div
              layoutId="tab-pill"
              className="absolute inset-0 rounded-xl"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// ── EmptyState ─────────────────────────────────────────────────
function EmptyState({ filter }: { filter: 'public' | 'profile' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center py-16"
      style={{
        background: 'white',
        border: '1px solid #e8edf3',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
      }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)' }}
      >
        <Sparkles size={22} className="text-blue-500" />
      </motion.div>
      <h3 className="text-[14px] font-bold text-slate-800 mb-2">
        {filter === 'profile' ? 'Aucune publication' : 'Le fil est vide'}
      </h3>
      <p className="text-[12.5px] text-slate-400 max-w-xs mx-auto leading-relaxed">
        {filter === 'profile'
          ? 'Partagez votre première publication pour la voir ici.'
          : 'Soyez le premier à publier quelque chose ici !'}
      </p>
    </motion.div>
  );
}

// ── RightSidebar ───────────────────────────────────────────────
interface TrendingTag { tag: string; count: number }

function RightSidebar({ user }: { user: User | null }) {
  const [connectionsCount, setConnectionsCount] = useState<number | null>(null);
  const [trending, setTrending] = useState<TrendingTag[]>([]);

  useEffect(() => {
    if (!user) return;
    api.connections.friends()
      .then((friends: any[]) => setConnectionsCount(friends.length))
      .catch(() => setConnectionsCount(null));
    api.feed.trending()
      .then((tags: TrendingTag[]) => setTrending(tags))
      .catch(() => setTrending([]));
  }, [user]);

  return (
    <div className="space-y-4" style={{ width: 240, flexShrink: 0 }}>
      {/* Profile card */}
      {user && (
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: 'white',
            border: '1px solid #e8edf3',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
          }}
        >
          {/* Banner */}
          <div
            className="h-14"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}
          />
          <div className="px-4 pb-4">
            <div className="flex items-end gap-3 -mt-5 mb-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[13px] font-bold ring-2 ring-white flex-shrink-0"
                style={{
                  background: getAvatarGradient(user.role ?? 'user'),
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
              </div>
              <div className="mb-0.5">
                <div className="text-[13px] font-bold text-slate-800 leading-tight">
                  {user.firstName} {user.lastName}
                </div>
                <span
                  className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ ...getRoleBadge(user.role ?? 'user') as any, color: getRoleBadge(user.role ?? 'user').color, background: getRoleBadge(user.role ?? 'user').bg }}
                >
                  {getRoleBadge(user.role ?? 'user').label}
                </span>
              </div>
            </div>
            <div
              className="rounded-xl p-3 grid grid-cols-2 gap-3"
              style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
            >
              {[
                { label: 'Vues du profil', value: '—', icon: <BarChart2 size={12} /> },
                { label: 'Connexions', value: connectionsCount === null ? '—' : String(connectionsCount), icon: <UserPlus size={12} /> },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-[18px] font-bold text-slate-800">{stat.value}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Trending */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          background: 'white',
          border: '1px solid #e8edf3',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        }}
      >
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid #f1f5f9' }}
        >
          <TrendingUp size={14} className="text-blue-500" />
          <span className="text-[12.5px] font-semibold text-slate-700">Tendances</span>
        </div>
        {trending.length === 0 ? (
          <div className="px-4 py-3 text-[11px] text-slate-400">
            Aucune tendance pour l'instant
          </div>
        ) : (
          trending.map((item, i) => (
            <div
              key={item.tag}
              className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
              style={{ borderBottom: i < trending.length - 1 ? '1px solid #f8fafc' : 'none' }}
            >
              <div className="flex items-center gap-1.5 text-blue-600 text-[12px] font-semibold mb-0.5">
                <Hash size={11} />
                {item.tag.slice(1)}
              </div>
              <div className="text-[10.5px] text-slate-400">
                {item.count} post{item.count > 1 ? 's' : ''} cette semaine
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}

// ── Ad Card ────────────────────────────────────────────────────
interface FeedAd {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  placement: string;
  advertiser: { firstName: string; lastName: string };
}

function AdCard({ ad }: { ad: FeedAd }) {
  const adRef = useRef<HTMLDivElement>(null);
  const inView = useInView(adRef, { once: true });

  useEffect(() => {
    if (inView) { api.advertisements.trackImpression(ad.id).catch(() => {}); }
  }, [inView, ad.id]);

  const handleClick = () => {
    api.advertisements.trackClick(ad.id).catch(() => {});
    if (ad.targetUrl) {
      const url = ad.targetUrl.startsWith('http') ? ad.targetUrl : `https://${ad.targetUrl}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      ref={adRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', border: '1.5px solid rgba(245,158,11,0.25)', boxShadow: '0 2px 16px rgba(245,158,11,0.08)' }}
    >
      {ad.imageUrl && (
        <div className="h-40 overflow-hidden">
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706' }}>
            ✦ Sponsorisé
          </span>
          <span className="text-[10px] text-slate-400">{ad.advertiser.firstName} {ad.advertiser.lastName}</span>
        </div>
        <h3 className="font-bold text-slate-800 text-[14px] mb-1">{ad.title}</h3>
        {ad.description && <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">{ad.description}</p>}
        {ad.targetUrl && (
          <button onClick={handleClick}
            className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
            En savoir plus →
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function EnhancedActivityFeed({ user }: EnhancedActivityFeedProps) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [ads, setAds] = useState<FeedAd[]>([]);
  const [activeFilter, setActiveFilter] = useState<'public' | 'profile'>('public');
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const [data, adsData] = await Promise.all([
        api.feed.list(),
        api.advertisements.list('FEED').catch(() => []),
      ]);
      setPosts(data);
      setAds(adsData);
    } catch {
      console.error('Feed fetch error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchFeed(); }, [user]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket'],
    });

    socket.on('postLikeUpdated', ({ postId, userId, liked }: { postId: string; userId: string; liked: boolean }) => {
      setPosts((prev) => prev.map((p) => {
        if (p.id !== postId) return p;
        const already = p.likes.some((l) => l.userId === userId);
        if (liked && !already) return { ...p, likes: [...p.likes, { userId }] };
        if (!liked && already) return { ...p, likes: p.likes.filter((l) => l.userId !== userId) };
        return p;
      }));
    });

    socket.on('postCommentAdded', ({ postId, comment }: { postId: string; comment: FeedComment }) => {
      setPosts((prev) => prev.map((p) => {
        if (p.id !== postId) return p;
        if (p.comments.some((c) => c.id === comment.id)) return p;
        return { ...p, comments: [...p.comments, comment] };
      }));
    });

    return () => { socket.disconnect(); };
  }, []);

  const filtered = posts.filter(p =>
    activeFilter === 'profile' ? p.author.id === user?.id : true
  );

  const handleToggleLike = async (postId: string) => {
    try { await api.feed.toggleLike(postId); } catch { }
  };

  const handleAddComment = async (postId: string, text: string) => {
    try {
      await api.feed.addComment(postId, text);
      await fetchFeed();
    } catch { }
  };

  return (
    <div style={{ background: '#f4f7fb', minHeight: '100%' }}>
      <div
        className="mx-auto py-7 px-4"
        style={{ maxWidth: 1040 }}
      >
        {/* Tabs */}
        <div className="flex justify-center mb-5">
          <FilterTabs active={activeFilter} onChange={setActiveFilter} />
        </div>

        {/* Main layout: feed + right sidebar */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Feed column */}
          <div className="flex-1 min-w-0">
            <CreatePostCard user={user} onCreated={fetchFeed} />

            {isLoading ? (
              <FeedSkeleton />
            ) : filtered.length === 0 ? (
              <EmptyState filter={activeFilter} />
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filtered.reduce<React.ReactNode[]>((acc, post, i) => {
                    acc.push(
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={user?.id}
                        onToggleLike={handleToggleLike}
                        onAddComment={handleAddComment}
                        index={i}
                      />
                    );
                    // inject one ad after every 3rd post
                    if ((i + 1) % 3 === 0 && ads.length > 0) {
                      const ad = ads[Math.floor((i + 1) / 3 - 1) % ads.length];
                      acc.push(<AdCard key={`ad-${ad.id}-${i}`} ad={ad} />);
                    }
                    return acc;
                  }, [])}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right sidebar — hidden on mobile */}
          <div className="hidden lg:block">
            <RightSidebar user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}