-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ChurchRoles" ADD VALUE 'PRESIDENTPASTOR';
ALTER TYPE "ChurchRoles" ADD VALUE 'VICEPRESIDENTPASTOR';

-- AlterTable
ALTER TABLE "Celula" ADD COLUMN     "viceLeaderUserId" INTEGER;

-- CreateIndex
CREATE INDEX "Celula_viceLeaderUserId_idx" ON "Celula"("viceLeaderUserId");

-- AddForeignKey
ALTER TABLE "Celula" ADD CONSTRAINT "Celula_viceLeaderUserId_fkey" FOREIGN KEY ("viceLeaderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
