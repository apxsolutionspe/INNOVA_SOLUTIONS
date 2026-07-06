import { BadRequestException } from '@nestjs/common';

export function normalizePhoneForWhatsApp(phone: string, defaultCountryCode = '51') {
  const digits = phone.replace(/[^\d]/g, '');
  const countryCode = defaultCountryCode.replace(/[^\d]/g, '') || '51';
  const normalized = digits.length === 9 ? `${countryCode}${digits}` : digits;

  if (normalized.length < 11 || normalized.length > 15) {
    throw new BadRequestException('Numero de WhatsApp invalido.');
  }

  return normalized;
}

export function buildWhatsAppReceiptUrl(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
