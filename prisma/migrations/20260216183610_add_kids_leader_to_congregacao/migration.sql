-- AlterTable
ALTER TABLE "Congregacao" ADD COLUMN     "kidsLeaderMemberId" INTEGER;

-- CreateIndex
CREATE INDEX "Congregacao_kidsLeaderMemberId_idx" ON "Congregacao"("kidsLeaderMemberId");

-- AddForeignKey
ALTER TABLE "Congregacao" ADD CONSTRAINT "Congregacao_kidsLeaderMemberId_fkey" FOREIGN KEY ("kidsLeaderMemberId") REFERENCES "Member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
