-- CreateTable
CREATE TABLE "DiscipuladoDisciple" (
    "id" SERIAL NOT NULL,
    "discipuladoId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscipuladoDisciple_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscipuladoDisciple_discipuladoId_idx" ON "DiscipuladoDisciple"("discipuladoId");

-- CreateIndex
CREATE INDEX "DiscipuladoDisciple_memberId_idx" ON "DiscipuladoDisciple"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscipuladoDisciple_discipuladoId_memberId_key" ON "DiscipuladoDisciple"("discipuladoId", "memberId");

-- AddForeignKey
ALTER TABLE "DiscipuladoDisciple" ADD CONSTRAINT "DiscipuladoDisciple_discipuladoId_fkey" FOREIGN KEY ("discipuladoId") REFERENCES "Discipulado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscipuladoDisciple" ADD CONSTRAINT "DiscipuladoDisciple_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
