'use client';

import React, { useState } from 'react';
import { User } from '@/types/auth';
import { Search, Plus, Calendar, Users, DollarSign, MoreHorizontal, Target, GitBranch, Smartphone, Palette, TrendingUp } from 'lucide-react';

interface ProjectsPageProps {
  user: User | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'planning' | 'on-hold';
  category: 'web' | 'mobile' | 'design' | 'marketing' | 'other';
  client: { name: string; company: string };
  budget: number;
  deadline: Date;
  progress: number;
  team: Array<{ id: string; name: string; role: string }>;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

const STATUS_CONFIG = {
  active:    { label: 'Actif',         color: '#10b981', bg: 'rgba(16,185,129,0.1)',  accent: '#10b981' },
  completed: { label: 'Terminé',       color: '#4a90d9', bg: 'rgba(74,144,217,0.1)', accent: '#4a90d9' },
  planning:  { label: 'Planification', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', accent: '#f59e0b' },
  'on-hold': { label: 'En pause',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  accent: '#ef4444' },
};

const PRIORITY_CONFIG = {
  high:   { label: 'Haute',   color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  medium: { label: 'Moyenne', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  low:    { label: 'Basse',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

const TEAM_COLORS = ['#4a90d9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const CATEGORIES = [
  { id: 'all',       name: 'Tous',      icon: Target },
  { id: 'web',       name: 'Web',       icon: GitBranch },
  { id: 'mobile',    name: 'Mobile',    icon: Smartphone },
  { id: 'design',    name: 'Design',    icon: Palette },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp },
];

export default function ProjectsPage({ user }: ProjectsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'planning'>('all');
  const [activeCategory, setActiveCategory] = useState('all');

  const projects: Project[] = [
    {
      id: '1', title: 'Plateforme E-commerce Fintech',
      description: 'Développement d\'une plateforme de commerce en ligne complète avec intégration paiement et tableau de bord administratif.',
      status: 'active', category: 'web',
      client: { name: 'Marie Laurent', company: 'FinTech Solutions' },
      budget: 45000, deadline: new Date(Date.now() + 30 * 86400000), progress: 75,
      team: [
        { id: '1', name: 'Jean Dupont', role: 'Lead Dev' },
        { id: '2', name: 'Sophie Martin', role: 'UX Designer' },
        { id: '3', name: 'Thomas Bernard', role: 'Backend Dev' },
      ],
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe'], priority: 'high',
      createdAt: new Date(Date.now() - 15 * 86400000),
    },
    {
      id: '2', title: 'Application Mobile Santé',
      description: 'Application mobile pour le suivi des patients et gestion des rendez-vous médicaux avec notifications intelligentes.',
      status: 'active', category: 'mobile',
      client: { name: 'David Chen', company: 'HealthTech Inc' },
      budget: 32000, deadline: new Date(Date.now() + 45 * 86400000), progress: 60,
      team: [
        { id: '4', name: 'Claire Dubois', role: 'Mobile Dev' },
        { id: '5', name: 'Alexandre Petit', role: 'UI Designer' },
      ],
      tags: ['React Native', 'Firebase', 'iOS'], priority: 'medium',
      createdAt: new Date(Date.now() - 10 * 86400000),
    },
    {
      id: '3', title: 'Refonte Site Corporate',
      description: 'Modernisation complète du site web corporate avec nouvelle charte graphique et optimisation SEO.',
      status: 'planning', category: 'web',
      client: { name: 'Sophie Martin', company: 'Design Studio Pro' },
      budget: 28000, deadline: new Date(Date.now() + 60 * 86400000), progress: 15,
      team: [{ id: '6', name: 'Marie Laurent', role: 'PM' }],
      tags: ['WordPress', 'Figma', 'SEO'], priority: 'low',
      createdAt: new Date(Date.now() - 5 * 86400000),
    },
    {
      id: '4', title: 'Dashboard Analytics IA',
      description: 'Tableau de bord intelligent avec analyse prédictive et visualisations de données en temps réel.',
      status: 'completed', category: 'web',
      client: { name: 'Thomas Bernard', company: 'Tech Innovations' },
      budget: 55000, deadline: new Date(Date.now() - 10 * 86400000), progress: 100,
      team: [
        { id: '7', name: 'David Chen', role: 'Data Scientist' },
        { id: '8', name: 'Claire Dubois', role: 'ML Engineer' },
      ],
      tags: ['Python', 'TensorFlow', 'D3.js'], priority: 'high',
      createdAt: new Date(Date.now() - 30 * 86400000),
    },
    {
      id: '5', title: 'Campagne Marketing Digital',
      description: 'Stratégie marketing complète avec création de contenu, gestion réseaux sociaux et analyse de performance.',
      status: 'on-hold', category: 'marketing',
      client: { name: 'Alexandre Petit', company: 'Marketing Agency' },
      budget: 18000, deadline: new Date(Date.now() + 20 * 86400000), progress: 40,
      team: [{ id: '9', name: 'Jean Dupont', role: 'Marketing Manager' }],
      tags: ['SEO', 'Social Media', 'Analytics'], priority: 'medium',
      createdAt: new Date(Date.now() - 20 * 86400000),
    },
  ];

  const filteredProjects = projects.filter((p) => {
    const q = searchTerm.toLowerCase();
    const match =
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.client.name.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    const cat = activeCategory === 'all' || p.category === activeCategory;
    if (activeFilter === 'active') return match && cat && p.status === 'active';
    if (activeFilter === 'completed') return match && cat && p.status === 'completed';
    if (activeFilter === 'planning') return match && cat && (p.status === 'planning' || p.status === 'on-hold');
    return match && cat;
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  const formatDeadline = (d: Date) => {
    const diff = Math.floor((d.getTime() - Date.now()) / 86400000);
    if (diff === 0) return 'Aujourd\'hui';
    if (diff === 1) return 'Demain';
    if (diff < 0) return `Il y a ${Math.abs(diff)} j`;
    if (diff < 7) return `Dans ${diff} j`;
    if (diff < 30) return `Dans ${Math.floor(diff / 7)} sem.`;
    return `Dans ${Math.floor(diff / 30)} mois`;
  };

  const FILTERS = [
    { key: 'all' as const,       label: `Tous (${projects.length})`,                                     accent: '#4a90d9' },
    { key: 'active' as const,    label: `Actifs (${projects.filter(p => p.status === 'active').length})`, accent: '#10b981' },
    { key: 'completed' as const, label: `Terminés (${projects.filter(p => p.status === 'completed').length})`, accent: '#4a90d9' },
    { key: 'planning' as const,  label: `En attente (${projects.filter(p => p.status === 'planning' || p.status === 'on-hold').length})`, accent: '#f59e0b' },
  ];

  const getProgressColor = (progress: number) => {
    if (progress === 100) return '#10b981';
    if (progress >= 75) return '#4a90d9';
    if (progress >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div
      className="min-h-full p-6 md:p-8"
      style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #f7f9fc 100%)' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1a2332' }}>Projets</h1>
            <p className="text-[13px] mt-1" style={{ color: '#64748b' }}>
              Gérez et suivez la progression de vos projets
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4a90d9, #2563eb)',
              boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
            }}
          >
            <Plus size={14} />
            Nouveau projet
          </button>
        </div>

        {/* Filters panel */}
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(26,35,50,0.03)' }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Rechercher un projet, client, tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', fontSize: '13px', color: '#1a2332', outline: 'none' }}
                className="w-full pl-9 pr-4 py-2.5 transition-all duration-200"
                onFocus={e => { e.currentTarget.style.borderColor = '#4a90d9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Status filters */}
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className="px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 whitespace-nowrap"
                  style={
                    activeFilter === f.key
                      ? { background: f.accent, color: '#fff', boxShadow: `0 4px 10px ${f.accent}40` }
                      : { background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0' }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150"
                style={
                  activeCategory === id
                    ? { background: 'linear-gradient(135deg, #4a90d9, #2563eb)', color: '#fff', boxShadow: '0 4px 8px rgba(74,144,217,0.3)' }
                    : { background: '#f1f5f9', color: '#64748b' }
                }
              >
                <Icon size={12} />
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: '#fff', border: '1px solid #e2e8f0' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(74,144,217,0.08)' }}>
              <Search size={22} style={{ color: '#4a90d9' }} />
            </div>
            <p className="text-[14px] font-semibold mb-1" style={{ color: '#1a2332' }}>Aucun projet trouvé</p>
            <p className="text-[12px]" style={{ color: '#94a3b8' }}>Modifiez vos filtres pour afficher des projets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredProjects.map((project) => {
              const st = STATUS_CONFIG[project.status];
              const pr = PRIORITY_CONFIG[project.priority];
              const progressColor = getProgressColor(project.progress);

              return (
                <div
                  key={project.id}
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(26,35,50,0.04)' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = `0 12px 36px rgba(26,35,50,0.1), 0 0 0 1px ${st.accent}25`;
                    el.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 2px 12px rgba(26,35,50,0.04)';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Top accent stripe */}
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${st.accent}, ${st.accent}40)` }} />

                  <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-3">
                        <h3 className="text-[15px] font-bold leading-snug mb-1" style={{ color: '#1a2332' }}>
                          {project.title}
                        </h3>
                        <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: '#64748b' }}>
                          {project.description}
                        </p>
                      </div>
                      <button
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ color: '#94a3b8' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: st.bg, color: st.color }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.accent }} />
                        {st.label}
                      </span>
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: pr.bg, color: pr.color }}
                      >
                        {pr.label}
                      </span>
                    </div>

                    {/* Client */}
                    <div
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-4"
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                        style={{ background: 'rgba(74,144,217,0.12)', color: '#4a90d9' }}
                      >
                        {project.client.name[0]}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold" style={{ color: '#1a2332' }}>{project.client.name}</p>
                        <p className="text-[11px]" style={{ color: '#94a3b8' }}>{project.client.company}</p>
                      </div>
                    </div>

                    {/* Budget + Deadline */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                          <DollarSign size={13} style={{ color: '#10b981' }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#94a3b8' }}>Budget</p>
                          <p className="text-[12px] font-bold" style={{ color: '#1a2332' }}>{formatCurrency(project.budget)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                          <Calendar size={13} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#94a3b8' }}>Deadline</p>
                          <p className="text-[12px] font-bold" style={{ color: '#1a2332' }}>{formatDeadline(project.deadline)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[11px] font-semibold" style={{ color: '#64748b' }}>Progression</span>
                        <span className="text-[12px] font-bold" style={{ color: progressColor }}>{project.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: '#e2e8f0' }}>
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%`, background: `linear-gradient(90deg, ${progressColor}, ${progressColor}99)` }}
                        />
                      </div>
                    </div>

                    {/* Team + Tags */}
                    <div className="flex items-center justify-between">
                      {/* Team avatars */}
                      <div className="flex items-center gap-2">
                        <Users size={13} style={{ color: '#94a3b8' }} />
                        <div className="flex -space-x-2">
                          {project.team.slice(0, 4).map((member, i) => (
                            <div
                              key={member.id}
                              title={`${member.name} — ${member.role}`}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                              style={{
                                background: TEAM_COLORS[i % TEAM_COLORS.length] + '22',
                                color: TEAM_COLORS[i % TEAM_COLORS.length],
                                border: '2px solid #fff',
                              }}
                            >
                              {member.name[0]}
                            </div>
                          ))}
                          {project.team.length > 4 && (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                              style={{ background: '#f1f5f9', color: '#64748b', border: '2px solid #fff' }}
                            >
                              +{project.team.length - 4}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex gap-1 flex-wrap justify-end">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: 'rgba(74,144,217,0.08)', color: '#4a90d9' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
