import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, Profile } from 'passport-google-oauth20';
import type { VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from '../users/users.service';
import type { AppConfig } from '../config/configuration';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService<AppConfig, true>,
    private readonly usersService: UsersService,
  ) {
    const google = configService.get('google', { infer: true });
    super({
      clientID: google.clientId,
      clientSecret: google.clientSecret,
      callbackURL: google.callbackUrl,
      scope: ['email', 'profile'],
    } satisfies StrategyOptions);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('Google profile did not return an email'), false);
    }

    const user = await this.usersService.upsertFromGoogleProfile({
      googleId: profile.id,
      email,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    });

    done(null, user);
  }
}
