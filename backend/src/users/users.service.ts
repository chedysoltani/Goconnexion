import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        isEmailVerified: true,
        birthDate: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: { firstName?: string; lastName?: string; avatarUrl?: string; birthDate?: Date }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        birthDate: true,
        lastActiveAt: true,
      },
    });
  }

  // Liste complète (hors soi-même et hors admin) — utilisée par la messagerie
  // pour démarrer une conversation avec n'importe quel utilisateur du réseau.
  async findAllExceptSelf(userId: string) {
    return this.prisma.user.findMany({
      where: {
        NOT: { id: userId },
        role: { not: 'ADMIN' },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        freelancerProfile: { select: { title: true } },
      },
      orderBy: { firstName: 'asc' },
    });
  }

  // Networking Suggestions
  async getSuggestions(userId: string) {
    const user = await this.findOne(userId);

    let userSkills: string[] = [];
    let userIndustry: string | null = null;

    if (user.role === 'FREELANCER') {
      const flProfile = await this.prisma.freelancerProfile.findUnique({
        where: { userId },
      });
      if (flProfile) {
        userSkills = flProfile.skills || [];
        userIndustry = flProfile.industry || null;
      }
    } else if (user.role === 'ENTREPRENEUR') {
      const entProfile = await this.prisma.entrepreneurProfile.findUnique({
        where: { userId },
      });
      if (entProfile) {
        userIndustry = entProfile.industry || null;
      }
    }

    // Rôle complémentaire (freelance <-> entrepreneur) : priorisé dans le tri, mais on ne
    // suggère plus uniquement ce rôle — tout profil (hors admin) reste une suggestion valide.
    const complementaryRole = user.role === 'ENTREPRENEUR' ? 'FREELANCER' : 'ENTREPRENEUR';

    const candidates = await this.prisma.user.findMany({
      where: {
        NOT: { id: userId },
        role: { not: 'ADMIN' },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        freelancerProfile: true,
        entrepreneurProfile: true,
      },
      take: 100,
    });

    const score = (candidate: (typeof candidates)[number]) => {
      let s = candidate.role === complementaryRole ? 1000 : 0;

      // Bonus de matching par secteur d'activité / industrie
      if (userIndustry) {
        const candidateIndustry = candidate.freelancerProfile?.industry || candidate.entrepreneurProfile?.industry;
        if (candidateIndustry && candidateIndustry.toLowerCase() === userIndustry.toLowerCase()) {
          s += 500;
        }
      }

      if (userSkills.length > 0) {
        const candidateSkills = candidate.freelancerProfile?.skills || [];
        s += candidateSkills.filter((skill) => userSkills.includes(skill)).length;
      }
      return s;
    };

    return candidates
      .sort((a, b) => score(b) - score(a))
      .slice(0, 20);
  }
}
