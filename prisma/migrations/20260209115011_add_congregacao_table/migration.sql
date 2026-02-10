-- AlterTable
ALTER TABLE "Rede" ADD COLUMN     "congregacaoId" INTEGER;

-- CreateTable
CREATE TABLE "Congregacao" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "matrixId" INTEGER NOT NULL,
    "pastorGovernoMemberId" INTEGER NOT NULL,
    "vicePresidenteMemberId" INTEGER,
    "isPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT DEFAULT 'Brasil',
    "zipCode" TEXT,
    "street" TEXT,
    "streetNumber" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "complement" TEXT,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Congregacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Congregacao_matrixId_idx" ON "Congregacao"("matrixId");

-- CreateIndex
CREATE INDEX "Congregacao_pastorGovernoMemberId_idx" ON "Congregacao"("pastorGovernoMemberId");

-- CreateIndex
CREATE INDEX "Congregacao_vicePresidenteMemberId_idx" ON "Congregacao"("vicePresidenteMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "Congregacao_name_matrixId_key" ON "Congregacao"("name", "matrixId");

-- CreateIndex
CREATE INDEX "Rede_congregacaoId_idx" ON "Rede"("congregacaoId");

-- AddForeignKey
ALTER TABLE "Congregacao" ADD CONSTRAINT "Congregacao_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "Matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Congregacao" ADD CONSTRAINT "Congregacao_pastorGovernoMemberId_fkey" FOREIGN KEY ("pastorGovernoMemberId") REFERENCES "Member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Congregacao" ADD CONSTRAINT "Congregacao_vicePresidenteMemberId_fkey" FOREIGN KEY ("vicePresidenteMemberId") REFERENCES "Member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rede" ADD CONSTRAINT "Rede_congregacaoId_fkey" FOREIGN KEY ("congregacaoId") REFERENCES "Congregacao"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
