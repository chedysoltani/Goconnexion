import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AboutContentDto, UpdateSiteContentDto } from './dto/site-content.dto';

// Clés éditables et leur schéma. Ajouter une entrée ici pour rendre une nouvelle page éditable.
export const SITE_CONTENT_SCHEMAS = {
  about: AboutContentDto,
} as const;

export type SiteContentKey = keyof typeof SITE_CONTENT_SCHEMAS;

const PUBLIC_SELECT = { key: true, title: true, content: true, updatedAt: true } as const;

@Injectable()
export class SiteContentService {
  constructor(private prisma: PrismaService) {}

  private schemaFor(key: string) {
    const schema = SITE_CONTENT_SCHEMAS[key as SiteContentKey];
    if (!schema) throw new NotFoundException('Contenu introuvable');
    return schema;
  }

  async findOne(key: string) {
    this.schemaFor(key);
    const item = await this.prisma.siteContent.findUnique({ where: { key }, select: PUBLIC_SELECT });
    if (!item) throw new NotFoundException('Contenu introuvable');
    return item;
  }

  // Vue admin : inclut l'auteur de la dernière modification
  async findOneForEditor(key: string) {
    this.schemaFor(key);
    const item = await this.prisma.siteContent.findUnique({
      where: { key },
      select: { ...PUBLIC_SELECT, updatedBy: { select: { firstName: true, lastName: true } } },
    });
    if (!item) throw new NotFoundException('Contenu introuvable');
    return item;
  }

  async update(key: string, dto: UpdateSiteContentDto, userId: string) {
    const schema = this.schemaFor(key);
    const content = plainToInstance(schema, dto.content);
    const errors = await validate(content, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length) {
      throw new BadRequestException(flattenErrors(errors));
    }
    // Repasse par JSON pour ne stocker que les champs validés (instance → objet simple)
    const data = JSON.parse(JSON.stringify(content));
    return this.prisma.siteContent.upsert({
      where: { key },
      update: { title: dto.title, content: data, updatedById: userId },
      create: { key, title: dto.title, content: data, updatedById: userId },
      select: PUBLIC_SELECT,
    });
  }
}

function flattenErrors(errors: import('class-validator').ValidationError[], prefix = 'content'): string[] {
  return errors.flatMap((e) => {
    const path = `${prefix}.${e.property}`;
    const own = Object.values(e.constraints ?? {}).map((m) => `${path}: ${m}`);
    return [...own, ...flattenErrors(e.children ?? [], path)];
  });
}
