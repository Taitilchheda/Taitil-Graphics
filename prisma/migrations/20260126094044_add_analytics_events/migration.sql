-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('CLICK', 'VIEW', 'INQUIRY', 'CART', 'SALE', 'INVENTORY', 'PRODUCT_ADDED');

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "productId" TEXT,
    "categoryId" TEXT,
    "subcategoryId" TEXT,
    "label" TEXT,
    "quantity" INTEGER,
    "value" INTEGER,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_productId_idx" ON "AnalyticsEvent"("productId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type");
