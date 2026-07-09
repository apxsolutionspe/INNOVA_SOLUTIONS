export type ProductTechnicalSpecs = Record<string, Record<string, string>>;

export interface ProductTechnicalProfile {
  brand?: string;
  model?: string;
  warranty?: string;
  recommendedUse?: string;
  technicalSpecs: ProductTechnicalSpecs;
}

const COMMON_WARRANTY = '12 meses referencial';

const PRODUCT_SPEC_PROFILES: Record<string, ProductTechnicalProfile> = {
  'laptop dell inspiron': laptopProfile({
    brand: 'Dell',
    model: 'Inspiron',
    processor: 'Intel Core i5',
    generation: '11.a / 12.a generacion referencial',
    graphics: 'Intel UHD / Iris Xe segun configuracion',
  }),
  'laptop dell inspiron 3520': laptopProfile({
    brand: 'Dell',
    model: 'Inspiron 3520',
    processor: 'Intel Core i5',
    generation: '11.a / 12.a generacion referencial',
    graphics: 'Intel UHD / Iris Xe segun configuracion',
  }),
  'laptop acer aspire': laptopProfile({
    brand: 'Acer',
    model: 'Aspire',
    processor: 'Intel Core i5',
    generation: '11.a / 12.a generacion referencial',
    graphics: 'Intel UHD Graphics',
  }),
  'laptop acer aspire 5': laptopProfile({
    brand: 'Acer',
    model: 'Aspire 5',
    processor: 'Intel Core i5',
    generation: '11.a / 12.a generacion referencial',
    graphics: 'Intel UHD Graphics',
  }),
  'laptop asus vivobook': laptopProfile({
    brand: 'Asus',
    model: 'VivoBook',
    processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
    generation: 'Segun configuracion disponible',
    graphics: 'Graficos integrados',
    connectivity: 'WiFi, Bluetooth, USB-C, HDMI',
  }),
  'laptop asus vivobook i5': laptopProfile({
    brand: 'Asus',
    model: 'VivoBook i5',
    processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
    generation: 'Segun configuracion disponible',
    graphics: 'Graficos integrados',
    connectivity: 'WiFi, Bluetooth, USB-C, HDMI',
  }),
  'laptop hp core i5': laptopProfile({
    brand: 'HP',
    model: 'Core i5',
    processor: 'Intel Core i5',
    generation: '11.a / 12.a generacion referencial',
    graphics: 'Intel UHD / Iris Xe segun configuracion',
  }),
  'laptop hp 15 ryzen 5': laptopProfile({
    brand: 'HP',
    model: '15 Ryzen 5',
    processor: 'AMD Ryzen 5',
    generation: 'Segun configuracion disponible',
    graphics: 'AMD Radeon integrada',
  }),
  'laptop lenovo ideapad': laptopProfile({
    brand: 'Lenovo',
    model: 'IdeaPad',
    processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
    generation: 'Segun configuracion disponible',
    graphics: 'Graficos integrados',
  }),
  'ssd kingston 480gb': {
    brand: 'Kingston',
    model: '480GB',
    warranty: COMMON_WARRANTY,
    recommendedUse: 'Actualizacion de almacenamiento para laptop o PC',
    technicalSpecs: {
      Almacenamiento: {
        Capacidad: '480 GB',
        Tipo: 'SSD',
        Interfaz: 'SATA III',
        Formato: '2.5 pulgadas',
      },
      Rendimiento: {
        'Velocidad referencial': 'Hasta 500 MB/s de lectura',
        Compatibilidad: 'Laptops y PCs con puerto SATA',
      },
      Garantia: {
        Garantia: COMMON_WARRANTY,
      },
    },
  },
  'ssd nvme kingston 1tb': {
    brand: 'Kingston',
    model: 'NVMe 1TB',
    warranty: COMMON_WARRANTY,
    recommendedUse: 'Almacenamiento rapido para PC o laptop compatible',
    technicalSpecs: {
      Almacenamiento: {
        Capacidad: '1 TB',
        Tipo: 'SSD NVMe',
        Interfaz: 'M.2 NVMe',
        Compatibilidad: 'Validar ranura M.2 NVMe antes de instalar',
      },
      Rendimiento: {
        Uso: 'Arranque rapido, programas y transferencia de archivos',
        Garantia: COMMON_WARRANTY,
      },
    },
  },
  'memoria ram 8gb': ramProfile('8 GB'),
  'memoria ram 16gb ddr4': ramProfile('16 GB'),
  'procesador intel core i5': {
    brand: 'Intel',
    model: 'Core i5',
    warranty: COMMON_WARRANTY,
    recommendedUse: 'Oficina, estudios, productividad y multitarea',
    technicalSpecs: {
      Procesador: {
        Marca: 'Intel',
        Linea: 'Core i5',
        Generacion: 'Segun modelo disponible',
        Nucleos: 'Segun generacion',
        'Graficos integrados': 'Segun modelo',
      },
      Compatibilidad: {
        Compatibilidad: 'Validar socket y placa madre',
        Uso: 'Oficina, estudios, productividad y multitarea',
      },
    },
  },
  'placa madre h610': {
    brand: 'Intel',
    model: 'H610',
    warranty: COMMON_WARRANTY,
    recommendedUse: 'Armado de PC de oficina o estudio',
    technicalSpecs: {
      Plataforma: {
        Chipset: 'Intel H610',
        Socket: 'LGA 1700 referencial',
        'Memoria compatible': 'DDR4 / DDR5 segun modelo exacto',
      },
      Conectividad: {
        Puertos: 'USB, LAN, audio y video segun modelo',
        Uso: 'Armado de PC de oficina o estudio',
      },
    },
  },
  'fuente de poder 600w': {
    model: '600W',
    warranty: COMMON_WARRANTY,
    recommendedUse: 'PC de oficina o equipo de escritorio',
    technicalSpecs: {
      Energia: {
        Potencia: '600 W',
        Tipo: 'Fuente de poder para PC',
        Compatibilidad: 'Gabinetes ATX segun modelo',
      },
      Garantia: {
        Garantia: COMMON_WARRANTY,
      },
    },
  },
  'router tp link': networkProfile('TP-Link', 'Router inalambrico', 'Hogar, oficina pequena y negocio'),
  'switch tp link 8 puertos': {
    brand: 'TP-Link',
    model: '8 puertos',
    warranty: COMMON_WARRANTY,
    recommendedUse: 'Expansion de red cableada',
    technicalSpecs: {
      Red: {
        Marca: 'TP-Link',
        Puertos: '8 puertos Ethernet',
        Tipo: 'Switch de red',
        Instalacion: 'Plug and Play',
      },
      Compatibilidad: {
        Uso: 'Expansion de red cableada',
        Compatibilidad: 'Redes LAN',
      },
    },
  },
  'access point tp link': {
    brand: 'TP-Link',
    model: 'Access Point',
    warranty: COMMON_WARRANTY,
    recommendedUse: 'Ampliar cobertura WiFi en oficina o negocio',
    technicalSpecs: {
      Red: {
        Marca: 'TP-Link',
        Tipo: 'Punto de acceso inalambrico',
        Conectividad: 'Ethernet / WiFi',
        Administracion: 'Segun modelo',
      },
      Uso: {
        Uso: 'Ampliar cobertura WiFi en oficina o negocio',
        Garantia: COMMON_WARRANTY,
      },
    },
  },
  'adaptador usb wifi': {
    recommendedUse: 'Agregar WiFi a PC o laptop',
    warranty: COMMON_WARRANTY,
    technicalSpecs: {
      Conectividad: {
        Tipo: 'Adaptador WiFi USB',
        Conectividad: 'USB',
        Frecuencia: '2.4 GHz / dual band segun modelo',
      },
      Compatibilidad: {
        Compatibilidad: 'Windows',
        Uso: 'Agregar WiFi a PC o laptop',
      },
    },
  },
  'cable utp cat 6': {
    model: 'Cat 6',
    recommendedUse: 'Conexion de red cableada',
    technicalSpecs: {
      Red: {
        Tipo: 'Cable UTP categoria 6',
        Uso: 'Redes LAN',
        Compatibilidad: 'Routers, switches, PCs y puntos de red',
      },
    },
  },
  'cable utp cat6 5m': {
    model: 'Cat 6 - 5 m',
    recommendedUse: 'Conexion de red cableada',
    technicalSpecs: {
      Red: {
        Tipo: 'Cable UTP categoria 6',
        Longitud: '5 metros referencial',
        Compatibilidad: 'Routers, switches, PCs y puntos de red',
      },
    },
  },
  'repetidor wifi': networkProfile(undefined, 'Repetidor WiFi', 'Mejorar cobertura de red inalambrica'),
  'repetidor wifi xiaomi': networkProfile('Xiaomi', 'Repetidor WiFi', 'Mejorar cobertura de red inalambrica'),
  'monitor samsung 24': {
    brand: 'Samsung',
    model: '24 pulgadas',
    warranty: COMMON_WARRANTY,
    recommendedUse: 'Oficina, estudio, multitarea y diseno basico',
    technicalSpecs: {
      Pantalla: {
        Marca: 'Samsung',
        Tamano: '24 pulgadas',
        Resolucion: 'Full HD referencial',
        Panel: 'LED',
      },
      Conectividad: {
        Conectividad: 'HDMI / VGA segun modelo',
        Uso: 'Oficina, estudio, multitarea y diseno basico',
      },
    },
  },
  'teclado redragon': peripheralProfile('Redragon', 'Teclado gamer', 'USB', 'Windows', 'Gaming, oficina y escritura intensiva', {
    Iluminacion: 'RGB segun modelo',
  }),
  'mouse logitech': peripheralProfile('Logitech', 'Mouse optico', 'USB / inalambrico segun modelo', 'Windows, laptop y PC', 'Oficina, estudio y uso diario'),
  'camara web full hd': peripheralProfile(undefined, 'Camara web', 'USB', 'Aplicaciones de videoconferencia', 'Clases, reuniones y videollamadas', {
    Resolucion: 'Full HD 1080p referencial',
    Microfono: 'Integrado segun modelo',
  }),
  'parlantes logitech': peripheralProfile('Logitech', 'Parlantes para PC', 'USB / audio segun modelo', 'PC y laptop', 'Audio para oficina, clases y entretenimiento'),
  'mousepad xl': {
    model: 'XL',
    recommendedUse: 'Escritorio, gaming y productividad',
    technicalSpecs: {
      Producto: {
        Tipo: 'Mousepad extendido',
        Tamano: 'XL referencial',
        Uso: 'Escritorio, gaming y productividad',
      },
    },
  },
  'tinta epson': printSupplyProfile('Epson', 'Tinta para impresora', 'Segun presentacion', 'Validar modelo de impresora', 'Impresion domestica y oficina'),
  'botella tinta epson negra': printSupplyProfile('Epson', 'Botella de tinta', 'Negro', 'Impresoras Epson EcoTank compatibles', 'Documentos y trabajos de oficina', 'Botella'),
  'cartucho canon color': printSupplyProfile('Canon', 'Cartucho de tinta', 'Color', 'Validar modelo Canon', 'Impresion a color', 'Cartucho'),
  'toner hp 85a': printSupplyProfile('HP', 'Toner laser', 'Negro', 'Impresoras HP compatibles con 85A', 'Impresion de documentos', 'Cartucho toner', '85A'),
  'toner hp 85a compatible': printSupplyProfile('HP', 'Toner laser compatible', 'Negro', 'Impresoras HP compatibles con 85A', 'Impresion de documentos', 'Cartucho toner', '85A'),
  'papel bond a4': paperProfile(),
  'papel bond a4 500 hojas': paperProfile(),
  'licencia microsoft office': softwareProfile('Microsoft', 'Office / Microsoft 365 segun registro', 'Licencia de productividad', 'Word, Excel, PowerPoint', 'Windows / web segun licencia'),
  'licencia windows 11 pro': softwareProfile('Microsoft', 'Windows 11 Pro', 'Sistema operativo', 'Activacion digital segun proveedor', 'PC'),
  'licencia adobe acrobat': softwareProfile('Adobe', 'Acrobat', 'Licencia PDF', 'Lectura, edicion y gestion de PDF', 'Windows / web segun plan'),
  'antivirus eset': softwareProfile('ESET', 'Antivirus ESET', 'Antivirus / seguridad', 'Malware, phishing y amenazas', 'Windows segun licencia'),
  'antivirus eset 1 usuario': softwareProfile('ESET', 'Antivirus ESET 1 usuario', 'Antivirus / seguridad', 'Malware, phishing y amenazas', 'Windows segun licencia'),
  'suscripcion microsoft 365': softwareProfile('Microsoft', 'Microsoft 365', 'Suscripcion de productividad', 'Word, Excel, PowerPoint, correo y nube', 'Windows / web segun plan'),
};

const GENERIC_SPEC_VALUES = [
  'uso diario',
  'consultar proveedor',
  'segun configuracion registrada',
  'segun configuración registrada',
  'equipo de computo',
  'equipo de cómputo',
  'uso diario y gestion empresarial',
  'uso diario y gestión empresarial',
];

function laptopProfile(input: {
  brand: string;
  model: string;
  processor: string;
  generation: string;
  graphics: string;
  connectivity?: string;
}): ProductTechnicalProfile {
  return {
    brand: input.brand,
    model: input.model,
    warranty: COMMON_WARRANTY,
    recommendedUse: 'Oficina, estudios y gestion empresarial',
    technicalSpecs: {
      Sistema: {
        Procesador: input.processor,
        Generacion: input.generation,
        'Sistema operativo': 'Windows 11',
      },
      'Memoria y almacenamiento': {
        'Memoria RAM': '8 GB DDR4',
        Almacenamiento: 'SSD 512 GB',
        'Tipo de disco': 'SSD NVMe / SATA segun modelo',
      },
      'Pantalla y graficos': {
        Pantalla: '15.6 pulgadas Full HD',
        Graficos: input.graphics,
      },
      Conectividad: {
        Conectividad: input.connectivity ?? 'WiFi, Bluetooth, USB, HDMI',
      },
      Garantia: {
        Garantia: COMMON_WARRANTY,
      },
    },
  };
}

function ramProfile(capacity: string): ProductTechnicalProfile {
  return {
    warranty: COMMON_WARRANTY,
    recommendedUse: 'Mejora de rendimiento y multitarea',
    technicalSpecs: {
      Memoria: {
        Capacidad: capacity,
        Tipo: 'DDR4 referencial',
        Frecuencia: '2666 / 3200 MHz segun modelo',
        Formato: 'DIMM / SODIMM segun disponibilidad',
      },
      Compatibilidad: {
        Uso: 'Mejora de rendimiento y multitarea',
        Compatibilidad: 'Validar DDR y formato antes de instalar',
        Garantia: COMMON_WARRANTY,
      },
    },
  };
}

function networkProfile(brand: string | undefined, type: string, use: string): ProductTechnicalProfile {
  return {
    brand,
    model: type,
    warranty: COMMON_WARRANTY,
    recommendedUse: use,
    technicalSpecs: {
      Red: {
        ...(brand ? { Marca: brand } : {}),
        Tipo: type,
        Frecuencia: '2.4 GHz / doble banda segun modelo',
        Velocidad: 'Segun modelo disponible',
        Puertos: 'LAN/WAN segun modelo',
      },
      Seguridad: {
        Seguridad: 'WPA/WPA2',
        Uso: use,
      },
    },
  };
}

function peripheralProfile(
  brand: string | undefined,
  type: string,
  connectivity: string,
  compatibility: string,
  use: string,
  extra: Record<string, string> = {},
): ProductTechnicalProfile {
  return {
    brand,
    model: type,
    warranty: COMMON_WARRANTY,
    recommendedUse: use,
    technicalSpecs: {
      Producto: {
        ...(brand ? { Marca: brand } : {}),
        Tipo: type,
        Conectividad: connectivity,
        ...extra,
      },
      Compatibilidad: {
        Compatibilidad: compatibility,
        Uso: use,
        Garantia: COMMON_WARRANTY,
      },
    },
  };
}

function printSupplyProfile(
  brand: string,
  type: string,
  color: string,
  compatibility: string,
  use: string,
  presentation = 'Segun presentacion',
  model?: string,
): ProductTechnicalProfile {
  return {
    brand,
    model,
    recommendedUse: use,
    technicalSpecs: {
      Insumo: {
        Marca: brand,
        ...(model ? { Modelo: model } : {}),
        Tipo: type,
        Color: color,
        Presentacion: presentation,
      },
      Compatibilidad: {
        Compatibilidad: compatibility,
        Uso: use,
      },
    },
  };
}

function paperProfile(): ProductTechnicalProfile {
  return {
    model: 'A4',
    recommendedUse: 'Impresion y copias de oficina',
    technicalSpecs: {
      Producto: {
        Tipo: 'Papel bond',
        Tamano: 'A4',
        Gramaje: '75 g/m2 referencial',
        Presentacion: 'Paquete',
      },
      Compatibilidad: {
        Compatibilidad: 'Impresoras laser e inyeccion',
        Uso: 'Documentos, copias e impresiones',
      },
    },
  };
}

function softwareProfile(
  brand: string,
  product: string,
  type: string,
  feature: string,
  platform: string,
): ProductTechnicalProfile {
  return {
    brand,
    model: product,
    recommendedUse: feature,
    technicalSpecs: {
      Licencia: {
        Marca: brand,
        Producto: product,
        Tipo: type,
        Plataforma: platform,
      },
      Vigencia: {
        Duracion: 'Segun licencia adquirida',
        Uso: feature,
      },
    },
  };
}

export function normalizeProductSpecKey(value?: string | null): string {
  if (!value) return '';

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findProductTechnicalProfile(productName?: string | null, categoryName?: string | null): ProductTechnicalProfile | null {
  const productKey = normalizeProductSpecKey(productName);
  const direct = PRODUCT_SPEC_PROFILES[productKey];
  if (direct) return cloneProfile(direct);

  const categoryKey = normalizeProductSpecKey(categoryName);
  if (categoryKey === 'laptops' || productKey.includes('laptop')) {
    return cloneProfile(laptopProfile({
      brand: productName?.split(' ')[1] ?? 'Marca referencial',
      model: productName ?? 'Laptop',
      processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
      generation: 'Segun configuracion disponible',
      graphics: 'Graficos integrados',
    }));
  }

  return null;
}

export function shouldBackfillProductSpecs(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return true;
  const flattened = flattenSpecValues(value).map(normalizeProductSpecKey).filter(Boolean);
  if (!flattened.length) return true;

  return flattened.some((item) => GENERIC_SPEC_VALUES.includes(item));
}

export function flattenSpecValues(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];

  return Object.entries(value as Record<string, unknown>).flatMap(([key, rawValue]) => {
    if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
      return [key, ...flattenSpecValues(rawValue)];
    }

    return [key, String(rawValue ?? '')];
  });
}

function cloneProfile(profile: ProductTechnicalProfile): ProductTechnicalProfile {
  return JSON.parse(JSON.stringify(profile)) as ProductTechnicalProfile;
}
