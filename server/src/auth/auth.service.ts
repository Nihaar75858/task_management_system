import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import type { AppConfig } from "../config/configuration";
import type { User } from "../../generated/prisma/client";

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

const REFRESH_TOKEN_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async issueTokenPair(user: User): Promise<TokenPair> {
    const jwt = this.configService.get("jwt", { infer: true });

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { secret: jwt.accessSecret, expiresIn: jwt.accessExpiresIn },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { secret: jwt.refreshSecret, expiresIn: jwt.refreshExpiresIn },
    );

    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * Called from the refresh endpoint (guarded by JwtRefreshGuard, which has
   * already verified the JWT signature/expiry). This additionally checks
   * the presented refresh token against the hash on record — so a refresh
   * token that was already rotated away (e.g. reused after theft, or after
   * logout) is rejected even though its signature is still technically
   * valid until expiry.
   */
  async refreshTokenPair(
    userId: string,
    presentedRefreshToken: string,
  ): Promise<TokenPair> {
    const user = await this.usersService.findById(userId);
    if (!user?.hashedRefreshToken) {
      throw new ForbiddenException("Access denied");
    }

    const matches = await bcrypt.compare(
      presentedRefreshToken,
      user.hashedRefreshToken,
    );
    if (!matches) {
      throw new ForbiddenException("Access denied");
    }

    return this.issueTokenPair(user);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.setHashedRefreshToken(userId, null);
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashed = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS);
    await this.usersService.setHashedRefreshToken(userId, hashed);
  }
}
