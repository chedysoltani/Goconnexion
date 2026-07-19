'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const CATEGORIES = [
  { id: '',              label: 'Tous' },
  { id: 'TECH',         label: 'Tech & Dev' },
  { id: 'DESIGN',       label: 'Design' },
  { id: 'MARKETING',    label: 'Marketing' },
  { id: 'COMPTABILITE', label: 'Comptabilité' },
  { id: 'COACHING',     label: 'Coaching' },
  { id: 'JURIDIQUE',    label: 'Juridique' },
  { id: 'FORMATION',    label: 'Formation' },
  { id: 'TRADUCTION',   label: 'Traduction' },
  { id: 'SANTE',        label: 'Santé' },
  { id: 'AUTRE',        label: 'Autre' },
];

const CATEGORY_COLORS: Record<string, string> = {
  TECH: '#3b82f6', DESIGN: '#8b5cf6', MARKETING: '#f59e0b',
  COMPTABILITE: '#10b981', COACHING: '#06b6d4', JURIDIQUE: '#ef4444',
  FORMATION: '#f97316', TRADUCTION: '#84cc16', SANTE: '#ec4899', AUTRE: '#6b7280',
};

function ServiceCard({ svc, onClick }: { svc: any; onClick: () => void }) {
  const catColor = CATEGORY_COLORS[svc.category] ?? '#6b7280';
  const initials = `${svc.seller?.firstName?.[0] ?? ''}${svc.seller?.lastName?.[0] ?? ''}`.toUpperCase();
  const catLabel = CATEGORIES.find(c => c.id === svc.category)?.label ?? svc.category;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(15,23,42,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(37,99,235,0.2)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = '';
      }}
    >
      {/* Image */}
      <div style={{
        height: 160, background: `linear-gradient(135deg, ${catColor}22, ${catColor}44)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        {svc.images?.[0] ? (
          <img src={svc.images[0]} alt={svc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 48, opacity: 0.4 }}>🛠️</span>
        )}
        {/* Category badge */}
        <span style={{
          position: 'absolute', top: 10, left: 10,
          background: catColor, color: '#fff',
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
        }}>
          {catLabel}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px' }}>
        <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {svc.title}
        </p>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#94a3b8', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {svc.description}
        </p>

        {/* Seller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: `linear-gradient(135deg, ${catColor}, ${catColor}bb)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{initials}</div>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            {svc.seller?.firstName} {svc.seller?.lastName}
          </span>
          <span style={{ fontSize: 10, color: '#475569', marginLeft: 'auto' }}>⏱ {svc.delivery}</span>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#2563eb' }}>
            {svc.price.toLocaleString('fr-CA', { style: 'currency', currency: svc.currency ?? 'CAD' })}
          </span>
          <span style={{
            fontSize: 11, color: '#3b82f6', fontWeight: 600,
            padding: '4px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.12)',
          }}>
            Commander →
          </span>
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div style={{ minHeight: '100vh', background: '#09090B', color: '#f1f5f9' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(9,9,11,0.88)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60,
      }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: '#fff', textDecoration: 'none' }}>
          <span style={{ color: '#2563eb' }}>Go</span>Connexions
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/marketplace/sell" style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'rgba(37,99,235,0.15)', color: '#3b82f6', border: '1px solid rgba(37,99,235,0.3)',
            textDecoration: 'none',
          }}>
            + Publier un service
          </Link>
          <Link href="/dashboard" style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: '#2563eb', color: '#fff', textDecoration: 'none',
          }}>
            Dashboard
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.2 }}>
            Marketplace de <span style={{ color: '#2563eb' }}>services</span>
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 16 }}>
            Trouvez des experts ou vendez vos compétences à la communauté GoConnexions
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24, maxWidth: 600, margin: '0 auto 24px' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Rechercher un service..."
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9', fontSize: 14, outline: 'none',
            }}
          />
          <button type="submit" style={{
            padding: '10px 20px', borderRadius: 10, background: '#2563eb',
            color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
          }}>
            Rechercher
          </button>
        </form>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32, justifyContent: 'center' }}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => handleCategoryChange(c.id)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: category === c.id ? '#2563eb' : 'rgba(255,255,255,0.06)',
                color: category === c.id ? '#fff' : '#94a3b8',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>
          {total} service{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}
        </p>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>Chargement...</div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ color: '#475569', fontSize: 16 }}>Aucun service trouvé</p>
            <Link href="/marketplace/sell" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Soyez le premier à publier un service →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {services.map(svc => (
              <ServiceCard key={svc.id} svc={svc} onClick={() => router.push(`/marketplace/${svc.id}`)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: p === page ? '#2563eb' : 'rgba(255,255,255,0.06)',
                  color: p === page ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 600,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
