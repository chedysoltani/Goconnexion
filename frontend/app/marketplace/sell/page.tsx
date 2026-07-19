'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const CATEGORIES = [
  { id: 'TECH',         label: 'Tech & Développement',    emoji: '💻', color: '#3b82f6' },
  { id: 'DESIGN',       label: 'Design & Créatif',         emoji: '🎨', color: '#8b5cf6' },
  { id: 'MARKETING',    label: 'Marketing & Communication', emoji: '📣', color: '#f59e0b' },
  { id: 'COMPTABILITE', label: 'Comptabilité & Finance',   emoji: '📊', color: '#10b981' },
  { id: 'COACHING',     label: 'Coaching & Conseil',       emoji: '🎯', color: '#06b6d4' },
  { id: 'JURIDIQUE',    label: 'Juridique & Légal',        emoji: '⚖️', color: '#ef4444' },
  { id: 'FORMATION',    label: 'Formation & Éducation',    emoji: '📚', color: '#f97316' },
  { id: 'TRADUCTION',   label: 'Traduction & Langues',     emoji: '🌍', color: '#84cc16' },
  { id: 'SANTE',        label: 'Santé & Bien-être',        emoji: '💚', color: '#ec4899' },
  { id: 'AUTRE',        label: 'Autre',                    emoji: '✨', color: '#6b7280' },
];

const DELIVERY_OPTIONS = ['1 jour', '2-3 jours', '1 semaine', '2 semaines', '1 mois', 'À définir'];

export default function SellPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', price: '', currency: 'CAD',
    category: '', delivery: '', images: [] as string[],
  });

  useEffect(() => {
    api.auth.me().then(() => setAuthenticated(true)).catch(() => {
      setAuthenticated(false);
      router.push('/auth/login');
    });
  }, [router]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const addImage = () => {
    setImageError('');
    const trimmed = imageUrl.trim();
    if (!trimmed) { setImageError('Entrez une URL d\'image'); return; }
    if (!trimmed.match(/^https?:\/\/.+/)) { setImageError('URL invalide (doit commencer par http/https)'); return; }
    if (form.images.includes(trimmed)) { setImageError('Cette image est déjà ajoutée'); return; }
    if (form.images.length >= 5) { setImageError('Maximum 5 images'); return; }
    setForm(f => ({ ...f, images: [...f.images, trimmed] }));
    setImageUrl('');
  };

  const removeImage = (i: number) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.description || !form.price || !form.category || !form.delivery) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (Number(form.price) <= 0) { setError('Le prix doit être supérieur à 0'); return; }
    setLoading(true);
    try {
      const svc = await api.marketplace.createService({ ...form, price: Number(form.price) });
      router.push(`/marketplace/${svc.id}`);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (authenticated === null) return (
    <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(37,99,235,0.3)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  const selectedCat = CATEGORIES.find(c => c.id === form.category);

  const fieldCard = (children: React.ReactNode, extra?: React.CSSProperties) => (
    <div style={{
      background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, padding: '20px 24px', marginBottom: 16, ...extra,
    }}>{children}</div>
  );

  const label = (text: string, required = false) => (
    <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {text}{required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
    </p>
  );

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#f1f5f9', fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
  };

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
          Retour à la marketplace
        </Link>
        <Link href="/" style={{ fontSize: 16, fontWeight: 800, color: '#fff', textDecoration: 'none' }}>
          <span style={{ color: '#2563eb' }}>Go</span>Connexions
        </Link>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px',
            background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
            borderRadius: 20, marginBottom: 16,
          }}>
            <span style={{ fontSize: 14 }}>🛠️</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>Publier un service</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.2 }}>
            Vendez vos<br />
            <span style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              compétences
            </span>
          </h1>
          <p style={{ color: '#475569', margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            Proposez vos services à la communauté GoConnexions et commencez à recevoir des commandes.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          {fieldCard(<>
            {label('Titre du service', true)}
            <input
              style={inp}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Ex: Développement d'un site web Next.js..."
              maxLength={100}
              onFocus={e => (e.target.style.borderColor = 'rgba(37,99,235,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <p style={{ margin: '6px 0 0', fontSize: 11, color: form.title.length > 80 ? '#f59e0b' : '#475569', textAlign: 'right' }}>
              {form.title.length}/100
            </p>
          </>)}

          {/* Category */}
          {fieldCard(<>
            {label('Catégorie', true)}
            {/* Custom category picker */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => set('category', c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
                    border: form.category === c.id ? `1.5px solid ${c.color}` : '1.5px solid rgba(255,255,255,0.07)',
                    background: form.category === c.id ? `${c.color}18` : 'rgba(255,255,255,0.03)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{c.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: form.category === c.id ? c.color : '#64748b', textAlign: 'left', lineHeight: 1.3 }}>
                    {c.label.split(' & ')[0]}
                  </span>
                </button>
              ))}
            </div>
            {selectedCat && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: `${selectedCat.color}12`, border: `1px solid ${selectedCat.color}30`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>{selectedCat.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: selectedCat.color }}>{selectedCat.label}</span>
              </div>
            )}
          </>)}

          {/* Description */}
          {fieldCard(<>
            {label('Description', true)}
            <textarea
              style={{ ...inp, minHeight: 130, resize: 'vertical' }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Décrivez en détail ce que vous proposez : ce qui est inclus, votre méthode de travail, vos livrables..."
              onFocus={e => (e.target.style.borderColor = 'rgba(37,99,235,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </>)}

          {/* Price + Currency + Delivery */}
          {fieldCard(<>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', gap: 14 }}>
              <div>
                {label('Prix', true)}
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inp, paddingLeft: 32 }}
                    type="number" min={1} step={0.01}
                    value={form.price}
                    onChange={e => set('price', e.target.value)}
                    placeholder="0.00"
                    onFocus={e => (e.target.style.borderColor = 'rgba(37,99,235,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 13 }}>$</span>
                </div>
              </div>
              <div>
                {label('Devise')}
                <select
                  style={{ ...inp, cursor: 'pointer' }}
                  value={form.currency}
                  onChange={e => set('currency', e.target.value)}
                >
                  {['CAD', 'USD', 'EUR', 'TND'].map(c => (
                    <option key={c} value={c} style={{ background: '#0f172a', color: '#f1f5f9' }}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                {label('Délai de livraison', true)}
                <select
                  style={{ ...inp, cursor: 'pointer' }}
                  value={form.delivery}
                  onChange={e => set('delivery', e.target.value)}
                >
                  <option value="" style={{ background: '#0f172a', color: '#64748b' }}>Choisir...</option>
                  {DELIVERY_OPTIONS.map(d => (
                    <option key={d} value={d} style={{ background: '#0f172a', color: '#f1f5f9' }}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price preview */}
            {form.price && Number(form.price) > 0 && (
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Prix affiché</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#3b82f6' }}>
                  {Number(form.price).toLocaleString('fr-CA', { style: 'currency', currency: form.currency || 'CAD' })}
                </span>
              </div>
            )}
          </>)}

          {/* Images */}
          {fieldCard(<>
            {label('Images du service')}
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  style={{ ...inp, paddingLeft: 38 }}
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); setImageError(''); }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  placeholder="https://exemple.com/image.jpg"
                  onFocus={e => (e.target.style.borderColor = 'rgba(37,99,235,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔗</span>
              </div>
              <button
                type="button"
                onClick={addImage}
                disabled={!imageUrl.trim()}
                style={{
                  padding: '11px 18px', borderRadius: 10, border: 'none', cursor: imageUrl.trim() ? 'pointer' : 'not-allowed',
                  background: imageUrl.trim() ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(255,255,255,0.06)',
                  color: imageUrl.trim() ? '#fff' : '#475569', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                + Ajouter
              </button>
            </div>

            {imageError && (
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#ef4444' }}>{imageError}</p>
            )}

            {form.images.length === 0 ? (
              <div style={{ padding: '16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>Aucune image — collez une URL ci-dessus (optionnel, max 5)</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {form.images.map((url, i) => (
                  <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '2px solid rgba(37,99,235,0.4)' }}
                      onError={e => ((e.target as HTMLImageElement).style.opacity = '0.3')} />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                        borderRadius: '50%', border: '2px solid #09090B', background: '#ef4444', color: '#fff',
                        cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >×</button>
                    {i === 0 && (
                      <span style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', background: '#2563eb', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                        Principale
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>)}

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <p style={{ margin: 0, fontSize: 13, color: '#fca5a5' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '15px', borderRadius: 12, border: 'none',
              background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: loading ? '#475569' : '#fff', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 24px rgba(37,99,235,0.4)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Publication en cours...
              </>
            ) : (
              <>🚀 Publier mon service</>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        select option { background: #0f172a !important; color: #f1f5f9 !important; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
    </div>
  );
}
