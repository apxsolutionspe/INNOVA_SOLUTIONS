-- Backfill idempotente para garantizar catalogo minimo visible en POS.
-- Seguro para produccion: no elimina productos, no duplica SKUs y no reduce stock existente.
WITH category_seed("id", "name", "description") AS (
  VALUES
    ('pos-cat-accesorios', 'Accesorios', 'Accesorios tecnologicos para venta en POS'),
    ('pos-cat-componentes', 'Componentes', 'Componentes internos para computadoras'),
    ('pos-cat-impresion', 'Impresión', 'Insumos y productos para impresion'),
    ('pos-cat-laptops', 'Laptops', 'Equipos portatiles para venta'),
    ('pos-cat-perifericos', 'Periféricos', 'Perifericos y dispositivos externos'),
    ('pos-cat-redes', 'Redes', 'Equipos y accesorios de conectividad'),
    ('pos-cat-software', 'Software', 'Licencias y suscripciones de software')
)
INSERT INTO "ProductCategory" ("id", "name", "description", "isActive", "createdAt", "updatedAt")
SELECT "id", "name", "description", true, NOW(), NOW()
FROM category_seed
ON CONFLICT ("name") DO UPDATE SET
  "description" = COALESCE("ProductCategory"."description", EXCLUDED."description"),
  "isActive" = true,
  "updatedAt" = NOW();

WITH product_seed(
  "categoryName",
  "name",
  "description",
  "sku",
  "imageUrl",
  "purchasePrice",
  "salePrice",
  "stock",
  "minStock",
  "unit"
) AS (
  VALUES
    ('Accesorios', 'Cable HDMI', 'Cable HDMI 2 metros para audio y video digital', 'SKU-ACC-HDMI-007', '/images/products/cable-hdmi.jpg', 12.00, 25.00, 24, 5, 'unidad'),
    ('Accesorios', 'Audífonos Gamer', 'Audifonos gamer con microfono y sonido estereo', 'SKU-ACC-AUD-GAM-004', '/images/products/audifonos-gamer.jpg', 45.00, 89.00, 12, 3, 'unidad'),
    ('Accesorios', 'Mousepad XL', 'Mousepad extendido para escritorio y gaming', 'SKU-ACC-MPAD-011', '/images/products/mousepad-xl.jpg', 18.00, 39.00, 18, 4, 'unidad'),
    ('Accesorios', 'Adaptador USB WiFi', 'Adaptador USB WiFi para PC o laptop', 'SKU-ACC-USB-WIFI-012', '/images/products/adaptador-usb-wifi.jpg', 25.00, 49.00, 15, 4, 'unidad'),
    ('Accesorios', 'Hub USB 4 Puertos', 'Hub USB compacto de cuatro puertos', 'SKU-ACC-HUB-USB-013', '/images/products/hub-usb-4-puertos.jpg', 28.00, 55.00, 14, 4, 'unidad'),

    ('Componentes', 'SSD Kingston 480GB', 'Unidad SSD Kingston SATA 480GB', 'SKU-SSD-KIN-006', '/images/products/ssd-kingston-480gb.jpg', 110.00, 169.00, 10, 3, 'unidad'),
    ('Componentes', 'Memoria RAM 8GB', 'Memoria RAM DDR4 8GB para PC o laptop', 'SKU-RAM-8GB-005', '/images/products/memoria-ram-8gb.jpg', 75.00, 119.00, 14, 4, 'unidad'),
    ('Componentes', 'Fuente de Poder 600W', 'Fuente de poder 600W para computadora de escritorio', 'SKU-COMP-FUENTE-014', '/images/products/fuente-poder-600w.jpg', 95.00, 159.00, 8, 3, 'unidad'),
    ('Componentes', 'Placa Madre H610', 'Placa madre H610 compatible con procesadores Intel', 'SKU-COMP-H610-015', '/images/products/placa-madre-h610.jpg', 245.00, 339.00, 6, 2, 'unidad'),
    ('Componentes', 'Procesador Intel Core i5', 'Procesador Intel Core i5 para equipos de trabajo', 'SKU-COMP-I5-016', '/images/products/procesador-intel-core-i5.jpg', 520.00, 699.00, 5, 2, 'unidad'),

    ('Impresión', 'Tinta Epson', 'Botella de tinta Epson original para impresoras compatibles', 'SKU-TIN-EPS-008', '/images/products/tinta-epson.jpg', 28.00, 49.00, 20, 5, 'unidad'),
    ('Impresión', 'Tóner HP 85A', 'Toner HP 85A compatible para impresoras laser', 'SKU-IMP-TON-HP85A-017', '/images/products/toner-hp-85a.jpg', 120.00, 189.00, 7, 2, 'unidad'),
    ('Impresión', 'Papel Bond A4', 'Paquete de papel bond A4 para impresion y copias', 'SKU-IMP-PAP-A4-018', '/images/products/papel-bond-a4.jpg', 14.00, 24.00, 40, 10, 'paquete'),
    ('Impresión', 'Cartucho Canon Color', 'Cartucho Canon color para impresoras compatibles', 'SKU-IMP-CAN-COLOR-019', '/images/products/cartucho-canon-color.jpg', 65.00, 105.00, 9, 3, 'unidad'),
    ('Impresión', 'Botella Tinta Epson Negra', 'Botella de tinta negra Epson para alto rendimiento', 'SKU-IMP-EPS-NEGRA-020', '/images/products/botella-tinta-epson-negra.jpg', 30.00, 55.00, 18, 5, 'unidad'),

    ('Laptops', 'Laptop Lenovo IdeaPad', 'Laptop Lenovo IdeaPad para oficina y estudio', 'SKU-LEN-IDEA-001', '/images/products/laptop-lenovo-ideapad.jpg', 1450.00, 1899.00, 5, 2, 'unidad'),
    ('Laptops', 'Laptop HP Core i5', 'Laptop HP con procesador Intel Core i5', 'SKU-LAP-HP-I5-021', '/images/products/laptop-hp-core-i5.jpg', 1650.00, 2199.00, 4, 2, 'unidad'),
    ('Laptops', 'Laptop Asus VivoBook', 'Laptop Asus VivoBook ligera para productividad', 'SKU-LAP-ASUS-VIVO-022', '/images/products/laptop-asus-vivobook.jpg', 1580.00, 2099.00, 4, 2, 'unidad'),
    ('Laptops', 'Laptop Acer Aspire', 'Laptop Acer Aspire para trabajo y clases', 'SKU-LAP-ACER-ASP-023', '/images/products/laptop-acer-aspire.jpg', 1500.00, 1999.00, 5, 2, 'unidad'),
    ('Laptops', 'Laptop Dell Inspiron', 'Laptop Dell Inspiron para uso empresarial', 'SKU-LAP-DELL-INS-024', '/images/products/laptop-dell-inspiron.jpg', 1750.00, 2299.00, 3, 2, 'unidad'),

    ('Periféricos', 'Teclado Redragon', 'Teclado Redragon mecanico para productividad y gaming', 'SKU-TEC-RED-003', '/images/products/teclado-redragon.jpg', 80.00, 139.00, 13, 4, 'unidad'),
    ('Periféricos', 'Mouse Logitech', 'Mouse Logitech optico inalambrico', 'SKU-MOU-LOG-002', '/images/products/mouse-logitech.jpg', 35.00, 69.00, 22, 5, 'unidad'),
    ('Periféricos', 'Monitor Samsung 24', 'Monitor Samsung de 24 pulgadas Full HD', 'SKU-PER-MON-SAM-025', '/images/products/monitor-samsung-24.jpg', 390.00, 549.00, 6, 2, 'unidad'),
    ('Periféricos', 'Cámara Web Full HD', 'Camara web Full HD para videollamadas', 'SKU-PER-CAM-FHD-026', '/images/products/camara-web-full-hd.jpg', 70.00, 119.00, 11, 3, 'unidad'),
    ('Periféricos', 'Parlantes Logitech', 'Parlantes Logitech compactos para PC', 'SKU-PER-PAR-LOG-027', '/images/products/parlantes-logitech.jpg', 55.00, 99.00, 10, 3, 'unidad'),

    ('Redes', 'Router TP-Link', 'Router TP-Link para hogar y oficina', 'SKU-ROU-TPL-010', '/images/products/router-tp-link.jpg', 85.00, 139.00, 9, 3, 'unidad'),
    ('Redes', 'Switch TP-Link 8 Puertos', 'Switch TP-Link de 8 puertos para red local', 'SKU-RED-SWI-TP8-028', '/images/products/switch-tp-link-8-puertos.jpg', 65.00, 109.00, 8, 3, 'unidad'),
    ('Redes', 'Cable UTP Cat 6', 'Cable UTP categoria 6 por metro', 'SKU-RED-UTP-CAT6-029', '/images/products/cable-utp-cat-6.jpg', 1.50, 3.00, 120, 30, 'metro'),
    ('Redes', 'Access Point TP-Link', 'Access Point TP-Link para ampliar cobertura WiFi', 'SKU-RED-AP-TPL-030', '/images/products/access-point-tp-link.jpg', 125.00, 199.00, 6, 2, 'unidad'),
    ('Redes', 'Repetidor WiFi', 'Repetidor WiFi para mejorar cobertura de red', 'SKU-RED-REP-WIFI-031', '/images/products/repetidor-wifi.jpg', 55.00, 95.00, 10, 3, 'unidad'),

    ('Software', 'Licencia Microsoft Office', 'Licencia Microsoft Office para productividad', 'SKU-SOF-OFF-009', '/images/products/licencia-microsoft-office.jpg', 110.00, 179.00, 16, 4, 'unidad'),
    ('Software', 'Antivirus ESET', 'Licencia Antivirus ESET para proteccion anual', 'SKU-SOF-ESET-032', '/images/products/antivirus-eset.jpg', 45.00, 89.00, 15, 4, 'unidad'),
    ('Software', 'Licencia Windows 11 Pro', 'Licencia Windows 11 Pro para equipos empresariales', 'SKU-SOF-WIN11-033', '/images/products/licencia-windows-11-pro.jpg', 150.00, 249.00, 10, 3, 'unidad'),
    ('Software', 'Licencia Adobe Acrobat', 'Licencia Adobe Acrobat para gestion de documentos PDF', 'SKU-SOF-ADOBE-034', '/images/products/licencia-adobe-acrobat.jpg', 125.00, 199.00, 8, 3, 'unidad'),
    ('Software', 'Suscripción Microsoft 365', 'Suscripcion Microsoft 365 para correo y productividad', 'SKU-SOF-M365-035', '/images/products/suscripcion-microsoft-365.jpg', 90.00, 149.00, 12, 4, 'unidad')
),
prepared_products AS (
  SELECT
    ('pos-product-' || lower(ps."sku")) AS "id",
    ps."name",
    ps."description",
    ps."sku",
    ps."imageUrl",
    pc."id" AS "categoryId",
    ps."purchasePrice"::DECIMAL(12,2) AS "purchasePrice",
    ps."salePrice"::DECIMAL(12,2) AS "salePrice",
    ps."stock",
    ps."minStock",
    ps."unit"
  FROM product_seed ps
  INNER JOIN "ProductCategory" pc ON pc."name" = ps."categoryName"
)
INSERT INTO "Product" (
  "id",
  "name",
  "description",
  "sku",
  "barcode",
  "imageUrl",
  "categoryId",
  "purchasePrice",
  "salePrice",
  "stock",
  "minStock",
  "unit",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  "id",
  "name",
  "description",
  "sku",
  NULL,
  "imageUrl",
  "categoryId",
  "purchasePrice",
  "salePrice",
  "stock",
  "minStock",
  "unit",
  true,
  NOW(),
  NOW()
FROM prepared_products
ON CONFLICT ("sku") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "imageUrl" = EXCLUDED."imageUrl",
  "categoryId" = EXCLUDED."categoryId",
  "purchasePrice" = EXCLUDED."purchasePrice",
  "salePrice" = EXCLUDED."salePrice",
  "stock" = GREATEST("Product"."stock", EXCLUDED."stock"),
  "minStock" = EXCLUDED."minStock",
  "unit" = EXCLUDED."unit",
  "isActive" = true,
  "updatedAt" = NOW();
