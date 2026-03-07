-- AlterTable
ALTER TABLE "matrix" ADD COLUMN     "smtp_from" TEXT,
ADD COLUMN     "smtp_host" TEXT,
ADD COLUMN     "smtp_pass" TEXT,
ADD COLUMN     "smtp_port" INTEGER,
ADD COLUMN     "smtp_user" TEXT;
