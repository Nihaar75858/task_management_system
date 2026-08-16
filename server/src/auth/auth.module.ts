import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from '../strategies/google.strategy';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../strategies/jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // No default secret/signOptions here on purpose — access and refresh
    // tokens use different secrets and lifetimes, passed explicitly at
    // sign-time in AuthService.
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
