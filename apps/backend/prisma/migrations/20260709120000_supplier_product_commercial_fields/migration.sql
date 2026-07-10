ALTER TABLE "SupplierProduct"
ADD COLUMN "supplierSku" TEXT,
ADD COLUMN "minOrderQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "availability" TEXT,
ADD COLUMN "isPreferred" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "SupplierProduct_supplierSku_idx" ON "SupplierProduct"("supplierSku");
