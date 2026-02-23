-- AlterTable
ALTER TABLE "Celula" ADD COLUMN     "parallelCelulaId" INTEGER;

-- CreateIndex
CREATE INDEX "Celula_parallelCelulaId_idx" ON "Celula"("parallelCelulaId");

-- AddForeignKey
ALTER TABLE "Celula" ADD CONSTRAINT "Celula_parallelCelulaId_fkey" FOREIGN KEY ("parallelCelulaId") REFERENCES "Celula"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
