'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import { api } from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  REGISTERED: { label: 'Inscrit', color: '#059669', bg: '#d1fae5', icon: '✅' },
  WAITLISTED: { label: 'Liste d\'attente', color: '#d97706', bg: '#fef3c7', icon: '⏳' },
  CANCELLED:  { label: 'Annulé', color: '#dc2626', bg: '#fee2e2', icon: '❌' },
  ATTENDED:   { label: 'Présent — Bienvenue !', color: '#7c3aed', bg: '#ede9fe', icon: '🎉' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TicketPage() {
  const { ticketCode } = useParams<{ ticketCode: string }>();
  const searchParams = useSearchParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinDone, setCheckinDone] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const paymentSuccess = searchParams?.get('payment') === 'success';

  useEffect(() => {
    // Try to get current user
    api.auth.me().then((u: any) => setCurrentUserId(u?.id ?? null)).catch(() => {});

    api.events.getTicket(ticketCode)
      .then(setTicket)
      .catch(() => setError('Ticket introuvable'))
      .finally(() => setLoading(false));
  }, [ticketCode]);

  const handleCheckIn = async () => {
    setCheckinLoading(true);
    try {
      const updated = await api.events.checkIn(ticketCode);
      setTicket((prev: any) => ({ ...prev, status: updated.status, checkedInAt: updated.checkedInAt }));
      setCheckinDone(true);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du check-in');
    } finally {
      setCheckinLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !ticket) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🎫</div>
        <h1 className="text-xl font-bold text-slate-700">Ticket introuvable</h1>
        <p className="text-slate-400 text-sm mt-2">Ce code billet n'existe pas ou a expiré.</p>
        <a href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Retour</a>
      </div>
    </div>
  );

  const status = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.REGISTERED;
  const event = ticket.event;
  const isOrganizer = currentUserId && event?.organizer?.id === currentUserId;
  const canCheckIn = isOrganizer && ticket.status === 'REGISTERED' && !ticket.checkedInAt;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Nav */}
        <div className="text-center mb-5">
          <a href="/dashboard" className="text-xl font-extrabold" style={{ color: '#0f172a', letterSpacing: '-.02em' }}>
            Go<span style={{ color: '#3b82f6' }}>Connexions</span>
          </a>
        </div>

        {/* Payment success banner */}
        {paymentSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <p className="text-emerald-700 font-semibold text-sm">🎉 Paiement confirmé ! Votre billet est prêt.</p>
          </div>
        )}

        {/* Ticket card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          {/* Header stripe */}
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />

          <div className="p-6">
            {/* Status */}
            <div className="flex items-center justify-center mb-5">
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: status.bg, color: status.color }}>
                {status.icon} {status.label}
              </span>
            </div>

            {/* Event info */}
            <div className="text-center mb-5">
              <h1 className="font-extrabold text-slate-900 text-xl leading-tight mb-1">{event?.title}</h1>
              {event?.startDate && <p className="text-slate-500 text-sm capitalize">{formatDate(event.startDate)}</p>}
              {(event?.address ?? event?.location) && (
                <p className="text-slate-400 text-xs mt-0.5">📍 {event?.address ?? event?.location}</p>
              )}
            </div>

            {/* QR Code */}
            {(ticket.status === 'REGISTERED' || ticket.status === 'ATTENDED') && (
              <div className="flex justify-center mb-5">
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200">
                  <QRCode value={ticketCode} size={180} />
                </div>
              </div>
            )}

            {/* Ticket details */}
            <div className="space-y-2 mb-5 p-4 rounded-xl bg-slate-50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Titulaire</span>
                <span className="font-semibold text-slate-700">{ticket.user?.firstName} {ticket.user?.lastName}</span>
              </div>
              {ticket.ticketType && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Type de billet</span>
                  <span className="font-semibold text-slate-700">{ticket.ticketType.name}</span>
                </div>
              )}
              {ticket.booth && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Stand réservé</span>
                  <span className="font-semibold text-purple-600">Stand {ticket.booth.number} ({ticket.booth.type})</span>
                </div>
              )}
              {ticket.checkedInAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Check-in</span>
                  <span className="font-semibold text-purple-600">{formatDate(ticket.checkedInAt)}</span>
                </div>
              )}
            </div>

            {/* Ticket code */}
            <div className="text-center mb-5 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-widest mb-1">Code billet</p>
              <p className="font-mono text-xs text-slate-700 break-all select-all">{ticketCode}</p>
            </div>

            {/* Organizer check-in button */}
            {canCheckIn && !checkinDone && (
              <button onClick={handleCheckIn} disabled={checkinLoading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98]"
                style={{ background: checkinLoading ? '#94a3b8' : 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
                {checkinLoading ? 'Traitement...' : '✓ Marquer présent (Check-in)'}
              </button>
            )}
            {checkinDone && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
                <p className="text-purple-700 font-semibold text-sm">🎉 Check-in effectué avec succès !</p>
              </div>
            )}

            {/* Back to event */}
            {event?.id && (
              <a href={`/events/${event.id}`} className="block text-center text-xs text-slate-400 hover:text-slate-600 mt-3 transition-colors">
                Voir la page de l'événement →
              </a>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          © {new Date().getFullYear()} GoConnexions — Présentez ce QR code à l'entrée
        </p>
      </div>
    </div>
  );
}
