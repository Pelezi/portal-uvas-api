/*
  Warnings:

  - You are about to drop the column `firstAccess` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `supportFunctions` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "firstAccess",
DROP COLUMN "supportFunctions";
