'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';

const EventMap = dynamic(() => import('@/components/EventMap'), { ssr: false });

const CATEGORY_LABELS: Record<string, string> = {
  NETWORKING: 'Networking', STARTUP: 'Startup', INVESTISSEMENT: 'Investissement',
  FORMATION: 'Formation', INCUBATEUR: 'Incubateur', SALON: 'Salon', CONFERENCE: 'Conférence', HACKATHON: 'Hackathon',
};
const CATEGORY_COLORS: Record<string, string> = {
  NETWORKING: '#3b82f6', STARTUP: '#8b5cf6', INVESTISSEMENT: '#f59e0b', FORMATION: '#10b981',
  INCUBATEUR: '#ec4899', SALON: '#0ea5e9', CONFERENCE: '#6366f1', HACKATHON: '#f97316',
};
const BOOTH_STATUS: Record<string, { bg: string; text: string }> = {
  AVAILABLE: { bg: '#d1fae5', text: '#065f46' },
  RESERVED:  { bg: '#fef3c7', text: '#92400e' },
  OCCUPIED:  { bg: '#fee2e2', text: '#991b1b' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EventPublicPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelBanner, setCancelBanner] = useState<'idle' | 'cancelling' | 'done' | 'error'>('idle');

  useEffect(() => {
    api.events.getOne(id)
      .then(setEvent)
      .catch(() => setError('Événement introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (searchParams?.get('payment') !== 'cancelled') return;
    setCancelBanner('cancelling');
    api.events.cancelRegistration(id)
      .then(() => setCancelBanner('done'))
      .catch(() => setCancelBanner('error'))
      .finally(() => {
        // Remove ?payment=cancelled from URL without reload
        const clean = window.location.pathname;
        router.replace(clean);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !event) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">❌</div>
        <h1 className="text-xl font-bold text-slate-700">Événement introuvable</h1>
        <p className="text-slate-500 mt-2 text-sm">Cet événement n'existe pas ou a été supprimé.</p>
        <a href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
          Retour au tableau de bord
        </a>
      </div>
    </div>
  );

  const catColor = CATEGORY_COLORS[event.category] || '#3b82f6';
  const ticketTypes: any[] = event.ticketTypes ?? [];
  const booths: any[] = event.booths ?? [];
  const minPrice = ticketTypes.length > 0
    ? Math.min(...ticketTypes.map((t: any) => t.price))
    : event.isFree ? 0 : event.price;
  const availableBooths = booths.filter((b: any) => b.status === 'AVAILABLE');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <a href="/dashboard" className="text-lg font-extrabold" style={{ color: '#0f172a', letterSpacing: '-.02em' }}>
          Go<span style={{ color: '#3b82f6' }}>Connexions</span>
        </a>
        <a href={`/dashboard?section=events`} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">← Tous les événements</a>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Payment cancelled banner */}
        {cancelBanner === 'cancelling' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center text-sm text-amber-700">
            Annulation du paiement en cours…
          </div>
        )}
        {cancelBanner === 'done' && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-sm text-slate-600">
            Paiement annulé — votre réservation provisoire a été libérée. Vous pouvez réessayer quand vous voulez.
          </div>
        )}
        {cancelBanner === 'error' && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center text-sm text-red-600">
            Paiement annulé. Si une réservation est encore en attente, elle sera automatiquement libérée.
          </div>
        )}

        {/* Hero */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          {event.imageUrl && (
            <div className="h-56 overflow-hidden">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide" style={{ background: `${catColor}14`, color: catColor }}>
                {CATEGORY_LABELS[event.category] ?? event.category}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: event.type === 'VIRTUAL' ? '#8b5cf614' : '#10b98114', color: event.type === 'VIRTUAL' ? '#8b5cf6' : '#10b981' }}>
                {event.type === 'VIRTUAL' ? 'Virtuel' : 'Physique'}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: event.isFree ? '#d1fae5' : '#fef3c7', color: event.isFree ? '#065f46' : '#92400e' }}>
                {event.isFree || minPrice === 0 ? 'Gratuit' : `À partir de ${minPrice} ${event.currency}`}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight">{event.title}</h1>
            <p className="text-slate-500 leading-relaxed mb-4">{event.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">📅</span>
                <div>
                  <p className="font-semibold text-slate-700 capitalize">{formatDate(event.startDate)}</p>
                  <p className="text-slate-400 text-xs">au {formatDate(event.endDate)}</p>
                </div>
              </div>
              {event.type === 'PHYSICAL' && (event.location || event.address) && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">📍</span>
                  <div>
                    {event.location && <p className="font-semibold text-slate-700">{event.location}</p>}
                    {event.address && <p className="text-slate-400 text-xs">{event.address}</p>}
                  </div>
                </div>
              )}
              {event.type === 'VIRTUAL' && event.virtualLink && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">🔗</span>
                  <a href={event.virtualLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm break-all">{event.virtualLink}</a>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">👥</span>
                <p className="text-slate-600">
                  {event._count?.registrations ?? 0} participants inscrits
                  {event.capacity && ` · ${event.capacity - (event._count?.registrations ?? 0)} places restantes`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[11px] font-bold">
                {event.organizer?.firstName?.[0]}{event.organizer?.lastName?.[0]}
              </div>
              <span className="text-sm text-slate-500">Organisé par <strong className="text-slate-700">{event.organizer?.firstName} {event.organizer?.lastName}</strong></span>
            </div>
          </div>
        </div>

        {/* Leaflet Map */}
        {event.latitude && event.longitude && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 p-4">
            <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">📍 Localisation</h2>
            <EventMap lat={event.latitude} lng={event.longitude} label={event.address ?? event.location ?? event.title} />
          </div>
        )}

        {/* Ticket Types */}
        {ticketTypes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🎫 Types de billets</h2>
            <div className="space-y-2">
              {ticketTypes.map((tt: any) => {
                const sold = tt._count?.registrations ?? 0;
                const left = tt.capacity ? tt.capacity - sold : null;
                return (
                  <div key={tt.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-700">{tt.name}</p>
                      {tt.description && <p className="text-sm text-slate-400">{tt.description}</p>}
                      {left !== null && <p className="text-xs text-slate-400 mt-0.5">{left} places restantes</p>}
                    </div>
                    <span className="text-base font-bold text-slate-800">{tt.price === 0 ? 'Gratuit' : `${tt.price} ${tt.currency}`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stands */}
        {booths.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">🏪 Plan des stands</h2>
            <p className="text-sm text-slate-400 mb-4">{availableBooths.length} stands disponibles sur {booths.length}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {booths.map((b: any) => {
                const sc = BOOTH_STATUS[b.status] ?? BOOTH_STATUS.AVAILABLE;
                return (
                  <div key={b.id} className="rounded-xl p-3" style={{ background: sc.bg }}>
                    <p className="text-xs font-bold" style={{ color: sc.text }}>Stand {b.number}</p>
                    <p className="text-[10px]" style={{ color: sc.text }}>{b.type}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: sc.text }}>{b.price === 0 ? 'Gratuit' : `${b.price} ${b.currency}`}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
          <h2 className="font-bold text-slate-800 mb-2">Prêt à participer ?</h2>
          <p className="text-slate-500 text-sm mb-4">Connectez-vous pour vous inscrire ou réserver votre stand.</p>
          <a href="/dashboard?section=events"
            className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg,${catColor},${catColor}cc)` }}>
            {event.isFree || minPrice === 0 ? "S'inscrire gratuitement" : "S'inscrire / Réserver"}
          </a>
        </div>
      </div>
    </div>
  );
}
