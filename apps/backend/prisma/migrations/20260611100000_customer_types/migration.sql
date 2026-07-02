-- Soporte para personas naturales y empresas sin romper clientes existentes.
CREATE TYPE "CustomerType" AS ENUM ('NATURAL', 'COMPANY');

ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PASSPORT';

ALTER TABLE "Customer"
  ADD COLUMN "customerType" "CustomerType" NOT NULL DEFAULT 'NATURAL',
  ADD COLUMN "firstName" TEXT,
  ADD COLUMN "lastName" TEXT,
  ADD COLUMN "businessName" TEXT,
  ADD COLUMN "tradeName" TEXT,
  ADD COLUMN "legalRepresentative" TEXT,
  ADD COLUMN "businessLine" TEXT;

CREATE INDEX "Customer_customerType_idx" ON "Customer"("customerType");
