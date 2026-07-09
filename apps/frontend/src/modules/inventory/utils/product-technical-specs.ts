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

interface ProductFallbackEntry {
  names: string[];
  fallback: ProductTechnicalFallback;
}

const GENERIC_SPEC_PATTERNS = [
  'uso diario',
  'consultar proveedor',
  'segun configuracion registrada',
  'equipo de computo',
  'oficina estudios y gestion empresarial',
  'oficina, estudios y gestion empresarial',
  'ficha referencial sin datos tecnicos',
  'validar con proveedor',
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
  marca: 'Marca',
  modelo: 'Modelo',
  puertos: 'Puertos',
  potencia: 'Potencia',
  formato: 'Formato',
};

const FALLBACK_ENTRIES: ProductFallbackEntry[] = [
  {
    names: ['Laptop Asus VivoBook', 'Laptop Asus VivoBook i5'],
    fallback: laptopSpecs({
      brand: 'Asus',
      line: 'VivoBook',
      processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
      generation: '11.a / 12.a generación referencial',
      graphics: 'Integrados Intel UHD / AMD Radeon según configuración',
    }),
  },
  {
    names: ['Laptop Dell Inspiron', 'Laptop Dell Inspiron 3520'],
    fallback: laptopSpecs({
      brand: 'Dell',
      line: 'Inspiron 3520',
      processor: 'Intel Core i5',
      generation: '11.a / 12.a generación referencial',
      graphics: 'Intel UHD / Intel Iris Xe según configuración',
    }),
  },
  {
    names: ['Laptop Acer Aspire', 'Laptop Acer Aspire 5'],
    fallback: laptopSpecs({
      brand: 'Acer',
      line: 'Aspire',
      processor: 'Intel Core i5',
      generation: '11.a / 12.a generación referencial',
      graphics: 'Intel UHD Graphics',
      diskType: 'SSD NVMe',
    }),
  },
  {
    names: ['Laptop HP Core i5', 'Laptop HP 15 Ryzen 5'],
    fallback: laptopSpecs({
      brand: 'HP',
      line: '15',
      processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
      generation: 'Configuración referencial según modelo',
      graphics: 'Intel UHD / AMD Radeon integrada según configuración',
    }),
  },
  {
    names: ['Laptop Lenovo IdeaPad', 'Lenovo IdeaPad'],
    fallback: laptopSpecs({
      brand: 'Lenovo',
      line: 'IdeaPad',
      processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
      generation: '11.a / 12.a generación referencial',
      graphics: 'Integrados según configuración',
      diskType: 'SSD NVMe',
    }),
  },
  {
    names: ['SSD Kingston 480GB', 'SSD Kingston 480 GB', 'Kingston 480GB'],
    fallback: simpleGroup('Almacenamiento', [
      spec('Marca', 'Kingston'),
      spec('Capacidad', '480 GB'),
      spec('Tipo', 'Unidad de estado sólido SSD'),
      spec('Interfaz', 'SATA III'),
      spec('Formato', '2.5 pulgadas'),
      spec('Velocidad referencial', 'Hasta 500 MB/s de lectura'),
      spec('Compatibilidad', 'Laptops y PCs con puerto SATA'),
      spec('Uso recomendado', 'Mejorar velocidad de arranque y carga de programas'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Memoria RAM 8GB', 'Memoria RAM 8 GB', 'RAM 8GB'],
    fallback: simpleGroup('Memoria', [
      spec('Capacidad', '8 GB'),
      spec('Tipo', 'DDR4 referencial'),
      spec('Frecuencia', '2666 / 3200 MHz según disponibilidad'),
      spec('Formato', 'DIMM / SODIMM según modelo'),
      spec('Compatibilidad', 'Laptops o PCs según formato'),
      spec('Uso recomendado', 'Mejorar multitarea y rendimiento general'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Memoria RAM 16GB DDR4', 'Memoria RAM 16 GB', 'RAM 16GB'],
    fallback: simpleGroup('Memoria', [
      spec('Capacidad', '16 GB'),
      spec('Tipo', 'DDR4 referencial'),
      spec('Frecuencia', '2666 / 3200 MHz según disponibilidad'),
      spec('Formato', 'DIMM / SODIMM según modelo'),
      spec('Compatibilidad', 'Laptops o PCs según formato'),
      spec('Uso recomendado', 'Mejorar multitarea, navegación y aplicaciones exigentes'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Procesador Intel Core i5', 'Intel Core i5', 'Core i5'],
    fallback: simpleGroup('Procesador', [
      spec('Marca', 'Intel'),
      spec('Línea', 'Core i5'),
      spec('Generación', 'Según modelo disponible'),
      spec('Núcleos', 'Configuración variable según generación'),
      spec('Gráficos integrados', 'Según modelo'),
      spec('Compatibilidad', 'Validar socket y placa madre'),
      spec('Uso recomendado', 'Oficina, estudios, productividad y multitarea'),
      spec('Garantía', 'Según disponibilidad comercial'),
    ]),
  },
  {
    names: ['Placa Madre H610', 'Motherboard H610', 'Mainboard H610'],
    fallback: simpleGroup('Plataforma', [
      spec('Chipset', 'Intel H610'),
      spec('Socket', 'LGA 1700 referencial'),
      spec('Memoria compatible', 'DDR4 / DDR5 según modelo'),
      spec('Uso recomendado', 'Armado de PC de oficina o estudio'),
      spec('Puertos', 'USB, LAN, audio y video según modelo'),
      spec('Compatibilidad', 'Procesadores Intel compatibles'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Fuente de Poder 600W', 'Fuente 600W', 'Fuente 600 W'],
    fallback: simpleGroup('Energía', [
      spec('Potencia', '600W'),
      spec('Tipo', 'Fuente de poder para PC'),
      spec('Formato', 'ATX referencial'),
      spec('Uso recomendado', 'PC de escritorio de oficina o uso general'),
      spec('Conectores', 'Validar según equipo'),
      spec('Protección', 'Voltaje y corriente según modelo'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Router TP-Link', 'Router TP Link', 'Router Tplink'],
    fallback: simpleGroup('Red inalámbrica', [
      spec('Marca', 'TP-Link'),
      spec('Tipo', 'Router inalámbrico'),
      spec('Frecuencia', '2.4 GHz / doble banda según modelo'),
      spec('Velocidad', 'Referencial según modelo disponible'),
      spec('Puertos', 'LAN/WAN'),
      spec('Seguridad', 'WPA/WPA2'),
      spec('Uso recomendado', 'Hogar, oficina pequeña y negocio'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Switch TP-Link 8 Puertos', 'Switch TP Link 8 Puertos', 'Switch 8 Puertos'],
    fallback: simpleGroup('Red cableada', [
      spec('Marca', 'TP-Link'),
      spec('Tipo', 'Switch Ethernet'),
      spec('Puertos', '8 puertos'),
      spec('Instalación', 'Plug and Play'),
      spec('Uso recomendado', 'Expansión de red cableada'),
      spec('Compatibilidad', 'Redes LAN'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Access Point TP-Link', 'Access Point TP Link', 'Punto de Acceso TP-Link'],
    fallback: simpleGroup('Red inalámbrica', [
      spec('Marca', 'TP-Link'),
      spec('Tipo', 'Punto de acceso WiFi'),
      spec('Conectividad', 'Ethernet / WiFi'),
      spec('Uso recomendado', 'Ampliar cobertura inalámbrica en oficina o negocio'),
      spec('Administración', 'Según modelo'),
      spec('Compatibilidad', 'Redes WiFi estándar'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Repetidor WiFi', 'Repetidor Wifi', 'Extensor WiFi'],
    fallback: simpleGroup('Cobertura WiFi', [
      spec('Tipo', 'Extensor de señal inalámbrica'),
      spec('Frecuencia', '2.4 GHz / doble banda según modelo'),
      spec('Uso recomendado', 'Ampliar cobertura WiFi'),
      spec('Instalación', 'Configuración rápida'),
      spec('Compatibilidad', 'Routers WiFi estándar'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Adaptador USB WiFi', 'Adaptador USB Wifi', 'Adaptador WiFi USB'],
    fallback: simpleGroup('Conectividad', [
      spec('Tipo', 'Adaptador WiFi USB'),
      spec('Conexión', 'USB'),
      spec('Frecuencia', '2.4 GHz / dual band según modelo'),
      spec('Compatibilidad', 'Windows, laptops y PCs'),
      spec('Uso recomendado', 'Agregar conexión WiFi a equipos sin adaptador integrado'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Cable UTP Cat 6', 'Cable UTP Cat6', 'Cable de Red Cat 6'],
    fallback: simpleGroup('Cableado de red', [
      spec('Tipo', 'Cable de red'),
      spec('Categoría', 'Cat 6'),
      spec('Velocidad referencial', 'Hasta 1 Gbps'),
      spec('Uso recomendado', 'Redes LAN, routers, switches y PCs'),
      spec('Compatibilidad', 'Conectores RJ45'),
      spec('Aplicación', 'Hogar, oficina y negocio'),
    ]),
  },
  {
    names: ['Cable HDMI', 'Cable HDMI 2.0', 'HDMI'],
    fallback: simpleGroup('Audio y video', [
      spec('Tipo', 'Cable HDMI'),
      spec('Uso recomendado', 'Transmisión de audio y video'),
      spec('Compatibilidad', 'Monitores, televisores, laptops y PCs'),
      spec('Resolución', 'Full HD / 4K según versión'),
      spec('Conector', 'HDMI estándar'),
      spec('Aplicación', 'Presentaciones, pantallas y multimedia'),
    ]),
  },
  {
    names: ['Monitor Samsung 24', 'Monitor Samsung 24 pulgadas', 'Samsung 24'],
    fallback: simpleGroup('Pantalla', [
      spec('Marca', 'Samsung'),
      spec('Tamaño', '24 pulgadas'),
      spec('Resolución', 'Full HD referencial'),
      spec('Panel', 'LED'),
      spec('Conectividad', 'HDMI / VGA según modelo'),
      spec('Uso recomendado', 'Oficina, estudio, multitarea y diseño básico'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Teclado Redragon', 'Redragon Keyboard'],
    fallback: simpleGroup('Periférico', [
      spec('Marca', 'Redragon'),
      spec('Tipo', 'Teclado gamer'),
      spec('Conectividad', 'USB'),
      spec('Iluminación', 'RGB según modelo'),
      spec('Compatibilidad', 'Windows'),
      spec('Uso recomendado', 'Gaming, oficina y escritura intensiva'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Mouse Logitech', 'Logitech Mouse'],
    fallback: simpleGroup('Periférico', [
      spec('Marca', 'Logitech'),
      spec('Tipo', 'Mouse óptico'),
      spec('Conectividad', 'USB / inalámbrico según modelo'),
      spec('Compatibilidad', 'Laptop, PC y Windows'),
      spec('Uso recomendado', 'Oficina, estudio y navegación frecuente'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Mousepad XL', 'Mouse Pad XL', 'Pad Mouse XL'],
    fallback: simpleGroup('Accesorio', [
      spec('Tipo', 'Mousepad XL'),
      spec('Superficie', 'Tela optimizada para mouse'),
      spec('Base', 'Antideslizante'),
      spec('Uso recomendado', 'Escritorio, oficina y gaming'),
      spec('Compatibilidad', 'Mouse óptico y láser'),
      spec('Tamaño', 'Extendido referencial'),
    ]),
  },
  {
    names: ['Audífonos Gamer', 'Audifonos Gamer', 'Headset Gamer'],
    fallback: simpleGroup('Audio', [
      spec('Tipo', 'Audífonos gamer'),
      spec('Conectividad', '3.5 mm / USB según modelo'),
      spec('Micrófono', 'Integrado según modelo'),
      spec('Uso recomendado', 'Gaming, clases y videollamadas'),
      spec('Compatibilidad', 'PC, laptop y consolas según conexión'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Parlantes Logitech', 'Speaker Logitech', 'Parlantes para PC'],
    fallback: simpleGroup('Audio', [
      spec('Marca', 'Logitech'),
      spec('Tipo', 'Parlantes para PC'),
      spec('Conectividad', '3.5 mm / USB según modelo'),
      spec('Uso recomendado', 'Oficina, estudio y multimedia'),
      spec('Compatibilidad', 'PC, laptop y dispositivos compatibles'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Cámara Web Full HD', 'Camara Web Full HD', 'Webcam Full HD'],
    fallback: simpleGroup('Video', [
      spec('Tipo', 'Cámara web'),
      spec('Resolución', 'Full HD 1080p referencial'),
      spec('Conectividad', 'USB'),
      spec('Micrófono', 'Integrado según modelo'),
      spec('Compatibilidad', 'Zoom, Meet, Teams y aplicaciones de videoconferencia'),
      spec('Uso recomendado', 'Clases, reuniones y atención virtual'),
      spec('Garantía', '12 meses referencial'),
    ]),
  },
  {
    names: ['Tinta Epson', 'Tinta para Epson'],
    fallback: simpleGroup('Insumo de impresión', [
      spec('Marca', 'Epson'),
      spec('Tipo', 'Tinta para impresora'),
      spec('Color', 'Según presentación'),
      spec('Compatibilidad', 'Validar modelo de impresora Epson'),
      spec('Rendimiento', 'Referencial según modelo'),
      spec('Uso recomendado', 'Impresión doméstica y de oficina'),
      spec('Presentación', 'Botella / cartucho según producto'),
    ]),
  },
  {
    names: ['Botella Tinta Epson Negra', 'Tinta Epson Negra', 'Botella Epson Negra'],
    fallback: simpleGroup('Insumo de impresión', [
      spec('Marca', 'Epson'),
      spec('Tipo', 'Botella de tinta'),
      spec('Color', 'Negro'),
      spec('Compatibilidad', 'Impresoras Epson EcoTank compatibles'),
      spec('Presentación', 'Botella'),
      spec('Uso recomendado', 'Documentos y trabajos de oficina'),
      spec('Rendimiento', 'Alto rendimiento referencial'),
    ]),
  },
  {
    names: ['Cartucho Canon Color', 'Cartucho Canon a Color'],
    fallback: simpleGroup('Insumo de impresión', [
      spec('Marca', 'Canon'),
      spec('Tipo', 'Cartucho de tinta'),
      spec('Color', 'Color'),
      spec('Compatibilidad', 'Validar modelo de impresora Canon'),
      spec('Presentación', 'Cartucho'),
      spec('Uso recomendado', 'Impresión a color'),
      spec('Garantía', 'Producto sellado'),
    ]),
  },
  {
    names: ['Tóner HP 85A', 'Toner HP 85A', 'HP 85A'],
    fallback: simpleGroup('Insumo láser', [
      spec('Marca', 'HP'),
      spec('Modelo', '85A'),
      spec('Tipo', 'Tóner láser'),
      spec('Color', 'Negro'),
      spec('Compatibilidad', 'Impresoras HP compatibles con 85A'),
      spec('Uso recomendado', 'Impresión de documentos'),
      spec('Rendimiento', 'Referencial según fabricante'),
    ]),
  },
  {
    names: ['Papel Bond A4', 'Papel Bond A4 500 hojas', 'Papel A4'],
    fallback: simpleGroup('Papel', [
      spec('Tipo', 'Papel bond'),
      spec('Tamaño', 'A4'),
      spec('Gramaje', '75 g/m² referencial'),
      spec('Presentación', 'Paquete'),
      spec('Compatibilidad', 'Impresoras láser e inyección'),
      spec('Uso recomendado', 'Documentos, copias e impresiones'),
    ]),
  },
  {
    names: ['Licencia Microsoft Office', 'Microsoft Office', 'Office 365'],
    fallback: simpleGroup('Software', [
      spec('Marca', 'Microsoft'),
      spec('Producto', 'Office / Microsoft 365 según registro'),
      spec('Tipo', 'Licencia de productividad'),
      spec('Aplicaciones', 'Word, Excel y PowerPoint'),
      spec('Duración', 'Según plan adquirido'),
      spec('Plataforma', 'Windows / web según licencia'),
      spec('Uso recomendado', 'Oficina, estudios y negocio'),
    ]),
  },
  {
    names: ['Suscripción Microsoft 365', 'Microsoft 365', 'Suscripcion Microsoft 365'],
    fallback: simpleGroup('Software', [
      spec('Marca', 'Microsoft'),
      spec('Producto', 'Microsoft 365'),
      spec('Tipo', 'Suscripción'),
      spec('Aplicaciones', 'Word, Excel, PowerPoint y Outlook'),
      spec('Duración', 'Según plan contratado'),
      spec('Plataforma', 'Windows, web y móvil según licencia'),
      spec('Uso recomendado', 'Productividad empresarial y académica'),
    ]),
  },
  {
    names: ['Licencia Windows 11 Pro', 'Windows 11 Pro', 'Windows Pro'],
    fallback: simpleGroup('Sistema operativo', [
      spec('Marca', 'Microsoft'),
      spec('Producto', 'Windows 11 Pro'),
      spec('Tipo', 'Licencia de sistema operativo'),
      spec('Plataforma', 'PC'),
      spec('Activación', 'Digital según proveedor'),
      spec('Uso recomendado', 'Equipos empresariales y profesionales'),
      spec('Duración', 'Licencia según modalidad de activación'),
    ]),
  },
  {
    names: ['Licencia Adobe Acrobat', 'Adobe Acrobat', 'Acrobat Pro'],
    fallback: simpleGroup('Software', [
      spec('Marca', 'Adobe'),
      spec('Producto', 'Acrobat'),
      spec('Tipo', 'Licencia para PDF'),
      spec('Uso recomendado', 'Lectura, edición y gestión de documentos PDF'),
      spec('Plataforma', 'Windows / web según plan'),
      spec('Duración', 'Según licencia adquirida'),
      spec('Aplicación', 'Oficina, trámites y gestión documental'),
    ]),
  },
  {
    names: ['Antivirus ESET', 'Antivirus ESET 1 usuario', 'ESET'],
    fallback: simpleGroup('Seguridad', [
      spec('Marca', 'ESET'),
      spec('Tipo', 'Antivirus / seguridad informática'),
      spec('Protección', 'Malware, phishing y amenazas'),
      spec('Duración', 'Según licencia'),
      spec('Dispositivos', 'Según plan adquirido'),
      spec('Plataforma', 'Windows según licencia'),
      spec('Uso recomendado', 'Protección para PC y laptop'),
    ]),
  },
  {
    names: ['Hub USB 4 Puertos', 'Hub USB', 'USB Hub 4 Puertos'],
    fallback: simpleGroup('Conectividad', [
      spec('Tipo', 'Hub USB'),
      spec('Puertos', '4 puertos USB'),
      spec('Conexión', 'USB'),
      spec('Uso recomendado', 'Ampliar puertos en laptop o PC'),
      spec('Compatibilidad', 'Windows, laptops y PCs'),
      spec('Garantía', 'Según disponibilidad comercial'),
    ]),
  },
];

const PRODUCT_FALLBACKS = createFallbackMap(FALLBACK_ENTRIES);

export function normalizeProductName(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_/]+/g, ' ')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getProductTechnicalSpecs(product: Product): ProductTechnicalSpecGroup[] {
  const existingGroups = parseExistingSpecs(product.technicalSpecs);
  if (!isGenericTechnicalSpecs(existingGroups)) {
    return existingGroups;
  }

  return findFallbackSpecs(product).groups;
}

export function hasUsefulTechnicalSpecs(groups: ProductTechnicalSpecGroup[]): boolean {
  return !isGenericTechnicalSpecs(groups);
}

export function isGenericTechnicalSpecs(groups?: ProductTechnicalSpecGroup[] | null): boolean {
  if (!groups?.length) return true;

  const usefulItems = groups.flatMap((group) =>
    group.items.filter((item) => item.label.trim() && item.value.trim() && !isGenericSpecValue(item.value)),
  );
  const normalizedText = usefulItems.map((item) => normalizeProductName(`${item.label} ${item.value}`)).join(' ');
  const onlyWeakOfficeUse =
    usefulItems.length <= 2 &&
    normalizedText.includes('oficina') &&
    normalizedText.includes('estudio') &&
    normalizedText.includes('gestion');

  return usefulItems.length < 4 || onlyWeakOfficeUse;
}

export function isGenericSpecValue(value?: string | number | null): boolean {
  const normalized = normalizeProductName(String(value ?? ''));
  if (!normalized || normalized === 'null' || normalized === 'undefined' || normalized === 'nan') return true;

  return GENERIC_SPEC_PATTERNS.some((pattern) => normalized.includes(normalizeProductName(pattern)));
}

function parseExistingSpecs(specs?: ProductTechnicalSpecs | null): ProductTechnicalSpecGroup[] {
  if (!specs || typeof specs !== 'object') return [];

  const groups: ProductTechnicalSpecGroup[] = [];

  for (const [groupOrKey, rawValue] of Object.entries(specs)) {
    if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
      const items = Object.entries(rawValue)
        .map(([key, value]) => spec(formatSpecLabel(key), normalizeSpecValue(value)))
        .filter((item) => item.label && item.value && !isGenericSpecValue(item.value));

      if (items.length) groups.push({ title: formatSpecLabel(groupOrKey), items });
      continue;
    }

    const value = normalizeSpecValue(rawValue);
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
  const brand = normalizeProductName(product.brand);
  const model = normalizeProductName(product.model);
  const searchable = normalizeProductName([product.name, product.brand, product.model, product.category?.name].filter(Boolean).join(' '));

  const exact = PRODUCT_FALLBACKS.get(name);
  if (exact) return exact;

  const aliasMatch = [...PRODUCT_FALLBACKS.entries()].find(([key]) => isStrongProductMatch(name, key) || isStrongProductMatch(searchable, key));
  if (aliasMatch) return aliasMatch[1];

  const smartMatch = findSmartFallback(searchable, brand, model);
  if (smartMatch) return smartMatch;

  return getCategoryFallback(product, category);
}

function findSmartFallback(searchable: string, brand: string, model: string): ProductTechnicalFallback | null {
  if (searchable.includes('ssd')) return PRODUCT_FALLBACKS.get('ssd kingston 480gb') ?? null;
  if (searchable.includes('ram') || searchable.includes('memoria')) return PRODUCT_FALLBACKS.get(searchable.includes('16') ? 'memoria ram 16gb ddr4' : 'memoria ram 8gb') ?? null;
  if (searchable.includes('core i5') || searchable.includes('procesador')) return PRODUCT_FALLBACKS.get('procesador intel core i5') ?? null;
  if (searchable.includes('h610') || searchable.includes('placa madre')) return PRODUCT_FALLBACKS.get('placa madre h610') ?? null;
  if (searchable.includes('fuente') || searchable.includes('600w')) return PRODUCT_FALLBACKS.get('fuente de poder 600w') ?? null;
  if (searchable.includes('router')) return PRODUCT_FALLBACKS.get('router tp link') ?? null;
  if (searchable.includes('switch')) return PRODUCT_FALLBACKS.get('switch tp link 8 puertos') ?? null;
  if (searchable.includes('access point') || searchable.includes('punto de acceso')) return PRODUCT_FALLBACKS.get('access point tp link') ?? null;
  if (searchable.includes('repetidor') || searchable.includes('extensor')) return PRODUCT_FALLBACKS.get('repetidor wifi') ?? null;
  if (searchable.includes('adaptador') && searchable.includes('wifi')) return PRODUCT_FALLBACKS.get('adaptador usb wifi') ?? null;
  if (searchable.includes('utp') || searchable.includes('cat 6') || searchable.includes('cat6')) return PRODUCT_FALLBACKS.get('cable utp cat 6') ?? null;
  if (searchable.includes('hdmi')) return PRODUCT_FALLBACKS.get('cable hdmi') ?? null;
  if (searchable.includes('monitor')) return PRODUCT_FALLBACKS.get('monitor samsung 24') ?? null;
  if (searchable.includes('teclado')) return PRODUCT_FALLBACKS.get('teclado redragon') ?? null;
  if (searchable.includes('mousepad') || searchable.includes('mouse pad')) return PRODUCT_FALLBACKS.get('mousepad xl') ?? null;
  if (searchable.includes('mouse')) return PRODUCT_FALLBACKS.get('mouse logitech') ?? null;
  if (searchable.includes('audifono') || searchable.includes('headset')) return PRODUCT_FALLBACKS.get('audifonos gamer') ?? null;
  if (searchable.includes('parlante') || searchable.includes('speaker')) return PRODUCT_FALLBACKS.get('parlantes logitech') ?? null;
  if (searchable.includes('camara') || searchable.includes('webcam')) return PRODUCT_FALLBACKS.get('camara web full hd') ?? null;
  if (searchable.includes('toner') || searchable.includes('85a')) return PRODUCT_FALLBACKS.get('toner hp 85a') ?? null;
  if (searchable.includes('cartucho')) return PRODUCT_FALLBACKS.get('cartucho canon color') ?? null;
  if (searchable.includes('tinta') && searchable.includes('negra')) return PRODUCT_FALLBACKS.get('botella tinta epson negra') ?? null;
  if (searchable.includes('tinta')) return PRODUCT_FALLBACKS.get('tinta epson') ?? null;
  if (searchable.includes('papel') || searchable.includes('bond')) return PRODUCT_FALLBACKS.get('papel bond a4') ?? null;
  if (searchable.includes('microsoft 365')) return PRODUCT_FALLBACKS.get('suscripcion microsoft 365') ?? null;
  if (searchable.includes('office')) return PRODUCT_FALLBACKS.get('licencia microsoft office') ?? null;
  if (searchable.includes('windows')) return PRODUCT_FALLBACKS.get('licencia windows 11 pro') ?? null;
  if (searchable.includes('acrobat') || searchable.includes('adobe')) return PRODUCT_FALLBACKS.get('licencia adobe acrobat') ?? null;
  if (searchable.includes('antivirus') || searchable.includes('eset')) return PRODUCT_FALLBACKS.get('antivirus eset') ?? null;
  if (searchable.includes('hub') && searchable.includes('usb')) return PRODUCT_FALLBACKS.get('hub usb 4 puertos') ?? null;
  if (searchable.includes('laptop') || model.includes('ideapad') || brand.includes('lenovo')) {
    return laptopSpecs({
      brand: brand ? formatSpecLabel(brand) : 'Marca referencial',
      line: model ? formatSpecLabel(model) : 'Línea referencial',
      processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
      generation: 'Configuración referencial según modelo',
      graphics: 'Integrados según configuración',
    });
  }

  return null;
}

function getCategoryFallback(product: Product, category: string): ProductTechnicalFallback {
  if (category.includes('laptop') || category.includes('computadora')) {
    return laptopSpecs({
      brand: product.brand || 'Marca referencial',
      line: product.model || product.name,
      processor: 'Intel Core i5 / AMD Ryzen 5 referencial',
      generation: 'Configuración referencial según modelo',
      graphics: 'Integrados según configuración',
    });
  }

  if (category.includes('componente') || category.includes('repuesto')) {
    return simpleGroup('Componentes', [
      spec('Tipo', 'Componente de hardware'),
      spec('Compatibilidad', 'Validar con el equipo antes de instalar'),
      spec('Uso recomendado', 'Actualización o reparación de PC/laptop'),
      spec('Instalación', 'Requiere verificación técnica previa'),
      spec('Garantía', '12 meses referencial'),
    ]);
  }

  if (category.includes('red')) {
    return simpleGroup('Redes', [
      spec('Tipo', 'Dispositivo de red'),
      spec('Conectividad', 'Ethernet / WiFi según modelo'),
      spec('Uso recomendado', 'Hogar, oficina o negocio'),
      spec('Compatibilidad', 'Redes estándar'),
      spec('Garantía', '12 meses referencial'),
    ]);
  }

  if (category.includes('periferico') || category.includes('teclado') || category.includes('mouse') || category.includes('monitor')) {
    return simpleGroup('Periféricos', [
      spec('Tipo', 'Periférico de computadora'),
      spec('Conectividad', 'USB / inalámbrica según modelo'),
      spec('Compatibilidad', 'PC, laptop y Windows'),
      spec('Uso recomendado', 'Oficina, estudio o multimedia'),
      spec('Garantía', '12 meses referencial'),
    ]);
  }

  if (category.includes('impresion') || category.includes('insumo') || category.includes('cartucho') || category.includes('toner') || category.includes('papel')) {
    return simpleGroup('Impresión', [
      spec('Tipo', 'Insumo o equipo de impresión'),
      spec('Compatibilidad', 'Validar con modelo de impresora'),
      spec('Uso recomendado', 'Documentos, copias e impresión frecuente'),
      spec('Presentación', 'Según producto'),
      spec('Garantía', 'Producto sellado o según disponibilidad'),
    ]);
  }

  if (category.includes('software') || category.includes('licencia') || category.includes('seguridad')) {
    return simpleGroup('Software', [
      spec('Tipo', 'Licencia de software'),
      spec('Plataforma', 'Windows / web según licencia'),
      spec('Duración', 'Según plan adquirido'),
      spec('Uso recomendado', 'Productividad, seguridad o gestión digital'),
      spec('Activación', 'Digital según proveedor'),
    ]);
  }

  if (category.includes('accesorio') || category.includes('cable') || category.includes('adaptador')) {
    return simpleGroup('Accesorios', [
      spec('Tipo', 'Accesorio tecnológico'),
      spec('Compatibilidad', 'Validar con el dispositivo'),
      spec('Uso recomendado', 'Complementar equipos tecnológicos'),
      spec('Conectividad', 'Según tipo de producto'),
      spec('Garantía', 'Según disponibilidad comercial'),
    ]);
  }

  return simpleGroup('Ficha técnica', [
    spec('Categoría', product.category?.name || 'Producto tecnológico'),
    spec('Unidad', product.unit || 'unidad'),
    spec('Compatibilidad', 'Validar especificaciones exactas antes de vender'),
    spec('Uso recomendado', 'Venta y atención técnica según necesidad del cliente'),
    spec('Garantía', 'Según disponibilidad comercial'),
  ]);
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

function simpleGroup(title: string, items: ProductTechnicalSpecItem[]): ProductTechnicalFallback {
  return { groups: [{ title, items: items.filter((item) => item.label && item.value) }] };
}

function createFallbackMap(entries: ProductFallbackEntry[]) {
  const map = new Map<string, ProductTechnicalFallback>();
  for (const entry of entries) {
    for (const name of entry.names) {
      map.set(normalizeProductName(name), entry.fallback);
    }
  }
  return map;
}

function isStrongProductMatch(productName: string, fallbackKey: string) {
  if (!productName || !fallbackKey) return false;
  if (productName === fallbackKey) return true;

  const productTokens = new Set(productName.split(' ').filter((token) => token.length > 1));
  const fallbackTokens = fallbackKey.split(' ').filter((token) => token.length > 1);
  const hits = fallbackTokens.filter((token) => productTokens.has(token)).length;
  return hits >= Math.min(3, fallbackTokens.length);
}

function normalizeSpecValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return '';
  return String(value).trim();
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
