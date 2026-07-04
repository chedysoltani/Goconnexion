-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "pendingInterval" TEXT,
ADD COLUMN     "pendingPlan" "PlanType";
