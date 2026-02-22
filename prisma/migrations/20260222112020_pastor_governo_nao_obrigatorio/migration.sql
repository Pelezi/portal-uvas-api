/*
  Warnings:

  - You are about to drop the column `viceLeaderMemberId` on the `Celula` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Celula" DROP CONSTRAINT "Celula_viceLeaderMemberId_fkey";

-- DropIndex
DROP INDEX "Celula_viceLeaderMemberId_idx";

-- AlterTable
ALTER TABLE "Celula" DROP COLUMN "viceLeaderMemberId";

-- AlterTable
ALTER TABLE "Congregacao" ALTER COLUMN "pastorGovernoMemberId" DROP NOT NULL;
