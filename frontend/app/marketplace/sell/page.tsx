'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const CATEGORIES = [
  { id: 'TECH',         label: 'Tech & Développement' },
  { id: 'DESIGN',       label: 'Design & Créatif' },
  { id: 'MARKETING',    label: 'Marketing & Communication' },
  { id: 'COMPTABILITE', label: 'Comptabilité & Finance' },
  { id: 'COACHING',     label: 'Coaching & Conseil' },
  { id: 'JURIDIQUE',    label: 'Juridique & Légal' },
  { id: 'FORMATION',    label: 'Formation & Éducation' },
  { id: 'TRADUCTION',   label: 'Traduction & Langues' },
  { id: 'SANTE',        label: 'Santé & Bien-être' },
  { id: 'AUTRE',        label: 'Autre' },
];

const DELIVERY_OPTIONS = [
  '1 jour', '2-3 jours', '1 semaine', '2 semaines', '1 mois', 'À définir',
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
};

export default function SellPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'CAD',
    category: '',
    delivery: '',
    images: [] as string[],
  });

  useEffect(() => {
    api.auth.me().then(() => setAuthenticated(true)).catch(() => {
      setAuthenticated(false);
      router.push('/auth/login');
    });
  }, [router]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setForm(f => ({ ...f, images: [...f.images, imageUrl.trim()] }));
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
    if (Number(form.price) <= 0) {
      setError('Le prix doit être supérieur à 0');
      return;
    }
    setLoading(true);
    try {
      const svc = await api.marketplace.createService({
        ...form,
        price: Number(form.price),
      });
      router.push(`/marketplace/${svc.id}`);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (authenticated === null) return (
    <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      Vérification...
    </div>
  );

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

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>Publier un service</h1>
        <p style={{ color: '#64748b', margin: '0 0 32px', fontSize: 14 }}>
          Proposez vos compétences à la communauté GoConnexions et commencez à recevoir des commandes.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Titre du service *</label>
            <input
              style={inputStyle}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Ex: Développement d'un site web Next.js..."
              maxLength={100}
            />
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#475569' }}>{form.title.length}/100</p>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Catégorie *</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.category}
              onChange={e => set('category', e.target.value)}
            >
              <option value="">Sélectionner une catégorie</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Décrivez en détail ce que vous proposez, ce qui est inclus, votre méthode de travail..."
            />
          </div>

          {/* Price + Currency row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 2 }}>
              <label style={labelStyle}>Prix *</label>
              <input
                style={inputStyle}
                type="number"
                min={1}
                step={0.01}
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Devise</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option value="CAD">CAD $</option>
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
                <option value="TND">TND</option>
              </select>
            </div>
          </div>

          {/* Delivery */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Délai de livraison *</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.delivery} onChange={e => set('delivery', e.target.value)}>
              <option value="">Sélectionner un délai</option>
              {DELIVERY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Images */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Images (URLs) — optionnel</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
              />
              <button
                type="button"
                onClick={addImage}
                style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(37,99,235,0.4)', background: 'rgba(37,99,235,0.1)', color: '#3b82f6', cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}
              >
                + Ajouter
              </button>
            </div>
            {form.images.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {form.images.map((url, i) => (
                  <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute', top: -6, right: -6, width: 18, height: 18,
                        borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff',
                        cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: 'none',
              background: loading ? '#334155' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
            }}
          >
            {loading ? 'Publication en cours...' : 'Publier mon service'}
          </button>
        </form>
      </div>
    </div>
  );
}
