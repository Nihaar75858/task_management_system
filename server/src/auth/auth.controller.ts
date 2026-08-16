import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { REFRESH_TOKEN_COOKIE } from './auth.constants';
import type { AppConfig } from '../config/configuration';
import type {
  RequestUser,
  RequestUserWithRefreshToken,
} from '../types/jwt-payload.type';
import type { User } from '../../generated/prisma/client';

const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  /** Kicks off the Google OAuth redirect. GoogleAuthGuard does the work. */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Intentionally empty — the guard redirects to Google before this runs.
  }

  /**
   * Google redirects here after consent. GoogleStrategy has already
   * upserted the user and attached it to req.user. We issue a token pair,
   * set the refresh token as an httpOnly cookie, and hand the access token
   * to the frontend via a URL fragment (not a query string, so it never
   * reaches server access logs or gets forwarded via a Referer header).
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const user = req.user as User;
    const { accessToken, refreshToken } =
      await this.authService.issueTokenPair(user);

    this.setRefreshCookie(res, refreshToken);

    const frontendUrl = this.configService.get('frontendUrl', {
      infer: true,
    });
    res.redirect(`${frontendUrl}/auth/callback#access_token=${accessToken}`);
  }

  /**
   * Rotates the refresh token: the old one (verified by JwtRefreshGuard +
   * AuthService's hash check) is invalidated the moment a new pair is
   * issued, since storeRefreshToken overwrites the stored hash.
   */
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: RequestUserWithRefreshToken,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.refreshTokenPair(user.id, user.refreshToken);

    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: RequestUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(user.id);
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/v1/auth' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: RequestUser) {
    const fullUser = await this.usersService.findById(user.id);
    if (!fullUser) return null;

    return {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      avatarUrl: fullUser.avatarUrl,
    };
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      // "lax" works across different localhost ports in dev since they
      // share the same site; production behind different domains would
      // need "none" + secure: true (i.e. HTTPS) instead.
      sameSite: isProduction ? 'none' : 'lax',
      // Scoped to the auth routes only — the cookie is never sent to
      // /tasks, /projects, etc.
      path: '/api/v1/auth',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });
  }
}
