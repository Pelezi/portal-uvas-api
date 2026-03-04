-- AlterTable
ALTER TABLE "role" ADD COLUMN     "can_manage_donation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "can_manage_magazines" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "can_manage_social_media" BOOLEAN NOT NULL DEFAULT false;
