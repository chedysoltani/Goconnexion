'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { User } from '@/types/auth';
import {
  User as UserIcon,
  Mail,
  Briefcase,
  Globe,
  DollarSign,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  MessageSquare,
  Heart,
  Sparkles,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Freelancer specific fields
  const [freelancerData, setFreelancerData] = useState({
    title: '',
    bio: '',
    skills: [] as string[],
    portfolioUrl: '',
    hourlyRate: 0,
    isAvailable: true,
    cvUrl: '',
  });

  // Entrepreneur specific fields
  const [entrepreneurData, setEntrepreneurData] = useState({
    companyName: '',
    website: '',
    bio: '',
  });

  // My posts
  const [myPosts, setMyPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        // Load logged-in user basic info
        const me = await api.auth.me();
        setUser(me);

        // Load role-specific profile details
        if (me.role?.toLowerCase() === 'freelancer') {
          try {
            const profile = await api.freelancers.getProfile();
            if (profile) {
              setFreelancerData({
                title: profile.title || '',
                bio: profile.bio || '',
                skills: profile.skills || [],
                portfolioUrl: profile.portfolioUrl || '',
                hourlyRate: profile.hourlyRate || 0,
                isAvailable: profile.isAvailable ?? true,
                cvUrl: profile.cvUrl || '',
              });
            }
          } catch (err) {
            console.error('Error fetching freelancer profile:', err);
          }
        } else if (me.role?.toLowerCase() === 'entrepreneur') {
          try {
            const profile = await api.entrepreneurs.getProfile();
            if (profile) {
              setEntrepreneurData({
                companyName: profile.companyName || '',
                website: profile.website || '',
                bio: profile.bio || '',
              });
            }
          } catch (err) {
            console.error('Error fetching entrepreneur profile:', err);
          }
        }

        // Fetch my posts
        try {
          const posts = await api.feed.list();
          const filtered = posts.filter((p: any) => p.author.id === me.id);
          setMyPosts(filtered);
        } catch (err) {
          console.error('Error loading posts:', err);
        }

      } catch (error) {
        console.error('Error loading profiles:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleFreelancerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      await api.freelancers.updateProfile({
        ...freelancerData,
        hourlyRate: Number(freelancerData.hourlyRate),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEntrepreneurSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      await api.entrepreneurs.updateProfile(entrepreneurData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      setSaveSuccess(false);
      setSaveError(null);
      const res = await api.uploads.upload(file);
      const avatarUrl = `http://localhost:3001${res.file.path}`;

      await api.users.updateProfile({ avatarUrl });
      setUser(prev => prev ? { ...prev, avatarUrl } : null);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.avatarUrl = avatarUrl;
        localStorage.setItem('user', JSON.stringify(parsed));
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Erreur lors du téléversement de l'image.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      setSaveSuccess(false);
      setSaveError(null);
      const res = await api.uploads.upload(file);
      const cvUrl = `http://localhost:3001${res.file.path}`;

      setFreelancerData(prev => ({ ...prev, cvUrl }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Erreur lors du téléversement du CV.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Chargement de votre profil GoConnexions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Header */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-accent transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
          >
            <ArrowLeft size={14} />
            <span>Retour au Dashboard</span>
          </Link>
          <span className="text-xs text-slate-400">Modifiez vos informations visibles par la communauté</span>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mb-6">
          <div className="h-32 bg-gradient-to-r from-accent to-indigo-600 relative">
            <div className="absolute -bottom-10 left-6 sm:left-10">
              <div
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="w-20 h-20 rounded-full bg-indigo-50 border-4 border-white flex items-center justify-center text-accent text-2xl font-bold shadow-md cursor-pointer overflow-hidden group relative"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Changer
                </div>
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>
          <div className="pt-12 pb-6 px-6 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>{user?.firstName} {user?.lastName}</span>
                  <Sparkles size={16} className="text-amber-400" />
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-accent-light text-accent uppercase tracking-wider">
                    {user?.role}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Mail size={12} />
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications and Alerts */}
        {saveSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold">
            <CheckCircle size={16} className="text-emerald-600" />
            <span>Profil mis à jour avec succès ! Vos modifications sont visibles en ligne.</span>
          </div>
        )}
        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle size={16} className="text-red-600" />
            <span>{saveError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Edit Section */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <UserIcon size={16} className="text-accent" />
                <span>Détails Professionnels</span>
              </h2>

              {user?.role?.toLowerCase() === 'freelancer' ? (
                <form onSubmit={handleFreelancerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Titre Professionnel</label>
                    <input
                      type="text"
                      placeholder="Ex: Développeur Full Stack Senior, UX Designer..."
                      value={freelancerData.title}
                      onChange={(e) => setFreelancerData({ ...freelancerData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-xs bg-slate-50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tarif Horaire (€)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="number"
                          placeholder="Tarif"
                          value={freelancerData.hourlyRate}
                          onChange={(e) => setFreelancerData({ ...freelancerData, hourlyRate: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-xs bg-slate-50"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Disponibilité</label>
                      <select
                        value={freelancerData.isAvailable ? 'true' : 'false'}
                        onChange={(e) => setFreelancerData({ ...freelancerData, isAvailable: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-xs bg-slate-50"
                      >
                        <option value="true">Disponible immédiatement</option>
                        <option value="false">Occupé(e)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Compétences (séparées par des virgules)</label>
                    <input
                      type="text"
                      placeholder="Ex: React, Node.js, Figma, TypeScript"
                      value={freelancerData.skills.join(', ')}
                      onChange={(e) => setFreelancerData({
                        ...freelancerData,
                        skills: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-xs bg-slate-50"
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {freelancerData.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-semibold border border-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">URL Portfolio / GitHub / LinkedIn</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={freelancerData.portfolioUrl}
                        onChange={(e) => setFreelancerData({ ...freelancerData, portfolioUrl: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-xs bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Téléverser votre CV (PDF uniquement)</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => document.getElementById('cv-upload')?.click()}
                        className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors bg-white shadow-sm"
                      >
                        <FileText size={14} className="text-slate-500" />
                        <span>{freelancerData.cvUrl ? 'Modifier le CV' : 'Choisir un fichier'}</span>
                      </button>
                      <input
                        id="cv-upload"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleCvUpload}
                      />
                      {freelancerData.cvUrl && (
                        <a
                          href={freelancerData.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline font-bold truncate flex-1"
                        >
                          Voir le CV téléversé
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Présentation (Bio)</label>
                    <textarea
                      placeholder="Parlez-nous de vos passions, expertises et projets..."
                      value={freelancerData.bio}
                      onChange={(e) => setFreelancerData({ ...freelancerData, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none text-xs bg-slate-50"
                      rows={4}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-accent hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Save size={14} />
                    )}
                    <span>Enregistrer le profil Freelancer</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleEntrepreneurSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nom de votre Entreprise / Projet</label>
                    <input
                      type="text"
                      placeholder="Ex: Tech Innovations, Startup SAS..."
                      value={entrepreneurData.companyName}
                      onChange={(e) => setEntrepreneurData({ ...entrepreneurData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-xs bg-slate-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Site Web (Optionnel)</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={entrepreneurData.website}
                        onChange={(e) => setEntrepreneurData({ ...entrepreneurData, website: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-xs bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Votre Mission / Secteur d'activité</label>
                    <textarea
                      placeholder="Présentez votre vision d'entreprise et les talents que vous recherchez..."
                      value={entrepreneurData.bio}
                      onChange={(e) => setEntrepreneurData({ ...entrepreneurData, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none text-xs bg-slate-50"
                      rows={5}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-accent hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Save size={14} />
                    )}
                    <span>Enregistrer le profil Entrepreneur</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Info Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <FileText size={14} className="text-accent" />
                <span>Statistiques Réseau</span>
              </h2>
              <div className="space-y-3.5 text-[11px] leading-relaxed text-slate-600">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold">Type de compte</span>
                  <span className="font-bold text-slate-900 capitalize">{user?.role.toLowerCase()}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold">Inscrit depuis</span>
                  <span className="text-slate-900 font-bold">Mai 2026</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold">Mes Publications</span>
                  <span className="bg-accent text-white px-2 py-0.5 rounded-full font-bold text-[9px]">{myPosts.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Publications Feed */}
        <div className="mt-8">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-accent" />
            <span>Mes Publications ({myPosts.length})</span>
          </h2>

          {myPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
              <Clock className="text-slate-400 mx-auto mb-2" size={24} />
              <p className="text-xs text-slate-500">Vous n'avez pas encore publié dans le fil d'actualités.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myPosts.map((post) => (
                <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><Heart size={12} className="text-red-400" /> {post.likes.length}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={12} className="text-slate-400" /> {post.comments.length}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">{post.content}</p>
                  {post.imageUrl && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-slate-100 max-h-48 bg-slate-50">
                      <img src={post.imageUrl} alt="Attached" className="w-full h-auto object-cover max-h-48" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
