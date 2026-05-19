'use client';

import React, { useState } from 'react';
import { User } from '@/types/auth';
import { Search, Plus, Calendar, Users, DollarSign, Clock, MoreHorizontal, Star, GitBranch, Target } from 'lucide-react';

interface ProjectsPageProps {
  user: User | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'planning' | 'on-hold';
  category: 'web' | 'mobile' | 'design' | 'marketing' | 'other';
  client: {
    name: string;
    avatar: string;
    company: string;
  };
  budget: number;
  deadline: Date;
  progress: number;
  team: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
  }>;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export default function ProjectsPage({ user }: ProjectsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'planning'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const projects: Project[] = [
    {
      id: '1',
      title: 'Plateforme E-commerce Fintech',
      description: 'Développement d\'une plateforme de commerce en ligne complète avec intégration paiement et tableau de bord administratif.',
      status: 'active',
      category: 'web',
      client: {
        name: 'Marie Laurent',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
        company: 'FinTech Solutions'
      },
      budget: 45000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progress: 75,
      team: [
        {
          id: '1',
          name: 'Jean Dupont',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4?w=400&h=400&fit=crop&crop=face',
          role: 'Lead Developer'
        },
        {
          id: '2',
          name: 'Sophie Martin',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
          role: 'UX Designer'
        },
        {
          id: '3',
          name: 'Thomas Bernard',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
          role: 'Backend Developer'
        }
      ],
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      priority: 'high',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Application Mobile Santé',
      description: 'Application mobile pour le suivi des patients et gestion des rendez-vous médicaux avec notifications intelligentes.',
      status: 'active',
      category: 'mobile',
      client: {
        name: 'David Chen',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
        company: 'HealthTech Inc'
      },
      budget: 32000,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      progress: 60,
      team: [
        {
          id: '4',
          name: 'Claire Dubois',
          avatar: 'https://images.unsplash.com/photo-1494790108752-4fee59d1aefa?w=400&h=400&fit=crop&crop=face',
          role: 'Mobile Developer'
        },
        {
          id: '5',
          name: 'Alexandre Petit',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4?w=400&h=400&fit=crop&crop=face',
          role: 'UI Designer'
        }
      ],
      tags: ['React Native', 'Firebase', 'Healthcare', 'iOS'],
      priority: 'medium',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      title: 'Refonte Site Corporate',
      description: 'Modernisation complète du site web corporate avec nouvelle charte graphique et optimisation SEO.',
      status: 'planning',
      category: 'web',
      client: {
        name: 'Sophie Martin',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
        company: 'Design Studio Pro'
      },
      budget: 28000,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      progress: 15,
      team: [
        {
          id: '6',
          name: 'Marie Laurent',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
          role: 'Project Manager'
        }
      ],
      tags: ['WordPress', 'Figma', 'SEO', 'Responsive'],
      priority: 'low',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      title: 'Dashboard Analytics IA',
      description: 'Tableau de bord intelligent avec analyse prédictive et visualisations de données en temps réel.',
      status: 'completed',
      category: 'web',
      client: {
        name: 'Thomas Bernard',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        company: 'Tech Innovations'
      },
      budget: 55000,
      deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      progress: 100,
      team: [
        {
          id: '7',
          name: 'David Chen',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
          role: 'Data Scientist'
        },
        {
          id: '8',
          name: 'Claire Dubois',
          avatar: 'https://images.unsplash.com/photo-1494790108752-4fee59d1aefa?w=400&h=400&fit=crop&crop=face',
          role: 'ML Engineer'
        }
      ],
      tags: ['Python', 'TensorFlow', 'D3.js', 'PostgreSQL'],
      priority: 'high',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: '5',
      title: 'Campagne Marketing Digital',
      description: 'Stratégie marketing complète avec création de contenu, gestion réseaux sociaux et analyse de performance.',
      status: 'on-hold',
      category: 'marketing',
      client: {
        name: 'Alexandre Petit',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4?w=400&h=400&fit=crop&crop=face',
        company: 'Marketing Agency'
      },
      budget: 18000,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      progress: 40,
      team: [
        {
          id: '9',
          name: 'Jean Dupont',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4?w=400&h=400&fit=crop&crop=face',
          role: 'Marketing Manager'
        }
      ],
      tags: ['SEO', 'Social Media', 'Content', 'Analytics'],
      priority: 'medium',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    }
  ];

  const categories = [
    { id: 'all', name: 'Toutes', icon: Target },
    { id: 'web', name: 'Web', icon: GitBranch },
    { id: 'mobile', name: 'Mobile', icon: Target },
    { id: 'design', name: 'Design', icon: Target },
    { id: 'marketing', name: 'Marketing', icon: Target },
    { id: 'other', name: 'Autres', icon: Target }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || project.category === activeCategory;
    
    if (activeFilter === 'active') {
      return matchesSearch && matchesCategory && project.status === 'active';
    }
    if (activeFilter === 'completed') {
      return matchesSearch && matchesCategory && project.status === 'completed';
    }
    if (activeFilter === 'planning') {
      return matchesSearch && matchesCategory && (project.status === 'planning' || project.status === 'on-hold');
    }
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'planning': return 'bg-yellow-100 text-yellow-700';
      case 'on-hold': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Aujourd\'hui';
    if (diffInDays === 1) return 'Demain';
    if (diffInDays < 7) return `Dans ${diffInDays} jours`;
    if (diffInDays < 30) return `Dans ${Math.floor(diffInDays / 7)} semaines`;
    return `Dans ${Math.floor(diffInDays / 30)} mois`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Projets</h1>
        <p className="text-xs text-slate-600">Gérez vos projets, suivez leur progression et collaborez avec votre équipe</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher des projets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tous ({projects.length})
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                activeFilter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Actifs ({projects.filter(p => p.status === 'active').length})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                activeFilter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Terminés ({projects.filter(p => p.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mt-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg font-medium text-xs transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon size={14} />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base mb-2">{project.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{project.description}</p>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Status and Priority */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status === 'active' ? 'Actif' : 
                   project.status === 'completed' ? 'Terminé' :
                   project.status === 'planning' ? 'Planification' : 'En pause'}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                  {project.priority === 'high' ? 'Haute' :
                   project.priority === 'medium' ? 'Moyenne' : 'Basse'}
                </span>
              </div>

              {/* Client Info */}
              <div className="flex items-center gap-2 mb-3 p-3 bg-slate-50 rounded-lg">
                <img
                  src={project.client.avatar}
                  alt={project.client.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-slate-900 text-xs">{project.client.name}</p>
                  <p className="text-xs text-slate-500">{project.client.company}</p>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Budget</p>
                    <p className="font-semibold text-slate-900 text-xs">{formatCurrency(project.budget)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Deadline</p>
                    <p className="font-semibold text-slate-900 text-xs">{formatTimeAgo(project.deadline)}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-slate-700">Progression</p>
                  <p className="text-xs font-semibold text-slate-900">{project.progress}%</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      project.progress === 100 ? 'bg-green-500' :
                      project.progress >= 75 ? 'bg-blue-500' :
                      project.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Team */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={14} className="text-slate-400" />
                  <p className="text-xs font-medium text-slate-700">Équipe ({project.team.length})</p>
                </div>
                <div className="flex -space-x-2">
                  {project.team.slice(0, 3).map((member) => (
                    <img
                      key={member.id}
                      src={member.avatar}
                      alt={member.name}
                      className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                      title={member.name}
                    />
                  ))}
                  {project.team.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center">
                      <span className="text-xs font-medium text-slate-600">+{project.team.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun projet trouvé</h3>
            <p className="text-slate-600">
              Essayez de modifier votre recherche ou vos filtres pour trouver des projets.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
