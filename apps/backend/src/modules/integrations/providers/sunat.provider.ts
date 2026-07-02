import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SunatProvider {
  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.config.get('SUNAT_API_URL') && this.config.get('SUNAT_CLIENT_ID') && this.config.get('SUNAT_CLIENT_SECRET'));
  }

  status() {
    return { provider: 'SUNAT', mode: this.isConfigured() ? 'configured' : 'mock', environment: this.config.get('SUNAT_ENVIRONMENT') ?? 'development' };
  }
}
