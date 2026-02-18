-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "socialFacebook" TEXT,
ADD COLUMN     "socialInstagram" TEXT,
ADD COLUMN     "socialLinkedin" TEXT,
ADD COLUMN     "socialOthers" JSONB DEFAULT '[]',
ADD COLUMN     "socialTiktok" TEXT,
ADD COLUMN     "socialTwitter" TEXT,
ADD COLUMN     "socialWhatsapp" TEXT;
