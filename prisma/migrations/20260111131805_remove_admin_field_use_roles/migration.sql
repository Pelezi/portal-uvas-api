/*
  Warnings:

  - You are about to drop the column `admin` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "admin",
ALTER COLUMN "email" DROP NOT NULL;

-- DropEnum
DROP TYPE "ChurchRoles";
