'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalEvents: number;
  totalConversations: number;
  activeSubscriptions: number;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  plan: string;
  createdAt: string;
  lastActiveAt: string | null;
}

const PLAN_COLORS: Record<string, string> = {
  FREE: '#94a3b8',
  PRO: '#3b82f6',
  BUSINESS: '#8b5cf6',
  PREMIUM_ENTREPRENEUR: '#2563eb',
  PREMIUM_FREELANCER: '#f59e0b',
  PREMIUM_INCUBATEUR: '#ec4899',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#ef4444',
  FREELANCER: '#3b82f6',
  ENTREPRENEUR: '#2563eb',
  COLLABORATOR: '#f59e0b',
};

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }

    const load = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          api.admin.stats(),
          api.admin.users(1, 50),
        ]);
        setStats(statsData);
        setUsers(usersData.users ?? []);
      } catch {
        // silencieux
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) return;
    setDeletingId(id);
    try {
      await api.admin.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (stats) setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
    } catch {
      // silencieux
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d)) : '—';

  return (
    <div className="min-h-screen p-8" style={{ background: '#f8fafc' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>A</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Panel Administration</h1>
            <p className="text-sm text-slate-500">GoConnexions — Vue d'ensemble en temps réel</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Utilisateurs', value: stats?.totalUsers ?? 0, icon: '👥', color: '#3b82f6' },
                { label: 'Projets', value: stats?.totalProjects ?? 0, icon: '🚀', color: '#2563eb' },
                { label: 'Événements actifs', value: stats?.totalEvents ?? 0, icon: '📅', color: '#8b5cf6' },
                { label: 'Conversations', value: stats?.totalConversations ?? 0, icon: '💬', color: '#6366f1' },
                { label: 'Abonnés actifs', value: stats?.activeSubscriptions ?? 0, icon: '⭐', color: '#ec4899' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-2xl font-black" style={{ color: s.color }}>{s.value}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-600">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Users table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Utilisateurs ({users.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Utilisateur', 'Rôle', 'Plan', 'Inscription', 'Dernière activité', 'Actions'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="transition-colors"
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <td className="px-5 py-4">
                          <p className="text-[13px] font-semibold text-slate-800">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${ROLE_COLORS[u.role] ?? '#94a3b8'}15`, color: ROLE_COLORS[u.role] ?? '#94a3b8' }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${PLAN_COLORS[u.plan] ?? '#94a3b8'}15`, color: PLAN_COLORS[u.plan] ?? '#94a3b8' }}
                          >
                            {u.plan}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[12px] text-slate-500">{formatDate(u.createdAt)}</td>
                        <td className="px-5 py-4 text-[12px] text-slate-500">{formatDate(u.lastActiveAt)}</td>
                        <td className="px-5 py-4">
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={deletingId === u.id}
                              className="text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors disabled:opacity-40"
                              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
                            >
                              {deletingId === u.id ? '...' : 'Supprimer'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
