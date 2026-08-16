import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '../../generated/prisma/client';

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Finds an existing user by Google ID, links an existing email-matched
   * account, or creates a brand new user — in that order of preference.
   */
  async upsertFromGoogleProfile(profile: GoogleProfile): Promise<User> {
    const byGoogleId = await this.findByGoogleId(profile.googleId);
    if (byGoogleId) return byGoogleId;

    const byEmail = await this.findByEmail(profile.email);
    if (byEmail) {
      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: { googleId: profile.googleId },
      });
    }

    return this.prisma.user.create({
      data: {
        googleId: profile.googleId,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      },
    });
  }

  setHashedRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }
}
