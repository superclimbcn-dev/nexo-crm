CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "AppointmentServiceType" AS ENUM ('SOFA_RUG_CLEANING', 'WATERPROOFING', 'CAR_UPHOLSTERY', 'COMMUNITY_CLEANING', 'OTHER');

CREATE TABLE "Appointment" (
  "id" TEXT NOT NULL,
  "contactId" TEXT,
  "dealId" TEXT,
  "title" TEXT NOT NULL,
  "serviceType" "AppointmentServiceType" NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 120,
  "address" TEXT,
  "municipality" TEXT,
  "notes" TEXT,
  "value" DECIMAL(10,2),
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
  "assignedToId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Appointment_scheduledAt_idx" ON "Appointment"("scheduledAt");
CREATE INDEX "Appointment_status_scheduledAt_idx" ON "Appointment"("status", "scheduledAt");
CREATE INDEX "Appointment_contactId_idx" ON "Appointment"("contactId");
CREATE INDEX "Appointment_dealId_idx" ON "Appointment"("dealId");

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
