/*
  Warnings:

  - Made the column `pastorGovernoMemberId` on table `Congregacao` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Congregacao" ALTER COLUMN "pastorGovernoMemberId" SET NOT NULL;
