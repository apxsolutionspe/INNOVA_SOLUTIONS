import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappProvider {
  constructor(private readonly config: ConfigService) {}
  isConfigured() { return Boolean(this.config.get('WHATSAPP_API_URL') && this.config.get('WHATSAPP_TOKEN') && this.config.get('WHATSAPP_PHONE_ID')); }
  status() { return { provider: 'WhatsApp Business', mode: this.isConfigured() ? 'configured' : 'mock' }; }
}
