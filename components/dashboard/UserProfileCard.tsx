'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User } from '@/types/auth';

interface UserProfileCardProps {
  user: User | null;
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getInitials = () => {
    if (!user) return 'GC';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getRoleColor = () => {
    if (!user) return 'bg-gray-500';
    switch (user.role) {
      case 'freelancer': return 'bg-blue-500';
      case 'entrepreneur': return 'bg-green-500';
      case 'user': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gc-bg transition-colors"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getRoleColor()}`}>
          {getInitials()}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-muted capitalize">
            {user?.role}
          </p>
        </div>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7m7 7v4a2 2 0 002 2h-1M9 12a2 2 0 002 2v4a2 2 0 002 2h-1" />
        </svg>
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gc-border z-50">
          <div className="p-6 border-b border-gc-border">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getRoleColor()}`}>
                {getInitials()}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-muted capitalize">
                  {user?.role}
                </p>
                <p className="text-xs text-muted">
                  {user?.email}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 text-sm text-accent hover:text-primary transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Voir mon profil
            </Link>
          </div>

          <div className="py-2">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-gc-bg transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 00-.663-.218 1.724 1.724 0 002.573-1.066c1.543.94 3.31.826 2.37 2.37zm3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31-.826 2.37-2.37a1.724 1.724 0 00-.663-.218 1.724 1.724 0 002.573 1.066c1.543.94 3.31.826 2.37 2.37z" />
              </svg>
              Paramètres
            </Link>
          </div>

          <div className="py-2 border-t border-gc-border">
            <Link
              href="/auth/login"
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4 4m4-4v4m0 0h-14" />
              </svg>
              Déconnexion
            </Link>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
