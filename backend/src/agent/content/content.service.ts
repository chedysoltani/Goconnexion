import { Injectable, NotFoundException } from '@nestjs/common';
import { AgentContentType, AgentContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ClaudeService, CLAUDE_DEFAULT_MODEL } from '../shared/claude.service';
import { GenerateContentDto, UpdateContentDto } from './dto/content.dto';

const SYSTEM_PROMPT = `Tu es le rédacteur marketing de GoConnexions, une plateforme de réseautage professionnel pour freelances et entrepreneurs, basée au Québec.

Ton de voix : professionnel, chaleureux, direct. Pas de superlatifs vides ni de jargon marketing creux ("révolutionnaire", "disruptif"). Pas plus d'un emoji par publication.

Règles :
- N'invente jamais de statistiques, témoignages ou chiffres — si le sujet en réclame, laisse un espace [DONNÉE À VÉRIFIER] plutôt que d'inventer.
- Termine toujours par un appel à l'action clair vers l'inscription sur GoConnexions.
- Rédige en français (Québec/Canada francophone) sauf indication contraire dans le sujet.
- Ne mentionne jamais de prix ou de fonctionnalité que tu ne peux pas confirmer.`;

const MAX_TOKENS_BY_TYPE: Record<AgentContentType, number> = {
  LINKEDIN_POST: 600,
  FACEBOOK_POST: 500,
  BLOG_ARTICLE: 2500,
};

function buildBrief(dto: GenerateContentDto): string {
  const audience = dto.targetAudience
    ? ` pour un public de ${dto.targetAudience}`
    : ' pour les freelances et entrepreneurs';

  switch (dto.type) {
    case AgentContentType.LINKEDIN_POST:
      return `Rédige un post LinkedIn${audience} sur le sujet suivant : "${dto.topic}". Format : 3 à 6 paragraphes courts, aérés, avec 3-5 hashtags pertinents à la fin.`;
    case AgentContentType.FACEBOOK_POST:
      return `Rédige un post Facebook${audience} sur le sujet suivant : "${dto.topic}". Format : ton plus conversationnel que LinkedIn, 2-4 phrases courtes, sans hashtags.`;
    case AgentContentType.BLOG_ARTICLE:
      return `Rédige un article de blog${audience} sur le sujet suivant : "${dto.topic}". Format : un titre H1, une introduction, 3-5 sections avec sous-titres H2, et une conclusion avec appel à l'action. Longueur : 600-900 mots.`;
  }
}

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private claude: ClaudeService,
  ) {}

  async generate(dto: GenerateContentDto) {
    const prompt = buildBrief(dto);

    const result = await this.claude.complete({
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
      maxTokens: MAX_TOKENS_BY_TYPE[dto.type],
      thinking: true, // meilleure qualité rédactionnelle, latence non critique (génération asynchrone)
    });

    return this.prisma.agentContent.create({
      data: {
        type: dto.type,
        status: AgentContentStatus.PENDING_REVIEW,
        body: result.text,
        targetAudience: dto.targetAudience,
        prompt,
        model: CLAUDE_DEFAULT_MODEL,
      },
    });
  }

  async findAll(status?: AgentContentStatus) {
    return this.prisma.agentContent.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findOne(id: string) {
    const content = await this.prisma.agentContent.findUnique({
      where: { id },
      include: {
        reviewedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!content) throw new NotFoundException('Contenu introuvable');
    return content;
  }

  async update(id: string, dto: UpdateContentDto, adminUserId: string) {
    await this.findOne(id);

    const data: Prisma.AgentContentUpdateInput = {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.body !== undefined && { body: dto.body }),
    };

    if (dto.status) {
      data.status = dto.status;
      data.reviewedBy = { connect: { id: adminUserId } };
      if (dto.status === AgentContentStatus.PUBLISHED) {
        data.publishedAt = new Date();
      }
    }

    return this.prisma.agentContent.update({ where: { id }, data });
  }
}
