'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/types/auth';
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

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ACTIVE:    { label: 'Actif',     color: '#10b981' },
  PAUSED:    { label: 'En pause',  color: '#f59e0b' },
  DELETED:   { label: 'Supprimé',  color: '#ef4444' },
  PENDING:   { label: 'En attente',color: '#f59e0b' },
  PAID:      { label: 'Payé',      color: '#3b82f6' },
  DELIVERED: { label: 'Livré',     color: '#8b5cf6' },
  COMPLETED: { label: 'Complété',  color: '#10b981' },
  CANCELLED: { label: 'Annulé',    color: '#ef4444' },
};

interface Props { user: User | null }

type InnerTab = 'services' | 'orders' | 'sales';

export default function MarketplacePage({ user }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<InnerTab>('services');
  const [myServices, setMyServices] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [mySales, setMySales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [svcs, orders, sales] = await Promise.all([
        api.marketplace.myServices(),
        api.marketplace.myOrders(),
        api.marketplace.mySales(),
      ]);
      setMyServices(svcs);
      setMyOrders(orders);
      setMySales(sales);
    } catch {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce service ?')) return;
    setDeletingId(id);
    try {
      await api.marketplace.deleteService(id);
      setMyServices(s => s.filter(x => x.id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePause = async (svc: any) => {
    const newStatus = svc.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.marketplace.updateService(svc.id, { status: newStatus });
      setMyServices(s => s.map(x => x.id === svc.id ? { ...x, status: newStatus } : x));
    } catch {
      alert('Erreur');
    }
  };

  const handleComplete = async (orderId: string) => {
    setCompletingId(orderId);
    try {
      await api.marketplace.completeOrder(orderId);
      setMyOrders(o => o.map(x => x.id === orderId ? { ...x, status: 'COMPLETED' } : x));
    } catch {
      alert('Erreur');
    } finally {
      setCompletingId(null);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: '16px 20px',
    marginBottom: 12,
  };

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: active ? 'rgba(37,99,235,0.2)' : 'transparent',
    color: active ? '#3b82f6' : '#64748b',
    fontSize: 13, fontWeight: active ? 700 : 500,
    borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
  });

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Marketplace</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>Gérez vos services, commandes et ventes</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/marketplace" target="_blank" style={{
            padding: '9px 16px', borderRadius: 9, border: '1px solid rgba(37,99,235,0.3)',
            background: 'rgba(37,99,235,0.1)', color: '#3b82f6', textDecoration: 'none',
            fontSize: 13, fontWeight: 600,
          }}>
            Voir la marketplace →
          </Link>
          <Link href="/marketplace/sell" style={{
            padding: '9px 16px', borderRadius: 9, border: 'none',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700,
          }}>
            + Publier un service
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
        <button style={tabBtnStyle(tab === 'services')} onClick={() => setTab('services')}>
          Mes services ({myServices.length})
        </button>
        <button style={tabBtnStyle(tab === 'orders')} onClick={() => setTab('orders')}>
          Mes commandes ({myOrders.length})
        </button>
        <button style={tabBtnStyle(tab === 'sales')} onClick={() => setTab('sales')}>
          Mes ventes ({mySales.length})
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#fca5a5', fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>Chargement...</div>
      ) : (
        <>
          {/* ── My Services ── */}
          {tab === 'services' && (
            <>
              {myServices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🛠️</div>
                  <p style={{ color: '#475569', margin: '0 0 16px' }}>Vous n'avez pas encore publié de service.</p>
                  <Link href="/marketplace/sell" style={{
                    display: 'inline-block', padding: '10px 20px', borderRadius: 10,
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff',
                    textDecoration: 'none', fontWeight: 700, fontSize: 14,
                  }}>
                    Créer mon premier service
                  </Link>
                </div>
              ) : (
                myServices.map(svc => {
                  const catColor = CATEGORY_COLORS[svc.category] ?? '#6b7280';
                  const st = STATUS_LABEL[svc.status] ?? { label: svc.status, color: '#94a3b8' };
                  return (
                    <div key={svc.id} style={cardStyle}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        {/* Image / placeholder */}
                        <div style={{
                          width: 64, height: 64, borderRadius: 10, flexShrink: 0,
                          background: `linear-gradient(135deg, ${catColor}22, ${catColor}44)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden',
                        }}>
                          {svc.images?.[0]
                            ? <img src={svc.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: 24, opacity: 0.5 }}>🛠️</span>}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: catColor, color: '#fff' }}>
                              {CATEGORY_LABELS[svc.category] ?? svc.category}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${st.color}22`, color: st.color, border: `1px solid ${st.color}44` }}>
                              {st.label}
                            </span>
                          </div>
                          <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{svc.title}</p>
                          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                            {svc.price.toLocaleString('fr-CA', { style: 'currency', currency: svc.currency ?? 'CAD' })}
                            {' · '}{svc.delivery}
                            {' · '}{svc._count?.orders ?? 0} vente{svc._count?.orders !== 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <button
                            onClick={() => router.push(`/marketplace/${svc.id}`)}
                            style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}
                          >
                            Voir
                          </button>
                          <button
                            onClick={() => handleTogglePause(svc)}
                            style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: svc.status === 'ACTIVE' ? '#f59e0b' : '#10b981', cursor: 'pointer', fontSize: 12 }}
                          >
                            {svc.status === 'ACTIVE' ? 'Pause' : 'Activer'}
                          </button>
                          <button
                            onClick={() => handleDelete(svc.id)}
                            disabled={deletingId === svc.id}
                            style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}
                          >
                            {deletingId === svc.id ? '...' : 'Supprimer'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* ── My Orders ── */}
          {tab === 'orders' && (
            <>
              {myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
                  <p style={{ color: '#475569', margin: '0 0 16px' }}>Vous n'avez pas encore de commandes.</p>
                  <Link href="/marketplace" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
                    Explorer la marketplace →
                  </Link>
                </div>
              ) : (
                myOrders.map(order => {
                  const catColor = CATEGORY_COLORS[order.service?.category] ?? '#6b7280';
                  const st = STATUS_LABEL[order.status] ?? { label: order.status, color: '#94a3b8' };
                  return (
                    <div key={order.id} style={cardStyle}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                          background: `linear-gradient(135deg, ${catColor}22, ${catColor}44)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {order.service?.images?.[0]
                            ? <img src={order.service.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                            : <span style={{ fontSize: 20, opacity: 0.5 }}>🛠️</span>}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
                            {order.service?.title}
                          </p>
                          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                            Vendeur : {order.service?.seller?.firstName} {order.service?.seller?.lastName}
                            {' · '}{order.amount.toLocaleString('fr-CA', { style: 'currency', currency: order.currency })}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: `${st.color}22`, color: st.color, border: `1px solid ${st.color}44` }}>
                            {st.label}
                          </span>
                          {['PAID', 'DELIVERED'].includes(order.status) && (
                            <button
                              onClick={() => handleComplete(order.id)}
                              disabled={completingId === order.id}
                              style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10b981', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                            >
                              {completingId === order.id ? '...' : '✓ Confirmer livraison'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* ── My Sales ── */}
          {tab === 'sales' && (
            <>
              {mySales.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
                  <p style={{ color: '#475569' }}>Pas encore de ventes. Continuez à promouvoir vos services !</p>
                </div>
              ) : (
                mySales.map(sale => {
                  const st = STATUS_LABEL[sale.status] ?? { label: sale.status, color: '#94a3b8' };
                  const buyerInitials = `${sale.buyer?.firstName?.[0] ?? ''}${sale.buyer?.lastName?.[0] ?? ''}`.toUpperCase();
                  return (
                    <div key={sale.id} style={cardStyle}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Buyer avatar */}
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: '#fff',
                        }}>{buyerInitials}</div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
                            {sale.service?.title}
                          </p>
                          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                            Acheteur : {sale.buyer?.firstName} {sale.buyer?.lastName}
                            {' · '}{new Date(sale.createdAt).toLocaleDateString('fr-CA')}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>
                            +{sale.amount.toLocaleString('fr-CA', { style: 'currency', currency: sale.currency })}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: `${st.color}22`, color: st.color, border: `1px solid ${st.color}44` }}>
                            {st.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Total */}
              {mySales.filter(s => ['PAID', 'COMPLETED'].includes(s.status)).length > 0 && (
                <div style={{
                  marginTop: 16, padding: '14px 20px', borderRadius: 12,
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>Total encaissé</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>
                    {mySales
                      .filter(s => ['PAID', 'COMPLETED'].includes(s.status))
                      .reduce((sum, s) => sum + s.amount, 0)
                      .toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                  </span>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
