-- DropForeignKey
ALTER TABLE "Celula" DROP CONSTRAINT "Celula_discipuladoId_fkey";

-- AlterTable
ALTER TABLE "Celula" ALTER COLUMN "discipuladoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Celula" ADD CONSTRAINT "Celula_discipuladoId_fkey" FOREIGN KEY ("discipuladoId") REFERENCES "Discipulado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
