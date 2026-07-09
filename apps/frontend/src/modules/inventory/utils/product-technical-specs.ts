import type { Product, ProductTechnicalSpecs } from '../types/inventory.types';

export interface ProductTechnicalSpecItem {
  label: string;
  value: string;
}

export interface ProductTechnicalSpecGroup {
  title: string;
  items: ProductTechnicalSpecItem[];
}

interface ProductTechnicalFallback {
  groups: ProductTechnicalSpecGroup[];
}

const GENERIC_SPEC_PATTERNS = [
  'uso diario',
  'consultar proveedor',
  'segun configuracion registrada',
  'según configuración registrada',
  'equipo de computo',
  'equipo de cómputo',
  'oficina estudios y gestion empresarial',
  'oficina estudios y gestión empresarial',
];

const SPEC_LABELS: Record<string, string> = {
  procesador: 'Procesador',
  processor: 'Procesador',
  cpu: 'Procesador',
  generacion: 'Generación',
  ram: 'Memoria RAM',
  memoria: 'Memoria RAM',
  memoria_ram: 'Memoria RAM',
  almacenamiento: 'Almacenamiento',
  storage: 'Almacenamiento',
  disco: 'Almacenamiento',
  tipo_almacenamiento: 'Tipo de disco',
  pantalla: 'Pantalla',
  screen: 'Pantalla',
  resolucion: 'Resolución',
  resolution: 'Resolución',
  grafica: 'Gráficos',
  graficos: 'Gráficos',
  gpu: 'Gráficos',
  sistema_operativo: 'Sistema operativo',
  os: 'Sistema operativo',
  color: 'Color',
  condicion: 'Condición',
  estado: 'Condición',
  ano: 'Año',
  year: 'Año',
  version: 'Versión',
  conectividad: 'Conectividad',
  bateria: 'Batería',
  garantia: 'Garantía',
  tecnologia: 'Tecnología',
  compatibilidad: 'Compatibilidad',
  rendimiento: 'Rendimiento',
  capacidad: 'Capacidad',
  frecuencia: 'Frecuencia',
  tipo: 'Tipo',
  interfaz: 'Interfaz',
  plataforma: 'Plataforma',
  duracion: 'Duración',
  dispositivos: 'Número de dispositivos',
  tamano: 'Tamaño',
  linea: 'Línea',
};

const PRODUCT_FALLBACKS: Record<string, ProductTechnicalFallback> = {
  'laptop asus vivobook': laptopSpecs({
    brand: 'Asus',
    line: 'VivoBook',
    processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
    generation: '11.a / 12.a generación referencial',
    graphics: 'Integrados Intel UHD / AMD Radeon según configuración',
  }),
  'laptop asus vivobook i5': laptopSpecs({
    brand: 'Asus',
    line: 'VivoBook',
    processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
    generation: '11.a / 12.a generación referencial',
    graphics: 'Integrados Intel UHD / AMD Radeon según configuración',
  }),
  'laptop dell inspiron': laptopSpecs({
    brand: 'Dell',
    line: 'Inspiron',
    processor: 'Intel Core i5',
    generation: '11.a / 12.a generación referencial',
    graphics: 'Intel UHD / Intel Iris Xe según configuración',
  }),
  'laptop dell inspiron 3520': laptopSpecs({
    brand: 'Dell',
    line: 'Inspiron 3520',
    processor: 'Intel Core i5',
    generation: '11.a / 12.a generación referencial',
    graphics: 'Intel UHD / Intel Iris Xe según configuración',
  }),
  'laptop acer aspire': laptopSpecs({
    brand: 'Acer',
    line: 'Aspire',
    processor: 'Intel Core i5',
    generation: '11.a / 12.a generación referencial',
    graphics: 'Intel UHD Graphics',
    diskType: 'SSD NVMe',
  }),
  'laptop acer aspire 5': laptopSpecs({
    brand: 'Acer',
    line: 'Aspire',
    processor: 'Intel Core i5',
    generation: '11.a / 12.a generación referencial',
    graphics: 'Intel UHD Graphics',
    diskType: 'SSD NVMe',
  }),
  'laptop hp core i5': laptopSpecs({
    brand: 'HP',
    line: 'Core i5',
    processor: 'Intel Core i5',
    generation: '11.a / 12.a generación referencial',
    graphics: 'Intel UHD / Iris Xe según configuración',
  }),
  'laptop hp 15 ryzen 5': laptopSpecs({
    brand: 'HP',
    line: '15 Ryzen 5',
    processor: 'AMD Ryzen 5',
    generation: 'Configuración referencial según modelo',
    graphics: 'AMD Radeon integrada',
  }),
  'laptop lenovo ideapad': laptopSpecs({
    brand: 'Lenovo',
    line: 'IdeaPad',
    processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
    generation: '11.a / 12.a generación referencial',
    graphics: 'Integrados',
    diskType: 'SSD NVMe',
  }),
  'ssd kingston 480gb': {
    groups: [
      {
        title: 'Detalles técnicos',
        items: [
          spec('Marca', 'Kingston'),
          spec('Capacidad', '480 GB'),
          spec('Tipo', 'SSD'),
          spec('Interfaz', 'SATA III'),
          spec('Formato', '2.5 pulgadas'),
          spec('Velocidad referencial', 'Hasta 500 MB/s de lectura'),
          spec('Compatibilidad', 'Laptops y PCs con puerto SATA'),
          spec('Garantía', '12 meses referencial'),
        ],
      },
    ],
  },
  'memoria ram 8gb': ramSpecs('8 GB'),
  'memoria ram 16gb ddr4': ramSpecs('16 GB'),
  'router tp link': {
    groups: [
      {
        title: 'Detalles técnicos',
        items: [
          spec('Marca', 'TP-Link'),
          spec('Tipo', 'Router inalámbrico'),
          spec('Frecuencia', '2.4 GHz / doble banda según modelo'),
          spec('Velocidad', 'Según modelo disponible'),
          spec('Puertos', 'LAN/WAN'),
          spec('Seguridad', 'WPA/WPA2'),
          spec('Uso recomendado', 'Hogar, oficina pequeña y negocio'),
          spec('Garantía', '12 meses referencial'),
        ],
      },
    ],
  },
  'monitor samsung 24': {
    groups: [
      {
        title: 'Detalles técnicos',
        items: [
          spec('Marca', 'Samsung'),
          spec('Tamaño', '24 pulgadas'),
          spec('Resolución', 'Full HD referencial'),
          spec('Panel', 'LED'),
          spec('Conectividad', 'HDMI / VGA según modelo'),
          spec('Uso recomendado', 'Oficina, estudio y multitarea'),
          spec('Garantía', '12 meses referencial'),
        ],
      },
    ],
  },
  'teclado redragon': peripheralSpecs('Redragon', 'Teclado gamer', 'USB', 'RGB según modelo', 'Windows', 'Gaming, oficina y escritura intensiva'),
  'mouse logitech': peripheralSpecs('Logitech', 'Mouse óptico', 'USB / inalámbrico según modelo', undefined, 'Windows, laptop y PC', 'Oficina, estudio y uso diario'),
  'tinta epson': printSupplySpecs('Epson', 'Tinta para impresora', 'Según presentación', 'Validar modelo de impresora', 'Referencial según modelo', 'Impresión doméstica y oficina'),
  'botella tinta epson negra': printSupplySpecs('Epson', 'Botella de tinta', 'Negro', 'Impresoras Epson EcoTank compatibles', undefined, 'Documentos y oficina', 'Botella'),
  'cartucho canon color': printSupplySpecs('Canon', 'Cartucho de tinta', 'Color', 'Validar modelo Canon', undefined, 'Impresión a color', 'Cartucho'),
  'papel bond a4': {
    groups: [
      {
        title: 'Detalles técnicos',
        items: [
          spec('Tipo', 'Papel bond'),
          spec('Tamaño', 'A4'),
          spec('Gramaje', '75 g/m2 referencial'),
          spec('Presentación', 'Paquete'),
          spec('Compatibilidad', 'Impresoras láser e inyección'),
        ],
      },
    ],
  },
  'papel bond a4 500 hojas': {
    groups: [
      {
        title: 'Detalles técnicos',
        items: [
          spec('Tipo', 'Papel bond'),
          spec('Tamaño', 'A4'),
          spec('Gramaje', '75 g/m2 referencial'),
          spec('Presentación', 'Paquete de 500 hojas'),
          spec('Compatibilidad', 'Impresoras láser e inyección'),
        ],
      },
    ],
  },
  'licencia microsoft office': softwareSpecs('Microsoft', 'Microsoft Office / Microsoft 365 según registro', 'Licencia de productividad', 'Word, Excel, PowerPoint', 'Según plan adquirido', 'Windows / web según licencia'),
  'licencia windows 11 pro': softwareSpecs('Microsoft', 'Windows 11 Pro', 'Sistema operativo', 'Activación digital según proveedor', 'Según licencia adquirida', 'PC'),
  'licencia adobe acrobat': softwareSpecs('Adobe', 'Acrobat', 'Licencia PDF', 'Lectura, edición y gestión de PDF', 'Según licencia', 'Windows / web según plan'),
  'antivirus eset': softwareSpecs('ESET', 'Antivirus / seguridad', 'Licencia de seguridad', 'Protección contra malware, phishing y amenazas', 'Según licencia', 'Windows según licencia'),
  'antivirus eset 1 usuario': softwareSpecs('ESET', 'Antivirus ESET 1 usuario', 'Licencia de seguridad', 'Protección contra malware, phishing y amenazas', 'Según licencia', 'Windows según licencia'),
};

export function normalizeProductName(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getProductTechnicalSpecs(product: Product): ProductTechnicalSpecGroup[] {
  const existingGroups = parseExistingSpecs(product.technicalSpecs);
  if (hasUsefulTechnicalSpecs(existingGroups)) {
    return existingGroups;
  }

  return findFallbackSpecs(product).groups;
}

export function hasUsefulTechnicalSpecs(groups: ProductTechnicalSpecGroup[]): boolean {
  const values = groups.flatMap((group) => group.items.flatMap((item) => [item.label, item.value]));
  const usefulValues = values.filter((value) => !isGenericSpecValue(value));
  return usefulValues.length >= 4 && groups.some((group) => group.items.length >= 2);
}

export function isGenericSpecValue(value?: string | number | null): boolean {
  const normalized = normalizeProductName(String(value ?? ''));
  if (!normalized) return true;

  return GENERIC_SPEC_PATTERNS.some((pattern) => normalized.includes(normalizeProductName(pattern)));
}

function parseExistingSpecs(specs?: ProductTechnicalSpecs | null): ProductTechnicalSpecGroup[] {
  if (!specs || typeof specs !== 'object') return [];

  const groups: ProductTechnicalSpecGroup[] = [];

  for (const [groupOrKey, rawValue] of Object.entries(specs)) {
    if (rawValue && typeof rawValue === 'object') {
      const items = Object.entries(rawValue)
        .map(([key, value]) => spec(formatSpecLabel(key), String(value ?? '').trim()))
        .filter((item) => item.label && item.value && !isGenericSpecValue(item.value));

      if (items.length) groups.push({ title: formatSpecLabel(groupOrKey), items });
      continue;
    }

    const value = String(rawValue ?? '').trim();
    if (value && !isGenericSpecValue(value)) {
      const general = groups.find((group) => group.title === 'Características') ?? { title: 'Características', items: [] };
      general.items.push(spec(formatSpecLabel(groupOrKey), value));
      if (!groups.includes(general)) groups.push(general);
    }
  }

  return groups;
}

function findFallbackSpecs(product: Product): ProductTechnicalFallback {
  const name = normalizeProductName(product.name);
  const category = normalizeProductName(product.category?.name);
  const exact = PRODUCT_FALLBACKS[name];
  if (exact) return exact;

  const partial = Object.entries(PRODUCT_FALLBACKS).find(([key]) => name.includes(key) || key.includes(name));
  if (partial) return partial[1];

  if (category.includes('laptop') || category.includes('computadora') || name.includes('laptop')) {
    return laptopSpecs({
      brand: product.brand || 'Marca referencial',
      line: product.model || product.name,
      processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
      generation: 'Configuración referencial según modelo',
      graphics: 'Integrados según configuración',
    });
  }

  if (category.includes('componente')) {
    return {
      groups: [
        {
          title: 'Detalles técnicos',
          items: [
            spec('Tipo', 'Componente de hardware'),
            spec('Compatibilidad', 'Validar con el equipo antes de instalar'),
            spec('Uso recomendado', 'Actualización o reparación de PC/laptop'),
            spec('Garantía', '12 meses referencial'),
          ],
        },
      ],
    };
  }

  if (category.includes('red')) {
    return {
      groups: [
        {
          title: 'Detalles técnicos',
          items: [
            spec('Tipo', 'Dispositivo de red'),
            spec('Conectividad', 'Ethernet / WiFi según modelo'),
            spec('Uso recomendado', 'Hogar, oficina o negocio'),
            spec('Garantía', '12 meses referencial'),
          ],
        },
      ],
    };
  }

  if (category.includes('software')) {
    return softwareSpecs(product.brand || 'Proveedor referencial', product.name, 'Licencia de software', 'Productividad, seguridad o gestión digital', 'Según plan adquirido', 'Windows / web según licencia');
  }

  return {
    groups: [
      {
        title: 'Detalles técnicos',
        items: [
          spec('Categoría', product.category?.name || 'Producto tecnológico'),
          spec('Unidad', product.unit || 'unidad'),
          spec('Compatibilidad', 'Validar especificaciones exactas antes de vender'),
          spec('Garantía', '12 meses referencial'),
        ],
      },
    ],
  };
}

function laptopSpecs(input: {
  brand: string;
  line: string;
  processor: string;
  generation: string;
  graphics: string;
  diskType?: string;
}): ProductTechnicalFallback {
  return {
    groups: [
      {
        title: 'Sistema',
        items: [
          spec('Marca', input.brand),
          spec('Línea', input.line),
          spec('Procesador', input.processor),
          spec('Generación', input.generation),
          spec('Sistema operativo', 'Windows 11'),
        ],
      },
      {
        title: 'Memoria y almacenamiento',
        items: [
          spec('Memoria RAM', '8 GB DDR4'),
          spec('Almacenamiento', 'SSD 512 GB'),
          spec('Tipo de disco', input.diskType ?? 'SSD NVMe / SATA según modelo'),
        ],
      },
      {
        title: 'Pantalla y gráficos',
        items: [
          spec('Pantalla', '15.6 pulgadas Full HD'),
          spec('Gráficos', input.graphics),
        ],
      },
      {
        title: 'Conectividad',
        items: [
          spec('Conectividad', 'WiFi, Bluetooth, USB, HDMI'),
          spec('Garantía', '12 meses referencial'),
        ],
      },
    ],
  };
}

function ramSpecs(capacity: string): ProductTechnicalFallback {
  return {
    groups: [
      {
        title: 'Detalles técnicos',
        items: [
          spec('Capacidad', capacity),
          spec('Tipo', 'DDR4 referencial'),
          spec('Frecuencia', '2666 / 3200 MHz según modelo'),
          spec('Formato', 'DIMM / SODIMM según disponibilidad'),
          spec('Compatibilidad', 'Validar DDR y formato antes de instalar'),
          spec('Uso recomendado', 'Mejora de rendimiento y multitarea'),
          spec('Garantía', '12 meses referencial'),
        ],
      },
    ],
  };
}

function peripheralSpecs(
  brand: string,
  type: string,
  connectivity: string,
  lighting: string | undefined,
  compatibility: string,
  recommendedUse: string,
): ProductTechnicalFallback {
  return {
    groups: [
      {
        title: 'Detalles técnicos',
        items: [
          spec('Marca', brand),
          spec('Tipo', type),
          spec('Conectividad', connectivity),
          ...(lighting ? [spec('Iluminación', lighting)] : []),
          spec('Compatibilidad', compatibility),
          spec('Uso recomendado', recommendedUse),
          spec('Garantía', '12 meses referencial'),
        ],
      },
    ],
  };
}

function printSupplySpecs(
  brand: string,
  type: string,
  color: string,
  compatibility: string,
  performance: string | undefined,
  recommendedUse: string,
  presentation?: string,
): ProductTechnicalFallback {
  return {
    groups: [
      {
        title: 'Detalles técnicos',
        items: [
          spec('Marca', brand),
          spec('Tipo', type),
          spec('Color', color),
          spec('Compatibilidad', compatibility),
          ...(performance ? [spec('Rendimiento', performance)] : []),
          ...(presentation ? [spec('Presentación', presentation)] : []),
          spec('Uso recomendado', recommendedUse),
        ],
      },
    ],
  };
}

function softwareSpecs(
  brand: string,
  product: string,
  type: string,
  feature: string,
  duration: string,
  platform: string,
): ProductTechnicalFallback {
  return {
    groups: [
      {
        title: 'Detalles técnicos',
        items: [
          spec('Marca', brand),
          spec('Producto', product),
          spec('Tipo', type),
          spec(type.includes('seguridad') || product.toLowerCase().includes('antivirus') ? 'Protección' : 'Aplicaciones', feature),
          spec('Duración', duration),
          spec('Plataforma', platform),
        ],
      },
    ],
  };
}

function spec(label: string, value: string | number): ProductTechnicalSpecItem {
  return { label, value: String(value).trim() };
}

function formatSpecLabel(key: string) {
  const normalized = normalizeProductName(key).replace(/\s+/g, '_');
  if (SPEC_LABELS[normalized]) return SPEC_LABELS[normalized];

  return key
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase());
}
