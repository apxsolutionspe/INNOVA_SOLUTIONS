-- Normaliza categorias historicas de inventario sin borrar productos ni alterar stock/precios.
-- Ejecutable en produccion: crea oficiales, reasigna productos y desactiva alias antiguos.
WITH official_categories("id", "name", "description") AS (
  VALUES
    ('pos-cat-accesorios', 'Accesorios', 'Accesorios tecnologicos para venta en POS'),
    ('pos-cat-componentes', 'Componentes', 'Componentes internos y repuestos'),
    ('pos-cat-impresion', 'Impresión', 'Insumos y productos para impresion'),
    ('pos-cat-laptops', 'Laptops', 'Equipos portatiles y computadoras'),
    ('pos-cat-perifericos', 'Periféricos', 'Perifericos y dispositivos externos'),
    ('pos-cat-redes', 'Redes', 'Equipos y accesorios de conectividad'),
    ('pos-cat-software', 'Software', 'Licencias, seguridad y suscripciones')
)
INSERT INTO "ProductCategory" ("id", "name", "description", "isActive", "createdAt", "updatedAt")
SELECT "id", "name", "description", true, NOW(), NOW()
FROM official_categories
ON CONFLICT ("name") DO UPDATE SET
  "description" = COALESCE("ProductCategory"."description", EXCLUDED."description"),
  "isActive" = true,
  "updatedAt" = NOW();

WITH category_map("sourceName", "targetName") AS (
  VALUES
    ('Impresion', 'Impresión'),
    ('Impresiones', 'Impresión'),
    ('Perifericos', 'Periféricos'),
    ('Computadoras', 'Laptops'),
    ('Repuestos', 'Componentes'),
    ('Seguridad', 'Software')
),
resolved AS (
  SELECT source."id" AS "sourceId", target."id" AS "targetId"
  FROM category_map
  INNER JOIN "ProductCategory" source ON source."name" = category_map."sourceName"
  INNER JOIN "ProductCategory" target ON target."name" = category_map."targetName"
)
UPDATE "Product"
SET "categoryId" = resolved."targetId", "updatedAt" = NOW()
FROM resolved
WHERE "Product"."categoryId" = resolved."sourceId";

WITH category_map("sourceName", "targetName") AS (
  VALUES
    ('Impresion', 'Impresión'),
    ('Impresiones', 'Impresión'),
    ('Perifericos', 'Periféricos'),
    ('Computadoras', 'Laptops'),
    ('Repuestos', 'Componentes'),
    ('Seguridad', 'Software')
)
UPDATE "ProductCategory"
SET "isActive" = false, "updatedAt" = NOW()
WHERE "name" IN (SELECT "sourceName" FROM category_map);
