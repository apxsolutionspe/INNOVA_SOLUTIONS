-- CreateEnum
CREATE TYPE "QuickServiceSaleStatus" AS ENUM ('COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "CashMovement" ADD COLUMN "relatedQuickServiceSaleId" TEXT;

-- CreateTable
CREATE TABLE "QuickServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QuickServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickService" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "costPrice" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QuickService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickServiceSale" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT,
    "userId" TEXT NOT NULL,
    "cashSessionId" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentReference" TEXT,
    "status" "QuickServiceSaleStatus" NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QuickServiceSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickServiceSaleItem" (
    "id" TEXT NOT NULL,
    "quickServiceSaleId" TEXT NOT NULL,
    "quickServiceId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuickServiceSaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuickServiceCategory_name_key" ON "QuickServiceCategory"("name");
CREATE INDEX "QuickService_categoryId_idx" ON "QuickService"("categoryId");
CREATE INDEX "QuickService_name_idx" ON "QuickService"("name");
CREATE UNIQUE INDEX "QuickServiceSale_code_key" ON "QuickServiceSale"("code");
CREATE INDEX "QuickServiceSale_customerId_idx" ON "QuickServiceSale"("customerId");
CREATE INDEX "QuickServiceSale_userId_idx" ON "QuickServiceSale"("userId");
CREATE INDEX "QuickServiceSale_cashSessionId_idx" ON "QuickServiceSale"("cashSessionId");
CREATE INDEX "QuickServiceSale_status_idx" ON "QuickServiceSale"("status");
CREATE INDEX "QuickServiceSale_createdAt_idx" ON "QuickServiceSale"("createdAt");
CREATE INDEX "QuickServiceSaleItem_quickServiceSaleId_idx" ON "QuickServiceSaleItem"("quickServiceSaleId");
CREATE INDEX "QuickServiceSaleItem_quickServiceId_idx" ON "QuickServiceSaleItem"("quickServiceId");
CREATE INDEX "CashMovement_relatedQuickServiceSaleId_idx" ON "CashMovement"("relatedQuickServiceSaleId");

-- AddForeignKey
ALTER TABLE "QuickService" ADD CONSTRAINT "QuickService_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "QuickServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuickServiceSale" ADD CONSTRAINT "QuickServiceSale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QuickServiceSale" ADD CONSTRAINT "QuickServiceSale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuickServiceSale" ADD CONSTRAINT "QuickServiceSale_cashSessionId_fkey" FOREIGN KEY ("cashSessionId") REFERENCES "CashSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuickServiceSaleItem" ADD CONSTRAINT "QuickServiceSaleItem_quickServiceSaleId_fkey" FOREIGN KEY ("quickServiceSaleId") REFERENCES "QuickServiceSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuickServiceSaleItem" ADD CONSTRAINT "QuickServiceSaleItem_quickServiceId_fkey" FOREIGN KEY ("quickServiceId") REFERENCES "QuickService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_relatedQuickServiceSaleId_fkey" FOREIGN KEY ("relatedQuickServiceSaleId") REFERENCES "QuickServiceSale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
