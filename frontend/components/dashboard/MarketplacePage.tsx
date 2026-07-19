'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/types/auth';
import { api } from '@/lib/api';

const CAT_META: Record<string, { label: string; emoji: string; color: string }> = {
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

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: 'Actif',      color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  PAUSED:    { label: 'En pause',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  DELETED:   { label: 'Supprimé',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
  PENDING:   { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  PAID:      { label: 'Payé',       color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  DELIVERED: { label: 'Livré',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  COMPLETED: { label: 'Complété',   color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  CANCELLED: { label: 'Annulé',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CFG[status] ?? { label: status, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}35`,
      whiteSpace: 'nowrap',
    }}>{cfg.label}</span>
  );
};

type InnerTab = 'services' | 'orders' | 'sales';
interface Props { user: User | null }

export default function MarketplacePage({ user }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<InnerTab>('services');
  const [myServices, setMyServices] = useState<any[]>([]);
  const [myOrders, setMyOrders]     = useState<any[]>([]);
  const [mySales, setMySales]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [deletingId, setDeletingId]     = useState<string | null>(null);
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
    } catch { setError('Erreur lors du chargement'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer définitivement ce service ?')) return;
    setDeletingId(id);
    try {
      await api.marketplace.deleteService(id);
      setMyServices(s => s.filter(x => x.id !== id));
    } catch { alert('Erreur lors de la suppression'); }
    finally { setDeletingId(null); }
  };

  const handleTogglePause = async (svc: any) => {
    const newStatus = svc.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.marketplace.updateService(svc.id, { status: newStatus });
      setMyServices(s => s.map(x => x.id === svc.id ? { ...x, status: newStatus } : x));
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

  const totalEarned = mySales.filter(s => ['PAID', 'COMPLETED'].includes(s.status)).reduce((sum, s) => sum + s.amount, 0);

  // ── Stats cards ─────────────────────────────────────────────────
  const stats = [
    { label: 'Services actifs', value: myServices.filter(s => s.status === 'ACTIVE').length, icon: '🛠️', color: '#3b82f6' },
    { label: 'Commandes',       value: myOrders.length,  icon: '🛒', color: '#8b5cf6' },
    { label: 'Ventes',          value: mySales.length,   icon: '📦', color: '#10b981' },
    { label: 'Encaissé',        value: totalEarned > 0 ? totalEarned.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }) : '—', icon: '💰', color: '#f59e0b' },
  ];

  const TABS: { id: InnerTab; label: string; count: number }[] = [
    { id: 'services', label: 'Mes services',  count: myServices.length },
    { id: 'orders',   label: 'Mes commandes', count: myOrders.length },
    { id: 'sales',    label: 'Mes ventes',    count: mySales.length },
  ];

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 5px', fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em' }}>Marketplace</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>Gérez vos services, commandes et ventes</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/marketplace" target="_blank" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10,
            border: '1px solid rgba(37,99,235,0.3)', background: 'rgba(37,99,235,0.08)',
            color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 600,
          }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Voir la marketplace
          </Link>
          <Link href="/marketplace/sell" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700,
            boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
          }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Publier un service
          </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(15,23,42,0.5)', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: tab === t.id ? 'rgba(37,99,235,0.25)' : 'transparent',
            color: tab === t.id ? '#60a5fa' : '#64748b',
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
            transition: 'all 0.15s',
          }}>
            {t.label}
            <span style={{
              minWidth: 20, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: tab === t.id ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.07)',
              color: tab === t.id ? '#93c5fd' : '#475569',
              fontSize: 10, fontWeight: 700, padding: '0 5px',
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
          <span>⚠️</span><p style={{ margin: 0, fontSize: 13, color: '#fca5a5' }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 0', color: '#475569' }}>
          <div style={{ width: 20, height: 20, border: '2px solid rgba(37,99,235,0.2)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Chargement...
        </div>
      ) : (
        <>
          {/* ── My Services ── */}
          {tab === 'services' && (
            myServices.length === 0 ? (
              <EmptyState
                icon="🛠️"
                title="Aucun service publié"
                text="Proposez vos compétences à la communauté GoConnexions."
                action={{ label: '+ Créer mon premier service', href: '/marketplace/sell' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myServices.map(svc => {
                  const cat = CAT_META[svc.category] ?? { label: svc.category, emoji: '🔧', color: '#6b7280' };
                  return (
                    <div key={svc.id} style={{
                      background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 16, padding: '16px 20px',
                      display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
                    }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: 58, height: 58, borderRadius: 12, flexShrink: 0, overflow: 'hidden',
                        background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}0a)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${cat.color}25`,
                      }}>
                        {svc.images?.[0]
                          ? <img src={svc.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: 22 }}>{cat.emoji}</span>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${cat.color}18`, color: cat.color }}>{cat.emoji} {cat.label}</span>
                          <StatusBadge status={svc.status} />
                        </div>
                        <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{svc.title}</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>
                          {svc.price.toLocaleString('fr-CA', { style: 'currency', currency: svc.currency ?? 'CAD' })}
                          <span style={{ margin: '0 6px', color: '#334155' }}>·</span>
                          {svc.delivery}
                          <span style={{ margin: '0 6px', color: '#334155' }}>·</span>
                          {svc._count?.orders ?? 0} vente{svc._count?.orders !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                        <ActionBtn onClick={() => router.push(`/marketplace/${svc.id}`)}>Voir</ActionBtn>
                        <ActionBtn
                          onClick={() => handleTogglePause(svc)}
                          color={svc.status === 'ACTIVE' ? '#f59e0b' : '#10b981'}
                        >
                          {svc.status === 'ACTIVE' ? 'Pause' : 'Activer'}
                        </ActionBtn>
                        <ActionBtn
                          onClick={() => handleDelete(svc.id)}
                          loading={deletingId === svc.id}
                          color="#ef4444"
                          danger
                        >
                          Supprimer
                        </ActionBtn>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── My Orders ── */}
          {tab === 'orders' && (
            myOrders.length === 0 ? (
              <EmptyState
                icon="🛒"
                title="Aucune commande"
                text="Explorez la marketplace et trouvez des services professionnels."
                action={{ label: 'Explorer la marketplace', href: '/marketplace' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myOrders.map(order => {
                  const cat = CAT_META[order.service?.category] ?? { emoji: '🔧', color: '#6b7280' };
                  return (
                    <div key={order.id} style={{
                      background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 16, padding: '16px 20px',
                      display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
                    }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                        background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}0a)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${cat.color}25`,
                        overflow: 'hidden',
                      }}>
                        {order.service?.images?.[0]
                          ? <img src={order.service.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: 18 }}>{cat.emoji}</span>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.service?.title}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>
                          Par {order.service?.seller?.firstName} {order.service?.seller?.lastName}
                          <span style={{ margin: '0 6px', color: '#334155' }}>·</span>
                          {order.amount.toLocaleString('fr-CA', { style: 'currency', currency: order.currency })}
                          <span style={{ margin: '0 6px', color: '#334155' }}>·</span>
                          {new Date(order.createdAt).toLocaleDateString('fr-CA')}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StatusBadge status={order.status} />
                        {['PAID', 'DELIVERED'].includes(order.status) && (
                          <button
                            onClick={() => handleComplete(order.id)}
                            disabled={completingId === order.id}
                            style={{
                              padding: '7px 14px', borderRadius: 9,
                              border: '1px solid rgba(16,185,129,0.25)',
                              background: 'rgba(16,185,129,0.15)', color: '#10b981',
                              cursor: 'pointer', fontSize: 12, fontWeight: 700,
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

          {/* ── My Sales ── */}
          {tab === 'sales' && (
            mySales.length === 0 ? (
              <EmptyState
                icon="💰"
                title="Pas encore de ventes"
                text="Continuez à promouvoir vos services — les commandes arrivent !"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mySales.map(sale => {
                  const buyerInitials = `${sale.buyer?.firstName?.[0] ?? ''}${sale.buyer?.lastName?.[0] ?? ''}`.toUpperCase();
                  return (
                    <div key={sale.id} style={{
                      background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 16, padding: '16px 20px',
                      display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: '#fff',
                      }}>{buyerInitials}</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sale.service?.title}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>
                          {sale.buyer?.firstName} {sale.buyer?.lastName}
                          <span style={{ margin: '0 6px', color: '#334155' }}>·</span>
                          {new Date(sale.createdAt).toLocaleDateString('fr-CA')}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: '#10b981' }}>
                          +{sale.amount.toLocaleString('fr-CA', { style: 'currency', currency: sale.currency })}
                        </span>
                        <StatusBadge status={sale.status} />
                      </div>
                    </div>
                  );
                })}

                {/* Total card */}
                {totalEarned > 0 && (
                  <div style={{
                    marginTop: 8, padding: '18px 24px', borderRadius: 16,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))',
                    border: '1px solid rgba(16,185,129,0.25)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>💰 Total encaissé</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#065f46' }}>Commandes payées + complétées</p>
                    </div>
                    <span style={{ fontSize: 24, fontWeight: 900, color: '#10b981' }}>
                      {totalEarned.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </span>
                  </div>
                )}
              </div>
            )
          )}
        </>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function ActionBtn({ children, onClick, color = '#64748b', loading = false, danger = false }: {
  children: React.ReactNode; onClick: () => void; color?: string; loading?: boolean; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: '6px 13px', borderRadius: 8, fontSize: 12, fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
        border: danger ? `1px solid ${color}35` : '1px solid rgba(255,255,255,0.1)',
        background: danger ? `${color}0e` : 'rgba(255,255,255,0.04)',
        color: danger ? color : color,
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? '...' : children}
    </button>
  );
}

function EmptyState({ icon, title, text, action }: {
  icon: string; title: string; text: string; action?: { label: string; href: string };
}) {
  return (
    <div style={{
      textAlign: 'center', padding: '64px 24px',
      background: 'rgba(15,23,42,0.4)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 20,
    }}>
      <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.5 }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>{title}</h3>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{text}</p>
      {action && (
        <Link href={action.href} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 22px', borderRadius: 10,
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13,
          boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
        }}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
