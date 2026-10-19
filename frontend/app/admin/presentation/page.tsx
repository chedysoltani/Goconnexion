'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, Check, ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import {
  ABOUT_KEY,
  ABOUT_TITLE,
  type AboutContent,
  type AboutOfferItem,
  type AboutTeamMember,
  parseAboutContent,
} from '@/lib/site-content/about';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400';

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-6 mb-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h2>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Édition de la page /a-propos (clé SiteContent "about") — accessible à ADMIN et EDITOR.
export default function AdminPresentationPage() {
  const [title, setTitle] = useState(ABOUT_TITLE);
  const [content, setContent] = useState<AboutContent | null>(null);
  const [updatedInfo, setUpdatedInfo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.siteContent
      .getForEditor(ABOUT_KEY)
      .then((data) => {
        setTitle(data?.title || ABOUT_TITLE);
        setContent(parseAboutContent(data?.content));
        setUpdatedInfo(describeUpdate(data));
      })
      .catch(() => {
        // Contenu absent (migration non appliquée) : on part du texte par défaut
        setContent(parseAboutContent(null));
      });
  }, []);

  if (!content) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  const patch = (p: Partial<AboutContent>) => {
    setContent({ ...content, ...p });
    setSaved(false);
  };
  const patchOffer = (i: number, p: Partial<AboutOfferItem>) =>
    patch({ offer: content.offer.map((o, idx) => (idx === i ? { ...o, ...p } : o)) });
  const patchTeam = (i: number, p: Partial<AboutTeamMember>) =>
    patch({ team: content.team.map((m, idx) => (idx === i ? { ...m, ...p } : m)) });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const data = await api.siteContent.update(ABOUT_KEY, { title: title.trim(), content });
      setContent(parseAboutContent(data?.content));
      setUpdatedInfo(describeUpdate(data));
      setSaved(true);
    } catch (err: any) {
      setError(err?.message || 'Échec de l’enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3 mb-6">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg,#0d9488,#3b82f6)' }}
          >
            <Building2 size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-800">Présentation de l’entreprise</h1>
            <p className="text-sm text-slate-500">
              Textes de la page À propos. {updatedInfo && <span className="text-slate-400">{updatedInfo}</span>}
            </p>
          </div>
          <Link
            href="/a-propos"
            target="_blank"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600"
          >
            Voir la page <ExternalLink size={14} />
          </Link>
        </motion.div>

        <p className="text-xs text-slate-400 mb-5">
          Texte brut uniquement. Laissez une ligne vide pour séparer les paragraphes. Les modifications sont visibles sur le
          site en quelques minutes.
        </p>

        <Section title="Titre de la page">
          <input className={inputClass} value={title} maxLength={200} onChange={(e) => { setTitle(e.target.value); setSaved(false); }} />
        </Section>

        <Section title="Introduction" hint="Paragraphe d’ouverture, en haut de la page.">
          <textarea className={inputClass} rows={4} maxLength={3000} value={content.intro} onChange={(e) => patch({ intro: e.target.value })} />
        </Section>

        <Section title="Notre mission">
          <textarea className={inputClass} rows={6} maxLength={5000} value={content.mission} onChange={(e) => patch({ mission: e.target.value })} />
        </Section>

        <Section title="Notre histoire">
          <textarea className={inputClass} rows={6} maxLength={5000} value={content.history} onChange={(e) => patch({ history: e.target.value })} />
        </Section>

        <Section title="Activités : ce que vous trouverez sur GoConnexions" hint="Chaque ligne : un intitulé en gras, puis sa description.">
          <div className="space-y-2">
            {content.offer.map((o, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2">
                <input className={`${inputClass} sm:w-56 font-semibold`} placeholder="Intitulé" maxLength={120} value={o.label} onChange={(e) => patchOffer(i, { label: e.target.value })} />
                <input className={inputClass} placeholder="Description" maxLength={300} value={o.text} onChange={(e) => patchOffer(i, { text: e.target.value })} />
                <button
                  type="button"
                  onClick={() => patch({ offer: content.offer.filter((_, idx) => idx !== i) })}
                  className="self-end sm:self-auto p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                  aria-label="Supprimer cette activité"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          {content.offer.length < 12 && (
            <button
              type="button"
              onClick={() => patch({ offer: [...content.offer, { label: '', text: '' }] })}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <Plus size={15} /> Ajouter une activité
            </button>
          )}
        </Section>

        <Section title="L’équipe">
          <div className="space-y-2">
            {content.team.map((m, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2">
                <input className={inputClass} placeholder="Nom" maxLength={100} value={m.name} onChange={(e) => patchTeam(i, { name: e.target.value })} />
                <input className={inputClass} placeholder="Rôle" maxLength={100} value={m.role} onChange={(e) => patchTeam(i, { role: e.target.value })} />
                <input className={`${inputClass} sm:w-24`} placeholder="Initiales" maxLength={4} value={m.initials} onChange={(e) => patchTeam(i, { initials: e.target.value })} />
                <button
                  type="button"
                  onClick={() => patch({ team: content.team.filter((_, idx) => idx !== i) })}
                  className="self-end sm:self-auto p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                  aria-label="Retirer ce membre"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          {content.team.length < 12 && (
            <button
              type="button"
              onClick={() => patch({ team: [...content.team, { name: '', role: '', initials: '' }] })}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <Plus size={15} /> Ajouter un membre
            </button>
          )}
        </Section>

        <div className="sticky bottom-4 flex items-center justify-end gap-3 bg-white/90 backdrop-blur rounded-2xl border border-slate-100 p-3" style={{ boxShadow: 'var(--shadow-md, 0 4px 12px rgba(15,23,42,0.08))' }}>
          {error && <p className="text-sm text-red-500 mr-auto">{error}</p>}
          {saved && !error && (
            <p className="text-sm text-teal-600 mr-auto flex items-center gap-1.5">
              <Check size={15} /> Enregistré
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)' }}
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function describeUpdate(data: any): string | null {
  if (!data?.updatedAt) return null;
  const date = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.updatedAt));
  const who = data.updatedBy ? ` par ${data.updatedBy.firstName} ${data.updatedBy.lastName}` : '';
  return `Dernière modification le ${date}${who}.`;
}
