-- CreateEnum
CREATE TYPE "AgentContentType" AS ENUM ('LINKEDIN_POST', 'FACEBOOK_POST', 'BLOG_ARTICLE');

-- CreateEnum
CREATE TYPE "AgentContentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "AgentChatSenderRole" AS ENUM ('VISITOR', 'AGENT');

-- CreateEnum
CREATE TYPE "AgentChatSessionStatus" AS ENUM ('ACTIVE', 'ENDED', 'CONVERTED');

-- CreateTable
CREATE TABLE "AgentContent" (
    "id" TEXT NOT NULL,
    "type" "AgentContentType" NOT NULL,
    "status" "AgentContentStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT,
    "body" TEXT NOT NULL,
    "targetAudience" TEXT,
    "prompt" TEXT,
    "model" TEXT NOT NULL,
    "reviewedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentChatSession" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "convertedUserId" TEXT,
    "sourceUrl" TEXT,
    "utmSource" TEXT,
    "utmCampaign" TEXT,
    "status" "AgentChatSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "AgentChatSenderRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentChatSession_visitorId_idx" ON "AgentChatSession"("visitorId");

-- CreateIndex
CREATE INDEX "AgentChatMessage_sessionId_idx" ON "AgentChatMessage"("sessionId");

-- AddForeignKey
ALTER TABLE "AgentContent" ADD CONSTRAINT "AgentContent_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentChatMessage" ADD CONSTRAINT "AgentChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AgentChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
