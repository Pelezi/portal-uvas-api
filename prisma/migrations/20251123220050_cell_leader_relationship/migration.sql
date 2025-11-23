-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_leaderUserId_fkey" FOREIGN KEY ("leaderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
