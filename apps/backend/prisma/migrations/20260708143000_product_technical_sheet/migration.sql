ALTER TABLE "Product"
ADD COLUMN "brand" TEXT,
ADD COLUMN "model" TEXT,
ADD COLUMN "warranty" TEXT,
ADD COLUMN "recommendedUse" TEXT,
ADD COLUMN "salesNotes" TEXT,
ADD COLUMN "technicalSpecs" JSONB,
ADD COLUMN "technicalSpecsSearch" TEXT;

CREATE INDEX "Product_brand_idx" ON "Product"("brand");
CREATE INDEX "Product_model_idx" ON "Product"("model");
CREATE INDEX "Product_recommendedUse_idx" ON "Product"("recommendedUse");

UPDATE "Product" product
SET
  "warranty" = COALESCE(product."warranty", 'Consultar proveedor'),
  "salesNotes" = COALESCE(product."salesNotes", 'Ficha referencial. Validar especificaciones exactas con el proveedor antes de confirmar la venta.'),
  "recommendedUse" = COALESCE(
    product."recommendedUse",
    CASE
      WHEN category."name" ILIKE '%laptop%' THEN 'oficina, estudios y gestion empresarial'
      WHEN category."name" ILIKE '%comput%' THEN 'oficina, estudios y gestion empresarial'
      WHEN category."name" ILIKE '%perifer%' THEN 'uso diario, atencion al cliente y productividad'
      WHEN category."name" ILIKE '%componente%' THEN 'mantenimiento, mejora y reparacion de equipos'
      WHEN category."name" ILIKE '%impresi%' THEN 'hogar, oficina y negocio'
      WHEN category."name" ILIKE '%red%' THEN 'conectividad para hogar, oficina y negocio'
      WHEN category."name" ILIKE '%software%' THEN 'productividad, gestion documental y trabajo administrativo'
      ELSE 'uso general segun necesidad del cliente'
    END
  ),
  "technicalSpecs" = COALESCE(
    product."technicalSpecs",
    CASE
      WHEN category."name" ILIKE '%laptop%' OR category."name" ILIKE '%comput%' THEN jsonb_build_object(
        'Tipo', 'Equipo de computo',
        'Rendimiento', 'Uso diario',
        'Configuracion', 'Segun configuracion registrada',
        'Garantia', 'Consultar proveedor'
      )
      WHEN category."name" ILIKE '%componente%' THEN jsonb_build_object(
        'Tipo', 'Componente tecnologico',
        'Compatibilidad', 'Validar con el equipo del cliente',
        'Garantia', 'Consultar proveedor'
      )
      WHEN category."name" ILIKE '%perifer%' THEN jsonb_build_object(
        'Tipo', 'Periferico',
        'Uso recomendado', 'Productividad y atencion diaria',
        'Compatibilidad', 'Validar conexion disponible'
      )
      WHEN category."name" ILIKE '%impresi%' THEN jsonb_build_object(
        'Tipo', 'Producto de impresion',
        'Uso recomendado', 'Hogar, oficina y negocio',
        'Compatibilidad', 'Validar modelo compatible'
      )
      WHEN category."name" ILIKE '%red%' THEN jsonb_build_object(
        'Tipo', 'Producto de redes',
        'Uso recomendado', 'Conectividad local',
        'Compatibilidad', 'Validar requerimiento de red'
      )
      WHEN category."name" ILIKE '%software%' THEN jsonb_build_object(
        'Tipo', 'Software',
        'Uso recomendado', 'Productividad y gestion',
        'Licenciamiento', 'Validar condiciones con proveedor'
      )
      ELSE jsonb_build_object(
        'Tipo', 'Producto tecnologico',
        'Uso recomendado', 'Validar con el cliente',
        'Garantia', 'Consultar proveedor'
      )
    END
  )
FROM "ProductCategory" category
WHERE product."categoryId" = category."id"
  AND product."technicalSpecs" IS NULL;

UPDATE "Product"
SET "technicalSpecsSearch" = lower(
  concat_ws(
    ' ',
    "brand",
    "model",
    "warranty",
    "recommendedUse",
    "salesNotes",
    "technicalSpecs"::text
  )
)
WHERE "technicalSpecsSearch" IS NULL;
