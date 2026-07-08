import {
  CashMovementType,
  CashSessionStatus,
  DocumentType,
  InventoryMovementType,
  NotificationPriority,
  NotificationType,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  PurchaseOrderStatus,
  PurchasePaymentStatus,
  QuickServiceSaleStatus,
  SaleItemType,
  SaleStatus,
  ServiceOrderStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { findProductImagePath } from './product-images';

const prisma = new PrismaClient();
const TAX_RATE = 0.18;

const saleCodes = Array.from({ length: 10 }, (_, index) => `V-${String(index + 1).padStart(6, '0')}`);
const purchaseCodes = Array.from({ length: 10 }, (_, index) => `OC-${String(index + 1).padStart(6, '0')}`);
const serviceOrderCodes = Array.from({ length: 10 }, (_, index) => `OT-${String(index + 1).padStart(6, '0')}`);
const quickServiceSaleCodes = Array.from({ length: 10 }, (_, index) => `SR-${String(index + 1).padStart(6, '0')}`);

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function calculateTotals(items: Array<{ quantity: number; unitPrice: number; discount?: number }>, discount = 0) {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const discountTotal = roundMoney(discount + items.reduce((sum, item) => sum + (item.discount ?? 0), 0));
  const taxable = Math.max(subtotal - discountTotal, 0);
  const taxTotal = roundMoney(taxable * TAX_RATE);
  const total = roundMoney(taxable + taxTotal);
  return { subtotal, discountTotal, taxTotal, total };
}

async function cleanupDemoData() {
  const sales = await prisma.sale.findMany({ where: { code: { in: saleCodes } }, select: { id: true } });
  const quickSales = await prisma.quickServiceSale.findMany({ where: { code: { in: quickServiceSaleCodes } }, select: { id: true } });
  const orders = await prisma.serviceOrder.findMany({ where: { code: { in: serviceOrderCodes } }, select: { id: true } });
  const purchases = await prisma.purchaseOrder.findMany({ where: { code: { in: purchaseCodes } }, select: { id: true } });
  const cashSessions = await prisma.cashSession.findMany({ where: { code: { in: ['CJ-000001'] } }, select: { id: true } });

  const saleIds = sales.map((item) => item.id);
  const quickSaleIds = quickSales.map((item) => item.id);
  const orderIds = orders.map((item) => item.id);
  const purchaseIds = purchases.map((item) => item.id);
  const cashSessionIds = cashSessions.map((item) => item.id);

  await prisma.cashMovement.deleteMany({
    where: {
      OR: [
        { cashSessionId: { in: cashSessionIds } },
        { relatedSaleId: { in: saleIds } },
        { relatedQuickServiceSaleId: { in: quickSaleIds } },
        { relatedServiceOrderId: { in: orderIds } },
        { relatedPurchaseOrderId: { in: purchaseIds } },
        { notes: { startsWith: 'DEMO:' } },
      ],
    },
  });
  await prisma.payment.deleteMany({ where: { saleId: { in: saleIds } } });
  await prisma.saleCancellation.deleteMany({ where: { saleId: { in: saleIds } } });
  await prisma.saleItem.deleteMany({ where: { saleId: { in: saleIds } } });
  await prisma.sale.deleteMany({ where: { id: { in: saleIds } } });
  await prisma.quickServiceSaleItem.deleteMany({ where: { quickServiceSaleId: { in: quickSaleIds } } });
  await prisma.quickServiceSale.deleteMany({ where: { id: { in: quickSaleIds } } });
  await prisma.serviceOrderLog.deleteMany({ where: { serviceOrderId: { in: orderIds } } });
  await prisma.serviceOrderItem.deleteMany({ where: { serviceOrderId: { in: orderIds } } });
  await prisma.serviceOrder.deleteMany({ where: { id: { in: orderIds } } });
  await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: { in: purchaseIds } } });
  await prisma.purchaseOrder.deleteMany({ where: { id: { in: purchaseIds } } });
  await prisma.cashSession.deleteMany({ where: { id: { in: cashSessionIds } } });
  await prisma.inventoryMovement.deleteMany({ where: { reason: { startsWith: 'DEMO:' } } });
  await prisma.auditLog.deleteMany({ where: { description: { startsWith: 'DEMO:' } } });
  await prisma.notification.deleteMany({ where: { relatedModule: 'DEMO' } });
}

async function seedRolesAndUsers() {
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: { description: 'Administrador general del sistema' },
      create: { name: 'ADMIN', description: 'Administrador general del sistema' },
    }),
    prisma.role.upsert({
      where: { name: 'WORKER' },
      update: { description: 'Colaborador operativo y cajero' },
      create: { name: 'WORKER', description: 'Colaborador operativo y cajero' },
    }),
    prisma.role.upsert({
      where: { name: 'TECHNICIAN' },
      update: { description: 'Tecnico responsable de ordenes de servicio' },
      create: { name: 'TECHNICIAN', description: 'Tecnico responsable de ordenes de servicio' },
    }),
  ]);

  const roleMap = new Map(roles.map((role) => [role.name, role.id]));
  const adminPassword = await bcrypt.hash('Admin12345', 10);
  const workerPassword = await bcrypt.hash('Worker12345', 10);
  const technicianPassword = await bcrypt.hash('Tech12345', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@innovasolutions.com' },
      update: { fullName: 'Administrador Innova Solutions', password: adminPassword, roleId: roleMap.get('ADMIN')!, isActive: true },
      create: { fullName: 'Administrador Innova Solutions', email: 'admin@innovasolutions.com', password: adminPassword, roleId: roleMap.get('ADMIN')!, isActive: true },
    }),
    prisma.user.upsert({
      where: { email: 'caja@innovasolutions.com' },
      update: { fullName: 'Mariana Torres - Cajera', password: workerPassword, roleId: roleMap.get('WORKER')!, isActive: true },
      create: { fullName: 'Mariana Torres - Cajera', email: 'caja@innovasolutions.com', password: workerPassword, roleId: roleMap.get('WORKER')!, isActive: true },
    }),
    prisma.user.upsert({
      where: { email: 'tecnico@innovasolutions.com' },
      update: { fullName: 'Carlos Huaman - Tecnico', password: technicianPassword, roleId: roleMap.get('TECHNICIAN')!, isActive: true },
      create: { fullName: 'Carlos Huaman - Tecnico', email: 'tecnico@innovasolutions.com', password: technicianPassword, roleId: roleMap.get('TECHNICIAN')!, isActive: true },
    }),
  ]);

  return {
    admin: users[0],
    worker: users[1],
    technician: users[2],
    count: users.length,
  };
}

async function seedCustomers() {
  const data = [
    ['DNI', '70124589', 'Luis Alberto Ramos', '987654321', 'luis.ramos@example.com', 'Av. Los Incas 120, Lima'],
    ['DNI', '72894561', 'Carmen Sofia Medina', '986111222', 'carmen.medina@example.com', 'Jr. Comercio 455, Lima'],
    ['DNI', '73658942', 'Miguel Angel Salas', '985222333', 'miguel.salas@example.com', 'Av. Grau 890, Lima'],
    ['DNI', '74561238', 'Rosa Maria Chavez', '984333444', 'rosa.chavez@example.com', 'Calle Las Flores 301, Lima'],
    ['DNI', '75987412', 'Daniel Fernandez Rios', '983444555', 'daniel.fernandez@example.com', 'Av. Brasil 1500, Lima'],
    ['RUC', '20604578912', 'Servicios Digitales Andes SAC', '982555666', 'contacto@andesdigital.pe', 'Av. Arequipa 2100, Lima'],
    ['RUC', '20588974123', 'Comercial Nova Peru EIRL', '981666777', 'ventas@novaperu.pe', 'Jr. Union 620, Lima'],
    ['CE', 'CE458912', 'Valentina Gomez Ruiz', '980777888', 'valentina.gomez@example.com', 'Av. Javier Prado 3300, Lima'],
    ['DNI', '76894521', 'Pedro Castillo Morales', '979888999', 'pedro.castillo@example.com', 'Calle Central 88, Lima'],
    ['OTHER', 'PAS998877', 'Andrea Lee Martinez', '978999000', 'andrea.lee@example.com', 'Av. La Marina 700, Lima'],
  ] as const;

  const customers = [];
  for (const [documentType, documentNumber, fullName, phone, email, address] of data) {
    customers.push(
      await prisma.customer.upsert({
        where: { documentType_documentNumber: { documentType: documentType as DocumentType, documentNumber } },
        update: { fullName, phone, email, address, isActive: true },
        create: {
          documentType: documentType as DocumentType,
          documentNumber,
          fullName,
          phone,
          email,
          address,
          notes: 'Cliente demo para pruebas funcionales',
          isActive: true,
        },
      }),
    );
  }
  return customers;
}

async function seedProductCatalog() {
  const categoryNames = ['Accesorios', 'Componentes', 'Impresión', 'Laptops', 'Periféricos', 'Redes', 'Software'];
  const categoryMap = new Map<string, string>();

  for (const name of categoryNames) {
    const category = await prisma.productCategory.upsert({
      where: { name },
      update: { description: `Categoria demo: ${name}`, isActive: true },
      create: { name, description: `Categoria demo: ${name}`, isActive: true },
    });
    categoryMap.set(name, category.id);
  }

  const productsData = [
    ['Laptop Lenovo IdeaPad', 'SKU-LEN-IDEA-001', '775000100001', 'Laptops', 1850, 2399, 8, 3, 'unidad', null],
    ['Mouse Logitech', 'SKU-MOU-LOG-002', '775000100002', 'Periféricos', 35, 65, 25, 8, 'unidad', null],
    ['Teclado Redragon', 'SKU-TEC-RED-003', '775000100003', 'Periféricos', 90, 145, 14, 5, 'unidad', null],
    ['Audifonos Gamer', 'SKU-AUD-GAM-004', '775000100004', 'Accesorios', 70, 129, 3, 4, 'unidad', null],
    ['Memoria RAM 8GB', 'SKU-RAM-8GB-005', '775000100005', 'Componentes', 75, 120, 10, 4, 'unidad', '/images/products/memoria-ram-8gb.jpg'],
    ['SSD Kingston 480GB', 'SKU-SSD-KIN-006', '775000100006', 'Componentes', 130, 210, 2, 4, 'unidad', '/images/products/ssd-kingston-480gb.jpg'],
    ['Cable HDMI', 'SKU-CAB-HDMI-007', '775000100007', 'Accesorios', 10, 25, 40, 10, 'unidad', '/images/products/cable-hdmi.jpg'],
    ['Tinta Epson', 'SKU-TIN-EPS-008', '775000100008', 'Impresión', 28, 55, 5, 6, 'unidad', '/images/products/tinta-epson.jpg'],
    ['Licencia Microsoft Office', 'SKU-SOF-OFF-009', '775000100009', 'Software', 65, 120, 12, 3, 'licencia', '/images/products/licencia-microsoft-office.jpg'],
    ['Router TP-Link', 'SKU-ROU-TPL-010', '775000100010', 'Redes', 85, 155, 6, 3, 'unidad', '/images/products/router-tplink.jpg'],
    ['Laptop HP 15 Ryzen 5', 'SKU-LAP-HP15-011', '775000100011', 'Laptops', 1950, 2599, 7, 3, 'unidad', null],
    ['Laptop Asus Vivobook i5', 'SKU-LAP-ASU-012', '775000100012', 'Laptops', 2100, 2799, 6, 3, 'unidad', null],
    ['Laptop Acer Aspire 5', 'SKU-LAP-ACE-013', '775000100013', 'Laptops', 1980, 2650, 4, 3, 'unidad', null],
    ['Laptop Dell Inspiron 3520', 'SKU-LAP-DEL-014', '775000100014', 'Laptops', 2200, 2990, 5, 2, 'unidad', null],
    ['Monitor LG 24 pulgadas', 'SKU-PER-MON-015', '775000100015', 'Periféricos', 330, 520, 9, 3, 'unidad', null],
    ['Webcam Logitech C270', 'SKU-PER-WEB-016', '775000100016', 'Periféricos', 75, 135, 11, 4, 'unidad', null],
    ['Mousepad Gamer XL', 'SKU-PER-MPD-017', '775000100017', 'Periféricos', 18, 39, 18, 6, 'unidad', null],
    ['Parlantes USB Genius', 'SKU-PER-SPK-018', '775000100018', 'Periféricos', 32, 69, 10, 4, 'unidad', null],
    ['Memoria RAM 16GB DDR4', 'SKU-COM-R16-019', '775000100019', 'Componentes', 145, 235, 8, 3, 'unidad', null],
    ['SSD NVMe Kingston 1TB', 'SKU-COM-NV1-020', '775000100020', 'Componentes', 260, 389, 5, 2, 'unidad', null],
    ['Fuente EVGA 600W', 'SKU-COM-PSU-021', '775000100021', 'Componentes', 180, 295, 6, 2, 'unidad', null],
    ['Case Antryx ATX', 'SKU-COM-CAS-022', '775000100022', 'Componentes', 135, 219, 7, 2, 'unidad', null],
    ['Adaptador USB WiFi', 'SKU-ACC-WIF-023', '775000100023', 'Accesorios', 22, 45, 16, 5, 'unidad', null],
    ['Cargador Universal Laptop', 'SKU-ACC-CHG-024', '775000100024', 'Accesorios', 55, 99, 8, 3, 'unidad', null],
    ['Hub USB 4 Puertos', 'SKU-ACC-HUB-025', '775000100025', 'Accesorios', 28, 59, 14, 5, 'unidad', null],
    ['Memoria USB 64GB', 'SKU-ACC-USB-026', '775000100026', 'Accesorios', 18, 39, 22, 8, 'unidad', null],
    ['Papel Bond A4 500 hojas', 'SKU-IMP-PAP-027', '775000100027', 'Impresión', 12, 25, 20, 8, 'paquete', null],
    ['Toner HP 85A Compatible', 'SKU-IMP-TON-028', '775000100028', 'Impresión', 58, 115, 6, 3, 'unidad', null],
    ['Cartucho Canon Color', 'SKU-IMP-CAN-029', '775000100029', 'Impresión', 42, 85, 7, 3, 'unidad', null],
    ['Kit Limpieza Impresora', 'SKU-IMP-KIT-030', '775000100030', 'Impresión', 15, 35, 12, 4, 'unidad', null],
    ['Antivirus ESET 1 Usuario', 'SKU-SOF-ESET-031', '775000100031', 'Software', 38, 79, 15, 4, 'licencia', null],
    ['Licencia Windows 11 Pro', 'SKU-SOF-W11P-032', '775000100032', 'Software', 85, 169, 10, 3, 'licencia', null],
    ['Canva Pro Configuracion', 'SKU-SOF-CAN-033', '775000100033', 'Software', 20, 49, 9, 3, 'servicio', null],
    ['Backup Cloud 100GB', 'SKU-SOF-BCK-034', '775000100034', 'Software', 18, 45, 12, 4, 'servicio', null],
    ['Switch TP-Link 8 Puertos', 'SKU-RED-SW8-035', '775000100035', 'Redes', 65, 119, 8, 3, 'unidad', null],
    ['Cable UTP Cat6 5m', 'SKU-RED-UTP-036', '775000100036', 'Redes', 10, 25, 30, 10, 'unidad', null],
    ['Access Point Mercusys', 'SKU-RED-APM-037', '775000100037', 'Redes', 95, 169, 5, 2, 'unidad', null],
    ['Repetidor WiFi Xiaomi', 'SKU-RED-RPT-038', '775000100038', 'Redes', 48, 89, 9, 3, 'unidad', null],
  ] as const;

  const products = [];
  for (const [name, sku, barcode, categoryName, purchasePrice, salePrice, stock, minStock, unit, imageUrl] of productsData) {
    const resolvedImageUrl = findProductImagePath(name) ?? imageUrl;

    products.push(
      await prisma.product.upsert({
        where: { sku },
        update: {
          name,
          barcode,
          categoryId: categoryMap.get(categoryName)!,
          purchasePrice,
          salePrice,
          stock,
          minStock,
          unit,
          imageUrl: resolvedImageUrl,
          isActive: true,
          description: `${name} demo para pruebas de inventario`,
        },
        create: {
          name,
          sku,
          barcode,
          categoryId: categoryMap.get(categoryName)!,
          purchasePrice,
          salePrice,
          stock,
          minStock,
          unit,
          imageUrl: resolvedImageUrl,
          isActive: true,
          description: `${name} demo para pruebas de inventario`,
        },
      }),
    );
  }

  return { products, categoryCount: categoryNames.length };
}

async function createInventoryMovement(productId: string, type: InventoryMovementType, quantity: number, previousStock: number, newStock: number, reason: string, userId: string) {
  return prisma.inventoryMovement.create({
    data: {
      productId,
      type,
      quantity,
      previousStock,
      newStock,
      reason: `DEMO: ${reason}`,
      userId,
    },
  });
}

async function seedInitialInventoryMovements(products: Awaited<ReturnType<typeof seedProductCatalog>>['products'], userId: string) {
  for (const product of products) {
    await createInventoryMovement(product.id, InventoryMovementType.IN, product.stock, 0, product.stock, `stock inicial ${product.name}`, userId);
  }

  const adjustmentProduct = products[3];
  await createInventoryMovement(adjustmentProduct.id, InventoryMovementType.ADJUSTMENT, 1, adjustmentProduct.stock - 1, adjustmentProduct.stock, 'ajuste por conteo fisico', userId);
}

async function seedQuickServices() {
  const categories = [
    ['Impresiones', '#06b6d4', 'Printer'],
    ['Fotocopias', '#2563eb', 'Copy'],
    ['Escaneos', '#0891b2', 'Scan'],
    ['Tramites digitales', '#8b5cf6', 'FileCheck'],
    ['Diseno', '#f97316', 'Palette'],
    ['Recargas', '#16a34a', 'Smartphone'],
  ] as const;

  const categoryMap = new Map<string, string>();
  for (const [name, color, icon] of categories) {
    const category = await prisma.quickServiceCategory.upsert({
      where: { name },
      update: { color, icon, isActive: true, description: `Categoria demo: ${name}` },
      create: { name, color, icon, isActive: true, description: `Categoria demo: ${name}` },
    });
    categoryMap.set(name, category.id);
  }

  const services = [
    ['Impresion B/N', 'Impresiones', 'hoja', 0.5, 0.1],
    ['Impresion color', 'Impresiones', 'hoja', 1.5, 0.4],
    ['Fotocopia B/N', 'Fotocopias', 'hoja', 0.3, 0.08],
    ['Fotocopia color', 'Fotocopias', 'hoja', 1, 0.25],
    ['Escaneo', 'Escaneos', 'hoja', 1, 0],
    ['Digitacion por hoja', 'Tramites digitales', 'hoja', 5, 0],
    ['Conversion a PDF', 'Tramites digitales', 'archivo', 3, 0],
    ['Tramite digital simple', 'Tramites digitales', 'servicio', 10, 0],
    ['Recarga movil', 'Recargas', 'operacion', 1, 0],
    ['Diseno Canva basico', 'Diseno', 'diseno', 15, 0],
  ] as const;

  const quickServices = [];
  for (const [name, categoryName, unit, unitPrice, costPrice] of services) {
    const existing = await prisma.quickService.findFirst({ where: { name } });
    const data = { categoryId: categoryMap.get(categoryName)!, name, unit, unitPrice, costPrice, isActive: true, description: `${name} demo` };
    quickServices.push(existing ? await prisma.quickService.update({ where: { id: existing.id }, data }) : await prisma.quickService.create({ data }));
  }

  return quickServices;
}

async function seedSuppliers() {
  const data = [
    ['TecnoImport Peru SAC', '20601234561', '987110001', 'ventas@tecnoimport.pe', 'Av. Argentina 455, Lima', 'Jorge Paredes'],
    ['Distribuidora Compulima', '20551234002', '987110002', 'contacto@compulima.pe', 'Jr. Paruro 980, Lima', 'Ana Vargas'],
    ['Mayorista Digital Andina', '20604561003', '987110003', 'ventas@digitalandina.pe', 'Av. Colonial 1340, Lima', 'Mario Ruiz'],
    ['Importaciones Nova Tech', '20607894004', '987110004', 'info@novatech.pe', 'Av. Wilson 1260, Lima', 'Lucia Soto'],
    ['Redes y Seguridad SAC', '20567891005', '987110005', 'comercial@redseg.pe', 'Av. Canada 750, Lima', 'Hector Ramos'],
    ['Insumos Epson Peru', '20609876006', '987110006', 'ventas@epsoninsumos.pe', 'Calle Industrial 300, Lima', 'Patricia Leon'],
    ['Software Legal Peru', '20599887707', '987110007', 'licencias@softwarelegal.pe', 'Av. Benavides 2100, Lima', 'Raul Mendoza'],
    ['Componentes Express', '20603456008', '987110008', 'ventas@componentesexpress.pe', 'Av. Aviacion 1600, Lima', 'Karla Diaz'],
    ['Accesorios Globales', '20588776609', '987110009', 'pedidos@accesoriosglobales.pe', 'Jr. Ayacucho 410, Lima', 'Cesar Flores'],
    ['Soluciones TP Network', '20607654010', '987110010', 'contacto@tpnetwork.pe', 'Av. La Marina 2700, Lima', 'Milagros Vega'],
  ] as const;

  const suppliers = [];
  for (const [name, ruc, phone, email, address, contactName] of data) {
    suppliers.push(
      await prisma.supplier.upsert({
        where: { ruc },
        update: { name, phone, email, address, contactName, isActive: true },
        create: { name, ruc, phone, email, address, contactName, notes: 'Proveedor demo', isActive: true },
      }),
    );
  }
  return suppliers;
}

async function seedCashSession(userId: string) {
  return prisma.cashSession.create({
    data: {
      code: 'CJ-000001',
      userId,
      openingAmount: 300,
      expectedCashAmount: 300,
      totalCash: 300,
      status: CashSessionStatus.OPEN,
      notes: 'Caja demo abierta para pruebas integrales',
    },
  });
}

async function seedPurchases(suppliers: Awaited<ReturnType<typeof seedSuppliers>>, products: Awaited<ReturnType<typeof seedProductCatalog>>['products'], userId: string, cashSessionId: string) {
  const statuses = [
    PurchaseOrderStatus.RECEIVED,
    PurchaseOrderStatus.PARTIALLY_RECEIVED,
    PurchaseOrderStatus.PENDING,
    PurchaseOrderStatus.RECEIVED,
    PurchaseOrderStatus.PENDING,
    PurchaseOrderStatus.PARTIALLY_RECEIVED,
    PurchaseOrderStatus.RECEIVED,
    PurchaseOrderStatus.PENDING,
    PurchaseOrderStatus.RECEIVED,
    PurchaseOrderStatus.PENDING,
  ];

  const purchases = [];
  for (let index = 0; index < 10; index += 1) {
    const productA = products[index % products.length];
    const productB = products[(index + 3) % products.length];
    const quantityA = 3 + index;
    const quantityB = 2 + (index % 4);
    const receivedA = statuses[index] === PurchaseOrderStatus.PENDING ? 0 : statuses[index] === PurchaseOrderStatus.PARTIALLY_RECEIVED ? Math.floor(quantityA / 2) : quantityA;
    const receivedB = statuses[index] === PurchaseOrderStatus.RECEIVED ? quantityB : 0;
    const subtotal = roundMoney(quantityA * Number(productA.purchasePrice) + quantityB * Number(productB.purchasePrice));
    const taxTotal = roundMoney(subtotal * TAX_RATE);
    const total = roundMoney(subtotal + taxTotal);
    const purchase = await prisma.purchaseOrder.create({
      data: {
        code: purchaseCodes[index],
        supplierId: suppliers[index].id,
        userId,
        status: statuses[index],
        subtotal,
        taxTotal,
        discount: index === 2 ? 10 : 0,
        total: index === 2 ? roundMoney(total - 10) : total,
        paymentStatus: index % 3 === 0 ? PurchasePaymentStatus.PAID : index % 3 === 1 ? PurchasePaymentStatus.PARTIAL : PurchasePaymentStatus.PENDING,
        paymentMethod: index % 3 === 0 ? PaymentMethod.TRANSFER : null,
        reference: index % 3 === 0 ? `TRF-OC-${index + 1}` : null,
        expectedDate: daysFromNow(index + 1),
        receivedAt: statuses[index] === PurchaseOrderStatus.RECEIVED ? daysFromNow(-index) : null,
        notes: 'DEMO: orden de compra para pruebas',
        items: {
          create: [
            { productId: productA.id, quantity: quantityA, receivedQuantity: receivedA, unitCost: productA.purchasePrice, subtotal: roundMoney(quantityA * Number(productA.purchasePrice)) },
            { productId: productB.id, quantity: quantityB, receivedQuantity: receivedB, unitCost: productB.purchasePrice, subtotal: roundMoney(quantityB * Number(productB.purchasePrice)) },
          ],
        },
      },
    });

    if (receivedA > 0) {
      const current = await prisma.product.findUniqueOrThrow({ where: { id: productA.id } });
      await prisma.product.update({ where: { id: productA.id }, data: { stock: current.stock + receivedA, purchasePrice: productA.purchasePrice } });
      await createInventoryMovement(productA.id, InventoryMovementType.IN, receivedA, current.stock, current.stock + receivedA, `recepcion compra ${purchase.code}`, userId);
    }
    if (receivedB > 0) {
      const current = await prisma.product.findUniqueOrThrow({ where: { id: productB.id } });
      await prisma.product.update({ where: { id: productB.id }, data: { stock: current.stock + receivedB, purchasePrice: productB.purchasePrice } });
      await createInventoryMovement(productB.id, InventoryMovementType.IN, receivedB, current.stock, current.stock + receivedB, `recepcion compra ${purchase.code}`, userId);
    }
    if (purchase.paymentStatus === PurchasePaymentStatus.PAID) {
      await prisma.cashMovement.create({
        data: {
          cashSessionId,
          userId,
          type: CashMovementType.EXPENSE,
          concept: `Compra de productos - ${purchase.code}`,
          amount: purchase.total,
          paymentMethod: PaymentMethod.TRANSFER,
          relatedPurchaseOrderId: purchase.id,
          notes: 'DEMO: gasto de compra pagada',
        },
      });
    }
    purchases.push(purchase);
  }

  return purchases;
}

async function seedSales(customers: Awaited<ReturnType<typeof seedCustomers>>, products: Awaited<ReturnType<typeof seedProductCatalog>>['products'], userId: string, cashSessionId: string) {
  const methods = [PaymentMethod.CASH, PaymentMethod.YAPE, PaymentMethod.PLIN, PaymentMethod.TRANSFER, PaymentMethod.CASH, PaymentMethod.YAPE, PaymentMethod.PLIN, PaymentMethod.TRANSFER, PaymentMethod.CASH, PaymentMethod.YAPE];
  const sales = [];

  for (let index = 0; index < 10; index += 1) {
    const product = products[index % products.length];
    const quantity = index % 4 === 0 ? 2 : 1;
    const discount = index === 4 ? 5 : 0;
    const totals = calculateTotals([{ quantity, unitPrice: Number(product.salePrice), discount }]);
    const sale = await prisma.sale.create({
      data: {
        code: saleCodes[index],
        customerId: index % 3 === 0 ? null : customers[index % customers.length].id,
        userId,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        applyIgv: true,
        igvRate: TAX_RATE,
        paymentStatus: PaymentStatus.PAID,
        status: SaleStatus.COMPLETED,
        notes: 'DEMO: venta POS',
        items: {
          create: {
            productId: product.id,
            itemType: SaleItemType.PRODUCT,
            description: product.name,
            quantity,
            unitPrice: product.salePrice,
            discount,
            subtotal: totals.subtotal,
            total: roundMoney(totals.subtotal - discount),
          },
        },
        payments: {
          create: {
            method: methods[index],
            amount: totals.total,
            reference: methods[index] === PaymentMethod.CASH ? null : `REF-${saleCodes[index]}`,
          },
        },
      },
    });

    const current = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    await prisma.product.update({ where: { id: product.id }, data: { stock: current.stock - quantity } });
    await createInventoryMovement(product.id, InventoryMovementType.OUT, quantity, current.stock, current.stock - quantity, `venta ${sale.code}`, userId);
    await prisma.cashMovement.create({
      data: {
        cashSessionId,
        userId,
        type: CashMovementType.SALE,
        concept: `Venta POS - ${sale.code}`,
        amount: totals.total,
        paymentMethod: methods[index],
        relatedSaleId: sale.id,
        notes: 'DEMO: movimiento de caja por venta',
      },
    });
    sales.push(sale);
  }

  return sales;
}

async function seedServiceOrders(customers: Awaited<ReturnType<typeof seedCustomers>>, products: Awaited<ReturnType<typeof seedProductCatalog>>['products'], userId: string, technicianId: string) {
  const statuses = [
    ServiceOrderStatus.RECEIVED,
    ServiceOrderStatus.DIAGNOSIS,
    ServiceOrderStatus.IN_PROGRESS,
    ServiceOrderStatus.READY,
    ServiceOrderStatus.DELIVERED,
    ServiceOrderStatus.CANCELLED,
    ServiceOrderStatus.RECEIVED,
    ServiceOrderStatus.IN_PROGRESS,
    ServiceOrderStatus.READY,
    ServiceOrderStatus.DELIVERED,
  ];
  const equipment = [
    ['Laptop', 'Lenovo', 'IdeaPad 3', 'LN-2026-001', 'No enciende correctamente'],
    ['PC', 'HP', 'ProDesk', 'HP-2026-002', 'Lentitud extrema del sistema'],
    ['Impresora', 'Epson', 'L3250', 'EP-2026-003', 'No imprime color'],
    ['Laptop', 'Asus', 'Vivobook', 'AS-2026-004', 'Pantalla con parpadeo'],
    ['Router', 'TP-Link', 'Archer C6', 'TP-2026-005', 'Sin conexion WiFi'],
    ['Laptop', 'Acer', 'Aspire 5', 'AC-2026-006', 'Teclado no responde'],
    ['PC Gamer', 'Custom', 'Ryzen 5', 'PC-2026-007', 'Temperatura elevada'],
    ['All in One', 'Lenovo', 'AIO 3', 'AIO-2026-008', 'Sistema no inicia'],
    ['Impresora', 'Canon', 'G3110', 'CN-2026-009', 'Atasco de papel frecuente'],
    ['Laptop', 'Dell', 'Inspiron', 'DL-2026-010', 'Bateria no carga'],
  ] as const;

  const orders = [];
  for (let index = 0; index < 10; index += 1) {
    const [equipmentType, brand, model, serialNumber, reportedIssue] = equipment[index];
    const product = index % 2 === 0 ? products[(index + 1) % products.length] : null;
    const partsCost = product ? Number(product.salePrice) : 0;
    const laborCost = 45 + index * 8;
    const discount = index === 5 ? 15 : 0;
    const total = roundMoney(laborCost + partsCost - discount);
    const deliveredAt = statuses[index] === ServiceOrderStatus.DELIVERED ? daysFromNow(-index) : null;

    const order = await prisma.serviceOrder.create({
      data: {
        code: serviceOrderCodes[index],
        customerId: customers[index % customers.length].id,
        userId,
        equipmentType,
        brand,
        model,
        serialNumber,
        reportedIssue,
        technicalDiagnosis: index > 0 ? 'Diagnostico tecnico demo: requiere mantenimiento y validacion de componentes.' : null,
        solutionApplied: [ServiceOrderStatus.READY, ServiceOrderStatus.DELIVERED].includes(statuses[index]) ? 'Limpieza, pruebas funcionales y ajuste de software.' : null,
        status: statuses[index],
        estimatedDeliveryDate: daysFromNow(index + 2),
        deliveredAt,
        laborCost,
        partsCost,
        discount,
        total,
        notes: 'DEMO: orden tecnica',
        items: product
          ? {
              create: {
                productId: product.id,
                description: `Repuesto usado: ${product.name}`,
                quantity: 1,
                unitPrice: product.salePrice,
                subtotal: product.salePrice,
              },
            }
          : undefined,
        logs: {
          create: [
            { userId, action: 'CREATED', newStatus: ServiceOrderStatus.RECEIVED, comment: 'DEMO: orden recibida' },
            ...(statuses[index] !== ServiceOrderStatus.RECEIVED
              ? [{ userId: technicianId, action: 'STATUS_CHANGE', previousStatus: ServiceOrderStatus.RECEIVED, newStatus: statuses[index], comment: 'DEMO: avance de estado' }]
              : []),
          ],
        },
      },
    });

    if (product) {
      const current = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
      await prisma.product.update({ where: { id: product.id }, data: { stock: current.stock - 1 } });
      await createInventoryMovement(product.id, InventoryMovementType.OUT, 1, current.stock, current.stock - 1, `repuesto orden ${order.code}`, technicianId);
    }
    orders.push(order);
  }

  return orders;
}

async function seedQuickServiceSales(customers: Awaited<ReturnType<typeof seedCustomers>>, quickServices: Awaited<ReturnType<typeof seedQuickServices>>, userId: string, cashSessionId: string) {
  const methods = [PaymentMethod.CASH, PaymentMethod.YAPE, PaymentMethod.PLIN, PaymentMethod.TRANSFER, PaymentMethod.CASH, PaymentMethod.YAPE, PaymentMethod.PLIN, PaymentMethod.CASH, PaymentMethod.TRANSFER, PaymentMethod.YAPE];
  const sales = [];
  for (let index = 0; index < 10; index += 1) {
    const service = quickServices[index % quickServices.length];
    const quantity = index + 1;
    const subtotal = roundMoney(quantity * Number(service.unitPrice));
    const discount = index === 7 ? 2 : 0;
    const total = roundMoney(subtotal - discount);
    const sale = await prisma.quickServiceSale.create({
      data: {
        code: quickServiceSaleCodes[index],
        customerId: index % 4 === 0 ? null : customers[index % customers.length].id,
        userId,
        cashSessionId,
        subtotal,
        discount,
        total,
        paymentMethod: methods[index],
        paymentReference: methods[index] === PaymentMethod.CASH ? null : `SRPAY-${index + 1}`,
        status: QuickServiceSaleStatus.COMPLETED,
        notes: 'DEMO: venta de servicio rapido',
        items: {
          create: {
            quickServiceId: service.id,
            description: service.name,
            quantity,
            unitPrice: service.unitPrice,
            subtotal,
          },
        },
      },
    });

    await prisma.cashMovement.create({
      data: {
        cashSessionId,
        userId,
        type: CashMovementType.SERVICE_PAYMENT,
        concept: `Servicio rapido - ${sale.code}`,
        amount: total,
        paymentMethod: methods[index],
        relatedQuickServiceSaleId: sale.id,
        notes: 'DEMO: movimiento por servicio rapido',
      },
    });
    sales.push(sale);
  }
  return sales;
}

async function seedManualCashMovements(cashSessionId: string, userId: string) {
  await prisma.cashMovement.createMany({
    data: [
      { cashSessionId, userId, type: CashMovementType.INCOME, concept: 'Ingreso manual por saldo inicial adicional', amount: 80, paymentMethod: PaymentMethod.CASH, notes: 'DEMO: ingreso manual' },
      { cashSessionId, userId, type: CashMovementType.EXPENSE, concept: 'Compra de utiles de oficina', amount: 35, paymentMethod: PaymentMethod.CASH, notes: 'DEMO: gasto manual' },
      { cashSessionId, userId, type: CashMovementType.EXPENSE, concept: 'Pago delivery local', amount: 18, paymentMethod: PaymentMethod.YAPE, notes: 'DEMO: gasto operativo' },
    ],
  });
}

async function updateCashSessionTotals(cashSessionId: string) {
  const session = await prisma.cashSession.findUniqueOrThrow({ where: { id: cashSessionId } });
  const movements = await prisma.cashMovement.findMany({ where: { cashSessionId } });
  const incomeTypes = [CashMovementType.INCOME, CashMovementType.SALE, CashMovementType.SERVICE_PAYMENT, CashMovementType.ADJUSTMENT];
  const totalExpenses = roundMoney(movements.filter((movement) => movement.type === CashMovementType.EXPENSE).reduce((sum, movement) => sum + Number(movement.amount), 0));
  const totalSales = roundMoney(movements.filter((movement) => [CashMovementType.SALE, CashMovementType.SERVICE_PAYMENT].includes(movement.type)).reduce((sum, movement) => sum + Number(movement.amount), 0));
  const byMethod = (method: PaymentMethod) =>
    roundMoney(
      movements
        .filter((movement) => movement.paymentMethod === method)
        .reduce((sum, movement) => sum + (incomeTypes.includes(movement.type) ? Number(movement.amount) : -Number(movement.amount)), 0),
    );

  const totalCash = roundMoney(Number(session.openingAmount) + byMethod(PaymentMethod.CASH));
  await prisma.cashSession.update({
    where: { id: cashSessionId },
    data: {
      totalSales,
      totalExpenses,
      totalCash,
      totalYape: byMethod(PaymentMethod.YAPE),
      totalPlin: byMethod(PaymentMethod.PLIN),
      totalTransfer: byMethod(PaymentMethod.TRANSFER),
      expectedCashAmount: totalCash,
      difference: 0,
    },
  });
}

async function seedNotifications(adminId: string, workerId: string) {
  await prisma.notification.createMany({
    data: [
      { userId: adminId, title: 'Stock bajo', message: 'SSD Kingston 480GB esta por debajo del stock minimo.', type: NotificationType.STOCK_LOW, priority: NotificationPriority.HIGH, relatedModule: 'DEMO' },
      { userId: adminId, title: 'Producto sin stock critico', message: 'Revisar productos con pocas unidades disponibles.', type: NotificationType.STOCK_LOW, priority: NotificationPriority.CRITICAL, relatedModule: 'DEMO' },
      { userId: workerId, title: 'Orden lista', message: 'La orden OT-000004 esta lista para entrega.', type: NotificationType.ORDER_READY, priority: NotificationPriority.MEDIUM, relatedModule: 'DEMO' },
      { userId: adminId, title: 'Caja con diferencia', message: 'Validar cierre de caja anterior por diferencia detectada.', type: NotificationType.CASH_DIFFERENCE, priority: NotificationPriority.HIGH, relatedModule: 'DEMO' },
      { userId: adminId, title: 'Compra pendiente', message: 'OC-000003 sigue pendiente de recepcion.', type: NotificationType.PURCHASE_PENDING, priority: NotificationPriority.MEDIUM, relatedModule: 'DEMO' },
      { userId: null, title: 'Sistema actualizado', message: 'Datos demo cargados correctamente.', type: NotificationType.SYSTEM, priority: NotificationPriority.LOW, relatedModule: 'DEMO' },
      { userId: workerId, title: 'Recordatorio de caja', message: 'Verificar monto fisico antes de cerrar caja.', type: NotificationType.SYSTEM, priority: NotificationPriority.MEDIUM, relatedModule: 'DEMO' },
      { userId: adminId, title: 'Orden sin cambio reciente', message: 'Revisar ordenes en diagnostico con demora.', type: NotificationType.ORDER_DELAYED, priority: NotificationPriority.HIGH, relatedModule: 'DEMO' },
      { userId: null, title: 'Backup recomendado', message: 'Programar backup diario de la base de datos.', type: NotificationType.SYSTEM, priority: NotificationPriority.LOW, relatedModule: 'DEMO' },
      { userId: adminId, title: 'Accion critica registrada', message: 'Se detecto anulacion demo para pruebas de auditoria.', type: NotificationType.SYSTEM, priority: NotificationPriority.CRITICAL, relatedModule: 'DEMO' },
    ],
  });
}

async function seedAuditLogs(userId: string) {
  await prisma.auditLog.createMany({
    data: [
      { userId, action: 'LOGIN', module: 'auth', description: 'DEMO: inicio de sesion administrador', entityType: 'User' },
      { userId, action: 'CREATE', module: 'sales', description: 'DEMO: creacion de venta POS', entityType: 'Sale', entityId: saleCodes[0] },
      { userId, action: 'ADJUST_STOCK', module: 'inventory', description: 'DEMO: ajuste de stock por conteo', entityType: 'Product' },
      { userId, action: 'CREATE', module: 'service-orders', description: 'DEMO: creacion de orden tecnica', entityType: 'ServiceOrder', entityId: serviceOrderCodes[0] },
      { userId, action: 'CLOSE', module: 'cash', description: 'DEMO: cierre de caja simulado', entityType: 'CashSession', entityId: 'CJ-000001' },
      { userId, action: 'RECEIVE', module: 'purchases', description: 'DEMO: compra recibida', entityType: 'PurchaseOrder', entityId: purchaseCodes[0] },
      { userId, action: 'EXPORT', module: 'reports', description: 'DEMO: exportacion de reporte', entityType: 'Report' },
      { userId, action: 'UPDATE', module: 'settings', description: 'DEMO: cambio de configuracion del negocio', entityType: 'BusinessSettings' },
    ],
  });
}

async function seedBusinessSettings() {
  const existing = await prisma.businessSettings.findFirst({ orderBy: { createdAt: 'asc' } });
  const data = {
    businessName: 'Innova Solutions',
    ruc: '20609988771',
    address: 'Av. Tecnologia 456, Lima, Peru',
    phone: '987654321',
    email: 'contacto@innovasolutions.com',
    currency: 'PEN',
    applyIgv: false,
    taxPercentage: 18,
    yapeNumber: '987654321',
    plinNumber: '987654321',
    bankAccount: 'BCP 191-00000000-0-00',
    receiptMessage: 'Gracias por confiar en Innova Solutions',
  };

  return existing ? prisma.businessSettings.update({ where: { id: existing.id }, data }) : prisma.businessSettings.create({ data });
}

async function main() {
  console.log('Iniciando seed demo de Innova Solutions...');
  await cleanupDemoData();

  const users = await seedRolesAndUsers();
  const customers = await seedCustomers();
  const { products, categoryCount } = await seedProductCatalog();
  await seedInitialInventoryMovements(products, users.admin.id);
  const quickServices = await seedQuickServices();
  const suppliers = await seedSuppliers();
  const cashSession = await seedCashSession(users.worker.id);
  await seedManualCashMovements(cashSession.id, users.worker.id);
  const purchases = await seedPurchases(suppliers, products, users.admin.id, cashSession.id);
  const sales = await seedSales(customers, products, users.worker.id, cashSession.id);
  const orders = await seedServiceOrders(customers, products, users.worker.id, users.technician.id);
  const quickSales = await seedQuickServiceSales(customers, quickServices, users.worker.id, cashSession.id);
  await updateCashSessionTotals(cashSession.id);
  await seedNotifications(users.admin.id, users.worker.id);
  await seedAuditLogs(users.admin.id);
  await seedBusinessSettings();

  console.log('Seed demo completado:');
  console.table({
    usuarios: users.count,
    clientes: customers.length,
    categoriasProductos: categoryCount,
    productos: products.length,
    proveedores: suppliers.length,
    compras: purchases.length,
    ventas: sales.length,
    ordenesTecnicas: orders.length,
    serviciosRapidos: quickServices.length,
    ventasServiciosRapidos: quickSales.length,
  });
  console.log('Credencial principal: admin@innovasolutions.com / Admin12345');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
