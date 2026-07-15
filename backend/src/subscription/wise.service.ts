import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface WiseAccountDetails {
  currency: string;
  accountHolderName: string;
  details: Record<string, string>;
}

export interface WiseBalance {
  currency: string;
  amount: { value: number; currency: string };
}

export interface WiseCreditEvent {
  data: {
    resource: {
      id: number;
      profile_id: number;
      type: string;
    };
    amount: number;
    currency: string;
    transaction_type: string;
    reference_number: string;
    running_balance: { amount: number; currency: string };
  };
  event_type: string;
  schema_version: string;
  sent_at: string;
}

@Injectable()
export class WiseService {
  private readonly logger = new Logger(WiseService.name);
  private readonly apiUrl = 'https://api.transferwise.com';
  private readonly apiToken = process.env.WISE_API_TOKEN;
  private readonly profileId = process.env.WISE_PROFILE_ID;
  private readonly webhookPublicKey = process.env.WISE_WEBHOOK_PUBLIC_KEY;

  isConfigured(): boolean {
    return !!(this.apiToken && this.profileId);
  }

  generateReference(userId: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const short = userId.slice(0, 8);
    return `WC-${short}-${timestamp}`;
  }

  getAccountDetails(currency?: string): WiseAccountDetails {
    return {
      currency: process.env.WISE_CURRENCY ?? currency ?? 'CAD',
      accountHolderName: process.env.WISE_ACCOUNT_HOLDER ?? 'GoConnexion',
      details: {
        email: process.env.WISE_ACCOUNT_EMAIL ?? '',
        note: `Envoyez vers le compte Wise : ${process.env.WISE_ACCOUNT_EMAIL ?? ''}`,
      },
    };
  }

  async getBalances(): Promise<WiseBalance[]> {
    if (!this.isConfigured()) return [];

    try {
      const response = await fetch(
        `${this.apiUrl}/v4/profiles/${this.profileId}/balances?types=STANDARD`,
        {
          headers: { Authorization: `Bearer ${this.apiToken}` },
        },
      );

      if (!response.ok) throw new Error(`Wise API error: ${response.status}`);
      return response.json();
    } catch (error) {
      this.logger.error('Failed to fetch Wise balances', error);
      return [];
    }
  }

  verifyWebhookSignature(payload: Buffer, signature: string): boolean {
    const keyIsSet = this.webhookPublicKey &&
      !this.webhookPublicKey.includes('REMPLACE') &&
      !this.webhookPublicKey.includes('placeholder');

    if (!keyIsSet) {
      this.logger.warn('WISE_WEBHOOK_PUBLIC_KEY non configurée — vérification de signature ignorée (sandbox)');
      return true;
    }

    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(payload);
      return verify.verify(this.webhookPublicKey, signature, 'base64');
    } catch (error) {
      this.logger.error('Wise webhook signature verification failed', error);
      return false;
    }
  }

  extractReferenceFromEvent(event: WiseCreditEvent): string | null {
    return event?.data?.reference_number ?? null;
  }

  extractAmountFromEvent(event: WiseCreditEvent): { amount: number; currency: string } | null {
    if (!event?.data?.amount || !event?.data?.currency) return null;
    return { amount: event.data.amount, currency: event.data.currency };
  }

  private getMockAccountDetails(currency: string): WiseAccountDetails {
    return {
      currency,
      accountHolderName: 'GoConnexion Inc.',
      details: {
        IBAN: 'BE89 3751 0000 0000',
        BIC: 'TRWIBEB1XXX',
        bankName: 'Wise Europe SA',
        accountNumber: '0000000000',
        sortCode: '',
        note: 'Sandbox — configure WISE_API_TOKEN pour les vraies coordonnées',
      },
    };
  }
}
