import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider, PaymentTransactionStatus } from '@prisma/client';
import { PaymentResponse } from '../interfaces/payment-response.interface';

@Injectable()
export class IzipayProvider {
  constructor(private readonly config: ConfigService) {}
  mode() { return (this.config.get<string>('IZIPAY_MODE') ?? 'mock').toLowerCase(); }
  isConfigured() { return Boolean(this.config.get('IZIPAY_USERNAME') && this.config.get('IZIPAY_PASSWORD') && this.config.get('IZIPAY_SHOP_ID')); }
  async createPreparedPayment(amount: number): Promise<PaymentResponse> {
    if (this.mode() === 'mock') return { provider: PaymentProvider.IZIPAY, status: PaymentTransactionStatus.MOCK, paymentLink: `https://mock-payments.local/izipay/${Date.now()}`, providerTransactionId: `IZIPAY-MOCK-${Date.now()}`, providerResponse: { amount }, mode: 'mock' };
    return this.isConfigured()
      ? { provider: PaymentProvider.IZIPAY, status: PaymentTransactionStatus.PENDING, providerResponse: { message: 'Provider Izipay preparado. Firma/hash pendiente de validacion con credenciales reales.' }, mode: 'prepared' }
      : { provider: PaymentProvider.IZIPAY, status: PaymentTransactionStatus.FAILED, errorMessage: 'Faltan credenciales Izipay', mode: 'prepared' };
  }
}
