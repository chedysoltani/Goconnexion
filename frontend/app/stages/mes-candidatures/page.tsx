'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  StagesLayout, Badge, StatusBadge, EmptyState, SkeletonList, OfferMeta, T,
  primaryBtn, secondaryBtn, cardStyle, formatDate, openCv,
} from '@/components/stages/StagesShared';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    api.internships.myApplications()
      .then(setApplications)
      .catch((err: any) => setError(err.message || 'Impossible de charger vos candidatures'));
  }, []);

  const withdraw = async (app: any) => {
    if (!confirm(`Retirer votre candidature à « ${app.offer?.title} » ?\n\nVotre CV sera définitivement supprimé.`)) return;
    setBusyId(app.id);
    try {
      await api.internships.withdraw(app.id);
      setApplications(list => list?.filter(a => a.id !== app.id) ?? null);
    } catch (err: any) {
      alert(err.message || 'Impossible de retirer la candidature');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <StagesLayout active="applications">
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 16px 60px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 900, margin: '0 0 4px' }}>Mes candidatures</h1>
        <p style={{ margin: '0 0 24px', color: T.muted, fontSize: 14 }}>Suivez l&apos;état de vos candidatures de stage.</p>

        {error ? (
          <EmptyState emoji="⚠️" title="Erreur" text={error} />
        ) : !applications ? (
          <SkeletonList />
        ) : applications.length === 0 ? (
          <EmptyState emoji="🎓" title="Aucune candidature" text="Parcourez les offres et postulez avec votre CV."
            action={<Link href="/stages" style={primaryBtn}>Voir les offres</Link>} />
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {applications.map(app => (
              <div key={app.id} style={{ ...cardStyle, padding: 20, display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0, flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                    <StatusBadge status={app.status} />
                    {app.offer?.status === 'CLOSED' && <Badge color="#6b7280">Offre fermée</Badge>}
                    <span style={{ fontSize: 11, color: T.subtle }}>Envoyée le {formatDate(app.createdAt)}</span>
                  </div>
                  <Link href={`/stages/${app.offer?.id}`} style={{ fontSize: 17, fontWeight: 700, color: T.text, textDecoration: 'none' }}>
                    {app.offer?.title}
                  </Link>
                  <p style={{ margin: '2px 0 8px', fontSize: 13, color: T.accentLight, fontWeight: 600 }}>{app.offer?.companyName}</p>
                  {app.offer && <OfferMeta offer={app.offer} />}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <button onClick={() => openCv(app.id)} style={secondaryBtn}>📄 Mon CV</button>
                  <Link href={`/stages/${app.offer?.id}`} style={secondaryBtn}>Voir l&apos;offre</Link>
                  <button onClick={() => withdraw(app)} disabled={busyId === app.id}
                    style={{ ...secondaryBtn, color: '#f87171', borderColor: 'rgba(239,68,68,0.3)', opacity: busyId === app.id ? 0.5 : 1 }}>
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StagesLayout>
  );
}
