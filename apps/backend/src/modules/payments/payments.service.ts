import { Injectable } from '@nestjs/common';
import { PaymentProvider, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateChargeDto } from './dto/create-charge.dto';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { CulqiProvider } from './providers/culqi.provider';
import { IzipayProvider } from './providers/izipay.provider';

@Injectable()
export class PaymentsService {
  constructor(private readonly culqi: CulqiProvider, private readonly izipay: IzipayProvider, private readonly prisma: PrismaService) {}

  async createLink(dto: CreatePaymentLinkDto, user: AuthenticatedUser) {
    const response = dto.provider === 'izipay' ? await this.izipay.createPreparedPayment(dto.amount) : await this.culqi.createPreparedLink(dto.amount);
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        provider: response.provider,
        amount: dto.amount,
        currency: 'PEN',
        status: response.status,
        paymentLink: response.paymentLink,
        providerTransactionId: response.providerTransactionId,
        providerResponse: response.providerResponse as Prisma.InputJsonObject | undefined,
        errorMessage: response.errorMessage,
        relatedSaleId: dto.relatedModule === 'sales' ? dto.relatedId : undefined,
        relatedServiceOrderId: dto.relatedModule === 'service-orders' ? dto.relatedId : undefined,
        relatedQuickServiceSaleId: dto.relatedModule === 'quick-services' ? dto.relatedId : undefined,
      },
    });
    await this.prisma.auditLog.create({ data: { userId: user.id, module: 'payments', action: 'CREATE_PAYMENT_LINK', description: `Link ${response.mode} ${response.provider} por S/ ${dto.amount}`, entityId: transaction.id, entityType: 'PaymentTransaction' } });
    return transaction;
  }

  async createCharge(provider: PaymentProvider, dto: CreateChargeDto, user: AuthenticatedUser) {
    const response = provider === PaymentProvider.IZIPAY ? await this.izipay.createPreparedPayment(dto.amount) : await this.culqi.createPreparedLink(dto.amount);
    const transaction = await this.prisma.paymentTransaction.create({
      data: { provider, amount: dto.amount, currency: dto.currency ?? 'PEN', status: response.status, providerTransactionId: response.providerTransactionId, providerResponse: response.providerResponse as Prisma.InputJsonObject | undefined, errorMessage: response.errorMessage, relatedSaleId: dto.relatedSaleId },
    });
    await this.prisma.auditLog.create({ data: { userId: user.id, module: 'payments', action: 'CREATE_CHARGE', description: `Cargo ${provider} preparado`, entityId: transaction.id, entityType: 'PaymentTransaction' } });
    return transaction;
  }

  async webhook(dto: PaymentWebhookDto) {
    await this.prisma.auditLog.create({ data: { module: 'payments', action: 'PAYMENT_WEBHOOK', description: `Webhook recibido ${dto.provider}:${dto.event}`, entityType: 'PaymentTransaction' } });
    return { received: true, provider: dto.provider, event: dto.event, mode: 'mock' };
  }

  transactions(query: PaymentQueryDto) {
    return this.prisma.paymentTransaction.findMany({ where: { provider: query.provider, status: query.status }, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  status(id: string) {
    return this.prisma.paymentTransaction.findUnique({ where: { id } });
  }

  async testConnection(user: AuthenticatedUser) {
    await this.prisma.auditLog.create({ data: { userId: user.id, module: 'payments', action: 'TEST_CONNECTION', description: 'Prueba general de pasarelas', entityType: 'PaymentTransaction' } });
    return { culqi: this.culqi.isConfigured() ? 'CONFIGURED' : 'MOCK', izipay: this.izipay.isConfigured() ? 'CONFIGURED' : 'MOCK' };
  }
}
