'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { User } from '@/types/auth';

interface Invitation {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'EXPIRED';
  inviteMethod: 'EMAIL' | 'SMS';
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  sent: number;
  accepted: number;
}

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:  { label: 'En attente', bg: '#fef3c714', color: '#f59e0b' },
  SENT:     { label: 'Envoyée',    bg: '#dbeafe',   color: '#3b82f6' },
  ACCEPTED: { label: 'Acceptée',   bg: '#d1fae5',   color: '#10b981' },
  EXPIRED:  { label: 'Expirée',    bg: '#f1f5f9',   color: '#94a3b8' },
};

interface Props {
  user: User | null;
}

export default function BusinessCardsPage({ user }: Props) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, sent: 0, accepted: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', position: '', inviteMethod: 'EMAIL' as 'EMAIL' | 'SMS',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invs, s] = await Promise.all([
        api.businessCards.list(),
        api.businessCards.stats(),
      ]);
      setInvitations(invs);
      setStats(s);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.businessCards.create({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        position: form.position || undefined,
        inviteMethod: form.inviteMethod,
      });
      setForm({ name: '', email: '', phone: '', company: '', position: '', inviteMethod: 'EMAIL' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.businessCards.delete(id);
      setInvitations(prev => prev.filter(i => i.id !== id));
    } catch {
      // silent
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Cartes de visite</h2>
            <p className="text-sm text-slate-500 mt-0.5">Invitez de nouveaux contacts sur GoConnexion</p>
          </div>
          <motion.button
            onClick={() => setShowForm(true)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-lg shadow-blue-500/25"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Inviter un contact
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total', value: stats.total, color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Envoyées', value: stats.sent, color: '#8b5cf6', bg: '#ede9fe' },
            { label: 'Acceptées', value: stats.accepted, color: '#10b981', bg: '#d1fae5' },
            { label: 'En attente', value: stats.pending, color: '#f59e0b', bg: '#fef3c7' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-3">
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-slate-800">Saisir une carte de visite</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Envoyez une invitation GoConnexion</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nom complet *</label>
                      <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required placeholder="Jean Dupont" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                      <input type="email" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="jean@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Téléphone</label>
                      <input type="tel" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="+216 xx xxx xxx" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Entreprise</label>
                      <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        value={form.company} onChange={e => setForm(p => ({...p, company: e.target.value}))} placeholder="Startup Inc." />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Poste</label>
                      <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        value={form.position} onChange={e => setForm(p => ({...p, position: e.target.value}))} placeholder="CEO, Directeur..." />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Méthode d'invitation</label>
                    <div className="flex gap-3">
                      {(['EMAIL', 'SMS'] as const).map(method => (
                        <label key={method} className="flex-1 cursor-pointer">
                          <input type="radio" className="sr-only" value={method}
                            checked={form.inviteMethod === method}
                            onChange={() => setForm(p => ({...p, inviteMethod: method}))} />
                          <div className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                            form.inviteMethod === method ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500'
                          }`}>
                            {method === 'EMAIL' ? '📧 Email' : '📱 SMS'}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit" disabled={submitting}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all mt-2"
                    style={{ background: submitting ? '#94a3b8' : 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
                  >
                    {submitting ? 'Envoi...' : `Envoyer l'invitation par ${form.inviteMethod === 'EMAIL' ? 'email' : 'SMS'}`}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invitations list */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-100 rounded-full w-32 mb-2" />
                    <div className="h-3 bg-slate-100 rounded-full w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-2xl">📇</div>
            <p className="text-slate-500 font-medium">Aucune invitation envoyée</p>
            <p className="text-slate-400 text-sm mt-1">Commencez à inviter vos contacts !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map(inv => {
              const st = STATUS_STYLE[inv.status];
              return (
                <motion.div
                  key={inv.id} layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {inv.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-slate-800 text-sm truncate">{inv.name}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0" style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {inv.email && <span>✉ {inv.email}</span>}
                      {inv.phone && <span>📱 {inv.phone}</span>}
                      {inv.company && <span>🏢 {inv.company}</span>}
                      {inv.position && <span>· {inv.position}</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Via {inv.inviteMethod === 'EMAIL' ? 'email' : 'SMS'} · {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(inv.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
