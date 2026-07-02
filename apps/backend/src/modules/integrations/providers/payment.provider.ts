import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentProvider {
  constructor(private readonly config: ConfigService) {}
  status() {
    return {
      culqi: this.config.get('CULQI_PRIVATE_KEY') ? 'configured' : 'mock',
      izipay: this.config.get('IZIPAY_API_KEY') ? 'configured' : 'mock',
    };
  }
}
