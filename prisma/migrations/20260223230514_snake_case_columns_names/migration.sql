/*
  Warnings:

  - You are about to drop the column `createdAt` on the `api_key` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `api_key` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `api_key` table. All the data in the column will be lost.
  - You are about to drop the column `lastUsedAt` on the `api_key` table. All the data in the column will be lost.
  - You are about to drop the column `matrixId` on the `api_key` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `api_key` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `celula` table. All the data in the column will be lost.
  - You are about to drop the column `discipuladoId` on the `celula` table. All the data in the column will be lost.
  - You are about to drop the column `hasNextHost` on the `celula` table. All the data in the column will be lost.
  - You are about to drop the column `hostMemberId` on the `celula` table. All the data in the column will be lost.
  - You are about to drop the column `leaderMemberId` on the `celula` table. All the data in the column will be lost.
  - You are about to drop the column `matrixId` on the `celula` table. All the data in the column will be lost.
  - You are about to drop the column `multiplicationDate` on the `celula` table. All the data in the column will be lost.
  - You are about to drop the column `openingDate` on the `celula` table. All the data in the column will be lost.
  - You are about to drop the column `parallelCelulaId` on the `celula` table. All the data in the column will be lost.
  - You are about to drop the column `streetNumber` on the `celula` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `celula` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `celula` table. All the data in the column will be lost.
  - You are about to drop the column `celulaId` on the `celula_leader_in_training` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `celula_leader_in_training` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `celula_leader_in_training` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `celula_leader_in_training` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `congregacao` table. All the data in the column will be lost.
  - You are about to drop the column `isPrincipal` on the `congregacao` table. All the data in the column will be lost.
  - You are about to drop the column `kidsLeaderMemberId` on the `congregacao` table. All the data in the column will be lost.
  - You are about to drop the column `matrixId` on the `congregacao` table. All the data in the column will be lost.
  - You are about to drop the column `pastorGovernoMemberId` on the `congregacao` table. All the data in the column will be lost.
  - You are about to drop the column `streetNumber` on the `congregacao` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `congregacao` table. All the data in the column will be lost.
  - You are about to drop the column `vicePresidenteMemberId` on the `congregacao` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `congregacao` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `discipulado` table. All the data in the column will be lost.
  - You are about to drop the column `discipuladorMemberId` on the `discipulado` table. All the data in the column will be lost.
  - You are about to drop the column `matrixId` on the `discipulado` table. All the data in the column will be lost.
  - You are about to drop the column `redeId` on the `discipulado` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `discipulado` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `discipulado_disciple` table. All the data in the column will be lost.
  - You are about to drop the column `discipuladoId` on the `discipulado_disciple` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `discipulado_disciple` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `discipulado_disciple` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `matrix` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `matrix` table. All the data in the column will be lost.
  - You are about to drop the column `whatsappApiKey` on the `matrix` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `matrix_domain` table. All the data in the column will be lost.
  - You are about to drop the column `matrixId` on the `matrix_domain` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `matrix_domain` table. All the data in the column will be lost.
  - You are about to drop the column `baptismDate` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `canBeHost` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `celulaId` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `contactPrivacyLevel` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `hasDefaultPassword` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `hasLoggedIn` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `hasSystemAccess` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `inviteSent` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `isBaptized` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `isOwner` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `maritalStatus` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `ministryPositionId` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `registerDate` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `spouseId` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `streetNumber` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `winnerPathId` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `matrixId` on the `member_matrix` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `member_matrix` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `member_role` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `member_role` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `member_social_media` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `member_social_media` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `member_social_media` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ministry` table. All the data in the column will be lost.
  - You are about to drop the column `matrixId` on the `ministry` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ministry` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `password_reset_token` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `password_reset_token` table. All the data in the column will be lost.
  - You are about to drop the column `isUsed` on the `password_reset_token` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `password_reset_token` table. All the data in the column will be lost.
  - You are about to drop the column `congregacaoId` on the `rede` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `rede` table. All the data in the column will be lost.
  - You are about to drop the column `isKids` on the `rede` table. All the data in the column will be lost.
  - You are about to drop the column `matrixId` on the `rede` table. All the data in the column will be lost.
  - You are about to drop the column `pastorMemberId` on the `rede` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `rede` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `refresh_token` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `refresh_token` table. All the data in the column will be lost.
  - You are about to drop the column `isRevoked` on the `refresh_token` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `refresh_token` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `refresh_token` table. All the data in the column will be lost.
  - You are about to drop the column `celulaId` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `matrixId` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `report_attendance` table. All the data in the column will be lost.
  - You are about to drop the column `reportId` on the `report_attendance` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `matrixId` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `winner_path` table. All the data in the column will be lost.
  - You are about to drop the column `matrixId` on the `winner_path` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `winner_path` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,matrix_id]` on the table `celula` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[celula_id,member_id]` on the table `celula_leader_in_training` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,matrix_id]` on the table `congregacao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[discipulado_id,member_id]` on the table `discipulado_disciple` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spouse_id]` on the table `member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[member_id,matrix_id]` on the table `member_matrix` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[member_id,role_id]` on the table `member_role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,matrix_id]` on the table `ministry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[report_id,member_id]` on the table `report_attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,matrix_id]` on the table `role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,matrix_id]` on the table `winner_path` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_by_id` to the `api_key` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matrix_id` to the `api_key` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `api_key` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discipulado_id` to the `celula` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leader_member_id` to the `celula` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matrix_id` to the `celula` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `celula` table without a default value. This is not possible if the table is not empty.
  - Added the required column `celula_id` to the `celula_leader_in_training` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `celula_leader_in_training` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `celula_leader_in_training` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matrix_id` to the `congregacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pastor_governo_member_id` to the `congregacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `congregacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discipulador_member_id` to the `discipulado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matrix_id` to the `discipulado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rede_id` to the `discipulado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `discipulado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discipulado_id` to the `discipulado_disciple` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `discipulado_disciple` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `discipulado_disciple` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `matrix` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matrix_id` to the `matrix_domain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `matrix_domain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ministry_position_id` to the `member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matrix_id` to the `member_matrix` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `member_matrix` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `member_role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `member_role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `member_social_media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `member_social_media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matrix_id` to the `ministry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ministry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `password_reset_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `password_reset_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `congregacao_id` to the `rede` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matrix_id` to the `rede` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pastor_member_id` to the `rede` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `rede` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `refresh_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `refresh_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `refresh_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `celula_id` to the `report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matrix_id` to the `report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `report_attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_id` to the `report_attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matrix_id` to the `role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matrix_id` to the `winner_path` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `winner_path` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "api_key" DROP CONSTRAINT "api_key_createdById_fkey";

-- DropForeignKey
ALTER TABLE "api_key" DROP CONSTRAINT "api_key_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "celula" DROP CONSTRAINT "celula_discipuladoId_fkey";

-- DropForeignKey
ALTER TABLE "celula" DROP CONSTRAINT "celula_hostMemberId_fkey";

-- DropForeignKey
ALTER TABLE "celula" DROP CONSTRAINT "celula_leaderMemberId_fkey";

-- DropForeignKey
ALTER TABLE "celula" DROP CONSTRAINT "celula_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "celula" DROP CONSTRAINT "celula_parallelCelulaId_fkey";

-- DropForeignKey
ALTER TABLE "celula_leader_in_training" DROP CONSTRAINT "celula_leader_in_training_celulaId_fkey";

-- DropForeignKey
ALTER TABLE "celula_leader_in_training" DROP CONSTRAINT "celula_leader_in_training_memberId_fkey";

-- DropForeignKey
ALTER TABLE "congregacao" DROP CONSTRAINT "congregacao_kidsLeaderMemberId_fkey";

-- DropForeignKey
ALTER TABLE "congregacao" DROP CONSTRAINT "congregacao_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "congregacao" DROP CONSTRAINT "congregacao_pastorGovernoMemberId_fkey";

-- DropForeignKey
ALTER TABLE "congregacao" DROP CONSTRAINT "congregacao_vicePresidenteMemberId_fkey";

-- DropForeignKey
ALTER TABLE "discipulado" DROP CONSTRAINT "discipulado_discipuladorMemberId_fkey";

-- DropForeignKey
ALTER TABLE "discipulado" DROP CONSTRAINT "discipulado_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "discipulado" DROP CONSTRAINT "discipulado_redeId_fkey";

-- DropForeignKey
ALTER TABLE "discipulado_disciple" DROP CONSTRAINT "discipulado_disciple_discipuladoId_fkey";

-- DropForeignKey
ALTER TABLE "discipulado_disciple" DROP CONSTRAINT "discipulado_disciple_memberId_fkey";

-- DropForeignKey
ALTER TABLE "matrix_domain" DROP CONSTRAINT "matrix_domain_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "member" DROP CONSTRAINT "member_celulaId_fkey";

-- DropForeignKey
ALTER TABLE "member" DROP CONSTRAINT "member_ministryPositionId_fkey";

-- DropForeignKey
ALTER TABLE "member" DROP CONSTRAINT "member_spouseId_fkey";

-- DropForeignKey
ALTER TABLE "member" DROP CONSTRAINT "member_winnerPathId_fkey";

-- DropForeignKey
ALTER TABLE "member_matrix" DROP CONSTRAINT "member_matrix_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "member_matrix" DROP CONSTRAINT "member_matrix_memberId_fkey";

-- DropForeignKey
ALTER TABLE "member_role" DROP CONSTRAINT "member_role_memberId_fkey";

-- DropForeignKey
ALTER TABLE "member_role" DROP CONSTRAINT "member_role_roleId_fkey";

-- DropForeignKey
ALTER TABLE "member_social_media" DROP CONSTRAINT "member_social_media_memberId_fkey";

-- DropForeignKey
ALTER TABLE "ministry" DROP CONSTRAINT "ministry_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "password_reset_token" DROP CONSTRAINT "password_reset_token_memberId_fkey";

-- DropForeignKey
ALTER TABLE "rede" DROP CONSTRAINT "rede_congregacaoId_fkey";

-- DropForeignKey
ALTER TABLE "rede" DROP CONSTRAINT "rede_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "rede" DROP CONSTRAINT "rede_pastorMemberId_fkey";

-- DropForeignKey
ALTER TABLE "refresh_token" DROP CONSTRAINT "refresh_token_memberId_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_celulaId_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "report_attendance" DROP CONSTRAINT "report_attendance_memberId_fkey";

-- DropForeignKey
ALTER TABLE "report_attendance" DROP CONSTRAINT "report_attendance_reportId_fkey";

-- DropForeignKey
ALTER TABLE "role" DROP CONSTRAINT "role_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "winner_path" DROP CONSTRAINT "winner_path_matrixId_fkey";

-- DropIndex
DROP INDEX "api_key_createdById_idx";

-- DropIndex
DROP INDEX "api_key_matrixId_idx";

-- DropIndex
DROP INDEX "celula_discipuladoId_idx";

-- DropIndex
DROP INDEX "celula_hostMemberId_idx";

-- DropIndex
DROP INDEX "celula_leaderMemberId_idx";

-- DropIndex
DROP INDEX "celula_matrixId_idx";

-- DropIndex
DROP INDEX "celula_name_matrixId_key";

-- DropIndex
DROP INDEX "celula_parallelCelulaId_idx";

-- DropIndex
DROP INDEX "celula_leader_in_training_celulaId_idx";

-- DropIndex
DROP INDEX "celula_leader_in_training_celulaId_memberId_key";

-- DropIndex
DROP INDEX "celula_leader_in_training_memberId_idx";

-- DropIndex
DROP INDEX "congregacao_kidsLeaderMemberId_idx";

-- DropIndex
DROP INDEX "congregacao_matrixId_idx";

-- DropIndex
DROP INDEX "congregacao_name_matrixId_key";

-- DropIndex
DROP INDEX "congregacao_pastorGovernoMemberId_idx";

-- DropIndex
DROP INDEX "congregacao_vicePresidenteMemberId_idx";

-- DropIndex
DROP INDEX "discipulado_discipuladorMemberId_idx";

-- DropIndex
DROP INDEX "discipulado_matrixId_idx";

-- DropIndex
DROP INDEX "discipulado_redeId_idx";

-- DropIndex
DROP INDEX "discipulado_disciple_discipuladoId_idx";

-- DropIndex
DROP INDEX "discipulado_disciple_discipuladoId_memberId_key";

-- DropIndex
DROP INDEX "discipulado_disciple_memberId_idx";

-- DropIndex
DROP INDEX "matrix_domain_matrixId_idx";

-- DropIndex
DROP INDEX "member_celulaId_idx";

-- DropIndex
DROP INDEX "member_ministryPositionId_idx";

-- DropIndex
DROP INDEX "member_spouseId_idx";

-- DropIndex
DROP INDEX "member_spouseId_key";

-- DropIndex
DROP INDEX "member_winnerPathId_idx";

-- DropIndex
DROP INDEX "member_matrix_matrixId_idx";

-- DropIndex
DROP INDEX "member_matrix_memberId_idx";

-- DropIndex
DROP INDEX "member_matrix_memberId_matrixId_key";

-- DropIndex
DROP INDEX "member_role_memberId_idx";

-- DropIndex
DROP INDEX "member_role_memberId_roleId_key";

-- DropIndex
DROP INDEX "member_role_roleId_idx";

-- DropIndex
DROP INDEX "member_social_media_memberId_idx";

-- DropIndex
DROP INDEX "ministry_matrixId_idx";

-- DropIndex
DROP INDEX "ministry_name_matrixId_key";

-- DropIndex
DROP INDEX "password_reset_token_memberId_idx";

-- DropIndex
DROP INDEX "rede_congregacaoId_idx";

-- DropIndex
DROP INDEX "rede_matrixId_idx";

-- DropIndex
DROP INDEX "refresh_token_memberId_idx";

-- DropIndex
DROP INDEX "report_celulaId_idx";

-- DropIndex
DROP INDEX "report_matrixId_idx";

-- DropIndex
DROP INDEX "report_attendance_memberId_idx";

-- DropIndex
DROP INDEX "report_attendance_reportId_idx";

-- DropIndex
DROP INDEX "report_attendance_reportId_memberId_key";

-- DropIndex
DROP INDEX "role_matrixId_idx";

-- DropIndex
DROP INDEX "role_name_matrixId_key";

-- DropIndex
DROP INDEX "winner_path_matrixId_idx";

-- DropIndex
DROP INDEX "winner_path_name_matrixId_key";

-- AlterTable
ALTER TABLE "api_key" DROP COLUMN "createdAt",
DROP COLUMN "createdById",
DROP COLUMN "isActive",
DROP COLUMN "lastUsedAt",
DROP COLUMN "matrixId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by_id" INTEGER NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_used_at" TIMESTAMP(3),
ADD COLUMN     "matrix_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "celula" DROP COLUMN "createdAt",
DROP COLUMN "discipuladoId",
DROP COLUMN "hasNextHost",
DROP COLUMN "hostMemberId",
DROP COLUMN "leaderMemberId",
DROP COLUMN "matrixId",
DROP COLUMN "multiplicationDate",
DROP COLUMN "openingDate",
DROP COLUMN "parallelCelulaId",
DROP COLUMN "streetNumber",
DROP COLUMN "updatedAt",
DROP COLUMN "zipCode",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discipulado_id" INTEGER NOT NULL,
ADD COLUMN     "has_next_host" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "host_member_id" INTEGER,
ADD COLUMN     "leader_member_id" INTEGER NOT NULL,
ADD COLUMN     "matrix_id" INTEGER NOT NULL,
ADD COLUMN     "multiplication_date" TIMESTAMP(3),
ADD COLUMN     "opening_date" TIMESTAMP(3),
ADD COLUMN     "parallel_celula_id" INTEGER,
ADD COLUMN     "street_number" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "zip_code" TEXT;

-- AlterTable
ALTER TABLE "celula_leader_in_training" DROP COLUMN "celulaId",
DROP COLUMN "createdAt",
DROP COLUMN "memberId",
DROP COLUMN "updatedAt",
ADD COLUMN     "celula_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "member_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "congregacao" DROP COLUMN "createdAt",
DROP COLUMN "isPrincipal",
DROP COLUMN "kidsLeaderMemberId",
DROP COLUMN "matrixId",
DROP COLUMN "pastorGovernoMemberId",
DROP COLUMN "streetNumber",
DROP COLUMN "updatedAt",
DROP COLUMN "vicePresidenteMemberId",
DROP COLUMN "zipCode",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_principal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kids_leader_member_id" INTEGER,
ADD COLUMN     "matrix_id" INTEGER NOT NULL,
ADD COLUMN     "pastor_governo_member_id" INTEGER NOT NULL,
ADD COLUMN     "street_number" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vice_presidente_member_id" INTEGER,
ADD COLUMN     "zip_code" TEXT;

-- AlterTable
ALTER TABLE "discipulado" DROP COLUMN "createdAt",
DROP COLUMN "discipuladorMemberId",
DROP COLUMN "matrixId",
DROP COLUMN "redeId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discipulador_member_id" INTEGER NOT NULL,
ADD COLUMN     "matrix_id" INTEGER NOT NULL,
ADD COLUMN     "rede_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "discipulado_disciple" DROP COLUMN "createdAt",
DROP COLUMN "discipuladoId",
DROP COLUMN "memberId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discipulado_id" INTEGER NOT NULL,
ADD COLUMN     "member_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "matrix" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "whatsappApiKey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "whatsapp_api_key" TEXT;

-- AlterTable
ALTER TABLE "matrix_domain" DROP COLUMN "createdAt",
DROP COLUMN "matrixId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "matrix_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "member" DROP COLUMN "baptismDate",
DROP COLUMN "birthDate",
DROP COLUMN "canBeHost",
DROP COLUMN "celulaId",
DROP COLUMN "contactPrivacyLevel",
DROP COLUMN "createdAt",
DROP COLUMN "hasDefaultPassword",
DROP COLUMN "hasLoggedIn",
DROP COLUMN "hasSystemAccess",
DROP COLUMN "inviteSent",
DROP COLUMN "isActive",
DROP COLUMN "isBaptized",
DROP COLUMN "isOwner",
DROP COLUMN "maritalStatus",
DROP COLUMN "ministryPositionId",
DROP COLUMN "photoUrl",
DROP COLUMN "registerDate",
DROP COLUMN "spouseId",
DROP COLUMN "streetNumber",
DROP COLUMN "updatedAt",
DROP COLUMN "winnerPathId",
DROP COLUMN "zipCode",
ADD COLUMN     "baptism_date" TIMESTAMP(3),
ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "can_be_host" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "celula_id" INTEGER,
ADD COLUMN     "contact_privacy_level" "ContactPrivacyLevel" NOT NULL DEFAULT 'MY_LEADERSHIP_AND_DISCIPLES',
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "has_default_password" BOOLEAN,
ADD COLUMN     "has_logged_in" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_system_access" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invite_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_baptized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_owner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marital_status" "MaritalStatus" NOT NULL DEFAULT 'SINGLE',
ADD COLUMN     "ministry_position_id" INTEGER NOT NULL,
ADD COLUMN     "photo_url" TEXT,
ADD COLUMN     "register_date" TIMESTAMP(3),
ADD COLUMN     "spouse_id" INTEGER,
ADD COLUMN     "street_number" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "winner_path_id" INTEGER,
ADD COLUMN     "zip_code" TEXT;

-- AlterTable
ALTER TABLE "member_matrix" DROP COLUMN "matrixId",
DROP COLUMN "memberId",
ADD COLUMN     "matrix_id" INTEGER NOT NULL,
ADD COLUMN     "member_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "member_role" DROP COLUMN "memberId",
DROP COLUMN "roleId",
ADD COLUMN     "member_id" INTEGER NOT NULL,
ADD COLUMN     "role_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "member_social_media" DROP COLUMN "createdAt",
DROP COLUMN "memberId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "member_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ministry" DROP COLUMN "createdAt",
DROP COLUMN "matrixId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "matrix_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "password_reset_token" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "isUsed",
DROP COLUMN "memberId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_used" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "member_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "rede" DROP COLUMN "congregacaoId",
DROP COLUMN "createdAt",
DROP COLUMN "isKids",
DROP COLUMN "matrixId",
DROP COLUMN "pastorMemberId",
DROP COLUMN "updatedAt",
ADD COLUMN     "congregacao_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_kids" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matrix_id" INTEGER NOT NULL,
ADD COLUMN     "pastor_member_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "refresh_token" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "isRevoked",
DROP COLUMN "memberId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_revoked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "member_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "report" DROP COLUMN "celulaId",
DROP COLUMN "createdAt",
DROP COLUMN "matrixId",
ADD COLUMN     "celula_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "matrix_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "report_attendance" DROP COLUMN "memberId",
DROP COLUMN "reportId",
ADD COLUMN     "member_id" INTEGER NOT NULL,
ADD COLUMN     "report_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "role" DROP COLUMN "createdAt",
DROP COLUMN "isAdmin",
DROP COLUMN "matrixId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matrix_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "winner_path" DROP COLUMN "createdAt",
DROP COLUMN "matrixId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "matrix_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "api_key_matrix_id_idx" ON "api_key"("matrix_id");

-- CreateIndex
CREATE INDEX "api_key_created_by_id_idx" ON "api_key"("created_by_id");

-- CreateIndex
CREATE INDEX "celula_matrix_id_idx" ON "celula"("matrix_id");

-- CreateIndex
CREATE INDEX "celula_discipulado_id_idx" ON "celula"("discipulado_id");

-- CreateIndex
CREATE INDEX "celula_leader_member_id_idx" ON "celula"("leader_member_id");

-- CreateIndex
CREATE INDEX "celula_host_member_id_idx" ON "celula"("host_member_id");

-- CreateIndex
CREATE INDEX "celula_parallel_celula_id_idx" ON "celula"("parallel_celula_id");

-- CreateIndex
CREATE UNIQUE INDEX "celula_name_matrix_id_key" ON "celula"("name", "matrix_id");

-- CreateIndex
CREATE INDEX "celula_leader_in_training_celula_id_idx" ON "celula_leader_in_training"("celula_id");

-- CreateIndex
CREATE INDEX "celula_leader_in_training_member_id_idx" ON "celula_leader_in_training"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "celula_leader_in_training_celula_id_member_id_key" ON "celula_leader_in_training"("celula_id", "member_id");

-- CreateIndex
CREATE INDEX "congregacao_matrix_id_idx" ON "congregacao"("matrix_id");

-- CreateIndex
CREATE INDEX "congregacao_pastor_governo_member_id_idx" ON "congregacao"("pastor_governo_member_id");

-- CreateIndex
CREATE INDEX "congregacao_vice_presidente_member_id_idx" ON "congregacao"("vice_presidente_member_id");

-- CreateIndex
CREATE INDEX "congregacao_kids_leader_member_id_idx" ON "congregacao"("kids_leader_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "congregacao_name_matrix_id_key" ON "congregacao"("name", "matrix_id");

-- CreateIndex
CREATE INDEX "discipulado_matrix_id_idx" ON "discipulado"("matrix_id");

-- CreateIndex
CREATE INDEX "discipulado_rede_id_idx" ON "discipulado"("rede_id");

-- CreateIndex
CREATE INDEX "discipulado_discipulador_member_id_idx" ON "discipulado"("discipulador_member_id");

-- CreateIndex
CREATE INDEX "discipulado_disciple_discipulado_id_idx" ON "discipulado_disciple"("discipulado_id");

-- CreateIndex
CREATE INDEX "discipulado_disciple_member_id_idx" ON "discipulado_disciple"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "discipulado_disciple_discipulado_id_member_id_key" ON "discipulado_disciple"("discipulado_id", "member_id");

-- CreateIndex
CREATE INDEX "matrix_domain_matrix_id_idx" ON "matrix_domain"("matrix_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_spouse_id_key" ON "member"("spouse_id");

-- CreateIndex
CREATE INDEX "member_celula_id_idx" ON "member"("celula_id");

-- CreateIndex
CREATE INDEX "member_ministry_position_id_idx" ON "member"("ministry_position_id");

-- CreateIndex
CREATE INDEX "member_winner_path_id_idx" ON "member"("winner_path_id");

-- CreateIndex
CREATE INDEX "member_spouse_id_idx" ON "member"("spouse_id");

-- CreateIndex
CREATE INDEX "member_matrix_member_id_idx" ON "member_matrix"("member_id");

-- CreateIndex
CREATE INDEX "member_matrix_matrix_id_idx" ON "member_matrix"("matrix_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_matrix_member_id_matrix_id_key" ON "member_matrix"("member_id", "matrix_id");

-- CreateIndex
CREATE INDEX "member_role_member_id_idx" ON "member_role"("member_id");

-- CreateIndex
CREATE INDEX "member_role_role_id_idx" ON "member_role"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_role_member_id_role_id_key" ON "member_role"("member_id", "role_id");

-- CreateIndex
CREATE INDEX "member_social_media_member_id_idx" ON "member_social_media"("member_id");

-- CreateIndex
CREATE INDEX "ministry_matrix_id_idx" ON "ministry"("matrix_id");

-- CreateIndex
CREATE UNIQUE INDEX "ministry_name_matrix_id_key" ON "ministry"("name", "matrix_id");

-- CreateIndex
CREATE INDEX "password_reset_token_member_id_idx" ON "password_reset_token"("member_id");

-- CreateIndex
CREATE INDEX "rede_matrix_id_idx" ON "rede"("matrix_id");

-- CreateIndex
CREATE INDEX "rede_congregacao_id_idx" ON "rede"("congregacao_id");

-- CreateIndex
CREATE INDEX "refresh_token_member_id_idx" ON "refresh_token"("member_id");

-- CreateIndex
CREATE INDEX "report_matrix_id_idx" ON "report"("matrix_id");

-- CreateIndex
CREATE INDEX "report_celula_id_idx" ON "report"("celula_id");

-- CreateIndex
CREATE INDEX "report_attendance_report_id_idx" ON "report_attendance"("report_id");

-- CreateIndex
CREATE INDEX "report_attendance_member_id_idx" ON "report_attendance"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_attendance_report_id_member_id_key" ON "report_attendance"("report_id", "member_id");

-- CreateIndex
CREATE INDEX "role_matrix_id_idx" ON "role"("matrix_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_matrix_id_key" ON "role"("name", "matrix_id");

-- CreateIndex
CREATE INDEX "winner_path_matrix_id_idx" ON "winner_path"("matrix_id");

-- CreateIndex
CREATE UNIQUE INDEX "winner_path_name_matrix_id_key" ON "winner_path"("name", "matrix_id");

-- AddForeignKey
ALTER TABLE "matrix_domain" ADD CONSTRAINT "matrix_domain_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_matrix" ADD CONSTRAINT "member_matrix_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_matrix" ADD CONSTRAINT "member_matrix_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula" ADD CONSTRAINT "celula_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula" ADD CONSTRAINT "celula_discipulado_id_fkey" FOREIGN KEY ("discipulado_id") REFERENCES "discipulado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula" ADD CONSTRAINT "celula_leader_member_id_fkey" FOREIGN KEY ("leader_member_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula" ADD CONSTRAINT "celula_host_member_id_fkey" FOREIGN KEY ("host_member_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula" ADD CONSTRAINT "celula_parallel_celula_id_fkey" FOREIGN KEY ("parallel_celula_id") REFERENCES "celula"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry" ADD CONSTRAINT "ministry_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winner_path" ADD CONSTRAINT "winner_path_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_celula_id_fkey" FOREIGN KEY ("celula_id") REFERENCES "celula"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_ministry_position_id_fkey" FOREIGN KEY ("ministry_position_id") REFERENCES "ministry"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_winner_path_id_fkey" FOREIGN KEY ("winner_path_id") REFERENCES "winner_path"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_spouse_id_fkey" FOREIGN KEY ("spouse_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula_leader_in_training" ADD CONSTRAINT "celula_leader_in_training_celula_id_fkey" FOREIGN KEY ("celula_id") REFERENCES "celula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula_leader_in_training" ADD CONSTRAINT "celula_leader_in_training_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregacao" ADD CONSTRAINT "congregacao_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregacao" ADD CONSTRAINT "congregacao_pastor_governo_member_id_fkey" FOREIGN KEY ("pastor_governo_member_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregacao" ADD CONSTRAINT "congregacao_vice_presidente_member_id_fkey" FOREIGN KEY ("vice_presidente_member_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregacao" ADD CONSTRAINT "congregacao_kids_leader_member_id_fkey" FOREIGN KEY ("kids_leader_member_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rede" ADD CONSTRAINT "rede_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rede" ADD CONSTRAINT "rede_congregacao_id_fkey" FOREIGN KEY ("congregacao_id") REFERENCES "congregacao"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rede" ADD CONSTRAINT "rede_pastor_member_id_fkey" FOREIGN KEY ("pastor_member_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipulado" ADD CONSTRAINT "discipulado_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipulado" ADD CONSTRAINT "discipulado_rede_id_fkey" FOREIGN KEY ("rede_id") REFERENCES "rede"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipulado" ADD CONSTRAINT "discipulado_discipulador_member_id_fkey" FOREIGN KEY ("discipulador_member_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipulado_disciple" ADD CONSTRAINT "discipulado_disciple_discipulado_id_fkey" FOREIGN KEY ("discipulado_id") REFERENCES "discipulado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipulado_disciple" ADD CONSTRAINT "discipulado_disciple_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_celula_id_fkey" FOREIGN KEY ("celula_id") REFERENCES "celula"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_attendance" ADD CONSTRAINT "report_attendance_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_attendance" ADD CONSTRAINT "report_attendance_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_role" ADD CONSTRAINT "member_role_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_role" ADD CONSTRAINT "member_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_social_media" ADD CONSTRAINT "member_social_media_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
