-- CreateEnum
CREATE TYPE "FollowUpReason" AS ENUM ('INACTIVITY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastStreakDate" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AgentFollowUp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" "FollowUpReason" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentFollowUp_userId_reason_idx" ON "AgentFollowUp"("userId", "reason");

-- AddForeignKey
ALTER TABLE "AgentFollowUp" ADD CONSTRAINT "AgentFollowUp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
