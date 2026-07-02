import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IntegrationMode, IntegrationProvider, IntegrationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { IntegrationConfigDto } from './dto/integration-config.dto';
import { UpdateIntegrationStatusDto } from './dto/update-integration-status.dto';
import { IntegrationProviderAdapter } from './interfaces/integration-provider.interface';
import { IntegrationsRepository } from './integrations.repository';
import { AiIntegrationProvider } from './providers/ai-integration.provider';
import { CulqiIntegrationProvider } from './providers/culqi-integration.provider';
import { IzipayIntegrationProvider } from './providers/izipay-integration.provider';
import { SunatIntegrationProvider } from './providers/sunat-integration.provider';
import { WhatsappIntegrationProvider } from './providers/whatsapp-integration.provider';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly repository: IntegrationsRepository,
    private readonly prisma: PrismaService,
    private readonly sunat: SunatIntegrationProvider,
    private readonly whatsapp: WhatsappIntegrationProvider,
    private readonly culqi: CulqiIntegrationProvider,
    private readonly izipay: IzipayIntegrationProvider,
    private readonly ai: AiIntegrationProvider,
  ) {}

  private providers(): IntegrationProviderAdapter[] {
    return [this.sunat, this.whatsapp, this.culqi, this.izipay, this.ai, this.ecommerceProvider()];
  }

  async status() {
    const rows = await this.repository.findAll();
    const rowMap = new Map(rows.map((row) => [row.provider, row]));
    return this.providers().map((provider) => {
      const row = rowMap.get(provider.provider);
      const mode = row?.mode ?? provider.currentMode();
      const status = row?.status ?? (mode === IntegrationMode.MOCK ? IntegrationStatus.MOCK : IntegrationStatus.NOT_CONFIGURED);
      return {
        provider: provider.provider,
        name: provider.name,
        description: provider.description,
        mode,
        status,
        isEnabled: row?.isEnabled ?? mode !== IntegrationMode.MOCK,
        publicConfig: { ...provider.publicConfig(), ...(row?.publicConfig && typeof row.publicConfig === 'object' ? row.publicConfig : {}) },
        lastTestAt: row?.lastTestAt ?? null,
        lastTestStatus: row?.lastTestStatus ?? null,
        lastError: row?.lastError ?? null,
      };
    });
  }

  async get(provider: IntegrationProvider) {
    const item = (await this.status()).find((integration) => integration.provider === provider);
    if (!item) throw new NotFoundException('Integracion no soportada');
    return item;
  }

  async updateConfig(provider: IntegrationProvider, dto: IntegrationConfigDto, user: AuthenticatedUser) {
    const adapter = this.adapter(provider);
    const mode = dto.mode ?? adapter.currentMode();
    const status = mode === IntegrationMode.MOCK ? IntegrationStatus.MOCK : IntegrationStatus.CONFIGURED;
    const saved = await this.repository.upsert(provider, {
      mode,
      status,
      isEnabled: dto.isEnabled,
      publicConfig: dto.publicConfig as Prisma.InputJsonObject | undefined,
      lastError: null,
    });
    await this.audit(user.id, 'UPDATE_CONFIG', provider, 'Configuracion publica de integracion actualizada');
    return { ...saved, publicConfig: saved.publicConfig ?? adapter.publicConfig() };
  }

  async updateStatus(provider: IntegrationProvider, dto: UpdateIntegrationStatusDto, user: AuthenticatedUser) {
    const current = await this.get(provider);
    const saved = await this.repository.upsert(provider, {
      mode: current.mode,
      status: dto.status ?? current.status,
      isEnabled: dto.isEnabled ?? current.isEnabled,
      publicConfig: current.publicConfig as Prisma.InputJsonObject,
      lastError: dto.lastError ?? null,
    });
    await this.audit(user.id, 'UPDATE_STATUS', provider, 'Estado de integracion actualizado');
    return saved;
  }

  async test(provider: IntegrationProvider, user: AuthenticatedUser) {
    const adapter = this.adapter(provider);
    const result = await adapter.test();
    await this.repository.upsert(provider, {
      mode: result.mode,
      status: result.status,
      isEnabled: result.status !== IntegrationStatus.ERROR,
      publicConfig: adapter.publicConfig() as Prisma.InputJsonObject,
      lastTestAt: new Date(),
      lastTestStatus: result.status,
      lastError: result.status === IntegrationStatus.ERROR ? result.message : null,
    });
    await this.audit(user.id, 'TEST_CONNECTION', provider, result.message);
    return result;
  }

  private adapter(provider: IntegrationProvider) {
    const adapter = this.providers().find((item) => item.provider === provider);
    if (!adapter) throw new BadRequestException('Proveedor de integracion no soportado');
    return adapter;
  }

  private ecommerceProvider(): IntegrationProviderAdapter {
    return {
      provider: IntegrationProvider.ECOMMERCE,
      name: 'eCommerce API interna',
      description: 'Catalogo y pedidos online internos.',
      currentMode: () => IntegrationMode.MOCK,
      publicConfig: () => ({ publicUrl: process.env.ECOMMERCE_PUBLIC_URL ?? null }),
      test: async () => ({ provider: IntegrationProvider.ECOMMERCE, mode: IntegrationMode.MOCK, status: IntegrationStatus.MOCK, message: 'API interna disponible en modo mock/controlado.' }),
    };
  }

  private audit(userId: string, action: string, provider: IntegrationProvider, description: string) {
    return this.prisma.auditLog.create({ data: { userId, module: 'integrations', action, description, entityType: 'IntegrationSetting', entityId: provider } });
  }
}
