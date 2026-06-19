/*
  Warnings:

  - Added the required column `updatedAt` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "address" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT;
