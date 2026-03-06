-- CreateTable
CREATE TABLE "member_ministry" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "ministry_id" INTEGER NOT NULL,
    "matrix_id" INTEGER NOT NULL,

    CONSTRAINT "member_ministry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on member_ministry
CREATE INDEX "member_ministry_member_id_idx" ON "member_ministry"("member_id");
CREATE INDEX "member_ministry_ministry_id_idx" ON "member_ministry"("ministry_id");
CREATE INDEX "member_ministry_matrix_id_idx" ON "member_ministry"("matrix_id");
CREATE UNIQUE INDEX "member_ministry_member_id_matrix_id_key" ON "member_ministry"("member_id", "matrix_id");

-- AddForeignKey
ALTER TABLE "member_ministry" ADD CONSTRAINT "member_ministry_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "member_ministry" ADD CONSTRAINT "member_ministry_ministry_id_fkey" FOREIGN KEY ("ministry_id") REFERENCES "ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data: For each member with a ministry_position_id, create a record in member_ministry
-- We need to get the matrixId from the ministry table since it's required
INSERT INTO "member_ministry" ("member_id", "ministry_id", "matrix_id")
SELECT 
    m.id as member_id,
    m.ministry_position_id as ministry_id,
    ministry.matrix_id as matrix_id
FROM "member" m
INNER JOIN "ministry" ON ministry.id = m.ministry_position_id
WHERE m.ministry_position_id IS NOT NULL;

-- DropForeignKey
ALTER TABLE "member" DROP CONSTRAINT "member_ministry_position_id_fkey";

-- DropIndex
DROP INDEX "member_ministry_position_id_idx";

-- AlterTable - Remove the ministry_position_id column
ALTER TABLE "member" DROP COLUMN "ministry_position_id";
