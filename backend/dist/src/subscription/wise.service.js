"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var WiseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WiseService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let WiseService = WiseService_1 = class WiseService {
    logger = new common_1.Logger(WiseService_1.name);
    apiUrl = 'https://api.transferwise.com';
    apiToken = process.env.WISE_API_TOKEN;
    profileId = process.env.WISE_PROFILE_ID;
    webhookPublicKey = process.env.WISE_WEBHOOK_PUBLIC_KEY;
    isConfigured() {
        return !!(this.apiToken && this.profileId);
    }
    generateReference(userId) {
        const timestamp = Math.floor(Date.now() / 1000);
        const short = userId.slice(0, 8);
        return `WC-${short}-${timestamp}`;
    }
    async getAccountDetails(currency = 'EUR') {
        if (!this.isConfigured()) {
            return this.getMockAccountDetails(currency);
        }
        try {
            const response = await fetch(`${this.apiUrl}/v2/profiles/${this.profileId}/account-details`, {
                headers: {
                    Authorization: `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Wise API error: ${response.status}`);
            }
            const data = await response.json();
            const account = Array.isArray(data) ? data.find((a) => a.currency === currency) ?? data[0] : data;
            return {
                currency: account.currency ?? currency,
                accountHolderName: account.accountHolderName ?? 'GoConnexion',
                details: account.details ?? {},
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch Wise account details', error);
            return this.getMockAccountDetails(currency);
        }
    }
    async getBalances() {
        if (!this.isConfigured())
            return [];
        try {
            const response = await fetch(`${this.apiUrl}/v4/profiles/${this.profileId}/balances?types=STANDARD`, {
                headers: { Authorization: `Bearer ${this.apiToken}` },
            });
            if (!response.ok)
                throw new Error(`Wise API error: ${response.status}`);
            return response.json();
        }
        catch (error) {
            this.logger.error('Failed to fetch Wise balances', error);
            return [];
        }
    }
    verifyWebhookSignature(payload, signature) {
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
        }
        catch (error) {
            this.logger.error('Wise webhook signature verification failed', error);
            return false;
        }
    }
    extractReferenceFromEvent(event) {
        return event?.data?.reference_number ?? null;
    }
    extractAmountFromEvent(event) {
        if (!event?.data?.amount || !event?.data?.currency)
            return null;
        return { amount: event.data.amount, currency: event.data.currency };
    }
    getMockAccountDetails(currency) {
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
};
exports.WiseService = WiseService;
exports.WiseService = WiseService = WiseService_1 = __decorate([
    (0, common_1.Injectable)()
], WiseService);
//# sourceMappingURL=wise.service.js.map