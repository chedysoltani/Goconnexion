import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  UseGuards,
  Request,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const ACCESS_TTL  = 24 * 60 * 60 * 1000;       // 1 jour
const REFRESH_TTL = 7 * 24 * 60 * 60 * 1000;   // 7 jours

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Register ───────────────────────────────────────────────────────────────

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: any) {
    const data = await this.authService.register(dto);
    this.setAuthCookies(res, data.accessToken, data.refreshToken);
    return { user: data.user, accessToken: data.accessToken };
  }

  // ── Login ──────────────────────────────────────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: any) {
    const data = await this.authService.login(dto);
    this.setAuthCookies(res, data.accessToken, data.refreshToken);
    return { user: data.user, accessToken: data.accessToken };
  }

  // ── Refresh ────────────────────────────────────────────────────────────────
  // Lit le cookie gc_refresh — plus de token dans le body

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req: any, @Res({ passthrough: true }) res: any) {
    const refreshToken: string | undefined = req.cookies?.gc_refresh;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }
    const data = await this.authService.refresh(refreshToken);
    this.setAuthCookies(res, data.accessToken, data.refreshToken);
    return { user: data.user, accessToken: data.accessToken };
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: any) {
    this.clearAuthCookies(res);
    return { message: 'Déconnecté' };
  }

  // ── Email verification ─────────────────────────────────────────────────────

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ── Password reset ─────────────────────────────────────────────────────────

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // ── Resend verification ────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Request() req: any) {
    return this.authService.resendVerificationEmail(req.user.id);
  }

  // ── Me ─────────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return req.user;
  }

  // ── Cookie helpers ─────────────────────────────────────────────────────────

  private cookieOptions(maxAge: number) {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      // lax en dev (localhost ports ignorés pour SameSite), none en prod (cross-subdomain)
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
      maxAge,
      ...(isProd && process.env.COOKIE_DOMAIN
        ? { domain: process.env.COOKIE_DOMAIN }
        : {}),
    };
  }

  private setAuthCookies(res: any, accessToken: string, refreshToken: string) {
    res.cookie('gc_access', accessToken, this.cookieOptions(ACCESS_TTL));
    res.cookie('gc_refresh', refreshToken, this.cookieOptions(REFRESH_TTL));
  }

  private clearAuthCookies(res: any) {
    const base = this.cookieOptions(0);
    res.clearCookie('gc_access', base);
    res.clearCookie('gc_refresh', base);
  }
}
