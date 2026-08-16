import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import type { Request } from 'express';
import { REFRESH_TOKEN_COOKIE } from '../auth/auth.constants';
import type { AppConfig } from '../config/configuration';
import type {
  JwtPayload,
  RequestUserWithRefreshToken,
} from '../types/jwt-payload.type';

function extractRefreshTokenFromCookie(req: Request): string | null {
  return req.cookies?.[REFRESH_TOKEN_COOKIE] ?? null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: extractRefreshTokenFromCookie,
      secretOrKey: configService.get('jwt.refreshSecret', { infer: true }),
      passReqToCallback: true,
      ignoreExpiration: false,
    } satisfies StrategyOptionsWithRequest);
  }

  validate(req: Request, payload: JwtPayload): RequestUserWithRefreshToken {
    const refreshToken = extractRefreshTokenFromCookie(req);
    if (!refreshToken) {
      throw new Error('Refresh token cookie missing');
    }
    return { id: payload.sub, email: payload.email, refreshToken };
  }
}
