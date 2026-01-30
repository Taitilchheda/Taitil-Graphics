-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "isBusiness" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "isBusiness" BOOLEAN NOT NULL DEFAULT false;
