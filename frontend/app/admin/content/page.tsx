'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Copy, Check, ThumbsUp, ThumbsDown, Rocket, ChevronDown, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type ContentType = 'LINKEDIN_POST' | 'FACEBOOK_POST' | 'BLOG_ARTICLE';
type ContentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';

interface AgentContentItem {
  id: string;
  type: ContentType;
  status: ContentStatus;
  title: string | null;
  body: string;
  targetAudience: string | null;
  model: string;
  publishedAt: string | null;
  createdAt: string;
  reviewedBy: { id: string; firstName: string; lastName: string } | null;
}

const TYPE_OPTIONS: Array<{ value: ContentType; label: string; icon: string; hint: string }> = [
  { value: 'LINKEDIN_POST', label: 'LinkedIn', icon: '💼', hint: 'Ton professionnel' },
  { value: 'FACEBOOK_POST', label: 'Facebook', icon: '📘', hint: 'Ton conversationnel' },
  { value: 'BLOG_ARTICLE', label: 'Article de blog', icon: '📝', hint: 'Format long' },
];
const TYPE_LABELS: Record<ContentType, string> = {
  LINKEDIN_POST: 'LinkedIn',
  FACEBOOK_POST: 'Facebook',
  BLOG_ARTICLE: 'Article de blog',
};
const TYPE_ICONS: Record<ContentType, string> = {
  LINKEDIN_POST: '💼',
  FACEBOOK_POST: '📘',
  BLOG_ARTICLE: '📝',
};

const STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING_REVIEW: 'À valider',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  PUBLISHED: 'Publié',
};

const STATUS_COLORS: Record<ContentStatus, string> = {
  DRAFT: '#94a3b8',
  PENDING_REVIEW: '#f59e0b',
  APPROVED: '#22c55e',
  REJECTED: '#ef4444',
  PUBLISHED: '#2563eb',
};

const FILTERS: Array<{ label: string; value: ContentStatus | 'ALL' }> = [
  { label: 'Tous', value: 'ALL' },
  { label: 'À valider', value: 'PENDING_REVIEW' },
  { label: 'Approuvés', value: 'APPROVED' },
  { label: 'Rejetés', value: 'REJECTED' },
  { label: 'Publiés', value: 'PUBLISHED' },
];

export default function AdminContentPage() {
  const router = useRouter();
  const [items, setItems] = useState<AgentContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ContentStatus | 'ALL'>('PENDING_REVIEW');

  // Formulaire de génération
  const [genType, setGenType] = useState<ContentType>('LINKEDIN_POST');
  const [genTopic, setGenTopic] = useState('');
  const [genAudience, setGenAudience] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Ligne développée + édition
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadItems(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    loadItems(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadItems = async (status: ContentStatus | 'ALL') => {
    setLoading(true);
    try {
      const data = await api.agentContent.list(status === 'ALL' ? undefined : status);
      setItems(data ?? []);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    setGenerating(true);
    setGenError(null);
    try {
      const created: AgentContentItem = await api.agentContent.generate({
        type: genType,
        topic: genTopic.trim(),
        targetAudience: genAudience.trim() || undefined,
      });
      setGenTopic('');
      setGenAudience('');
      if (filter === 'ALL' || filter === 'PENDING_REVIEW') {
        setItems((prev) => [created, ...prev]);
      }
      setExpandedId(created.id);
      setEditTitle(created.title ?? '');
      setEditBody(created.body);
    } catch (err: any) {
      setGenError(err?.message || 'Échec de la génération. Réessaie dans un instant.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleExpand = (item: AgentContentItem) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);
    setEditTitle(item.title ?? '');
    setEditBody(item.body);
  };

  const applyStatus = async (id: string, status: ContentStatus) => {
    setSavingId(id);
    try {
      const updated: AgentContentItem = await api.agentContent.update(id, {
        title: editTitle || undefined,
        body: editBody,
        status,
      });
      setItems((prev) =>
        filter !== 'ALL' && filter !== status
          ? prev.filter((i) => i.id !== id)
          : prev.map((i) => (i.id === id ? updated : i)),
      );
      setExpandedId(null);
    } catch {
      // silencieux
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveOnly = async (id: string) => {
    setSavingId(id);
    try {
      const updated: AgentContentItem = await api.agentContent.update(id, { title: editTitle || undefined, body: editBody });
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch {
      // silencieux
    } finally {
      setSavingId(null);
    }
  };

  const handleCopy = (item: AgentContentItem) => {
    const text = item.title ? `${item.title}\n\n${item.body}` : item.body;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  const formatDate = (d: string | null) =>
    d ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d)) : '—';

  const pendingCount = items.filter((i) => i.status === 'PENDING_REVIEW').length;

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--bg, #f8fafc)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.6, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-lg shadow-lg"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}
            >
              <Sparkles size={20} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Contenu marketing IA</h1>
              <p className="text-sm text-slate-500">Génère, relis et valide les publications avant diffusion manuelle</p>
            </div>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={15} />
            Panel admin
          </Link>
        </motion.div>

        {/* Formulaire de génération */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative rounded-2xl p-6 mb-8 overflow-hidden"
          style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-md, 0 4px 12px rgba(15,23,42,0.08))' }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)' }}
          />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-blue-500" />
            Générer un nouveau contenu
          </h2>

          {/* Sélecteur de type — cartes cliquables */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
            {TYPE_OPTIONS.map((opt) => {
              const selected = genType === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  onClick={() => setGenType(opt.value)}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  className="relative flex items-center gap-2.5 rounded-xl p-3 text-left transition-colors"
                  style={{
                    border: selected ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                    background: selected ? '#eff6ff' : '#fff',
                  }}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-700 truncate">{opt.label}</span>
                    <span className="block text-[11px] text-slate-400">{opt.hint}</span>
                  </span>
                  {selected && (
                    <motion.span
                      layoutId="content-type-check"
                      className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: '#3b82f6' }}
                    >
                      <Check size={11} color="#fff" strokeWidth={3} />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              value={genAudience}
              onChange={(e) => setGenAudience(e.target.value)}
              placeholder="Public cible (optionnel — ex: freelances tech)"
              className="dash-input md:col-span-3"
            />
          </div>
          <textarea
            value={genTopic}
            onChange={(e) => setGenTopic(e.target.value)}
            placeholder="Sujet du post/article (ex: pourquoi les freelances devraient soigner leur réseau professionnel)"
            rows={2}
            className="dash-input mb-3"
          />
          <AnimatePresence>
            {genError && (
              <motion.p
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-500 mb-3"
              >
                {genError}
              </motion.p>
            )}
          </AnimatePresence>
          <motion.button
            onClick={handleGenerate}
            disabled={generating || !genTopic.trim()}
            whileHover={!generating && genTopic.trim() ? { y: -1 } : {}}
            whileTap={!generating && genTopic.trim() ? { scale: 0.97 } : {}}
            className="btn-glow flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Génération en cours…
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Générer
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Filtres — pilule animée */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-2 mb-4"
        >
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="relative text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors"
                style={{ color: active ? '#fff' : '#64748b', border: active ? 'none' : '1px solid #e2e8f0' }}
              >
                {active && (
                  <motion.span
                    layoutId="content-filter-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: '#2563eb' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">
                  {f.label}
                  {f.value === 'PENDING_REVIEW' && pendingCount > 0 && (
                    <span className="ml-1.5 opacity-80">· {pendingCount}</span>
                  )}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Liste */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[68px] rounded-2xl shimmer" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-10 text-center border border-slate-100"
          >
            <div className="text-3xl mb-2 float-anim inline-block">📭</div>
            <p className="text-sm text-slate-400">Aucun contenu dans cette catégorie.</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item, idx) => {
                const expanded = expandedId === item.id;
                const dirty = expanded && (editBody !== item.body || editTitle !== (item.title ?? ''));
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.3), layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover-lift"
                  >
                    <button onClick={() => toggleExpand(item)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex items-center gap-3">
                        <span className="text-lg flex-shrink-0">{TYPE_ICONS[item.type]}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {TYPE_LABELS[item.type]}
                            </span>
                            <span
                              className="relative text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                              style={{ background: `${STATUS_COLORS[item.status]}15`, color: STATUS_COLORS[item.status] }}
                            >
                              {item.status === 'PENDING_REVIEW' && (
                                <span className="relative w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[item.status] }}>
                                  <span className="notif-pulse absolute inset-0 rounded-full" />
                                </span>
                              )}
                              {STATUS_LABELS[item.status]}
                            </span>
                            <span className="text-[11px] text-slate-400">{formatDate(item.createdAt)}</span>
                          </div>
                          <p className="text-sm text-slate-700 truncate">{item.title || item.body.slice(0, 100)}</p>
                        </div>
                      </div>
                      <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-slate-400 flex-shrink-0">
                        <ChevronDown size={16} />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                            <input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Titre (optionnel, utile pour les articles de blog)"
                              className="dash-input mb-2 font-semibold"
                            />
                            <textarea
                              value={editBody}
                              onChange={(e) => setEditBody(e.target.value)}
                              rows={item.type === 'BLOG_ARTICLE' ? 14 : 6}
                              className="dash-input mb-3 font-mono text-[13px]"
                            />

                            <div className="flex flex-wrap items-center gap-2">
                              <motion.button
                                whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                                onClick={() => handleCopy(item)}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300"
                              >
                                <AnimatePresence mode="wait" initial={false}>
                                  {copiedId === item.id ? (
                                    <motion.span key="copied" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="flex items-center gap-1.5 text-green-600">
                                      <Check size={13} /> Copié
                                    </motion.span>
                                  ) : (
                                    <motion.span key="copy" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="flex items-center gap-1.5">
                                      <Copy size={13} /> Copier le texte
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </motion.button>

                              {dirty && (
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                  whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                                  onClick={() => handleSaveOnly(item.id)}
                                  disabled={savingId === item.id}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"
                                >
                                  Enregistrer les modifications
                                </motion.button>
                              )}

                              {item.status === 'PENDING_REVIEW' && (
                                <>
                                  <motion.button
                                    whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                                    onClick={() => applyStatus(item.id, 'APPROVED')}
                                    disabled={savingId === item.id}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
                                    style={{ background: '#22c55e' }}
                                  >
                                    <ThumbsUp size={13} /> Approuver
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                                    onClick={() => applyStatus(item.id, 'REJECTED')}
                                    disabled={savingId === item.id}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
                                    style={{ background: '#ef4444' }}
                                  >
                                    <ThumbsDown size={13} /> Rejeter
                                  </motion.button>
                                </>
                              )}

                              {item.status === 'APPROVED' && (
                                <motion.button
                                  whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                                  onClick={() => applyStatus(item.id, 'PUBLISHED')}
                                  disabled={savingId === item.id}
                                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
                                  style={{ background: '#2563eb' }}
                                >
                                  <Rocket size={13} /> Marquer comme publié
                                </motion.button>
                              )}

                              {savingId === item.id && <Loader2 size={14} className="animate-spin text-slate-400" />}
                            </div>

                            <div className="mt-3 text-[11px] text-slate-400 space-y-0.5">
                              {item.targetAudience && <p>Public cible : {item.targetAudience}</p>}
                              <p>Modèle : {item.model}</p>
                              {item.reviewedBy && <p>Relu par {item.reviewedBy.firstName} {item.reviewedBy.lastName}</p>}
                              {item.publishedAt && <p>Publié le {formatDate(item.publishedAt)}</p>}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
