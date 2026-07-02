import { Injectable } from '@nestjs/common';
import { SunatDocumentType } from '@prisma/client';
import { SunatResponse } from '../interfaces/sunat-response.interface';

@Injectable()
export class SunatCpeProvider {
  async emitPrepared(_type: SunatDocumentType): Promise<SunatResponse> {
    return {
      status: 'ERROR' as any,
      responseCode: 'NOT_IMPLEMENTED',
      responseMessage: 'Provider real preparado. Falta implementar autenticacion, firma XML y envio CPE con credenciales certificadas.',
      mode: 'prepared',
    };
  }
}
