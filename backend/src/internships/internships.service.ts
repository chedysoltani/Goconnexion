import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createReadStream, promises as fs } from 'fs';
import { basename, join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  CreateInternshipDto,
  UpdateInternshipDto,
  ListInternshipsQueryDto,
  ApplyInternshipDto,
  UpdateApplicationStatusDto,
} from './dto/internship.dto';

// Champs publics uniquement — jamais email / password
const PUBLIC_USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
} as const;

// cvUrl est une référence interne, jamais renvoyée au client
const APPLICATION_SELECT = {
  id: true,
  offerId: true,
  applicantId: true,
  message: true,
  status: true,
  consentAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const MAX_CV_SIZE = 5 * 1024 * 1024;
const PUBLIC_UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');
// Hors de public/ : jamais servi par express.static
const CV_DIR = join(
  process.env.PRIVATE_STORAGE_DIR ?? join(process.cwd(), 'private'),
  'internship-cvs',
);
const CV_REF_PREFIX = 'private:internship-cvs/';

export type AuthUser = { id: string; role: string };

@Injectable()
export class InternshipsService {
  private readonly logger = new Logger(InternshipsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ── Offres ────────────────────────────────────────────────────────────────

  async findAll(query: ListInternshipsQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 12, 50);

    const where: Prisma.InternshipOfferWhereInput = { status: 'PUBLISHED' };
    if (query.domain) where.domain = query.domain;
    if (query.mode) where.mode = query.mode;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.internshipOffer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: PUBLIC_USER_SELECT } },
      }),
      this.prisma.internshipOffer.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const offer = await this.prisma.internshipOffer.findUnique({
      where: { id },
      include: { author: { select: PUBLIC_USER_SELECT } },
    });
    if (!offer) throw new NotFoundException('Offre de stage introuvable');
    return offer;
  }

  create(authorId: string, dto: CreateInternshipDto) {
    return this.prisma.internshipOffer.create({
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        skills: dto.skills ?? [],
        authorId,
      },
      include: { author: { select: PUBLIC_USER_SELECT } },
    });
  }

  async update(id: string, user: AuthUser, dto: UpdateInternshipDto) {
    await this.getOfferAsOwner(id, user);
    return this.prisma.internshipOffer.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      },
      include: { author: { select: PUBLIC_USER_SELECT } },
    });
  }

  async remove(id: string, user: AuthUser) {
    await this.getOfferAsOwner(id, user);
    const applications = await this.prisma.internshipApplication.findMany({
      where: { offerId: id },
      select: { cvUrl: true },
    });
    await this.prisma.internshipOffer.delete({ where: { id } });
    // Les candidatures sont supprimées en cascade : on supprime aussi les CV privés
    await Promise.all(applications.map((a) => this.deleteCvFile(a.cvUrl)));
    return { success: true };
  }

  async findMine(authorId: string) {
    return this.prisma.internshipOffer.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { applications: true } } },
    });
  }

  // ── Candidatures ──────────────────────────────────────────────────────────

  async apply(offerId: string, applicantId: string, dto: ApplyInternshipDto) {
    const offer = await this.prisma.internshipOffer.findUnique({
      where: { id: offerId },
      include: {
        author: { select: { id: true, email: true, firstName: true } },
      },
    });
    if (!offer) throw new NotFoundException('Offre de stage introuvable');
    if (offer.status !== 'PUBLISHED')
      throw new BadRequestException('Cette offre est fermée');
    if (offer.authorId === applicantId) {
      throw new BadRequestException(
        'Vous ne pouvez pas postuler à votre propre offre',
      );
    }

    const existing = await this.prisma.internshipApplication.findUnique({
      where: { offerId_applicantId: { offerId, applicantId } },
      select: { id: true },
    });
    if (existing)
      throw new ConflictException('Vous avez déjà postulé à cette offre');

    // Le fichier doit avoir été téléversé par le candidat lui-même
    const file = await this.prisma.file.findFirst({
      where: { path: dto.cvUrl, userId: applicantId },
    });
    if (!file)
      throw new BadRequestException(
        'CV introuvable. Veuillez le téléverser à nouveau.',
      );
    if (file.size > MAX_CV_SIZE)
      throw new BadRequestException('Le CV ne doit pas dépasser 5 Mo');

    const publicPath = join(PUBLIC_UPLOADS_DIR, basename(file.path));
    if (!(await this.hasPdfSignature(publicPath))) {
      throw new BadRequestException('Le CV doit être un fichier PDF valide');
    }

    // Copie vers le stockage privé puis suppression de la version publique.
    // copy + unlink (et non rename) : public/uploads et private peuvent être des volumes distincts.
    await fs.mkdir(CV_DIR, { recursive: true });
    const privateName = `${offerId}-${applicantId}-${Date.now()}.pdf`;
    const privatePath = join(CV_DIR, privateName);
    const cvRef = `${CV_REF_PREFIX}${privateName}`;
    await fs.copyFile(publicPath, privatePath);

    let application;
    try {
      application = await this.prisma.internshipApplication.create({
        data: {
          offerId,
          applicantId,
          cvUrl: cvRef,
          message: dto.message,
          consentAt: new Date(),
        },
        select: APPLICATION_SELECT,
      });
    } catch (err) {
      await fs.unlink(privatePath).catch(() => {});
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Vous avez déjà postulé à cette offre');
      }
      throw err;
    }

    await fs
      .unlink(publicPath)
      .catch((e) => this.logger.warn(`Suppression CV public échouée: ${e}`));
    await this.prisma.file.update({
      where: { id: file.id },
      data: { path: cvRef },
    });

    // Notification de l'auteur — ne bloque pas la réponse
    const applicant = await this.prisma.user.findUnique({
      where: { id: applicantId },
      select: { firstName: true, lastName: true },
    });
    this.mail
      .sendInternshipApplication(
        offer.author,
        { title: offer.title },
        {
          firstName: applicant?.firstName ?? '',
          lastName: applicant?.lastName ?? '',
        },
      )
      .catch((e) => this.logger.error(`Email candidature non envoyé: ${e}`));

    return application;
  }

  findMyApplications(applicantId: string) {
    return this.prisma.internshipApplication.findMany({
      where: { applicantId },
      orderBy: { createdAt: 'desc' },
      select: {
        ...APPLICATION_SELECT,
        offer: {
          select: {
            id: true,
            title: true,
            companyName: true,
            domain: true,
            location: true,
            mode: true,
            status: true,
            isPaid: true,
            durationMonths: true,
            author: { select: PUBLIC_USER_SELECT },
          },
        },
      },
    });
  }

  async findOfferApplications(offerId: string, user: AuthUser) {
    await this.getOfferAsOwner(offerId, user);
    return this.prisma.internshipApplication.findMany({
      where: { offerId },
      orderBy: { createdAt: 'desc' },
      select: {
        ...APPLICATION_SELECT,
        applicant: { select: PUBLIC_USER_SELECT },
      },
    });
  }

  async updateApplicationStatus(
    id: string,
    user: AuthUser,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.internshipApplication.findUnique({
      where: { id },
      select: { offer: { select: { authorId: true } } },
    });
    if (!application) throw new NotFoundException('Candidature introuvable');
    if (application.offer.authorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        "Seul l'auteur de l'offre peut modifier cette candidature",
      );
    }
    return this.prisma.internshipApplication.update({
      where: { id },
      data: { status: dto.status },
      select: {
        ...APPLICATION_SELECT,
        applicant: { select: PUBLIC_USER_SELECT },
      },
    });
  }

  async getCv(id: string, user: AuthUser) {
    const application = await this.prisma.internshipApplication.findUnique({
      where: { id },
      select: {
        cvUrl: true,
        applicantId: true,
        applicant: { select: { firstName: true, lastName: true } },
        offer: { select: { authorId: true } },
      },
    });
    if (!application) throw new NotFoundException('Candidature introuvable');
    const allowed =
      application.applicantId === user.id ||
      application.offer.authorId === user.id ||
      user.role === 'ADMIN';
    if (!allowed) throw new ForbiddenException('Accès au CV refusé');

    const path = this.resolveCvPath(application.cvUrl);
    try {
      await fs.access(path);
    } catch {
      throw new NotFoundException('Fichier CV introuvable');
    }
    const safeName =
      `${application.applicant.firstName}-${application.applicant.lastName}`
        .normalize('NFD')
        .replace(/[^A-Za-z0-9-]/g, '');
    return {
      stream: createReadStream(path),
      filename: `CV-${safeName || 'candidat'}.pdf`,
    };
  }

  /** Retrait par le candidat : supprime la candidature et son CV privé. */
  async withdraw(id: string, applicantId: string) {
    const application = await this.prisma.internshipApplication.findUnique({
      where: { id },
      select: { applicantId: true, cvUrl: true },
    });
    if (!application) throw new NotFoundException('Candidature introuvable');
    if (application.applicantId !== applicantId) {
      throw new ForbiddenException(
        'Seul le candidat peut retirer sa candidature',
      );
    }
    await this.prisma.internshipApplication.delete({ where: { id } });
    await this.deleteCvFile(application.cvUrl);
    return { success: true };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async getOfferAsOwner(id: string, user: AuthUser) {
    const offer = await this.prisma.internshipOffer.findUnique({
      where: { id },
    });
    if (!offer) throw new NotFoundException('Offre de stage introuvable');
    if (offer.authorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        "Seul l'auteur de l'offre peut effectuer cette action",
      );
    }
    return offer;
  }

  private async hasPdfSignature(path: string): Promise<boolean> {
    let handle: fs.FileHandle | undefined;
    try {
      handle = await fs.open(path, 'r');
      const buf = Buffer.alloc(4);
      const { bytesRead } = await handle.read(buf, 0, 4, 0);
      return bytesRead === 4 && buf.toString('latin1') === '%PDF';
    } catch {
      return false;
    } finally {
      await handle?.close();
    }
  }

  private resolveCvPath(cvRef: string): string {
    if (!cvRef.startsWith(CV_REF_PREFIX))
      throw new NotFoundException('Fichier CV introuvable');
    return join(CV_DIR, basename(cvRef.slice(CV_REF_PREFIX.length)));
  }

  /** Supprime le fichier privé et la ligne File qui le référence. */
  private async deleteCvFile(cvRef: string) {
    try {
      await fs.unlink(this.resolveCvPath(cvRef));
    } catch (e) {
      this.logger.warn(`Suppression CV échouée (${cvRef}): ${e}`);
    }
    await this.prisma.file.deleteMany({ where: { path: cvRef } });
  }
}
