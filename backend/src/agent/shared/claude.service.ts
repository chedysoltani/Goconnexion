import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

export const CLAUDE_DEFAULT_MODEL = 'claude-sonnet-5';

// Tarifs approximatifs (USD / million de tokens) — à ajuster selon la grille
// tarifaire Anthropic en vigueur. Sert uniquement au suivi de coût indicatif
// dans les logs, pas à la facturation.
const PRICING_PER_MTOK: Record<string, { input: number; output: number }> = {
  'claude-sonnet-5': { input: 2, output: 10 },
  'claude-haiku-4-5': { input: 1, output: 5 },
  'claude-opus-5': { input: 5, output: 25 },
};

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeCompletionParams {
  system: string;
  messages: ClaudeMessage[];
  model?: string;
  maxTokens?: number;
  /** Active la réflexion adaptative (meilleure qualité, plus lent/coûteux). Désactivée par défaut. */
  thinking?: boolean;
}

export interface ClaudeCompletionResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
}

/**
 * Point d'entrée unique vers l'API Anthropic pour tout le module agent.
 * Centralise la config du modèle et le log de coût par requête.
 */
@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly client: Anthropic | null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY ?? '';
    this.client = apiKey ? new Anthropic({ apiKey }) : null;

    if (!this.client) {
      this.logger.warn(
        '⚠️  ANTHROPIC_API_KEY non configurée — agent IA en mode log seulement',
      );
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async complete(
    params: ClaudeCompletionParams,
  ): Promise<ClaudeCompletionResult> {
    const model = params.model ?? CLAUDE_DEFAULT_MODEL;
    const maxTokens = params.maxTokens ?? 1024;

    if (!this.client) {
      this.logger.log(
        `[CLAUDE] (mode log) model=${model} dernier message="${params.messages.at(-1)?.content.slice(0, 80)}"`,
      );
      return { text: '', inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 };
    }

    const response = await this.client.messages.create({
      model,
      max_tokens: maxTokens,
      system: params.system,
      thinking: params.thinking ? { type: 'adaptive' } : { type: 'disabled' },
      messages: params.messages,
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const text = textBlock?.type === 'text' ? textBlock.text : '';
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const estimatedCostUsd = this.estimateCost(
      model,
      inputTokens,
      outputTokens,
    );

    this.logger.log(
      `[CLAUDE] model=${model} in=${inputTokens} out=${outputTokens} ~$${estimatedCostUsd.toFixed(4)}`,
    );

    return { text, inputTokens, outputTokens, estimatedCostUsd };
  }

  private estimateCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): number {
    const pricing =
      PRICING_PER_MTOK[model] ?? PRICING_PER_MTOK[CLAUDE_DEFAULT_MODEL];
    return (
      (inputTokens / 1_000_000) * pricing.input +
      (outputTokens / 1_000_000) * pricing.output
    );
  }
}
