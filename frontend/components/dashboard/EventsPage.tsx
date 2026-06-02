'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { User } from '@/types/auth';

const CATEGORIES = ['Tous', 'NETWORKING', 'STARTUP', 'INVESTISSEMENT', 'FORMATION', 'INCUBATEUR'];
const CATEGORY_LABELS: Record<string, string> = {
  Tous: 'Tous',
  NETWORKING: 'Networking',
  STARTUP: 'Startup',
  INVESTISSEMENT: 'Investissement',
  FORMATION: 'Formation',
  INCUBATEUR: 'Incubateur',
};
const CATEGORY_COLORS: Record<string, string> = {
  NETWORKING: '#3b82f6',
  STARTUP: '#8b5cf6',
  INVESTISSEMENT: '#f59e0b',
  FORMATION: '#10b981',
  INCUBATEUR: '#ec4899',
};

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'PHYSICAL' | 'VIRTUAL';
  startDate: string;
  endDate: string;
  location?: string;
  virtualLink?: string;
  capacity?: number;
  price: number;
  isFree: boolean;
  imageUrl?: string;
  organizer: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  _count: { registrations: number };
}

interface Props {
  user: User | null;
}

const IconCalendar = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
    <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
    <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
  </svg>
);

const IconMapPin = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconUsers = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconLink = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'NETWORKING', type: 'VIRTUAL',
    startDate: '', endDate: '', location: '', virtualLink: '',
    capacity: '', price: '0', isFree: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.events.create({
        title: form.title,
        description: form.description,
        category: form.category,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        location: form.location || undefined,
        virtualLink: form.virtualLink || undefined,
        capacity: form.capacity ? parseInt(form.capacity) : undefined,
        price: form.isFree ? 0 : parseFloat(form.price),
        isFree: form.isFree,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800">Créer un événement</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Titre</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required
                placeholder="Nom de l'événement"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
              <textarea
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
                rows={3} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} required
                placeholder="Décrivez votre événement..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catégorie</label>
                <select
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}
                >
                  {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type</label>
                <select
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                >
                  <option value="VIRTUAL">Virtuel</option>
                  <option value="PHYSICAL">Physique</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Début</label>
                <input type="datetime-local" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fin</label>
                <input type="datetime-local" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  value={form.endDate} onChange={e => setForm(p => ({...p, endDate: e.target.value}))} required />
              </div>
            </div>
            {form.type === 'PHYSICAL' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lieu</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder="Adresse ou lieu" />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lien virtuel</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  value={form.virtualLink} onChange={e => setForm(p => ({...p, virtualLink: e.target.value}))} placeholder="https://meet.google.com/..." />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Capacité max</label>
                <input type="number" min="1" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  value={form.capacity} onChange={e => setForm(p => ({...p, capacity: e.target.value}))} placeholder="Illimité" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Billet</label>
                <div className="flex gap-2 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" checked={form.isFree} onChange={() => setForm(p => ({...p, isFree: true, price: '0'}))} />
                    <span className="text-sm text-slate-600">Gratuit</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" checked={!form.isFree} onChange={() => setForm(p => ({...p, isFree: false}))} />
                    <span className="text-sm text-slate-600">Payant</span>
                  </label>
                </div>
              </div>
            </div>
            {!form.isFree && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prix (TND)</label>
                <input type="number" min="0" step="0.01" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} />
              </div>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
              style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
            >
              {loading ? 'Création...' : 'Créer l\'événement'}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EventCard({ event, currentUserId, onRegister, registered }: {
  event: Event;
  currentUserId?: string;
  onRegister: (id: string) => void;
  registered: boolean;
}) {
  const catColor = CATEGORY_COLORS[event.category] || '#3b82f6';
  const isOwner = event.organizer.id === currentUserId;
  const spotsLeft = event.capacity ? event.capacity - event._count.registrations : null;

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {event.imageUrl && (
        <div className="h-36 overflow-hidden">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
            style={{ background: `${catColor}14`, color: catColor }}
          >
            {CATEGORY_LABELS[event.category]}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: event.type === 'VIRTUAL' ? '#8b5cf614' : '#10b98114', color: event.type === 'VIRTUAL' ? '#8b5cf6' : '#10b981' }}
            >
              {event.type === 'VIRTUAL' ? 'Virtuel' : 'Physique'}
            </span>
            {event.isFree ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">Gratuit</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">{event.price} TND</span>
            )}
          </div>
        </div>

        <h3 className="font-bold text-slate-800 text-[14px] mb-1.5 leading-snug line-clamp-2">{event.title}</h3>
        <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">{event.description}</p>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <IconCalendar />
            <span>{formatDate(event.startDate)}</span>
          </div>
          {event.type === 'PHYSICAL' && event.location && (
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <IconMapPin />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          {event.type === 'VIRTUAL' && (
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <IconLink />
              <span>Événement en ligne</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <IconUsers />
            <span>{event._count.registrations} inscrits{spotsLeft !== null ? ` · ${spotsLeft} places restantes` : ''}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold">
              {event.organizer.firstName[0]}{event.organizer.lastName[0]}
            </div>
            <span className="text-xs text-slate-500">{event.organizer.firstName} {event.organizer.lastName}</span>
          </div>

          {!isOwner && (
            <button
              onClick={() => onRegister(event.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={registered
                ? { background: '#f1f5f9', color: '#94a3b8' }
                : { background: `${catColor}16`, color: catColor }
              }
            >
              {registered ? 'Inscrit ✓' : "S'inscrire"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function EventsPage({ user }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (activeCategory !== 'Tous') params.category = activeCategory;
      if (upcomingOnly) params.upcoming = 'true';
      const [eventsData, regsData] = await Promise.all([
        api.events.list(params),
        api.events.myRegistrations(),
      ]);
      setEvents(eventsData);
      setMyRegistrations(regsData.map((r: any) => r.eventId));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [activeCategory, upcomingOnly]);

  useEffect(() => { load(); }, [load]);

  const handleRegister = async (eventId: string) => {
    if (myRegistrations.includes(eventId)) return;
    try {
      await api.events.register(eventId);
      setMyRegistrations(prev => [...prev, eventId]);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'inscription');
    }
  };

  const canCreate = (user?.role as string) === 'admin' || user?.role === 'entrepreneur';

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence>
        {showCreate && (
          <CreateEventModal onClose={() => setShowCreate(false)} onCreated={load} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 pt-6 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Événements</h2>
            <p className="text-sm text-slate-500 mt-0.5">Networking, formations et opportunités</p>
          </div>
          {canCreate && (
            <motion.button
              onClick={() => setShowCreate(true)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-lg shadow-blue-500/25"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Créer un événement
            </motion.button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={activeCategory === cat
                ? { background: CATEGORY_COLORS[cat] || '#3b82f6', color: '#fff' }
                : { background: '#f1f5f9', color: '#64748b' }
              }
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
          <button
            onClick={() => setUpcomingOnly(!upcomingOnly)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={upcomingOnly ? { background: '#10b981', color: '#fff' } : { background: '#f1f5f9', color: '#64748b' }}
          >
            À venir
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
                <div className="h-4 bg-slate-100 rounded-full w-20 mb-3" />
                <div className="h-5 bg-slate-100 rounded-full w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded-full w-full mb-1" />
                <div className="h-3 bg-slate-100 rounded-full w-2/3" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <IconCalendar />
            </div>
            <p className="text-slate-500 font-medium">Aucun événement trouvé</p>
            <p className="text-slate-400 text-sm mt-1">
              {canCreate ? 'Créez le premier événement de votre communauté !' : 'Revenez bientôt.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                currentUserId={user?.id}
                onRegister={handleRegister}
                registered={myRegistrations.includes(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
