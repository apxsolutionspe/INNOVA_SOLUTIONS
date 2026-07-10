ALTER TABLE "SupplierProduct"
ADD COLUMN IF NOT EXISTS "lastCost" DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS "leadTime" TEXT;

UPDATE "SupplierProduct"
SET
  "lastCost" = COALESCE("lastCost", "referencePrice"),
  "leadTime" = COALESCE("leadTime", "deliveryTime");

DELETE FROM "SupplierProduct" sp
USING "SupplierProduct" duplicate
WHERE sp."supplierId" = duplicate."supplierId"
  AND sp."productId" = duplicate."productId"
  AND sp."productId" IS NOT NULL
  AND sp."id" > duplicate."id";

CREATE UNIQUE INDEX IF NOT EXISTS "SupplierProduct_supplierId_productId_key"
ON "SupplierProduct"("supplierId", "productId");
