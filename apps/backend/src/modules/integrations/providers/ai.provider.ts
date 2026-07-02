import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiProvider {
  constructor(private readonly config: ConfigService) {}
  status() { return { provider: this.config.get('AI_PROVIDER') ?? 'rules-engine', mode: this.config.get('AI_API_KEY') ? 'configured' : 'mock' }; }
}
