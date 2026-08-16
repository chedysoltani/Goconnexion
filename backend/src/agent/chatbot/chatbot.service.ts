import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AgentChatSessionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ClaudeService, ClaudeMessage } from '../shared/claude.service';
import {
  StartChatSessionDto,
  SendChatMessageDto,
} from './dto/chatbot-message.dto';

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de GoConnexions, une plateforme de réseautage professionnel pour freelances et entrepreneurs au Canada.

Ton rôle :
- Répondre aux questions des visiteurs sur la plateforme (fonctionnalités, tarifs, inscription).
- Rester bref, chaleureux et professionnel (2-4 phrases par réponse).
- Guider naturellement le visiteur vers l'inscription (bouton "Créer mon compte") quand c'est pertinent, sans être insistant.
- Si tu ne connais pas la réponse à une question précise (tarification exacte, litige, support technique), invite poliment le visiteur à contacter support@goconnexions.com plutôt que d'inventer une réponse.
- Ne jamais demander de mot de passe, numéro de carte bancaire ou toute information sensible.
- Répondre dans la langue du visiteur (français par défaut).`;

// Limite le nombre de messages d'historique envoyés au modèle (contrôle coût + latence).
const MAX_HISTORY_MESSAGES = 12;
const FALLBACK_REPLY =
  'Désolé, je ne suis pas disponible pour le moment — écris-nous à support@goconnexions.com et on te répond rapidement.';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private prisma: PrismaService,
    private claude: ClaudeService,
  ) {}

  async startSession(dto: StartChatSessionDto) {
    const session = await this.prisma.agentChatSession.create({
      data: {
        visitorId: dto.visitorId ?? randomUUID(),
        sourceUrl: dto.sourceUrl,
        utmSource: dto.utmSource,
        utmCampaign: dto.utmCampaign,
      },
    });

    return { sessionId: session.id, visitorId: session.visitorId };
  }

  async sendMessage(dto: SendChatMessageDto) {
    const session = await this.prisma.agentChatSession.findUnique({
      where: { id: dto.sessionId },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: MAX_HISTORY_MESSAGES },
      },
    });
    if (!session) throw new NotFoundException('Session de chat introuvable');

    await this.prisma.agentChatMessage.create({
      data: { sessionId: session.id, role: 'VISITOR', content: dto.message },
    });

    const history: ClaudeMessage[] = [
      ...session.messages.map(
        (m): ClaudeMessage => ({
          role: m.role === 'VISITOR' ? 'user' : 'assistant',
          content: m.content,
        }),
      ),
      { role: 'user', content: dto.message },
    ];

    let replyText: string;
    try {
      const result = await this.claude.complete({
        system: SYSTEM_PROMPT,
        messages: history,
        maxTokens: 500,
      });
      replyText = result.text || FALLBACK_REPLY;
    } catch (err) {
      this.logger.error(
        `Échec appel Claude pour la session ${session.id}: ${err}`,
      );
      replyText = FALLBACK_REPLY;
    }

    await this.prisma.agentChatMessage.create({
      data: { sessionId: session.id, role: 'AGENT', content: replyText },
    });

    return { reply: replyText };
  }

  async markConverted(sessionId: string, userId: string) {
    const session = await this.prisma.agentChatSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session de chat introuvable');

    return this.prisma.agentChatSession.update({
      where: { id: sessionId },
      data: {
        convertedUserId: userId,
        status: AgentChatSessionStatus.CONVERTED,
      },
    });
  }
}
