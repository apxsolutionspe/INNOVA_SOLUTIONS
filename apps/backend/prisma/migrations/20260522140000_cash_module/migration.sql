-- CreateEnum
CREATE TYPE "CashSessionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "CashMovementType" AS ENUM ('INCOME', 'EXPENSE', 'SALE', 'SERVICE_PAYMENT', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "CashSession" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "openingAmount" DECIMAL(12,2) NOT NULL,
    "expectedCashAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "realCashAmount" DECIMAL(12,2),
    "difference" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalExpenses" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalYape" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalPlin" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalTransfer" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "CashSessionStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashMovement" (
    "id" TEXT NOT NULL,
    "cashSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CashMovementType" NOT NULL,
    "concept" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "relatedSaleId" TEXT,
    "relatedServiceOrderId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CashSession_code_key" ON "CashSession"("code");
CREATE INDEX "CashSession_userId_idx" ON "CashSession"("userId");
CREATE INDEX "CashSession_status_idx" ON "CashSession"("status");
CREATE INDEX "CashSession_openedAt_idx" ON "CashSession"("openedAt");
CREATE INDEX "CashMovement_cashSessionId_idx" ON "CashMovement"("cashSessionId");
CREATE INDEX "CashMovement_userId_idx" ON "CashMovement"("userId");
CREATE INDEX "CashMovement_type_idx" ON "CashMovement"("type");
CREATE INDEX "CashMovement_paymentMethod_idx" ON "CashMovement"("paymentMethod");
CREATE INDEX "CashMovement_relatedSaleId_idx" ON "CashMovement"("relatedSaleId");
CREATE INDEX "CashMovement_relatedServiceOrderId_idx" ON "CashMovement"("relatedServiceOrderId");

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_cashSessionId_fkey" FOREIGN KEY ("cashSessionId") REFERENCES "CashSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_relatedSaleId_fkey" FOREIGN KEY ("relatedSaleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_relatedServiceOrderId_fkey" FOREIGN KEY ("relatedServiceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
