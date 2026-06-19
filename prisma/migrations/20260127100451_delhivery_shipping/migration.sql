-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'SERVICE');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "labelUrl" TEXT,
ADD COLUMN     "pickupRequestId" TEXT,
ADD COLUMN     "shipmentCreatedAt" TIMESTAMP(3),
ADD COLUMN     "shipmentUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "shippingError" TEXT,
ADD COLUMN     "shippingProvider" TEXT,
ADD COLUMN     "shippingStatus" TEXT,
ADD COLUMN     "trackingHistory" JSONB,
ADD COLUMN     "trackingId" TEXT,
ADD COLUMN     "trackingUrl" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "fragile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "heightCm" INTEGER,
ADD COLUMN     "hsnCode" TEXT,
ADD COLUMN     "lengthCm" INTEGER,
ADD COLUMN     "lowStockThreshold" INTEGER DEFAULT 5,
ADD COLUMN     "media" JSONB,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'PHYSICAL',
ADD COLUMN     "variants" JSONB,
ADD COLUMN     "weightGrams" INTEGER,
ADD COLUMN     "widthCm" INTEGER;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductQuestion" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "ProductQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "requirement" TEXT,
    "budgetRange" TEXT,
    "timeline" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAudit" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "toEmail" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "ProductQuestion_productId_idx" ON "ProductQuestion"("productId");

-- CreateIndex
CREATE INDEX "Lead_productId_idx" ON "Lead"("productId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductQuestion" ADD CONSTRAINT "ProductQuestion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductQuestion" ADD CONSTRAINT "ProductQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAudit" ADD CONSTRAINT "AdminAudit_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
