import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { JsonpeProvider } from './providers/jsonpe.provider';
import {
  DocumentLookupResult,
  JsonpeBaseResponse,
  JsonpeDniResponse,
  JsonpeRucResponse,
  JsonpeStatus,
  NormalizedDniData,
  NormalizedRucData,
} from './types/document-lookup.types';

@Injectable()
export class DocumentLookupService {
  constructor(
    private readonly jsonpe: JsonpeProvider,
    private readonly prisma: PrismaService,
  ) {}

  async lookupDni(dni: string, user: AuthenticatedUser): Promise<DocumentLookupResult<NormalizedDniData>> {
    const documentNumber = this.normalizeDigits(dni);
    if (!/^\d{8}$/.test(documentNumber)) {
      throw new BadRequestException('El DNI debe tener exactamente 8 dígitos numéricos.');
    }

    try {
      const response = await this.jsonpe.lookupDni(documentNumber);
      const result = this.normalizeDniResponse(documentNumber, response);
      await this.audit(user.id, 'LOOKUP_DNI_JSONPE', documentNumber, result.success);
      return result;
    } catch (error) {
      await this.audit(user.id, 'LOOKUP_DNI_JSONPE', documentNumber, false);
      throw error;
    }
  }

  async lookupRuc(ruc: string, user: AuthenticatedUser): Promise<DocumentLookupResult<NormalizedRucData>> {
    const documentNumber = this.normalizeDigits(ruc);
    if (!/^\d{11}$/.test(documentNumber)) {
      throw new BadRequestException('El RUC debe tener exactamente 11 dígitos numéricos.');
    }

    try {
      const response = await this.jsonpe.lookupRuc(documentNumber);
      const result = this.normalizeRucResponse(documentNumber, response);
      await this.audit(user.id, 'LOOKUP_RUC_JSONPE', documentNumber, result.success);
      return result;
    } catch (error) {
      await this.audit(user.id, 'LOOKUP_RUC_JSONPE', documentNumber, false);
      throw error;
    }
  }

  getStatus(): JsonpeStatus {
    return this.jsonpe.getStatus();
  }

  private normalizeDniResponse(documentNumber: string, response: JsonpeDniResponse): DocumentLookupResult<NormalizedDniData> {
    const payload = this.extractPayload(response);
    const firstName = this.pickString(payload, ['nombres']) ?? '';
    const paternalSurname = this.pickString(payload, ['apellido_paterno']);
    const maternalSurname = this.pickString(payload, ['apellido_materno']);
    const surnames = [paternalSurname, maternalSurname].filter(Boolean).join(' ');
    const fullName = this.pickString(payload, ['nombre_completo']) ?? [surnames, firstName].filter(Boolean).join(', ');

    if (!this.isSuccessful(response, payload) || (!firstName && !fullName)) {
      return {
        success: false,
        provider: 'JSONPE',
        source: 'DNI',
        type: 'DNI',
        documentNumber,
        message: this.responseMessage(response) ?? 'No se encontró información para el documento consultado.',
      };
    }

    return {
      success: true,
      provider: 'JSONPE',
      source: 'DNI',
      type: 'DNI',
      documentNumber,
      data: {
        dni: this.pickString(payload, ['numero']) ?? documentNumber,
        fullName,
        firstName,
        names: firstName,
        surnames,
        paternalSurname,
        maternalSurname,
        verificationCode: this.pickNumber(payload, ['codigo_verificacion']),
        address: this.pickString(payload, ['direccion']),
        fullAddress: this.pickString(payload, ['direccion_completa']),
        ubigeoReniec: this.pickString(payload, ['ubigeo_reniec']),
        ubigeoSunat: this.pickString(payload, ['ubigeo_sunat']),
        ubigeo: this.pickStringArray(payload, ['ubigeo']),
      },
    };
  }

  private normalizeRucResponse(documentNumber: string, response: JsonpeRucResponse): DocumentLookupResult<NormalizedRucData> {
    const payload = this.extractPayload(response);
    const businessName = this.pickString(payload, ['nombre_o_razon_social']) ?? '';

    if (!this.isSuccessful(response, payload) || !businessName) {
      return {
        success: false,
        provider: 'JSONPE',
        source: 'RUC',
        type: 'RUC',
        documentNumber,
        message: this.responseMessage(response) ?? 'No se encontró información para el documento consultado.',
      };
    }

    return {
      success: true,
      provider: 'JSONPE',
      source: 'RUC',
      type: 'RUC',
      documentNumber,
      data: {
        ruc: this.pickString(payload, ['ruc']) ?? documentNumber,
        businessName,
        status: this.pickString(payload, ['estado']),
        condition: this.pickString(payload, ['condicion']),
        department: this.pickString(payload, ['departamento']),
        province: this.pickString(payload, ['provincia']),
        district: this.pickString(payload, ['distrito']),
        address: this.pickString(payload, ['direccion']),
        fullAddress: this.pickString(payload, ['direccion_completa']),
        ubigeoSunat: this.pickString(payload, ['ubigeo_sunat']),
        ubigeo: this.pickStringArray(payload, ['ubigeo']),
        isRetentionAgent: this.siNoToBoolean(this.pickString(payload, ['es_agente_de_retencion'])),
        isPerceptionAgent: this.siNoToBoolean(this.pickString(payload, ['es_agente_de_percepcion'])),
        isFuelPerceptionAgent: this.siNoToBoolean(this.pickString(payload, ['es_agente_de_percepcion_combustible'])),
        isGoodTaxpayer: this.siNoToBoolean(this.pickString(payload, ['es_buen_contribuyente'])),
      },
    };
  }

  private extractPayload(response: JsonpeBaseResponse): Record<string, unknown> {
    if (response.data && typeof response.data === 'object') {
      return response.data;
    }
    return response;
  }

  private isSuccessful(response: JsonpeBaseResponse, payload: Record<string, unknown>) {
    if (response.success === false) return false;
    return Object.keys(payload).length > 0;
  }

  private responseMessage(response: JsonpeBaseResponse) {
    const message = this.pickString(response, ['message', 'mensaje', 'error', 'detail']);
    if (message && /credito|credit|saldo|limite|limit/i.test(message)) {
      return 'No hay créditos disponibles en Json.pe.';
    }
    if (message && /not\s*found|no\s*encontr|sin\s*resultado|no\s*existe/i.test(message)) {
      return 'No se encontró información para el documento consultado.';
    }
    if (message && /token|bearer|autoriz|credencial|unauthorized|forbidden/i.test(message)) {
      return 'No se pudo autenticar con Json.pe. Verifica que el token sea válido.';
    }
    return message;
  }

  private pickValue(payload: Record<string, unknown>, keys: string[]) {
    return keys.map((key) => payload[key]).find((value) => value !== undefined && value !== null);
  }

  private pickString(payload: Record<string, unknown>, keys: string[]) {
    const value = this.pickValue(payload, keys);
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return undefined;
  }

  private pickNumber(payload: Record<string, unknown>, keys: string[]) {
    const value = this.pickValue(payload, keys);
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  private pickStringArray(payload: Record<string, unknown>, keys: string[]) {
    const value = this.pickValue(payload, keys);
    if (!Array.isArray(value)) return undefined;
    return value.map((item) => (typeof item === 'string' ? item : item === null ? null : String(item)));
  }

  private siNoToBoolean(value?: string) {
    if (!value) return undefined;
    const normalized = value.trim().toUpperCase();
    if (normalized === 'SI') return true;
    if (normalized === 'NO') return false;
    return undefined;
  }

  private normalizeDigits(value: string) {
    return value.replace(/\D/g, '');
  }

  private maskDocument(documentNumber: string) {
    if (documentNumber.length <= 8) return `${documentNumber.slice(0, 4)}****`;
    return `${documentNumber.slice(0, 4)}*****${documentNumber.slice(-3)}`;
  }

  private async audit(userId: string, action: string, documentNumber: string, success: boolean) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        module: 'document-lookup',
        action,
        description: `${action} ${this.maskDocument(documentNumber)} resultado=${success ? 'success' : 'error'}`,
        entityType: 'DocumentLookup',
      },
    });
  }
}
