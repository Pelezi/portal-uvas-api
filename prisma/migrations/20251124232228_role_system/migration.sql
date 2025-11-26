/*
  Warnings:

  - You are about to drop the column `networkId` on the `Discipulado` table. All the data in the column will be lost.
  - You are about to drop the column `cellId` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `cellId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Cell` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Network` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PermissionCell` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PermissionDiscipulado` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PermissionNetwork` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `discipuladorUserId` to the `Discipulado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `redeId` to the `Discipulado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `celulaId` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `celulaId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChurchRoles" AS ENUM ('PASTOR', 'DISCIPULADOR', 'LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'COHABITATING', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- DropForeignKey
ALTER TABLE "Cell" DROP CONSTRAINT "Cell_discipuladoId_fkey";

-- DropForeignKey
ALTER TABLE "Cell" DROP CONSTRAINT "Cell_leaderUserId_fkey";

-- DropForeignKey
ALTER TABLE "Discipulado" DROP CONSTRAINT "Discipulado_networkId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_cellId_fkey";

-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_userId_fkey";

-- DropForeignKey
ALTER TABLE "PermissionCell" DROP CONSTRAINT "PermissionCell_cellId_fkey";

-- DropForeignKey
ALTER TABLE "PermissionCell" DROP CONSTRAINT "PermissionCell_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "PermissionDiscipulado" DROP CONSTRAINT "PermissionDiscipulado_discipuladoId_fkey";

-- DropForeignKey
ALTER TABLE "PermissionDiscipulado" DROP CONSTRAINT "PermissionDiscipulado_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "PermissionNetwork" DROP CONSTRAINT "PermissionNetwork_networkId_fkey";

-- DropForeignKey
ALTER TABLE "PermissionNetwork" DROP CONSTRAINT "PermissionNetwork_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_cellId_fkey";

-- DropIndex
DROP INDEX "Member_cellId_idx";

-- DropIndex
DROP INDEX "Report_cellId_idx";

-- AlterTable
ALTER TABLE "Discipulado" DROP COLUMN "networkId",
ADD COLUMN     "discipuladorUserId" INTEGER NOT NULL,
ADD COLUMN     "redeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "cellId",
ADD COLUMN     "celulaId" INTEGER NOT NULL,
ADD COLUMN     "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'SINGLE',
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "cellId",
ADD COLUMN     "celulaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phoneNumber",
ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" "ChurchRoles" NOT NULL DEFAULT 'MEMBER';

-- DropTable
DROP TABLE "Cell";

-- DropTable
DROP TABLE "Network";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "PermissionCell";

-- DropTable
DROP TABLE "PermissionDiscipulado";

-- DropTable
DROP TABLE "PermissionNetwork";

-- CreateTable
CREATE TABLE "Celula" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "leaderUserId" INTEGER NOT NULL,
    "discipuladoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Celula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rede" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pastorUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rede_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Celula_name_key" ON "Celula"("name");

-- CreateIndex
CREATE INDEX "Celula_discipuladoId_idx" ON "Celula"("discipuladoId");

-- CreateIndex
CREATE INDEX "Celula_leaderUserId_idx" ON "Celula"("leaderUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Rede_name_key" ON "Rede"("name");

-- CreateIndex
CREATE INDEX "Discipulado_redeId_idx" ON "Discipulado"("redeId");

-- CreateIndex
CREATE INDEX "Discipulado_discipuladorUserId_idx" ON "Discipulado"("discipuladorUserId");

-- CreateIndex
CREATE INDEX "Member_celulaId_idx" ON "Member"("celulaId");

-- CreateIndex
CREATE INDEX "Report_celulaId_idx" ON "Report"("celulaId");

-- AddForeignKey
ALTER TABLE "Celula" ADD CONSTRAINT "Celula_discipuladoId_fkey" FOREIGN KEY ("discipuladoId") REFERENCES "Discipulado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Celula" ADD CONSTRAINT "Celula_leaderUserId_fkey" FOREIGN KEY ("leaderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_celulaId_fkey" FOREIGN KEY ("celulaId") REFERENCES "Celula"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rede" ADD CONSTRAINT "Rede_pastorUserId_fkey" FOREIGN KEY ("pastorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipulado" ADD CONSTRAINT "Discipulado_redeId_fkey" FOREIGN KEY ("redeId") REFERENCES "Rede"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipulado" ADD CONSTRAINT "Discipulado_discipuladorUserId_fkey" FOREIGN KEY ("discipuladorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_celulaId_fkey" FOREIGN KEY ("celulaId") REFERENCES "Celula"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
