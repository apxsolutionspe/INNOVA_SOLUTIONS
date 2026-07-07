ALTER TABLE "ServiceOrder"
ADD COLUMN "color" TEXT,
ADD COLUMN "physicalCondition" TEXT,
ADD COLUMN "accessoriesReceived" TEXT,
ADD COLUMN "initialDiagnosis" TEXT,
ADD COLUMN "receptionNotes" TEXT;

CREATE TABLE "ServiceOrderPhoto" (
  "id" TEXT NOT NULL,
  "serviceOrderId" TEXT NOT NULL,
  "imageData" TEXT NOT NULL,
  "fileName" TEXT,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ServiceOrderPhoto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ServiceOrderPhoto_serviceOrderId_idx" ON "ServiceOrderPhoto"("serviceOrderId");

ALTER TABLE "ServiceOrderPhoto"
ADD CONSTRAINT "ServiceOrderPhoto_serviceOrderId_fkey"
FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
