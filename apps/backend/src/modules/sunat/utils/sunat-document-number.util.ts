import { SunatDocumentType } from '@prisma/client';

export function defaultSeries(type: SunatDocumentType) {
  if (type === SunatDocumentType.FACTURA) return 'F001';
  if (type === SunatDocumentType.BOLETA) return 'B001';
  if (type === SunatDocumentType.NOTA_CREDITO) return 'FC01';
  return 'FD01';
}
