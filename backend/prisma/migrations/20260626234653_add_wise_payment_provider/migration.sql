-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'WISE');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
ADD COLUMN     "pendingAmount" DOUBLE PRECISION,
ADD COLUMN     "pendingCurrency" TEXT,
ADD COLUMN     "wiseReference" TEXT;
