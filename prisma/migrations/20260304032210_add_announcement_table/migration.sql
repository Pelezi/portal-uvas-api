-- CreateTable
CREATE TABLE "announcement" (
    "id" SERIAL NOT NULL,
    "matrix_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "desktop_image_url" TEXT,
    "mobile_image_url" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announcement_matrix_id_idx" ON "announcement"("matrix_id");

-- CreateIndex
CREATE INDEX "announcement_start_date_idx" ON "announcement"("start_date");

-- CreateIndex
CREATE INDEX "announcement_end_date_idx" ON "announcement"("end_date");

-- CreateIndex
CREATE INDEX "announcement_created_by_id_idx" ON "announcement"("created_by_id");

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
