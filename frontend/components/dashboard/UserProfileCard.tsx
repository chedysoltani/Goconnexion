'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/types/auth';
import { api } from '@/lib/api';

interface Props { user: User | null }

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  freelancer:   { label: 'Freelancer',  color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  entrepreneur: { label: 'Entrepreneur', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  collaborator: { label: 'Explorateur', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  user:         { label: 'Explorateur', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  admin:        { label: 'Admin',       color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
};

export default function UserProfileCard({ user }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'GC';

  const roleMeta = ROLE_META[user?.role?.toLowerCase() ?? 'user'] ?? ROLE_META.user;

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await api.auth.logout();
    router.push('/auth/login');
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${roleMeta.color}, ${roleMeta.color}aa)` }}
        >
          {initials}
        </div>

        {/* Name */}
        <div className="text-left hidden sm:block">
          <p className="text-[13px] font-semibold text-foreground leading-none">
            {user?.firstName ?? '—'} {user?.lastName ?? ''}
          </p>
          <p className="text-[11px] mt-0.5 font-medium" style={{ color: roleMeta.color }}>
            {roleMeta.label}
          </p>
        </div>

        {/* Chevron */}
        <svg
          width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"
          viewBox="0 0 24 24"
          className={`text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div
            className="absolute right-0 top-full mt-2 w-72 z-50 overflow-hidden"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '1rem',
              boxShadow: '0 20px 48px rgba(26,35,50,0.12), 0 4px 12px rgba(26,35,50,0.06)',
              animation: 'slideUp 0.2s cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            {/* User block */}
            <div className="p-5 border-b border-gc-border">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${roleMeta.color}, ${roleMeta.color}aa)` }}
                >
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-foreground leading-tight">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ background: roleMeta.bg, color: roleMeta.color }}
                  >
                    {roleMeta.label}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-2">
              <Link
                href="/dashboard/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-gc-bg transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-muted flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mon profil
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-gc-bg transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-muted flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Paramètres
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-gc-border py-2">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
