import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const role = dto.role || 'FREELANCER';
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role,
          country: dto.country,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        },
      });

      if (role === UserRole.FREELANCER) {
        await tx.freelancerProfile.create({
          data: { userId: user.id, skills: [], industry: dto.industry },
        });
      } else if (role === UserRole.ENTREPRENEUR) {
        await tx.entrepreneurProfile.create({
          data: {
            userId: user.id,
            companyName: `${dto.firstName}'s Ventures`,
            industry: dto.industry,
          },
        });
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          currentStreak: 1,
          longestStreak: 1,
          lastStreakDate: new Date(),
        },
      });

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      // Emails envoyés en dehors de la transaction pour ne pas la bloquer
      setImmediate(() => {
        this.mailService.sendWelcome({
          email: user.email,
          firstName: user.firstName,
        });
        this.mailService.sendEmailVerification(
          { email: user.email, firstName: user.firstName },
          verificationToken,
        );
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          country: user.country,
        },
        streak: { current: 1, longest: 1, isFirstVisit: true },
        ...tokens,
      };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const streak = await this.updateLoginStreak(user);
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        plan: user.plan ?? 'FREE',
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
        country: user.country,
      },
      streak,
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException('User not found');

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          plan: user.plan ?? 'FREE',
          avatarUrl: user.avatarUrl,
          isEmailVerified: user.isEmailVerified,
        },
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Lien de vérification invalide ou expiré');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return { message: 'Email vérifié avec succès' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Réponse identique qu'il existe ou non (évite l'énumération d'emails)
    if (!user) {
      return { message: 'Si ce compte existe, un email a été envoyé.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    });

    await this.mailService.sendPasswordReset(
      { email: user.email, firstName: user.firstName },
      token,
    );

    return { message: 'Si ce compte existe, un email a été envoyé.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Lien de réinitialisation invalide ou expiré',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async resendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    if (user.isEmailVerified)
      throw new BadRequestException('Email déjà vérifié');

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
    });

    await this.mailService.sendEmailVerification(
      { email: user.email, firstName: user.firstName },
      token,
    );

    return { message: 'Email de vérification renvoyé' };
  }

  /**
   * Incrémente le streak si la dernière connexion comptabilisée date d'hier,
   * le réinitialise à 1 en cas de trou (>1 jour), ne change rien si déjà
   * compté aujourd'hui. `lastStreakDate` est dédié à ce calcul — distinct de
   * `lastActiveAt` qui est rafraîchi en continu par LastActiveInterceptor.
   */
  private async updateLoginStreak(user: {
    id: string;
    currentStreak: number;
    longestStreak: number;
    lastStreakDate: Date | null;
  }) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!user.lastStreakDate) {
      const longest = Math.max(user.longestStreak, 1);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { currentStreak: 1, longestStreak: longest, lastStreakDate: now },
      });
      return { current: 1, longest, isNewDay: true };
    }

    const last = user.lastStreakDate;
    const lastDay = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate(),
    );
    const dayDiff = Math.round(
      (today.getTime() - lastDay.getTime()) / 86_400_000,
    );

    if (dayDiff === 0) {
      return {
        current: user.currentStreak,
        longest: user.longestStreak,
        isNewDay: false,
      };
    }

    const current = dayDiff === 1 ? user.currentStreak + 1 : 1;
    const longest = Math.max(user.longestStreak, current);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        currentStreak: current,
        longestStreak: longest,
        lastStreakDate: now,
      },
    });

    return { current, longest, isNewDay: true };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }
}
