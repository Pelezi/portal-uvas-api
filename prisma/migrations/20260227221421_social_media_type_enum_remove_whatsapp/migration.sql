/*
  Warnings:

  - Changed the type of `type` on the `member_social_media` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SocialMediaType" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'TWITTER', 'X', 'LINKEDIN', 'TIKTOK', 'YOUTUBE', 'TELEGRAM', 'DISCORD', 'THREADS', 'SNAPCHAT', 'PINTEREST', 'TWITCH', 'OUTRO');

-- AlterTable
ALTER TABLE "member_social_media" DROP COLUMN "type",
ADD COLUMN     "type" "SocialMediaType" NOT NULL;

-- CreateIndex
CREATE INDEX "member_social_media_type_idx" ON "member_social_media"("type");
