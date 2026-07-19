'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  TECH:         { label: 'Tech & Dev',   emoji: '💻', color: '#3b82f6' },
  DESIGN:       { label: 'Design',       emoji: '🎨', color: '#8b5cf6' },
  MARKETING:    { label: 'Marketing',    emoji: '📣', color: '#f59e0b' },
  COMPTABILITE: { label: 'Comptabilité', emoji: '📊', color: '#10b981' },
  COACHING:     { label: 'Coaching',     emoji: '🎯', color: '#06b6d4' },
  JURIDIQUE:    { label: 'Juridique',    emoji: '⚖️', color: '#ef4444' },
  FORMATION:    { label: 'Formation',    emoji: '📚', color: '#f97316' },
  TRADUCTION:   { label: 'Traduction',   emoji: '🌍', color: '#84cc16' },
  SANTE:        { label: 'Santé',        emoji: '💚', color: '#ec4899' },
  AUTRE:        { label: 'Autre',        emoji: '🔧', color: '#6b7280' },
};

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [imageIdx, setImageIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    api.marketplace.getService(id).then(setService).catch(() => setError('Service introuvable')).finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async () => {
    setOrdering(true);
    setError('');
    try {
      const result = await api.marketplace.createOrder(id);
      if (result.checkoutUrl) window.location.href = result.checkoutUrl;
      else router.push(`/marketplace/order-success?orderId=${result.order.id}`);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la commande');
      setOrdering(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(37,99,235,0.2)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!service) return (
    <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 64 }}>😕</div>
      <p style={{ color: '#94a3b8', fontSize: 16 }}>Service introuvable</p>
      <Link href="/marketplace" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Retour à la marketplace</Link>
    </div>
  );

  const cat = CATEGORY_META[service.category] ?? { label: service.category, emoji: '🔧', color: '#6b7280' };
  const sellerInitials = `${service.seller?.firstName?.[0] ?? ''}${service.seller?.lastName?.[0] ?? ''}`.toUpperCase();
  const salesCount = service._count?.orders ?? 0;

  return (
    <div style={{ minHeight: '100vh', background: '#09090B', color: '#f1f5f9' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 60,
        background: 'rgba(9,9,11,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#64748b', fontSize: 13, fontWeight: 500 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Marketplace
        </Link>
        <Link href="/" style={{ fontSize: 16, fontWeight: 800, color: '#fff', textDecoration: 'none' }}>
          <span style={{ color: '#2563eb' }}>Go</span>Connexions
        </Link>
      </nav>

      {/* Color accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}66, transparent)` }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px', display: 'flex', gap: 36, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Left column ── */}
        <div style={{ flex: '1 1 520px', minWidth: 0 }}>

          {/* Images */}
          <div style={{
            borderRadius: 20, overflow: 'hidden', marginBottom: 28, position: 'relative',
            background: `linear-gradient(135deg, ${cat.color}15, ${cat.color}06)`,
            border: '1px solid rgba(255,255,255,0.07)',
            minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {service.images?.length > 0 ? (
              <>
                <img src={service.images[imageIdx]} alt={service.title} style={{ width: '100%', maxHeight: 360, objectFit: 'cover', display: 'block' }} />
                {service.images.length > 1 && (
                  <>
                    <button onClick={() => setImageIdx(i => Math.max(0, i - 1))} disabled={imageIdx === 0}
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: imageIdx === 0 ? 0.3 : 1 }}>‹</button>
                    <button onClick={() => setImageIdx(i => Math.min(service.images.length - 1, i + 1))} disabled={imageIdx === service.images.length - 1}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: imageIdx === service.images.length - 1 ? 0.3 : 1 }}>›</button>
                    <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                      {service.images.map((_: any, i: number) => (
                        <button key={i} onClick={() => setImageIdx(i)}
                          style={{ width: i === imageIdx ? 20 : 6, height: 6, borderRadius: 3, border: 'none', cursor: 'pointer', background: i === imageIdx ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span style={{ fontSize: 80, opacity: 0.2 }}>{cat.emoji}</span>
            )}
          </div>

          {/* Breadcrumb + Title */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: `${cat.color}18`, border: `1px solid ${cat.color}35`,
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: cat.color,
              }}>
                <span>{cat.emoji}</span> {cat.label}
              </span>
            </div>
            <h1 style={{ margin: '0 0 14px', fontSize: 26, fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
              {service.title}
            </h1>

            {/* Stats chips */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <svg width="12" height="12" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                </svg>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{service.delivery}</span>
              </div>
              {salesCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span style={{ fontSize: 12 }}>✅</span>
                  <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{salesCount} commande{salesCount > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description card */}
          <div style={{
            background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18, padding: '24px 28px', marginBottom: 24,
          }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Description du service
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: '#cbd5e1', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {service.description}
            </p>
          </div>

          {/* About seller */}
          <div style={{
            background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18, padding: '24px 28px',
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              À propos du vendeur
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${cat.color}, ${cat.color}99)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, fontWeight: 800, color: '#fff',
                boxShadow: `0 0 0 3px ${cat.color}20`,
              }}>{sellerInitials}</div>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
                  {service.seller?.firstName} {service.seller?.lastName}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  {service.seller?.freelancerProfile?.title ?? service.seller?.entrepreneurProfile?.companyName ?? service.seller?.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column — Order card ── */}
        <div style={{ flex: '0 0 300px', width: 300 }}>
          <div style={{
            position: 'sticky', top: 80,
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          }}>
            {/* Top accent */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${cat.color}, #7c3aed)` }} />

            <div style={{ padding: '24px' }}>
              {/* Price */}
              <div style={{ textAlign: 'center', paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prix du service</p>
                <p style={{ margin: '0 0 4px', fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                  {service.price.toLocaleString('fr-CA', { style: 'currency', currency: service.currency ?? 'CAD' })}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>Paiement unique · Livraison {service.delivery}</p>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#fca5a5' }}>⚠️ {error}</p>
                </div>
              )}

              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                    background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`,
                    color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    boxShadow: `0 6px 20px ${cat.color}40`,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px ${cat.color}55`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${cat.color}40`;
                  }}
                >
                  Commander ce service
                </button>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px' }}>
                  <p style={{ margin: '0 0 14px', fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
                    Confirmer commande pour<br />
                    <strong style={{ color: '#f1f5f9' }}>{service.price.toLocaleString('fr-CA', { style: 'currency', currency: service.currency ?? 'CAD' })}</strong> ?
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowConfirm(false)}
                      style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>
                      Annuler
                    </button>
                    <button
                      onClick={handleOrder}
                      disabled={ordering}
                      style={{ flex: 2, padding: '10px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`, color: '#fff', cursor: ordering ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, opacity: ordering ? 0.7 : 1 }}>
                      {ordering ? '⏳ Redirection...' : '✓ Payer maintenant'}
                    </button>
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: '🔒', text: 'Paiement sécurisé Stripe' },
                  { icon: '✅', text: 'Satisfaction garantie' },
                  { icon: '💬', text: 'Support GoConnexions' },
                ].map(b => (
                  <div key={b.icon} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13 }}>{b.icon}</span>
                    <span style={{ fontSize: 11, color: '#475569' }}>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
