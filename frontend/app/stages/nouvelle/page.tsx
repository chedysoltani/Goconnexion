'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  StagesLayout, SkeletonList, DOMAINS, MODES, T,
  inputStyle, labelStyle, primaryBtn, secondaryBtn, cardStyle,
} from '@/components/stages/StagesShared';

const EMPTY_FORM = {
  title: '', companyName: '', domain: '', location: '', mode: 'ON_SITE',
  durationMonths: '', startDate: '', isPaid: false, skills: '', description: '',
};

function OfferForm() {
  const router = useRouter();
  const editId = useSearchParams().get('edit');
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editId) return;
    api.internships.get(editId)
      .then((o: any) => setForm({
        title: o.title, companyName: o.companyName, domain: o.domain, location: o.location ?? '',
        mode: o.mode, durationMonths: o.durationMonths ? String(o.durationMonths) : '',
        startDate: o.startDate ? o.startDate.slice(0, 10) : '', isPaid: o.isPaid,
        skills: (o.skills ?? []).join(', '), description: o.description,
      }))
      .catch(() => setError('Offre introuvable'))
      .finally(() => setLoading(false));
  }, [editId]);

  const set = (field: keyof typeof EMPTY_FORM, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.companyName.trim() || !form.domain || !form.description.trim()) {
      setError('Veuillez remplir les champs obligatoires (*).');
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      companyName: form.companyName.trim(),
      domain: form.domain,
      location: form.location.trim() || undefined,
      mode: form.mode,
      durationMonths: form.durationMonths ? Number(form.durationMonths) : undefined,
      startDate: form.startDate || undefined,
      isPaid: form.isPaid,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 20),
      description: form.description.trim(),
    };
    try {
      const offer = editId
        ? await api.internships.update(editId, payload)
        : await api.internships.create(payload);
      router.push(`/stages/${offer.id}`);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement");
      setSaving(false);
    }
  };

  if (loading) return <SkeletonList count={1} height={500} />;

  // Domaine hors liste (offre créée ailleurs) : on le garde sélectionnable
  const domains = form.domain && !DOMAINS.includes(form.domain) ? [...DOMAINS, form.domain] : DOMAINS;

  return (
    <>
    <h1 style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 900, margin: '0 0 6px' }}>
      {editId ? "Modifier l'offre de stage" : 'Publier une offre de stage'}
    </h1>
    <p style={{ margin: '0 0 24px', color: T.muted, fontSize: 14 }}>
      Votre offre sera visible publiquement. Vous serez averti par email à chaque candidature,
      et retrouverez les CV et messages dans « Mes offres ».
    </p>
    <form onSubmit={handleSubmit} style={{ ...cardStyle, padding: 'clamp(20px, 4vw, 32px)', display: 'grid', gap: 18 }}>
      <div>
        <label htmlFor="title" style={labelStyle}>Intitulé du stage *</label>
        <input id="title" value={form.title} onChange={e => set('title', e.target.value)} maxLength={150}
          placeholder="Ex. Stage développeur web React / Node.js" style={inputStyle} />
      </div>

      <div className="stages-form-grid">
        <div>
          <label htmlFor="companyName" style={labelStyle}>Entreprise *</label>
          <input id="companyName" value={form.companyName} onChange={e => set('companyName', e.target.value)} maxLength={150} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="domain" style={labelStyle}>Domaine *</label>
          <select id="domain" value={form.domain} onChange={e => set('domain', e.target.value)} style={inputStyle}>
            <option value="">Choisir un domaine</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="location" style={labelStyle}>Lieu</label>
          <input id="location" value={form.location} onChange={e => set('location', e.target.value)} maxLength={150}
            placeholder="Ex. Montréal, Tunis…" style={inputStyle} />
        </div>
        <div>
          <label htmlFor="mode" style={labelStyle}>Mode</label>
          <select id="mode" value={form.mode} onChange={e => set('mode', e.target.value)} style={inputStyle}>
            {MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="duration" style={labelStyle}>Durée (mois)</label>
          <input id="duration" type="number" min={1} max={24} value={form.durationMonths}
            onChange={e => set('durationMonths', e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="startDate" style={labelStyle}>Date de début</label>
          <input id="startDate" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark' }} />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#cbd5e1', cursor: 'pointer' }}>
        <input type="checkbox" checked={form.isPaid} onChange={e => set('isPaid', e.target.checked)} style={{ width: 16, height: 16 }} />
        Stage rémunéré
      </label>

      <div>
        <label htmlFor="skills" style={labelStyle}>Compétences recherchées (séparées par des virgules)</label>
        <input id="skills" value={form.skills} onChange={e => set('skills', e.target.value)}
          placeholder="Ex. React, SQL, Communication" style={inputStyle} />
      </div>

      <div>
        <label htmlFor="description" style={labelStyle}>Description *</label>
        <textarea id="description" value={form.description} onChange={e => set('description', e.target.value)} rows={8} maxLength={10000}
          placeholder="Missions, profil recherché, encadrement, conditions…" style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      {error && <p role="alert" style={{ margin: 0, fontSize: 13, color: '#f87171' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Link href={editId ? '/stages/mes-offres' : '/stages'} style={secondaryBtn}>Annuler</Link>
        <button type="submit" disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Enregistrement…' : editId ? 'Enregistrer les modifications' : "Publier l'offre"}
        </button>
      </div>
    </form>
    </>
  );
}

export default function NewStagePage() {
  return (
    <StagesLayout>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '28px 16px 60px' }}>
        <Suspense fallback={<SkeletonList count={1} height={500} />}>
          <OfferForm />
        </Suspense>
      </div>
    </StagesLayout>
  );
}
