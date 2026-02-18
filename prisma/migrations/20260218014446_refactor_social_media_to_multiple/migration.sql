/*
  Warnings:

  - You are about to drop the column `facebook` on the `MemberSocialMedia` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `MemberSocialMedia` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `MemberSocialMedia` table. All the data in the column will be lost.
  - You are about to drop the column `tiktok` on the `MemberSocialMedia` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `MemberSocialMedia` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `MemberSocialMedia` table. All the data in the column will be lost.
  - You are about to drop the column `youtube` on the `MemberSocialMedia` table. All the data in the column will be lost.
  - You are about to drop the `SocialMediaOther` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `MemberSocialMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `MemberSocialMedia` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SocialMediaOther" DROP CONSTRAINT "SocialMediaOther_memberSocialMediaId_fkey";

-- DropIndex
DROP INDEX "MemberSocialMedia_memberId_key";

-- AlterTable
ALTER TABLE "MemberSocialMedia" DROP COLUMN "facebook",
DROP COLUMN "instagram",
DROP COLUMN "linkedin",
DROP COLUMN "tiktok",
DROP COLUMN "twitter",
DROP COLUMN "whatsapp",
DROP COLUMN "youtube",
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- DropTable
DROP TABLE "SocialMediaOther";

-- CreateIndex
CREATE INDEX "MemberSocialMedia_type_idx" ON "MemberSocialMedia"("type");
