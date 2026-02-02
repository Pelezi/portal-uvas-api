-- CreateTable
CREATE TABLE "CelulaLeaderInTraining" (
    "id" SERIAL NOT NULL,
    "celulaId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CelulaLeaderInTraining_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CelulaLeaderInTraining_celulaId_idx" ON "CelulaLeaderInTraining"("celulaId");

-- CreateIndex
CREATE INDEX "CelulaLeaderInTraining_memberId_idx" ON "CelulaLeaderInTraining"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "CelulaLeaderInTraining_celulaId_memberId_key" ON "CelulaLeaderInTraining"("celulaId", "memberId");

-- AddForeignKey
ALTER TABLE "CelulaLeaderInTraining" ADD CONSTRAINT "CelulaLeaderInTraining_celulaId_fkey" FOREIGN KEY ("celulaId") REFERENCES "Celula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CelulaLeaderInTraining" ADD CONSTRAINT "CelulaLeaderInTraining_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
