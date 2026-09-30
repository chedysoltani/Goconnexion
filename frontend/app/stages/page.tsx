'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  StagesLayout, Badge, OfferMeta, EmptyState, DOMAINS, MODES, T,
  inputStyle, primaryBtn, secondaryBtn, cardStyle, formatDate,
} from '@/components/stages/StagesShared';

const PAGE_SIZE = 12;

function OfferCard({ offer }: { offer: any }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/stages/${offer.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...cardStyle,
        display: 'flex', flexDirection: 'column', gap: 12, padding: 20,
        textDecoration: 'none', color: 'inherit',
        borderColor: hovered ? 'rgba(37,99,235,0.35)' : T.border,
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 16px 36px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <Badge color="#8b5cf6">{offer.domain}</Badge>
        <span style={{ fontSize: 11, color: T.subtle, whiteSpace: 'nowrap' }}>{formatDate(offer.createdAt)}</span>
      </div>
      <div>
        <h3 style={{
          margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: T.text, lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {offer.title}
        </h3>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.accentLight }}>{offer.companyName}</p>
      </div>
      <p style={{
        margin: 0, fontSize: 13, color: T.muted, lineHeight: 1.5, flex: 1,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {offer.description}
      </p>
      <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <OfferMeta offer={offer} />
      </div>
    </Link>
  );
}

export default function StagesPage() {
  const [data, setData] = useState<{ items: any[]; total: number; totalPages: number }>({ items: [], total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [mode, setMode] = useState('');
  const [page, setPage] = useState(1);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.internships.list({ search, domain, mode, page, limit: PAGE_SIZE });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les offres');
    } finally {
      setLoading(false);
    }
  }, [search, domain, mode, page]);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput.trim()); setPage(1); };
  const resetFilters = () => { setSearch(''); setSearchInput(''); setDomain(''); setMode(''); setPage(1); };
  const hasFilters = !!(search || domain || mode);

  return (
    <StagesLayout active="list">
      {/* Hero */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(37,99,235,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '56px 16px 40px', textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, maxWidth: '100%', height: 300, background: 'radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px',
            background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 20, marginBottom: 20,
          }}>
            <span style={{ fontSize: 12 }}>🎓</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.accentLight }}>Stages & PFE</span>
          </div>
          <h1 className="stages-hero-title" style={{ fontSize: 42, fontWeight: 900, margin: '0 0 14px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Trouvez votre stage{' '}
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              auprès de la communauté
            </span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, margin: '0 auto 28px', maxWidth: 560 }}>
            Des offres de stage et de projets de fin d&apos;études publiées par les entrepreneurs et entreprises de GoConnexions.
            Postulez en quelques clics avec votre CV.
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, maxWidth: 560, margin: '0 auto', flexWrap: 'wrap' }}>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Titre, entreprise, mot-clé…"
              aria-label="Rechercher une offre"
              style={{ ...inputStyle, flex: '1 1 240px', padding: '12px 16px', borderRadius: 12 }}
            />
            <button type="submit" style={{ ...primaryBtn, flex: '0 0 auto' }}>Rechercher</button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 16px 60px' }}>
        {/* Filtres */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {['', ...DOMAINS].map(d => {
            const active = domain === d;
            return (
              <button
                key={d || 'all'}
                onClick={() => { setDomain(d); setPage(1); }}
                style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                  background: active ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.05)',
                  color: active ? T.accentLight : T.muted,
                  boxShadow: active ? '0 0 0 1px rgba(37,99,235,0.5)' : 'none',
                }}
              >
                {d || 'Tous les domaines'}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <select
              value={mode}
              onChange={e => { setMode(e.target.value); setPage(1); }}
              aria-label="Mode de travail"
              style={{ ...inputStyle, width: 'auto', padding: '8px 12px', fontSize: 13 }}
            >
              <option value="">Tous les modes</option>
              {MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            <span style={{ fontSize: 13, color: T.subtle }}>
              <strong style={{ color: T.text }}>{data.total}</strong> offre{data.total !== 1 ? 's' : ''}
              {search && ` • « ${search} »`}
            </span>
            {hasFilters && (
              <button onClick={resetFilters} style={{ fontSize: 12, color: T.subtle, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Effacer les filtres
              </button>
            )}
          </div>
          <Link href="/stages/nouvelle" style={secondaryBtn}>+ Publier une offre</Link>
        </div>

        {/* Grille */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 18 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ height: 250, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', animation: 'stagesPulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : error ? (
          <EmptyState emoji="⚠️" title="Erreur de chargement" text={error}
            action={<button onClick={fetchOffers} style={primaryBtn}>Réessayer</button>} />
        ) : data.items.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="Aucune offre trouvée"
            text={hasFilters ? "Essayez d'autres mots-clés ou filtres." : 'Aucune offre de stage publiée pour le moment.'}
            action={<Link href="/stages/nouvelle" style={primaryBtn}>Publier la première offre</Link>}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 18 }}>
            {data.items.map(o => <OfferCard key={o.id} offer={o} />)}
          </div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && !loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 40 }}>
            <button
              onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page <= 1}
              style={{ ...secondaryBtn, opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'default' : 'pointer' }}
            >
              ← Précédent
            </button>
            <span style={{ fontSize: 13, color: T.muted }}>Page {page} / {data.totalPages}</span>
            <button
              onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page >= data.totalPages}
              style={{ ...secondaryBtn, opacity: page >= data.totalPages ? 0.4 : 1, cursor: page >= data.totalPages ? 'default' : 'pointer' }}
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </StagesLayout>
  );
}
