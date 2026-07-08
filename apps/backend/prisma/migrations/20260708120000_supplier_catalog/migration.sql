ALTER TABLE "Supplier"
ADD COLUMN "whatsapp" TEXT,
ADD COLUMN "department" TEXT,
ADD COLUMN "province" TEXT,
ADD COLUMN "district" TEXT,
ADD COLUMN "reference" TEXT,
ADD COLUMN "contactRole" TEXT,
ADD COLUMN "sunatStatus" TEXT,
ADD COLUMN "sunatCondition" TEXT;

CREATE TABLE "SupplierProduct" (
  "id" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "productId" TEXT,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "unit" TEXT,
  "referencePrice" DECIMAL(12, 2),
  "deliveryTime" TEXT,
  "notes" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SupplierProduct_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SupplierProduct_supplierId_idx" ON "SupplierProduct"("supplierId");
CREATE INDEX "SupplierProduct_productId_idx" ON "SupplierProduct"("productId");
CREATE INDEX "SupplierProduct_name_idx" ON "SupplierProduct"("name");
CREATE INDEX "SupplierProduct_category_idx" ON "SupplierProduct"("category");

ALTER TABLE "SupplierProduct"
ADD CONSTRAINT "SupplierProduct_supplierId_fkey"
FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SupplierProduct"
ADD CONSTRAINT "SupplierProduct_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
