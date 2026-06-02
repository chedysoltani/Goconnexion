'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/types/auth';

type Tab = 'feed' | 'connections' | 'messages' | 'projects' | 'earnings' | 'analytics' | 'incubator' | 'events' | 'business-cards' | 'referral';

interface DashboardSidebarProps {
  user: User | null;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onUpgradeClick?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  description?: string;
}

const ROLE_CONFIG: Record<string, { color: string; bg: string; label: string; dot: string; gradient: string }> = {
  freelancer:   { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  label: 'Freelancer',   dot: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)' },
  entrepreneur: { color: '#c084fc', bg: 'rgba(139,92,246,0.12)', label: 'Entrepreneur', dot: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
  user:         { color: '#34d399', bg: 'rgba(16,185,129,0.12)', label: 'Explorateur',  dot: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
  admin:        { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', label: 'Admin',        dot: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
};

const IconFeed = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
);
const IconConnections = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconMessages = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const IconProjects = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);
const IconEarnings = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconAnalytics = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const IconIncubator = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);
const IconProfile = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconSettings = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconEvents = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
    <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
    <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
  </svg>
);
const IconCard = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" />
  </svg>
);
const IconReferral = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);
const IconChevron = ({ collapsed }: { collapsed: boolean }) => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
  </svg>
);

const sidebarVariants = {
  expanded:  { width: 256, transition: { duration: 0.35, ease: 'easeOut' as const } },
  collapsed: { width: 68,  transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const labelVariants = {
  show: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' as const, delay: 0.05 } },
  hide: { opacity: 0, x: -8, transition: { duration: 0.15, ease: 'easeIn' as const } },
};

export default function DashboardSidebar({ user, activeTab, setActiveTab, onUpgradeClick }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role?.toLowerCase() ?? 'user';
  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.user;
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'GC';

  const baseItems: NavItem[] = [
    { id: 'feed',           label: "Fil d'activité",  icon: <IconFeed /> },
    { id: 'connections',    label: 'Connexions',       icon: <IconConnections /> },
    { id: 'messages',       label: 'Messages',         icon: <IconMessages /> },
    { id: 'events',         label: 'Événements',       icon: <IconEvents /> },
    { id: 'projects',       label: 'Projets',          icon: <IconProjects /> },
    { id: 'incubator',      label: 'Incubateur',       icon: <IconIncubator /> },
    { id: 'business-cards', label: 'Cartes visite',    icon: <IconCard /> },
    { id: 'referral',       label: 'Parrainage',       icon: <IconReferral /> },
    { id: 'earnings',       label: 'Revenus',          icon: <IconEarnings /> },
    { id: 'analytics',      label: 'Analytiques',      icon: <IconAnalytics /> },
  ];

  const roleItems: NavItem[] = role === 'entrepreneur'
    ? [
        { id: 'team',        label: 'Équipe',      icon: <IconConnections />, href: '/dashboard/team' },
        { id: 'recruitment', label: 'Recrutement', icon: <IconProjects />,    href: '/dashboard/recruitment' },
      ]
    : role === 'user'
    ? [
        { id: 'learning', label: 'Formation',  icon: <IconIncubator />, href: '/dashboard/learning' },
        { id: 'goals',    label: 'Objectifs',  icon: <IconAnalytics />, href: '/dashboard/goals' },
      ]
    : [];

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      className="sidebar-premium flex flex-col relative overflow-hidden flex-shrink-0"
      style={{ height: '100vh' }}
    >
      {/* Ambient top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)' }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)' }}
      />

      {/* ── Logo ──────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-3.5 py-4 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group min-w-0">
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white text-xs shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
            }}
          >
            GC
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                variants={labelVariants}
                initial="hide"
                animate="show"
                exit="hide"
                className="font-bold text-white text-[14px] tracking-tight truncate group-hover:text-blue-300 transition-colors"
              >
                GoConnexion
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <motion.button
          whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <IconChevron collapsed={collapsed} />
        </motion.button>
      </div>

      {/* ── User card ─────────────────────── */}
      <AnimatePresence mode="wait">
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mx-2.5 mb-3 rounded-2xl p-3 overflow-hidden flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Role glow */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none rounded-2xl"
              style={{ background: `radial-gradient(ellipse at top left, ${roleConfig.dot}, transparent 70%)` }}
            />

            <div className="relative flex items-center gap-2.5">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white text-xs shadow-md"
                style={{ background: roleConfig.gradient }}
              >
                {initials}
              </motion.div>

              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    variants={labelVariants}
                    initial="hide"
                    animate="show"
                    exit="hide"
                    className="min-w-0 flex-1"
                  >
                    <p className="text-[12px] font-semibold text-white leading-tight truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: roleConfig.bg, color: roleConfig.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: roleConfig.dot }} />
                      {roleConfig.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  variants={labelVariants}
                  initial="hide"
                  animate="show"
                  exit="hide"
                  className="relative mt-2.5 pt-2"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    />
                    <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      En ligne · Disponible
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section label ─────────────────── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            variants={labelVariants}
            initial="hide"
            animate="show"
            exit="hide"
            className="relative z-10 px-4 mb-1.5"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.18)' }}>
              Navigation
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation ────────────────────── */}
      <nav className="relative z-10 flex-1 px-2 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5">
          {baseItems.map((item, index) => {
            const isActive = activeTab === item.id;
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.button
                  onClick={() => setActiveTab(item.id as Tab)}
                  title={collapsed ? item.label : undefined}
                  whileHover={{ x: isActive ? 0 : 2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors duration-150 group relative ${
                    isActive ? 'sidebar-item-active' : ''
                  }`}
                  style={!isActive ? { color: 'transparent' } : undefined}
                >
                  {/* Active glow indicator */}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{ background: '#3b82f6', boxShadow: '0 0 10px rgba(59,130,246,0.7)' }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}

                  <span
                    className={`flex-shrink-0 transition-all duration-200 ${
                      isActive
                        ? 'text-blue-400'
                        : 'text-white/35 group-hover:text-white/65'
                    }`}
                  >
                    {item.icon}
                  </span>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        variants={labelVariants}
                        initial="hide"
                        animate="show"
                        exit="hide"
                        className={`text-[13px] font-medium transition-colors duration-150 truncate ${
                          isActive ? 'text-white font-semibold' : 'text-white/45 group-hover:text-white/75'
                        }`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!collapsed && item.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500 text-white flex-shrink-0"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </motion.button>
              </motion.li>
            );
          })}
        </ul>

        {/* Role-specific items */}
        {roleItems.length > 0 && (
          <>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  variants={labelVariants}
                  initial="hide"
                  animate="show"
                  exit="hide"
                  className="mt-4 mb-1.5 px-2.5"
                >
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.18)' }}>
                    {roleConfig.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <ul className="space-y-0.5">
              {roleItems.map((item) => (
                <li key={item.id}>
                  <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href={item.href!}
                      title={collapsed ? item.label : undefined}
                      className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl group transition-colors duration-150 hover:bg-white/5"
                    >
                      <span className="flex-shrink-0 text-white/30 group-hover:text-white/60 transition-colors">
                        {item.icon}
                      </span>
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            variants={labelVariants}
                            initial="hide"
                            animate="show"
                            exit="hide"
                            className="text-[13px] font-medium text-white/40 group-hover:text-white/70 transition-colors truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* ── Upgrade Banner ────────────────── */}
      {!collapsed && user && (!user.plan || user.plan === 'FREE') && (
        <div className="relative z-10 px-2.5 mb-2 flex-shrink-0">
          <motion.button
            onClick={onUpgradeClick}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}
            whileTap={{ scale: 0.97 }}
            className="w-full px-4 py-3 rounded-2xl text-left relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(25%,-25%)' }} />
            <p className="text-[11px] font-bold text-white flex items-center gap-1.5 mb-0.5">
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Passer à Pro
            </p>
            <p className="text-[10px] text-blue-200 leading-tight">
              Connexions illimitées, analytics, contrats...
            </p>
          </motion.button>
        </div>
      )}

      {/* ── Bottom area ───────────────────── */}
      <div className="relative z-10 px-2 py-3 flex-shrink-0">
        <div
          className="h-px mb-3"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }}
        />

        {[
          { href: '/dashboard/profile', icon: <IconProfile />, label: 'Mon profil' },
          { href: '/pricing', icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>, label: 'Forfaits' },
          { href: '/dashboard/settings', icon: <IconSettings />, label: 'Paramètres' },
        ].map((item) => (
          <motion.div key={item.href} whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={item.href}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl group transition-colors duration-150 hover:bg-white/5 mb-0.5"
            >
              <span className="flex-shrink-0 text-white/25 group-hover:text-white/55 transition-colors">
                {item.icon}
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    variants={labelVariants}
                    initial="hide"
                    animate="show"
                    exit="hide"
                    className="text-[12px] font-medium text-white/35 group-hover:text-white/65 transition-colors truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>
        ))}

        <AnimatePresence>
          {!collapsed && (
            <motion.p
              variants={labelVariants}
              initial="hide"
              animate="show"
              exit="hide"
              className="mt-3 px-2.5 text-[9px] font-medium"
              style={{ color: 'rgba(255,255,255,0.12)' }}
            >
              GoConnexion © 2026
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
