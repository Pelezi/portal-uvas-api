/*
  Warnings:

  - The values [INACTIVE] on the enum `MemberStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "MemberStatus_new" AS ENUM ('VISITOR', 'MEMBER', 'FA');
ALTER TABLE "public"."Member" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Member" ALTER COLUMN "status" TYPE "MemberStatus_new" USING ("status"::text::"MemberStatus_new");
ALTER TYPE "MemberStatus" RENAME TO "MemberStatus_old";
ALTER TYPE "MemberStatus_new" RENAME TO "MemberStatus";
DROP TYPE "public"."MemberStatus_old";
ALTER TABLE "Member" ALTER COLUMN "status" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "ageRange" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "canBeHost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'Brasil',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "hasSystemAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isBaptized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joinDate" TIMESTAMP(3),
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "streetNumber" TEXT,
ADD COLUMN     "supportFunctions" TEXT,
ADD COLUMN     "winnerTrack" TEXT,
ADD COLUMN     "zipCode" TEXT;
