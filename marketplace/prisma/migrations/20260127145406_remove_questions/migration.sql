/*
  Warnings:

  - You are about to drop the `ProductQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductQuestion" DROP CONSTRAINT "ProductQuestion_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductQuestion" DROP CONSTRAINT "ProductQuestion_userId_fkey";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "response" TEXT;

-- DropTable
DROP TABLE "ProductQuestion";
