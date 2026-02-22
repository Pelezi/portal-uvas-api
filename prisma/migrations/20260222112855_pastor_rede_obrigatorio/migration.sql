/*
  Warnings:

  - Made the column `pastorMemberId` on table `Rede` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Rede" ALTER COLUMN "pastorMemberId" SET NOT NULL;
