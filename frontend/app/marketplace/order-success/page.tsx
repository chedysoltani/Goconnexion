'use client';

import React from 'react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f1f5f9', padding: 24 }}>
      <div style={{
        background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '48px 40px', maxWidth: 440, width: '100%', textAlign: 'center',
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 12px' }}>Commande confirmée !</h1>
        <p style={{ color: '#64748b', margin: '0 0 32px', lineHeight: 1.6, fontSize: 15 }}>
          Votre paiement a bien été reçu. Le vendeur a été notifié et vous contactera pour livrer votre service.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/dashboard?tab=marketplace" style={{
            display: 'block', padding: '12px', borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14,
          }}>
            Voir mes commandes
          </Link>
          <Link href="/marketplace" style={{
            display: 'block', padding: '12px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#94a3b8', textDecoration: 'none', fontSize: 14,
          }}>
            Retour à la marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
