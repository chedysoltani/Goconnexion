'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import {
  Search, Plus, Calendar, DollarSign, MoreHorizontal,
  Target, GitBranch, Smartphone, Palette, TrendingUp,
  X, CheckCircle, Clock, XCircle, FileText, Loader2,
} from 'lucide-react';

interface ProjectsPageProps {
  user: User | null;
}

// ── Types backend ──────────────────────────────────────────────────────────
interface ApiProject {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  skills: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  ownerId: string;
  createdAt: string;
  owner: {
    companyName: string | null;
    user: { firstName: string; lastName: string; avatarUrl: string | null };
  };
}

interface ApiApplication {
  id: string;
  coverLetter: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  freelancer: {
    title: string | null;
    user: { id: string; firstName: string; lastName: string; email: string };
  };
}

// ── Config affichage ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  OPEN:        { label: 'Ouvert',        color: '#10b981', bg: 'rgba(16,185,129,0.1)',  accent: '#10b981', progress: 15 },
  IN_PROGRESS: { label: 'En cours',      color: '#4a90d9', bg: 'rgba(74,144,217,0.1)', accent: '#4a90d9', progress: 60 },
  COMPLETED:   { label: 'Terminé',       color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', accent: '#8b5cf6', progress: 100 },
  CANCELLED:   { label: 'Annulé',        color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  accent: '#ef4444', progress: 0  },
};

const APP_STATUS_CONFIG = {
  PENDING:  { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: Clock        },
  ACCEPTED: { label: 'Accepté',    color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle  },
  REJECTED: { label: 'Refusé',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: XCircle      },
};

const FILTER_STATUS: Record<string, string | undefined> = {
  all:       undefined,
  open:      'OPEN',
  progress:  'IN_PROGRESS',
  completed: 'COMPLETED',
};

const CATEGORIES = [
  { id: 'all',       name: 'Tous',      icon: Target    },
  { id: 'web',       name: 'Web',       icon: GitBranch },
  { id: 'mobile',    name: 'Mobile',    icon: Smartphone },
  { id: 'design',    name: 'Design',    icon: Palette   },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp },
];

const AVATAR_COLORS = ['#4a90d9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function ProjectsPage({ user }: ProjectsPageProps) {
  const [projects, setProjects]               = useState<ApiProject[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [searchTerm, setSearchTerm]           = useState('');
  const [activeFilter, setActiveFilter]       = useState('all');
  const [activeCategory, setActiveCategory]   = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [form, setForm]                       = useState({ title: '', description: '', budget: '', tags: '' });
  const [formError, setFormError]             = useState('');

  const [applicationsProject, setApplicationsProject] = useState<ApiProject | null>(null);
  const [applications, setApplications]               = useState<ApiApplication[]>([]);
  const [appLoading, setAppLoading]                   = useState(false);

  // ── Chargement des projets ────────────────────────────────────────────
  const loadProjects = async (search?: string, status?: string) => {
    setLoading(true);
    try {
      const data = await api.projects.list({ search, status });
      setProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  // Filtre local sur le texte (appel API pour le status)
  const displayed = projects.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.skills.some(s => s.toLowerCase().includes(q))
    );
  });

  // ── Créer un projet ───────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Le titre et la description sont obligatoires.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const skills = form.tags.split(',').map(s => s.trim()).filter(Boolean);
      await api.projects.create({
        title:       form.title.trim(),
        description: form.description.trim(),
        budget:      form.budget ? Number(form.budget) : undefined,
        skills,
      });
      setForm({ title: '', description: '', budget: '', tags: '' });
      setCreateModalOpen(false);
      await loadProjects(undefined, FILTER_STATUS[activeFilter]);
    } catch (e: any) {
      setFormError(e.message ?? 'Erreur lors de la création.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Candidatures ──────────────────────────────────────────────────────
  const handleViewApplications = async (project: ApiProject) => {
    setApplicationsProject(project);
    setAppLoading(true);
    setApplications([]);
    try {
      const data = await api.projects.getApplications(project.id);
      setApplications(data);
    } catch {
      setApplications([]);
    } finally {
      setAppLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.projects.updateApplicationStatus(appId, status);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (e) {
      console.error(e);
    }
  };

  const applyFilter = (key: string) => {
    setActiveFilter(key);
    loadProjects(searchTerm || undefined, FILTER_STATUS[key]);
  };

  const counts = {
    all:       projects.length,
    open:      projects.filter(p => p.status === 'OPEN').length,
    progress:  projects.filter(p => p.status === 'IN_PROGRESS').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
  };

  const FILTERS = [
    { key: 'all',       label: `Tous (${counts.all})`,           accent: '#4a90d9' },
    { key: 'open',      label: `Ouverts (${counts.open})`,       accent: '#10b981' },
    { key: 'progress',  label: `En cours (${counts.progress})`,  accent: '#4a90d9' },
    { key: 'completed', label: `Terminés (${counts.completed})`, accent: '#8b5cf6' },
  ];

  return (
    <div className="min-h-full p-6 md:p-8" style={{ background: 'linear-gradient(180deg,#f0f4f8 0%,#f7f9fc 100%)' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1a2332' }}>Projets</h1>
            <p className="text-[13px] mt-1" style={{ color: '#64748b' }}>Gérez et suivez vos projets</p>
          </div>
          <button
            onClick={() => { setFormError(''); setCreateModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#4a90d9,#2563eb)', boxShadow: '0 4px 12px rgba(74,144,217,0.3)' }}
          >
            <Plus size={14} />
            Nouveau projet
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Rechercher un projet, compétence..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', fontSize: '13px', color: '#1a2332', outline: 'none' }}
                className="w-full pl-9 pr-4 py-2.5 transition-all duration-200"
                onFocus={e => { e.currentTarget.style.borderColor = '#4a90d9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.1)'; }}
                onBlur={e =>  { e.currentTarget.style.borderColor = '#e2e8f0';  e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => applyFilter(f.key)}
                  className="px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 whitespace-nowrap"
                  style={activeFilter === f.key
                    ? { background: f.accent, color: '#fff', boxShadow: `0 4px 10px ${f.accent}40` }
                    : { background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0' }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(({ id, name, icon: Icon }) => (
              <button key={id} onClick={() => setActiveCategory(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150"
                style={activeCategory === id
                  ? { background: 'linear-gradient(135deg,#4a90d9,#2563eb)', color: '#fff' }
                  : { background: '#f1f5f9', color: '#64748b' }
                }
              >
                <Icon size={12} />
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: '#4a90d9' }} />
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(74,144,217,0.08)' }}>
              <Search size={22} style={{ color: '#4a90d9' }} />
            </div>
            <p className="text-[14px] font-semibold mb-1" style={{ color: '#1a2332' }}>Aucun projet trouvé</p>
            <p className="text-[12px]" style={{ color: '#94a3b8' }}>Créez votre premier projet ou modifiez les filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {displayed.map(project => {
              const st = STATUS_CONFIG[project.status];
              const ownerName = project.owner?.user
                ? `${project.owner.user.firstName} ${project.owner.user.lastName}`
                : 'Propriétaire';
              const company = project.owner?.companyName ?? 'Entreprise';
              const color = avatarColor(ownerName);
              const budgetStr = project.budget
                ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(project.budget)
                : '—';
              const createdAgo = Math.floor((Date.now() - new Date(project.createdAt).getTime()) / 86400000);

              return (
                <div
                  key={project.id}
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(26,35,50,0.04)' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 12px 36px rgba(26,35,50,0.1),0 0 0 1px ${st.accent}25`; el.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 2px 12px rgba(26,35,50,0.04)'; el.style.transform = 'translateY(0)'; }}
                >
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg,${st.accent},${st.accent}40)` }} />
                  <div className="p-5">

                    {/* Titre + badge status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-3">
                        <h3 className="text-[15px] font-bold leading-snug mb-1" style={{ color: '#1a2332' }}>{project.title}</h3>
                        <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: '#64748b' }}>{project.description}</p>
                      </div>
                      <button className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ color: '#94a3b8' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>

                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: st.bg, color: st.color }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.accent }} />
                        {st.label}
                      </span>
                    </div>

                    {/* Propriétaire */}
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: color + '18', color }}>
                        {initials(project.owner?.user?.firstName ?? 'U', project.owner?.user?.lastName ?? '')}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold" style={{ color: '#1a2332' }}>{ownerName}</p>
                        <p className="text-[11px]" style={{ color: '#94a3b8' }}>{company}</p>
                      </div>
                    </div>

                    {/* Budget + date */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                          <DollarSign size={13} style={{ color: '#10b981' }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#94a3b8' }}>Budget</p>
                          <p className="text-[12px] font-bold" style={{ color: '#1a2332' }}>{budgetStr}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                          <Calendar size={13} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#94a3b8' }}>Publié</p>
                          <p className="text-[12px] font-bold" style={{ color: '#1a2332' }}>
                            {createdAgo === 0 ? "Aujourd'hui" : createdAgo === 1 ? 'Hier' : `Il y a ${createdAgo} j`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[11px] font-semibold" style={{ color: '#64748b' }}>Avancement</span>
                        <span className="text-[12px] font-bold" style={{ color: st.accent }}>{st.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: '#e2e8f0' }}>
                        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${st.progress}%`, background: `linear-gradient(90deg,${st.accent},${st.accent}99)` }} />
                      </div>
                    </div>

                    {/* Skills + bouton candidatures */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex gap-1 flex-wrap">
                        {project.skills.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(74,144,217,0.08)', color: '#4a90d9' }}>
                            {tag}
                          </span>
                        ))}
                        {project.skills.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                            +{project.skills.length - 3}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleViewApplications(project)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150 hover:scale-105 flex-shrink-0"
                        style={{ background: 'rgba(74,144,217,0.08)', color: '#4a90d9' }}
                      >
                        <FileText size={11} />
                        Candidatures
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL : Nouveau projet ──────────────────────────────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 24px 64px rgba(15,23,42,0.2)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h2 className="text-[16px] font-bold" style={{ color: '#1a2332' }}>Nouveau projet</h2>
                <p className="text-[12px] mt-0.5" style={{ color: '#94a3b8' }}>Publiez votre offre pour recevoir des candidatures</p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ color: '#94a3b8' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="px-3 py-2 rounded-xl text-[12px] font-medium" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#374151' }}>Titre du projet *</label>
                <input type="text" placeholder="Ex : Développement application mobile e-commerce"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] transition-all"
                  style={{ border: '1.5px solid #e2e8f0', outline: 'none', color: '#1a2332' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#4a90d9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.1)'; }}
                  onBlur={e =>  { e.currentTarget.style.borderColor = '#e2e8f0';  e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#374151' }}>Description *</label>
                <textarea rows={3} placeholder="Décrivez le contexte, les livrables et les objectifs..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] resize-none transition-all"
                  style={{ border: '1.5px solid #e2e8f0', outline: 'none', color: '#1a2332' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#4a90d9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.1)'; }}
                  onBlur={e =>  { e.currentTarget.style.borderColor = '#e2e8f0';  e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#374151' }}>Budget (€)</label>
                  <input type="number" placeholder="Ex : 15000"
                    value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-[13px] transition-all"
                    style={{ border: '1.5px solid #e2e8f0', outline: 'none', color: '#1a2332' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#4a90d9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.1)'; }}
                    onBlur={e =>  { e.currentTarget.style.borderColor = '#e2e8f0';  e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#374151' }}>Compétences requises</label>
                  <input type="text" placeholder="React, Node.js, Figma..."
                    value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-[13px] transition-all"
                    style={{ border: '1.5px solid #e2e8f0', outline: 'none', color: '#1a2332' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#4a90d9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.1)'; }}
                    onBlur={e =>  { e.currentTarget.style.borderColor = '#e2e8f0';  e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid #e2e8f0' }}>
              <button onClick={() => setCreateModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
                style={{ background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0' }}
              >
                Annuler
              </button>
              <button onClick={handleCreate} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#4a90d9,#2563eb)', boxShadow: '0 4px 12px rgba(74,144,217,0.3)' }}
              >
                {submitting && <Loader2 size={13} className="animate-spin" />}
                {submitting ? 'Publication...' : 'Publier le projet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL : Candidatures ─────────────────────────────────────────── */}
      {applicationsProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 24px 64px rgba(15,23,42,0.2)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h2 className="text-[16px] font-bold" style={{ color: '#1a2332' }}>Candidatures</h2>
                <p className="text-[12px] mt-0.5 line-clamp-1" style={{ color: '#94a3b8' }}>{applicationsProject.title}</p>
              </div>
              <button onClick={() => setApplicationsProject(null)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ color: '#94a3b8' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {appLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin" style={{ color: '#4a90d9' }} />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-10">
                  <FileText size={32} className="mx-auto mb-3" style={{ color: '#cbd5e1' }} />
                  <p className="text-[13px] font-semibold" style={{ color: '#64748b' }}>Aucune candidature pour l'instant</p>
                </div>
              ) : (
                applications.map(app => {
                  const cfg = APP_STATUS_CONFIG[app.status];
                  const StatusIcon = cfg.icon;
                  const fname = app.freelancer?.user?.firstName ?? '';
                  const lname = app.freelancer?.user?.lastName ?? '';
                  const color = avatarColor(fname + lname);
                  return (
                    <div key={app.id} className="rounded-xl p-4" style={{ border: '1.5px solid #e2e8f0' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0" style={{ background: color + '18', color }}>
                          {initials(fname, lname)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-[13px] font-bold" style={{ color: '#1a2332' }}>{fname} {lname}</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                              <StatusIcon size={10} />
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-[11px] mb-2" style={{ color: '#94a3b8' }}>{app.freelancer?.title ?? 'Freelancer'}</p>
                          {app.coverLetter && (
                            <p className="text-[12px] leading-relaxed" style={{ color: '#64748b' }}>{app.coverLetter}</p>
                          )}
                        </div>
                      </div>
                      {app.status === 'PENDING' && (
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                            className="flex-1 py-2 rounded-xl text-[12px] font-semibold transition-colors"
                            style={{ background: 'rgba(239,68,68,0.07)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                          >
                            Refuser
                          </button>
                          <button onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                            className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 10px rgba(16,185,129,0.25)' }}
                          >
                            Accepter
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
