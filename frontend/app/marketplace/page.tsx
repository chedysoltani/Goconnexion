'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const CATEGORIES = [
  { id: '',              label: 'Tous',              emoji: '✨' },
  { id: 'TECH',         label: 'Tech & Dev',         emoji: '💻', color: '#3b82f6' },
  { id: 'DESIGN',       label: 'Design',             emoji: '🎨', color: '#8b5cf6' },
  { id: 'MARKETING',    label: 'Marketing',          emoji: '📣', color: '#f59e0b' },
  { id: 'COMPTABILITE', label: 'Comptabilité',       emoji: '📊', color: '#10b981' },
  { id: 'COACHING',     label: 'Coaching',           emoji: '🎯', color: '#06b6d4' },
  { id: 'JURIDIQUE',    label: 'Juridique',          emoji: '⚖️', color: '#ef4444' },
  { id: 'FORMATION',    label: 'Formation',          emoji: '📚', color: '#f97316' },
  { id: 'TRADUCTION',   label: 'Traduction',         emoji: '🌍', color: '#84cc16' },
  { id: 'SANTE',        label: 'Santé',              emoji: '💚', color: '#ec4899' },
  { id: 'AUTRE',        label: 'Autre',              emoji: '🔧', color: '#6b7280' },
];

function getCatMeta(id: string) {
  return CATEGORIES.find(c => c.id === id) ?? { label: id, emoji: '🔧', color: '#6b7280' };
}

function ServiceCard({ svc, onClick }: { svc: any; onClick: () => void }) {
  const cat = getCatMeta(svc.category);
  const initials = `${svc.seller?.firstName?.[0] ?? ''}${svc.seller?.lastName?.[0] ?? ''}`.toUpperCase();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(15,23,42,0.7)',
        border: `1px solid ${hovered ? `${cat.color ?? '#2563eb'}40` : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${cat.color ?? '#2563eb'}20` : '0 2px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image zone */}
      <div style={{
        height: 170, position: 'relative',
        background: `linear-gradient(135deg, ${cat.color ?? '#2563eb'}18 0%, ${cat.color ?? '#2563eb'}08 100%)`,
        overflow: 'hidden',
      }}>
        {svc.images?.[0] ? (
          <img src={svc.images[0]} alt={svc.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.06)' : 'scale(1)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 52, opacity: 0.25 }}>{cat.emoji}</span>
          </div>
        )}
        {/* Top gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(9,9,11,0.6))' }} />
        {/* Category badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(9,9,11,0.75)', backdropFilter: 'blur(8px)',
          padding: '4px 10px', borderRadius: 20,
          border: `1px solid ${cat.color ?? '#2563eb'}40`,
        }}>
          <span style={{ fontSize: 12 }}>{cat.emoji}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: cat.color ?? '#94a3b8' }}>{cat.label}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{
          margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {svc.title}
        </h3>
        <p style={{
          margin: '0 0 14px', fontSize: 12, color: '#64748b', lineHeight: 1.5, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {svc.description}
        </p>

        {/* Seller row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${cat.color ?? '#2563eb'}, ${cat.color ?? '#2563eb'}99)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff',
          }}>{initials}</div>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, flex: 1 }}>
            {svc.seller?.firstName} {svc.seller?.lastName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" fill="none" stroke="#475569" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            <span style={{ fontSize: 11, color: '#475569' }}>{svc.delivery}</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 7, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>À partir de</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
              {svc.price.toLocaleString('fr-CA', { style: 'currency', currency: svc.currency ?? 'CAD', maximumFractionDigits: 0 })}
            </span>
          </div>
          <div style={{
            padding: '8px 14px', borderRadius: 9,
            background: hovered ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(37,99,235,0.12)',
            color: hovered ? '#fff' : '#3b82f6',
            fontSize: 12, fontWeight: 700, border: '1px solid rgba(37,99,235,0.3)',
            transition: 'all 0.2s',
          }}>
            Commander →
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.marketplace.listServices({ category: category || undefined, search: search || undefined, page });
      setServices(data.services);
      setTotal(data.total);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [category, search, page]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); setPage(1); };
  const handleCat = (cat: string) => { setCategory(cat); setPage(1); };
  const totalPages = Math.ceil(total / 20);

  return (
    <div style={{ minHeight: '100vh', background: '#09090B', color: '#f1f5f9' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 60,
        background: 'rgba(9,9,11,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: '#fff', textDecoration: 'none' }}>
          <span style={{ color: '#2563eb' }}>Go</span>Connexions
        </Link>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/marketplace/sell" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
            background: 'rgba(37,99,235,0.12)', color: '#3b82f6', border: '1px solid rgba(37,99,235,0.25)', textDecoration: 'none',
          }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Vendre
          </Link>
          <Link href="/dashboard" style={{
            padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', textDecoration: 'none',
          }}>
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(37,99,235,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '60px 24px 40px',
        textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px',
            background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 20, marginBottom: 20,
          }}>
            <span style={{ fontSize: 12 }}>🛒</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>Marketplace GoConnexions</span>
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 900, margin: '0 0 14px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Des services professionnels,<br />
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              par et pour la communauté
            </span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 16, margin: '0 0 32px', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Trouvez l'expert qu'il vous faut ou proposez vos compétences à {total > 0 ? `${total}+ services disponibles` : 'la communauté'}
          </p>
          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, maxWidth: 520, margin: '0 auto' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Rechercher un service, une compétence..."
                style={{
                  width: '100%', padding: '12px 16px 12px 42px', borderRadius: 12, boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f1f5f9', fontSize: 14, outline: 'none',
                }}
              />
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <button type="submit" style={{
              padding: '12px 22px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14,
              boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
            }}>
              Rechercher
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 60px' }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {CATEGORIES.map(c => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleCat(c.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                  background: active
                    ? (c.id ? c.color + '20' : 'rgba(37,99,235,0.2)')
                    : 'rgba(255,255,255,0.05)',
                  color: active ? (c.color ?? '#3b82f6') : '#64748b',
                  boxShadow: active ? `0 0 0 1px ${c.color ?? '#2563eb'}50` : 'none',
                }}
              >
                <span style={{ fontSize: 14 }}>{c.emoji}</span>
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Stats + actions row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
            <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{total}</span> service{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}
            {category && ` • ${getCatMeta(category).label}`}
            {search && ` • "${search}"`}
          </p>
          {(category || search) && (
            <button
              onClick={() => { setCategory(''); setSearch(''); setSearchInput(''); setPage(1); }}
              style={{ fontSize: 12, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Effacer les filtres
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ height: 340, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.4 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#f1f5f9' }}>Aucun service trouvé</h3>
            <p style={{ color: '#475569', margin: '0 0 24px', fontSize: 14 }}>Essayez avec d'autres termes ou une autre catégorie</p>
            <Link href="/marketplace/sell" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14,
              boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
            }}>
              🚀 Soyez le premier à publier
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
            {services.map(svc => (
              <ServiceCard key={svc.id} svc={svc} onClick={() => router.push(`/marketplace/${svc.id}`)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 48 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 38, height: 38, borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: p === page ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(255,255,255,0.06)',
                  color: p === page ? '#fff' : '#64748b', fontSize: 13, fontWeight: 700,
                  boxShadow: p === page ? '0 4px 12px rgba(37,99,235,0.35)' : 'none',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.8} }
      `}</style>
    </div>
  );
}
