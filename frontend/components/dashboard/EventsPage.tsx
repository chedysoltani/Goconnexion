'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { User } from '@/types/auth';

const CATEGORIES = ['Tous', 'NETWORKING', 'STARTUP', 'INVESTISSEMENT', 'FORMATION', 'INCUBATEUR', 'SALON', 'CONFERENCE', 'HACKATHON'];
const CATEGORY_LABELS: Record<string, string> = {
  Tous: 'Tous', NETWORKING: 'Networking', STARTUP: 'Startup', INVESTISSEMENT: 'Investissement',
  FORMATION: 'Formation', INCUBATEUR: 'Incubateur', SALON: 'Salon', CONFERENCE: 'Conférence', HACKATHON: 'Hackathon',
};
const CATEGORY_COLORS: Record<string, string> = {
  NETWORKING: '#3b82f6', STARTUP: '#8b5cf6', INVESTISSEMENT: '#f59e0b', FORMATION: '#10b981',
  INCUBATEUR: '#ec4899', SALON: '#0ea5e9', CONFERENCE: '#6366f1', HACKATHON: '#f97316',
};
const BOOTH_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  AVAILABLE: { bg: '#d1fae5', text: '#065f46', label: 'Disponible' },
  RESERVED:  { bg: '#fef3c7', text: '#92400e', label: 'Réservé' },
  OCCUPIED:  { bg: '#fee2e2', text: '#991b1b', label: 'Occupé' },
};
const BOOTH_TYPE_LABELS: Record<string, string> = {
  SMALL: 'Petit (S)', MEDIUM: 'Moyen (M)', LARGE: 'Grand (L)', CORNER: 'Angle', VIP: 'VIP',
};

interface TicketType { id: string; name: string; price: number; currency: string; capacity?: number; description?: string; color?: string; _count?: { registrations: number } }
interface Booth { id: string; number: string; type: string; price: number; currency: string; surface?: number; description?: string; status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED'; reservedBy?: { firstName: string; lastName: string } | null }
interface Event {
  id: string; title: string; description: string; category: string; type: 'PHYSICAL' | 'VIRTUAL';
  startDate: string; endDate: string; location?: string; address?: string; latitude?: number; longitude?: number;
  virtualLink?: string; capacity?: number; price: number; currency: string; isFree: boolean; imageUrl?: string;
  organizer: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  ticketTypes?: TicketType[];
  booths?: Booth[];
  _count: { registrations: number };
}

interface Props { user: User | null }

// ── Icons ─────────────────────────────────────────────────────────────────
const IconCalendar = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);
const IconUsers = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);
const IconLink = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
  </svg>
);

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400";
const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5";

// ── BoothGrid ─────────────────────────────────────────────────────────────
function BoothGrid({ booths, onSelectBooth, selectedBoothId }: {
  booths: Booth[];
  onSelectBooth?: (booth: Booth) => void;
  selectedBoothId?: string;
}) {
  if (!booths.length) return (
    <div className="text-center py-8 text-slate-400 text-sm">Aucun stand configuré</div>
  );
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {booths.map(b => {
        const sc = BOOTH_STATUS_COLORS[b.status];
        const isSelected = selectedBoothId === b.id;
        const clickable = b.status === 'AVAILABLE' && !!onSelectBooth;
        return (
          <button
            key={b.id}
            disabled={!clickable}
            onClick={() => clickable && onSelectBooth?.(b)}
            className="rounded-xl p-2.5 text-left transition-all border-2"
            style={{
              background: isSelected ? '#3b82f6' : sc.bg,
              borderColor: isSelected ? '#2563eb' : 'transparent',
              cursor: clickable ? 'pointer' : 'default',
              opacity: b.status === 'OCCUPIED' ? 0.6 : 1,
            }}
          >
            <p className="text-[11px] font-bold" style={{ color: isSelected ? '#fff' : sc.text }}>Stand {b.number}</p>
            <p className="text-[10px]" style={{ color: isSelected ? '#dbeafe' : sc.text }}>{BOOTH_TYPE_LABELS[b.type] ?? b.type}</p>
            <p className="text-[10px] font-semibold mt-0.5" style={{ color: isSelected ? '#fff' : sc.text }}>
              {b.price === 0 ? 'Gratuit' : `${b.price} ${b.currency}`}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ── CheckoutModal ─────────────────────────────────────────────────────────
function CheckoutModal({ event, onClose, onSuccess }: {
  event: Event;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [ticketTypeId, setTicketTypeId] = useState<string>('');
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [provider, setProvider] = useState<'stripe' | 'wise'>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wiseInfo, setWiseInfo] = useState<any>(null);

  const ticketTypes = event.ticketTypes ?? [];
  const booths = event.booths ?? [];
  const availableBooths = booths.filter(b => b.status === 'AVAILABLE');

  const selectedTicket = ticketTypes.find(t => t.id === ticketTypeId);
  const totalPrice = (selectedTicket?.price ?? (event.isFree ? 0 : event.price ?? 0)) + (selectedBooth?.price ?? 0);
  const isFree = totalPrice === 0;

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await api.events.registerCheckout(event.id, {
        ticketTypeId: ticketTypeId || undefined,
        boothId: selectedBooth?.id,
        provider: isFree ? undefined : provider,
      });
      if (result.url) {
        window.location.href = result.url;
      } else if (result.reference) {
        setWiseInfo(result);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (wiseInfo) {
    return (
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
          <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3 text-2xl">🏦</div>
            <h3 className="font-bold text-slate-800 text-lg">Instructions Wise</h3>
            <p className="text-sm text-slate-500 mt-1">Effectuez votre virement avec la référence ci-dessous</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-center">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Référence obligatoire</p>
            <p className="font-mono font-bold text-slate-800 text-sm select-all">{wiseInfo.reference}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Montant</span><span className="font-bold text-slate-800">{wiseInfo.amount} {wiseInfo.currency}</span></div>
            {wiseInfo.accountDetails && Object.entries(wiseInfo.accountDetails.details ?? {}).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs"><span className="text-slate-400">{k}</span><span className="text-slate-600 font-mono">{String(v)}</span></div>
            ))}
          </div>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">
            Compris, j'effectuerai le virement
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Inscription</h2>
              <p className="text-xs text-slate-500 mt-0.5">{event.title}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"><IconX /></button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

          {ticketTypes.length > 0 && (
            <div className="mb-5">
              <p className={labelCls}>Type de billet</p>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${ticketTypeId === '' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="tt" checked={ticketTypeId === ''} onChange={() => setTicketTypeId('')} className="accent-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">Billet standard</p>
                    <p className="text-xs text-slate-500">{event.isFree ? 'Gratuit' : `${event.price} ${event.currency}`}</p>
                  </div>
                </label>
                {ticketTypes.map(tt => (
                  <label key={tt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${ticketTypeId === tt.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="tt" checked={ticketTypeId === tt.id} onChange={() => setTicketTypeId(tt.id)} className="accent-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{tt.name}</p>
                      {tt.description && <p className="text-xs text-slate-500">{tt.description}</p>}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{tt.price === 0 ? 'Gratuit' : `${tt.price} ${tt.currency}`}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {availableBooths.length > 0 && (
            <div className="mb-5">
              <p className={labelCls}>Stand (optionnel)</p>
              <BoothGrid
                booths={event.booths ?? []}
                onSelectBooth={b => setSelectedBooth(prev => prev?.id === b.id ? null : b)}
                selectedBoothId={selectedBooth?.id}
              />
            </div>
          )}

          {!isFree && (
            <div className="mb-5">
              <p className={labelCls}>Mode de paiement</p>
              <div className="grid grid-cols-2 gap-2">
                {(['stripe', 'wise'] as const).map(p => (
                  <button key={p} onClick={() => setProvider(p)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${provider === p ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {p === 'stripe' ? '💳 Carte Stripe' : '🏦 Virement Wise'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-4">
            <span className="text-sm text-slate-600">Total</span>
            <span className="text-lg font-bold text-slate-800">{isFree ? 'Gratuit' : `${totalPrice} ${selectedTicket?.currency ?? event.currency ?? 'CAD'}`}</span>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
            style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
            {loading ? 'Traitement...' : isFree ? 'Confirmer l\'inscription' : provider === 'stripe' ? 'Payer par carte →' : 'Voir les infos Wise →'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── CreateEventModal ──────────────────────────────────────────────────────
function CreateEventModal({ onClose, onCreated, initial }: { onClose: () => void; onCreated: () => void; initial?: Partial<Event> }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '', description: initial?.description ?? '',
    category: initial?.category ?? 'NETWORKING', type: initial?.type ?? 'VIRTUAL',
    startDate: initial?.startDate ? initial.startDate.slice(0, 16) : '',
    endDate: initial?.endDate ? initial.endDate.slice(0, 16) : '',
    location: initial?.location ?? '', address: initial?.address ?? '',
    latitude: initial?.latitude?.toString() ?? '', longitude: initial?.longitude?.toString() ?? '',
    virtualLink: initial?.virtualLink ?? '', capacity: initial?.capacity?.toString() ?? '',
    price: initial?.price?.toString() ?? '0', isFree: initial?.isFree ?? true,
    currency: initial?.currency ?? 'CAD',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!initial?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const payload: any = {
      title: form.title, description: form.description, category: form.category, type: form.type,
      startDate: form.startDate, endDate: form.endDate, currency: form.currency,
      location: form.location || undefined, address: form.address || undefined,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      virtualLink: form.virtualLink || undefined, capacity: form.capacity ? parseInt(form.capacity) : undefined,
      price: form.isFree ? 0 : parseFloat(form.price), isFree: form.isFree,
    };
    try {
      if (isEdit) await api.events.update(initial!.id!, payload);
      else await api.events.create(payload);
      onCreated(); onClose();
    } catch (err: any) { setError(err.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Modifier l\'événement' : 'Créer un événement'}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"><IconX /></button>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Titre</label>
              <input className={inputCls} value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required placeholder="Nom de l'événement" />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls + ' resize-none'} rows={3} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} required placeholder="Décrivez votre événement..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Catégorie</label>
                <select className={inputCls} value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                  {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select className={inputCls} value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value as 'PHYSICAL' | 'VIRTUAL'}))}>
                  <option value="VIRTUAL">Virtuel</option>
                  <option value="PHYSICAL">Physique</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Début</label>
                <input type="datetime-local" className={inputCls} value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))} required />
              </div>
              <div>
                <label className={labelCls}>Fin</label>
                <input type="datetime-local" className={inputCls} value={form.endDate} onChange={e => setForm(p => ({...p, endDate: e.target.value}))} required />
              </div>
            </div>
            {form.type === 'PHYSICAL' ? (
              <>
                <div>
                  <label className={labelCls}>Lieu / Salle</label>
                  <input className={inputCls} value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder="Centre des congrès..." />
                </div>
                <div>
                  <label className={labelCls}>Adresse complète</label>
                  <input className={inputCls} value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} placeholder="123 rue Principale, Montréal, QC" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Latitude (GPS)</label>
                    <input type="number" step="any" className={inputCls} value={form.latitude} onChange={e => setForm(p => ({...p, latitude: e.target.value}))} placeholder="45.5017" />
                  </div>
                  <div>
                    <label className={labelCls}>Longitude (GPS)</label>
                    <input type="number" step="any" className={inputCls} value={form.longitude} onChange={e => setForm(p => ({...p, longitude: e.target.value}))} placeholder="-73.5673" />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className={labelCls}>Lien virtuel</label>
                <input className={inputCls} value={form.virtualLink} onChange={e => setForm(p => ({...p, virtualLink: e.target.value}))} placeholder="https://meet.google.com/..." />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Capacité max</label>
                <input type="number" min="1" className={inputCls} value={form.capacity} onChange={e => setForm(p => ({...p, capacity: e.target.value}))} placeholder="Illimité" />
              </div>
              <div>
                <label className={labelCls}>Devise</label>
                <select className={inputCls} value={form.currency} onChange={e => setForm(p => ({...p, currency: e.target.value}))}>
                  <option value="CAD">CAD</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Tarification</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={form.isFree} onChange={() => setForm(p => ({...p, isFree: true, price: '0'}))} className="accent-blue-600" />
                  <span className="text-sm text-slate-600">Gratuit</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={!form.isFree} onChange={() => setForm(p => ({...p, isFree: false}))} className="accent-blue-600" />
                  <span className="text-sm text-slate-600">Payant</span>
                </label>
              </div>
              {!form.isFree && (
                <input type="number" min="0" step="0.01" className={inputCls} value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} placeholder="Prix de base" />
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
              style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
              {loading ? 'Enregistrement...' : isEdit ? 'Enregistrer les modifications' : 'Créer l\'événement'}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── EventDetailModal ──────────────────────────────────────────────────────
function EventDetailModal({ event, currentUserId, myRegistration, onClose, onRefresh }: {
  event: Event;
  currentUserId?: string;
  myRegistration?: any;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<'infos' | 'billets' | 'stands' | 'participants'>('infos');
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingPart, setLoadingPart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  // Ticket type form
  const [ttForm, setTtForm] = useState({ name: '', price: '0', currency: 'CAD', capacity: '', description: '' });
  const [ttLoading, setTtLoading] = useState(false);
  const [boothForm, setBoothForm] = useState({ number: '', type: 'SMALL', price: '0', currency: 'CAD', surface: '', description: '' });
  const [boothLoading, setBoothLoading] = useState(false);

  const catColor = CATEGORY_COLORS[event.category] || '#3b82f6';
  const isOwner = event.organizer.id === currentUserId;
  const spotsLeft = event.capacity ? event.capacity - event._count.registrations : null;
  const isRegistered = myRegistration?.status === 'REGISTERED' || myRegistration?.status === 'ATTENDED';
  const isPendingPayment = myRegistration?.status === 'WAITLISTED' && !!myRegistration?.paymentId;
  const isRealWaitlist = myRegistration?.status === 'WAITLISTED' && !myRegistration?.paymentId;

  const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    REGISTERED:       { label: 'Inscrit', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    WAITLISTED:       { label: 'Liste d\'attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    PENDING_PAYMENT:  { label: 'Paiement en attente', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    CANCELLED:        { label: 'Annulé', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    ATTENDED:         { label: 'Présent', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  };
  const myStatusKey = isPendingPayment ? 'PENDING_PAYMENT' : (myRegistration?.status ?? 'REGISTERED');

  const loadParticipants = useCallback(async () => {
    setLoadingPart(true);
    try { setParticipants(await api.events.participants(event.id)); } catch { setParticipants([]); }
    finally { setLoadingPart(false); }
  }, [event.id]);

  useEffect(() => { if (tab === 'participants') loadParticipants(); }, [tab, loadParticipants]);

  const handleCancel = async () => {
    if (!confirm('Annuler votre inscription ?')) return;
    setActionLoading('cancel');
    try { await api.events.cancelRegistration(event.id); onRefresh(); onClose(); }
    catch (err: any) { setError(err.message || 'Erreur'); }
    finally { setActionLoading(''); }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement cet événement ?')) return;
    setActionLoading('delete');
    try { await api.events.delete(event.id); onRefresh(); onClose(); }
    catch (err: any) { setError(err.message || 'Erreur'); }
    finally { setActionLoading(''); }
  };

  const handleCreateTicketType = async (e: React.FormEvent) => {
    e.preventDefault(); setTtLoading(true);
    try {
      await api.events.createTicketType(event.id, { ...ttForm, price: parseFloat(ttForm.price), capacity: ttForm.capacity ? parseInt(ttForm.capacity) : undefined });
      setTtForm({ name: '', price: '0', currency: 'CAD', capacity: '', description: '' });
      onRefresh();
    } catch (err: any) { setError(err.message || 'Erreur'); }
    finally { setTtLoading(false); }
  };

  const handleDeleteTicketType = async (ttId: string) => {
    if (!confirm('Supprimer ce type de billet ?')) return;
    try { await api.events.deleteTicketType(event.id, ttId); onRefresh(); }
    catch (err: any) { setError(err.message || 'Erreur'); }
  };

  const handleCreateBooth = async (e: React.FormEvent) => {
    e.preventDefault(); setBoothLoading(true);
    try {
      await api.events.createBooth(event.id, { ...boothForm, price: parseFloat(boothForm.price), surface: boothForm.surface ? parseFloat(boothForm.surface) : undefined });
      setBoothForm({ number: '', type: 'SMALL', price: '0', currency: 'CAD', surface: '', description: '' });
      onRefresh();
    } catch (err: any) { setError(err.message || 'Erreur'); }
    finally { setBoothLoading(false); }
  };

  const handleDeleteBooth = async (boothId: string) => {
    if (!confirm('Supprimer ce stand ?')) return;
    try { await api.events.deleteBooth(event.id, boothId); onRefresh(); }
    catch (err: any) { setError(err.message || 'Erreur'); }
  };

  return (
    <>
      {showEdit && <CreateEventModal onClose={() => setShowEdit(false)} onCreated={() => { setShowEdit(false); onRefresh(); }} initial={event} />}
      {showCheckout && <CheckoutModal event={event} onClose={() => setShowCheckout(false)} onSuccess={() => { setShowCheckout(false); onRefresh(); }} />}

      <motion.div className="fixed inset-0 z-40 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
          initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}>

          {/* Color bar */}
          <div className="h-1.5 rounded-t-2xl flex-shrink-0" style={{ background: `linear-gradient(90deg,${catColor},${catColor}80)` }} />

          {/* Header */}
          <div className="p-5 pb-0 flex-shrink-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: `${catColor}14`, color: catColor }}>
                  {CATEGORY_LABELS[event.category]}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: event.type === 'VIRTUAL' ? '#8b5cf614' : '#10b98114', color: event.type === 'VIRTUAL' ? '#8b5cf6' : '#10b981' }}>
                  {event.type === 'VIRTUAL' ? 'Virtuel' : 'Physique'}
                </span>
                {event.isFree
                  ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">Gratuit</span>
                  : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">À partir de {event.price} {event.currency}</span>
                }
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all ml-2 flex-shrink-0"><IconX /></button>
            </div>
            <h2 className="text-[16px] font-bold text-slate-800 mb-1 leading-snug">{event.title}</h2>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold">
                {event.organizer.firstName[0]}{event.organizer.lastName[0]}
              </div>
              <span className="text-[11px] text-slate-500">{event.organizer.firstName} {event.organizer.lastName}</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 -mx-5 px-5 gap-1">
              {(['infos', 'billets', 'stands', 'participants'] as const).map(t => {
                const labels = { infos: 'Infos', billets: `Billets${(event.ticketTypes?.length ?? 0) > 0 ? ` (${event.ticketTypes?.length})` : ''}`, stands: `Stands${(event.booths?.length ?? 0) > 0 ? ` (${event.booths?.length})` : ''}`, participants: `Participants` };
                return (
                  <button key={t} onClick={() => setTab(t)}
                    className="px-3 py-2 text-xs font-semibold border-b-2 transition-all -mb-px"
                    style={{ borderColor: tab === t ? catColor : 'transparent', color: tab === t ? catColor : '#94a3b8' }}>
                    {labels[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <div className="mx-5 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">{error}</div>}

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-5 pt-4">

            {tab === 'infos' && (
              <div className="space-y-4">
                <p className="text-slate-500 text-[13px] leading-relaxed">{event.description}</p>
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600 text-[12px]"><IconCalendar /><span>{formatDate(event.startDate)}</span></div>
                  {event.type === 'PHYSICAL' && (event.location || event.address) && (
                    <div className="flex items-center gap-2 text-slate-600 text-[12px]"><IconMapPin /><span>{event.address ?? event.location}</span></div>
                  )}
                  {event.type === 'VIRTUAL' && event.virtualLink && (
                    <div className="flex items-center gap-2 text-[12px]"><IconLink />
                      <a href={event.virtualLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">{event.virtualLink}</a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600 text-[12px]"><IconUsers />
                    <span>{event._count.registrations} inscrits{spotsLeft !== null ? ` · ${spotsLeft} place${spotsLeft !== 1 ? 's' : ''} restante${spotsLeft !== 1 ? 's' : ''}` : ''}</span>
                  </div>
                </div>
                {myRegistration && !isOwner && (
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${isPendingPayment ? 'bg-orange-50 border-orange-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div>
                      <p className={`text-xs font-semibold ${isPendingPayment ? 'text-orange-700' : 'text-emerald-700'}`}>Votre inscription</p>
                      {(() => { const sc = STATUS_LABELS[myStatusKey]; return (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                      ); })()}
                      {isPendingPayment && myRegistration.paymentId?.startsWith('WE-') && (
                        <p className="text-[10px] text-orange-500 mt-1">Réf. Wise : <span className="font-mono">{myRegistration.paymentId}</span></p>
                      )}
                    </div>
                    {isRegistered && myRegistration.ticketCode && (
                      <a href={`/events/ticket/${myRegistration.ticketCode}`} target="_blank" rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold">
                        Mon billet
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === 'billets' && (
              <div className="space-y-3">
                {(event.ticketTypes ?? []).length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-4">Aucun type de billet configuré</p>
                ) : (
                  (event.ticketTypes ?? []).map(tt => (
                    <div key={tt.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{tt.name}</p>
                        {tt.description && <p className="text-xs text-slate-500">{tt.description}</p>}
                        {tt.capacity && <p className="text-xs text-slate-400">{tt.capacity} places max</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700">{tt.price === 0 ? 'Gratuit' : `${tt.price} ${tt.currency}`}</span>
                        {isOwner && (
                          <button onClick={() => handleDeleteTicketType(tt.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                            <IconX />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isOwner && (
                  <form onSubmit={handleCreateTicketType} className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Ajouter un type de billet</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputCls} placeholder="Nom (ex: VIP)" value={ttForm.name} onChange={e => setTtForm(p => ({...p, name: e.target.value}))} required />
                      <input type="number" min="0" step="0.01" className={inputCls} placeholder="Prix" value={ttForm.price} onChange={e => setTtForm(p => ({...p, price: e.target.value}))} required />
                      <input type="number" min="1" className={inputCls} placeholder="Capacité (opt.)" value={ttForm.capacity} onChange={e => setTtForm(p => ({...p, capacity: e.target.value}))} />
                      <select className={inputCls} value={ttForm.currency} onChange={e => setTtForm(p => ({...p, currency: e.target.value}))}>
                        <option>CAD</option><option>USD</option><option>EUR</option>
                      </select>
                    </div>
                    <input className={inputCls} placeholder="Description (opt.)" value={ttForm.description} onChange={e => setTtForm(p => ({...p, description: e.target.value}))} />
                    <button type="submit" disabled={ttLoading} className="w-full py-2 rounded-xl text-white text-sm font-semibold transition-all" style={{ background: ttLoading ? '#94a3b8' : '#3b82f6' }}>
                      {ttLoading ? '...' : '+ Ajouter'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {tab === 'stands' && (
              <div className="space-y-4">
                <BoothGrid booths={event.booths ?? []} />
                {isOwner && (
                  <form onSubmit={handleCreateBooth} className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Ajouter un stand</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputCls} placeholder="Numéro (ex: A-01)" value={boothForm.number} onChange={e => setBoothForm(p => ({...p, number: e.target.value}))} required />
                      <select className={inputCls} value={boothForm.type} onChange={e => setBoothForm(p => ({...p, type: e.target.value}))}>
                        {Object.entries(BOOTH_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <input type="number" min="0" step="0.01" className={inputCls} placeholder="Prix" value={boothForm.price} onChange={e => setBoothForm(p => ({...p, price: e.target.value}))} required />
                      <input type="number" min="0" step="0.5" className={inputCls} placeholder="Surface m² (opt.)" value={boothForm.surface} onChange={e => setBoothForm(p => ({...p, surface: e.target.value}))} />
                    </div>
                    <input className={inputCls} placeholder="Description (opt.)" value={boothForm.description} onChange={e => setBoothForm(p => ({...p, description: e.target.value}))} />
                    <button type="submit" disabled={boothLoading} className="w-full py-2 rounded-xl text-white text-sm font-semibold transition-all" style={{ background: boothLoading ? '#94a3b8' : '#7c3aed' }}>
                      {boothLoading ? '...' : '+ Ajouter le stand'}
                    </button>
                  </form>
                )}
                {!isOwner && (event.booths ?? []).filter(b => b.status === 'AVAILABLE').length > 0 && (
                  <p className="text-xs text-slate-500 text-center">Cliquez sur un stand vert dans la section S'inscrire pour le réserver</p>
                )}
              </div>
            )}

            {tab === 'participants' && (
              <div className="space-y-2">
                {loadingPart ? (
                  <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" /></div>
                ) : participants.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-6">Aucun participant pour l'instant</p>
                ) : (
                  participants.map((reg: any) => {
                    const u = reg.user;
                    const sc = STATUS_LABELS[reg.status] ?? STATUS_LABELS.REGISTERED;
                    return (
                      <div key={reg.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold bg-blue-50 text-blue-600">
                            {u?.firstName?.[0]}{u?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold text-slate-700">{u?.firstName} {u?.lastName}</p>
                            <p className="text-[10px] text-slate-400">{u?.email}</p>
                            {reg.booth && <p className="text-[10px] text-purple-500">Stand {reg.booth.number}</p>}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-4 pt-0 flex-shrink-0 border-t border-slate-100 space-y-2">
            {/* Not registered at all → show checkout */}
            {!isOwner && !isRegistered && !isPendingPayment && !isRealWaitlist && (
              <button onClick={() => setShowCheckout(true)}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg,${catColor},${catColor}cc)`, boxShadow: `0 4px 12px ${catColor}30` }}>
                {event.isFree ? "S'inscrire gratuitement" : "S'inscrire / Réserver"}
              </button>
            )}
            {/* Real waitlist (capacity full, no payment) → info + quit option */}
            {!isOwner && isRealWaitlist && (
              <div className="flex gap-2 items-center">
                <div className="flex-1 py-2.5 rounded-xl text-center text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  ⏳ Vous êtes en liste d'attente
                </div>
                <button onClick={handleCancel} disabled={actionLoading === 'cancel'}
                  className="py-2.5 px-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50">
                  Quitter
                </button>
              </div>
            )}
            {/* Pending payment → retry checkout or cancel */}
            {!isOwner && isPendingPayment && (
              <div className="flex gap-2">
                <button onClick={() => setShowCheckout(true)}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                  🔄 Reprendre le paiement
                </button>
                <button onClick={handleCancel} disabled={actionLoading === 'cancel'}
                  className="py-2.5 px-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50">
                  Annuler
                </button>
              </div>
            )}
            {/* Confirmed → cancel */}
            {!isOwner && isRegistered && (
              <button onClick={handleCancel} disabled={actionLoading === 'cancel'}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border border-red-200 text-red-500 hover:bg-red-50">
                {actionLoading === 'cancel' ? 'Annulation...' : 'Annuler mon inscription'}
              </button>
            )}
            {isOwner && (
              <div className="flex gap-2">
                <button onClick={() => setShowEdit(true)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                  ✏️ Modifier
                </button>
                <button onClick={handleDelete} disabled={actionLoading === 'delete'}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-all">
                  {actionLoading === 'delete' ? '...' : '🗑 Supprimer'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

// ── EventCard ─────────────────────────────────────────────────────────────
function EventCard({ event, currentUserId, myRegistration, onOpen }: {
  event: Event; currentUserId?: string; myRegistration?: any; onOpen: () => void;
}) {
  const catColor = CATEGORY_COLORS[event.category] || '#3b82f6';
  const isOwner = event.organizer.id === currentUserId;
  const spotsLeft = event.capacity ? event.capacity - event._count.registrations : null;
  const isRegistered = myRegistration?.status === 'REGISTERED' || myRegistration?.status === 'ATTENDED';
  const isPendingPayment = myRegistration?.status === 'WAITLISTED' && !!myRegistration?.paymentId;
  const isRealWaitlist = myRegistration?.status === 'WAITLISTED' && !myRegistration?.paymentId;

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      onClick={onOpen} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
      whileHover={{ y: -2 }}>
      {event.imageUrl && <div className="h-32 overflow-hidden"><img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" /></div>}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: `${catColor}14`, color: catColor }}>
            {CATEGORY_LABELS[event.category]}
          </span>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: event.type === 'VIRTUAL' ? '#8b5cf614' : '#10b98114', color: event.type === 'VIRTUAL' ? '#8b5cf6' : '#10b981' }}>
              {event.type === 'VIRTUAL' ? 'Virtuel' : 'Physique'}
            </span>
            {event.isFree
              ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">Gratuit</span>
              : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">{event.price} {event.currency}</span>
            }
          </div>
        </div>
        <h3 className="font-bold text-slate-800 text-[14px] mb-1 leading-snug line-clamp-2">{event.title}</h3>
        <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">{event.description}</p>
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 text-slate-500 text-xs"><IconCalendar /><span>{formatDate(event.startDate)}</span></div>
          {event.type === 'PHYSICAL' && (event.location || event.address) && (
            <div className="flex items-center gap-2 text-slate-500 text-xs"><IconMapPin /><span className="truncate">{event.address ?? event.location}</span></div>
          )}
          {event.type === 'VIRTUAL' && <div className="flex items-center gap-2 text-slate-500 text-xs"><IconLink /><span>Événement en ligne</span></div>}
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <IconUsers /><span>{event._count.registrations} inscrits{spotsLeft !== null ? ` · ${spotsLeft} places restantes` : ''}</span>
          </div>
          {(event.booths ?? []).filter(b => b.status === 'AVAILABLE').length > 0 && (
            <div className="flex items-center gap-1.5 text-purple-500 text-xs">
              <span>🏪</span><span>{(event.booths ?? []).filter(b => b.status === 'AVAILABLE').length} stands disponibles</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[8px] font-bold">
              {event.organizer.firstName[0]}{event.organizer.lastName[0]}
            </div>
            <span className="text-[11px] text-slate-500">{event.organizer.firstName} {event.organizer.lastName}</span>
          </div>
          {isOwner && <span className="text-[11px] font-semibold" style={{ color: catColor }}>Mon événement →</span>}
          {!isOwner && isRegistered && <span className="text-[11px] font-semibold text-emerald-600">Inscrit ✓</span>}
          {!isOwner && isPendingPayment && <span className="text-[11px] font-semibold text-orange-500">⏳ Paiement en attente</span>}
          {!isOwner && isRealWaitlist && <span className="text-[11px] font-semibold text-amber-600">Liste d'attente</span>}
          {!isOwner && !isRegistered && !isPendingPayment && !isRealWaitlist && (
            <span className="text-[11px] font-semibold" style={{ color: catColor }}>Voir →</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function EventsPage({ user }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegs, setMyRegs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const myRegistrationMap = Object.fromEntries(myRegs.map(r => [r.eventId, r]));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (activeCategory !== 'Tous') params.category = activeCategory;
      if (upcomingOnly) params.upcoming = 'true';
      const [eventsData, regsData] = await Promise.all([api.events.list(params), api.events.myRegistrations()]);
      setEvents(eventsData);
      setMyRegs(regsData);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [activeCategory, upcomingOnly]);

  useEffect(() => { load(); }, [load]);

  const openEvent = (event: Event) => setSelectedEvent(event);

  const myEventsFromRegs = myRegs
    .filter(r => r.status !== 'CANCELLED')
    .map(r => r.event)
    .filter(Boolean);

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence>
        {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onCreated={load} />}
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            currentUserId={user?.id}
            myRegistration={myRegistrationMap[selectedEvent.id]}
            onClose={() => setSelectedEvent(null)}
            onRefresh={() => { setSelectedEvent(null); load(); }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 pt-6 pb-0 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Événements</h2>
            <p className="text-sm text-slate-500 mt-0.5">Salons, networking, formations et hackathons</p>
          </div>
          {user && (
            <motion.button onClick={() => setShowCreate(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-lg shadow-blue-500/25"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
              <IconPlus /> Créer un événement
            </motion.button>
          )}
        </div>

        {/* Tabs */}
        <div className="inline-flex p-1 rounded-2xl mb-4" style={{ background: '#f1f5f9' }}>
          {(['all', 'mine'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={activeTab === t ? { background: '#fff', color: '#1a2332', boxShadow: '0 2px 8px rgba(26,35,50,0.08)' } : { color: '#64748b' }}>
              {t === 'all' ? 'Tous les événements' : `Mes inscriptions (${myRegs.filter(r => r.status !== 'CANCELLED').length})`}
            </button>
          ))}
        </div>

        {/* Category filters */}
        {activeTab === 'all' && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 flex-nowrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={activeCategory === cat ? { background: CATEGORY_COLORS[cat] || '#3b82f6', color: '#fff' } : { background: '#f1f5f9', color: '#64748b' }}>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
            <button onClick={() => setUpcomingOnly(!upcomingOnly)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={upcomingOnly ? { background: '#10b981', color: '#fff' } : { background: '#f1f5f9', color: '#64748b' }}>
              À venir
            </button>
          </div>
        )}
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
        ) : activeTab === 'mine' ? (
          myEventsFromRegs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-3xl">🎫</div>
              <p className="text-slate-500 font-medium">Aucune inscription en cours</p>
              <p className="text-slate-400 text-sm mt-1">Parcourez "Tous les événements" pour vous inscrire.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myEventsFromRegs.map(ev => (
                <EventCard key={ev.id} event={ev} currentUserId={user?.id} myRegistration={myRegistrationMap[ev.id]} onOpen={() => openEvent(ev)} />
              ))}
            </div>
          )
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-3xl">📅</div>
            <p className="text-slate-500 font-medium">Aucun événement trouvé</p>
            <p className="text-slate-400 text-sm mt-1">{user ? 'Créez le premier événement de votre communauté !' : 'Revenez bientôt.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
              <EventCard key={event.id} event={event} currentUserId={user?.id} myRegistration={myRegistrationMap[event.id]} onOpen={() => openEvent(event)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
