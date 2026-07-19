'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/types/auth';
import { api } from '@/lib/api';

// ── Design tokens (light dashboard theme) ────────────────────────
const T = {
  bg:      '#f8fafc',
  card:    '#ffffff',
  border:  '#e2e8f0',
  border2: '#f1f5f9',
  text1:   '#0f172a',
  text2:   '#475569',
  text3:   '#94a3b8',
  blue:    '#2563eb',
  blueL:   '#eff6ff',
  blueM:   '#bfdbfe',
};

const CAT_META: Record<string, { label: string; emoji: string; color: string; light: string }> = {
  TECH:         { label: 'Tech & Dev',   emoji: '💻', color: '#3b82f6', light: '#eff6ff' },
  DESIGN:       { label: 'Design',       emoji: '🎨', color: '#8b5cf6', light: '#f5f3ff' },
  MARKETING:    { label: 'Marketing',    emoji: '📣', color: '#f59e0b', light: '#fffbeb' },
  COMPTABILITE: { label: 'Comptabilité', emoji: '📊', color: '#10b981', light: '#ecfdf5' },
  COACHING:     { label: 'Coaching',     emoji: '🎯', color: '#06b6d4', light: '#ecfeff' },
  JURIDIQUE:    { label: 'Juridique',    emoji: '⚖️', color: '#ef4444', light: '#fef2f2' },
  FORMATION:    { label: 'Formation',    emoji: '📚', color: '#f97316', light: '#fff7ed' },
  TRADUCTION:   { label: 'Traduction',   emoji: '🌍', color: '#84cc16', light: '#f7fee7' },
  SANTE:        { label: 'Santé',        emoji: '💚', color: '#ec4899', light: '#fdf2f8' },
  AUTRE:        { label: 'Autre',        emoji: '🔧', color: '#6b7280', light: '#f9fafb' },
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  ACTIVE:    { label: 'Actif',      color: '#059669', bg: '#d1fae5', dot: '#10b981' },
  PAUSED:    { label: 'En pause',   color: '#d97706', bg: '#fef3c7', dot: '#f59e0b' },
  DELETED:   { label: 'Supprimé',   color: '#dc2626', bg: '#fee2e2', dot: '#ef4444' },
  PENDING:   { label: 'En attente', color: '#d97706', bg: '#fef3c7', dot: '#f59e0b' },
  PAID:      { label: 'Payé',       color: '#1d4ed8', bg: '#dbeafe', dot: '#3b82f6' },
  DELIVERED: { label: 'Livré',      color: '#7c3aed', bg: '#ede9fe', dot: '#8b5cf6' },
  COMPLETED: { label: 'Complété',   color: '#059669', bg: '#d1fae5', dot: '#10b981' },
  CANCELLED: { label: 'Annulé',     color: '#dc2626', bg: '#fee2e2', dot: '#ef4444' },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? { label: status, color: '#64748b', bg: '#f1f5f9', dot: '#94a3b8' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

type InnerTab = 'services' | 'orders' | 'sales';
interface Props { user: User | null }

export default function MarketplacePage({ user }: Props) {
  const router = useRouter();
  const [tab, setTab]               = useState<InnerTab>('services');
  const [myServices, setMyServices] = useState<any[]>([]);
  const [myOrders, setMyOrders]     = useState<any[]>([]);
  const [mySales, setMySales]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [svcs, orders, sales] = await Promise.all([
        api.marketplace.myServices(),
        api.marketplace.myOrders(),
        api.marketplace.mySales(),
      ]);
      setMyServices(svcs);
      setMyOrders(orders);
      setMySales(sales);
    } catch { setError('Erreur lors du chargement'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce service ?')) return;
    setDeletingId(id);
    try {
      await api.marketplace.deleteService(id);
      setMyServices(s => s.filter(x => x.id !== id));
    } catch { alert('Erreur'); }
    finally { setDeletingId(null); }
  };

  const handleTogglePause = async (svc: any) => {
    const next = svc.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.marketplace.updateService(svc.id, { status: next });
      setMyServices(s => s.map(x => x.id === svc.id ? { ...x, status: next } : x));
    } catch { alert('Erreur'); }
  };

  const handleComplete = async (orderId: string) => {
    setCompletingId(orderId);
    try {
      await api.marketplace.completeOrder(orderId);
      setMyOrders(o => o.map(x => x.id === orderId ? { ...x, status: 'COMPLETED' } : x));
    } catch { alert('Erreur'); }
    finally { setCompletingId(null); }
  };

  const totalEarned   = mySales.filter(s => ['PAID','COMPLETED'].includes(s.status)).reduce((sum, s) => sum + s.amount, 0);
  const activeServices = myServices.filter(s => s.status === 'ACTIVE').length;

  const STAT_CARDS = [
    { label: 'Services actifs',  value: activeServices,    icon: '🛠️', color: '#2563eb', bg: '#eff6ff', bar: '#3b82f6' },
    { label: 'Commandes reçues', value: myOrders.length,   icon: '🛒', color: '#7c3aed', bg: '#f5f3ff', bar: '#8b5cf6' },
    { label: 'Ventes réalisées', value: mySales.length,    icon: '📦', color: '#059669', bg: '#ecfdf5', bar: '#10b981' },
    { label: 'Revenus',
      value: totalEarned > 0
        ? totalEarned.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 })
        : '0 $',
      icon: '💰', color: '#d97706', bg: '#fffbeb', bar: '#f59e0b',
    },
  ];

  const TABS: { id: InnerTab; label: string; count: number }[] = [
    { id: 'services', label: 'Mes services',  count: myServices.length },
    { id: 'orders',   label: 'Mes commandes', count: myOrders.length   },
    { id: 'sales',    label: 'Mes ventes',    count: mySales.length    },
  ];

  return (
    <div style={{ minHeight: '100%', padding: '2px 0 40px' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.blueL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              🛒
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text1, letterSpacing: '-0.01em' }}>
              Marketplace
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: T.text3, paddingLeft: 46 }}>
            Gérez vos services, commandes et revenus en un seul endroit
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/marketplace" target="_blank" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 10,
            border: `1px solid ${T.border}`, background: T.card,
            color: T.text2, textDecoration: 'none', fontSize: 13, fontWeight: 600,
            boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
          }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Explorer
          </Link>
          <Link href="/marketplace/sell" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700,
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
          }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Publier un service
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 1px 6px rgba(15,23,42,0.04)',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px rgba(15,23,42,0.1), 0 0 0 1px ${s.bar}25`;
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(15,23,42,0.04)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            {/* Colored top bar */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${s.bar}, ${s.bar}66)` }} />
            <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: s.bg, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                {s.icon}
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 800, color: T.text1, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: T.text3, fontWeight: 500 }}>{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 24 }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', border: 'none', cursor: 'pointer',
                background: 'transparent',
                color: active ? T.blue : T.text3,
                fontSize: 13, fontWeight: active ? 700 : 500,
                transition: 'color 0.15s',
                borderBottom: active ? `2px solid ${T.blue}` : '2px solid transparent',
                marginBottom: -2,
              }}
            >
              {t.label}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 20, height: 18, borderRadius: 9, padding: '0 5px',
                background: active ? T.blueL : '#f1f5f9',
                color: active ? T.blue : T.text3,
                fontSize: 10, fontWeight: 700,
              }}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 12, padding: '12px 16px', marginBottom: 16,
        }}>
          <span>⚠️</span>
          <p style={{ margin: 0, fontSize: 13, color: '#dc2626' }}>{error}</p>
        </div>
      )}

      {/* ── Loading ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 84, borderRadius: 14, background: '#f8fafc', border: `1px solid ${T.border}`, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <>
          {/* ── MY SERVICES ── */}
          {tab === 'services' && (
            myServices.length === 0
              ? <EmptyState icon="🛠️" title="Aucun service publié" text="Proposez vos compétences à la communauté et commencez à recevoir des commandes." href="/marketplace/sell" cta="Créer mon premier service" />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {myServices.map(svc => {
                    const cat = CAT_META[svc.category] ?? { label: svc.category, emoji: '🔧', color: '#6b7280', light: '#f9fafb' };
                    return (
                      <div
                        key={svc.id}
                        style={{
                          background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                          display: 'flex', alignItems: 'center', gap: 0,
                          overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
                          transition: 'box-shadow 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(15,23,42,0.08)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)'}
                      >
                        {/* Colored left stripe */}
                        <div style={{ width: 4, alignSelf: 'stretch', background: cat.color, flexShrink: 0 }} />

                        {/* Thumbnail */}
                        <div style={{
                          width: 56, height: 56, margin: '14px 14px 14px 16px', borderRadius: 12, flexShrink: 0,
                          background: cat.light,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden', border: `1px solid ${cat.color}25`,
                        }}>
                          {svc.images?.[0]
                            ? <img src={svc.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                          }
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0, padding: '14px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                              background: cat.light, color: cat.color,
                            }}>
                              {cat.emoji} {cat.label}
                            </span>
                            <StatusBadge status={svc.status} />
                          </div>
                          <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: T.text1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 380 }}>
                            {svc.title}
                          </p>
                          <div style={{ display: 'flex', gap: 14 }}>
                            <span style={{ fontSize: 12, color: T.text2, fontWeight: 600 }}>
                              {svc.price.toLocaleString('fr-CA', { style: 'currency', currency: svc.currency ?? 'CAD' })}
                            </span>
                            <span style={{ fontSize: 12, color: T.text3 }}>⏱ {svc.delivery}</span>
                            <span style={{ fontSize: 12, color: T.text3 }}>
                              ✓ {svc._count?.orders ?? 0} vente{svc._count?.orders !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 7, padding: '0 16px', flexShrink: 0 }}>
                          <button
                            onClick={() => router.push(`/marketplace/${svc.id}`)}
                            style={btnStyle('default')}
                          >
                            Voir
                          </button>
                          <button
                            onClick={() => handleTogglePause(svc)}
                            style={btnStyle(svc.status === 'ACTIVE' ? 'warning' : 'success')}
                          >
                            {svc.status === 'ACTIVE' ? 'Mettre en pause' : 'Réactiver'}
                          </button>
                          <button
                            onClick={() => handleDelete(svc.id)}
                            disabled={deletingId === svc.id}
                            style={btnStyle('danger')}
                          >
                            {deletingId === svc.id ? '...' : 'Supprimer'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
          )}

          {/* ── MY ORDERS ── */}
          {tab === 'orders' && (
            myOrders.length === 0
              ? <EmptyState icon="🛒" title="Aucune commande" text="Explorez la marketplace et trouvez des services professionnels pour vous aider à avancer." href="/marketplace" cta="Explorer la marketplace" />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {myOrders.map(order => {
                    const cat = CAT_META[order.service?.category] ?? { emoji: '🔧', color: '#6b7280', light: '#f9fafb' };
                    return (
                      <div
                        key={order.id}
                        style={{
                          background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                          display: 'flex', alignItems: 'center', gap: 0,
                          overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
                          transition: 'box-shadow 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(15,23,42,0.08)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)'}
                      >
                        <div style={{ width: 4, alignSelf: 'stretch', background: (STATUS_CFG[order.status] ?? STATUS_CFG.PENDING).dot, flexShrink: 0 }} />

                        <div style={{
                          width: 46, height: 46, margin: '14px', borderRadius: 10, flexShrink: 0,
                          background: cat.light, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                        }}>
                          {order.service?.images?.[0]
                            ? <img src={order.service.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: 18 }}>{cat.emoji}</span>}
                        </div>

                        <div style={{ flex: 1, minWidth: 0, padding: '14px 0' }}>
                          <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: T.text1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 420 }}>
                            {order.service?.title}
                          </p>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: T.text2 }}>
                              Vendeur : <strong>{order.service?.seller?.firstName} {order.service?.seller?.lastName}</strong>
                            </span>
                            <span style={{ color: T.border }}>·</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.blue }}>
                              {order.amount.toLocaleString('fr-CA', { style: 'currency', currency: order.currency })}
                            </span>
                            <span style={{ color: T.border }}>·</span>
                            <span style={{ fontSize: 12, color: T.text3 }}>
                              {new Date(order.createdAt).toLocaleDateString('fr-CA')}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', flexShrink: 0 }}>
                          <StatusBadge status={order.status} />
                          {['PAID', 'DELIVERED'].includes(order.status) && (
                            <button
                              onClick={() => handleComplete(order.id)}
                              disabled={completingId === order.id}
                              style={{
                                padding: '7px 14px', borderRadius: 8, border: '1px solid #a7f3d0',
                                background: '#ecfdf5', color: '#059669', cursor: 'pointer',
                                fontSize: 12, fontWeight: 700,
                              }}
                            >
                              {completingId === order.id ? '...' : '✓ Confirmer livraison'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
          )}

          {/* ── MY SALES ── */}
          {tab === 'sales' && (
            mySales.length === 0
              ? <EmptyState icon="💰" title="Pas encore de ventes" text="Publiez des services et commencez à recevoir des commandes de la communauté." href="/marketplace/sell" cta="Publier un service" />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mySales.map(sale => {
                    const buyerInitials = `${sale.buyer?.firstName?.[0] ?? ''}${sale.buyer?.lastName?.[0] ?? ''}`.toUpperCase();
                    const isPaid = ['PAID', 'COMPLETED'].includes(sale.status);
                    return (
                      <div
                        key={sale.id}
                        style={{
                          background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                          display: 'flex', alignItems: 'center', gap: 0,
                          overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
                          transition: 'box-shadow 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(15,23,42,0.08)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)'}
                      >
                        <div style={{ width: 4, alignSelf: 'stretch', background: isPaid ? '#10b981' : '#f59e0b', flexShrink: 0 }} />

                        {/* Buyer avatar */}
                        <div style={{
                          width: 42, height: 42, margin: '14px', borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: '#fff',
                        }}>
                          {buyerInitials}
                        </div>

                        <div style={{ flex: 1, minWidth: 0, padding: '14px 0' }}>
                          <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: T.text1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 420 }}>
                            {sale.service?.title}
                          </p>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: T.text2 }}>
                              Acheteur : <strong>{sale.buyer?.firstName} {sale.buyer?.lastName}</strong>
                            </span>
                            <span style={{ color: T.border }}>·</span>
                            <span style={{ fontSize: 12, color: T.text3 }}>
                              {new Date(sale.createdAt).toLocaleDateString('fr-CA')}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', flexShrink: 0 }}>
                          <span style={{ fontSize: 17, fontWeight: 800, color: isPaid ? '#059669' : '#d97706' }}>
                            +{sale.amount.toLocaleString('fr-CA', { style: 'currency', currency: sale.currency })}
                          </span>
                          <StatusBadge status={sale.status} />
                        </div>
                      </div>
                    );
                  })}

                  {/* Total encaissé */}
                  {totalEarned > 0 && (
                    <div style={{
                      marginTop: 6, padding: '18px 24px', borderRadius: 14,
                      background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                      border: '1px solid #a7f3d0',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Total encaissé
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: '#6ee7b7' }}>
                          Commandes payées & complétées
                        </p>
                      </div>
                      <span style={{ fontSize: 26, fontWeight: 900, color: '#059669', letterSpacing: '-0.02em' }}>
                        {totalEarned.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </span>
                    </div>
                  )}
                </div>
              )
          )}
        </>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

// ── Button helper ─────────────────────────────────────────────────
function btnStyle(variant: 'default' | 'warning' | 'success' | 'danger'): React.CSSProperties {
  const V = {
    default: { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
    warning: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
    success: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
    danger:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  }[variant];
  return {
    padding: '7px 13px', borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: `1px solid ${V.border}`,
    background: V.bg, color: V.color,
    transition: 'all 0.15s', whiteSpace: 'nowrap' as const,
  };
}

// ── Empty state ───────────────────────────────────────────────────
function EmptyState({ icon, title, text, href, cta }: {
  icon: string; title: string; text: string; href?: string; cta?: string;
}) {
  return (
    <div style={{
      textAlign: 'center', padding: '56px 24px',
      background: '#fafafa', border: '1.5px dashed #e2e8f0', borderRadius: 18,
    }}>
      <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.6 }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{title}</h3>
      <p style={{ margin: '0 0 22px', fontSize: 13, color: '#94a3b8', lineHeight: 1.6, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>{text}</p>
      {href && cta && (
        <Link href={href} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 22px', borderRadius: 10,
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13,
          boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
        }}>
          {cta}
        </Link>
      )}
    </div>
  );
}
