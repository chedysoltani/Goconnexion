-- AlterTable: add password reset and email verification token fields to User
ALTER TABLE "User" ADD COLUMN "emailVerificationToken"   TEXT;
ALTER TABLE "User" ADD COLUMN "emailVerificationExpires" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "passwordResetToken"       TEXT;
ALTER TABLE "User" ADD COLUMN "passwordResetExpires"     TIMESTAMP(3);
