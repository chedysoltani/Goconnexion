import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

// Extrait le token depuis le cookie httpOnly gc_access en priorité,
// puis depuis le header Authorization: Bearer comme fallback (WebSocket, mobile, etc.)
function cookieOrBearerExtractor(req: Request): string | null {
  if (req?.cookies?.gc_access) {
    return req.cookies.gc_access as string;
  }
  const authHeader = req?.headers?.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required but not set.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieOrBearerExtractor]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: false,
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        plan: true,
        avatarUrl: true,
        isEmailVerified: true,
        freelancerProfile: true,
        entrepreneurProfile: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or session invalid');
    }

    return user;
  }
}
