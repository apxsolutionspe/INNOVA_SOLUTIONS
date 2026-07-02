import { SunatDocumentStatus } from '@prisma/client';

export interface SunatResponse {
  status: SunatDocumentStatus;
  ticket?: string;
  responseCode?: string;
  responseMessage: string;
  mode: string;
}
