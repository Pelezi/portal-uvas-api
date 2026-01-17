/*
  Warnings:

  - You are about to drop the column `leaderUserId` on the `Celula` table. All the data in the column will be lost.
  - You are about to drop the column `viceLeaderUserId` on the `Celula` table. All the data in the column will be lost.
  - You are about to drop the column `discipuladorUserId` on the `Discipulado` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `pastorUserId` on the `Rede` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `Member` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Celula" DROP CONSTRAINT "Celula_leaderUserId_fkey";

-- DropForeignKey
ALTER TABLE "Celula" DROP CONSTRAINT "Celula_viceLeaderUserId_fkey";

-- DropForeignKey
ALTER TABLE "Discipulado" DROP CONSTRAINT "Discipulado_discipuladorUserId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_userId_fkey";

-- DropForeignKey
ALTER TABLE "Rede" DROP CONSTRAINT "Rede_pastorUserId_fkey";

-- DropIndex
DROP INDEX "Celula_leaderUserId_idx";

-- DropIndex
DROP INDEX "Celula_viceLeaderUserId_idx";

-- DropIndex
DROP INDEX "Discipulado_discipuladorUserId_idx";

-- AlterTable
ALTER TABLE "Celula" DROP COLUMN "leaderUserId",
DROP COLUMN "viceLeaderUserId",
ADD COLUMN     "leaderMemberId" INTEGER,
ADD COLUMN     "viceLeaderMemberId" INTEGER;

-- AlterTable
ALTER TABLE "Discipulado" DROP COLUMN "discipuladorUserId",
ADD COLUMN     "discipuladorMemberId" INTEGER;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "userId",
ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firstAccess" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "role" "ChurchRoles" NOT NULL DEFAULT 'MEMBER',
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "Rede" DROP COLUMN "pastorUserId",
ADD COLUMN     "pastorMemberId" INTEGER;

-- DropTable
DROP TABLE "User";

-- CreateIndex
CREATE INDEX "Celula_leaderMemberId_idx" ON "Celula"("leaderMemberId");

-- CreateIndex
CREATE INDEX "Celula_viceLeaderMemberId_idx" ON "Celula"("viceLeaderMemberId");

-- CreateIndex
CREATE INDEX "Discipulado_discipuladorMemberId_idx" ON "Discipulado"("discipuladorMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- AddForeignKey
ALTER TABLE "Celula" ADD CONSTRAINT "Celula_leaderMemberId_fkey" FOREIGN KEY ("leaderMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Celula" ADD CONSTRAINT "Celula_viceLeaderMemberId_fkey" FOREIGN KEY ("viceLeaderMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rede" ADD CONSTRAINT "Rede_pastorMemberId_fkey" FOREIGN KEY ("pastorMemberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipulado" ADD CONSTRAINT "Discipulado_discipuladorMemberId_fkey" FOREIGN KEY ("discipuladorMemberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
