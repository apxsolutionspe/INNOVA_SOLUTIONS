import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JsonpeBaseResponse, JsonpeDniResponse, JsonpeRucResponse, JsonpeStatus } from '../types/document-lookup.types';

interface JsonpeConfig {
  baseUrl: string;
  timeoutMs: number;
  token?: string;
}

@Injectable()
export class JsonpeProvider {
  private readonly defaultBaseUrl = 'https://api.json.pe/api';
  private readonly defaultTimeoutMs = 30000;
  private readonly logger = new Logger(JsonpeProvider.name);

  constructor(private readonly config: ConfigService) {}

  getStatus(): JsonpeStatus {
    const { baseUrl, timeoutMs, token } = this.getConfig();
    const tokenConfigured = Boolean(token);

    return {
      success: true,
      provider: 'JSONPE',
      configured: tokenConfigured,
      dniConfigured: tokenConfigured,
      rucConfigured: tokenConfigured,
      baseUrl,
      timeoutMs,
      dniUrl: this.buildUrl(baseUrl, 'dni'),
      rucUrl: this.buildUrl(baseUrl, 'ruc'),
      tokenConfigured,
      ...(token ? { tokenLength: token.length } : {}),
      ...(token ? {} : { message: 'Json.pe no está configurado. Verifica JSONPE_TOKEN en el backend.' }),
    };
  }

  async lookupDni(dni: string): Promise<JsonpeDniResponse> {
    return this.request<JsonpeDniResponse>('dni', { dni }, 'DNI');
  }

  async lookupRuc(ruc: string): Promise<JsonpeRucResponse> {
    return this.request<JsonpeRucResponse>('ruc', { ruc }, 'RUC');
  }

  private async request<TResponse extends JsonpeBaseResponse>(
    resource: 'dni' | 'ruc',
    body: Record<string, string>,
    _documentType: 'DNI' | 'RUC',
  ): Promise<TResponse> {
    const { baseUrl, timeoutMs, token } = this.getConfig();
    const endpoint = this.buildUrl(baseUrl, resource);

    if (!token) {
      this.throwMissingTokenError();
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = Date.now();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const payload = await this.parseResponse(response);
      const externalMessage = this.extractProviderMessage(payload);

      this.logDiagnostics({
        endpoint,
        status: response.status,
        durationMs: Date.now() - startedAt,
        tokenConfigured: Boolean(token),
        tokenLength: token.length,
        externalMessage,
      });

      if (response.status === 401 || response.status === 403) {
        throw new BadRequestException('No se pudo autenticar con Json.pe. Verifica que el token sea válido.');
      }

      if (response.status === 402 || response.status === 429 || this.isCreditsMessage(externalMessage)) {
        throw new BadRequestException('No hay créditos disponibles en Json.pe.');
      }

      if (response.status === 400 || response.status === 422) {
        return this.failedResponse(payload, 'El documento consultado no es válido o falta un campo requerido.') as TResponse;
      }

      if (response.status === 404) {
        return this.failedResponse(payload, 'No se encontró información para el documento consultado.') as TResponse;
      }

      if (response.status === 408) {
        throw new ServiceUnavailableException('Json.pe no respondió dentro del tiempo esperado. Intenta nuevamente.');
      }

      if ([500, 502, 503, 504].includes(response.status)) {
        throw new ServiceUnavailableException('Json.pe no está disponible temporalmente. Intenta nuevamente.');
      }

      if (!response.ok) {
        throw new ServiceUnavailableException('No se pudo procesar la respuesta de Json.pe.');
      }

      return payload as TResponse;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ServiceUnavailableException) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        this.logDiagnostics({
          endpoint,
          durationMs: Date.now() - startedAt,
          tokenConfigured: Boolean(token),
          tokenLength: token.length,
          externalMessage: 'AbortError',
        });
        throw new ServiceUnavailableException('Json.pe no respondió dentro del tiempo esperado. Intenta nuevamente.');
      }
      this.logDiagnostics({
        endpoint,
        durationMs: Date.now() - startedAt,
        tokenConfigured: Boolean(token),
        tokenLength: token.length,
        externalMessage: error instanceof Error ? error.message : 'Network error',
      });
      throw new ServiceUnavailableException('No se pudo conectar con Json.pe desde el backend.');
    } finally {
      clearTimeout(timeout);
    }
  }

  private async parseResponse(response: Response): Promise<JsonpeBaseResponse> {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return {};
    }

    try {
      return (await response.json()) as JsonpeBaseResponse;
    } catch {
      throw new ServiceUnavailableException('No se pudo procesar la respuesta de Json.pe.');
    }
  }

  private failedResponse(payload: JsonpeBaseResponse, fallbackMessage: string): JsonpeBaseResponse {
    return {
      ...payload,
      success: false,
      message: this.cleanProviderMessage(this.extractProviderMessage(payload)) ?? fallbackMessage,
    };
  }

  private buildUrl(baseUrl: string, resource: 'dni' | 'ruc') {
    return `${baseUrl.replace(/\/+$/, '')}/${resource}`;
  }

  private getConfig(): JsonpeConfig {
    const baseUrl = (this.cleanEnvValue(this.config.get<string>('JSONPE_BASE_URL')) || this.defaultBaseUrl).replace(/\/+$/, '');
    const configuredTimeout = Number(this.cleanEnvValue(this.config.get<string>('JSONPE_TIMEOUT_MS')) ?? this.defaultTimeoutMs);
    const timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : this.defaultTimeoutMs;
    const token = this.cleanEnvValue(this.config.get<string>('JSONPE_TOKEN'));

    return {
      baseUrl,
      timeoutMs,
      token: token && !this.isPlaceholderToken(token) ? token : undefined,
    };
  }

  private cleanEnvValue(value?: string) {
    const cleaned = value?.trim().replace(/^['"]|['"]$/g, '');
    if (!cleaned) return undefined;
    return cleaned.replace(/^Bearer\s+/i, '').trim();
  }

  private isPlaceholderToken(token: string) {
    return ['TOKEN_REAL_DE_JSONPE_SIN_BEARER', 'TOKEN_REAL_SIN_BEARER', 'TOKEN_REAL_JSONPE', '<TOKEN_JSONPE>', 'CHANGE_ME'].includes(
      token.toUpperCase(),
    );
  }

  private extractProviderMessage(payload?: JsonpeBaseResponse) {
    const message = payload?.message ?? payload?.mensaje ?? payload?.error ?? payload?.detail;
    return typeof message === 'string' ? message : undefined;
  }

  private isCreditsMessage(message?: string) {
    return Boolean(message && /credito|credit|saldo|limite|limit|quota|plan/i.test(message));
  }

  private cleanProviderMessage(message?: string) {
    if (!message) return undefined;
    if (this.isCreditsMessage(message)) {
      return 'No hay créditos disponibles en Json.pe.';
    }
    if (/not\s*found|no\s*encontr|sin\s*resultado|no\s*existe/i.test(message)) {
      return 'No se encontró información para el documento consultado.';
    }
    if (/token|bearer|autoriz|credencial|unauthorized|forbidden/i.test(message)) {
      return 'No se pudo autenticar con Json.pe. Verifica que el token sea válido.';
    }
    return message;
  }

  private logDiagnostics(meta: {
    endpoint: string;
    status?: number;
    durationMs: number;
    tokenConfigured: boolean;
    tokenLength: number;
    externalMessage?: string;
  }) {
    if (process.env.NODE_ENV === 'production') return;

    this.logger.debug(
      JSON.stringify({
        provider: 'JSONPE',
        endpoint: meta.endpoint,
        httpStatus: meta.status,
        durationMs: meta.durationMs,
        tokenConfigured: meta.tokenConfigured,
        tokenLength: meta.tokenLength,
        externalMessage: meta.externalMessage,
      }),
    );
  }

  private throwMissingTokenError(): never {
    throw new BadRequestException({
      success: false,
      code: 'JSONPE_TOKEN_MISSING',
      message: 'Json.pe no está configurado. Verifica JSONPE_TOKEN en el backend.',
    });
  }
}
