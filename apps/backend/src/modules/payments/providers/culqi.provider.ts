import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider, PaymentTransactionStatus } from '@prisma/client';
import { PaymentResponse } from '../interfaces/payment-response.interface';

@Injectable()
export class CulqiProvider {
  constructor(private readonly config: ConfigService) {}
  mode() { return (this.config.get<string>('CULQI_MODE') ?? 'mock').toLowerCase(); }
  isConfigured() { return Boolean(this.config.get('CULQI_PRIVATE_KEY')); }
  async createPreparedLink(amount: number): Promise<PaymentResponse> {
    if (this.mode() === 'mock') return { provider: PaymentProvider.CULQI, status: PaymentTransactionStatus.MOCK, paymentLink: `https://mock-payments.local/culqi/${Date.now()}`, providerTransactionId: `CULQI-MOCK-${Date.now()}`, providerResponse: { amount }, mode: 'mock' };
    return this.isConfigured()
      ? { provider: PaymentProvider.CULQI, status: PaymentTransactionStatus.PENDING, providerResponse: { message: 'Provider Culqi preparado. Falta activar endpoint real especifico.' }, mode: 'prepared' }
      : { provider: PaymentProvider.CULQI, status: PaymentTransactionStatus.FAILED, errorMessage: 'Falta CULQI_PRIVATE_KEY', mode: 'prepared' };
  }
}
