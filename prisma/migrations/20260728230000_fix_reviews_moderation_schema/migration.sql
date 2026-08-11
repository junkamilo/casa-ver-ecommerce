-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_userId_fkey";

-- DropIndex
DROP INDEX "reviews_userId_productId_key";

-- AlterTable
ALTER TABLE "coupons" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "guestName" TEXT,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "reviewToken" TEXT,
ADD COLUMN     "reviewTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "reviewTokenUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "comment" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_reviewToken_key" ON "reviews"("reviewToken");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_orderId_productId_key" ON "reviews"("orderId", "productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "webhook_logs_createdAt_idx" ON "webhook_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
