import { Injectable } from '@nestjs/common';
import { IntegrationMode, IntegrationProvider, IntegrationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class IntegrationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.integrationSetting.findMany({ orderBy: { provider: 'asc' } });
  }

  find(provider: IntegrationProvider) {
    return this.prisma.integrationSetting.findUnique({ where: { provider } });
  }

  upsert(provider: IntegrationProvider, data: { mode: IntegrationMode; status: IntegrationStatus; isEnabled?: boolean; publicConfig?: Prisma.InputJsonValue; lastTestStatus?: string; lastError?: string | null; lastTestAt?: Date }) {
    return this.prisma.integrationSetting.upsert({
      where: { provider },
      update: data,
      create: {
        provider,
        mode: data.mode,
        status: data.status,
        isEnabled: data.isEnabled ?? data.status !== IntegrationStatus.NOT_CONFIGURED,
        publicConfig: data.publicConfig,
        lastTestStatus: data.lastTestStatus,
        lastError: data.lastError,
        lastTestAt: data.lastTestAt,
      },
    });
  }
}
