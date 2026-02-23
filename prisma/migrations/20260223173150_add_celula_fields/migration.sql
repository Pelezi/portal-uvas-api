-- CreateEnum
CREATE TYPE "CelulaType" AS ENUM ('YOUNG', 'ADULT', 'TEENAGER', 'CHILDISH');

-- CreateEnum
CREATE TYPE "CelulaLevel" AS ENUM ('EVANGELISM', 'EDIFICATION', 'COMMUNION', 'MULTIPLICATION', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Celula" ADD COLUMN     "hasNextHost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hostMemberId" INTEGER,
ADD COLUMN     "level" "CelulaLevel",
ADD COLUMN     "multiplicationDate" TIMESTAMP(3),
ADD COLUMN     "openingDate" TIMESTAMP(3),
ADD COLUMN     "type" "CelulaType";

-- CreateIndex
CREATE INDEX "Celula_hostMemberId_idx" ON "Celula"("hostMemberId");

-- AddForeignKey
ALTER TABLE "Celula" ADD CONSTRAINT "Celula_hostMemberId_fkey" FOREIGN KEY ("hostMemberId") REFERENCES "Member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
