'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  StagesLayout, Badge, StatusBadge, EmptyState, SkeletonList, T,
  inputStyle, labelStyle, primaryBtn, secondaryBtn, cardStyle,
  formatDate, modeLabel, useStoredUser, CV_MAX_SIZE,
} from '@/components/stages/StagesShared';

function ApplyForm({ offerId, onApplied }: { offerId: string; onApplied: (application: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const f = e.target.files?.[0] ?? null;
    setFile(null);
    if (!f) return;
    const isPdfName = f.name.toLowerCase().endsWith('.pdf');
    if (f.type !== 'application/pdf' && !isPdfName) {
      setError('Le CV doit être au format PDF.');
      e.target.value = '';
      return;
    }
    if (f.size > CV_MAX_SIZE) {
      setError('Le CV ne doit pas dépasser 5 Mo.');
      e.target.value = '';
      return;
    }
    // Vérification rapide de la signature (le serveur la revérifie)
    const head = await f.slice(0, 4).text();
    if (head !== '%PDF') {
      setError("Ce fichier n'est pas un PDF valide.");
      e.target.value = '';
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Veuillez joindre votre CV (PDF, 5 Mo max).'); return; }
    // Vérifié avant le téléversement pour ne jamais envoyer un CV sans consentement
    if (!consent) { setError('Veuillez accepter le partage de votre CV pour postuler.'); return; }
    setSubmitting(true);
    setError('');
    try {
      // Nom normalisé en .pdf : le serveur n'accepte que les chemins /uploads/*.pdf
      const upload = await api.uploads.upload(new File([file], 'cv.pdf', { type: 'application/pdf' }));
      const application = await api.internships.apply(offerId, {
        cvUrl: upload.file.path,
        message: message.trim() || undefined,
        consent,
      });
      onApplied(application);
    } catch (err: any) {
      const msg: string = err.message || 'Erreur lors de la candidature';
      if (/déjà postulé/i.test(msg)) setAlreadyApplied(true);
      else setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyApplied) {
    return (
      <div style={{ padding: 16, borderRadius: 12, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', fontSize: 14 }}>
        Vous avez déjà postulé à cette offre.{' '}
        <Link href="/stages/mes-candidatures" style={{ color: '#fcd34d', fontWeight: 700 }}>Voir mes candidatures</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
      <div>
        <label htmlFor="cv" style={labelStyle}>CV (PDF uniquement, 5 Mo max) *</label>
        <input id="cv" type="file" accept="application/pdf,.pdf" onChange={handleFile}
          style={{ ...inputStyle, padding: 10, cursor: 'pointer' }} />
        {file && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#10b981' }}>✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} Mo)</p>}
      </div>
      <div>
        <label htmlFor="message" style={labelStyle}>Message de motivation (optionnel)</label>
        <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} maxLength={3000} rows={5}
          placeholder="Présentez-vous en quelques lignes : formation, établissement, disponibilités…"
          style={{ ...inputStyle, resize: 'vertical' }} />
        <p style={{ margin: '4px 0 0', fontSize: 11, color: T.subtle, textAlign: 'right' }}>{message.length} / 3000</p>
      </div>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, cursor: 'pointer' }}>
        <input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); setError(''); }}
          required style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
        <span>
          J&apos;accepte que mon CV soit partagé uniquement avec l&apos;auteur de cette offre et conservé
          le temps du recrutement. Je peux retirer ma candidature (et supprimer mon CV) à tout moment
          depuis « Mes candidatures ». *
        </span>
      </label>
      {error && <p role="alert" style={{ margin: 0, fontSize: 13, color: '#f87171' }}>{error}</p>}
      <button type="submit" disabled={submitting || !consent} style={{ ...primaryBtn, opacity: submitting || !consent ? 0.6 : 1, cursor: submitting || !consent ? 'not-allowed' : 'pointer' }}>
        {submitting ? 'Envoi en cours…' : 'Envoyer ma candidature'}
      </button>
    </form>
  );
}

export default function StageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useStoredUser();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [myApplication, setMyApplication] = useState<any>(null);

  useEffect(() => {
    api.internships.get(id)
      .then(setOffer)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Si connecté : afficher directement une candidature existante (évite un téléversement inutile)
  useEffect(() => {
    if (!ready || !user) return;
    api.internships.myApplications()
      .then((apps: any[]) => setMyApplication(apps.find(a => a.offerId === id) ?? null))
      .catch(() => {});
  }, [ready, user, id]);

  const handleApplyClick = () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/stages/${id}`)}`);
      return;
    }
    setShowForm(true);
  };

  if (loading) {
    return <StagesLayout><div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}><SkeletonList count={2} height={200} /></div></StagesLayout>;
  }

  if (notFound || !offer) {
    return (
      <StagesLayout>
        <EmptyState emoji="🔎" title="Offre introuvable" text="Cette offre n'existe plus ou a été supprimée."
          action={<Link href="/stages" style={primaryBtn}>Voir toutes les offres</Link>} />
      </StagesLayout>
    );
  }

  const isAuthor = user?.id === offer.authorId;
  const isClosed = offer.status === 'CLOSED';

  return (
    <StagesLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 60px' }}>
        <Link href="/stages" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T.muted, fontSize: 13, textDecoration: 'none', marginBottom: 20 }}>
          ← Toutes les offres
        </Link>

        <div style={{ ...cardStyle, padding: 'clamp(20px, 4vw, 32px)', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <Badge color="#8b5cf6">{offer.domain}</Badge>
            <Badge color="#06b6d4">{modeLabel(offer.mode)}</Badge>
            <Badge color={offer.isPaid ? '#10b981' : '#6b7280'}>{offer.isPaid ? 'Rémunéré' : 'Non rémunéré'}</Badge>
            {isClosed && <Badge color="#ef4444">Offre fermée</Badge>}
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 900, margin: '0 0 6px', lineHeight: 1.2 }}>{offer.title}</h1>
          <p style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: T.accentLight }}>{offer.companyName}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              ['Lieu', offer.location || 'Non précisé'],
              ['Durée', offer.durationMonths ? `${offer.durationMonths} mois` : 'Non précisée'],
              ['Début', offer.startDate ? formatDate(offer.startDate) : 'Flexible'],
              ['Publiée le', formatDate(offer.createdAt)],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{k}</p>
                <p style={{ margin: 0, fontSize: 14, color: T.text, fontWeight: 600 }}>{v}</p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px' }}>Description</h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{offer.description}</p>

          {offer.skills?.length > 0 && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px' }}>Compétences recherchées</h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
                {offer.skills.map((s: string) => <Badge key={s} color="#3b82f6">{s}</Badge>)}
              </div>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {offer.author?.avatarUrl ? (
              <img src={offer.author.avatarUrl} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                {`${offer.author?.firstName?.[0] ?? ''}${offer.author?.lastName?.[0] ?? ''}`.toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: 13, color: T.muted }}>
              Publiée par <strong style={{ color: T.text }}>{offer.author?.firstName} {offer.author?.lastName}</strong>
            </span>
          </div>
        </div>

        {/* Candidature */}
        <div style={{ ...cardStyle, padding: 'clamp(20px, 4vw, 28px)' }}>
          {isAuthor ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: 14, color: T.muted }}>Vous êtes l&apos;auteur de cette offre.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={`/stages/nouvelle?edit=${offer.id}`} style={secondaryBtn}>Modifier</Link>
                <Link href="/stages/mes-offres" style={primaryBtn}>Voir les candidatures</Link>
              </div>
            </div>
          ) : myApplication ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: 14, color: T.muted }}>
                Vous avez postulé le {formatDate(myApplication.createdAt)}.
              </p>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <StatusBadge status={myApplication.status} />
                <Link href="/stages/mes-candidatures" style={secondaryBtn}>Mes candidatures</Link>
              </div>
            </div>
          ) : isClosed ? (
            <p style={{ margin: 0, fontSize: 14, color: T.muted }}>Cette offre est fermée et n&apos;accepte plus de candidatures.</p>
          ) : showForm ? (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Postuler à cette offre</h2>
              <ApplyForm offerId={offer.id} onApplied={setMyApplication} />
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 700 }}>Cette offre vous intéresse ?</p>
                <p style={{ margin: 0, fontSize: 13, color: T.muted }}>
                  {user ? 'Envoyez votre CV et un message à l’entreprise.' : 'Connectez-vous pour postuler avec votre CV.'}
                </p>
              </div>
              <button onClick={handleApplyClick} style={primaryBtn}>Postuler</button>
            </div>
          )}
        </div>
      </div>
    </StagesLayout>
  );
}
