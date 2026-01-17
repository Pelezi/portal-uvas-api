-- AlterTable
ALTER TABLE "Ministry" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WinnerPath" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;
