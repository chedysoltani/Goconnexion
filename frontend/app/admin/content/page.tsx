'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

const TYPE_LABELS: Record<ContentType, string> = {
  LINKEDIN_POST: 'LinkedIn',
  FACEBOOK_POST: 'Facebook',
  BLOG_ARTICLE: 'Article de blog',
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

  return (
    <div className="min-h-screen p-8" style={{ background: '#f8fafc' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>✍️</div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Contenu marketing IA</h1>
              <p className="text-sm text-slate-500">Génère, relis et valide les publications avant diffusion manuelle</p>
            </div>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-slate-500 hover:text-slate-700">
            ← Retour au panel admin
          </Link>
        </div>

        {/* Formulaire de génération */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Générer un nouveau contenu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <select
              value={genType}
              onChange={(e) => setGenType(e.target.value as ContentType)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              {(Object.keys(TYPE_LABELS) as ContentType[]).map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
            <input
              value={genAudience}
              onChange={(e) => setGenAudience(e.target.value)}
              placeholder="Public cible (optionnel — ex: freelances tech)"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
            />
          </div>
          <textarea
            value={genTopic}
            onChange={(e) => setGenTopic(e.target.value)}
            placeholder="Sujet du post/article (ex: pourquoi les freelances devraient soigner leur réseau professionnel)"
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3"
          />
          {genError && <p className="text-xs text-red-500 mb-3">{genError}</p>}
          <button
            onClick={handleGenerate}
            disabled={generating || !genTopic.trim()}
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-40"
            style={{ background: '#2563eb' }}
          >
            {generating ? 'Génération en cours…' : 'Générer'}
          </button>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              style={
                filter === f.value
                  ? { background: '#2563eb', color: '#fff' }
                  : { background: '#fff', color: '#64748b', border: '1px solid #e2e8f0' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-sm text-slate-400 border border-slate-100">
            Aucun contenu dans cette catégorie.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const expanded = expandedId === item.id;
              return (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <button onClick={() => toggleExpand(item)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {TYPE_LABELS[item.type]}
                        </span>
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${STATUS_COLORS[item.status]}15`, color: STATUS_COLORS[item.status] }}
                        >
                          {STATUS_LABELS[item.status]}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatDate(item.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-700 truncate">{item.title || item.body.slice(0, 100)}</p>
                    </div>
                    <span className="text-slate-400 text-xs flex-shrink-0">{expanded ? '▲' : '▼'}</span>
                  </button>

                  {expanded && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Titre (optionnel, utile pour les articles de blog)"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2 font-semibold"
                      />
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={item.type === 'BLOG_ARTICLE' ? 14 : 6}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 font-mono"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleCopy(item)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                        >
                          {copiedId === item.id ? 'Copié ✓' : 'Copier le texte'}
                        </button>

                        {editBody !== item.body || editTitle !== (item.title ?? '') ? (
                          <button
                            onClick={() => handleSaveOnly(item.id)}
                            disabled={savingId === item.id}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"
                          >
                            Enregistrer les modifications
                          </button>
                        ) : null}

                        {item.status === 'PENDING_REVIEW' && (
                          <>
                            <button
                              onClick={() => applyStatus(item.id, 'APPROVED')}
                              disabled={savingId === item.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
                              style={{ background: '#22c55e' }}
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => applyStatus(item.id, 'REJECTED')}
                              disabled={savingId === item.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
                              style={{ background: '#ef4444' }}
                            >
                              Rejeter
                            </button>
                          </>
                        )}

                        {item.status === 'APPROVED' && (
                          <button
                            onClick={() => applyStatus(item.id, 'PUBLISHED')}
                            disabled={savingId === item.id}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
                            style={{ background: '#2563eb' }}
                          >
                            Marquer comme publié
                          </button>
                        )}
                      </div>

                      <div className="mt-3 text-[11px] text-slate-400 space-y-0.5">
                        {item.targetAudience && <p>Public cible : {item.targetAudience}</p>}
                        <p>Modèle : {item.model}</p>
                        {item.reviewedBy && <p>Relu par {item.reviewedBy.firstName} {item.reviewedBy.lastName}</p>}
                        {item.publishedAt && <p>Publié le {formatDate(item.publishedAt)}</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
