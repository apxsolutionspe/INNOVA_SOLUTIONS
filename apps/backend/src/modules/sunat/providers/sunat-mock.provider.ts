import { Injectable } from '@nestjs/common';
import { SunatDocumentStatus, SunatDocumentType } from '@prisma/client';
import { SunatResponse } from '../interfaces/sunat-response.interface';

@Injectable()
export class SunatMockProvider {
  emit(type: SunatDocumentType, total: number): SunatResponse {
    return {
      status: SunatDocumentStatus.MOCK,
      ticket: `MOCK-${type}-${Date.now()}`,
      responseCode: 'MOCK',
      responseMessage: `Documento ${type} simulado por S/ ${total.toFixed(2)}. No tiene validez tributaria.`,
      mode: 'mock',
    };
  }

  test(): SunatResponse {
    return { status: SunatDocumentStatus.MOCK, responseCode: 'MOCK', responseMessage: 'Modo mock activo. No se conecta a SUNAT.', mode: 'mock' };
  }
}
