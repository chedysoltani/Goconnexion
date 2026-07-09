-- AlterEnum: add SALON, CONFERENCE, HACKATHON to EventCategory
ALTER TYPE "EventCategory" ADD VALUE 'SALON';
ALTER TYPE "EventCategory" ADD VALUE 'CONFERENCE';
ALTER TYPE "EventCategory" ADD VALUE 'HACKATHON';

-- CreateEnum: BoothStatus
CREATE TYPE "BoothStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'OCCUPIED');

-- CreateEnum: BoothType
CREATE TYPE "BoothType" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'CORNER', 'VIP');

-- AlterTable: Event — add salon fields
ALTER TABLE "Event"
  ADD COLUMN "address"   TEXT,
  ADD COLUMN "latitude"  DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "currency"  TEXT NOT NULL DEFAULT 'CAD';

-- AlterTable: EventRegistration — add payment + booth + ticket + updatedAt
ALTER TABLE "EventRegistration"
  ADD COLUMN "ticketTypeId"    TEXT,
  ADD COLUMN "boothId"         TEXT,
  ADD COLUMN "paymentId"       TEXT,
  ADD COLUMN "paymentProvider" "PaymentProvider",
  ADD COLUMN "paidAt"          TIMESTAMP(3),
  ADD COLUMN "checkedInAt"     TIMESTAMP(3),
  ADD COLUMN "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- UniqueConstraint: one booth per registration
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_boothId_key" UNIQUE ("boothId");

-- CreateTable: TicketType
CREATE TABLE "TicketType" (
    "id"          TEXT NOT NULL,
    "eventId"     TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "price"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency"    TEXT NOT NULL DEFAULT 'CAD',
    "capacity"    INTEGER,
    "description" TEXT,
    "color"       TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Booth
CREATE TABLE "Booth" (
    "id"              TEXT NOT NULL,
    "eventId"         TEXT NOT NULL,
    "number"          TEXT NOT NULL,
    "type"            "BoothType" NOT NULL,
    "price"           DOUBLE PRECISION NOT NULL,
    "currency"        TEXT NOT NULL DEFAULT 'CAD',
    "surface"         DOUBLE PRECISION,
    "description"     TEXT,
    "status"          "BoothStatus" NOT NULL DEFAULT 'AVAILABLE',
    "reservedById"    TEXT,
    "paymentId"       TEXT,
    "paymentProvider" "PaymentProvider",
    "paidAt"          TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "Booth_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: TicketType → Event
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Booth → Event
ALTER TABLE "Booth" ADD CONSTRAINT "Booth_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Booth → User (reservedBy)
ALTER TABLE "Booth" ADD CONSTRAINT "Booth_reservedById_fkey"
  FOREIGN KEY ("reservedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: EventRegistration → TicketType
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_ticketTypeId_fkey"
  FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: EventRegistration → Booth
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_boothId_fkey"
  FOREIGN KEY ("boothId") REFERENCES "Booth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
