import { Injectable } from '@nestjs/common';
import { PaymentProvider, PaymentTransactionStatus } from '@prisma/client';
import { PaymentResponse } from '../interfaces/payment-response.interface';

@Injectable()
export class PaymentMockProvider {
  create(provider: PaymentProvider, amount: number): PaymentResponse {
    return {
      provider,
      status: PaymentTransactionStatus.MOCK,
      paymentLink: `https://mock-payments.local/${provider.toLowerCase()}/${Date.now()}`,
      providerTransactionId: `MOCK-${Date.now()}`,
      providerResponse: { amount, message: 'Pago simulado' },
      mode: 'mock',
    };
  }
}
