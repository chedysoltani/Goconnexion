'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ActivityFeed from '@/components/dashboard/EnhancedActivityFeed';
import UserProfileCard from '@/components/dashboard/UserProfileCard';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import ConnectionsPage from '@/components/dashboard/ConnectionsPage';
import MessagesPage from '@/components/dashboard/MessagesPage';
import ProjectsPage from '@/components/dashboard/ProjectsPage';
import EarningsPage from '@/components/dashboard/EarningsPage';
import AnalyticsPage from '@/components/dashboard/AnalyticsPage';
import IncubatorPage from '@/components/dashboard/IncubatorPage';
import EventsPage from '@/components/dashboard/EventsPage';
import BusinessCardsPage from '@/components/dashboard/BusinessCardsPage';
import ReferralPage from '@/components/dashboard/ReferralPage';
import AdsPage from '@/components/dashboard/AdsPage';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import UpgradeModal from '@/components/dashboard/UpgradeModal';
import SupportChatWidget from '@/components/dashboard/SupportChatWidget';
import PlanBadge from '@/components/ui/PlanBadge';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

type Tab = 'feed' | 'connections' | 'messages' | 'projects' | 'earnings' | 'analytics' | 'incubator' | 'events' | 'business-cards' | 'referral' | 'ads';

const TAB_META: Record<Tab, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  events: {
    label: 'Événements',
    description: 'Networking, formations et opportunités',
    color: '#f59e0b',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
        <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
      </svg>
    ),
  },
  'business-cards': {
    label: 'Cartes de visite',
    description: 'Invitez de nouveaux contacts',
    color: '#8b5cf6',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" />
      </svg>
    ),
  },
  referral: {
    label: 'Parrainage',
    description: 'Développez la communauté',
    color: '#ec4899',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
  feed: {
    label: "Fil d'activité",
    description: 'Actualités de votre réseau',
    color: '#3b82f6',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  connections: {
    label: 'Connexions',
    description: 'Votre réseau professionnel',
    color: '#2563eb',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  messages: {
    label: 'Messages',
    description: 'Conversations en cours',
    color: '#8b5cf6',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  projects: {
    label: 'Projets',
    description: 'Vos projets en cours',
    color: '#f59e0b',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  earnings: {
    label: 'Revenus',
    description: 'Suivi financier',
    color: '#2563eb',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  analytics: {
    label: 'Analytiques',
    description: 'Statistiques et performances',
    color: '#3b82f6',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  incubator: {
    label: 'Incubateur',
    description: 'Projets en incubation',
    color: '#ec4899',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  ads: {
    label: 'Publicités',
    description: 'Annonces sponsorisées',
    color: '#f59e0b',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
};

const ROLE_LABEL: Record<string, string> = {
  freelancer: 'Freelancer',
  entrepreneur: 'Entrepreneur',
  user: 'Explorateur',
  admin: 'Admin',
};

const ROLE_COLOR: Record<string, string> = {
  freelancer: '#3b82f6',
  entrepreneur: '#8b5cf6',
  user: '#2563eb',
  admin: '#f59e0b',
};

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.18, ease: 'easeIn' as const } },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Bonjour');
    else if (h < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await api.auth.me();
        const mappedUser = {
          id: currentUser.id,
          email: currentUser.email,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          role: currentUser.role.toLowerCase() as any,
          plan: currentUser.plan ?? 'FREE',
          createdAt: new Date(currentUser.createdAt),
          updatedAt: new Date(),
          profile: currentUser.freelancerProfile
            ? {
                skills: currentUser.freelancerProfile.skills || [],
                experience: currentUser.freelancerProfile.bio || '',
                hourlyRate: currentUser.freelancerProfile.hourlyRate,
                portfolio: currentUser.freelancerProfile.portfolioUrl,
                bio: currentUser.freelancerProfile.bio || '',
              }
            : currentUser.entrepreneurProfile
            ? {
                company: currentUser.entrepreneurProfile.companyName || '',
                position: 'Fondateur',
                industry: 'Tech',
                companySize: '1-10',
                website: currentUser.entrepreneurProfile.website,
                bio: currentUser.entrepreneurProfile.bio || '',
              }
            : { interests: [], goals: '', bio: '' },
        } as any;
        setUser(mappedUser);
      } catch {
        api.auth.logout();
        router.push('/auth/login');
      }
    };
    fetchUser();
  }, [router]);

  const meta = TAB_META[activeTab];
  const roleLabel = ROLE_LABEL[user?.role ?? 'user'] ?? 'Utilisateur';
  const roleColor = ROLE_COLOR[user?.role ?? 'user'] ?? '#3b82f6';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        currentPlan={user?.plan ?? 'FREE'}
        trigger="Débloquez toutes les fonctionnalités premium de GoConnexion."
      />
      <DashboardSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUpgradeClick={() => setUpgradeOpen(true)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="topbar-glass flex-shrink-0 px-5 py-3 z-30">
          <div className="flex items-center justify-between gap-4">

            {/* Left: hamburger (mobile) + breadcrumb + greeting */}
            <div className="flex items-center gap-2 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 min-w-0"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{ background: `${meta.color}16`, color: meta.color }}
              >
                {meta.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-[14px] font-bold leading-none truncate" style={{ color: '#0f172a' }}>
                    {meta.label}
                  </h1>
                  <span
                    className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex-shrink-0"
                    style={{ background: `${roleColor}14`, color: roleColor }}
                  >
                    {roleLabel}
                  </span>
                </div>
                {user && (
                  <p className="text-[11px] mt-0.5 font-medium" style={{ color: '#94a3b8' }}>
                    {greeting}, {user.firstName}
                  </p>
                )}
              </div>
            </motion.div>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex flex-1 max-w-xs relative">
              <motion.div
                animate={{ scale: searchFocused ? 1.01 : 1 }}
                transition={{ duration: 0.2 }}
                className="w-full relative"
              >
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="search-bar"
                />
              </motion.div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <LanguageSwitcher />
              {user && (!user.plan || user.plan === 'FREE') && (
                <motion.button
                  onClick={() => setUpgradeOpen(true)}
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
                >
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Passer Pro
                </motion.button>
              )}
              {user && user.plan && user.plan !== 'FREE' && (
                <PlanBadge plan={user.plan} size="sm" />
              )}
              <NotificationCenter />
              <UserProfileCard user={user} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden" style={{ background: 'linear-gradient(160deg, #f0f4f8 0%, #f8fafc 60%)' }}>
          <div className="h-full overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="h-full"
              >
                {activeTab === 'feed'           && <ActivityFeed user={user} />}
                {activeTab === 'connections'    && <ConnectionsPage user={user} setActiveTab={setActiveTab} />}
                {activeTab === 'messages'       && <MessagesPage user={user} />}
                {activeTab === 'projects'       && <ProjectsPage user={user} />}
                {activeTab === 'earnings'       && <EarningsPage user={user} />}
                {activeTab === 'analytics'      && <AnalyticsPage user={user} />}
                {activeTab === 'incubator'      && <IncubatorPage user={user} />}
                {activeTab === 'events'         && <EventsPage user={user} />}
                {activeTab === 'business-cards' && <BusinessCardsPage user={user} />}
                {activeTab === 'referral'       && <ReferralPage user={user} />}
                {activeTab === 'ads'            && <AdsPage user={user} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <SupportChatWidget />
    </div>
  );
}
