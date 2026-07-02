import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SunatAuthContext } from '../interfaces/sunat-auth.interface';

@Injectable()
export class SunatAuthProvider {
  constructor(private readonly config: ConfigService) {}

  context(): SunatAuthContext {
    const mode = (this.config.get<string>('SUNAT_MODE') ?? 'mock') as SunatAuthContext['mode'];
    return { mode, ruc: this.config.get<string>('SUNAT_RUC') };
  }
}
