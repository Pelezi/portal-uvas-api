/*
  Warnings:

  - You are about to drop the column `ageRange` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `joinDate` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `winnerTrack` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "ageRange",
DROP COLUMN "joinDate",
DROP COLUMN "winnerTrack",
ADD COLUMN     "ministryPositionId" INTEGER,
ADD COLUMN     "registerDate" TIMESTAMP(3),
ADD COLUMN     "roleId" INTEGER,
ADD COLUMN     "winnerRail" TEXT;

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ministry" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ministry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ministry_name_key" ON "Ministry"("name");

-- CreateIndex
CREATE INDEX "Member_roleId_idx" ON "Member"("roleId");

-- CreateIndex
CREATE INDEX "Member_ministryPositionId_idx" ON "Member"("ministryPositionId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_ministryPositionId_fkey" FOREIGN KEY ("ministryPositionId") REFERENCES "Ministry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
