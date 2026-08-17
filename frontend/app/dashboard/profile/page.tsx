'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Briefcase, BarChart3, Target, Heart, MessageCircle as MessageIcon, Users, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { User } from '@/types/auth';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { INDUSTRIES } from '@/lib/constants/industries';
import { COUNTRIES } from '@/lib/constants/countries';

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; gradient: string }> = {
  freelancer:   { label: 'Freelancer',   color: '#60a5fa', bg: 'rgba(59,130,246,0.15)',  gradient: 'from-blue-600 to-blue-400' },
  entrepreneur: { label: 'Entrepreneur', color: '#c084fc', bg: 'rgba(139,92,246,0.15)',  gradient: 'from-violet-600 to-purple-400' },
  user:         { label: 'Explorateur',  color: '#60a5fa', bg: 'rgba(37,99,235,0.15)',  gradient: 'from-blue-600 to-teal-400' },
  admin:        { label: 'Admin',        color: '#fbbf24', bg: 'rgba(245,158,11,0.15)',  gradient: 'from-amber-500 to-yellow-400' },
};

function SectionHeader({
  icon, title, subtitle, gradient, shadow,
}: { icon: React.ReactNode; title: string; subtitle: string; gradient: string; shadow: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
        style={{ background: gradient, boxShadow: `0 4px 14px ${shadow}` }}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-[15px] font-bold text-foreground leading-tight">{title}</h2>
        <p className="text-[11px] font-medium mt-0.5" style={{ color: '#94a3b8' }}>{subtitle}</p>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#64748b' }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-xl text-[14px] font-medium text-foreground outline-none transition-all duration-200 ${className}`}
      style={{
        background: '#f8fafc',
        border: '1.5px solid #e2e8f0',
        ...props.style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
        e.currentTarget.style.background = '#fff';
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.background = '#f8fafc';
        props.onBlur?.(e);
      }}
    />
  );
}

function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-3 rounded-xl text-[14px] font-medium text-foreground outline-none transition-all duration-200 resize-none ${className}`}
      style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
        e.currentTarget.style.background = '#fff';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.background = '#f8fafc';
      }}
    />
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'posts'>('profile');

  const [basicData, setBasicData] = useState({ firstName: '', lastName: '', birthDate: '', country: '' });
  const [freelancerData, setFreelancerData] = useState({
    title: '', bio: '', industry: '', skills: [] as string[], portfolioUrl: '', hourlyRate: 0, isAvailable: true, cvUrl: '',
  });
  const [entrepreneurData, setEntrepreneurData] = useState({ companyName: '', website: '', bio: '', industry: '' });
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [completion, setCompletion] = useState<{ percent: number; missing: string[] } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const me = await api.auth.me();
        setUser(me);
        setBasicData({
          firstName: me.firstName || '',
          lastName: me.lastName || '',
          birthDate: me.birthDate ? me.birthDate.slice(0, 10) : '',
          country: me.country || '',
        });

        if (me.role?.toLowerCase() === 'freelancer') {
          try {
            const p = await api.freelancers.getProfile();
            if (p) setFreelancerData({ title: p.title || '', bio: p.bio || '', industry: p.industry || '', skills: p.skills || [], portfolioUrl: p.portfolioUrl || '', hourlyRate: p.hourlyRate || 0, isAvailable: p.isAvailable ?? true, cvUrl: p.cvUrl || '' });
          } catch {}
        } else if (me.role?.toLowerCase() === 'entrepreneur') {
          try {
            const p = await api.entrepreneurs.getProfile();
            if (p) setEntrepreneurData({ companyName: p.companyName || '', website: p.website || '', bio: p.bio || '', industry: p.industry || '' });
          } catch {}
        }

        try {
          const posts = await api.feed.list();
          setMyPosts(posts.filter((p: any) => p.author.id === me.id));
        } catch {}

        refreshCompletion();
      } catch {
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const refreshCompletion = async () => {
    try {
      const c = await api.users.completion();
      setCompletion(c);
    } catch {}
  };

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true); setSaveSuccess(false); setSaveError(null);
    try {
      const updated = await api.users.updateProfile(basicData);
      setUser(prev => prev ? { ...prev, ...updated } : updated);
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...parsed, ...updated }));
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      refreshCompletion();
    } catch (err: any) {
      setSaveError(err.message || 'Erreur lors de la sauvegarde.');
    } finally { setIsSaving(false); }
  };

  const handleFreelancerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true); setSaveSuccess(false); setSaveError(null);
    try {
      await api.freelancers.updateProfile({ ...freelancerData, hourlyRate: Number(freelancerData.hourlyRate) });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      refreshCompletion();
    } catch (err: any) {
      setSaveError(err.message || 'Erreur lors de la sauvegarde.');
    } finally { setIsSaving(false); }
  };

  const handleEntrepreneurSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true); setSaveSuccess(false); setSaveError(null);
    try {
      await api.entrepreneurs.updateProfile(entrepreneurData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      refreshCompletion();
    } catch (err: any) {
      setSaveError(err.message || 'Erreur lors de la sauvegarde.');
    } finally { setIsSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsSaving(true);
      const res = await api.uploads.upload(file);
      const avatarUrl = `${process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001'}${res.file.path}`;
      await api.users.updateProfile({ avatarUrl });
      setUser(prev => prev ? { ...prev, avatarUrl } : null);
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.avatarUrl = avatarUrl;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      refreshCompletion();
    } catch (err: any) {
      setSaveError(err.message || "Erreur lors du téléversement.");
    } finally { setIsSaving(false); }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsSaving(true);
      const res = await api.uploads.upload(file);
      setFreelancerData(prev => ({ ...prev, cvUrl: `${process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001'}${res.file.path}` }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setSaveError(err.message || "Erreur lors du téléversement du CV.");
    } finally { setIsSaving(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #f7f9fc 100%)' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-semibold" style={{ color: '#64748b' }}>Chargement de votre profil...</p>
      </div>
    );
  }

  const role = user?.role?.toLowerCase() ?? 'user';
  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.user;
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '';

  return (
    <div className="min-h-screen pb-12" style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #f7f9fc 100%)' }}>

      {/* Hero cover */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        className="relative profile-cover" style={{ height: '220px' }}>
        {/* Noise overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        {/* Decorative circles */}
        <div className="absolute top-6 right-12 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute -bottom-8 left-1/3 w-48 h-48 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

        {/* Back button */}
        <div className="relative z-10 px-8 pt-6">
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-200 hover:bg-white/20"
            style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Avatar + name row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-6 relative z-10">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.6, delay: 0.1 }}
              className="relative flex-shrink-0"
            >
              <div
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl font-bold cursor-pointer overflow-hidden group transition-transform duration-200 hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${roleConfig.color}99, ${roleConfig.color}55)` }}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              {/* Online badge */}
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-blue-400 border-2 border-white" />
            </motion.div>

            {/* Name + role */}
            <motion.div
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="pb-2"
            >
              <h1 className="text-xl font-bold text-foreground leading-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: roleConfig.bg, color: roleConfig.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: roleConfig.color }} />
                  {roleConfig.label}
                </span>
                {(role === 'freelancer' ? freelancerData.industry : entrepreneurData.industry) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                    {INDUSTRIES.find(i => i.label === (role === 'freelancer' ? freelancerData.industry : entrepreneurData.industry))?.icon ?? '🏢'}{' '}
                    {role === 'freelancer' ? freelancerData.industry : entrepreneurData.industry}
                  </span>
                )}
                <span className="text-[12px]" style={{ color: '#94a3b8' }}>{user?.email}</span>
              </div>
            </motion.div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 pb-2">
            {[
              { value: myPosts.length.toString(), label: 'Publications', icon: MessageIcon, color: '#3b82f6' },
              { value: '—', label: 'Connexions', icon: Users, color: '#8b5cf6' },
              { value: 'Mai 2026', label: 'Membre depuis', icon: Calendar, color: '#22c55e' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + idx * 0.06 }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover-lift"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(26,35,50,0.06)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${stat.color}18`, color: stat.color }}>
                  <stat.icon size={13} />
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-bold text-foreground leading-none">{stat.value}</p>
                  <p className="text-[10px] font-medium mt-1" style={{ color: '#94a3b8' }}>{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
              className="mb-5 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
              style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.25)' }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6, delay: 0.1 }}
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(37,99,235,0.2)' }}>
                <svg width="12" height="12" fill="none" stroke="#2563eb" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <p className="text-[13px] font-semibold" style={{ color: '#1d4ed8' }}>
                Profil mis à jour avec succès !
              </p>
            </motion.div>
          )}
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
              className="mb-5 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.2)' }}>
                <svg width="12" height="12" fill="none" stroke="#ef4444" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold" style={{ color: '#dc2626' }}>{saveError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section tabs */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0' }}>
          {(['profile', 'posts'] as const).map((s) => (
            <button key={s} onClick={() => setActiveSection(s)}
              className="relative px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors duration-200"
              style={{ color: activeSection === s ? '#fff' : '#64748b' }}>
              {activeSection === s && (
                <motion.span
                  layoutId="profile-tab-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: '#3b82f6', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{s === 'profile' ? 'Profil' : `Publications (${myPosts.length})`}</span>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
        {activeSection === 'profile' && (
          <motion.div
            key="profile-section"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal info card */}
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="relative rounded-2xl overflow-hidden hover-lift"
                style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(26,35,50,0.06)' }}>
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#3b82f6,#60a5fa)' }} />
                <div className="px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <SectionHeader
                    icon={<UserIcon size={18} />}
                    title="Informations personnelles"
                    subtitle="Ton identité, visible par ton réseau"
                    gradient="linear-gradient(135deg,#3b82f6,#2563eb)"
                    shadow="rgba(59,130,246,0.35)"
                  />
                </div>
                <div className="p-6">
                  <form onSubmit={handleBasicSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <FieldGroup label="Prénom">
                        <Input type="text" value={basicData.firstName}
                          onChange={(e) => setBasicData({ ...basicData, firstName: e.target.value })}
                          required />
                      </FieldGroup>
                      <FieldGroup label="Nom">
                        <Input type="text" value={basicData.lastName}
                          onChange={(e) => setBasicData({ ...basicData, lastName: e.target.value })}
                          required />
                      </FieldGroup>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FieldGroup label="Email">
                        <Input type="email" value={user?.email || ''} disabled
                          style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                      </FieldGroup>
                      <FieldGroup label="Date de naissance">
                        <Input type="date" value={basicData.birthDate}
                          onChange={(e) => setBasicData({ ...basicData, birthDate: e.target.value })} />
                      </FieldGroup>
                    </div>
                    <FieldGroup label="Pays">
                      <SearchableSelect
                        theme="light"
                        value={basicData.country}
                        onChange={(val) => setBasicData({ ...basicData, country: val })}
                        options={COUNTRIES}
                        placeholder="Sélectionnez votre pays..."
                        searchPlaceholder="Rechercher un pays..."
                        emptyLabel="Aucun pays trouvé"
                      />
                    </FieldGroup>
                    <button type="submit" disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[14px] font-bold text-white transition-all duration-200 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
                      {isSaving ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement...</>
                      ) : (
                        <><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>Enregistrer les informations</>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="relative rounded-2xl overflow-hidden hover-lift"
                style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(26,35,50,0.06)' }}>
                <div className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ background: role === 'entrepreneur' ? 'linear-gradient(90deg,#8b5cf6,#c084fc)' : 'linear-gradient(90deg,#3b82f6,#60a5fa)' }} />
                {/* Card header */}
                <div className="px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <SectionHeader
                    icon={<Briefcase size={18} />}
                    title="Informations professionnelles"
                    subtitle={role === 'entrepreneur' ? 'Ton entreprise et ta mission' : role === 'freelancer' ? 'Ton expertise et tes services' : 'Complète ce profil pour en profiter pleinement'}
                    gradient={role === 'entrepreneur' ? 'linear-gradient(135deg,#8b5cf6,#7c3aed)' : 'linear-gradient(135deg,#3b82f6,#2563eb)'}
                    shadow={role === 'entrepreneur' ? 'rgba(139,92,246,0.35)' : 'rgba(59,130,246,0.35)'}
                  />
                </div>

                <div className="p-6">
                  {role === 'freelancer' ? (
                    <form onSubmit={handleFreelancerSubmit} className="space-y-5">
                      <FieldGroup label="Titre professionnel">
                        <Input
                          type="text"
                          placeholder="Ex : Développeur Full Stack Senior, UX Designer..."
                          value={freelancerData.title}
                          onChange={(e) => setFreelancerData({ ...freelancerData, title: e.target.value })}
                          required
                        />
                      </FieldGroup>

                      <FieldGroup label="Secteur d'activité">
                        <SearchableSelect
                          theme="light"
                          value={freelancerData.industry}
                          onChange={(val) => setFreelancerData({ ...freelancerData, industry: val })}
                          placeholder="Sélectionnez votre secteur..."
                        />
                      </FieldGroup>

                      <div className="grid grid-cols-2 gap-4">
                        <FieldGroup label="Tarif horaire (€)">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold" style={{ color: '#94a3b8' }}>€</span>
                            <Input
                              type="number" min="0" placeholder="0"
                              value={freelancerData.hourlyRate}
                              onChange={(e) => setFreelancerData({ ...freelancerData, hourlyRate: Number(e.target.value) })}
                              className="pl-8"
                              required
                            />
                          </div>
                        </FieldGroup>
                        <FieldGroup label="Disponibilité">
                          <select
                            value={freelancerData.isAvailable ? 'true' : 'false'}
                            onChange={(e) => setFreelancerData({ ...freelancerData, isAvailable: e.target.value === 'true' })}
                            className="w-full px-4 py-3 rounded-xl text-[14px] font-medium text-foreground outline-none transition-all duration-200"
                            style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                          >
                            <option value="true">Disponible</option>
                            <option value="false">Occupé(e)</option>
                          </select>
                        </FieldGroup>
                      </div>

                      <FieldGroup label="Compétences (séparées par des virgules)">
                        <Input
                          type="text"
                          placeholder="React, Node.js, Figma, TypeScript..."
                          value={freelancerData.skills.join(', ')}
                          onChange={(e) => setFreelancerData({ ...freelancerData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        />
                        {freelancerData.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {freelancerData.skills.map((skill, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                                style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </FieldGroup>

                      <FieldGroup label="Portfolio / GitHub / LinkedIn">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </span>
                          <Input type="url" placeholder="https://..." value={freelancerData.portfolioUrl}
                            onChange={(e) => setFreelancerData({ ...freelancerData, portfolioUrl: e.target.value })}
                            className="pl-10" />
                        </div>
                      </FieldGroup>

                      <FieldGroup label="CV (PDF uniquement)">
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => document.getElementById('cv-upload')?.click()}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 hover:scale-105"
                            style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {freelancerData.cvUrl ? 'Modifier le CV' : 'Téléverser un CV'}
                          </button>
                          <input id="cv-upload" type="file" accept="application/pdf" className="hidden" onChange={handleCvUpload} />
                          {freelancerData.cvUrl && (
                            <a href={freelancerData.cvUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[12px] font-semibold hover:underline" style={{ color: '#3b82f6' }}>
                              Voir le CV →
                            </a>
                          )}
                        </div>
                      </FieldGroup>

                      <FieldGroup label="Présentation (Bio)">
                        <Textarea
                          placeholder="Parlez-nous de vos passions, expertises et projets..."
                          value={freelancerData.bio}
                          onChange={(e) => setFreelancerData({ ...freelancerData, bio: e.target.value })}
                          rows={4}
                        />
                      </FieldGroup>

                      <button type="submit" disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[14px] font-bold text-white transition-all duration-200 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}
                        onMouseEnter={e => !isSaving && (e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.4)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.3)')}>
                        {isSaving ? (
                          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement...</>
                        ) : (
                          <><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>Enregistrer le profil</>
                        )}
                      </button>
                    </form>
                  ) : role === 'entrepreneur' ? (
                    <form onSubmit={handleEntrepreneurSubmit} className="space-y-5">
                      <FieldGroup label="Nom de l'entreprise / Projet">
                        <Input type="text" placeholder="Ex : Tech Innovations, Startup SAS..."
                          value={entrepreneurData.companyName}
                          onChange={(e) => setEntrepreneurData({ ...entrepreneurData, companyName: e.target.value })}
                          required />
                      </FieldGroup>
                      <FieldGroup label="Secteur d'activité">
                        <SearchableSelect
                          theme="light"
                          value={entrepreneurData.industry}
                          onChange={(val) => setEntrepreneurData({ ...entrepreneurData, industry: val })}
                          placeholder="Sélectionnez votre secteur..."
                        />
                      </FieldGroup>
                      <FieldGroup label="Site web (optionnel)">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          </span>
                          <Input type="url" placeholder="https://..." value={entrepreneurData.website}
                            onChange={(e) => setEntrepreneurData({ ...entrepreneurData, website: e.target.value })}
                            className="pl-10" />
                        </div>
                      </FieldGroup>
                      <FieldGroup label="Mission / Description">
                        <Textarea
                          placeholder="Présentez votre vision et les talents que vous recherchez..."
                          value={entrepreneurData.bio}
                          onChange={(e) => setEntrepreneurData({ ...entrepreneurData, bio: e.target.value })}
                          rows={5} />
                      </FieldGroup>
                      <button type="submit" disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[14px] font-bold text-white transition-all duration-200 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
                        {isSaving ? (
                          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement...</>
                        ) : (
                          <><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>Enregistrer le profil</>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                        style={{ background: 'rgba(37,99,235,0.1)' }}>
                        <svg width="22" height="22" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-[14px] font-semibold text-foreground mb-1">Profil Explorateur</p>
                      <p className="text-[12px]" style={{ color: '#94a3b8' }}>
                        Explorez la communauté et connectez-vous avec des professionnels.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-5">
              {/* Info card */}
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-2xl p-5 hover-lift"
                style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(26,35,50,0.06)' }}>
                <h3 className="text-[13px] font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                    <BarChart3 size={13} />
                  </div>
                  Statistiques réseau
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Type de compte', value: roleConfig.label, color: roleConfig.color, icon: UserIcon },
                    { label: 'Membre depuis', value: 'Mai 2026', color: '#3b82f6', icon: Calendar },
                    { label: 'Publications', value: myPosts.length.toString(), color: '#2563eb', icon: MessageIcon },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: '#f8fafc' }}>
                      <span className="flex items-center gap-2 text-[12px] font-medium" style={{ color: '#64748b' }}>
                        <item.icon size={13} style={{ color: item.color }} />
                        {item.label}
                      </span>
                      <span className="text-[12px] font-bold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Completion card */}
              {completion && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="relative rounded-2xl p-5 overflow-hidden hover-lift"
                  style={{ background: 'linear-gradient(135deg, #0a1628, #0e1f36)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
                  <div className="relative flex items-center justify-between mb-3">
                    <h3 className="text-[13px] font-bold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                        <Target size={13} />
                      </div>
                      Complétion du profil
                    </h3>
                    <span className="text-[13px] font-bold" style={{ color: '#3b82f6' }}>{completion.percent}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${completion.percent}%` }}
                      transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />
                  </div>
                  {completion.missing.length > 0 ? (
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Il manque : {completion.missing.join(', ')}
                    </p>
                  ) : (
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Profil complet — visibilité maximale 🎉
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {activeSection === 'posts' && (
          <motion.div
            key="posts-section"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            {myPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
                style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center float-anim"
                  style={{ background: 'rgba(59,130,246,0.08)' }}>
                  <svg width="24" height="24" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-[14px] font-semibold text-foreground mb-1">Aucune publication</p>
                <p className="text-[12px]" style={{ color: '#94a3b8' }}>
                  Partagez vos idées dans le fil d'activité.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.06, 0.3) }}
                    className="rounded-2xl p-5 hover-lift"
                    style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(26,35,50,0.05)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>
                        {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: '#ef4444' }}>
                          <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {post.likes.length}
                        </span>
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: '#64748b' }}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.comments.length}
                        </span>
                      </div>
                    </div>
                    <p className="text-[14px] text-foreground leading-relaxed">{post.content}</p>
                    {post.imageUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden" style={{ maxHeight: '200px' }}>
                        <img src={post.imageUrl} alt="Post" className="w-full object-cover" style={{ maxHeight: '200px' }} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
