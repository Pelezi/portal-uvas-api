/*
  Warnings:

  - You are about to drop the `ApiKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Celula` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CelulaLeaderInTraining` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Congregacao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Discipulado` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscipuladoDisciple` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Matrix` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatrixDomain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemberMatrix` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemberRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemberSocialMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ministry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordResetToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rede` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReportAttendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WinnerPath` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "Celula" DROP CONSTRAINT "Celula_discipuladoId_fkey";

-- DropForeignKey
ALTER TABLE "Celula" DROP CONSTRAINT "Celula_hostMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Celula" DROP CONSTRAINT "Celula_leaderMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Celula" DROP CONSTRAINT "Celula_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "Celula" DROP CONSTRAINT "Celula_parallelCelulaId_fkey";

-- DropForeignKey
ALTER TABLE "CelulaLeaderInTraining" DROP CONSTRAINT "CelulaLeaderInTraining_celulaId_fkey";

-- DropForeignKey
ALTER TABLE "CelulaLeaderInTraining" DROP CONSTRAINT "CelulaLeaderInTraining_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Congregacao" DROP CONSTRAINT "Congregacao_kidsLeaderMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Congregacao" DROP CONSTRAINT "Congregacao_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "Congregacao" DROP CONSTRAINT "Congregacao_pastorGovernoMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Congregacao" DROP CONSTRAINT "Congregacao_vicePresidenteMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Discipulado" DROP CONSTRAINT "Discipulado_discipuladorMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Discipulado" DROP CONSTRAINT "Discipulado_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "Discipulado" DROP CONSTRAINT "Discipulado_redeId_fkey";

-- DropForeignKey
ALTER TABLE "DiscipuladoDisciple" DROP CONSTRAINT "DiscipuladoDisciple_discipuladoId_fkey";

-- DropForeignKey
ALTER TABLE "DiscipuladoDisciple" DROP CONSTRAINT "DiscipuladoDisciple_memberId_fkey";

-- DropForeignKey
ALTER TABLE "MatrixDomain" DROP CONSTRAINT "MatrixDomain_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_celulaId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_ministryPositionId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_spouseId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_winnerPathId_fkey";

-- DropForeignKey
ALTER TABLE "MemberMatrix" DROP CONSTRAINT "MemberMatrix_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "MemberMatrix" DROP CONSTRAINT "MemberMatrix_memberId_fkey";

-- DropForeignKey
ALTER TABLE "MemberRole" DROP CONSTRAINT "MemberRole_memberId_fkey";

-- DropForeignKey
ALTER TABLE "MemberRole" DROP CONSTRAINT "MemberRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "MemberSocialMedia" DROP CONSTRAINT "MemberSocialMedia_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Ministry" DROP CONSTRAINT "Ministry_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Rede" DROP CONSTRAINT "Rede_congregacaoId_fkey";

-- DropForeignKey
ALTER TABLE "Rede" DROP CONSTRAINT "Rede_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "Rede" DROP CONSTRAINT "Rede_pastorMemberId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_celulaId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "ReportAttendance" DROP CONSTRAINT "ReportAttendance_memberId_fkey";

-- DropForeignKey
ALTER TABLE "ReportAttendance" DROP CONSTRAINT "ReportAttendance_reportId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_matrixId_fkey";

-- DropForeignKey
ALTER TABLE "WinnerPath" DROP CONSTRAINT "WinnerPath_matrixId_fkey";

-- DropTable
DROP TABLE "ApiKey";

-- DropTable
DROP TABLE "Celula";

-- DropTable
DROP TABLE "CelulaLeaderInTraining";

-- DropTable
DROP TABLE "Congregacao";

-- DropTable
DROP TABLE "Discipulado";

-- DropTable
DROP TABLE "DiscipuladoDisciple";

-- DropTable
DROP TABLE "Matrix";

-- DropTable
DROP TABLE "MatrixDomain";

-- DropTable
DROP TABLE "Member";

-- DropTable
DROP TABLE "MemberMatrix";

-- DropTable
DROP TABLE "MemberRole";

-- DropTable
DROP TABLE "MemberSocialMedia";

-- DropTable
DROP TABLE "Ministry";

-- DropTable
DROP TABLE "PasswordResetToken";

-- DropTable
DROP TABLE "Rede";

-- DropTable
DROP TABLE "RefreshToken";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "ReportAttendance";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "WinnerPath";

-- CreateTable
CREATE TABLE "matrix" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "whatsappApiKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matrix_domain" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL,
    "matrixId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matrix_domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_matrix" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "matrixId" INTEGER NOT NULL,

    CONSTRAINT "member_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "celula" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "matrixId" INTEGER NOT NULL,
    "leaderMemberId" INTEGER NOT NULL,
    "hostMemberId" INTEGER,
    "discipuladoId" INTEGER NOT NULL,
    "weekday" INTEGER,
    "time" TEXT,
    "country" TEXT DEFAULT 'Brasil',
    "zipCode" TEXT,
    "street" TEXT,
    "streetNumber" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "complement" TEXT,
    "state" TEXT,
    "openingDate" TIMESTAMP(3),
    "multiplicationDate" TIMESTAMP(3),
    "hasNextHost" BOOLEAN NOT NULL DEFAULT false,
    "type" "CelulaType",
    "level" "CelulaLevel",
    "parallelCelulaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "celula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "matrixId" INTEGER NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ministry" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "matrixId" INTEGER NOT NULL,
    "type" "MinistryType" NOT NULL DEFAULT 'MEMBER',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ministry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winner_path" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "matrixId" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "winner_path_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "hasDefaultPassword" BOOLEAN,
    "inviteSent" BOOLEAN NOT NULL DEFAULT false,
    "hasLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "celulaId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'SINGLE',
    "photoUrl" TEXT,
    "gender" "Gender",
    "isBaptized" BOOLEAN NOT NULL DEFAULT false,
    "baptismDate" TIMESTAMP(3),
    "birthDate" TIMESTAMP(3),
    "registerDate" TIMESTAMP(3),
    "spouseId" INTEGER,
    "ministryPositionId" INTEGER NOT NULL,
    "winnerPathId" INTEGER,
    "canBeHost" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT DEFAULT 'Brasil',
    "zipCode" TEXT,
    "street" TEXT,
    "streetNumber" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "complement" TEXT,
    "state" TEXT,
    "hasSystemAccess" BOOLEAN NOT NULL DEFAULT false,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "contactPrivacyLevel" "ContactPrivacyLevel" NOT NULL DEFAULT 'MY_LEADERSHIP_AND_DISCIPLES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "celula_leader_in_training" (
    "id" SERIAL NOT NULL,
    "celulaId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "celula_leader_in_training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "congregacao" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "matrixId" INTEGER NOT NULL,
    "pastorGovernoMemberId" INTEGER NOT NULL,
    "vicePresidenteMemberId" INTEGER,
    "kidsLeaderMemberId" INTEGER,
    "isPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT DEFAULT 'Brasil',
    "zipCode" TEXT,
    "street" TEXT,
    "streetNumber" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "complement" TEXT,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "congregacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rede" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "matrixId" INTEGER NOT NULL,
    "congregacaoId" INTEGER NOT NULL,
    "pastorMemberId" INTEGER NOT NULL,
    "isKids" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rede_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discipulado" (
    "id" SERIAL NOT NULL,
    "matrixId" INTEGER NOT NULL,
    "redeId" INTEGER NOT NULL,
    "discipuladorMemberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discipulado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discipulado_disciple" (
    "id" SERIAL NOT NULL,
    "discipuladoId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discipulado_disciple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" SERIAL NOT NULL,
    "matrixId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "celulaId" INTEGER NOT NULL,
    "type" "ReportType" NOT NULL DEFAULT 'CELULA',

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_attendance" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,

    CONSTRAINT "report_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_role" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "member_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "memberId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "matrixId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "api_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "memberId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_social_media" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_social_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "matrix_domain_domain_key" ON "matrix_domain"("domain");

-- CreateIndex
CREATE INDEX "matrix_domain_matrixId_idx" ON "matrix_domain"("matrixId");

-- CreateIndex
CREATE INDEX "member_matrix_memberId_idx" ON "member_matrix"("memberId");

-- CreateIndex
CREATE INDEX "member_matrix_matrixId_idx" ON "member_matrix"("matrixId");

-- CreateIndex
CREATE UNIQUE INDEX "member_matrix_memberId_matrixId_key" ON "member_matrix"("memberId", "matrixId");

-- CreateIndex
CREATE INDEX "celula_matrixId_idx" ON "celula"("matrixId");

-- CreateIndex
CREATE INDEX "celula_discipuladoId_idx" ON "celula"("discipuladoId");

-- CreateIndex
CREATE INDEX "celula_leaderMemberId_idx" ON "celula"("leaderMemberId");

-- CreateIndex
CREATE INDEX "celula_hostMemberId_idx" ON "celula"("hostMemberId");

-- CreateIndex
CREATE INDEX "celula_parallelCelulaId_idx" ON "celula"("parallelCelulaId");

-- CreateIndex
CREATE UNIQUE INDEX "celula_name_matrixId_key" ON "celula"("name", "matrixId");

-- CreateIndex
CREATE INDEX "role_matrixId_idx" ON "role"("matrixId");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_matrixId_key" ON "role"("name", "matrixId");

-- CreateIndex
CREATE INDEX "ministry_matrixId_idx" ON "ministry"("matrixId");

-- CreateIndex
CREATE UNIQUE INDEX "ministry_name_matrixId_key" ON "ministry"("name", "matrixId");

-- CreateIndex
CREATE INDEX "winner_path_matrixId_idx" ON "winner_path"("matrixId");

-- CreateIndex
CREATE UNIQUE INDEX "winner_path_name_matrixId_key" ON "winner_path"("name", "matrixId");

-- CreateIndex
CREATE UNIQUE INDEX "member_email_key" ON "member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "member_spouseId_key" ON "member"("spouseId");

-- CreateIndex
CREATE INDEX "member_celulaId_idx" ON "member"("celulaId");

-- CreateIndex
CREATE INDEX "member_ministryPositionId_idx" ON "member"("ministryPositionId");

-- CreateIndex
CREATE INDEX "member_winnerPathId_idx" ON "member"("winnerPathId");

-- CreateIndex
CREATE INDEX "member_spouseId_idx" ON "member"("spouseId");

-- CreateIndex
CREATE INDEX "celula_leader_in_training_celulaId_idx" ON "celula_leader_in_training"("celulaId");

-- CreateIndex
CREATE INDEX "celula_leader_in_training_memberId_idx" ON "celula_leader_in_training"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "celula_leader_in_training_celulaId_memberId_key" ON "celula_leader_in_training"("celulaId", "memberId");

-- CreateIndex
CREATE INDEX "congregacao_matrixId_idx" ON "congregacao"("matrixId");

-- CreateIndex
CREATE INDEX "congregacao_pastorGovernoMemberId_idx" ON "congregacao"("pastorGovernoMemberId");

-- CreateIndex
CREATE INDEX "congregacao_vicePresidenteMemberId_idx" ON "congregacao"("vicePresidenteMemberId");

-- CreateIndex
CREATE INDEX "congregacao_kidsLeaderMemberId_idx" ON "congregacao"("kidsLeaderMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "congregacao_name_matrixId_key" ON "congregacao"("name", "matrixId");

-- CreateIndex
CREATE INDEX "rede_matrixId_idx" ON "rede"("matrixId");

-- CreateIndex
CREATE INDEX "rede_congregacaoId_idx" ON "rede"("congregacaoId");

-- CreateIndex
CREATE INDEX "discipulado_matrixId_idx" ON "discipulado"("matrixId");

-- CreateIndex
CREATE INDEX "discipulado_redeId_idx" ON "discipulado"("redeId");

-- CreateIndex
CREATE INDEX "discipulado_discipuladorMemberId_idx" ON "discipulado"("discipuladorMemberId");

-- CreateIndex
CREATE INDEX "discipulado_disciple_discipuladoId_idx" ON "discipulado_disciple"("discipuladoId");

-- CreateIndex
CREATE INDEX "discipulado_disciple_memberId_idx" ON "discipulado_disciple"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "discipulado_disciple_discipuladoId_memberId_key" ON "discipulado_disciple"("discipuladoId", "memberId");

-- CreateIndex
CREATE INDEX "report_matrixId_idx" ON "report"("matrixId");

-- CreateIndex
CREATE INDEX "report_celulaId_idx" ON "report"("celulaId");

-- CreateIndex
CREATE INDEX "report_attendance_reportId_idx" ON "report_attendance"("reportId");

-- CreateIndex
CREATE INDEX "report_attendance_memberId_idx" ON "report_attendance"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "report_attendance_reportId_memberId_key" ON "report_attendance"("reportId", "memberId");

-- CreateIndex
CREATE INDEX "member_role_memberId_idx" ON "member_role"("memberId");

-- CreateIndex
CREATE INDEX "member_role_roleId_idx" ON "member_role"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "member_role_memberId_roleId_key" ON "member_role"("memberId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_key" ON "refresh_token"("token");

-- CreateIndex
CREATE INDEX "refresh_token_memberId_idx" ON "refresh_token"("memberId");

-- CreateIndex
CREATE INDEX "refresh_token_token_idx" ON "refresh_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_key_key" ON "api_key"("key");

-- CreateIndex
CREATE INDEX "api_key_matrixId_idx" ON "api_key"("matrixId");

-- CreateIndex
CREATE INDEX "api_key_key_idx" ON "api_key"("key");

-- CreateIndex
CREATE INDEX "api_key_createdById_idx" ON "api_key"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_token_key" ON "password_reset_token"("token");

-- CreateIndex
CREATE INDEX "password_reset_token_memberId_idx" ON "password_reset_token"("memberId");

-- CreateIndex
CREATE INDEX "password_reset_token_token_idx" ON "password_reset_token"("token");

-- CreateIndex
CREATE INDEX "member_social_media_memberId_idx" ON "member_social_media"("memberId");

-- CreateIndex
CREATE INDEX "member_social_media_type_idx" ON "member_social_media"("type");

-- AddForeignKey
ALTER TABLE "matrix_domain" ADD CONSTRAINT "matrix_domain_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "matrix"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_matrix" ADD CONSTRAINT "member_matrix_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_matrix" ADD CONSTRAINT "member_matrix_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "matrix"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula" ADD CONSTRAINT "celula_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula" ADD CONSTRAINT "celula_discipuladoId_fkey" FOREIGN KEY ("discipuladoId") REFERENCES "discipulado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula" ADD CONSTRAINT "celula_leaderMemberId_fkey" FOREIGN KEY ("leaderMemberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula" ADD CONSTRAINT "celula_hostMemberId_fkey" FOREIGN KEY ("hostMemberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula" ADD CONSTRAINT "celula_parallelCelulaId_fkey" FOREIGN KEY ("parallelCelulaId") REFERENCES "celula"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry" ADD CONSTRAINT "ministry_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winner_path" ADD CONSTRAINT "winner_path_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_celulaId_fkey" FOREIGN KEY ("celulaId") REFERENCES "celula"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_ministryPositionId_fkey" FOREIGN KEY ("ministryPositionId") REFERENCES "ministry"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_winnerPathId_fkey" FOREIGN KEY ("winnerPathId") REFERENCES "winner_path"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_spouseId_fkey" FOREIGN KEY ("spouseId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula_leader_in_training" ADD CONSTRAINT "celula_leader_in_training_celulaId_fkey" FOREIGN KEY ("celulaId") REFERENCES "celula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "celula_leader_in_training" ADD CONSTRAINT "celula_leader_in_training_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregacao" ADD CONSTRAINT "congregacao_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregacao" ADD CONSTRAINT "congregacao_pastorGovernoMemberId_fkey" FOREIGN KEY ("pastorGovernoMemberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregacao" ADD CONSTRAINT "congregacao_vicePresidenteMemberId_fkey" FOREIGN KEY ("vicePresidenteMemberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregacao" ADD CONSTRAINT "congregacao_kidsLeaderMemberId_fkey" FOREIGN KEY ("kidsLeaderMemberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rede" ADD CONSTRAINT "rede_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rede" ADD CONSTRAINT "rede_congregacaoId_fkey" FOREIGN KEY ("congregacaoId") REFERENCES "congregacao"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rede" ADD CONSTRAINT "rede_pastorMemberId_fkey" FOREIGN KEY ("pastorMemberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipulado" ADD CONSTRAINT "discipulado_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipulado" ADD CONSTRAINT "discipulado_redeId_fkey" FOREIGN KEY ("redeId") REFERENCES "rede"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipulado" ADD CONSTRAINT "discipulado_discipuladorMemberId_fkey" FOREIGN KEY ("discipuladorMemberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipulado_disciple" ADD CONSTRAINT "discipulado_disciple_discipuladoId_fkey" FOREIGN KEY ("discipuladoId") REFERENCES "discipulado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipulado_disciple" ADD CONSTRAINT "discipulado_disciple_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_celulaId_fkey" FOREIGN KEY ("celulaId") REFERENCES "celula"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_attendance" ADD CONSTRAINT "report_attendance_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_attendance" ADD CONSTRAINT "report_attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_role" ADD CONSTRAINT "member_role_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_role" ADD CONSTRAINT "member_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "matrix"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_social_media" ADD CONSTRAINT "member_social_media_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
