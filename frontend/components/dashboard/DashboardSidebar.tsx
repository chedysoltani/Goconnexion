'use client';

import React from 'react';
import Link from 'next/link';
import { User } from '@/types/auth';

interface DashboardSidebarProps {
  user: User | null;
  activeTab: 'feed' | 'connections' | 'messages' | 'projects' | 'earnings' | 'analytics' | 'incubator';
  setActiveTab: (tab: 'feed' | 'connections' | 'messages' | 'projects' | 'earnings' | 'analytics' | 'incubator') => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

export default function DashboardSidebar({ user, activeTab, setActiveTab }: DashboardSidebarProps) {
  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    const baseItems: NavItem[] = [
      {
        id: 'feed',
        label: 'Fil d\'activité',
        icon: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ),
      },
      {
        id: 'connections',
        label: 'Connexions',
        icon: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2C0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        id: 'messages',
        label: 'Messages',
        icon: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8c1.55 0 2.823.62 3.734 1.51L21 12z" />
          </svg>
        ),
      },
      {
        id: 'projects',
        label: 'Projets',
        icon: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2v2A2 2 0 002 2h-2" />
          </svg>
        ),
      },
      {
        id: 'earnings',
        label: 'Revenus',
        icon: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .438-4.242-1.21l-6.016-6.016A6 6 0 001.758 12.424C1.754 14.251 3.418 15.424 5.242l6.016-6.016A6 6 0 0012 8z" />
          </svg>
        ),
      },
      {
        id: 'analytics',
        label: 'Analytiques',
        icon: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8l-4-4-4 4M4 16v-8l4 4 4-4" />
          </svg>
        ),
      },
      {
        id: 'incubator',
        label: 'Incubateur Virtuel',
        icon: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l.707-.707m2.808 13.07a3 3 0 11-5.714 0" />
          </svg>
        ),
      },
    ];

    // Role-specific items
    const roleSpecificItems: NavItem[] = [];
  

    if (user.role === 'entrepreneur') {
      roleSpecificItems.push(
        {
          id: 'team',
          label: 'Équipe',
          icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0A5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          href: '/dashboard/team',
        },
        {
          id: 'recruitment',
          label: 'Recrutement',
          icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A9.002 9.002 0 0112 21a9.002 9.002 0 01-9-9.255M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          href: '/dashboard/recruitment',
        }
      );
    }

    if (user.role === 'user') {
      roleSpecificItems.push(
        {
          id: 'learning',
          label: 'Formation',
          icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5 9" />
            </svg>
          ),
          href: '/dashboard/learning',
        },
        {
          id: 'goals',
          label: 'Objectifs',
          icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2v2a2 2 0 002 2h-2" />
            </svg>
          ),
          href: '/dashboard/goals',
        }
      );
    }

    return [...baseItems, ...roleSpecificItems];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r border-gc-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gc-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">GC</span>
          </div>
          <span className="font-sans font-semibold text-foreground">GoConnexions</span>
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gc-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center">
              <span className="text-accent font-semibold text-sm">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-accent/5 transition-colors"
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ) : (
                <button
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-accent text-white'
                      : 'text-muted hover:text-foreground hover:bg-accent/5'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-gc-border">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-accent/5 transition-colors"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 00-.663-.218 1.724 1.724 0 002.573-1.066c1.543.94 3.31.826 2.37 2.37zm3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31-.826 2.37-2.37a1.724 1.724 0 00-.663-.218 1.724 1.724 0 002.573 1.066c1.543.94 3.31.826 2.37 2.37z" />
          </svg>
          <span className="text-sm font-medium">Paramètres</span>
        </Link>
      </div>
    </aside>
  );
}
