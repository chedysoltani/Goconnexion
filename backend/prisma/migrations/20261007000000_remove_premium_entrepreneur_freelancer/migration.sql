-- Les plans PREMIUM_ENTREPRENEUR et PREMIUM_FREELANCER n'étaient pas vendus :
-- les comptes concernés passent sur PRO avant la suppression des valeurs.
UPDATE "User" SET "plan" = 'PRO' WHERE "plan" IN ('PREMIUM_ENTREPRENEUR', 'PREMIUM_FREELANCER');
UPDATE "Subscription" SET "plan" = 'PRO' WHERE "plan" IN ('PREMIUM_ENTREPRENEUR', 'PREMIUM_FREELANCER');
UPDATE "Subscription" SET "pendingPlan" = 'PRO' WHERE "pendingPlan" IN ('PREMIUM_ENTREPRENEUR', 'PREMIUM_FREELANCER');

-- AlterEnum
BEGIN;
CREATE TYPE "PlanType_new" AS ENUM ('FREE', 'PRO', 'BUSINESS', 'PREMIUM_INCUBATEUR');
ALTER TABLE "User" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "plan" TYPE "PlanType_new" USING ("plan"::text::"PlanType_new");
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "PlanType_new" USING ("plan"::text::"PlanType_new");
ALTER TABLE "Subscription" ALTER COLUMN "pendingPlan" TYPE "PlanType_new" USING ("pendingPlan"::text::"PlanType_new");
ALTER TYPE "PlanType" RENAME TO "PlanType_old";
ALTER TYPE "PlanType_new" RENAME TO "PlanType";
DROP TYPE "PlanType_old";
ALTER TABLE "User" ALTER COLUMN "plan" SET DEFAULT 'FREE';
ALTER TABLE "Subscription" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;
