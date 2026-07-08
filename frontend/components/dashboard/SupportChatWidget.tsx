'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.subject || !form.message) return;
    setStatus('sending');
    try {
      await api.support.submit(form);
      setStatus('success');
      setForm({ name: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(o => !o); setStatus('idle'); }}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        title="Support 24h/7j"
      >
        {open ? (
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, zIndex: 9998,
          width: 340, borderRadius: 16,
          background: '#0d1526',
          border: '1px solid rgba(99,102,241,0.3)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Support GoConnexion</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
              Réponse sous 24h — Disponible 7j/7
            </div>
          </div>

          {status === 'success' ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <div style={{ color: '#a5b4fc', fontWeight: 600, marginBottom: 6 }}>Message envoyé !</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>
                Notre équipe vous répondra dans les 24h.
              </div>
              <button
                onClick={() => setStatus('idle')}
                style={{
                  marginTop: 20, padding: '8px 20px', borderRadius: 8,
                  background: '#6366f1', border: 'none', color: '#fff',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}
              >
                Nouveau ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Votre nom</label>
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: '#1a2540', border: '1px solid #2d3a55',
                    color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Sujet</label>
                <input
                  type="text"
                  placeholder="Quel est votre problème ?"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: '#1a2540', border: '1px solid #2d3a55',
                    color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Message</label>
                <textarea
                  placeholder="Décrivez votre problème en détail..."
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  required
                  rows={4}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: '#1a2540', border: '1px solid #2d3a55',
                    color: '#e2e8f0', fontSize: 13, outline: 'none',
                    resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>
              {status === 'error' && (
                <div style={{ color: '#f87171', fontSize: 12 }}>
                  Erreur d'envoi. Veuillez réessayer.
                </div>
              )}
              <button
                type="submit"
                disabled={status === 'sending'}
                style={{
                  padding: '10px', borderRadius: 8,
                  background: status === 'sending' ? '#4b5563' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', color: '#fff', fontWeight: 600, fontSize: 14,
                  cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                {status === 'sending' ? 'Envoi...' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
