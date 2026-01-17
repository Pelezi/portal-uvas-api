/*
  Warnings:

  - You are about to drop the column `winnerRail` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "winnerRail",
ADD COLUMN     "winnerPathId" INTEGER;

-- CreateTable
CREATE TABLE "WinnerPath" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WinnerPath_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WinnerPath_name_key" ON "WinnerPath"("name");

-- CreateIndex
CREATE INDEX "Member_winnerPathId_idx" ON "Member"("winnerPathId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_winnerPathId_fkey" FOREIGN KEY ("winnerPathId") REFERENCES "WinnerPath"("id") ON DELETE SET NULL ON UPDATE CASCADE;
