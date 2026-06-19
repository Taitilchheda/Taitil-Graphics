-- Performance indexes for hot read paths.
-- These match the @@index directives on the Product and Order models in
-- schema.prisma. Created as an explicit migration because the previous
-- commits added them to the schema without a corresponding migration file.

-- Product: catalogue listing + filter combinations
CREATE INDEX IF NOT EXISTS "Product_categoryId_subcategoryId_idx" ON "Product"("categoryId", "subcategoryId");
CREATE INDEX IF NOT EXISTS "Product_isRecommended_idx" ON "Product"("isRecommended");
CREATE INDEX IF NOT EXISTS "Product_isHotSeller_idx" ON "Product"("isHotSeller");
CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product"("createdAt");

-- Order: per-user history, ops dashboard filters
CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_paymentStatus_createdAt_idx" ON "Order"("paymentStatus", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order"("status", "createdAt");