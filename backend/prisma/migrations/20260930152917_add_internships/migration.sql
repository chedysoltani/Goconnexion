-- CreateEnum
CREATE TYPE "InternshipOfferStatus" AS ENUM ('PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InternshipApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InternshipMode" AS ENUM ('ON_SITE', 'REMOTE', 'HYBRID');

-- CreateTable
CREATE TABLE "InternshipOffer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "location" TEXT,
    "mode" "InternshipMode" NOT NULL DEFAULT 'ON_SITE',
    "durationMonths" INTEGER,
    "startDate" TIMESTAMP(3),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "skills" TEXT[],
    "status" "InternshipOfferStatus" NOT NULL DEFAULT 'PUBLISHED',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternshipOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternshipApplication" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "message" TEXT,
    "cvUrl" TEXT NOT NULL,
    "status" "InternshipApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternshipApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InternshipOffer_status_createdAt_idx" ON "InternshipOffer"("status", "createdAt");

-- CreateIndex
CREATE INDEX "InternshipOffer_domain_idx" ON "InternshipOffer"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "InternshipApplication_offerId_applicantId_key" ON "InternshipApplication"("offerId", "applicantId");

-- AddForeignKey
ALTER TABLE "InternshipOffer" ADD CONSTRAINT "InternshipOffer_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipApplication" ADD CONSTRAINT "InternshipApplication_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "InternshipOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipApplication" ADD CONSTRAINT "InternshipApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
