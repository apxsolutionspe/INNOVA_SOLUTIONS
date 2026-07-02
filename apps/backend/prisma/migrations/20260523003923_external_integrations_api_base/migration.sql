-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('SUNAT', 'WHATSAPP', 'CULQI', 'IZIPAY', 'AI', 'ECOMMERCE');

-- CreateEnum
CREATE TYPE "IntegrationMode" AS ENUM ('MOCK', 'SANDBOX', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('NOT_CONFIGURED', 'CONFIGURED', 'CONNECTED', 'ERROR', 'MOCK');

-- CreateEnum
CREATE TYPE "SunatDocumentType" AS ENUM ('BOLETA', 'FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO');

-- CreateEnum
CREATE TYPE "SunatDocumentStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'ERROR', 'MOCK');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('CULQI', 'IZIPAY', 'MOCK');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('CREATED', 'PENDING', 'PAID', 'FAILED', 'CANCELLED', 'MOCK');

-- CreateTable
CREATE TABLE "IntegrationSetting" (
    "id" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "mode" "IntegrationMode" NOT NULL DEFAULT 'MOCK',
    "status" "IntegrationStatus" NOT NULL DEFAULT 'MOCK',
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "publicConfig" JSONB,
    "lastTestAt" TIMESTAMP(3),
    "lastTestStatus" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SunatDocument" (
    "id" TEXT NOT NULL,
    "saleId" TEXT,
    "serviceOrderId" TEXT,
    "documentType" "SunatDocumentType" NOT NULL,
    "series" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "customerDocumentType" TEXT NOT NULL,
    "customerDocumentNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxTotal" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "status" "SunatDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "sunatTicket" TEXT,
    "sunatResponseCode" TEXT,
    "sunatResponseMessage" TEXT,
    "xmlPath" TEXT,
    "pdfPath" TEXT,
    "cdrPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SunatDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappMessageLog" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "templateName" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "errorMessage" TEXT,
    "relatedModule" TEXT,
    "relatedId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsappMessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "relatedSaleId" TEXT,
    "relatedServiceOrderId" TEXT,
    "relatedQuickServiceSaleId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'CREATED',
    "paymentLink" TEXT,
    "providerTransactionId" TEXT,
    "providerResponse" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationSetting_provider_key" ON "IntegrationSetting"("provider");

-- CreateIndex
CREATE INDEX "SunatDocument_saleId_idx" ON "SunatDocument"("saleId");

-- CreateIndex
CREATE INDEX "SunatDocument_serviceOrderId_idx" ON "SunatDocument"("serviceOrderId");

-- CreateIndex
CREATE INDEX "SunatDocument_status_idx" ON "SunatDocument"("status");

-- CreateIndex
CREATE INDEX "SunatDocument_createdAt_idx" ON "SunatDocument"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SunatDocument_documentType_series_number_key" ON "SunatDocument"("documentType", "series", "number");

-- CreateIndex
CREATE INDEX "WhatsappMessageLog_phone_idx" ON "WhatsappMessageLog"("phone");

-- CreateIndex
CREATE INDEX "WhatsappMessageLog_status_idx" ON "WhatsappMessageLog"("status");

-- CreateIndex
CREATE INDEX "WhatsappMessageLog_relatedModule_idx" ON "WhatsappMessageLog"("relatedModule");

-- CreateIndex
CREATE INDEX "WhatsappMessageLog_userId_idx" ON "WhatsappMessageLog"("userId");

-- CreateIndex
CREATE INDEX "WhatsappMessageLog_createdAt_idx" ON "WhatsappMessageLog"("createdAt");

-- CreateIndex
CREATE INDEX "PaymentTransaction_provider_idx" ON "PaymentTransaction"("provider");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_relatedSaleId_idx" ON "PaymentTransaction"("relatedSaleId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_relatedServiceOrderId_idx" ON "PaymentTransaction"("relatedServiceOrderId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_relatedQuickServiceSaleId_idx" ON "PaymentTransaction"("relatedQuickServiceSaleId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_createdAt_idx" ON "PaymentTransaction"("createdAt");

-- AddForeignKey
ALTER TABLE "SunatDocument" ADD CONSTRAINT "SunatDocument_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SunatDocument" ADD CONSTRAINT "SunatDocument_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappMessageLog" ADD CONSTRAINT "WhatsappMessageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_relatedSaleId_fkey" FOREIGN KEY ("relatedSaleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_relatedServiceOrderId_fkey" FOREIGN KEY ("relatedServiceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_relatedQuickServiceSaleId_fkey" FOREIGN KEY ("relatedQuickServiceSaleId") REFERENCES "QuickServiceSale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
