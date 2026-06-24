'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    Promise.all([
      api.users?.list?.() ?? fetch('http://localhost:3001/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json()).catch(() => null)
    ]).then(() => setLoading(false)).catch(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen p-8" style={{ background: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>A</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Panel Administration</h1>
            <p className="text-sm text-slate-500">GoConnexion — Vue d'ensemble</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: 'Utilisateurs', value: '7', icon: '👥', color: '#3b82f6' },
              { label: 'Projets actifs', value: '3', icon: '🚀', color: '#10b981' },
              { label: 'Événements', value: '3', icon: '📅', color: '#8b5cf6' },
              { label: 'Connexions', value: '5', icon: '🔗', color: '#f59e0b' },
              { label: 'Messages', value: '9', icon: '💬', color: '#6366f1' },
              { label: 'Abonnements actifs', value: '3', icon: '⭐', color: '#ec4899' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-2xl font-black" style={{ color: s.color }}>{s.value}</span>
                </div>
                <p className="text-sm font-semibold text-slate-600">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Comptes de test</h2>
          <div className="space-y-2">
            {[
              { email: 'jean.dupont@goconnexions.com', role: 'Freelancer FREE', color: '#3b82f6' },
              { email: 'sarah.benali@goconnexions.com', role: 'Freelancer PREMIUM', color: '#10b981' },
              { email: 'sophie.martin@goconnexions.com', role: 'Entrepreneur PREMIUM', color: '#8b5cf6' },
              { email: 'karim.mansour@goconnexions.com', role: 'Incubateur PREMIUM', color: '#f59e0b' },
            ].map(u => (
              <div key={u.email} className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ background: '#f8fafc' }}>
                <span className="text-xs font-mono text-slate-600">{u.email}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${u.color}15`, color: u.color }}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
