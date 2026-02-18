/*
  Warnings:

  - You are about to drop the column `socialFacebook` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `socialInstagram` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinkedin` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `socialOthers` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `socialTiktok` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `socialTwitter` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `socialWhatsapp` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "socialFacebook",
DROP COLUMN "socialInstagram",
DROP COLUMN "socialLinkedin",
DROP COLUMN "socialOthers",
DROP COLUMN "socialTiktok",
DROP COLUMN "socialTwitter",
DROP COLUMN "socialWhatsapp";
