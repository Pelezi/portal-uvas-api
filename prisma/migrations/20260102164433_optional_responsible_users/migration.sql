-- AlterTable
ALTER TABLE "Celula" ALTER COLUMN "leaderUserId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Discipulado" ALTER COLUMN "discipuladorUserId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "celulaId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Rede" ALTER COLUMN "pastorUserId" DROP NOT NULL;
