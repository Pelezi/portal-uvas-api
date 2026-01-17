/*
  Warnings:

  - A unique constraint covering the columns `[spouseId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "baptismDate" TIMESTAMP(3),
ADD COLUMN     "spouseId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Member_spouseId_key" ON "Member"("spouseId");

-- CreateIndex
CREATE INDEX "Member_spouseId_idx" ON "Member"("spouseId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_spouseId_fkey" FOREIGN KEY ("spouseId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
