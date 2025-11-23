/*
  Warnings:

  - You are about to drop the column `leaderName` on the `Cell` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cell" DROP COLUMN "leaderName",
ADD COLUMN     "discipuladoId" INTEGER,
ADD COLUMN     "leaderUserId" INTEGER;

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "role" TEXT DEFAULT 'USER';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "locale",
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Network" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discipulado" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "networkId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discipulado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionNetwork" (
    "id" SERIAL NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "networkId" INTEGER NOT NULL,

    CONSTRAINT "PermissionNetwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionDiscipulado" (
    "id" SERIAL NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "discipuladoId" INTEGER NOT NULL,

    CONSTRAINT "PermissionDiscipulado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Network_name_key" ON "Network"("name");

-- CreateIndex
CREATE INDEX "PermissionNetwork_permissionId_idx" ON "PermissionNetwork"("permissionId");

-- CreateIndex
CREATE INDEX "PermissionNetwork_networkId_idx" ON "PermissionNetwork"("networkId");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionNetwork_permissionId_networkId_key" ON "PermissionNetwork"("permissionId", "networkId");

-- CreateIndex
CREATE INDEX "PermissionDiscipulado_permissionId_idx" ON "PermissionDiscipulado"("permissionId");

-- CreateIndex
CREATE INDEX "PermissionDiscipulado_discipuladoId_idx" ON "PermissionDiscipulado"("discipuladoId");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionDiscipulado_permissionId_discipuladoId_key" ON "PermissionDiscipulado"("permissionId", "discipuladoId");

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_discipuladoId_fkey" FOREIGN KEY ("discipuladoId") REFERENCES "Discipulado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipulado" ADD CONSTRAINT "Discipulado_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionNetwork" ADD CONSTRAINT "PermissionNetwork_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionNetwork" ADD CONSTRAINT "PermissionNetwork_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionDiscipulado" ADD CONSTRAINT "PermissionDiscipulado_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionDiscipulado" ADD CONSTRAINT "PermissionDiscipulado_discipuladoId_fkey" FOREIGN KEY ("discipuladoId") REFERENCES "Discipulado"("id") ON DELETE CASCADE ON UPDATE CASCADE;
