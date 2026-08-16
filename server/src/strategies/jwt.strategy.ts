import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';
import type { AppConfig } from '../config/configuration';
import type { JwtPayload, RequestUser } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.accessSecret', { infer: true }),
      ignoreExpiration: false,
    } satisfies StrategyOptionsWithoutRequest);
  }

  validate(payload: JwtPayload): RequestUser {
    return { id: payload.sub, email: payload.email };
  }
}
