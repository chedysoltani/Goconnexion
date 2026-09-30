'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  StagesLayout, Badge, StatusBadge, EmptyState, SkeletonList, OfferMeta, T,
  APPLICATION_STATUS, inputStyle, primaryBtn, secondaryBtn, cardStyle,
  formatDate, openCv,
} from '@/components/stages/StagesShared';

function ApplicationsPanel({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [applications, setApplications] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [contactingId, setContactingId] = useState<string | null>(null);

  useEffect(() => {
    api.internships.offerApplications(offerId)
      .then(setApplications)
      .catch((err: any) => setError(err.message || 'Impossible de charger les candidatures'));
  }, [offerId]);

  const changeStatus = async (id: string, status: string) => {
    const previous = applications;
    setApplications(apps => apps?.map(a => (a.id === id ? { ...a, status } : a)) ?? null);
    try {
      await api.internships.updateApplicationStatus(id, status);
    } catch (err: any) {
      setApplications(previous);
      alert(err.message || 'Impossible de modifier le statut');
    }
  };

  // Messagerie existante : ouvre (ou crée) la conversation puis l'affiche dans le dashboard
  const contact = async (app: any) => {
    setContactingId(app.id);
    try {
      const conversation = await api.messaging.startConversation(app.applicant.id);
      router.push(`/dashboard?tab=messages&conv=${conversation.id}`);
    } catch (err: any) {
      alert(err.message || 'Impossible d’ouvrir la conversation');
      setContactingId(null);
    }
  };

  if (error) return <p style={{ margin: 0, fontSize: 13, color: '#f87171' }}>{error}</p>;
  if (!applications) return <SkeletonList count={2} height={80} />;
  if (applications.length === 0) {
    return <p style={{ margin: 0, fontSize: 13, color: T.muted }}>Aucune candidature pour le moment.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {applications.map(app => (
        <div key={app.id} style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              {app.applicant?.avatarUrl ? (
                <img src={app.applicant.avatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {`${app.applicant?.firstName?.[0] ?? ''}${app.applicant?.lastName?.[0] ?? ''}`.toUpperCase()}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{app.applicant?.firstName} {app.applicant?.lastName}</p>
                <p style={{ margin: 0, fontSize: 11, color: T.subtle }}>Reçue le {formatDate(app.createdAt)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => openCv(app.id)} style={secondaryBtn}>📄 Voir le CV</button>
              <button onClick={() => contact(app)} disabled={contactingId === app.id}
                style={{ ...secondaryBtn, opacity: contactingId === app.id ? 0.5 : 1 }}>
                💬 {contactingId === app.id ? 'Ouverture…' : 'Contacter'}
              </button>
              <select
                value={app.status}
                onChange={e => changeStatus(app.id, e.target.value)}
                aria-label="Statut de la candidature"
                style={{ ...inputStyle, width: 'auto', padding: '7px 10px', fontSize: 13, color: APPLICATION_STATUS[app.status]?.color }}
              >
                {Object.entries(APPLICATION_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          {app.message && (
            <p style={{ margin: '12px 0 0', fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{app.message}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function MyOffersPage() {
  const [offers, setOffers] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    api.internships.mine()
      .then(setOffers)
      .catch((err: any) => setError(err.message || 'Impossible de charger vos offres'));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (offer: any) => {
    const status = offer.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    setBusyId(offer.id);
    try {
      await api.internships.update(offer.id, { status });
      setOffers(list => list?.map(o => (o.id === offer.id ? { ...o, status } : o)) ?? null);
    } catch (err: any) {
      alert(err.message || 'Erreur');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (offer: any) => {
    const n = offer._count?.applications ?? 0;
    const warning = n > 0 ? `\n\nLes ${n} candidature(s) et CV associés seront aussi supprimés.` : '';
    if (!confirm(`Supprimer définitivement l'offre « ${offer.title} » ?${warning}`)) return;
    setBusyId(offer.id);
    try {
      await api.internships.remove(offer.id);
      setOffers(list => list?.filter(o => o.id !== offer.id) ?? null);
    } catch (err: any) {
      alert(err.message || 'Erreur');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <StagesLayout active="offers">
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 16px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 900, margin: '0 0 4px' }}>Mes offres de stage</h1>
            <p style={{ margin: 0, color: T.muted, fontSize: 14 }}>Gérez vos offres et les candidatures reçues.</p>
          </div>
          <Link href="/stages/nouvelle" style={primaryBtn}>+ Nouvelle offre</Link>
        </div>

        {error ? (
          <EmptyState emoji="⚠️" title="Erreur" text={error} />
        ) : !offers ? (
          <SkeletonList />
        ) : offers.length === 0 ? (
          <EmptyState emoji="📋" title="Aucune offre publiée" text="Publiez votre première offre pour recevoir des candidatures d'étudiants."
            action={<Link href="/stages/nouvelle" style={primaryBtn}>Publier une offre</Link>} />
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {offers.map(offer => {
              const count = offer._count?.applications ?? 0;
              const isOpen = openId === offer.id;
              const busy = busyId === offer.id;
              return (
                <div key={offer.id} style={{ ...cardStyle, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0, flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                        <Badge color={offer.status === 'PUBLISHED' ? '#10b981' : '#6b7280'}>
                          {offer.status === 'PUBLISHED' ? 'Publiée' : 'Fermée'}
                        </Badge>
                        <Badge color="#8b5cf6">{offer.domain}</Badge>
                        <span style={{ fontSize: 11, color: T.subtle }}>Publiée le {formatDate(offer.createdAt)}</span>
                      </div>
                      <Link href={`/stages/${offer.id}`} style={{ fontSize: 17, fontWeight: 700, color: T.text, textDecoration: 'none' }}>
                        {offer.title}
                      </Link>
                      <p style={{ margin: '2px 0 8px', fontSize: 13, color: T.accentLight, fontWeight: 600 }}>{offer.companyName}</p>
                      <OfferMeta offer={offer} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <Link href={`/stages/nouvelle?edit=${offer.id}`} style={secondaryBtn}>Modifier</Link>
                      <button onClick={() => toggleStatus(offer)} disabled={busy} style={{ ...secondaryBtn, opacity: busy ? 0.5 : 1 }}>
                        {offer.status === 'PUBLISHED' ? 'Fermer' : 'Rouvrir'}
                      </button>
                      <button onClick={() => remove(offer)} disabled={busy}
                        style={{ ...secondaryBtn, color: '#f87171', borderColor: 'rgba(239,68,68,0.3)', opacity: busy ? 0.5 : 1 }}>
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setOpenId(isOpen ? null : offer.id)}
                    style={{
                      marginTop: 16, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                      background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
                      color: T.accentLight, fontSize: 13, fontWeight: 700,
                    }}
                    aria-expanded={isOpen}
                  >
                    <span>{count} candidature{count !== 1 ? 's' : ''}</span>
                    <span>{isOpen ? 'Masquer ▲' : 'Voir ▼'}</span>
                  </button>
                  {isOpen && <div style={{ marginTop: 12 }}><ApplicationsPanel offerId={offer.id} /></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StagesLayout>
  );
}
