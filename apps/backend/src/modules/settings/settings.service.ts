import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { BusinessSettingsDto } from './dto/business-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async business() {
    const existing = await this.prisma.businessSettings.findFirst();
    if (existing) return this.map(existing);
    const created = await this.prisma.businessSettings.create({ data: { businessName: 'Innova Solutions', currency: 'PEN', applyIgv: false, taxPercentage: 18, receiptMessage: 'Gracias por confiar en Innova Solutions' } });
    return this.map(created);
  }

  async tax() {
    const settings = await this.business();
    return this.mapTax(settings);
  }

  async updateTax(dto: BusinessSettingsDto, user: AuthenticatedUser) {
    const current = await this.business();
    const updated = await this.prisma.businessSettings.update({
      where: { id: current.id },
      data: {
        applyIgv: dto.applyIgv,
        taxPercentage: dto.taxPercentage,
      },
    });
    await this.prisma.auditLog.create({ data: { userId: user.id, module: 'settings', action: 'CHANGE_TAX_SETTINGS', description: 'Configuracion tributaria actualizada' } });
    return this.mapTax(this.map(updated));
  }

  async updateBusiness(dto: BusinessSettingsDto, user: AuthenticatedUser) {
    const current = await this.business();
    const updated = await this.prisma.businessSettings.update({ where: { id: current.id }, data: dto });
    await this.prisma.auditLog.create({ data: { userId: user.id, module: 'settings', action: 'CHANGE_SETTINGS', description: 'Configuracion del negocio actualizada' } });
    return this.map(updated);
  }

  private map(settings: any) {
    return { ...settings, taxPercentage: Number(settings.taxPercentage) };
  }

  private mapTax(settings: any) {
    return {
      applyIgv: Boolean(settings.applyIgv),
      taxPercentage: Number(settings.taxPercentage),
      igvRate: Number(settings.taxPercentage) / 100,
    };
  }
}
