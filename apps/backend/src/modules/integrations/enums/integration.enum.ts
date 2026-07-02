export enum IntegrationProviderKey {
  SUNAT = 'SUNAT',
  WHATSAPP = 'WHATSAPP',
  CULQI = 'CULQI',
  IZIPAY = 'IZIPAY',
  AI = 'AI',
  ECOMMERCE = 'ECOMMERCE',
}

export enum IntegrationModeKey {
  MOCK = 'MOCK',
  SANDBOX = 'SANDBOX',
  PRODUCTION = 'PRODUCTION',
}

export enum IntegrationStatusKey {
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  CONFIGURED = 'CONFIGURED',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  MOCK = 'MOCK',
}
