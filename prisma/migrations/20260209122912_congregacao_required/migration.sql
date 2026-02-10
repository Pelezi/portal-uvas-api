/*
  Warnings:

  - Made the column `congregacaoId` on table `Rede` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Rede" ALTER COLUMN "congregacaoId" SET NOT NULL;
