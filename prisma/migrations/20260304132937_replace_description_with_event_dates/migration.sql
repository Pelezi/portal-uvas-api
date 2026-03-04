/*
  Warnings:

  - You are about to drop the column `description` on the `announcement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "announcement" DROP COLUMN "description",
ADD COLUMN     "event_date" TIMESTAMP(3),
ADD COLUMN     "event_end_date" TIMESTAMP(3);
