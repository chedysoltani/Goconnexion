'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types/auth';

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  type: string;
  placement: string;
  isActive: boolean;
  budget: number;
  impressions: number;
  clicks: number;
  createdAt: string;
}

interface AdsPageProps {
  user: User | null;
}

export default function AdsPage({ user }: AdsPageProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [adType, setAdType] = useState<'COMPANY' | 'EVENT' | 'SERVICE'>('COMPANY');
  const [placement, setPlacement] = useState<'FEED' | 'SIDEBAR' | 'TOP'>('FEED');
  const [budget, setBudget] = useState('');

  const fetchAds = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.advertisements.mine();
      setAds(data);
    } catch {
      setAds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const isPremium = user?.plan && user.plan !== 'FREE';
  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
        <div className="text-5xl mb-5">📢</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Module Publicités</h2>
        <p className="text-slate-500 text-sm max-w-xs mb-6">Créez des annonces sponsorisées visibles par toute la communauté. Disponible à partir du plan <strong>PRO</strong>.</p>
        <a href="/pricing" className="px-6 py-3 rounded-2xl text-sm font-bold text-white" style={{background:'linear-gradient(135deg,#f59e0b,#d97706)'}}>
          Voir les offres →
        </a>
      </div>
    );
  }

  const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetUrl.trim()) return;
    const normalizedUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    setIsSubmitting(true);
    try {
      await api.advertisements.create({
        title,
        description,
        imageUrl: imageUrl || undefined,
        targetUrl: normalizedUrl,
        type: adType,
        placement,
        budget: parseFloat(budget) || 0,
      });
      setTitle('');
      setDescription('');
      setImageUrl('');
      setTargetUrl('');
      setPlacement('FEED');
      setBudget('');
      setShowModal(false);
      fetchAds();
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '13px',
    color: '#1a2332',
    background: '#f8fafc',
    outline: 'none',
  };

  return (
    <div className="max-w-5xl mx-auto p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Publicités</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gérez vos annonces sponsorisées</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Créer une annonce
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 flex-shrink-0">
        {[
          { label: 'Total annonces', value: ads.length, color: '#f59e0b' },
          { label: 'Total impressions', value: totalImpressions.toLocaleString('fr-FR'), color: '#3b82f6' },
          { label: 'Total clics', value: totalClicks.toLocaleString('fr-FR'), color: '#2563eb' },
          { label: 'CTR', value: `${ctr}%`, color: '#8b5cf6' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <p className="text-2xl font-black mb-1" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">📢</div>
            <h3 className="text-base font-bold text-slate-700 mb-2">Aucune annonce créée</h3>
            <p className="text-sm text-slate-400 max-w-xs mb-6">Créez votre première annonce sponsorisée pour toucher votre audience.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
            >
              Créer une annonce
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map(ad => {
              const adCtr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
              const status = ad.isActive
                ? { label: 'Actif', bg: '#dbeafe', color: '#1e3a8a' }
                : { label: 'Inactif', bg: '#f1f5f9', color: '#475569' };
              return (
                <div key={ad.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{ad.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ad.description}</p>
                    </div>
                    <span
                      className="flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: status.bg, color: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-slate-500 border-t border-slate-50 pt-3">
                    <div>
                      <span className="font-bold text-slate-700">{ad.impressions.toLocaleString('fr-FR')}</span>
                      <span className="ml-1">impressions</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">{ad.clicks.toLocaleString('fr-FR')}</span>
                      <span className="ml-1">clics</span>
                    </div>
                    <div>
                      <span className="font-bold" style={{ color: '#8b5cf6' }}>{adCtr}%</span>
                      <span className="ml-1">CTR</span>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{ad.placement}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <div className="px-6 py-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div>
                <h3 className="font-bold text-base text-white">Créer une annonce</h3>
                <p className="text-[11px] text-amber-100 mt-0.5">Configurez votre publicité sponsorisée</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Titre *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Titre de votre annonce"
                  required
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Décrivez votre annonce..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">URL de l'image (optionnel)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">URL de destination *</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  placeholder="https://votresite.com"
                  required
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Type d'annonce *</label>
                  <select
                    value={adType}
                    onChange={e => setAdType(e.target.value as 'COMPANY' | 'EVENT' | 'SERVICE')}
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <option value="COMPANY">Entreprise</option>
                    <option value="EVENT">Événement</option>
                    <option value="SERVICE">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Emplacement</label>
                  <select
                    value={placement}
                    onChange={e => setPlacement(e.target.value as 'FEED' | 'SIDEBAR' | 'TOP')}
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <option value="FEED">Fil d'activité</option>
                    <option value="SIDEBAR">Sidebar</option>
                    <option value="TOP">Bannière haut</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Budget (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="0.00"
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !targetUrl.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Création...</span>
                    </>
                  ) : (
                    <span>Publier l'annonce</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
