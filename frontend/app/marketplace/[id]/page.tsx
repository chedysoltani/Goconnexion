'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const CATEGORY_LABELS: Record<string, string> = {
  TECH: 'Tech & Dev', DESIGN: 'Design', MARKETING: 'Marketing',
  COMPTABILITE: 'Comptabilité', COACHING: 'Coaching', JURIDIQUE: 'Juridique',
  FORMATION: 'Formation', TRADUCTION: 'Traduction', SANTE: 'Santé', AUTRE: 'Autre',
};

const CATEGORY_COLORS: Record<string, string> = {
  TECH: '#3b82f6', DESIGN: '#8b5cf6', MARKETING: '#f59e0b',
  COMPTABILITE: '#10b981', COACHING: '#06b6d4', JURIDIQUE: '#ef4444',
  FORMATION: '#f97316', TRADUCTION: '#84cc16', SANTE: '#ec4899', AUTRE: '#6b7280',
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
    api.marketplace.getService(id)
      .then(setService)
      .catch(() => setError('Service introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async () => {
    setOrdering(true);
    setError('');
    try {
      const result = await api.marketplace.createOrder(id);
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        router.push(`/marketplace/order-success?orderId=${result.order.id}`);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la commande');
      setOrdering(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      Chargement...
    </div>
  );

  if (!service) return (
    <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ color: '#94a3b8' }}>Service introuvable</p>
      <Link href="/marketplace" style={{ color: '#3b82f6', textDecoration: 'none' }}>← Retour</Link>
    </div>
  );

  const catColor = CATEGORY_COLORS[service.category] ?? '#6b7280';
  const catLabel = CATEGORY_LABELS[service.category] ?? service.category;
  const sellerInitials = `${service.seller?.firstName?.[0] ?? ''}${service.seller?.lastName?.[0] ?? ''}`.toUpperCase();
  const hasImages = service.images?.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#09090B', color: '#f1f5f9' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(9,9,11,0.88)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60,
      }}>
        <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#94a3b8', fontSize: 13 }}>
          ← Retour à la marketplace
        </Link>
        <Link href="/" style={{ fontSize: 16, fontWeight: 800, color: '#fff', textDecoration: 'none' }}>
          <span style={{ color: '#2563eb' }}>Go</span>Connexions
        </Link>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {/* Left column */}
        <div style={{ flex: '1 1 500px', minWidth: 0 }}>
          {/* Image gallery */}
          <div style={{
            height: 300, borderRadius: 16, overflow: 'hidden', marginBottom: 24,
            background: `linear-gradient(135deg, ${catColor}22, ${catColor}44)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            {hasImages ? (
              <>
                <img src={service.images[imageIdx]} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {service.images.length > 1 && (
                  <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                    {service.images.map((_: any, i: number) => (
                      <button key={i} onClick={() => setImageIdx(i)} style={{
                        width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: i === imageIdx ? '#fff' : 'rgba(255,255,255,0.4)',
                      }} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <span style={{ fontSize: 72, opacity: 0.3 }}>🛠️</span>
            )}
          </div>

          {/* Title + category */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <span style={{
                display: 'inline-block', marginBottom: 8,
                background: catColor, color: '#fff',
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
              }}>{catLabel}</span>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, lineHeight: 1.3 }}>{service.title}</h1>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
              <span>⏱</span> Livraison : <strong style={{ color: '#f1f5f9' }}>{service.delivery}</strong>
            </div>
            {service._count?.orders > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
                <span>✅</span> <strong style={{ color: '#f1f5f9' }}>{service._count.orders}</strong> commande{service._count.orders > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{
            background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '20px 24px', marginBottom: 24,
          }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Description du service
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {service.description}
            </p>
          </div>
        </div>

        {/* Right column — Order card */}
        <div style={{ flex: '0 0 280px', width: 280 }}>
          <div style={{
            position: 'sticky', top: 80,
            background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: 24,
          }}>
            {/* Price */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: '#2563eb' }}>
                {service.price.toLocaleString('fr-CA', { style: 'currency', currency: service.currency ?? 'CAD' })}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#475569' }}>Paiement unique sécurisé</p>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#fca5a5' }}>
                {error}
              </div>
            )}

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                }}
              >
                Commander ce service
              </button>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 12 }}>
                  Confirmer votre commande ?
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleOrder}
                    disabled={ordering}
                    style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: ordering ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, opacity: ordering ? 0.7 : 1 }}
                  >
                    {ordering ? 'Redirection...' : '✓ Confirmer & Payer'}
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#475569', textAlign: 'center' }}>
                🔒 Paiement sécurisé via Stripe — aucune donnée bancaire stockée
              </p>
            </div>

            {/* Seller card */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendeur</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${catColor}, ${catColor}bb)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                }}>{sellerInitials}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
                    {service.seller?.firstName} {service.seller?.lastName}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>
                    {service.seller?.freelancerProfile?.title ?? service.seller?.entrepreneurProfile?.companyName ?? service.seller?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
