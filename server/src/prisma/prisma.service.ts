import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
// Prisma 7 generates the client to a custom output path (see
// prisma/schema.prisma `generator client { output = "../generated/prisma" }`)
// instead of node_modules/@prisma/client.
import { PrismaClient } from '../../generated/prisma/client';
import type { AppConfig } from '../config/configuration';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService<AppConfig, true>) {
    // Prisma 7 has no built-in query engine — every SQL provider requires
    // an explicit driver adapter. @prisma/adapter-pg wraps `pg` for Postgres.
    const adapter = new PrismaPg({
      connectionString: configService.get('databaseUrl', { infer: true }),
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to PostgreSQL via Prisma (pg adapter)');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
