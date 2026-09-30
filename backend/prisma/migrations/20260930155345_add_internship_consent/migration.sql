/*
  Warnings:

  - Added the required column `consentAt` to the `InternshipApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InternshipApplication" ADD COLUMN     "consentAt" TIMESTAMP(3) NOT NULL;
