import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { getFrontendUrl } from '../common/frontend-url';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY ?? '';
    this.resend = new Resend(apiKey || 're_placeholder');
    this.from = process.env.MAIL_FROM ?? 'GoConnexions <no-reply@goconnexions.com>';

    if (!this.isConfigured()) {
      this.logger.warn('⚠️  RESEND_API_KEY non configurée — emails en mode log seulement');
    }
  }

  private isConfigured(): boolean {
    const key = process.env.RESEND_API_KEY ?? '';
    return key.startsWith('re_') && !key.includes('REMPLACE');
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.log(`[MAIL] À: ${to} | Sujet: ${subject}`);
      return;
    }
    try {
      const { error } = await this.resend.emails.send({ from: this.from, to, subject, html });
      if (error) throw error;
      this.logger.log(`Email envoyé à ${to}: ${subject}`);
    } catch (err) {
      this.logger.error(`Échec envoi email à ${to}: ${err}`);
    }
  }

  // ── API publique ──────────────────────────────────────────────────────────

  async sendWelcome(user: { email: string; firstName: string }): Promise<void> {
    const dashboardUrl = `${getFrontendUrl()}/dashboard`;
    await this.send(
      user.email,
      'Bienvenue sur GoConnexions 🚀',
      this.wrap(`
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a">
          Bienvenue, ${this.esc(user.firstName)} !
        </h1>
        <p style="margin:0 0 16px;color:#475569">
          Ton compte GoConnexions est créé. Tu peux dès maintenant explorer le réseau,
          postuler à des projets et te connecter avec des entrepreneurs et freelancers.
        </p>
        <p style="margin:0 0 24px;color:#475569">
          Commence par compléter ton profil pour maximiser ta visibilité.
        </p>
        ${this.btn('Accéder à mon tableau de bord', dashboardUrl)}
      `),
    );
  }

  async sendEmailVerification(
    user: { email: string; firstName: string },
    token: string,
  ): Promise<void> {
    const url = `${getFrontendUrl()}/auth/verify-email?token=${token}`;
    await this.send(
      user.email,
      'Confirme ton adresse email — GoConnexions',
      this.wrap(`
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a">
          Confirme ton email
        </h1>
        <p style="margin:0 0 16px;color:#475569">
          Salut ${this.esc(user.firstName)}, clique sur le bouton ci-dessous pour vérifier
          ton adresse email. Ce lien expire dans <strong>24 heures</strong>.
        </p>
        ${this.btn('Vérifier mon email', url)}
        <p style="margin:24px 0 0;font-size:13px;color:#94a3b8">
          Si tu n'as pas créé de compte GoConnexions, ignore cet email.
        </p>
      `),
    );
  }

  async sendPasswordReset(
    user: { email: string; firstName: string },
    token: string,
  ): Promise<void> {
    const url = `${getFrontendUrl()}/auth/reset-password?token=${token}`;
    await this.send(
      user.email,
      'Réinitialisation de ton mot de passe — GoConnexions',
      this.wrap(`
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a">
          Réinitialisation du mot de passe
        </h1>
        <p style="margin:0 0 16px;color:#475569">
          Salut ${this.esc(user.firstName)}, une demande de réinitialisation de mot de passe
          a été faite pour ton compte. Clique sur le bouton ci-dessous —
          ce lien expire dans <strong>1 heure</strong>.
        </p>
        ${this.btn('Réinitialiser mon mot de passe', url, '#dc2626')}
        <p style="margin:24px 0 0;font-size:13px;color:#94a3b8">
          Si tu n'as pas demandé cette réinitialisation, ignore cet email.
          Ton mot de passe ne sera pas modifié.
        </p>
      `),
    );
  }

  async sendSubscriptionActivated(
    user: { email: string; firstName: string },
    plan: string,
    periodEnd: Date,
  ): Promise<void> {
    const endDate = periodEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const dashboardUrl = `${getFrontendUrl()}/dashboard`;
    await this.send(
      user.email,
      `Abonnement ${plan} activé — GoConnexions`,
      this.wrap(`
        <div style="text-align:center;margin-bottom:24px">
          <span style="display:inline-block;background:#dcfce7;color:#166534;padding:6px 16px;
                        border-radius:9999px;font-size:14px;font-weight:600">
            ✓ Abonnement activé
          </span>
        </div>
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a;text-align:center">
          Bienvenue dans le plan ${this.esc(plan)} !
        </h1>
        <p style="margin:0 0 16px;color:#475569;text-align:center">
          Félicitations ${this.esc(user.firstName)} ! Ton abonnement <strong>${this.esc(plan)}</strong>
          est maintenant actif jusqu'au <strong>${endDate}</strong>.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
                    padding:20px;margin:20px 0;text-align:center">
          <p style="margin:0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em">
            Prochain renouvellement
          </p>
          <p style="margin:8px 0 0;font-size:18px;font-weight:700;color:#0f172a">${endDate}</p>
        </div>
        ${this.btn('Accéder à mon espace', dashboardUrl)}
      `),
    );
  }

  async sendSubscriptionCancelled(
    user: { email: string; firstName: string },
    plan: string,
    periodEnd: Date,
  ): Promise<void> {
    const endDate = periodEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const pricingUrl = `${getFrontendUrl()}/pricing`;
    await this.send(
      user.email,
      `Abonnement ${plan} annulé`,
      this.wrap(`
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a">
          Abonnement annulé
        </h1>
        <p style="margin:0 0 16px;color:#475569">
          Salut ${this.esc(user.firstName)}, ton abonnement <strong>${this.esc(plan)}</strong> a été annulé.
          Tu conserves l'accès à toutes les fonctionnalités jusqu'au <strong>${endDate}</strong>.
        </p>
        <p style="margin:0 0 24px;color:#475569">
          Après cette date, ton compte passera automatiquement au plan Gratuit.
        </p>
        ${this.btn('Réactiver mon abonnement', pricingUrl)}
      `),
    );
  }

  async sendPaymentFailed(
    user: { email: string; firstName: string },
    plan: string,
  ): Promise<void> {
    const checkoutUrl = `${getFrontendUrl()}/billing/checkout`;
    await this.send(
      user.email,
      '⚠️ Échec de paiement — GoConnexions',
      this.wrap(`
        <div style="text-align:center;margin-bottom:24px">
          <span style="display:inline-block;background:#fef2f2;color:#991b1b;padding:6px 16px;
                        border-radius:9999px;font-size:14px;font-weight:600">
            ⚠️ Paiement échoué
          </span>
        </div>
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a">
          Problème avec ton paiement
        </h1>
        <p style="margin:0 0 16px;color:#475569">
          Salut ${this.esc(user.firstName)}, nous n'avons pas pu débiter le paiement
          pour ton abonnement <strong>${this.esc(plan)}</strong>.
          Pour éviter l'interruption de ton service, merci de mettre à jour
          tes informations de paiement.
        </p>
        ${this.btn('Mettre à jour mon paiement', checkoutUrl, '#dc2626')}
        <p style="margin:24px 0 0;font-size:13px;color:#94a3b8">
          Si tu penses qu'il s'agit d'une erreur, contacte-nous à support@goconnexions.com
        </p>
      `),
    );
  }

  async sendWiseRenewalReminder(
    user: { email: string; firstName: string },
    amount: number,
    currency: string,
    reference: string,
    periodEnd: Date,
    accountDetails: { accountHolderName: string; details: Record<string, string> },
  ): Promise<void> {
    const endDate = periodEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const detailRows = Object.entries(accountDetails.details)
      .filter(([, v]) => v)
      .map(([k, v]) => `
        <tr>
          <td style="padding:8px 12px;color:#64748b;font-size:13px;white-space:nowrap">${this.esc(k)}</td>
          <td style="padding:8px 12px;color:#0f172a;font-size:13px;font-weight:600">${this.esc(v)}</td>
        </tr>
      `)
      .join('');

    await this.send(
      user.email,
      `Renouvellement de ton abonnement — Réf. ${reference}`,
      this.wrap(`
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a">
          Ton abonnement expire bientôt
        </h1>
        <p style="margin:0 0 20px;color:#475569">
          Salut ${this.esc(user.firstName)}, ton abonnement GoConnexions expire le
          <strong>${endDate}</strong>. Effectue un virement avec les informations ci-dessous
          pour continuer à bénéficier de tous tes avantages.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 20px">
          <div style="background:#0f172a;padding:12px 16px">
            <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:.08em">
              Référence obligatoire
            </p>
            <p style="margin:4px 0 0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:.05em">
              ${this.esc(reference)}
            </p>
          </div>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:8px 12px;color:#64748b;font-size:13px">Bénéficiaire</td>
              <td style="padding:8px 12px;color:#0f172a;font-size:13px;font-weight:600">
                ${this.esc(accountDetails.accountHolderName)}
              </td>
            </tr>
            ${detailRows}
            <tr style="background:#f0fdf4">
              <td style="padding:8px 12px;color:#166534;font-size:13px;font-weight:600">Montant</td>
              <td style="padding:8px 12px;color:#166534;font-size:15px;font-weight:700">
                ${amount} ${this.esc(currency)}
              </td>
            </tr>
          </table>
        </div>

        <p style="margin:0;font-size:13px;color:#94a3b8">
          ⚠️ La référence de virement est <strong>obligatoire</strong> pour identifier
          ton paiement automatiquement.
        </p>
      `),
    );
  }

  async sendSupportTicket(data: {
    fromName: string;
    fromEmail: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const adminEmail = process.env.SUPPORT_EMAIL ?? 'chedysoltani0@gmail.com';
    await this.send(
      adminEmail,
      `[Support] ${this.esc(data.subject)} — de ${this.esc(data.fromName)}`,
      this.wrap(`
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a">
          Nouveau ticket de support
        </h1>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:0 0 20px">
          <p style="margin:0 0 8px;font-size:13px;color:#64748b">
            <strong>De :</strong> ${this.esc(data.fromName)} &lt;${this.esc(data.fromEmail)}&gt;
          </p>
          <p style="margin:0;font-size:13px;color:#64748b">
            <strong>Sujet :</strong> ${this.esc(data.subject)}
          </p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
          <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.6;white-space:pre-wrap">${this.esc(data.message)}</p>
        </div>
      `),
    );
  }

  async sendBusinessCardInvitation(
    senderName: string,
    recipientEmail: string,
  ): Promise<void> {
    const signupUrl = `${getFrontendUrl()}/auth/signup`;
    await this.send(
      recipientEmail,
      `${this.esc(senderName)} vous envoie sa carte de visite — GoConnexions`,
      this.wrap(`
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a">
          Vous avez reçu une carte de visite
        </h1>
        <p style="margin:0 0 16px;color:#475569">
          <strong>${this.esc(senderName)}</strong> vous a envoyé sa carte de visite professionnelle
          via GoConnexions, la plateforme de mise en relation entre freelancers et entrepreneurs.
        </p>
        <p style="margin:0 0 24px;color:#475569">
          Rejoignez GoConnexions pour accepter cette invitation et développer votre réseau professionnel.
        </p>
        ${this.btn('Voir la carte de visite', signupUrl)}
        <p style="margin:24px 0 0;font-size:13px;color:#94a3b8">
          Si vous ne souhaitez pas créer de compte, ignorez cet email.
        </p>
      `),
    );
  }

  // ── Événements ────────────────────────────────────────────────────────────

  async sendEventTicket(
    user: { email: string; firstName: string },
    event: { title: string; startDate: Date; location?: string | null; address?: string | null },
    ticketCode: string,
    ticketType?: { name: string; price: number; currency: string } | null,
    booth?: { number: string; type: string } | null,
  ): Promise<void> {
    const base = getFrontendUrl();
    const ticketUrl = `${base}/events/ticket/${ticketCode}`;
    const date = new Date(event.startDate).toLocaleDateString('fr-CA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const lieu = event.address ?? event.location ?? 'À confirmer';

    await this.send(
      user.email,
      `Votre billet — ${this.esc(event.title)}`,
      this.wrap(`
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a">
          Votre billet est confirmé ✅
        </h1>
        <p style="margin:0 0 24px;color:#475569">Bonjour ${this.esc(user.firstName)}, votre inscription est validée.</p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin:0 0 24px">
          <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#0f172a">${this.esc(event.title)}</p>
          <p style="margin:0 0 4px;font-size:13px;color:#64748b">📅 ${this.esc(date)}</p>
          <p style="margin:0 0 0;font-size:13px;color:#64748b">📍 ${this.esc(lieu)}</p>
          ${ticketType ? `<p style="margin:8px 0 0;font-size:13px;color:#3b82f6;font-weight:600">🎫 ${this.esc(ticketType.name)} — ${ticketType.price === 0 ? 'Gratuit' : `${ticketType.price} ${this.esc(ticketType.currency)}`}</p>` : ''}
          ${booth ? `<p style="margin:4px 0 0;font-size:13px;color:#7c3aed;font-weight:600">🏪 Stand ${this.esc(booth.number)} (${this.esc(booth.type)})</p>` : ''}
        </div>

        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:16px;margin:0 0 24px;text-align:center">
          <p style="margin:0 0 4px;font-size:12px;color:#0369a1;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Code billet</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;font-family:monospace">${this.esc(ticketCode)}</p>
        </div>

        ${this.btn('Afficher mon billet + QR code', ticketUrl, '#3b82f6')}
        <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center">
          Présentez ce QR code à l'entrée de l'événement.
        </p>
      `),
    );
  }

  async sendEventReminder(
    user: { email: string; firstName: string },
    event: { title: string; startDate: Date; location?: string | null; address?: string | null },
    ticketCode: string,
  ): Promise<void> {
    const base = getFrontendUrl();
    const ticketUrl = `${base}/events/ticket/${ticketCode}`;
    const date = new Date(event.startDate).toLocaleDateString('fr-CA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const lieu = event.address ?? event.location ?? 'À confirmer';

    await this.send(
      user.email,
      `Rappel — ${this.esc(event.title)} commence demain`,
      this.wrap(`
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a">
          C'est demain ! 🗓️
        </h1>
        <p style="margin:0 0 24px;color:#475569">
          Bonjour ${this.esc(user.firstName)}, voici un rappel pour votre événement de demain.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin:0 0 24px">
          <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#0f172a">${this.esc(event.title)}</p>
          <p style="margin:0 0 4px;font-size:13px;color:#64748b">📅 ${this.esc(date)}</p>
          <p style="margin:0 0 0;font-size:13px;color:#64748b">📍 ${this.esc(lieu)}</p>
        </div>

        ${this.btn('Voir mon billet', ticketUrl, '#0f172a')}
        <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center">
          N'oubliez pas votre code QR à l'entrée.
        </p>
      `),
    );
  }

  async sendBoothReservationConfirmation(
    user: { email: string; firstName: string },
    event: { title: string; startDate: Date; location?: string | null; address?: string | null },
    booth: { number: string; type: string; price: number; currency: string; surface?: number | null; description?: string | null },
  ): Promise<void> {
    const base = getFrontendUrl();
    const eventsUrl = `${base}/dashboard`;
    const date = new Date(event.startDate).toLocaleDateString('fr-CA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const lieu = event.address ?? event.location ?? 'À confirmer';

    await this.send(
      user.email,
      `Confirmation de stand — ${this.esc(event.title)}`,
      this.wrap(`
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a">
          Votre stand est réservé 🏪
        </h1>
        <p style="margin:0 0 24px;color:#475569">
          Bonjour ${this.esc(user.firstName)}, votre stand au salon est confirmé.
        </p>

        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:20px;margin:0 0 16px">
          <p style="margin:0 0 4px;font-size:13px;color:#7c3aed;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Votre stand</p>
          <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#0f172a">Stand ${this.esc(booth.number)}</p>
          <p style="margin:0 0 2px;font-size:13px;color:#64748b">Type : ${this.esc(booth.type)}</p>
          ${booth.surface ? `<p style="margin:0 0 2px;font-size:13px;color:#64748b">Surface : ${booth.surface} m²</p>` : ''}
          <p style="margin:0 0 0;font-size:14px;font-weight:700;color:#7c3aed">${booth.price} ${this.esc(booth.currency)}</p>
          ${booth.description ? `<p style="margin:8px 0 0;font-size:13px;color:#64748b">${this.esc(booth.description)}</p>` : ''}
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:0 0 24px">
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0f172a">${this.esc(event.title)}</p>
          <p style="margin:0 0 2px;font-size:13px;color:#64748b">📅 ${this.esc(date)}</p>
          <p style="margin:0;font-size:13px;color:#64748b">📍 ${this.esc(lieu)}</p>
        </div>

        ${this.btn('Voir mes événements', eventsUrl, '#7c3aed')}
        <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center">
          Conservez cet email comme preuve de réservation.
        </p>
      `),
    );
  }

  // ── Helpers privés ────────────────────────────────────────────────────────

  private btn(label: string, url: string, color = '#3b82f6'): string {
    return `
      <div style="text-align:center;margin:24px 0">
        <a href="${url}"
           style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;
                  padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;
                  letter-spacing:-.01em">
          ${label}
        </a>
      </div>
    `;
  }

  private esc(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private wrap(content: string): string {
    const year = new Date().getFullYear();
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>GoConnexions</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:24px 32px;border-radius:12px 12px 0 0">
              <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-.02em">
                Go<span style="color:#3b82f6">Connexions</span>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;border:1px solid #e2e8f0;border-top:none;
                        border-radius:0 0 12px 12px;text-align:center">
              <p style="margin:0;font-size:12px;color:#94a3b8">
                © ${year} GoConnexions &mdash;
                Tu reçois cet email car tu es inscrit(e) sur la plateforme.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
