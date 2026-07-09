import { QuickService } from '../types/quick-service.types';

export interface QuickServiceOption {
  label: string;
  description: string;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getQuickServiceOptions(service: QuickService): QuickServiceOption[] {
  const text = normalize(`${service.name} ${service.category?.name ?? ''}`);

  if (text.includes('impres')) {
    return [
      { label: 'Simple', description: 'Impresión por una cara.' },
      { label: 'Doble cara', description: 'Optimizada para ahorrar hojas.' },
      { label: 'Alta calidad', description: 'Configuración recomendada para imágenes o presentaciones.' },
    ];
  }

  if (text.includes('foto') || text.includes('copia')) {
    return [
      { label: 'Blanco y negro', description: 'Copia rápida para documentos comunes.' },
      { label: 'Color', description: 'Copia con mayor fidelidad visual.' },
    ];
  }

  if (text.includes('escaneo') || text.includes('scan')) {
    return [
      { label: 'PDF', description: 'Archivo digital listo para enviar.' },
      { label: 'Imagen', description: 'Formato de imagen individual.' },
      { label: 'Por lote', description: 'Varios documentos agrupados.' },
    ];
  }

  if (text.includes('pdf')) {
    return [
      { label: 'Unir', description: 'Combinar varios documentos.' },
      { label: 'Dividir', description: 'Separar páginas o secciones.' },
      { label: 'Comprimir', description: 'Reducir peso para envío digital.' },
    ];
  }

  if (text.includes('canva') || text.includes('diseno') || text.includes('dise')) {
    return [
      { label: 'Básico', description: 'Ajustes simples y entrega rápida.' },
      { label: 'Intermedio', description: 'Diseño con mayor personalización.' },
      { label: 'Premium', description: 'Mayor detalle visual y revisión final.' },
    ];
  }

  if (text.includes('tramite')) {
    return [
      { label: 'Simple', description: 'Registro o gestión digital directa.' },
      { label: 'Con asesoría', description: 'Acompañamiento durante el trámite.' },
    ];
  }

  return [
    { label: 'Estándar', description: 'Configuración base del servicio.' },
    { label: 'Prioritario', description: 'Atención preferente según disponibilidad.' },
  ];
}

export function estimateQuickServiceTime(service: QuickService) {
  const text = normalize(`${service.name} ${service.category?.name ?? ''}`);
  if (text.includes('diseno') || text.includes('canva')) return '20 a 45 min';
  if (text.includes('tramite')) return '15 a 30 min';
  if (text.includes('recarga')) return 'Inmediato';
  if (text.includes('escaneo') || text.includes('pdf')) return '5 a 15 min';
  return '5 a 10 min';
}

