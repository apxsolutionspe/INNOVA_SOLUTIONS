import { Injectable } from '@nestjs/common';
import { WhatsappResponse } from '../interfaces/whatsapp-response.interface';

@Injectable()
export class WhatsappMockProvider {
  send(): WhatsappResponse {
    return { status: 'MOCK_SENT', providerMessageId: `WSP-MOCK-${Date.now()}`, mode: 'mock' };
  }
}
